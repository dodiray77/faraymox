"use client";
import { Moon, Sun } from "@primeicons/react";
import { Button } from "@primereact/ui/button";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      severity="secondary"
      variant="outlined"
      size="small"
      iconOnly
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      className="relative!"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
