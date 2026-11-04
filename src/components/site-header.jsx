"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { StudioSpaceLogo } from "@/components/brand/studiospace-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/studios", label: "Explore Studios" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#about", label: "About Us" },
];

function getInitials(user) {
  const name = typeof user?.name === "string" ? user.name.trim() : "";
  const email = typeof user?.email === "string" ? user.email.trim() : "";
  const words = (name || email || "StudioSpace").split(/[\s@._-]+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function isHttpImageUrl(value) {
  if (typeof value !== "string") return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function AccountAvatar({ user, compact = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const size = compact ? "size-8" : "size-9";
  const image = typeof user?.image === "string" ? user.image : "";

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-secondary-foreground`}
    >
      {image && !imageFailed && isHttpImageUrl(image) ? (
        <Image
          alt=""
          className="object-cover"
          fill
          onError={() => setImageFailed(true)}
          sizes={compact ? "32px" : "36px"}
          src={image}
          unoptimized
        />
      ) : (
        getInitials(user)
      )}
    </span>
  );
}

function AccountMenu({ user, onLogout, mobile = false }) {
  const label = user?.name || user?.email || "Your account";
  const buttonClass = mobile
    ? "flex w-full items-center justify-start gap-3 rounded-xl px-3 py-3 text-left"
    : "max-w-48 justify-start gap-2 px-2";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Open account menu for ${label}`}
          className={buttonClass}
          size={mobile ? "default" : "sm"}
          type="button"
          variant={mobile ? "ghost" : "outline"}
        >
          <AccountAvatar compact={!mobile} user={user} />
          <span className="min-w-0 truncate">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="truncate">{user?.name || "StudioSpace member"}</span>
          {user?.email ? (
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} variant="destructive">
          <LogOut aria-hidden="true" className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending: sessionPending, refetch } = authClient.useSession();
  const [activeHash, setActiveHash] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const user = session?.user ?? null;

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

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const result = await authClient.signOut();
      if (result?.error) {
        toast.error(result.error.message || "Unable to log out. Please try again.");
        return;
      }
      await refetch();
      setMobileMenuOpen(false);
      toast.success("You have been logged out.");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[1320px] items-center justify-between gap-4 px-5 max-[360px]:gap-1 max-[360px]:px-3 sm:px-8 lg:px-12">
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
            {sessionPending ? (
              <span
                aria-label="Checking your account"
                className="h-9 w-36 animate-pulse rounded-lg bg-secondary"
                role="status"
              />
            ) : user ? (
              <AccountMenu onLogout={handleLogout} user={user} />
            ) : (
              <>
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
              </>
            )}
            <Button asChild size="sm">
              <Link href="/studios" prefetch={false}>
                Host Your Space
              </Link>
            </Button>
          </div>
          <div className="max-[360px]:hidden">
            <ThemeToggle />
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
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
              onEscapeKeyDown={() => setMobileMenuOpen(false)}
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
                {sessionPending ? (
                  <span
                    aria-label="Checking your account"
                    className="mx-3 my-2 h-11 animate-pulse rounded-xl bg-secondary"
                    role="status"
                  />
                ) : user ? (
                  <div className="px-2 py-1">
                    <AccountMenu
                      mobile
                      onLogout={handleLogout}
                      user={user}
                    />
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
                    <Link href="/studios" prefetch={false}>
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
