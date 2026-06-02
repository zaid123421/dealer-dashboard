"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Cookies from "js-cookie";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TABLE_FIELD_BORDER } from "@/lib/table-border";

const LOCALE_COOKIE = "NEXT_LOCALE";

const LOCALES = [
  { value: "ar", label: "عربي" },
  { value: "en", label: "English" },
] as const;

export function LocaleSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  function handleChange(value: string) {
    Cookies.set(LOCALE_COOKIE, value);
    router.refresh();
  }

  const currentLabel = LOCALES.find((l) => l.value === locale)?.label ?? locale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="combobox-trigger"
          className={cn(
            "flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary-dark/90 hover:text-primary-onContainer hover:border-primary-dark",
            TABLE_FIELD_BORDER,
          )}
          aria-label="Language"
        >
          <span>{currentLabel}</span>
          <ChevronDown className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => handleChange(value)}
            className={cn(
              value === locale && "bg-primary-dark text-primary-onContainer",
              "data-[highlighted]:bg-primary-dark/90 data-[highlighted]:text-primary-onContainer"
            )}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
