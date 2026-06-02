import { cn } from "@/lib/utils";
import { TABLE_BORDER_COLOR } from "@/lib/table-border";

/** Shared validation styling — matches invalid field border (`--color-error-main`). */
export const FIELD_INVALID_BORDER_CLASS =
  "aria-invalid:border-error-main aria-invalid:ring-error-main/20 dark:aria-invalid:ring-error-main/40";

export const FIELD_ERROR_TEXT_CLASS = "text-error-main";

export const FIELD_ERROR_MESSAGE_CLASS = "text-sm text-error-main";

/** Split phone field (country select + local number) — single outer border. */
export function fieldGroupWrapperClass(invalid: boolean) {
  return cn(
    "flex min-w-0 overflow-hidden rounded-md border-2 bg-card transition-colors",
    invalid
      ? "border-error-main focus-within:border-error-main"
      : cn(
          TABLE_BORDER_COLOR,
          "focus-within:border-[var(--color-primary-main-light)] dark:focus-within:border-[var(--color-primary-main-dark)]",
        ),
  );
}

export const FIELD_GROUP_INNER_SELECT_CLASS =
  "h-10 w-[90px] shrink-0 rounded-none border-0 border-e-2 border-inherit bg-card shadow-none ring-0 focus:ring-0 focus-visible:ring-0 data-[state=open]:border-inherit data-[state=open]:ring-0 dark:data-[state=open]:border-inherit [&>span]:text-primary-dark";

export const FIELD_GROUP_INNER_INPUT_CLASS =
  "h-10 min-w-0 flex-1 rounded-none border-0 bg-card shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-primary-dark/70";
