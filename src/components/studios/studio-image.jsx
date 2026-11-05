"use client";

import Image from "next/image";
import { useState } from "react";
import { StudioImageFallback } from "@/components/studios/studio-image-fallback";

export function StudioImage({
  alt,
  className = "object-cover",
  label,
  priority = false,
  sizes,
  src,
}) {
  const [failedSource, setFailedSource] = useState(null);
  const imageSource = src || "/images/studios/daylight-loft.jpg";
  const isRemote =
    typeof imageSource === "string" &&
    (imageSource.startsWith("http://") || imageSource.startsWith("https://"));

  if (failedSource === imageSource) {
    return <StudioImageFallback label={label} />;
  }

  return (
    <Image
      alt={alt}
      className={className}
      fill
      onError={() => setFailedSource(imageSource)}
      priority={priority}
      sizes={sizes}
      src={imageSource}
      unoptimized={isRemote}
    />
  );
}
