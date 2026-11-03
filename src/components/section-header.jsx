export function SectionHeader({
  eyebrow,
  title,
  titleId,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${className}`}
    >
      <div className="max-w-2xl space-y-3">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
        )}
        <h2
          className="font-display text-4xl leading-[0.98] tracking-[-0.025em] text-foreground sm:text-5xl"
          id={titleId}
        >
          {title}
        </h2>
        {description && (
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
