"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeValue = "light" | "dark" | "system";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("theme");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const options: { value: ThemeValue; icon: React.ReactNode }[] = [
    { value: "light", icon: <Sun className="size-4" /> },
    { value: "dark", icon: <Moon className="size-4" /> },
    { value: "system", icon: <Monitor className="size-4" /> },
  ];

  const shellClass = cn(
    "flex gap-1 rounded-md border border-input p-1",
    "max-sm:w-full",
  );

  const buttonClass = (active: boolean) =>
    cn(
      "rounded p-1.5 transition-colors max-sm:flex-1 max-sm:p-2",
      active
        ? "bg-primary-dark text-primary-onContainer"
        : "text-muted-foreground hover:bg-primary-dark/90 hover:text-primary-onContainer",
    );

  if (!mounted) {
    return (
      <div className={shellClass}>
        {options.map(({ value, icon }) => (
          <button
            key={value}
            type="button"
            className="rounded p-1.5 transition-colors max-sm:flex-1 max-sm:p-2"
            aria-label={t(value)}
          >
            {icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={shellClass}>
      {options.map(({ value, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          title={t(value)}
          className={buttonClass(theme === value)}
          aria-label={t(value)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
