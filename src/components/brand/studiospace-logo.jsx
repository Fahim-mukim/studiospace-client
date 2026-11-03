const variants = {
  icon: "size-8",
  compact: "size-7",
  horizontal: "size-9",
};

function ApertureMark({ className = "size-9" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 48 48"
    >
      <g fill="currentColor">
        <path d="M19.8 4.1c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L19.8 4.1Z" />
        <path d="M20.6 4.4c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L20.6 4.4Z" transform="rotate(60 24 24)" />
        <path d="M19.8 4.1c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L19.8 4.1Z" transform="rotate(120 24 24)" />
        <path d="M19.8 4.1c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L19.8 4.1Z" transform="rotate(180 24 24)" />
        <path d="M19.8 4.1c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L19.8 4.1Z" transform="rotate(240 24 24)" />
        <path d="M19.8 4.1c2.8-1 5.7-1 8.4 0l-1.6 12.1a12 12 0 0 0-5.3 0L19.8 4.1Z" transform="rotate(300 24 24)" />
      </g>
    </svg>
  );
}

export function StudioSpaceLogo({
  variant = "horizontal",
  className = "",
  ...props
}) {
  const isIcon = variant === "icon";

  return (
    <span
      aria-label="StudioSpace"
      role="img"
      className={`inline-flex shrink-0 items-center gap-2.5 text-foreground ${className}`}
      {...props}
    >
      <ApertureMark className={variants[variant] || variants.horizontal} />
      {!isIcon && (
        <span
          aria-hidden="true"
          className={`font-semibold tracking-[-0.055em] ${
            variant === "compact" ? "text-base" : "text-[1.35rem]"
          }`}
        >
          StudioSpace
        </span>
      )}
    </span>
  );
}

export function StudioSpaceMark({ className = "size-9" }) {
  return <ApertureMark className={className} />;
}
