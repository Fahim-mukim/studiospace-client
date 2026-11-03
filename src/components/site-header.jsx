"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { StudioSpaceLogo } from "@/components/brand/studiospace-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/#studios", label: "Explore Studios" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#about", label: "About Us" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    window.addEventListener("popstate", updateHash);
    return () => {
      window.removeEventListener("hashchange", updateHash);
      window.removeEventListener("popstate", updateHash);
    };
  }, []);

  function updateActiveLocation(href) {
    const hash = href.split("#")[1];
    setActiveHash(hash ? `#${hash}` : "");
  }

  function isCurrentLocation(href) {
    const [path, hash] = href.split("#");
    const matchesPath = pathname === (path || "/");
    return matchesPath && (hash ? activeHash === `#${hash}` : !activeHash);
  }

  function navigationClassName(isActive, mobile = false) {
    const base = mobile
      ? "rounded-xl px-3 py-3 text-base font-medium transition-colors"
      : "rounded-lg text-sm font-medium transition-colors";

    return `${base} ${
      isActive
        ? "text-foreground underline decoration-primary decoration-2 underline-offset-8"
        : "text-muted-foreground hover:text-foreground"
    }`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Link
          aria-label="StudioSpace home"
          className="rounded-lg"
          href="/"
          onClick={() => updateActiveLocation("/")}
        >
          <StudioSpaceLogo />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              aria-current={
                isCurrentLocation(item.href)
                  ? item.href.includes("#")
                    ? "location"
                    : "page"
                  : undefined
              }
              className={navigationClassName(isCurrentLocation(item.href))}
              href={item.href}
              key={item.href}
              onClick={() => updateActiveLocation(item.href)}
              prefetch={false}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              href="/login"
              prefetch={false}
            >
              Login
            </Link>
            <Link
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              href="/register"
              prefetch={false}
            >
              Register
            </Link>
            <Button asChild size="sm">
              <Link href="/#host-guarantee" prefetch={false}>
                Host Your Space
              </Link>
            </Button>
          </div>
          <div className="max-[360px]:hidden">
            <ThemeToggle />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                aria-label="Open navigation menu"
                className="lg:hidden"
                size="icon"
                variant="outline"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              aria-describedby={undefined}
              className="w-[min(22rem,88vw)]"
              side="right"
            >
              <SheetHeader className="border-b border-border pb-5">
                <SheetTitle>
                  <StudioSpaceLogo />
                </SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col gap-1 px-4"
              >
                {navigation.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      aria-current={
                        isCurrentLocation(item.href)
                          ? item.href.includes("#")
                            ? "location"
                            : "page"
                          : undefined
                      }
                      className={navigationClassName(
                        isCurrentLocation(item.href),
                        true,
                      )}
                      href={item.href}
                      onClick={() => updateActiveLocation(item.href)}
                      prefetch={false}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    className="rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                    href="/login"
                    prefetch={false}
                  >
                    Login
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    className="rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                    href="/register"
                    prefetch={false}
                  >
                    Register
                  </Link>
                </SheetClose>
              </nav>
              <div className="mx-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Appearance
                </span>
                <ThemeToggle />
              </div>
              <div className="mt-auto p-4">
                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <Link href="/#host-guarantee" prefetch={false}>
                      Host Your Space
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
