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

function validateRegistration({ name, email, photoURL, password }) {
  const errors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhotoURL = photoURL.trim();

  if (!trimmedName || trimmedName.length > 100) {
    errors.name = "Enter your name (up to 100 characters).";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }
  if (trimmedPhotoURL) {
    try {
      const imageUrl = new URL(trimmedPhotoURL);
      if (!["http:", "https:"].includes(imageUrl.protocol)) {
        errors.photoURL = "Use an HTTP(S) photo URL.";
      }
    } catch {
      errors.photoURL = "Enter a valid photo URL.";
    }
  }
  if (password.length < 6 || password.length > 128) {
    errors.password = "Use between 6 and 128 characters.";
  } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    errors.password =
      "Include at least one uppercase and one lowercase letter.";
  }
  return errors;
}

export function RegisterForm({ oauthError = false }) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: "",
    email: "",
    photoURL: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!oauthError) return;
    toast.error("Google sign-up could not be completed. Please try again.");
    router.replace("/register", { scroll: false });
  }, [oauthError, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Check the highlighted fields and try again.");
      return;
    }

    setPending(true);
    try {
      const result = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        ...(values.photoURL.trim() ? { image: values.photoURL.trim() } : {}),
      });
      if (result?.error) {
        toast.error(
          result.error.message ||
            "Registration failed. Check your details and try again.",
        );
        return;
      }
      router.replace("/login?registered=1");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <div>
      {oauthError ? (
        <p
          className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          Google sign-up could not be completed. Try again or register with
          email.
        </p>
      ) : null}
      <GoogleAuthButton errorCallbackPath="/register?error=google" />
      <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or register with email</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="register-name">Name</Label>
          <Input
            autoComplete="name"
            autoCapitalize="words"
            id="register-name"
            maxLength={100}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Your name"
            required
            value={values.name}
          />
          {errors.name ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <Input
            autoComplete="email"
            id="register-email"
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={values.email}
          />
          {errors.email ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-photo">Photo URL (optional)</Label>
          <Input
            autoComplete="url"
            id="register-photo"
            onChange={(event) => updateField("photoURL", event.target.value)}
            placeholder="https://example.com/your-photo.jpg"
            type="url"
            value={values.photoURL}
          />
          {errors.photoURL ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.photoURL}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <Input
              autoComplete="new-password"
              className="pr-12"
              id="register-password"
              maxLength={128}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Create a password"
              required
              type={showPassword ? "text" : "password"}
              value={values.password}
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
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className={values.password.length >= 6 ? "text-success" : ""}>
              At least 6 characters
            </li>
            <li className={/[A-Z]/.test(values.password) ? "text-success" : ""}>
              At least one uppercase letter
            </li>
            <li className={/[a-z]/.test(values.password) ? "text-success" : ""}>
              At least one lowercase letter
            </li>
          </ul>
          {errors.password ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.password}
            </p>
          ) : null}
        </div>

        <Button className="w-full" disabled={pending} type="submit">
          {pending ? "Creating your account..." : "Register"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="font-semibold text-primary underline-offset-4 hover:underline"
          href="/login"
          prefetch={false}
        >
          Login
        </Link>
      </p>
    </div>
  );
}
