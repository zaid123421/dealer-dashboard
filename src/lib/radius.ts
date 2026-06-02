/**
 * TreadX border-radius scale — maps to Tailwind `rounded-*` → `variables.css` `--radius-*`.
 *
 * | Token   | Use case                          |
 * |---------|-----------------------------------|
 * | md      | Buttons, inputs, selects          |
 * | lg      | Cards, panels, tables, in-modal   |
 * | xl      | Dialog / sheet shells only        |
 * | full    | Pills, badges, switches           |
 */
export const RADIUS_NONE = "rounded-none";
export const RADIUS_SM = "rounded-sm";
export const RADIUS_MD = "rounded-md";
export const RADIUS_LG = "rounded-lg";
export const RADIUS_XL = "rounded-xl";
export const RADIUS_2XL = "rounded-2xl";
export const RADIUS_FULL = "rounded-full";

/** Modal & sheet outer shell (--radius-xl) */
export const RADIUS_MODAL = RADIUS_XL;

/** Cards, data tables, page panels, blocks inside modals (--radius-lg) */
export const RADIUS_PANEL = RADIUS_LG;

/** Form controls (--radius-md) */
export const RADIUS_CONTROL = RADIUS_MD;

/** Chips, status badges, pagination (--radius-full) */
export const RADIUS_PILL = RADIUS_FULL;

/** Shared dialog layout (radius comes from DialogContent default) */
export const DIALOG_SHELL_CLASS =
  "gap-0 overflow-hidden border-[var(--border)] p-6 shadow-lg";

/** Dialog footer buttons — same radius as inputs/outline actions */
export const DIALOG_FOOTER_BUTTON_CLASS = RADIUS_CONTROL;
