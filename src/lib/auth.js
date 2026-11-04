import "server-only";

import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const signupFields = new Set([
  "name",
  "email",
  "password",
  "image",
  "callbackURL",
  "rememberMe",
]);
const mongoClientKey = Symbol.for("studiospace.next.mongo-client");
let authPromise;

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be configured for authentication.`);
  }
  return value;
}

function getRuntimeConfig() {
  const baseURL = requiredEnvironment("BETTER_AUTH_URL");
  let parsedBaseURL;
  try {
    parsedBaseURL = new URL(baseURL);
  } catch {
    throw new Error("BETTER_AUTH_URL must be a valid HTTP(S) URL.");
  }
  if (!["http:", "https:"].includes(parsedBaseURL.protocol)) {
    throw new Error("BETTER_AUTH_URL must be a valid HTTP(S) URL.");
  }
  if (process.env.NODE_ENV === "production" && parsedBaseURL.protocol !== "https:") {
    throw new Error("BETTER_AUTH_URL must use HTTPS in production.");
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together.",
    );
  }

  const secret = requiredEnvironment("BETTER_AUTH_SECRET");
  if (secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long.");
  }

  return {
    baseURL: baseURL.replace(/\/+$/, ""),
    trustedOrigin: parsedBaseURL.origin,
    secret,
    googleClientId,
    googleClientSecret,
    nodeEnv: process.env.NODE_ENV,
  };
}

function getMongoClient(uri) {
  let state = globalThis[mongoClientKey];
  if (state && state.uri !== uri) {
    throw new Error(
      "MONGODB_URI changed after the authentication database connection was initialized.",
    );
  }
  if (!state) {
    state = { uri, client: new MongoClient(uri), connection: null };
    globalThis[mongoClientKey] = state;
  }
  if (!state.connection) {
    state.connection = state.client.connect().catch(() => {
      state.connection = null;
      throw new Error("Unable to connect to the authentication MongoDB database.");
    });
  }
  return state.connection;
}

function validateSignup(context) {
  if (context.path !== "/sign-up/email") return;

  const body = context.body ?? {};
  if (typeof body !== "object" || Array.isArray(body)) {
    throw new APIError("BAD_REQUEST", {
      message: "Signup body must be an object.",
    });
  }
  if (Object.keys(body).some((field) => !signupFields.has(field))) {
    throw new APIError("BAD_REQUEST", {
      message: "Signup contains unsupported fields.",
    });
  }

  if (
    typeof body.password === "string" &&
    (!/[a-z]/.test(body.password) || !/[A-Z]/.test(body.password))
  ) {
    throw new APIError("BAD_REQUEST", {
      message:
        "Password must contain at least one lowercase and one uppercase letter.",
    });
  }

  if (Object.hasOwn(body, "image")) {
    if (typeof body.image !== "string") {
      throw new APIError("BAD_REQUEST", {
        message: "Image must be a valid HTTP(S) URL.",
      });
    }

    const image = body.image.trim();
    let parsedImage;
    try {
      parsedImage = new URL(image);
    } catch {
      throw new APIError("BAD_REQUEST", {
        message: "Image must be a valid HTTP(S) URL.",
      });
    }
    if (!["http:", "https:"].includes(parsedImage.protocol)) {
      throw new APIError("BAD_REQUEST", {
        message: "Image must be a valid HTTP(S) URL.",
      });
    }
    return {
      context: {
        ...context,
        body: { ...body, image },
      },
    };
  }
}

export function createAuth({ database, mongoClient, config }) {
  const googleConfigured =
    Boolean(config.googleClientId) && Boolean(config.googleClientSecret);
  if (Boolean(config.googleClientId) !== Boolean(config.googleClientSecret)) {
    throw new Error(
      "Google OAuth client ID and secret must be configured together.",
    );
  }

  return betterAuth({
    appName: "StudioSpace",
    baseURL: config.baseURL,
    secret: config.secret,
    trustedOrigins: [config.trustedOrigin],
    database: mongodbAdapter(database, {
      client: mongoClient,
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      minPasswordLength: 6,
      maxPasswordLength: 128,
    },
    socialProviders: googleConfigured
      ? {
          google: {
            clientId: config.googleClientId,
            clientSecret: config.googleClientSecret,
          },
        }
      : {},
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60,
        strategy: "jwt",
      },
    },
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: config.nodeEnv === "production",
      },
    },
    plugins: [jwt({ sessionCookieCache: true }), nextCookies()],
    hooks: {
      before: createAuthMiddleware(validateSignup),
    },
    logger: config.disableLogger ? { disabled: true } : undefined,
  });
}

async function initializeAuth() {
  const uri = requiredEnvironment("MONGODB_URI");
  const databaseName = requiredEnvironment("MONGODB_DB_NAME");
  const config = getRuntimeConfig();
  const mongoClient = await getMongoClient(uri);

  return createAuth({
    database: mongoClient.db(databaseName),
    mongoClient,
    config,
  });
}

export async function getAuth() {
  if (!authPromise) authPromise = initializeAuth();
  try {
    return await authPromise;
  } catch (error) {
    authPromise = undefined;
    throw error;
  }
}
