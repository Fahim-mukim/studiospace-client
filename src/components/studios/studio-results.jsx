"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { StudioCard } from "@/components/home/studio-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudios } from "@/lib/api";

const priceLimits = [
  { value: "all", label: "Any rate" },
  { value: "75", label: "Up to $75 / hr" },
  { value: "100", label: "Up to $100 / hr" },
  { value: "150", label: "Up to $150 / hr" },
];

const sortOptions = [
  { value: "recommended", label: "Recommended (Newest)" },
  { value: "rating", label: "Highest rated" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
];

export function StudioResults({
  categories = [],
  initialCategory = "",
  initialSearch = "",
  initialMaxPrice = "all",
  initialSort = "recommended",
  initialPage = 1,
  initialStudios = [],
  initialPagination = { page: 1, limit: 20, total: 0, totalPages: 0 },
  initialError = null,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [studios, setStudios] = useState(initialStudios);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);

  const isMountedRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  const syncUrl = useCallback(
    ({ nextCategory, nextSearch, nextMaxPrice, nextSort, nextPage }) => {
      const params = new URLSearchParams();
      if (nextCategory) params.set("category", nextCategory);
      if (nextSearch?.trim()) params.set("search", nextSearch.trim());
      if (nextMaxPrice && nextMaxPrice !== "all") {
        params.set("maxPrice", nextMaxPrice);
      }
      if (nextSort && nextSort !== "recommended") {
        params.set("sort", nextSort);
      }
      if (nextPage && nextPage > 1) {
        params.set("page", String(nextPage));
      }

      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `/studios?${query}` : "/studios", {
          scroll: false,
        });
      });
    },
    [router],
  );

  const executeFetch = useCallback(
    async ({
      nextCategory = category,
      nextSearch = search,
      nextMaxPrice = maxPrice,
      nextSort = sort,
      nextPage = page,
    } = {}) => {
      setLoading(true);
      setError(null);

      syncUrl({
        nextCategory,
        nextSearch,
        nextMaxPrice,
        nextSort,
        nextPage,
      });

      try {
        const result = await getStudios({
          category: nextCategory,
          search: nextSearch,
          maxPrice: nextMaxPrice,
          sort: nextSort,
          page: nextPage,
        });

        setStudios(result.studios);
        setPagination(result.pagination);
      } catch (err) {
        setError(
          err.message ||
            "Unable to connect to the StudioSpace API. Ensure the server is running.",
        );
      } finally {
        setLoading(false);
      }
    },
    [category, maxPrice, page, search, sort, syncUrl],
  );

  // Debounced search handling
  function handleSearchChange(nextSearch) {
    setSearch(nextSearch);
    setPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      executeFetch({ nextSearch, nextPage: 1 });
    }, 350);
  }

  function handleClearSearch() {
    setSearch("");
    setPage(1);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    executeFetch({ nextSearch: "", nextPage: 1 });
  }

  function handleCategoryChange(nextCategory) {
    setCategory(nextCategory);
    setPage(1);
    executeFetch({ nextCategory, nextPage: 1 });
  }

  function handlePriceChange(nextMaxPrice) {
    setMaxPrice(nextMaxPrice);
    setPage(1);
    executeFetch({ nextMaxPrice, nextPage: 1 });
  }

  function handleSortChange(nextSort) {
    setSort(nextSort);
    setPage(1);
    executeFetch({ nextSort, nextPage: 1 });
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    executeFetch({ nextPage });
    document
      .getElementById("studio-results-title")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function handleClearFilters() {
    setSearch("");
    setCategory("");
    setMaxPrice("all");
    setSort("recommended");
    setPage(1);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    executeFetch({
      nextCategory: "",
      nextSearch: "",
      nextMaxPrice: "all",
      nextSort: "recommended",
      nextPage: 1,
    });
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const activeCategoryTitle = categories.find(
    (item) => item.slug === category,
  )?.title;
  const hasActiveFilters =
    Boolean(category) ||
    Boolean(search) ||
    maxPrice !== "all" ||
    sort !== "recommended";

  return (
    <section aria-labelledby="studio-results-title" className="mt-10 sm:mt-12">
      {/* Search and Filters Bar */}
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5 lg:grid-cols-[minmax(240px,1.3fr)_repeat(3,minmax(150px,1fr))] lg:items-end">
        {/* Text Search */}
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
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Name, city, category, or amenity"
              type="search"
              value={search}
            />
            {search && (
              <button
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline"
                onClick={handleClearSearch}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="studio-category-filter">Category</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            id="studio-category-filter"
            onChange={(event) => handleCategoryChange(event.target.value)}
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

        {/* Price Filter */}
        <div className="space-y-2">
          <Label htmlFor="studio-price-filter">Maximum hourly rate</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            id="studio-price-filter"
            onChange={(event) => handlePriceChange(event.target.value)}
            value={maxPrice}
          >
            {priceLimits.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="space-y-2">
          <Label htmlFor="studio-sort">Sort by</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            id="studio-sort"
            onChange={(event) => handleSortChange(event.target.value)}
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

      {/* Results Header */}
      <div className="mb-6 mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            className="font-display text-3xl leading-tight tracking-[-0.02em] text-foreground"
            id="studio-results-title"
          >
            {activeCategoryTitle || "Studios to spark an idea"}
          </h2>
          <p
            aria-live="polite"
            className="mt-1 text-sm text-muted-foreground"
            role="status"
          >
            {loading ? (
              <span>Updating results…</span>
            ) : (
              <span>
                {pagination.total || studios.length}{" "}
                {(pagination.total || studios.length) === 1
                  ? "studio found"
                  : "studios found"}
                {pagination.totalPages > 1
                  ? ` (Page ${pagination.page} of ${pagination.totalPages})`
                  : ""}
              </span>
            )}
            {isPending ? " · Syncing…" : ""}
          </p>
        </div>

        {hasActiveFilters && (
          <Button onClick={handleClearFilters} type="button" variant="outline">
            <SlidersHorizontal aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && !loading ? (
        <div
          className="rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
          role="alert"
        >
          <AlertCircle className="mx-auto size-10 text-destructive" />
          <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">
            Unable to load studios
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {error}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => executeFetch()} type="button">
              <RotateCcw className="size-4" />
              Try again
            </Button>
            <Button onClick={handleClearFilters} type="button" variant="outline">
              Reset filters
            </Button>
          </div>
        </div>
      ) : loading ? (
        /* Loading Skeletons */
        <div className="grid items-stretch gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="space-y-4" key={index}>
              <Skeleton className="aspect-[1.22] w-full rounded-[1.4rem]" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : studios.length > 0 ? (
        /* Results Grid */
        <>
          <div className="grid items-stretch gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
            {studios.map((studio) => (
              <StudioCard key={studio.id || studio.slug} studio={studio} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <nav
              aria-label="Studios pagination"
              className="mt-12 flex items-center justify-center gap-3 border-t border-border pt-8"
            >
              <Button
                disabled={pagination.page <= 1 || loading}
                onClick={() => handlePageChange(pagination.page - 1)}
                type="button"
                variant="outline"
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>

              <span className="px-3 text-sm text-muted-foreground">
                Page <strong className="text-foreground">{pagination.page}</strong> of{" "}
                <strong className="text-foreground">{pagination.totalPages}</strong>
              </span>

              <Button
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => handlePageChange(pagination.page + 1)}
                type="button"
                variant="outline"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </nav>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-14 text-center sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            No match this time
          </p>
          <h3 className="mt-3 font-display text-3xl text-foreground">
            No studios match those filters.
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            Try a different search term, category, or price range, or reset your
            filters to browse all spaces.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={handleClearFilters} type="button">
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
