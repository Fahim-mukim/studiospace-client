"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { StudioCard } from "@/components/home/studio-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const priceLimits = [
  { value: "all", label: "Any rate" },
  { value: "75", label: "Up to $75 / hr" },
  { value: "100", label: "Up to $100 / hr" },
  { value: "150", label: "Up to $150 / hr" },
];

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest rated" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
];

export function StudioResults({ categories, initialCategory, studios }) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [isPending, startTransition] = useTransition();

  function updateCategory(nextCategory) {
    setCategory(nextCategory);
    const params = new URLSearchParams(window.location.search);
    params.delete("category");
    if (nextCategory) params.set("category", nextCategory);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/studios?${query}` : "/studios", {
        scroll: false,
      });
    });
  }

  const filteredStudios = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const maxRate = maxPrice === "all" ? Infinity : Number(maxPrice);
    const results = studios.filter((studio) => {
      const searchableText = [
        studio.name,
        studio.location,
        studio.category,
        studio.overview,
        ...studio.amenities,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
        (!category || studio.categorySlug === category) &&
        studio.hourlyRate <= maxRate
      );
    });

    if (sort === "rating") {
      return [...results].sort((a, b) => b.ratingValue - a.ratingValue);
    }
    if (sort === "price-low") {
      return [...results].sort((a, b) => a.hourlyRate - b.hourlyRate);
    }
    if (sort === "price-high") {
      return [...results].sort((a, b) => b.hourlyRate - a.hourlyRate);
    }
    return results;
  }, [category, maxPrice, search, sort, studios]);

  function clearFilters() {
    setSearch("");
    setMaxPrice("all");
    setSort("recommended");
    updateCategory("");
  }

  return (
    <section aria-labelledby="studio-results-title" className="mt-10 sm:mt-12">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5 lg:grid-cols-[minmax(240px,1.3fr)_repeat(3,minmax(150px,1fr))] lg:items-end">
        <div className="space-y-2">
          <Label htmlFor="studio-search">Search spaces</Label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              autoComplete="off"
              className="pr-10 pl-9"
              id="studio-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, city, category, or amenity"
              type="search"
              value={search}
            />
            {search && (
              <button
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline"
                onClick={() => setSearch("")}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="studio-category-filter">Category</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            id="studio-category-filter"
            onChange={(event) => updateCategory(event.target.value)}
            value={category}
          >
            <option value="">All Studios</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="studio-price-filter">Maximum hourly rate</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            id="studio-price-filter"
            onChange={(event) => setMaxPrice(event.target.value)}
            value={maxPrice}
          >
            {priceLimits.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="studio-sort">Sort by</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            id="studio-sort"
            onChange={(event) => setSort(event.target.value)}
            value={sort}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            className="font-display text-3xl leading-tight tracking-[-0.02em] text-foreground"
            id="studio-results-title"
          >
            {category
              ? categories.find((item) => item.slug === category)?.title
              : "Studios to spark an idea"}
          </h2>
          <p
            aria-live="polite"
            className="mt-1 text-sm text-muted-foreground"
            role="status"
          >
            {filteredStudios.length}{" "}
            {filteredStudios.length === 1 ? "sample space" : "sample spaces"}
            {isPending ? " · Updating…" : ""}
          </p>
        </div>
        {(category || search || maxPrice !== "all" || sort !== "recommended") && (
          <Button onClick={clearFilters} type="button" variant="outline">
            <SlidersHorizontal aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>

      {filteredStudios.length ? (
        <div className="grid items-stretch gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {filteredStudios.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-14 text-center sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            No match this time
          </p>
          <h3 className="mt-3 font-display text-3xl text-foreground">
            No sample spaces match those filters.
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            Try a different name, category, or price range, or start again with
            all sample studios.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={clearFilters} type="button">
              Clear filters
            </Button>
            <Button asChild variant="outline">
              <Link href="/studios">All studios</Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
