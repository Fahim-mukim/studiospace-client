import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  BadgeCheck,
  Clapperboard,
  Headset,
  ShieldCheck,
  MapPin,
  Mic2,
  Music2,
  Search,
  UsersRound,
  Wrench,
} from "lucide-react";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { StudioCard } from "@/components/home/studio-card";
import { Container } from "@/components/container";
import { SectionHeader } from "@/components/section-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  bookingSteps,
  hostAssurances,
  studioCategories,
} from "@/data/homepage";
import { getStudios } from "@/lib/api";

export const metadata = {
  title: "Creative studio spaces for every idea",
  description:
    "Discover distinctive spaces for photography, film, podcasts, music, and creative gatherings.",
};

const categoryIcons = {
  "photo-studios": Camera,
  "sound-stages": Clapperboard,
  "podcast-rooms": Mic2,
  "music-suites": Music2,
  "art-workshops": UsersRound,
};

function FeaturedStudiosFallback() {
  return (
    <div
      aria-label="Loading featured studios"
      aria-live="polite"
      className="mt-9 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12"
      role="status"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div aria-hidden="true" className="animate-pulse" key={index}>
          <div className="aspect-[1.22] rounded-[1.4rem] bg-muted" />
          <div className="mt-4 h-5 w-2/3 rounded bg-muted" />
          <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
          <div className="mt-3 h-4 w-1/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

async function FeaturedStudios() {
  let studios;
  try {
    const result = await getStudios(
      { limit: 6, sort: "newest" },
      { cache: "no-store" },
    );
    studios = result.studios;
  } catch {
    return (
      <div
        className="mt-9 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center"
        role="alert"
      >
        <p className="text-sm text-destructive">
          Featured studios are temporarily unavailable.
        </p>
        <Link
          className="mt-3 inline-flex font-semibold text-primary underline-offset-4 hover:underline"
          href="/studios"
          prefetch={false}
        >
          Explore Studios
        </Link>
      </div>
    );
  }

  if (studios.length === 0) {
    return (
      <div className="mt-9 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No studios are available yet.
        </p>
        <Link
          className="mt-3 inline-flex font-semibold text-primary underline-offset-4 hover:underline"
          href="/studios"
          prefetch={false}
        >
          Explore Studios
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-9 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
      {studios.map((studio) => (
        <StudioCard key={studio.id || studio.slug} studio={studio} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="pb-12 pt-5 sm:pb-18 sm:pt-8">
          <Container>
            <HeroCarousel />
            <form
              action="/studios"
              aria-describedby="studio-search-note"
              className="relative z-10 mx-auto -mt-5 grid max-w-5xl gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:-mt-7 sm:grid-cols-[1.1fr_1fr_auto] sm:items-end sm:gap-4 sm:p-5"
              method="get"
            >
              <div className="min-w-0 space-y-2">
                <Label htmlFor="studio-search">
                  Search by city, studio, or keyword
                </Label>
                <div className="relative">
                  <MapPin
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    className="pl-9"
                    id="studio-search"
                    name="search"
                    placeholder="City, studio, or keyword"
                    type="search"
                  />
                </div>
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="studio-category">What are you making?</Label>
                <select
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
                  defaultValue=""
                  id="studio-category"
                  name="category"
                >
                  <option value="">All creative spaces</option>
                  {studioCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button className="h-11 sm:px-6" type="submit">
                <Search aria-hidden="true" />
                Find a space
              </Button>
            </form>
            <p
              className="mx-auto mt-3 max-w-5xl text-center text-xs text-muted-foreground"
              id="studio-search-note"
            >
              Search live listings by name, location, or keyword. For more
              filters, visit{" "}
              <Link
                className="font-semibold text-primary underline-offset-4 hover:underline"
                href="/studios"
              >
                Explore Studios
              </Link>
              .
            </p>
          </Container>
        </section>

        <section
          aria-labelledby="categories-title"
          className="scroll-mt-24 py-14 sm:py-20"
          id="categories"
        >
          <Container>
            <div className="mb-8 grid gap-5 md:mb-10 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  Find your frame
                </p>
                <h2
                  className="max-w-xl font-display text-4xl leading-[0.98] tracking-[-0.025em] text-foreground sm:text-5xl"
                  id="categories-title"
                >
                  A space for the way you create.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                Start with your craft. Find a room, a rig, or a fresh point of
                view for what comes next.
              </p>
            </div>

            <div className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[180px] sm:gap-4 lg:grid-cols-6 lg:auto-rows-[190px]">
              {studioCategories.map((category, index) => {
                const Icon = categoryIcons[category.slug];
                const layout =
                  index === 0
                    ? "col-span-2 row-span-2 lg:col-span-2"
                    : index === 1
                      ? "col-span-2 lg:col-span-4"
                      : "col-span-1 lg:col-span-2";

                return (
                  <Link
                    aria-label={`Explore ${category.title}: ${category.description}`}
                    className={`group relative isolate overflow-hidden rounded-2xl bg-foreground text-white focus-visible:outline-offset-4 sm:rounded-[1.5rem] ${layout}`}
                    href={`/studios?category=${category.slug}`}
                    key={category.slug}
                    prefetch={false}
                  >
                    <Image
                      alt={category.imageAlt}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 33vw"
                      src={category.image}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
                    />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-5">
                      <span>
                        <span className="mb-2 flex size-8 items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-sm">
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <span className="block font-display text-2xl leading-none sm:text-3xl">
                          {category.title}
                        </span>
                        <span className="mt-2 hidden max-w-xs text-xs leading-5 text-white/80 sm:block">
                          {category.description}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="mb-0.5 grid size-9 shrink-0 translate-y-1 place-items-center rounded-full border border-white/40 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                      >
                        <ArrowUpRight className="size-4" />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>

        <section
          aria-labelledby="studios-title"
          className="scroll-mt-24 bg-secondary/45 py-16 sm:py-24"
          id="studios"
        >
          <Container>
            <SectionHeader
              action={
                <Button asChild className="self-start" variant="outline">
                  <Link href="/studios" prefetch={false}>
                    Explore Studios
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              }
              description="A few distinctive places to get your imagination moving."
              eyebrow="Spaces with a point of view"
              titleId="studios-title"
              title="Good work starts somewhere."
            />
            <Suspense fallback={<FeaturedStudiosFallback />}>
              <FeaturedStudios />
            </Suspense>
          </Container>
        </section>

        <section
          aria-labelledby="how-it-works-title"
          className="scroll-mt-24 py-16 sm:py-24"
          id="how-it-works"
        >
          <Container>
            <SectionHeader
              description="A little less searching. A lot more room to focus on the work."
              eyebrow="The StudioSpace approach"
              titleId="how-it-works-title"
              title="From first thought to first take."
            />
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
              {bookingSteps.map((step) => (
                <li
                  className="relative min-h-52 rounded-2xl border border-border bg-card p-5 sm:p-6"
                  key={step.number}
                >
                  <span className="font-display text-4xl italic text-primary">
                    {step.number}
                  </span>
                  <h3 className="mt-7 text-lg font-semibold tracking-[-0.02em] text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section
          aria-labelledby="about-title"
          className="scroll-mt-24 overflow-hidden bg-background py-16 text-foreground sm:py-24"
          id="about"
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <div className="max-w-xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#e9a485]">
                  About StudioSpace
                </p>
                <h2
                  className="font-display text-4xl leading-[0.98] tracking-[-0.025em] sm:text-5xl lg:text-6xl"
                  id="about-title"
                >
                  A home for the people behind the work.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-6 text-foreground/70 sm:text-base sm:leading-7">
                  StudioSpace is a creative workspace marketplace in the
                  making. Our purpose is to help photographers, filmmakers,
                  podcasters, musicians, and other creative professionals find
                  characterful places to bring their ideas to life.
                </p>
              </div>

              <div className="flex flex-col justify-center">
                <p className="max-w-xl font-display text-3xl leading-tight sm:text-4xl">
                  We believe the right room can change what feels possible.
                </p>
                <p className="mt-5 max-w-xl text-sm leading-6 text-foreground/70 sm:text-base sm:leading-7">
                  By bringing independent hosts and working creatives closer
                  together, we want to make finding a production-ready space a
                  more human part of the creative process.
                </p>
                <div
                  aria-label="Creative communities StudioSpace is for"
                  className="mt-6 flex flex-wrap gap-2"
                >
                  {studioCategories.map((category) => (
                    <span
                      className="rounded-full border border-foreground/25 px-3 py-1.5 text-xs font-medium text-foreground/85"
                      key={category.slug}
                    >
                      {category.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section
          aria-labelledby="host-guarantee-title"
          className="scroll-mt-24 py-16 sm:py-24"
          id="host-guarantee"
        >
          <Container>
            <SectionHeader
              description="Trust and practical support should be part of every creative collaboration."
              eyebrow="For hosts and creators"
              titleId="host-guarantee-title"
              title="Host Guarantee & Creator Support"
            />
            <ul className="mt-9 grid gap-x-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
                {hostAssurances.map((item, index) => (
                  <li
                    className="border-t border-border py-5 sm:py-6"
                    key={item.title}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                        {index === 0 ? (
                          <ShieldCheck aria-hidden="true" className="size-4" />
                        ) : index === 1 ? (
                          <BadgeCheck aria-hidden="true" className="size-4" />
                        ) : index === 2 ? (
                          <Wrench aria-hidden="true" className="size-4" />
                        ) : (
                          <Headset aria-hidden="true" className="size-4" />
                        )}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
            <p className="mt-5 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6 text-muted-foreground">
              Liability protection, verified profiles, equipment safety
              services, and 24/7 host support are intended assurances, not
              services that are currently operational. Their terms will be
              published before any booking service opens. Booking requests can
              be submitted and are saved as Pending, but host confirmation and
              payment processing are not currently available.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/add-studio" prefetch={false}>
                Host Your Space
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Container>
        </section>

        <section className="py-14 sm:py-20">
          <Container>
            <div className="flex flex-col justify-between gap-6 rounded-[1.75rem] bg-card p-6 sm:flex-row sm:items-center sm:p-9 lg:p-12">
              <div className="max-w-2xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  Your next project starts here
                </p>
                <h2 className="font-display text-3xl leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">
                  Find the room that gets your ideas moving.
                </h2>
              </div>
              <Button asChild className="shrink-0 self-start sm:self-auto" size="lg">
                <Link href="/studios" prefetch={false}>
                  Explore Studios
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
