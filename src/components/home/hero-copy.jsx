import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroCopy() {
  return (
    <div className="max-w-3xl">
      <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-brand-copper"
        />
        A space for every kind of making
      </p>
      <h1 className="max-w-[13ch] font-display text-[clamp(3.2rem,8vw,6.6rem)] leading-[0.9] tracking-[-0.035em]">
        Find a space for your next{" "}
        <span className="italic text-[#efb092]">big idea.</span>
      </h1>
      <p className="mt-5 max-w-lg text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
        From a quiet recording room to a sunlit set, find the backdrop that
        helps your work take shape.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Button
          asChild
          className="bg-white text-foreground hover:bg-white/90"
          size="lg"
        >
          <Link href="/studios" prefetch={false}>
            Explore Studios
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Link
          className="rounded-xl px-4 py-3 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-white"
          href="/studios"
          prefetch={false}
        >
          Host Your Space
        </Link>
      </div>
    </div>
  );
}
