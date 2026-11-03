"use client";

import { useState } from "react";
import { CalendarDays, Clock3, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BookingPreviewDialog({ studio }) {
  const [hours, setHours] = useState("2");
  const [message, setMessage] = useState("");
  const subtotal = studio.hourlyRate * (Number(hours) || 0);

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(
      "This was only a preview. No availability was checked, and no booking or payment was submitted.",
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg" type="button">
          Book Workspace Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="pr-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Booking preview
          </p>
          <DialogTitle className="font-display text-3xl leading-tight">
            Plan time at {studio.name}
          </DialogTitle>
          <DialogDescription>
            Preview an example session and illustrative hourly subtotal.
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm leading-6 text-foreground">
          Booking is a preview in this milestone. Availability has not been
          checked and no reservation or payment has been created.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preview-date">
                <CalendarDays aria-hidden="true" className="size-4" />
                Date
              </Label>
              <Input id="preview-date" name="date" required type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preview-start-time">
                <Clock3 aria-hidden="true" className="size-4" />
                Start time
              </Label>
              <Input
                id="preview-start-time"
                name="startTime"
                required
                type="time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preview-hours">Duration (hours)</Label>
              <Input
                id="preview-hours"
                max="12"
                min="0.5"
                name="hours"
                onChange={(event) => setHours(event.target.value)}
                required
                step="0.5"
                type="number"
                value={hours}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preview-attendees">
                <UsersRound aria-hidden="true" className="size-4" />
                Attendees (sample max {studio.capacityCount})
              </Label>
              <Input
                defaultValue="1"
                id="preview-attendees"
                max={studio.capacityCount}
                min="1"
                name="attendees"
                required
                type="number"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">
              Illustrative hourly subtotal · {studio.rate} × {hours || 0} hr
            </span>
            <span className="font-semibold text-foreground">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <Button className="w-full" type="submit" variant="outline">
            Continue (preview only)
          </Button>
          {message && (
            <p aria-live="polite" className="text-sm leading-6 text-accent" role="status">
              {message}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
