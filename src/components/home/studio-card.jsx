import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Star,
  UsersRound,
} from "lucide-react";
import { HoverLift } from "@/components/home/hover-lift";
import { Badge } from "@/components/ui/badge";

export function StudioCard({ studio }) {
  return (
    <HoverLift className="h-full">
      <article className="group h-full">
        <Link
          aria-label={`Explore ${studio.name} in ${studio.location}`}
          className="block h-full rounded-[1.4rem] focus-visible:outline-offset-4"
          href={`/studios/${studio.slug}`}
          prefetch={false}
        >
          <div className="relative aspect-[1.22] overflow-hidden rounded-[1.4rem] bg-muted">
            <Image
              alt={studio.imageAlt}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
              src={studio.image}
            />
            <Badge className="absolute left-4 top-4 border-white/30 bg-black/50 text-white backdrop-blur-md" variant="outline">
              {studio.category}
            </Badge>
            <span
              aria-hidden="true"
              className="absolute bottom-4 right-4 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-foreground opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
            >
              <ArrowUpRight className="size-4" />
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 pt-4">
            <div className="min-w-0">
              <h3 className="mt-1.5 truncate text-lg font-semibold tracking-[-0.025em] text-foreground sm:text-xl">
                {studio.name}
              </h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                <span className="truncate">{studio.location}</span>
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star aria-hidden="true" className="size-3.5 fill-current text-primary" />
                <span>
                  {studio.rating} ({studio.reviewCount} reviews)
                </span>
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <UsersRound aria-hidden="true" className="size-3.5 shrink-0" />
                {studio.capacity}
              </p>
            </div>
            <p className="shrink-0 pt-5 text-sm font-semibold text-foreground">
              {studio.rate}
              <span className="font-normal text-muted-foreground"> / hr</span>
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            View Details
            <ArrowRight aria-hidden="true" className="size-4" />
          </span>
        </Link>
      </article>
    </HoverLift>
  );
}
