import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ApiError,
  buildApiUrl,
  normalizeStudio,
} from "../src/lib/api.js";

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
