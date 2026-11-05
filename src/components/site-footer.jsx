import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StudioSpaceLogo } from "@/components/brand/studiospace-logo";
import { Container } from "@/components/container";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { studioCategories } from "@/data/homepage";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/studios", label: "Explore Studios" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#about", label: "About Us" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/add-studio", label: "Host Your Space" },
];

function XMark() {
  return (
    <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.84h-7.4l-5.8-7.59-6.64 7.59H.48l8.6-9.83L.99 1.15h7.59l5.24 6.93 5.08-6.93Zm-1.29 19.47h2.04L7.58 3.26H5.39l12.22 17.36Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_0.9fr_1.2fr]">
          <div className="max-w-sm">
            <Link aria-label="StudioSpace home" href="/">
              <StudioSpaceLogo />
            </Link>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Our aim is to bring creative people and distinctive workspaces
              closer together, making more room for good ideas.
            </p>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Official social profiles are not configured yet.
            </p>
            <span
              className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground"
            >
              <XMark />
              X profile coming soon
            </span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Quick Links</h2>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    href={link.href}
                    prefetch={false}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Popular Categories
            </h2>
            <ul className="mt-4 space-y-3">
              {studioCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    href={`/studios?category=${category.slug}`}
                    prefetch={false}
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              A note from StudioSpace
            </h2>
            <NewsletterSignup />
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 StudioSpace. All rights reserved. Terms and booking policies
            will be published before bookings open.
          </p>
          <Link
            className="inline-flex items-center gap-1 font-medium text-foreground"
            href="/add-studio"
            prefetch={false}
          >
            Host Your Space
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </Container>
    </footer>
  );
}
