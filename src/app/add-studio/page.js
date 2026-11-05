"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStudio } from "@/lib/api";
import {
  ADD_STUDIO_SUCCESS_PATH,
  buildStudioPayload,
  getHostInformation,
  getStudioImageUrlError,
} from "@/lib/add-studio-form.mjs";
import { authClient } from "@/lib/auth-client";

const CATEGORY_OPTIONS = [
  { value: "photo-studios", label: "Photo Studios" },
  { value: "sound-stages", label: "Sound Stages" },
  { value: "podcast-rooms", label: "Podcast Rooms" },
  { value: "music-suites", label: "Music Suites" },
  { value: "art-workshops", label: "Art Workshops" },
];

function validateForm(values, amenities) {
  const errors = {};

  if (typeof values.title !== "string") {
    errors.title = "Title is required.";
  } else {
    const title = values.title.trim();
    if (title.length < 3 || title.length > 100) {
      errors.title = "Title must be between 3 and 100 characters.";
    }
  }

  if (!CATEGORY_OPTIONS.some((option) => option.value === values.categorySlug)) {
    errors.categorySlug = "Select a valid category.";
  }

  const hourlyRate = Number(values.hourlyRate);
  if (
    values.hourlyRate === "" ||
    values.hourlyRate === null ||
    values.hourlyRate === undefined ||
    !Number.isFinite(hourlyRate) ||
    hourlyRate <= 0
  ) {
    errors.hourlyRate = "Hourly rate must be a positive number.";
  }

  const securityDeposit = Number(values.securityDeposit);
  if (
    values.securityDeposit === "" ||
    values.securityDeposit === null ||
    values.securityDeposit === undefined ||
    !Number.isFinite(securityDeposit) ||
    securityDeposit < 0
  ) {
    errors.securityDeposit = "Security deposit must be a non-negative number.";
  }

  const capacity = Number(values.capacity);
  if (
    values.capacity === "" ||
    values.capacity === null ||
    values.capacity === undefined ||
    !Number.isFinite(capacity) ||
    !Number.isInteger(capacity) ||
    capacity < 1
  ) {
    errors.capacity = "Capacity must be a positive integer.";
  }

  if (typeof values.location !== "string") {
    errors.location = "Location is required.";
  } else {
    const location = values.location.trim();
    if (location.length < 2 || location.length > 160) {
      errors.location = "Location must be between 2 and 160 characters.";
    }
  }

  const imageError = getStudioImageUrlError(values.image);
  if (imageError) errors.image = imageError;

  if (typeof values.imageAlt === "string" && values.imageAlt.trim().length > 250) {
    errors.imageAlt = "Image alt text must be 250 characters or fewer.";
  }

  const cleanedAmenities = amenities
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);

  if (cleanedAmenities.length < 1) {
    errors.amenities = "Add at least one amenity.";
  } else if (cleanedAmenities.length > 20) {
    errors.amenities = "You can add up to 20 amenities.";
  } else {
    for (const amenity of cleanedAmenities) {
      if (amenity.length > 80) {
        errors.amenities = "Each amenity must be 80 characters or fewer.";
        break;
      }
    }
  }

  if (typeof values.overview !== "string") {
    errors.overview = "Overview is required.";
  } else {
    const overview = values.overview.trim();
    if (overview.length < 30 || overview.length > 2000) {
      errors.overview = "Overview must be between 30 and 2000 characters.";
    }
  }

  return { errors, cleanedAmenities };
}

export default function AddStudioPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user ?? null;
  const hostInformation = getHostInformation(user);

  const [values, setValues] = useState({
    title: "",
    categorySlug: "",
    hourlyRate: "",
    securityDeposit: "",
    capacity: "",
    location: "",
    image: "",
    imageAlt: "",
    overview: "",
  });
  const [amenities, setAmenities] = useState([""]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateAmenity(index, value) {
    setAmenities((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
    setErrors((current) => ({ ...current, amenities: undefined }));
  }

  function addAmenity() {
    setAmenities((current) => {
      if (current.length >= 20) return current;
      return [...current, ""];
    });
    setErrors((current) => ({ ...current, amenities: undefined }));
  }

  function removeAmenity(index) {
    setAmenities((current) => {
      if (current.length === 1) return [""];
      return current.filter((_, i) => i !== index);
    });
    setErrors((current) => ({ ...current, amenities: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const { errors: nextErrors, cleanedAmenities } = validateForm(
      values,
      amenities,
    );
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields and try again.");
      return;
    }

    if (!user) {
      toast.error("Please log in to add a studio.");
      router.push(
        `/login?returnTo=${encodeURIComponent("/add-studio")}`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildStudioPayload(values, cleanedAmenities);
      await createStudio(payload);
      toast.success("Studio created successfully!");
      router.push(ADD_STUDIO_SUCCESS_PATH);
    } catch (error) {
      const message =
        error?.message || "Failed to create studio. Please try again.";
      toast.error(message);
      setErrors((current) => ({ ...current, form: message }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-16 pt-8 sm:pt-10">
        <Container>
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/studios">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back to studios
              </Link>
            </Button>
          </div>

          <div className="mx-auto max-w-3xl">
            <header className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Host your space
              </p>
              <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
                Add a studio
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Share your creative space with the StudioSpace community. Fill
                in the details below.
              </p>
            </header>

            {sessionPending ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Checking your session...
              </div>
            ) : !user ? (
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  You need to be logged in to add a studio.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/login?returnTo=%2Fadd-studio">Log in</Link>
                </Button>
              </div>
            ) : (
              <form
                className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
                noValidate
                onSubmit={handleSubmit}
              >
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Host information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    These details come from your signed-in account and cannot
                    be edited here.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="host-name">Host name</Label>
                      <Input
                        id="host-name"
                        autoComplete="name"
                        readOnly={hostInformation.readOnly}
                        value={hostInformation.name}
                        className="read-only:cursor-text read-only:bg-muted/40 read-only:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="host-email">Host email</Label>
                      <Input
                        id="host-email"
                        type="email"
                        autoComplete="email"
                        readOnly={hostInformation.readOnly}
                        value={hostInformation.email}
                        className="read-only:cursor-text read-only:bg-muted/40 read-only:text-muted-foreground"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Basic information
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="title">Studio title *</Label>
                      <Input
                        id="title"
                        maxLength={100}
                        onChange={(event) =>
                          updateField("title", event.target.value)
                        }
                        placeholder="e.g., Daylight Photo Studio"
                        value={values.title}
                      />
                      {errors.title ? (
                        <p className="text-xs text-destructive" role="alert">
                          {errors.title}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="categorySlug">Category *</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        id="categorySlug"
                        onChange={(event) =>
                          updateField("categorySlug", event.target.value)
                        }
                        value={values.categorySlug}
                      >
                        <option value="">Select a category</option>
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.categorySlug ? (
                        <p className="text-xs text-destructive" role="alert">
                          {errors.categorySlug}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly rate ($) *</Label>
                      <Input
                        id="hourlyRate"
                        inputMode="decimal"
                        min="0"
                        onChange={(event) =>
                          updateField("hourlyRate", event.target.value)
                        }
                        placeholder="95"
                        type="number"
                        value={values.hourlyRate}
                      />
                      {errors.hourlyRate ? (
                        <p className="text-xs text-destructive" role="alert">
                          {errors.hourlyRate}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="securityDeposit">
                        Security deposit ($) *
                      </Label>
                      <Input
                        id="securityDeposit"
                        inputMode="decimal"
                        min="0"
                        onChange={(event) =>
                          updateField("securityDeposit", event.target.value)
                        }
                        placeholder="150"
                        type="number"
                        value={values.securityDeposit}
                      />
                      {errors.securityDeposit ? (
                        <p className="text-xs text-destructive" role="alert">
                          {errors.securityDeposit}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity (guests) *</Label>
                      <Input
                        id="capacity"
                        inputMode="numeric"
                        min="1"
                        onChange={(event) =>
                          updateField("capacity", event.target.value)
                        }
                        placeholder="8"
                        type="number"
                        value={values.capacity}
                      />
                      {errors.capacity ? (
                        <p className="text-xs text-destructive" role="alert">
                          {errors.capacity}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        maxLength={160}
                        onChange={(event) =>
                          updateField("location", event.target.value)
                        }
                        placeholder="Brooklyn, New York"
                        value={values.location}
                      />
                      {errors.location ? (
                        <p className="text-xs text-destructive" role="alert">
                          {errors.location}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Media
                  </h2>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="image">Cover image URL *</Label>
                      <Input
                        id="image"
                        maxLength={2048}
                        onChange={(event) =>
                          updateField("image", event.target.value)
                        }
                        placeholder="https://images.example.com/studio.jpg"
                        type="url"
                        value={values.image}
                      />
                      {errors.image ? (
                        <p className="text-xs text-destructive" role="alert">
                          {errors.image}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageAlt">Image alt text (optional)</Label>
                      <Input
                        id="imageAlt"
                        maxLength={250}
                        onChange={(event) =>
                          updateField("imageAlt", event.target.value)
                        }
                        placeholder="A bright photography studio"
                        value={values.imageAlt}
                      />
                      {errors.imageAlt ? (
                        <p className="text-xs text-destructive" role="alert">
                          {errors.imageAlt}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                      Amenities *
                    </h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAmenity}
                      disabled={amenities.length >= 20}
                    >
                      <Plus className="size-4" />
                      Add amenity
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={amenity}
                          onChange={(event) =>
                            updateAmenity(index, event.target.value)
                          }
                          placeholder="e.g., Natural light"
                          maxLength={80}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAmenity(index)}
                          aria-label="Remove amenity"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {errors.amenities ? (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.amenities}
                    </p>
                  ) : null}
                </section>

                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Description
                  </h2>
                  <div className="space-y-2">
                    <Label htmlFor="overview">Overview *</Label>
                    <textarea
                      id="overview"
                      className="flex min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      maxLength={2000}
                      onChange={(event) =>
                        updateField("overview", event.target.value)
                      }
                      placeholder="Describe your space, features, and ideal use cases (minimum 30 characters)."
                      value={values.overview}
                    />
                    <p className="text-xs text-muted-foreground">
                      {values.overview.trim().length}/2000 characters (minimum
                      30)
                    </p>
                    {errors.overview ? (
                      <p className="text-xs text-destructive" role="alert">
                        {errors.overview}
                      </p>
                    ) : null}
                  </div>
                </section>

                {errors.form ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.form}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create studio"}
                  </Button>
                  <Button asChild variant="outline" disabled={submitting}>
                    <Link href="/studios">Cancel</Link>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
