"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  getGoogleAuthCallbacks,
  getGoogleButtonState,
  initiateGoogleSignIn,
} from "@/lib/google-auth-flow.mjs";
import { toast } from "sonner";

export function GoogleAuthButton({ mode = "register", returnTo = "/" }) {
  const [readiness, setReadiness] = useState("checking");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/google-status", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Google sign-in availability could not be checked.");
        }
        return response.json();
      })
      .then((status) => {
        if (!active) return;
        if (status?.configured === true) {
          setReadiness("available");
          return;
        }
        setReadiness("unavailable");
        toast.info("Google sign-in is not configured. Please use email instead.");
      })
      .catch(() => {
        if (!active) return;
        setReadiness("error");
        toast.error(
          "Could not check Google sign-in availability. Please use email or reload.",
        );
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleGoogleAuth() {
    if (pending || getGoogleButtonState(readiness) !== "available") return;
    await initiateGoogleSignIn({
      signIn: (options) => authClient.signIn.social(options),
      mode,
      returnTo,
      origin: window.location.origin,
      setPending,
      onError: (message) => toast.error(message),
    });
  }

  const buttonState = getGoogleButtonState(readiness);
  if (buttonState === "unavailable") {
    return (
      <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground" role="status">
        Google sign-in is not configured. Please use email instead.
      </p>
    );
  }
  if (buttonState === "error") {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive" role="alert">
        Google sign-in availability could not be checked. Please use email or reload.
      </p>
    );
  }

  return (
    <Button
      className="w-full"
      disabled={pending || buttonState === "checking"}
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
      {buttonState === "checking"
        ? "Checking Google sign-in..."
        : pending
          ? "Connecting to Google..."
          : "Continue with Google"}
    </Button>
  );
}
