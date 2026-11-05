import { getSafeReturnTo } from "./safe-return-to.js";

export function getGoogleAuthCallbacks(mode, returnTo = "/") {
  const callbackPath = mode === "login" ? getSafeReturnTo(returnTo) : "/";
  const errorCallbackPath =
    mode === "login"
      ? `/login?error=google&returnTo=${encodeURIComponent(callbackPath)}`
      : "/register?error=google";

  return { callbackPath, errorCallbackPath };
}

export function getGoogleButtonState(readiness) {
  if (readiness === "checking") return "checking";
  if (readiness === "available") return "available";
  if (readiness === "unavailable") return "unavailable";
  return "error";
}

export function getGoogleInitiationErrorMessage(result) {
  if (typeof result?.error?.message === "string" && result.error.message.trim()) {
    return result.error.message;
  }
  return "Google sign-in could not be started. Please try again.";
}

export async function initiateGoogleSignIn({
  signIn,
  mode,
  returnTo = "/",
  origin,
  setPending,
  onError,
}) {
  setPending(true);
  try {
    const { callbackPath, errorCallbackPath } = getGoogleAuthCallbacks(
      mode,
      returnTo,
    );
    const result = await signIn({
      provider: "google",
      callbackURL: new URL(callbackPath, origin).toString(),
      errorCallbackURL: new URL(errorCallbackPath, origin).toString(),
    });

    if (result?.error || !result?.data?.url) {
      onError(getGoogleInitiationErrorMessage(result));
      return false;
    }

    return true;
  } catch {
    onError(getGoogleInitiationErrorMessage(null));
    return false;
  } finally {
    setPending(false);
  }
}
