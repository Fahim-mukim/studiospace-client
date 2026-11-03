import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudiosLoading() {
  return (
    <>
      <SiteHeader />
      <main aria-label="Loading studios" className="flex-1 pb-20 pt-10 sm:pt-14">
        <Container>
          <Skeleton className="mb-8 h-5 w-44" />
          <Skeleton className="h-14 w-full max-w-xl" />
          <Skeleton className="mt-5 h-12 w-full max-w-2xl" />
          <Skeleton className="mt-7 h-16 w-full" />
          <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton className="h-16" key={index} />
            ))}
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="space-y-4" key={index}>
                <Skeleton className="aspect-[1.22] w-full rounded-[1.4rem]" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
