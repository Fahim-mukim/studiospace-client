import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudioResults } from "@/components/studios/studio-results";
import { studioCategories } from "@/data/homepage";
import { featuredStudios } from "@/data/studios";

export const metadata = {
  title: "Explore Studios",
  description:
    "Browse sample creative studios for photography, film, podcasts, music, and workshops.",
};

const categorySlugs = new Set(studioCategories.map((category) => category.slug));

export default async function StudiosPage({ searchParams }) {
  const query = searchParams ? await searchParams : {};
  const requestedCategory = Array.isArray(query.category)
    ? query.category[0]
    : query.category;
  const initialCategory = categorySlugs.has(requestedCategory)
    ? requestedCategory
    : "";

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-20 pt-10 sm:pt-14">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link className="transition-colors hover:text-foreground" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li aria-current="page" className="font-medium text-foreground">
                Explore Studios
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Find your frame
            </p>
            <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.025em] text-foreground sm:text-6xl">
              Find your creative space
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Explore considered spaces for your next shoot, sound session, or
              hands-on idea.
            </p>
          </div>

          <p
            className="mt-7 rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm leading-6 text-secondary-foreground sm:px-5"
            role="note"
          >
            Demonstration listings: names, locations, prices, ratings, hosts,
            and reviews are sample content. Live availability and reservations
            are not connected.
          </p>

          <StudioResults
            categories={studioCategories}
            initialCategory={initialCategory}
            key={initialCategory}
            studios={featuredStudios}
          />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
