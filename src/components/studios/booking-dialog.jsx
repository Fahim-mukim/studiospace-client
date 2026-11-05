"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBooking } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BookingDialog({ studio }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user ?? null;
  const [open, setOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [pending, setPending] = useState(false);

  const studioId = studio?.id || studio?.slug;
  const hourlyRate = typeof studio?.hourlyRate === "number" ? studio.hourlyRate : Number(studio?.hourlyRate) || 0;

  function calculateDuration() {
    if (!bookingDate || !startTime || !endTime) return 0;
    const start = new Date(`${bookingDate}T${startTime}`);
    const end = new Date(`${bookingDate}T${endTime}`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0;
  }

  const duration = calculateDuration();
  const totalAmount = Math.round(hourlyRate * duration * 100) / 100;

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;

    if (!user) {
      setOpen(false);
      router.push(`/login?returnTo=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : `/studios/${studioId}`)}`);
      return;
    }

    if (duration <= 0) {
      toast.error("End time must be after start time.");
      return;
    }

    setPending(true);
    try {
      const result = await createBooking({
        studioId,
        bookingDate,
        startTime,
        endTime,
      });
      toast.success(result?.message || "Booking request submitted");
      setOpen(false);
      router.push("/my-bookings");
    } catch (error) {
      toast.error(error?.message || "Failed to create booking. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg" type="button">
          Book Workspace Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="pr-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Book workspace
          </p>
          <DialogTitle className="font-display text-3xl leading-tight">
            Reserve {studio?.name || studio?.title}
          </DialogTitle>
          <DialogDescription>
            Submit a booking request, which is saved as Pending. Host
            confirmation and payment processing are not currently available.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="booking-date">
                <CalendarDays aria-hidden="true" className="size-4" />
                Date
              </Label>
              <Input
                id="booking-date"
                min={getTodayString()}
                onChange={(event) => setBookingDate(event.target.value)}
                required
                type="date"
                value={bookingDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-start">
                <Clock3 aria-hidden="true" className="size-4" />
                Start time
              </Label>
              <Input
                id="booking-start"
                onChange={(event) => setStartTime(event.target.value)}
                required
                type="time"
                value={startTime}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-end">
                <Clock3 aria-hidden="true" className="size-4" />
                End time
              </Label>
              <Input
                id="booking-end"
                onChange={(event) => setEndTime(event.target.value)}
                required
                type="time"
                value={endTime}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Hourly rate</span>
              <span className="font-medium">${hourlyRate.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{duration.toFixed(2)} hours</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base">
              <span className="font-semibold">Total amount</span>
              <span className="font-semibold">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <Button className="w-full" disabled={pending} type="submit">
            {pending ? "Submitting..." : "Request Booking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
