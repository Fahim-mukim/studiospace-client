import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { test } from "node:test";
import { MongoClient } from "mongodb";
import { toNextJsHandler } from "better-auth/next-js";
import { getCookieCache } from "better-auth/cookies";
import { createAuth } from "../src/lib/auth.js";

const testURI = process.env.MONGODB_TEST_URI;
const testDatabaseName = process.env.MONGODB_TEST_DB_NAME;
const missingTestConfiguration = [
  !testURI && "MONGODB_TEST_URI",
  !testDatabaseName && "MONGODB_TEST_DB_NAME",
].filter(Boolean);

function setCookieHeaders(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const value = headers.get("set-cookie");
  return value ? value.split(/,(?=\s*[^;,]+=)/) : [];
}

function cookiePair(setCookieHeader) {
  const pair = setCookieHeader.split(";", 1)[0];
  const separator = pair.indexOf("=");
  return [pair.slice(0, separator), pair.slice(separator + 1)];
}

function applySetCookies(cookieJar, headers) {
  for (const header of headers) {
    const [name, value] = cookiePair(header);
    if (/(?:^|;)\s*max-age=0(?:;|$)/i.test(header)) {
      cookieJar.delete(name);
    } else {
      cookieJar.set(name, value);
    }
  }
}

function sessionCookieNames(headers) {
  return headers
    .map((header) => cookiePair(header)[0])
    .filter((name) => /(?:^|[.-])session_(?:token|data)(?:\.|$)/.test(name));
}

function cacheCookieValue(cookieJar) {
  const entries = [...cookieJar.entries()].filter(([name]) =>
    name.includes(".session_data"),
  );
  assert.ok(entries.length > 0, "Login must set the session_data cookie.");

  const baseName = entries[0][0].replace(/\.\d+$/, "");
  const rootValue = cookieJar.get(baseName);
  if (rootValue) return rootValue;

  return entries
    .filter(([name]) => name.startsWith(`${baseName}.`))
    .sort(
      (left, right) =>
        Number(left[0].split(".").at(-1)) -
        Number(right[0].split(".").at(-1)),
    )
    .map(([, value]) => value)
    .join("");
}

async function send(handler, path, { method = "GET", body, cookie } = {}) {
  const headers = { origin: "http://localhost:3000" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;

  const request = new Request(`http://localhost:3000/api/auth${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return method === "GET" ? handler.GET(request) : handler.POST(request);
}

test(
  "Next.js Better Auth persists registration, credentials, and sessions in MongoDB",
  {
    skip: missingTestConfiguration.length
      ? `Set explicit ${missingTestConfiguration.join(" and ")} values to run against a dedicated test database.`
      : false,
  },
  async () => {
    if (!/(^|[_-])test(?:[_-]|$)/i.test(testDatabaseName)) {
      throw new Error(
        "MONGODB_TEST_DB_NAME must clearly identify a test database, such as studiospace_auth_test.",
      );
    }

    const mongoClient = new MongoClient(testURI, {
      serverSelectionTimeoutMS: 10000,
    });
    try {
      await mongoClient.connect();
    } catch {
      throw new Error(
        "Could not connect to the explicitly configured MongoDB test database.",
      );
    }

    const database = mongoClient.db(testDatabaseName);
    const userCollection = database.collection("user");
    const accountCollection = database.collection("account");
    const sessionCollection = database.collection("session");
    const jwksCollection = database.collection("jwks");
    let existingJWKS = new Set();
    const email = `auth-${randomUUID()}@example.com`;
    const testEmails = new Set([email]);
    const password = `A${randomBytes(24).toString("base64url")}z`;
    let handler;
    let sessionCookieJar = new Map();
    const signingKeyIds = new Set();

    try {
      existingJWKS = new Set(
        (
          await jwksCollection
            .find({}, { projection: { _id: 1 } })
            .toArray()
        ).map((key) => String(key._id)),
      );
      const auth = createAuth({
        database,
        mongoClient,
        config: {
          baseURL: "http://localhost:3000",
          trustedOrigin: "http://localhost:3000",
          secret: randomBytes(32).toString("base64url"),
          nodeEnv: "test",
          disableLogger: true,
        },
      });
      handler = toNextJsHandler(auth);

      const invalidImageEmail = `invalid-image-${randomUUID()}@example.com`;
      testEmails.add(invalidImageEmail);
      const invalidImageResponse = await send(handler, "/sign-up/email", {
        method: "POST",
        body: {
          name: "Integration Test",
          email: invalidImageEmail,
          password,
          image: "javascript:alert(1)",
        },
      });
      assert.ok(
        !invalidImageResponse.ok,
        "Signup must reject non-HTTP(S) profile image URLs.",
      );
      assert.equal(
        await userCollection.countDocuments({ email: invalidImageEmail }),
        0,
        "Invalid profile image input must not create a user.",
      );

      const unsupportedFieldsEmail = `unsupported-${randomUUID()}@example.com`;
      testEmails.add(unsupportedFieldsEmail);
      const unsupportedFieldsResponse = await send(handler, "/sign-up/email", {
        method: "POST",
        body: {
          name: "Integration Test",
          email: unsupportedFieldsEmail,
          password,
          role: "admin",
        },
      });
      assert.ok(
        !unsupportedFieldsResponse.ok,
        "Signup must reject client-supplied server-managed fields.",
      );
      assert.equal(
        await userCollection.countDocuments({ email: unsupportedFieldsEmail }),
        0,
        "Unsupported signup fields must not create a user.",
      );

      const signupResponse = await send(handler, "/sign-up/email", {
        method: "POST",
        body: {
          name: "Integration Test",
          email,
          password,
          image: "https://example.com/avatar.png",
        },
      });
      assert.equal(signupResponse.status, 200, "Signup should succeed.");
      const signupBody = await signupResponse.json();
      assert.equal(
        typeof signupBody.token,
        "string",
        "A new signup with autoSignIn enabled must return a session token.",
      );
      assert.ok(signupBody.token);
      assert.equal(signupBody.user?.email, email);
      const signupCookies = setCookieHeaders(signupResponse.headers);
      const signupCookieNames = sessionCookieNames(signupCookies);
      assert.ok(
        signupCookieNames.some((name) => name.endsWith(".session_token")),
        "Signup must set the opaque session_token cookie.",
      );
      assert.ok(
        signupCookieNames.some((name) => name.includes(".session_data")),
        "Signup must set the JWT-backed session_data cookie.",
      );
      applySetCookies(sessionCookieJar, signupCookies);
      const signupProtectedHeader = JSON.parse(
        Buffer.from(
          cacheCookieValue(sessionCookieJar).split(".")[0],
          "base64url",
        ).toString(),
      );
      assert.equal(
        signupProtectedHeader.typ,
        "better-auth.session-cache+jwt",
        "Signup session_data must use Better Auth's JWT session-cache format.",
      );
      assert.equal(typeof signupProtectedHeader.kid, "string");
      signingKeyIds.add(signupProtectedHeader.kid);
      for (const cookie of signupCookies) {
        if (sessionCookieNames([cookie]).length) {
          assert.match(
            cookie,
            /;\s*httponly(?:;|$)/i,
            "Session cookies must be HTTP-only.",
          );
        }
      }
      const signupCookieHeader = [...sessionCookieJar]
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");

      const storedUser = await userCollection.findOne({ email });
      assert.ok(storedUser, "Signup must insert one user document.");
      assert.equal(signupBody.user.id, String(storedUser._id));
      assert.equal(
        await userCollection.countDocuments({ email }),
        1,
        "Signup must insert exactly one user document.",
      );

      const storedAccount = await accountCollection.findOne({
        accountId: String(storedUser._id),
        providerId: "credential",
      });
      assert.ok(storedAccount, "Signup must persist a credential account.");
      assert.ok(
        typeof storedAccount.password === "string" &&
          storedAccount.password !== password &&
          storedAccount.password.length > 32,
        "The stored credential must be a password hash, not plaintext.",
      );
      const sessionForUser = {
        userId: { $in: [storedUser._id, String(storedUser._id)] },
      };
      assert.equal(
        await sessionCollection.countDocuments(sessionForUser),
        1,
        "Signup with autoSignIn enabled must persist an authenticated session.",
      );
      const signupSessionResponse = await send(handler, "/get-session", {
        cookie: signupCookieHeader,
      });
      assert.equal(signupSessionResponse.status, 200);
      const signupSessionBody = await signupSessionResponse.json();
      assert.equal(
        signupSessionBody?.user?.id,
        String(storedUser._id),
        "The signup session cookie must authenticate the newly registered user.",
      );

      const signupLogoutResponse = await send(handler, "/sign-out", {
        method: "POST",
        cookie: signupCookieHeader,
      });
      assert.equal(signupLogoutResponse.status, 200);
      applySetCookies(
        sessionCookieJar,
        setCookieHeaders(signupLogoutResponse.headers),
      );
      assert.equal(
        await sessionCollection.countDocuments(sessionForUser),
        0,
        "The signup session must be removable before testing a separate login.",
      );
      sessionCookieJar = new Map();

      const duplicateResponse = await send(handler, "/sign-up/email", {
        method: "POST",
        body: { name: "Integration Test", email, password },
      });
      assert.equal(
        duplicateResponse.status,
        422,
        "With autoSignIn enabled, Better Auth returns its existing duplicate-email error.",
      );
      const duplicateBody = await duplicateResponse.json();
      assert.equal(
        duplicateBody.code,
        "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
        "The duplicate response must match Better Auth's installed behavior.",
      );
      assert.equal(
        sessionCookieNames(setCookieHeaders(duplicateResponse.headers)).length,
        0,
        "Duplicate signup must not set session cookies.",
      );
      assert.equal(
        await userCollection.countDocuments({ email }),
        1,
        "Duplicate signup must not insert a second user document.",
      );
      assert.equal(
        await accountCollection.countDocuments({
          accountId: String(storedUser._id),
          providerId: "credential",
        }),
        1,
        "Duplicate signup must not insert a second credential account.",
      );
      assert.equal(
        await sessionCollection.countDocuments(sessionForUser),
        0,
        "Duplicate signup must not create an authenticated session.",
      );

      const invalidLoginResponse = await send(handler, "/sign-in/email", {
        method: "POST",
        body: { email, password: `${password}wrong` },
      });
      assert.ok(
        !invalidLoginResponse.ok,
        "Incorrect credentials must not authenticate the user.",
      );
      assert.equal(
        sessionCookieNames(setCookieHeaders(invalidLoginResponse.headers))
          .length,
        0,
        "Incorrect credentials must not set session cookies.",
      );

      const loginResponse = await send(handler, "/sign-in/email", {
        method: "POST",
        body: { email, password },
      });
      assert.equal(loginResponse.status, 200, "Valid login should succeed.");
      const loginCookies = setCookieHeaders(loginResponse.headers);
      const loginCookieNames = sessionCookieNames(loginCookies);
      assert.ok(
        loginCookieNames.some((name) => name.endsWith(".session_token")),
        "Login must set the opaque session_token cookie.",
      );
      assert.ok(
        loginCookieNames.some((name) => name.includes(".session_data")),
        "Login must set the JWT-backed session_data cookie.",
      );
      applySetCookies(sessionCookieJar, loginCookies);
      const sessionCookieValue = cacheCookieValue(sessionCookieJar);
      const protectedHeader = JSON.parse(
        Buffer.from(sessionCookieValue.split(".")[0], "base64url").toString(),
      );
      signingKeyIds.add(protectedHeader.kid);
      assert.ok(
        typeof protectedHeader.kid === "string",
        "The session_data JWT must include a signing key ID.",
      );
      for (const cookie of loginCookies) {
        if (sessionCookieNames([cookie]).length) {
          assert.match(
            cookie,
            /;\s*httponly(?:;|$)/i,
            "Session cookies must be HTTP-only.",
          );
        }
      }
      const cookieHeader = [...sessionCookieJar]
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");

      assert.ok(
        (await sessionCollection.countDocuments(sessionForUser)) > 0,
        "Login must persist a session document.",
      );

      const jwksResponse = await send(handler, "/jwks");
      assert.equal(jwksResponse.status, 200, "The JWKS endpoint should respond.");
      const jwks = await jwksResponse.json();
      assert.ok(
        Array.isArray(jwks.keys) && jwks.keys.length > 0,
        "The JWKS endpoint must expose a public signing key.",
      );
      assert.ok(
        (await jwksCollection.countDocuments()) > 0,
        "The JWT signing key must persist in MongoDB.",
      );

      const sessionRequest = new Request(
        "http://localhost:3000/api/auth/get-session",
        { headers: { cookie: cookieHeader } },
      );
      assert.equal(
        protectedHeader.typ,
        "better-auth.session-cache+jwt",
        "session_data must contain Better Auth's JWT session-cache format.",
      );

      const cachedSession = await getCookieCache(sessionRequest, {
        cookiePrefix: "better-auth",
        cookieName: "session_data",
        isSecure: false,
        strategy: "jwt",
        jwt: {
          jwks,
          issuer: "http://localhost:3000",
        },
      });
      assert.equal(
        cachedSession?.user.id,
        String(storedUser._id),
        "session_data must verify against the published JWKS.",
      );

      const sessionResponse = await send(handler, "/get-session", {
        cookie: cookieHeader,
      });
      assert.equal(sessionResponse.status, 200);
      const sessionBody = await sessionResponse.json();
      assert.equal(
        sessionBody?.user?.id,
        String(storedUser._id),
        "get-session must return the user for a valid session cookie.",
      );

      const logoutResponse = await send(handler, "/sign-out", {
        method: "POST",
        cookie: cookieHeader,
      });
      assert.equal(logoutResponse.status, 200, "Logout should succeed.");
      applySetCookies(sessionCookieJar, setCookieHeaders(logoutResponse.headers));
      assert.equal(
        await sessionCollection.countDocuments(sessionForUser),
        0,
        "Logout must remove the persisted session.",
      );

      const postLogoutHeader = [...sessionCookieJar]
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
      const postLogoutResponse = await send(handler, "/get-session", {
        cookie: postLogoutHeader,
      });
      assert.equal(postLogoutResponse.status, 200);
      const postLogoutBody = await postLogoutResponse.json();
      assert.equal(
        postLogoutBody?.user ?? null,
        null,
        "A session request after logout must not report an authenticated user.",
      );
    } finally {
      try {
        for (const testEmail of testEmails) {
          const testUser = await userCollection.findOne({ email: testEmail });
          if (testUser) {
            const userIdFilter = {
              userId: {
                $in: [testUser._id, String(testUser._id)],
              },
            };
            await sessionCollection.deleteMany(userIdFilter);
            await accountCollection.deleteMany(userIdFilter);
            await userCollection.deleteOne({ _id: testUser._id });
          }
        }
        if (signingKeyIds.size) {
          const signingKeys = await jwksCollection.find({}).toArray();
          for (const signingKeyId of signingKeyIds) {
            const signingKey = signingKeys.find(
              (key) =>
                key.id === signingKeyId ||
                String(key._id) === signingKeyId,
            );
            if (
              signingKey &&
              !existingJWKS.has(String(signingKey._id))
            ) {
              await jwksCollection.deleteOne({ _id: signingKey._id });
            }
          }
        }
      } finally {
        await mongoClient.close();
      }
    }
  },
);
