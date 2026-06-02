/** Matches StyledTable outer container border. */
export const TABLE_BORDER_COLOR =
  "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]";

export const TABLE_BORDER = `border-2 ${TABLE_BORDER_COLOR}`;

/** Orange border on focus — light: primary-main-light, dark: primary-main-dark. */
export const TABLE_FIELD_FOCUS =
  "focus:border-[var(--color-primary-main-light)] focus-visible:border-[var(--color-primary-main-light)] dark:focus:border-[var(--color-primary-main-dark)] dark:focus-visible:border-[var(--color-primary-main-dark)] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0";

/** Default border for text inputs, selects, textareas, and combobox triggers. */
export const TABLE_FIELD_BORDER = `${TABLE_BORDER} bg-card ${TABLE_FIELD_FOCUS}`;

/** Nested detail / info boxes inside tables (e.g. order set rows). */
export const TABLE_DETAIL_BOX = `${TABLE_BORDER} bg-card rounded-lg`;
