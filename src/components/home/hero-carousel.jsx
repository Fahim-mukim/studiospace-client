"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { HeroCopy } from "@/components/home/hero-copy";
import { heroSlides } from "@/data/homepage";

function HeroFallback() {
  return (
    <section
      aria-label="Featured creative spaces"
      className="relative isolate min-h-[510px] overflow-hidden rounded-[1.75rem] bg-foreground sm:min-h-[590px] sm:rounded-[2rem] lg:min-h-[650px]"
    >
      <Image
        alt=""
        className="object-cover"
        fill
        loading="eager"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 92vw, 1320px"
        src={heroSlides[0].image}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10"
      />
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-7 pt-24 text-white sm:px-10 sm:pb-10 lg:px-14 lg:pb-14">
        <HeroCopy />
      </div>
    </section>
  );
}

const InteractiveHero = dynamic(
  () =>
    import("@/components/home/interactive-hero").then(
      (module) => module.InteractiveHero,
    ),
  {
    loading: HeroFallback,
    ssr: false,
  },
);

export function HeroCarousel() {
  return <InteractiveHero />;
}
