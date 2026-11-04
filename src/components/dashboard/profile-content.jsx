"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, UserRound } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function getInitials(user) {
  const name = typeof user?.name === "string" ? user.name.trim() : "";
  const email = typeof user?.email === "string" ? user.email.trim() : "";
  const words = (name || email || "StudioSpace").split(/[\s@._-]+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function isHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function ProfileContent() {
  const { data: session, isPending: sessionPending, refetch } = authClient.useSession();
  const user = session?.user ?? null;
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [imageInput, setImageInput] = useState(user?.image || "");
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  const values = { name: nameInput, image: imageInput };

  function updateField(field, value) {
    if (field === "name") setNameInput(value);
    if (field === "image") setImageInput(value);
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;

    const nextErrors = {};
    const trimmedName = values.name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      nextErrors.name = "Enter your name (up to 100 characters).";
    }
    if (values.image.trim() && !isHttpUrl(values.image)) {
      nextErrors.image = "Use a valid HTTP(S) photo URL.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Check the highlighted fields and try again.");
      return;
    }

    setPending(true);
    try {
      const result = await authClient.updateUser({
        name: trimmedName,
        ...(values.image.trim() ? { image: values.image.trim() } : { image: "" }),
      });
      if (result?.error) {
        toast.error(result.error.message || "Failed to update profile.");
        return;
      }
      await refetch();
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-16 pt-8 sm:pt-10">
        <Container>
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="mx-auto max-w-2xl">
            <header className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Your account
              </p>
              <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
                Profile
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Update your personal information.
              </p>
            </header>

            <div className="mb-6 flex items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-secondary text-lg font-semibold text-secondary-foreground">
                {user?.image ? (
                  <img alt={user.name || "User avatar"} className="h-full w-full object-cover" src={user.image} />
                ) : (
                  getInitials(user)
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email || "—"}</p>
              </div>
            </div>

            <form key={user?.id || "profile"} className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8" noValidate onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="profile-name">Name</Label>
                <Input
                  id="profile-name"
                  maxLength={100}
                  onChange={(event) => updateField("name", event.target.value)}
                  value={values.name}
                />
                {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-image">Profile photo URL</Label>
                <Input
                  id="profile-image"
                  onChange={(event) => updateField("image", event.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  type="url"
                  value={values.image}
                />
                {errors.image ? <p className="text-xs text-destructive">{errors.image}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" disabled value={user?.email || ""} />
                <p className="text-xs text-muted-foreground">Email cannot be changed from this page.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={pending || sessionPending}>
                  {pending ? "Saving..." : "Save changes"}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
