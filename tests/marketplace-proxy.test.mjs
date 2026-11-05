import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cancelBooking,
  createBooking,
  createStudio,
  deleteStudio,
  getMyBookings,
  getMyStudios,
  updateStudio,
} from "../src/lib/api.js";
import {
  filterSessionDataCookie,
  handleMarketplaceProxy,
} from "../src/lib/marketplace-proxy.js";

const clientOrigin = "https://client.example";
const upstreamOrigin = "https://api.example";
const env = {
  BETTER_AUTH_URL: clientOrigin,
  SERVER_API_BASE_URL: upstreamOrigin,
};

function makeRequest(path, { method = "GET", headers = {}, body } = {}) {
  const requestHeaders = new Headers(headers);
  if (method !== "GET" && !requestHeaders.has("origin")) {
    requestHeaders.set("origin", clientOrigin);
  }
  if (body !== undefined && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }
  return new Request(`${clientOrigin}/api/marketplace/${path}`, {
    method,
    headers: requestHeaders,
    ...(body === undefined ? {} : { body }),
  });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("forwards only allowlisted routes and their permitted methods", async () => {
  const cases = [
    ["POST", "studios", "/api/studios"],
    ["GET", "studios/mine", "/api/studios/mine"],
    ["PATCH", "studios/creative-loft_1", "/api/studios/creative-loft_1"],
    ["DELETE", "studios/creative-loft_1", "/api/studios/creative-loft_1"],
    ["POST", "bookings", "/api/bookings"],
    ["GET", "bookings/mine", "/api/bookings/mine"],
    [
      "PATCH",
      "bookings/65c7a6b0c9d2fddc4493e001/cancel",
      "/api/bookings/65c7a6b0c9d2fddc4493e001/cancel",
    ],
  ];

  for (const [method, path, expectedPath] of cases) {
    let calledUrl;
    const request = makeRequest(path, {
      method,
      ...(["POST", "PATCH"].includes(method) ? { body: "{}" } : {}),
    });
    const response = await handleMarketplaceProxy(request, {
      env,
      fetchImpl: async (url) => {
        calledUrl = new URL(url);
        return jsonResponse({ success: true });
      },
    });

    assert.equal(response.status, 200);
    assert.equal(calledUrl.origin, upstreamOrigin);
    assert.equal(calledUrl.pathname, expectedPath);
  }
});

test("rejects unknown, encoded, traversal, and unsupported-method paths", async () => {
  let upstreamCalls = 0;
  const fetchImpl = async () => {
    upstreamCalls += 1;
    return jsonResponse({ success: true });
  };
  const invalidPaths = [
    ["GET", "studios/%2e%2e/bookings"],
    ["GET", "studios/../bookings"],
    ["GET", "studios//mine"],
    ["PATCH", "studios/%2Fprivate"],
    ["PATCH", "bookings/not-an-object-id/cancel"],
  ];

  for (const [method, path] of invalidPaths) {
    const response = await handleMarketplaceProxy(
      makeRequest(path, { method, ...(method === "GET" ? {} : { body: "{}" }) }),
      { env, fetchImpl },
    );
    assert.ok([404, 405].includes(response.status), path);
    assert.equal(response.ok, false, path);
  }

  const unsupportedStudioMethod = await handleMarketplaceProxy(
    makeRequest("studios/other"),
    { env, fetchImpl },
  );
  assert.equal(unsupportedStudioMethod.status, 405);

  const wrongMethod = await handleMarketplaceProxy(
    makeRequest("studios/mine", { method: "POST", body: "{}" }),
    { env, fetchImpl },
  );
  assert.equal(wrongMethod.status, 405);
  assert.equal(wrongMethod.headers.get("allow"), "GET");
  const wrongDeleteMethod = await handleMarketplaceProxy(
    makeRequest("studios/mine", { method: "DELETE" }),
    { env, fetchImpl },
  );
  assert.equal(wrongDeleteMethod.status, 405);
  assert.equal(wrongDeleteMethod.headers.get("allow"), "GET");
  const unknownDelete = await handleMarketplaceProxy(
    makeRequest("bookings/65c7a6b0c9d2fddc4493e001/cancel/extra", {
      method: "DELETE",
    }),
    { env, fetchImpl },
  );
  assert.equal(unknownDelete.status, 404);
  assert.equal(upstreamCalls, 0);
});

test("forwards exact JSON body and query while dropping unapproved headers", async () => {
  const requestBody = JSON.stringify({ title: "Test studio" });
  let upstreamUrl;
  let upstreamOptions;
  const response = await handleMarketplaceProxy(
    makeRequest("studios", {
      method: "POST",
      body: requestBody,
      headers: {
        authorization: "Bearer do-not-forward",
        "x-arbitrary-header": "do-not-forward",
        cookie:
          "unrelated=value; better-auth.session_token=opaque; better-auth.session_data=encoded%3Dvalue",
        accept: "application/json",
      },
    }),
    {
      env,
      fetchImpl: async (url, options) => {
        upstreamUrl = new URL(url);
        upstreamOptions = options;
        return jsonResponse({ success: true }, 201);
      },
    },
  );

  assert.equal(response.status, 201);
  assert.equal(upstreamOptions.method, "POST");
  assert.equal(upstreamOptions.cache, "no-store");
  assert.equal(upstreamOptions.redirect, "manual");
  assert.equal(upstreamOptions.body.byteLength, Buffer.byteLength(requestBody));
  assert.equal(new TextDecoder().decode(upstreamOptions.body), requestBody);
  assert.equal(upstreamOptions.headers.get("content-type"), "application/json");
  assert.equal(
    upstreamOptions.headers.get("cookie"),
    "better-auth.session_data=encoded%3Dvalue",
  );
  assert.equal(upstreamOptions.headers.has("authorization"), false);
  assert.equal(upstreamOptions.headers.has("x-arbitrary-header"), false);
  assert.equal(upstreamOptions.headers.has("host"), false);

  let queryUrl;
  await handleMarketplaceProxy(
    makeRequest("studios/mine?limit=5&sort=newest"),
    {
      env,
      fetchImpl: async (url) => {
        queryUrl = new URL(url);
        return jsonResponse({ success: true, data: [] });
      },
    },
  );
  assert.equal(queryUrl.search, "?limit=5&sort=newest");
});

test("forwards only a valid Better Auth session-data cookie, including chunks", () => {
  assert.equal(
    filterSessionDataCookie(
      "theme=dark; better-auth.session_token=opaque; better-auth.session_data=raw%2Bdata",
    ),
    "better-auth.session_data=raw%2Bdata",
  );
  assert.equal(
    filterSessionDataCookie(
      "__Secure-better-auth.session_data=secure-token",
    ),
    "__Secure-better-auth.session_data=secure-token",
  );
  assert.equal(
    filterSessionDataCookie(
      "better-auth-session_data=legacy-token",
    ),
    "better-auth-session_data=legacy-token",
  );
  assert.equal(
    filterSessionDataCookie(
      "__Secure-better-auth-session_data=legacy-secure-token",
    ),
    "__Secure-better-auth-session_data=legacy-secure-token",
  );
  assert.equal(
    filterSessionDataCookie(
      "better-auth-session_data.1=second; better-auth-session_data.0=first",
    ),
    "better-auth-session_data.1=second; better-auth-session_data.0=first",
  );
  assert.equal(
    filterSessionDataCookie(
      "better-auth.session_data.0=first; better-auth.session_data.2=third",
    ),
    null,
  );
  assert.equal(
    filterSessionDataCookie(
      "better-auth.session_data=root; better-auth.session_data.0=chunk",
    ),
    null,
  );
  assert.equal(
    filterSessionDataCookie(
      "better-auth.session_data=root; __Secure-better-auth.session_data=other",
    ),
    null,
  );
  assert.equal(filterSessionDataCookie("better-auth.session_token=opaque"), null);
});

test("requires same-origin JSON mutations and never calls Express for invalid CSRF requests", async () => {
  let upstreamCalls = 0;
  const fetchImpl = async () => {
    upstreamCalls += 1;
    return jsonResponse({ success: true });
  };

  const requests = [
    makeRequest("studios", {
      method: "POST",
      body: "{}",
      headers: { origin: "https://attacker.example" },
    }),
    new Request(`${clientOrigin}/api/marketplace/studios`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }),
    makeRequest("studios", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "text/plain" },
    }),
    makeRequest("bookings/65c7a6b0c9d2fddc4493e001/cancel", {
      method: "PATCH",
      body: "{}",
      headers: { origin: "https://client.example.evil" },
    }),
    makeRequest("studios/creative-loft_1", {
      method: "DELETE",
      headers: { origin: "https://attacker.example" },
    }),
  ];

  for (const request of requests) {
    const response = await handleMarketplaceProxy(request, { env, fetchImpl });
    assert.ok([403, 415].includes(response.status));
  }
  assert.equal(upstreamCalls, 0);
});

test("uses configured upstream rather than request host and forwards no cookie if absent", async () => {
  let upstreamUrl;
  let upstreamCookie;
  const request = makeRequest("bookings/mine", {
    headers: { host: "attacker.example" },
  });
  const response = await handleMarketplaceProxy(request, {
    env,
    fetchImpl: async (url, options) => {
      upstreamUrl = new URL(url);
      upstreamCookie = options.headers.get("cookie");
      return jsonResponse({ success: false, code: "UNAUTHENTICATED" }, 401);
    },
  });

  assert.equal(upstreamUrl.origin, upstreamOrigin);
  assert.equal(upstreamCookie, null);
  assert.equal(response.status, 401);
});

test("preserves meaningful Server error status and JSON body", async () => {
  const serverError = {
    success: false,
    message: "This studio cannot be deleted because it has booking history",
    code: "STUDIO_HAS_BOOKINGS",
    details: null,
  };
  const response = await handleMarketplaceProxy(
    makeRequest("studios/creative-loft_1", { method: "DELETE" }),
    {
      env,
      fetchImpl: async () => jsonResponse(serverError, 409),
    },
  );

  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), serverError);
});

test("returns safe errors for missing configuration, upstream failures, and redirects", async () => {
  const missingConfig = await handleMarketplaceProxy(
    makeRequest("studios/mine"),
    { env: {}, fetchImpl: async () => jsonResponse({}) },
  );
  assert.equal(missingConfig.status, 503);

  let publicUrlFallbackCalls = 0;
  const publicUrlFallback = await handleMarketplaceProxy(
    makeRequest("studios/mine"),
    {
      env: {
        BETTER_AUTH_URL: clientOrigin,
        NEXT_PUBLIC_API_BASE_URL: upstreamOrigin,
      },
      fetchImpl: async () => {
        publicUrlFallbackCalls += 1;
        return jsonResponse({});
      },
    },
  );
  assert.equal(publicUrlFallback.status, 503);
  assert.equal(publicUrlFallbackCalls, 0);

  const networkFailure = await handleMarketplaceProxy(
    makeRequest("studios/mine"),
    {
      env,
      fetchImpl: async () => {
        throw new Error("private upstream error");
      },
    },
  );
  assert.equal(networkFailure.status, 503);
  assert.doesNotMatch(await networkFailure.text(), /private upstream error/);

  const redirect = await handleMarketplaceProxy(
    makeRequest("studios/mine"),
    {
      env,
      fetchImpl: async () =>
        new Response(null, {
          status: 302,
          headers: { location: "https://attacker.example" },
        }),
    },
  );
  assert.equal(redirect.status, 502);
  assert.equal(redirect.headers.has("location"), false);
});

test("routes protected Client API helpers through the same-origin proxy", async () => {
  const originalFetch = globalThis.fetch;
  const requested = [];
  globalThis.fetch = async (url, options) => {
    requested.push({ url: String(url), options });
    return jsonResponse({ success: true, data: [] });
  };

  try {
    await createStudio({ title: "Studio" });
    await getMyStudios();
    await updateStudio("studio-id", { title: "Updated" });
    await deleteStudio("studio-id");
    await createBooking({ studioId: "studio-id" });
    await getMyBookings();
    await cancelBooking("65c7a6b0c9d2fddc4493e001");
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepEqual(
    requested.map(({ url, options }) => [new URL(url, clientOrigin).pathname, options.method || "GET"]),
    [
      ["/api/marketplace/studios", "POST"],
      ["/api/marketplace/studios/mine", "GET"],
      ["/api/marketplace/studios/studio-id", "PATCH"],
      ["/api/marketplace/studios/studio-id", "DELETE"],
      ["/api/marketplace/bookings", "POST"],
      ["/api/marketplace/bookings/mine", "GET"],
      [
        "/api/marketplace/bookings/65c7a6b0c9d2fddc4493e001/cancel",
        "PATCH",
      ],
    ],
  );
  assert.ok(requested.every(({ options }) => options.credentials === "include"));
});

test("DELETE studio forwards only the session-data cookie and never the opaque session token", async () => {
  let upstreamOptions;
  const response = await handleMarketplaceProxy(
    makeRequest("studios/creative-loft_1", {
      method: "DELETE",
      headers: {
        cookie:
          "unrelated=secret; better-auth.session_token=opaque; better-auth.session_data=jwt%2Bvalue",
        authorization: "Bearer do-not-forward",
      },
    }),
    {
      env,
      fetchImpl: async (_url, options) => {
        upstreamOptions = options;
        return jsonResponse({
          success: true,
          message: "Studio deleted successfully",
        });
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(upstreamOptions.method, "DELETE");
  assert.equal(upstreamOptions.body, undefined);
  assert.equal(
    upstreamOptions.headers.get("cookie"),
    "better-auth.session_data=jwt%2Bvalue",
  );
  assert.equal(upstreamOptions.headers.has("authorization"), false);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
