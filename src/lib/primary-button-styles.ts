import { cn } from "@/lib/utils";
import { RADIUS_CONTROL } from "@/lib/radius";

/** Unified orange CTA — same base + hover everywhere. */
export const PRIMARY_BUTTON_CLASS =
  "border-0 bg-primary-dark text-primary-onContainer font-semibold shadow-none transition-all duration-[var(--duration-normal)] hover:bg-primary-dark/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 dark:bg-primary-dark dark:text-primary-onContainer dark:hover:bg-primary-dark/90";

/** Full-width on mobile, auto width from sm+. */
export const PRIMARY_BUTTON_RESPONSIVE = "w-full sm:w-auto";

/** Solid orange pill CTA (orders, delivery cart dialogs). */
export const PRIMARY_BUTTON_PILL_CLASS = cn(
  PRIMARY_BUTTON_CLASS,
  "rounded-full gap-2 font-medium",
);

/** Auth submit buttons (login, register, etc.). */
export const AUTH_PRIMARY_BUTTON_CLASS = cn(
  "flex h-13 w-full items-center justify-center text-title-md font-bold text-secondary-main shadow-md",
  RADIUS_CONTROL,
  PRIMARY_BUTTON_CLASS,
);
