import { notFound } from "next/navigation";
import { StudioSpaceLogo, StudioSpaceMark } from "@/components/brand/studiospace-logo";
import { Container } from "@/components/container";
import { DesignPreviewInteractions } from "@/components/design-preview-interactions";
import { SectionHeader } from "@/components/section-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function DesignPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const markSizes = [
    { label: 16, className: "size-4" },
    { label: 24, className: "size-6" },
    { label: 32, className: "size-8" },
  ];

  return (
    <main className="min-h-screen bg-background py-10 text-foreground sm:py-16">
      <Container className="space-y-14">
        <header className="flex items-start justify-between gap-6">
          <div className="space-y-5">
            <StudioSpaceLogo />
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Internal design foundation
              </p>
              <h1 className="max-w-3xl font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
                A place for every kind of making.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                StudioSpace design system preview. Components here demonstrate
                the brand foundation only; this is not marketplace content.
              </p>
            </div>
          </div>
          <div className="pt-1">
            <ThemeToggle />
          </div>
        </header>

        <section aria-labelledby="logo-heading" className="space-y-6">
          <SectionHeader
            eyebrow="01 / Brand"
            title="A mark with room to create."
            description="An original six-blade aperture frame with an open center. The vector mark is available as a reusable component and SVG asset."
          />
          <Card>
            <CardContent className="flex flex-col gap-8 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <p id="logo-heading" className="text-sm font-medium">
                  Responsive logo variants
                </p>
                <StudioSpaceLogo variant="horizontal" />
                <StudioSpaceLogo variant="compact" />
              </div>
              <div className="flex items-end gap-6">
                {markSizes.map(({ label, className }) => (
                  <div
                    className="flex flex-col items-center gap-2"
                    key={label}
                  >
                    <StudioSpaceMark className={className} />
                    <span className="text-xs text-muted-foreground">
                      {label}px
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="color-heading" className="space-y-6">
          <SectionHeader
            eyebrow="02 / Color"
            title="Warm, grounded, and readable."
            description="Semantic tokens switch with the selected theme. Copper and sage remain decorative brand accents; accessible variants power controls and text."
          />
          <h2 id="color-heading" className="sr-only">
            Color tokens
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Background", "bg-background"],
              ["Card", "bg-card"],
              ["Primary", "bg-primary"],
              ["Secondary", "bg-secondary"],
              ["Accent", "bg-accent"],
              ["Muted", "bg-muted"],
              ["Success", "bg-success"],
              ["Warning", "bg-warning"],
              ["Destructive", "bg-destructive"],
              ["Decorative Copper", "bg-brand-copper"],
              ["Decorative Sage", "bg-brand-sage"],
              ["Border / Input", "bg-card border-2"],
            ].map(([label, background]) => (
              <div className="space-y-2" key={label}>
                <div
                  aria-hidden="true"
                  className={`h-16 rounded-xl border border-border ${background}`}
                />
                <p className="text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="type-heading" className="space-y-6">
          <SectionHeader
            eyebrow="03 / Type"
            title="Editorial voice, practical interface."
            description="Instrument Serif provides expressive display moments; Geist keeps navigation, controls, and reading clear."
          />
          <Card>
            <CardContent className="space-y-7 py-6">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Display / Instrument Serif
                </p>
                <h2
                  id="type-heading"
                  className="font-display text-5xl leading-none sm:text-7xl"
                >
                  Make room for ideas.
                </h2>
              </div>
              <Separator />
              <div className="grid gap-5 sm:grid-cols-3">
                <p className="text-2xl font-semibold">Page heading / 24px</p>
                <p className="text-base leading-7">
                  Body text / Geist 16px with a comfortable reading rhythm.
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Metadata / Geist 12px
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="component-heading" className="space-y-6">
          <SectionHeader
            eyebrow="04 / Components"
            title="Primitives, made StudioSpace."
            description="Selected shadcn primitives provide accessible interaction foundations. Visual variants are customized around our semantic palette and editorial identity."
          />
          <h2 id="component-heading" className="sr-only">
            Component examples
          </h2>
          <DesignPreviewInteractions />
        </section>

        <section aria-labelledby="loading-heading" className="space-y-6">
          <SectionHeader
            eyebrow="05 / States"
            title="Quiet feedback, clear intent."
            description="Loading and status treatments use semantic tokens and remain understandable without color alone."
          />
          <h2 id="loading-heading" className="sr-only">
            Loading and status examples
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Loading skeleton</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Skeleton className="size-20 shrink-0 rounded-xl" />
                <div className="flex flex-1 flex-col gap-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Badge variant="success">Available · verified</Badge>
                <Badge variant="warning">Pending review</Badge>
                <Badge variant="destructive">Unavailable</Badge>
                <Badge variant="category">Photography studio</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="border-t border-border pt-5 text-sm text-muted-foreground">
          Development-only preview · Not available in production
        </footer>
      </Container>
    </main>
  );
}
