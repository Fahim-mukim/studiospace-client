"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HeroCopy } from "@/components/home/hero-copy";
import { Button } from "@/components/ui/button";
import { heroSlides } from "@/data/homepage";
import { A11y, EffectFade, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";

export function InteractiveHero() {
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      aria-label="Featured creative spaces"
      aria-roledescription="carousel"
      className="relative isolate min-h-[510px] overflow-hidden rounded-[1.75rem] bg-foreground sm:min-h-[590px] sm:rounded-[2rem] lg:min-h-[650px]"
    >
      <Swiper
        a11y={{ enabled: true }}
        className="!absolute inset-0 w-full"
        effect="fade"
        fadeEffect={{ crossFade: true }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        loop
        modules={[A11y, EffectFade, Keyboard]}
        onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
        onSwiper={setSwiper}
        speed={650}
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide
            aria-label={`${index + 1} of ${heroSlides.length}: ${slide.label}`}
            aria-roledescription="slide"
            key={slide.image}
          >
            <Image
              alt=""
              className="object-cover"
              fill
              loading={index === 0 ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 92vw, 1320px"
              src={slide.image}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/75 via-black/40 to-black/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-transparent to-black/10"
      />

      <div className="absolute inset-0 z-[2] flex flex-col justify-end px-6 pb-7 pt-24 text-white sm:px-10 sm:pb-10 lg:px-14 lg:pb-14">
        <HeroCopy />
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/25 pt-4 sm:absolute sm:right-10 sm:top-10 sm:mt-0 sm:border-0 sm:pt-0 lg:right-14 lg:top-14">
          <p aria-live="polite" className="sr-only">
            Image {activeIndex + 1} of {heroSlides.length}:{" "}
            {heroSlides[activeIndex].label}
          </p>
          <div aria-label="Choose a featured image" className="flex gap-2">
            {heroSlides.map((slide, index) => (
              <button
                aria-current={activeIndex === index ? "true" : undefined}
                aria-label={`Show image ${index + 1}: ${slide.label}`}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                  activeIndex === index
                    ? "w-8 bg-white"
                    : "w-4 bg-white/45 hover:bg-white/75"
                }`}
                key={slide.image}
                onClick={() => swiper?.slideToLoop(index)}
                type="button"
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              aria-label="Previous featured image"
              className="size-10 rounded-full border-white/70 bg-black/45 text-white hover:bg-white hover:text-stone-950 active:bg-stone-200 active:text-stone-950 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={() => swiper?.slidePrev()}
              size="icon"
              variant="outline"
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
            <Button
              aria-label="Next featured image"
              className="size-10 rounded-full border-white/70 bg-black/45 text-white hover:bg-white hover:text-stone-950 active:bg-stone-200 active:text-stone-950 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={() => swiper?.slideNext()}
              size="icon"
              variant="outline"
            >
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
      <span className="sr-only">
        Featured image: {heroSlides[activeIndex].label}
      </span>
    </section>
  );
}
