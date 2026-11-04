"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function LoginForm({
  oauthError = false,
  registered = false,
  returnTo = "/",
}) {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (registered) toast.success("Account created. Sign in to continue.");
    if (oauthError) {
      toast.error("Google sign-in could not be completed. Please try again.");
    }
    if (registered || oauthError) {
      router.replace(
        returnTo === "/"
          ? "/login"
          : `/login?returnTo=${encodeURIComponent(returnTo)}`,
        { scroll: false },
      );
    }
  }, [oauthError, registered, returnTo, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;

    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!password) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Check the highlighted fields and try again.");
      return;
    }

    setPending(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (result?.error) {
        toast.error(
          result.error.message || "Login failed. Check your email and password.",
        );
        return;
      }
      await refetch();
      toast.success("Welcome back.");
      router.replace(returnTo);
      router.refresh();
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      {oauthError ? (
        <p
          className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          Google sign-in could not be completed. Try again or use your email.
        </p>
      ) : null}
      <GoogleAuthButton
        callbackPath={returnTo}
        errorCallbackPath={`/login?error=google&returnTo=${encodeURIComponent(returnTo)}`}
      />
      <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or login with email</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            autoComplete="email"
            id="login-email"
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
          {errors.email ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              autoComplete="current-password"
              className="pr-12"
              id="login-password"
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              placeholder="Your password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <Button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-1.5 -translate-y-1/2"
              onClick={() => setShowPassword((current) => !current)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </Button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.password}
            </p>
          ) : null}
        </div>

        <Button className="w-full" disabled={pending} type="submit">
          {pending ? "Logging you in..." : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to StudioSpace?{" "}
        <Link
          className="font-semibold text-primary underline-offset-4 hover:underline"
          href="/register"
          prefetch={false}
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
