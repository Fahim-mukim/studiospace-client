import assert from "node:assert/strict";
import { test } from "node:test";
import { getSafeReturnTo } from "../src/lib/safe-return-to.js";

test("getSafeReturnTo accepts valid relative paths", () => {
  assert.equal(getSafeReturnTo("/studios"), "/studios");
  assert.equal(getSafeReturnTo("/studios?category=photo-studios"), "/studios?category=photo-studios");
  assert.equal(getSafeReturnTo("/dashboard"), "/dashboard");
  assert.equal(getSafeReturnTo("/add-studio"), "/add-studio");
  assert.equal(getSafeReturnTo("/"), "/");
});

test("getSafeReturnTo rejects external and protocol-relative URLs", () => {
  assert.equal(getSafeReturnTo("https://example.com"), "/");
  assert.equal(getSafeReturnTo("http://example.com/test"), "/");
  assert.equal(getSafeReturnTo("//example.com"), "/");
  assert.equal(getSafeReturnTo("//example.com/login"), "/");
  assert.equal(getSafeReturnTo("/\\example.com"), "/");
  assert.equal(getSafeReturnTo("\\example.com"), "/");
});

test("getSafeReturnTo rejects control characters and invalid inputs", () => {
  assert.equal(getSafeReturnTo("/path\u0000with-null"), "/");
  assert.equal(getSafeReturnTo("/path\nwith-newline"), "/");
  assert.equal(getSafeReturnTo(null), "/");
  assert.equal(getSafeReturnTo(undefined), "/");
  assert.equal(getSafeReturnTo(12345), "/");
  assert.equal(getSafeReturnTo({}), "/");
  assert.equal(getSafeReturnTo(""), "/");
});
