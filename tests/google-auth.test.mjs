import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getGoogleAuthCallbacks,
  getGoogleButtonState,
  getGoogleInitiationErrorMessage,
  initiateGoogleSignIn,
} from "../src/lib/google-auth-flow.mjs";
import {
  createGoogleProviderReadinessResponse,
  getGoogleProviderReadiness,
  isGoogleProviderConfigured,
} from "../src/lib/google-provider-readiness.mjs";

test("Google provider readiness requires both credentials", () => {
  assert.equal(isGoogleProviderConfigured("client-id", "client-secret"), true);
  assert.equal(isGoogleProviderConfigured("", ""), false);
  assert.equal(isGoogleProviderConfigured(" ", "client-secret"), false);
  assert.equal(isGoogleProviderConfigured("client-id", "  "), false);
  assert.equal(isGoogleProviderConfigured("client-id", ""), false);
  assert.equal(isGoogleProviderConfigured("", "client-secret"), false);
});

test("provider-readiness response exposes only a boolean", async () => {
  const response = createGoogleProviderReadinessResponse({
    GOOGLE_CLIENT_ID: "private-client-id",
    GOOGLE_CLIENT_SECRET: "private-client-secret",
    BETTER_AUTH_SECRET: "private-auth-secret",
    MONGODB_URI: "private-mongodb-uri",
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { configured: true });

  const unavailable = getGoogleProviderReadiness({
    GOOGLE_CLIENT_ID: "client-id",
  });
  assert.deepEqual(unavailable, { configured: false });
});

test("Google button state is unavailable until readiness confirms credentials", () => {
  assert.equal(getGoogleButtonState("checking"), "checking");
  assert.equal(getGoogleButtonState("unavailable"), "unavailable");
  assert.equal(getGoogleButtonState("error"), "error");
  assert.equal(getGoogleButtonState("available"), "available");
});

test("login and registration use the intended Google callback destinations", () => {
  assert.deepEqual(getGoogleAuthCallbacks("login", "/my-bookings"), {
    callbackPath: "/my-bookings",
    errorCallbackPath: "/login?error=google&returnTo=%2Fmy-bookings",
  });
  assert.deepEqual(getGoogleAuthCallbacks("login", "//attacker.example"), {
    callbackPath: "/",
    errorCallbackPath: "/login?error=google&returnTo=%2F",
  });
  assert.deepEqual(getGoogleAuthCallbacks("register", "/my-bookings"), {
    callbackPath: "/",
    errorCallbackPath: "/register?error=google",
  });
});

test("Google initiation failures return a clear safe message", () => {
  assert.equal(
    getGoogleInitiationErrorMessage({
      error: { message: "OAuth provider is not configured." },
    }),
    "OAuth provider is not configured.",
  );
  assert.equal(
    getGoogleInitiationErrorMessage({}),
    "Google sign-in could not be started. Please try again.",
  );
});

test("Google button initiation reports errors and always resets its loading state", async () => {
  let pending = false;
  const errors = [];
  const result = await initiateGoogleSignIn({
    signIn: async () => ({ error: { message: "OAuth initiation failed." } }),
    mode: "login",
    returnTo: "/my-bookings",
    origin: "https://client.example",
    setPending: (value) => {
      pending = value;
    },
    onError: (message) => errors.push(message),
  });

  assert.equal(result, false);
  assert.equal(pending, false);
  assert.deepEqual(errors, ["OAuth initiation failed."]);
});

test("Google button initiation handles network errors and resets loading state", async () => {
  let pending = false;
  const errors = [];
  const result = await initiateGoogleSignIn({
    signIn: async () => {
      throw new Error("Network failure");
    },
    mode: "register",
    origin: "https://client.example",
    setPending: (value) => {
      pending = value;
    },
    onError: (message) => errors.push(message),
  });

  assert.equal(result, false);
  assert.equal(pending, false);
  assert.deepEqual(errors, [
    "Google sign-in could not be started. Please try again.",
  ]);
});

test("Google button initiation sends only the expected callback parameters", async () => {
  let pending = false;
  let request;
  const result = await initiateGoogleSignIn({
    signIn: async (options) => {
      request = options;
      return { data: { url: "https://accounts.google.com/oauth", redirect: true } };
    },
    mode: "login",
    returnTo: "/my-listings",
    origin: "https://client.example",
    setPending: (value) => {
      pending = value;
    },
    onError: () => assert.fail("Successful initiation must not report an error"),
  });

  assert.equal(result, true);
  assert.equal(pending, false);
  assert.deepEqual(request, {
    provider: "google",
    callbackURL: "https://client.example/my-listings",
    errorCallbackURL:
      "https://client.example/login?error=google&returnTo=%2Fmy-listings",
  });
});
