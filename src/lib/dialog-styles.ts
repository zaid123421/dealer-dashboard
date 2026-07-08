import { cn } from "@/lib/utils";
import {
  DIALOG_SHELL_CLASS,
  RADIUS_MODAL,
} from "@/lib/radius";

export {
  DIALOG_SHELL_CLASS,
  DIALOG_FOOTER_BUTTON_CLASS,
} from "@/lib/radius";

export {
  PRIMARY_BUTTON_CLASS as CART_MODAL_SUBMIT_BUTTON_CLASS,
  PRIMARY_BUTTON_RESPONSIVE as CART_MODAL_SUBMIT_RESPONSIVE,
} from "@/lib/primary-button-styles";

export const DIALOG_SIZE = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
} as const;

export type DialogSize = keyof typeof DIALOG_SIZE;

export const DIALOG_FORM_SHELL_CLASS =
  "w-full gap-0 overflow-hidden p-0 max-h-[min(90vh,720px)] overflow-y-auto";

export const DIALOG_CONFIRM_SHELL_CLASS = DIALOG_SHELL_CLASS;

export const DIALOG_SUCCESS_SHELL_CLASS =
  "gap-0 overflow-hidden p-6 [&>button.absolute]:hidden";

export const FORM_DIALOG_HEADER_CLASS =
  "px-6 pb-4 pt-6 text-start max-sm:px-4 max-sm:pt-5";

export const FORM_DIALOG_BODY_CLASS = "px-6 py-4 max-sm:px-4";

export const FORM_DIALOG_FOOTER_CLASS =
  "flex flex-col-reverse gap-2 border-t border-[var(--border)] px-6 py-4 sm:flex-row sm:justify-end sm:space-x-2 rtl:sm:space-x-reverse max-sm:px-4";

export function dialogFormContentClass(
  size: DialogSize = "lg",
  className?: string,
) {
  return cn(RADIUS_MODAL, DIALOG_SIZE[size], DIALOG_FORM_SHELL_CLASS, className);
}

export function dialogConfirmContentClass(className?: string) {
  return cn("max-w-md", DIALOG_CONFIRM_SHELL_CLASS, className);
}

export function dialogSuccessContentClass(className?: string) {
  return cn(
    "max-w-[calc(100%-2rem)] sm:max-w-sm",
    DIALOG_SUCCESS_SHELL_CLASS,
    className,
  );
}

/** @deprecated Use dialogFormContentClass — kept for gradual migration */
export const CART_MODAL_CONTENT_CLASS = "";
