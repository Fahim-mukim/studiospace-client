"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function GoogleAuthButton({
  callbackPath = "/",
  errorCallbackPath = "/login?error=google",
}) {
  const [pending, setPending] = useState(false);

  async function handleGoogleAuth() {
    if (pending) return;
    setPending(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: new URL(callbackPath, window.location.origin).toString(),
        errorCallbackURL: new URL(
          errorCallbackPath,
          window.location.origin,
        ).toString(),
      });

      if (result?.error) {
        toast.error(
          result.error.message ||
            "Google sign-in is unavailable. Please try again later.",
        );
        setPending(false);
      }
    } catch {
      toast.error("Google sign-in could not be started. Please try again.");
      setPending(false);
    }
  }

  return (
    <Button
      className="w-full"
      disabled={pending}
      onClick={handleGoogleAuth}
      type="button"
      variant="outline"
    >
      <span
        aria-hidden="true"
        className="font-semibold text-base text-primary"
      >
        G
      </span>
      {pending ? "Connecting to Google..." : "Continue with Google"}
    </Button>
  );
}
