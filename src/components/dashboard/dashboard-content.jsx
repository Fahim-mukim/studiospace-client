"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarCheck,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getMyStudios, getMyBookings } from "@/lib/api";

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

export function DashboardContent() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user ?? null;
  const [studios, setStudios] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [fetchedUserId, setFetchedUserId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const loading = sessionPending || (Boolean(user) && fetchedUserId !== user?.id);
  // Keyed by user so a stale failure from a previous session is never shown.
  const error =
    loadError && loadError.userId === user?.id ? loadError.message : null;

  const shouldFetch = !sessionPending && user && fetchedUserId !== user.id;

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    Promise.allSettled([
      getMyStudios({ cache: "no-store" }),
      getMyBookings({ cache: "no-store" }),
    ]).then(([studiosResult, bookingsResult]) => {
      if (cancelled) return;
      if (
        studiosResult.status === "rejected" ||
        bookingsResult.status === "rejected"
      ) {
        const failure =
          studiosResult.status === "rejected" ? studiosResult : bookingsResult;
        setLoadError({
          userId: user.id,
          message:
            failure.reason?.message ||
            "Unable to load your dashboard data. Please try again.",
        });
        setFetchedUserId(user.id);
        return;
      }
      setStudios(
        Array.isArray(studiosResult.value?.studios)
          ? studiosResult.value.studios
          : [],
      );
      setBookings(
        Array.isArray(bookingsResult.value?.bookings)
          ? bookingsResult.value.bookings
          : [],
      );
      setLoadError(null);
      setFetchedUserId(user.id);
    });
    return () => {
      cancelled = true;
    };
  }, [shouldFetch, user?.id]);

  function handleRetry() {
    setLoadError(null);
    setFetchedUserId(null);
  }

  const totalListings = studios.length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed").length;
  const recentBookings = bookings.slice(0, 3);

  return (
    <div key={user?.id || "guest"}>
      <SiteHeader />
      <main className="flex-1 pb-16 pt-8 sm:pt-10">
        <Container>
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-secondary text-lg font-semibold text-secondary-foreground">
                {user?.image ? (
                  <Image
                    alt={user.name || "User avatar"}
                    className="object-cover"
                    fill
                    sizes="64px"
                    src={user.image}
                    unoptimized
                  />
                ) : (
                  getInitials(user)
                )}
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  Dashboard
                </p>
                <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
                  {sessionPending ? "Loading..." : user?.name || "Your Dashboard"}
                </h1>
                {user?.email ? (
                  <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                ) : null}
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/profile">
                <UserRound className="size-4" />
                Edit Profile
              </Link>
            </Button>
          </header>

          {loading ? (
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </section>
          ) : error ? (
            <section className="mb-8 rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
                <AlertCircle aria-hidden="true" className="size-7" />
              </div>
              <h2 className="font-display text-2xl text-foreground sm:text-3xl">
                Unable to load your dashboard
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                {error}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={handleRetry} type="button">
                  <RotateCcw aria-hidden="true" className="size-4" />
                  Try again
                </Button>
              </div>
            </section>
          ) : (
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Studio Listings</p>
                  <ListChecks className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-foreground">{totalListings}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <CalendarCheck className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-foreground">{totalBookings}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Pending Bookings</p>
                  <LayoutDashboard className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-foreground">{pendingBookings}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Confirmed Bookings</p>
                  <CalendarCheck className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-foreground">{confirmedBookings}</p>
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/add-studio">
                  <PlusCircle className="size-4" />
                  Add New Studio
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/my-listings">
                  <ListChecks className="size-4" />
                  My Studio Listings
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/my-bookings">
                  <CalendarCheck className="size-4" />
                  My Bookings
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/profile">
                  <UserRound className="size-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </section>

          {!error && (
            <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/my-bookings">View all bookings</Link>
                </Button>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No recent bookings yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentBookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={booking.studioSlug ? `/studios/${booking.studioSlug}` : "/my-bookings"}
                      className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:bg-accent/5"
                    >
                      <div>
                        <p className="font-medium text-foreground">{booking.studioTitle || "Studio"}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.bookingDate} • {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                      <span className="rounded-full px-2 py-1 text-xs font-medium text-muted-foreground">
                        {booking.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
