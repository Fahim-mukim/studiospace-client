import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ApiError,
  buildApiUrl,
  deleteStudio,
  getApiBaseUrl,
  getStudios,
  normalizeStudio,
} from "../src/lib/api.js";

test("getApiBaseUrl does not fall back to localhost in production", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NODE_ENV = "production";
  delete process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    assert.throws(getApiBaseUrl, {
      name: "ApiError",
      status: 503,
      code: "API_NOT_CONFIGURED",
    });
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example/";
    assert.equal(getApiBaseUrl(), "https://api.example");
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalApiBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBaseUrl;
    }
  }
});

test("buildApiUrl formats URLs and query parameters correctly", () => {
  const url1 = buildApiUrl("/api/studios");
  assert.ok(url1.endsWith("/api/studios"));

  const url2 = buildApiUrl("api/studios", {
    category: "photo-studios",
    search: "daylight loft",
    maxPrice: 100,
    page: 2,
    empty: "",
    skipped: undefined,
    nil: null,
  });
  const parsed = new URL(url2);
  assert.equal(parsed.pathname, "/api/studios");
  assert.equal(parsed.searchParams.get("category"), "photo-studios");
  assert.equal(parsed.searchParams.get("search"), "daylight loft");
  assert.equal(parsed.searchParams.get("maxPrice"), "100");
  assert.equal(parsed.searchParams.get("page"), "2");
  assert.equal(parsed.searchParams.has("empty"), false);
  assert.equal(parsed.searchParams.has("skipped"), false);
  assert.equal(parsed.searchParams.has("nil"), false);
});

test("getStudios requests the selected search, category, limit, and sort without caching", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl;
  let requestOptions;
  const studio = {
    id: "studio-123",
    title: "Brooklyn Photo Studio",
    slug: "brooklyn-photo-studio",
    category: "Photo Studios",
    categorySlug: "photo-studios",
    hourlyRate: 95,
    capacity: 8,
    location: "Brooklyn, New York",
    image: "https://example.com/studio.jpg",
    amenities: ["Natural light"],
    overview: "A bright studio for creative photo sessions.",
  };

  globalThis.fetch = async (url, options) => {
    requestedUrl = String(url);
    requestOptions = options;
    return new Response(
      JSON.stringify({
        success: true,
        data: [studio],
        pagination: { page: 1, limit: 6, total: 1, totalPages: 1 },
      }),
      { headers: { "content-type": "application/json" } },
    );
  };

  try {
    const result = await getStudios(
      {
        search: "Brooklyn",
        category: "photo-studios",
        limit: 6,
        sort: "newest",
      },
      { cache: "no-store" },
    );
    const url = new URL(requestedUrl);

    assert.equal(url.pathname, "/api/studios");
    assert.equal(url.searchParams.get("search"), "Brooklyn");
    assert.equal(url.searchParams.get("category"), "photo-studios");
    assert.equal(url.searchParams.get("limit"), "6");
    assert.equal(url.searchParams.get("sort"), "newest");
    assert.equal(requestOptions.cache, "no-store");
    assert.equal(result.studios.length, 1);
    assert.equal(result.studios[0].title, studio.title);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getStudios delegates rating order to the server before pagination", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl;
  const serverOrderedStudios = [
    { id: "lower-rated", title: "Lower Rated", rating: "3.5", reviewCount: 2 },
    { id: "higher-rated", title: "Higher Rated", rating: "5", reviewCount: 1 },
  ];
  globalThis.fetch = async (url) => {
    requestedUrl = String(url);
    return new Response(
      JSON.stringify({
        success: true,
        data: serverOrderedStudios,
        pagination: { page: 2, limit: 1, total: 2, totalPages: 2 },
      }),
      { headers: { "content-type": "application/json" } },
    );
  };

  try {
    const result = await getStudios({ sort: "rating", page: 2, limit: 1 });
    const url = new URL(requestedUrl);

    assert.equal(url.searchParams.get("sort"), "rating");
    assert.equal(url.searchParams.get("page"), "2");
    assert.equal(url.searchParams.get("limit"), "1");
    assert.deepEqual(
      result.studios.map((studio) => studio.id),
      ["lower-rated", "higher-rated"],
      "The Client must preserve the server's globally sorted page order.",
    );
    assert.equal(result.pagination.page, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("normalizeStudio handles server studio records cleanly", () => {
  const serverRecord = {
    _id: "65c7a6b0c9d2fddc4493e001",
    id: "65c7a6b0c9d2fddc4493e001",
    title: "Server Photo Loft",
    slug: "server-photo-loft-65c7a6b0c9d2fddc4493e001",
    category: "Photo Studios",
    categorySlug: "photo-studios",
    hourlyRate: 120,
    capacity: 10,
    location: "Manhattan, NY",
    image: "https://example.com/studio.jpg",
    amenities: ["Lighting", "Backdrop"],
    overview: "A lovely studio for creative projects.",
    host: {
      name: "Host User",
      avatar: "https://example.com/avatar.jpg",
    },
  };

  const normalized = normalizeStudio(serverRecord);
  assert.equal(normalized.id, "65c7a6b0c9d2fddc4493e001");
  assert.equal(normalized.name, "Server Photo Loft");
  assert.equal(normalized.title, "Server Photo Loft");
  assert.equal(normalized.hourlyRate, 120);
  assert.equal(normalized.rate, "$120");
  assert.equal(normalized.capacity, "Up to 10");
  assert.equal(normalized.capacityCount, 10);
  assert.equal(normalized.rating, "New");
  assert.equal(normalized.reviewCount, 0);
  assert.equal(normalized.host?.name, "Host User");
  assert.equal(normalized.host?.avatar, "https://example.com/avatar.jpg");
});

test("normalizeStudio handles legacy fixture formats cleanly", () => {
  const fixtureRecord = {
    id: "the-daylight-loft",
    name: "The Daylight Loft",
    slug: "the-daylight-loft",
    rate: "$95",
    hourlyRate: 95,
    capacity: "Up to 8",
    rating: "4.9",
    ratingValue: 4.9,
    reviewCount: 28,
    category: "Photo Studios",
    categorySlug: "photo-studios",
  };

  const normalized = normalizeStudio(fixtureRecord);
  assert.equal(normalized.id, "the-daylight-loft");
  assert.equal(normalized.name, "The Daylight Loft");
  assert.equal(normalized.title, "The Daylight Loft");
  assert.equal(normalized.rate, "$95");
  assert.equal(normalized.hourlyRate, 95);
  assert.equal(normalized.rating, "4.9");
  assert.equal(normalized.reviewCount, 28);
});

test("normalizeStudio handles null/empty objects safely", () => {
  assert.equal(normalizeStudio(null), null);
  assert.equal(normalizeStudio(undefined), null);
  assert.equal(normalizeStudio("not-an-object"), null);

  const minimal = normalizeStudio({});
  assert.equal(minimal.name, "Untitled Studio");
  assert.equal(minimal.rate, "$0");
  assert.equal(minimal.rating, "New");
  assert.equal(minimal.reviewCount, 0);
});

test("ApiError retains status, code, and details", () => {
  const error = new ApiError("Studio not found", {
    status: 404,
    code: "STUDIO_NOT_FOUND",
    details: { lookup: "123" },
  });

  assert.equal(error.name, "ApiError");
  assert.equal(error.message, "Studio not found");
  assert.equal(error.status, 404);
  assert.equal(error.code, "STUDIO_NOT_FOUND");
  assert.deepEqual(error.details, { lookup: "123" });
});

test("deleteStudio uses the same-origin BFF, DELETE, credentials, and safe identifier encoding", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl;
  let requestOptions;
  globalThis.fetch = async (url, options) => {
    requestedUrl = String(url);
    requestOptions = options;
    return new Response(
      JSON.stringify({
        success: true,
        message: "Studio deleted successfully",
        data: { id: "deleted-studio" },
      }),
      { headers: { "content-type": "application/json" } },
    );
  };

  try {
    const result = await deleteStudio("loft & lights", {
      credentials: "omit",
      cache: "no-store",
    });

    assert.equal(
      new URL(requestedUrl, "http://localhost:3000").pathname,
      "/api/marketplace/studios/loft%20%26%20lights",
    );
    assert.equal(requestOptions.method, "DELETE");
    assert.equal(requestOptions.credentials, "include");
    assert.equal(requestOptions.cache, "no-store");
    assert.equal("body" in requestOptions, false);
    assert.deepEqual(result, {
      success: true,
      message: "Studio deleted successfully",
      studioId: "deleted-studio",
      data: { id: "deleted-studio" },
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("deleteStudio preserves standardized API errors", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: false,
        message: "This studio has booking history",
        code: "STUDIO_HAS_BOOKINGS",
        details: null,
      }),
      { status: 409, headers: { "content-type": "application/json" } },
    );

  try {
    await assert.rejects(deleteStudio("daylight-studio"), {
      name: "ApiError",
      status: 409,
      code: "STUDIO_HAS_BOOKINGS",
      message: "This studio has booking history",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
