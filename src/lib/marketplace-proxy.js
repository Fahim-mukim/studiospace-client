import "server-only";

const routePrefix = "/api/marketplace/";
const maximumRequestBodyBytes = 1024 * 1024;
const maximumSessionCookieBytes = 405000;
const sessionCookieNames = [
  "better-auth.session_data",
  "__Secure-better-auth.session_data",
  "better-auth-session_data",
  "__Secure-better-auth-session_data",
];

function jsonResponse(status, body, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function getAllowedEndpoint(method, pathname) {
  if (
    !pathname.startsWith(routePrefix) ||
    pathname.includes("%") ||
    pathname.includes("\\") ||
    pathname.includes("//")
  ) {
    return { kind: "not-found" };
  }

  const path = pathname.slice(routePrefix.length);
  if (!path || path.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    return { kind: "not-found" };
  }

  const candidates = [
    { path: "studios", method: "POST", upstreamPath: "/api/studios" },
    { path: "studios/mine", method: "GET", upstreamPath: "/api/studios/mine" },
    {
      pattern: /^studios\/[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/,
      methods: ["PATCH", "DELETE"],
      upstreamPath: (candidate) =>
        `/api/studios/${candidate.slice("studios/".length)}`,
    },
    { path: "bookings", method: "POST", upstreamPath: "/api/bookings" },
    { path: "bookings/mine", method: "GET", upstreamPath: "/api/bookings/mine" },
    {
      pattern: /^bookings\/[a-fA-F0-9]{24}\/cancel$/,
      method: "PATCH",
      upstreamPath: (candidate) => `/api/${candidate}`,
    },
  ];

  const candidate = candidates.find((entry) =>
    entry.path === path || entry.pattern?.test(path),
  );
  if (!candidate) return { kind: "not-found" };
  const methods = candidate.methods || [candidate.method];
  if (!methods.includes(method)) {
    return { kind: "method-not-allowed", allow: methods.join(", ") };
  }

  return {
    kind: "allowed",
    upstreamPath:
      typeof candidate.upstreamPath === "function"
        ? candidate.upstreamPath(path)
        : candidate.upstreamPath,
  };
}

export function filterSessionDataCookie(cookieHeader) {
  if (typeof cookieHeader !== "string" || !cookieHeader) return null;

  const selected = [];
  const seenNames = new Set();
  let baseName = null;
  for (const rawPair of cookieHeader.split(";")) {
    const pair = rawPair.replace(/^\s+/, "");
    const separator = pair.indexOf("=");
    if (separator < 1) continue;

    const name = pair.slice(0, separator).trim();
    const matchingBase = sessionCookieNames.find(
      (candidate) =>
        name === candidate || name.startsWith(`${candidate}.`),
    );
    if (!matchingBase) continue;

    if (seenNames.has(name) || (baseName && baseName !== matchingBase)) {
      return null;
    }
    seenNames.add(name);
    baseName = matchingBase;

    const value = pair.slice(separator + 1);
    if (!value) return null;
    selected.push({ name, value, base: matchingBase });
  }

  if (!selected.length) return null;

  const rootCookie = selected.find(({ name, base }) => name === base);
  const chunks = [];
  for (const cookie of selected) {
    if (cookie.name === cookie.base) continue;
    const suffix = cookie.name.slice(cookie.base.length + 1);
    if (!/^(?:0|[1-9]\d*)$/.test(suffix)) return null;
    const index = Number(suffix);
    if (!Number.isSafeInteger(index) || index >= 100) return null;
    chunks.push({ index, cookie });
  }

  if (rootCookie && chunks.length) return null;
  if (chunks.length) {
    if (chunks.length >= 100) return null;
    chunks.sort((left, right) => left.index - right.index);
    if (chunks.some(({ index }, position) => index !== position)) return null;
  }

  const forwardedCookie = selected
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  if (new TextEncoder().encode(forwardedCookie).byteLength > maximumSessionCookieBytes) {
    return null;
  }
  return forwardedCookie;
}

function getTrustedClientOrigin(env) {
  if (typeof env.BETTER_AUTH_URL !== "string" || !env.BETTER_AUTH_URL) {
    return null;
  }
  try {
    const configuredUrl = new URL(env.BETTER_AUTH_URL);
    if (
      !["http:", "https:"].includes(configuredUrl.protocol) ||
      !configuredUrl.hostname ||
      configuredUrl.username ||
      configuredUrl.password
    ) {
      return null;
    }
    return configuredUrl.origin;
  } catch {
    return null;
  }
}

function getUpstreamBaseUrl(env) {
  const configuredUrl = env.SERVER_API_BASE_URL || env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof configuredUrl !== "string" || !configuredUrl) return null;

  try {
    const parsedUrl = new URL(configuredUrl);
    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      !parsedUrl.hostname ||
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.pathname !== "/" ||
      parsedUrl.search ||
      parsedUrl.hash
    ) {
      return null;
    }
    return parsedUrl.origin;
  } catch {
    return null;
  }
}

async function readLimitedBody(request) {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumRequestBodyBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function handleMarketplaceProxy(
  request,
  { env = process.env, fetchImpl = fetch } = {},
) {
  const requestUrl = new URL(request.url);
  const endpoint = getAllowedEndpoint(request.method.toUpperCase(), requestUrl.pathname);
  if (endpoint.kind === "not-found") {
    return jsonResponse(404, {
      success: false,
      message: "Marketplace endpoint not found.",
      code: "NOT_FOUND",
      details: null,
    });
  }
  if (endpoint.kind === "method-not-allowed") {
    return jsonResponse(
      405,
      {
        success: false,
        message: "Method not allowed.",
        code: "METHOD_NOT_ALLOWED",
        details: null,
      },
      { Allow: endpoint.allow },
    );
  }

  const method = request.method.toUpperCase();
  const hasBody = method === "POST" || method === "PATCH";
  const isMutation = hasBody || method === "DELETE";
  if (hasBody) {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
      return jsonResponse(415, {
        success: false,
        message: "Content-Type must be application/json.",
        code: "UNSUPPORTED_MEDIA_TYPE",
        details: null,
      });
    }
  }

  if (isMutation) {
    const trustedOrigin = getTrustedClientOrigin(env);
    if (!trustedOrigin) {
      return jsonResponse(503, {
        success: false,
        message: "Marketplace proxy is not configured.",
        code: "PROXY_NOT_CONFIGURED",
        details: null,
      });
    }
    if (
      requestUrl.origin !== trustedOrigin ||
      request.headers.get("origin") !== trustedOrigin
    ) {
      return jsonResponse(403, {
        success: false,
        message: "Request origin is not allowed.",
        code: "CSRF_ORIGIN_INVALID",
        details: null,
      });
    }
  }

  const upstreamBaseUrl = getUpstreamBaseUrl(env);
  if (!upstreamBaseUrl) {
    return jsonResponse(503, {
      success: false,
      message: "Marketplace API is not configured.",
      code: "UPSTREAM_NOT_CONFIGURED",
      details: null,
    });
  }

  let body;
  if (hasBody) {
    body = await readLimitedBody(request);
    if (body === null) {
      return jsonResponse(413, {
        success: false,
        message: "Request body is too large.",
        code: "REQUEST_TOO_LARGE",
        details: null,
      });
    }
  }

  const headers = new Headers({
    Accept: request.headers.get("accept") || "application/json",
  });
  if (hasBody) {
    headers.set("Content-Type", request.headers.get("content-type"));
  }
  const sessionCookie = filterSessionDataCookie(request.headers.get("cookie"));
  if (sessionCookie) headers.set("Cookie", sessionCookie);

  const upstreamUrl = new URL(endpoint.upstreamPath, upstreamBaseUrl);
  if (method === "GET") upstreamUrl.search = requestUrl.search;

  let upstreamResponse;
  try {
    upstreamResponse = await fetchImpl(upstreamUrl, {
      method,
      headers,
      ...(hasBody ? { body } : {}),
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return jsonResponse(503, {
      success: false,
      message: "Marketplace API is unavailable.",
      code: "UPSTREAM_UNAVAILABLE",
      details: null,
    });
  }

  if (upstreamResponse.status >= 300 && upstreamResponse.status < 400) {
    return jsonResponse(502, {
      success: false,
      message: "Marketplace API returned an unexpected redirect.",
      code: "UPSTREAM_REDIRECT",
      details: null,
    });
  }

  let responseBody;
  try {
    responseBody = await upstreamResponse.json();
  } catch {
    return jsonResponse(502, {
      success: false,
      message: "Marketplace API returned an invalid response.",
      code: "UPSTREAM_INVALID_RESPONSE",
      details: null,
    });
  }

  return jsonResponse(upstreamResponse.status, responseBody);
}
