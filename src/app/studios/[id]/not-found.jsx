import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function StudioNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Studio not found
            </p>
            <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.025em] text-foreground sm:text-6xl">
              We couldn&apos;t find that creative space.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              This address does not match one of the sample studio listings.
              Browse the demonstration spaces or return home.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/studios">
                  <ArrowRight aria-hidden="true" />
                  Explore Studios
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowLeft aria-hidden="true" />
                  Return home
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
