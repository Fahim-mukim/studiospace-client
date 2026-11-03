import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudioDetailsLoading() {
  return (
    <>
      <SiteHeader />
      <main aria-label="Loading studio details" className="flex-1 pb-20 pt-10">
        <Container>
          <Skeleton className="mb-8 h-5 w-56" />
          <Skeleton className="mb-7 h-14 w-full max-w-xl" />
          <Skeleton className="aspect-[1.18] w-full rounded-3xl sm:aspect-[1.55]" />
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-8">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-56 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
