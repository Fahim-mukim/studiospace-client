import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function AuthPageShell({ children, description, eyebrow, title }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-10 sm:py-14">
        <Container>
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[2rem] border border-border bg-card shadow-card lg:min-h-[42rem] lg:grid-cols-[0.88fr_1.12fr]">
            <aside className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-10 text-background lg:flex">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-32 -bottom-28 size-[28rem] rounded-full border border-background/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -bottom-12 size-[20rem] rounded-full border border-background/10"
              />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-copper">
                  StudioSpace
                </p>
                <p className="mt-2 text-sm text-background/65">
                  Spaces for the work you imagine.
                </p>
              </div>
              <div className="relative max-w-sm py-12">
                <p className="text-sm font-medium text-background/65">
                  Find your frame
                </p>
                <p className="mt-4 font-display text-5xl leading-[0.98] tracking-tight">
                  Make room for what you&apos;re making.
                </p>
                <p className="mt-5 max-w-xs text-sm leading-6 text-background/70">
                  Discover thoughtful creative spaces and bring your next idea
                  into focus.
                </p>
              </div>
              <p className="relative text-xs text-background/55">
                A creative community, one space at a time.
              </p>
            </aside>
            <section className="flex min-w-0 items-center px-6 py-10 sm:px-10 lg:px-14">
              <div className="mx-auto w-full min-w-0 max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {eyebrow}
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  {description}
                </p>
                <div className="mt-8">{children}</div>
              </div>
            </section>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

export function AuthPageFallback(props) {
  return (
    <AuthPageShell {...props}>
      <div aria-busy="true" aria-label="Loading authentication form" role="status">
        <span className="mb-4 block h-11 animate-pulse rounded-xl bg-secondary" />
        <span className="mb-6 block h-4 animate-pulse rounded bg-secondary" />
        <span className="mb-4 block h-11 animate-pulse rounded-xl bg-secondary" />
        <span className="mb-4 block h-11 animate-pulse rounded-xl bg-secondary" />
        <span className="block h-11 animate-pulse rounded-xl bg-secondary" />
      </div>
    </AuthPageShell>
  );
}
