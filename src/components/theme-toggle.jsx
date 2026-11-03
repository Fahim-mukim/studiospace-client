"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const Icon = !mounted ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <Button
      aria-label={
        mounted
          ? `Switch to ${nextTheme} theme (currently ${theme === "system" ? `system, ${resolvedTheme}` : theme})`
          : "Change color theme"
      }
      onClick={() => setTheme(nextTheme)}
      size="icon"
      type="button"
      variant="outline"
    >
      <Icon aria-hidden="true" />
      <span className="sr-only">Toggle light and dark theme</span>
    </Button>
  );
}
