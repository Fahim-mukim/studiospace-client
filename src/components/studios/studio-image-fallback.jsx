import { ImageOff } from "lucide-react";

export function StudioImageFallback({ label }) {
  return (
    <div
      aria-label={`${label} image unavailable`}
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary via-muted to-secondary text-muted-foreground"
      role="img"
    >
      <ImageOff aria-hidden="true" className="size-8" />
      <span className="text-xs font-medium">Image unavailable</span>
    </div>
  );
}
