import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ADD_STUDIO_SUCCESS_PATH,
  buildStudioPayload,
  buildStudioUpdatePayload,
  EDIT_STUDIO_SUCCESS_PATH,
  getHostInformation,
  getStudioImageUrlError,
} from "../src/lib/add-studio-form.mjs";

test("host details come from the session and are read-only", () => {
  assert.deepEqual(getHostInformation({ name: "Studio Host", email: "host@example.com" }), {
    name: "Studio Host",
    email: "host@example.com",
    readOnly: true,
  });
  assert.deepEqual(getHostInformation({}), {
    name: "",
    email: "",
    readOnly: true,
  });
  assert.deepEqual(getHostInformation(null), {
    name: "",
    email: "",
    readOnly: true,
  });
});

test("studio image URL validation accepts only valid HTTP(S) URLs up to 2048 characters", () => {
  assert.equal(getStudioImageUrlError(" https://images.example.com/studio.jpg "), null);
  assert.equal(getStudioImageUrlError("http://images.example.com/studio.jpg"), null);
  assert.equal(getStudioImageUrlError(""), "Image must be a valid HTTP(S) URL.");
  assert.equal(
    getStudioImageUrlError("javascript:alert(1)"),
    "Image must be a valid HTTP(S) URL.",
  );
  assert.equal(
    getStudioImageUrlError("https://"),
    "Image must be a valid HTTP(S) URL.",
  );
  assert.equal(
    getStudioImageUrlError(`https://example.com/${"a".repeat(2048)}`),
    "Image URL must be 2048 characters or fewer.",
  );
});

test("studio creation payload excludes host identity and server-managed fields", () => {
  const payload = buildStudioPayload(
    {
      title: "  Photo Studio  ",
      categorySlug: "photo-studios",
      hourlyRate: "75",
      securityDeposit: "100",
      capacity: "8",
      location: " Brooklyn ",
      image: " https://images.example.com/studio.jpg ",
      imageAlt: " Bright studio ",
      overview: "A welcoming photography studio with natural light.",
      ownerId: "untrusted-owner",
      ownerEmail: "untrusted@example.com",
      hostName: "Untrusted host",
    },
    ["Natural light"],
  );

  assert.deepEqual(payload, {
    title: "Photo Studio",
    categorySlug: "photo-studios",
    hourlyRate: 75,
    securityDeposit: 100,
    capacity: 8,
    location: "Brooklyn",
    image: "https://images.example.com/studio.jpg",
    amenities: ["Natural light"],
    overview: "A welcoming photography studio with natural light.",
    imageAlt: "Bright studio",
  });
});

test("add and edit success redirects go to My Listings", () => {
  assert.equal(ADD_STUDIO_SUCCESS_PATH, "/my-listings");
  assert.equal(EDIT_STUDIO_SUCCESS_PATH, "/my-listings");
});

test("studio update payload excludes host identity and server-managed fields", () => {
  const payload = buildStudioUpdatePayload(
    {
      title: " Updated Studio ",
      categorySlug: "photo-studios",
      hourlyRate: "90",
      securityDeposit: "125",
      capacity: "6",
      location: " Queens ",
      image: " https://images.example.com/updated.jpg ",
      imageAlt: "",
      overview: "An updated studio overview with adequate descriptive detail.",
      ownerId: "untrusted-owner",
      ownerEmail: "untrusted@example.com",
      hostName: "Untrusted host",
    },
    ["Cyclorama"],
  );

  assert.deepEqual(payload, {
    title: "Updated Studio",
    categorySlug: "photo-studios",
    hourlyRate: 90,
    securityDeposit: 125,
    capacity: 6,
    location: "Queens",
    image: "https://images.example.com/updated.jpg",
    amenities: ["Cyclorama"],
    overview: "An updated studio overview with adequate descriptive detail.",
    imageAlt: "",
  });
});
