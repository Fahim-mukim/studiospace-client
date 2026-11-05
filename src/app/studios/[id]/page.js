import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";
import { BookingDialog } from "@/components/studios/booking-dialog";
import { StudioGallery } from "@/components/studios/studio-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getStudioById } from "@/lib/api";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const { studio } = await getStudioById(id);
    if (!studio) {
      return {
        title: "Studio not found",
        description: "The requested studio listing could not be found.",
      };
    }

    const displayName = studio.name || studio.title || "Studio";
    return {
      title: `${displayName} | StudioSpace`,
      description:
        studio.overview ||
        `${displayName} is a creative workspace in ${studio.location || "a premier location"}.`,
    };
  } catch {
    return {
      title: "Studio details | StudioSpace",
      description: "Creative workspace listing on StudioSpace.",
    };
  }
}

export default async function StudioDetailsPage({ params }) {
  const { id } = await params;

  let studio = null;
  let apiError = null;

  try {
    const result = await getStudioById(id, { cache: "no-store" });
    studio = result.studio;
  } catch (err) {
    if (
      err.status === 404 ||
      err.code === "NOT_FOUND" ||
      err.code === "STUDIO_NOT_FOUND"
    ) {
      notFound();
    }
    apiError =
      err.message ||
      "Unable to connect to the StudioSpace API. Ensure the server is running.";
  }

  if (!studio && !apiError) {
    notFound();
  }

  if (apiError) {
    return (
      <>
        <SiteHeader />
        <main className="flex flex-1 items-center py-20 sm:py-28">
          <Container>
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
                <AlertCircle className="size-7" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-destructive">
                Service Unavailable
              </p>
              <h1 className="font-display text-4xl text-foreground sm:text-5xl">
                Unable to load studio
              </h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                {apiError}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link href={`/studios/${id}`}>
                    <RotateCcw className="size-4" />
                    Try again
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/studios">
                    <ArrowLeft className="size-4" />
                    Back to studios
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </main>
        <SiteFooter />
      </>
    );
  }

  const displayName = studio.name || studio.title || "Untitled Studio";
  const displayLocation = studio.location || "Location not specified";
  const displayCategory = studio.category || "Creative Space";
  const displayRating =
    studio.rating !== undefined && studio.rating !== null && studio.rating !== ""
      ? studio.rating
      : "New";
  const displayReviews =
    typeof studio.reviewCount === "number" ? studio.reviewCount : 0;
  const displayCapacity =
    typeof studio.capacity === "number"
      ? `Up to ${studio.capacity}`
      : studio.capacity || "Flexible";
  const displayRate =
    studio.rate ||
    (studio.hourlyRate !== undefined ? `$${studio.hourlyRate}` : "$0");

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-20 pt-9 sm:pt-12">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-7">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link className="transition-colors hover:text-foreground" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-foreground"
                  href="/studios"
                >
                  Explore Studios
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li
                aria-current="page"
                className="max-w-40 truncate font-medium text-foreground sm:max-w-xs"
              >
                {displayName}
              </li>
            </ol>
          </nav>

          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <Badge className="mb-3" variant="category">
                {displayCategory}
              </Badge>
              <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.025em] text-foreground sm:text-6xl">
                {displayName}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-4" />
                  {displayLocation}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star
                    aria-hidden="true"
                    className="size-4 fill-current text-primary"
                  />
                  {displayRating} · {displayReviews}{" "}
                  {displayReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>
            <Button asChild className="w-fit" variant="outline">
              <Link href="/studios">
                <ArrowLeft aria-hidden="true" />
                Back to studios
              </Link>
            </Button>
          </div>

          <p className="mb-5 rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm leading-6 text-secondary-foreground">
            Live studio listing powered by the StudioSpace API. Booking
            requests can be submitted, but availability, host confirmation, and
            payment processing are not currently available.
          </p>

          <StudioGallery images={studio.gallery} name={displayName} />

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-12">
            <div className="min-w-0 space-y-10">
              {/* Overview / About */}
              <section aria-labelledby="overview-title">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  A place to make
                </p>
                <h2
                  className="font-display text-3xl leading-tight text-foreground sm:text-4xl"
                  id="overview-title"
                >
                  About this creative space
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                  {studio.overview || "No overview provided for this studio."}
                </p>
              </section>

              {/* Space details */}
              <section aria-labelledby="specifications-title">
                <h2
                  className="font-display text-3xl leading-tight text-foreground"
                  id="specifications-title"
                >
                  Space details
                </h2>
                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <dt className="text-sm text-muted-foreground">Category</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {displayCategory}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <dt className="text-sm text-muted-foreground">Hourly rate</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {displayRate} / hour
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <dt className="text-sm text-muted-foreground">
                      Security deposit
                    </dt>
                    <dd className="mt-1 font-medium text-foreground">
                      ${studio.securityDeposit ?? 0}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <dt className="text-sm text-muted-foreground">Capacity</dt>
                    <dd className="mt-1 inline-flex items-center gap-2 font-medium text-foreground">
                      <UsersRound aria-hidden="true" className="size-4" />
                      {displayCapacity}
                    </dd>
                  </div>
                  {Array.isArray(studio.specifications) &&
                    studio.specifications.map((specification) => (
                      <div
                        className="rounded-2xl border border-border bg-card p-4"
                        key={specification.label}
                      >
                        <dt className="text-sm text-muted-foreground">
                          {specification.label}
                        </dt>
                        <dd className="mt-1 font-medium text-foreground">
                          {specification.value}
                        </dd>
                      </div>
                    ))}
                </dl>
              </section>

              {/* Amenities */}
              <section aria-labelledby="amenities-title">
                <h2
                  className="font-display text-3xl leading-tight text-foreground"
                  id="amenities-title"
                >
                  Amenities
                </h2>
                {Array.isArray(studio.amenities) && studio.amenities.length > 0 ? (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {studio.amenities.map((amenity) => (
                      <li key={amenity}>
                        <Badge className="px-3 py-1.5" variant="secondary">
                          {amenity}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No amenities specified for this studio.
                  </p>
                )}
              </section>

              {/* Host section */}
              {studio.host && (
                <section
                  aria-labelledby="host-title"
                  className="rounded-3xl border border-border bg-card p-5 sm:p-7"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-lg font-semibold text-secondary-foreground">
                      {studio.host.name?.charAt(0) || "H"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                        {studio.host.role || "Host"}
                      </p>
                      <h2
                        className="mt-1 font-display text-3xl text-foreground"
                        id="host-title"
                      >
                        {studio.host.name || "StudioSpace Host"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {studio.host.bio || "Welcoming host on StudioSpace."}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Reviews section */}
              <section aria-labelledby="reviews-title">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                      Guest feedback
                    </p>
                    <h2
                      className="font-display text-3xl leading-tight text-foreground"
                      id="reviews-title"
                    >
                      Reviews
                    </h2>
                  </div>
                  <Badge variant="outline">
                    {displayReviews}{" "}
                    {displayReviews === 1 ? "review" : "reviews"}
                  </Badge>
                </div>

                {Array.isArray(studio.reviews) && studio.reviews.length > 0 ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {studio.reviews.map((review) => (
                      <article
                        className="rounded-2xl border border-border bg-card p-5"
                        key={review.name || review.id}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-medium text-foreground">
                            {review.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Star
                              aria-hidden="true"
                              className="size-3.5 fill-current text-primary"
                            />
                            {review.rating}
                          </span>
                        </div>
                        {review.date && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {review.date}
                          </p>
                        )}
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {review.text}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No reviews yet for this workspace. Be the first to share your
                      creative experience.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar with booking request */}
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl text-foreground">
                    {displayRate}
                  </span>
                  <span className="text-sm text-muted-foreground">/ hour</span>
                </div>
                <div className="my-5 space-y-3 border-y border-border py-5 text-sm">
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium text-foreground">
                      {displayCapacity}
                    </span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Deposit</span>
                    <span className="font-medium text-foreground">
                      ${studio.securityDeposit ?? 0}
                    </span>
                  </p>
                </div>
                <BookingDialog studio={studio} />
                <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                  />
                  Requests are saved as Pending. Host confirmation and payment
                  processing are not currently available.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
