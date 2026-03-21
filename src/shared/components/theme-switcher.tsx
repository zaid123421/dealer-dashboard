"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor } from "lucide-react";

type ThemeValue = "light" | "dark" | "system";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("theme");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const options: { value: ThemeValue; icon: React.ReactNode }[] = [
    { value: "light", icon: <Sun className="size-4" /> },
    { value: "dark", icon: <Moon className="size-4" /> },
    { value: "system", icon: <Monitor className="size-4" /> },
  ];

  if (!mounted) {
    return (
      <div className="flex gap-1 rounded-md border border-input p-1">
        {options.map(({ value, icon }) => (
          <button
            key={value}
            type="button"
            className="rounded p-1.5 transition-colors"
            aria-label={t(value)}
          >
            {icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1 rounded-md border border-input p-1">
      {options.map(({ value, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          title={t(value)}
          className={`rounded p-1.5 transition-colors ${
            theme === value
            ? "bg-primary text-primary-foreground"
            : "hover:bg-primary hover:text-primary-foreground"
          }`}
          aria-label={t(value)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
