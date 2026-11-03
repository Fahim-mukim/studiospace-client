import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";
import { BookingPreviewDialog } from "@/components/studios/booking-preview-dialog";
import { StudioGallery } from "@/components/studios/studio-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { featuredStudios, getStudioBySlug } from "@/data/studios";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return featuredStudios.map((studio) => ({ id: studio.slug }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const studio = getStudioBySlug(id);

  return {
    title: studio ? studio.name : "Studio not found",
    description: studio
      ? `${studio.name} is an illustrative ${studio.category.toLowerCase()} listing in ${studio.location}.`
      : "This sample studio listing could not be found.",
  };
}

export default async function StudioDetailsPage({ params }) {
  const { id } = await params;
  const studio = getStudioBySlug(id);

  if (!studio) notFound();

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
              <li aria-current="page" className="max-w-40 truncate font-medium text-foreground">
                {studio.name}
              </li>
            </ol>
          </nav>

          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <Badge className="mb-3" variant="category">
                {studio.category}
              </Badge>
              <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.025em] text-foreground sm:text-6xl">
                {studio.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-4" />
                  {studio.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star
                    aria-hidden="true"
                    className="size-4 fill-current text-primary"
                  />
                  {studio.rating} · {studio.reviewCount} sample reviews
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
            Demonstration detail: listing content, photos, pricing, host
            information, ratings, and sample reviews are illustrative. This is
            not a verified or bookable venue.
          </p>

          <StudioGallery images={studio.gallery} name={studio.name} />

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-12">
            <div className="min-w-0 space-y-10">
              <section aria-labelledby="overview-title">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  A place to make
                </p>
                <h2
                  className="font-display text-3xl leading-tight text-foreground sm:text-4xl"
                  id="overview-title"
                >
                  About this sample space
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                  {studio.overview}
                </p>
              </section>

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
                      {studio.category}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <dt className="text-sm text-muted-foreground">
                      Hourly rate
                    </dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {studio.rate} / hour · sample price
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <dt className="text-sm text-muted-foreground">
                      Illustrative security deposit
                    </dt>
                    <dd className="mt-1 font-medium text-foreground">
                      ${studio.securityDeposit}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <dt className="text-sm text-muted-foreground">
                      Sample capacity
                    </dt>
                    <dd className="mt-1 inline-flex items-center gap-2 font-medium text-foreground">
                      <UsersRound aria-hidden="true" className="size-4" />
                      {studio.capacity}
                    </dd>
                  </div>
                  {studio.specifications.map((specification) => (
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

              <section aria-labelledby="amenities-title">
                <h2
                  className="font-display text-3xl leading-tight text-foreground"
                  id="amenities-title"
                >
                  Amenities
                </h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {studio.amenities.map((amenity) => (
                    <li key={amenity}>
                      <Badge className="px-3 py-1.5" variant="secondary">
                        {amenity}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Sample amenities only; no equipment or service has been
                  verified.
                </p>
              </section>

              <section
                aria-labelledby="host-title"
                className="rounded-3xl border border-border bg-card p-5 sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-lg font-semibold text-secondary-foreground">
                    {studio.host.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                      {studio.host.role}
                    </p>
                    <h2
                      className="mt-1 font-display text-3xl text-foreground"
                      id="host-title"
                    >
                      {studio.host.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {studio.host.bio}
                    </p>
                  </div>
                </div>
              </section>

              <section aria-labelledby="reviews-title">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                      Example feedback
                    </p>
                    <h2
                      className="font-display text-3xl leading-tight text-foreground"
                      id="reviews-title"
                    >
                      Illustrative sample reviews
                    </h2>
                  </div>
                  <Badge variant="outline">Not verified</Badge>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {studio.reviews.map((review) => (
                    <article
                      className="rounded-2xl border border-border bg-card p-5"
                      key={review.name}
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        {review.date}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {review.text}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl text-foreground">
                    {studio.rate}
                  </span>
                  <span className="text-sm text-muted-foreground">/ hour</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Illustrative sample rate
                </p>
                <div className="my-5 space-y-3 border-y border-border py-5 text-sm">
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      Sample capacity
                    </span>
                    <span className="font-medium text-foreground">
                      {studio.capacity}
                    </span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      Illustrative deposit
                    </span>
                    <span className="font-medium text-foreground">
                      ${studio.securityDeposit}
                    </span>
                  </p>
                </div>
                <BookingPreviewDialog studio={studio} />
                <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                  />
                  Preview only. Availability, reservations, and payment are not
                  connected.
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
