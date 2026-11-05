"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMyBookings, cancelBooking } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function MyBookingsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user ?? null;
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelPending, setCancelPending] = useState(false);
  const [fetchedUserId, setFetchedUserId] = useState(null);
  const loading = sessionPending || (Boolean(user) && fetchedUserId !== user?.id);

  const shouldFetch = !sessionPending && user && fetchedUserId !== user.id;

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    getMyBookings({ cache: "no-store" })
      .then((result) => {
        if (cancelled) return;
        setBookings(Array.isArray(result?.bookings) ? result.bookings : []);
        setFetchedUserId(user.id);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Failed to load bookings.");
        setFetchedUserId(user.id);
      });
    return () => {
      cancelled = true;
    };
  }, [shouldFetch, user?.id]);

  function handleCancelDialogChange(open) {
    if (open) return;
    if (cancelPending) return;
    setCancelTarget(null);
  }

  async function handleConfirmCancel() {
    if (!cancelTarget || cancelPending) return;
    setCancelPending(true);
    try {
      await cancelBooking(cancelTarget.id);
      setCancelTarget(null);
      toast.success("Booking cancelled successfully");
      if (user?.id) {
        setFetchedUserId(null);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to cancel booking");
    } finally {
      setCancelPending(false);
    }
  }

  return (
    <div key={user?.id || "guest"}>
      <SiteHeader />
      <main className="flex-1 pb-16 pt-8 sm:pt-10">
        <Container>
          <header className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Your reservations
            </p>
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              My Bookings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              View and manage your studio bookings.
            </p>
          </header>

          {sessionPending || loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : !user ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">You need to be logged in to view your bookings.</p>
              <Button asChild className="mt-4">
                <Link href="/login?returnTo=%2Fmy-bookings">Log in</Link>
              </Button>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={() => setFetchedUserId(null)} className="mt-4" variant="outline">Try again</Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center sm:p-12">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary">
                <CalendarCheck className="size-6 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl text-foreground sm:text-3xl">No bookings yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                When you book a studio, your reservations will appear here.
              </p>
              <Button asChild className="mt-6">
                <Link href="/studios">Explore Studios</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-3xl border border-border bg-card p-6 shadow-card">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{booking.studioTitle}</h3>
                      <p className="text-sm text-muted-foreground">{booking.studioLocation}</p>
                      <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                        <p>Date: {booking.bookingDate}</p>
                        <p>Time: {booking.startTime} - {booking.endTime}</p>
                        <p>Duration: {booking.duration} hours</p>
                        <p>Hourly Rate: ${booking.hourlyRateSnapshot}</p>
                        <p className="font-medium text-foreground">Total: ${booking.totalAmount}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        booking.status === "Confirmed" ? "bg-success/10 text-success" :
                        booking.status === "Cancelled" ? "bg-destructive/10 text-destructive" :
                        booking.status === "Completed" ? "bg-secondary text-secondary-foreground" :
                        "bg-warning/10 text-warning"
                      }`}>
                        {booking.status}
                      </span>
                      {booking.studioSlug && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/studios/${booking.studioSlug}`}>View Studio</Link>
                        </Button>
                      )}
                      {booking.status === "Pending" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancelPending}
                          onClick={() => setCancelTarget(booking)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>
      <SiteFooter />

      <Dialog
        open={Boolean(cancelTarget)}
        onOpenChange={handleCancelDialogChange}
      >
        <DialogContent>
          <DialogHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Cancel booking
            </p>
            <DialogTitle className="font-display text-2xl leading-tight">
              Cancel this booking?
            </DialogTitle>
            <DialogDescription>
              {cancelTarget
                ? `${cancelTarget.studioTitle || "This studio"} on ${cancelTarget.bookingDate} from ${cancelTarget.startTime} to ${cancelTarget.endTime} will be marked as Cancelled. This cannot be undone.`
                : "This booking will be marked as Cancelled. This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={cancelPending}
              onClick={() => setCancelTarget(null)}
              type="button"
              variant="outline"
            >
              Keep booking
            </Button>
            <Button
              disabled={cancelPending}
              onClick={handleConfirmCancel}
              type="button"
              variant="destructive"
            >
              {cancelPending ? "Cancelling..." : "Yes, cancel booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
