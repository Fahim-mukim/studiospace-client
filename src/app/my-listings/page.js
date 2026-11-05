"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, LoaderCircle, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { StudioCard } from "@/components/home/studio-card";
import { deleteStudio, getMyStudios } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

function getDeleteErrorMessage(error) {
  if (error?.status === 403) {
    return "You do not have permission to delete this studio.";
  }
  if (error?.status === 404) {
    return "This studio could not be found. Refresh your listings and try again.";
  }
  if (error?.status === 409 || error?.code === "STUDIO_HAS_BOOKINGS") {
    return "This studio has booking history and cannot be deleted.";
  }
  if (error?.code === "NETWORK_ERROR") {
    return "Unable to reach StudioSpace. Check your connection and try again.";
  }
  if (error?.status === 503) {
    return "StudioSpace is temporarily unavailable. Please try again.";
  }
  return error?.message || "Unable to delete this studio. Please try again.";
}

function StudioCardSkeleton() {
  return (
    <div className="h-full rounded-[1.4rem] border border-border bg-card">
      <div className="aspect-[1.22] w-full rounded-t-[1.4rem] bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user ?? null;
  const [studios, setStudios] = useState([]);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [studioToDelete, setStudioToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletionInProgress = useRef(false);
  const loading = sessionPending || (Boolean(user) && !hasFetched && !error);

  useEffect(() => {
    if (sessionPending) return;
    if (!user) return;
    if (hasFetched) return;

    let cancelled = false;

    getMyStudios({ cache: "no-store" })
      .then((result) => {
        if (cancelled) return;
        setStudios(Array.isArray(result?.studios) ? result.studios : []);
        setHasFetched(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.message || "Unable to load your studios. Please try again.",
        );
        setHasFetched(true);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionPending, user, hasFetched]);

  function loadStudios() {
    let cancelled = false;
    setError(null);
    setHasFetched(false);

    getMyStudios({ cache: "no-store" })
      .then((result) => {
        if (cancelled) return;
        setStudios(Array.isArray(result?.studios) ? result.studios : []);
        setHasFetched(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.message || "Unable to load your studios. Please try again.",
        );
        setHasFetched(true);
      });
  }

  async function handleDeleteStudio() {
    if (!studioToDelete || deletionInProgress.current) return;

    deletionInProgress.current = true;
    setIsDeleting(true);
    try {
      const result = await deleteStudio(studioToDelete.slug || studioToDelete.id);
      if (!result.success) {
        throw new Error(result.message || "Unable to delete this studio.");
      }

      setStudios((current) =>
        current.filter((studio) => studio.id !== studioToDelete.id),
      );
      setStudioToDelete(null);
      toast.success(result.message || "Studio deleted successfully.");
    } catch (deleteError) {
      toast.error(getDeleteErrorMessage(deleteError));
    } finally {
      deletionInProgress.current = false;
      setIsDeleting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-16 pt-8 sm:pt-10">
        <Container>
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Your spaces
              </p>
              <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
                My Studio Listings
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Manage and view the studios you have listed on StudioSpace.
              </p>
            </div>
            <Button asChild>
              <Link href="/add-studio">
                <Plus aria-hidden="true" className="size-4" />
                Add New Studio
              </Link>
            </Button>
          </header>

          {sessionPending || loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <StudioCardSkeleton key={index} />
              ))}
            </div>
          ) : !user ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                You need to be logged in to view your studios.
              </p>
              <Button asChild className="mt-4">
                <Link href="/login?returnTo=%2Fmy-listings">Log in</Link>
              </Button>
            </div>
          ) : error ? (
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
                <AlertCircle className="size-7" />
              </div>
              <h2 className="font-display text-3xl text-foreground sm:text-4xl">
                Unable to load your studios
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                {error}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={loadStudios}>
                  <RotateCcw className="size-4" />
                  Try again
                </Button>
                <Button asChild variant="outline">
                  <Link href="/add-studio">
                    <Plus className="size-4" />
                    Add Studio
                  </Link>
                </Button>
              </div>
            </div>
          ) : studios.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center sm:p-12">
              <h2 className="font-display text-3xl text-foreground sm:text-4xl">
                No studios yet
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                You haven&apos;t added any studios yet. Start by listing your
                creative space.
              </p>
              <Button asChild className="mt-6">
                <Link href="/add-studio">
                  <Plus className="size-4" />
                  Add your first studio
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {studios.map((studio) => (
                <div key={studio.id || studio.slug} className="flex h-full flex-col gap-2">
                  <StudioCard studio={studio} />
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/studios/edit/${encodeURIComponent(studio.slug || studio.id)}`}>
                        Edit studio
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      aria-label={`Delete ${studio.title || studio.name}`}
                      onClick={() => setStudioToDelete(studio)}
                    >
                      <Trash2 aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog
            open={Boolean(studioToDelete)}
            onOpenChange={(open) => {
              if (!open && !isDeleting) setStudioToDelete(null);
            }}
          >
            <DialogContent
              className="max-h-[90vh] overflow-y-auto"
              showCloseButton={!isDeleting}
            >
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Delete {studioToDelete?.title || studioToDelete?.name || "studio"}?
                </DialogTitle>
                <DialogDescription>
                  This permanently removes the listing. Studios with booking
                  history cannot be deleted. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isDeleting}
                  onClick={() => setStudioToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting}
                  aria-busy={isDeleting}
                  onClick={handleDeleteStudio}
                >
                  {isDeleting ? (
                    <LoaderCircle aria-hidden="true" className="animate-spin" />
                  ) : (
                    <Trash2 aria-hidden="true" />
                  )}
                  {isDeleting ? "Deleting…" : "Delete studio"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
