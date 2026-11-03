"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudioGallery({ name, images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  function move(direction) {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <section aria-label={`${name} image gallery`} className="space-y-3">
      <div className="relative aspect-[1.18] overflow-hidden rounded-3xl bg-muted sm:aspect-[1.55]">
        <Image
          alt={activeImage.alt}
          className="object-cover"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          src={activeImage.src}
        />
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between sm:inset-x-5 sm:bottom-5">
          <p
            aria-live="polite"
            className="max-w-[65%] rounded-full bg-black/55 px-3 py-2 text-xs text-white backdrop-blur-md"
          >
            Image {activeIndex + 1} of {images.length}: {activeImage.alt}
          </p>
          <div className="flex gap-2">
            <Button
              aria-label="Previous studio image"
              className="border-white/30 bg-black/55 text-white hover:bg-black/70 hover:text-white"
              onClick={() => move(-1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
            <Button
              aria-label="Next studio image"
              className="border-white/30 bg-black/55 text-white hover:bg-black/70 hover:text-white"
              onClick={() => move(1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
      <div aria-label="Choose a studio image" className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <button
            aria-current={index === activeIndex ? "true" : undefined}
            aria-label={`Show image ${index + 1}: ${image.alt}`}
            className={`relative aspect-[1.5] overflow-hidden rounded-2xl bg-muted focus-visible:outline ${
              index === activeIndex
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "opacity-75 transition-opacity hover:opacity-100"
            }`}
            key={`${image.src}-${index}`}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="(max-width: 640px) 32vw, 22vw"
              src={image.src}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
