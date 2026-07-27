export const WEEK_DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type WeekDay = (typeof WEEK_DAY_ORDER)[number];

const WEEK_DAY_SET = new Set<string>(WEEK_DAY_ORDER);

/** Normalize API serviceDays to known weekdays, ordered Mon→Sun. */
export function normalizeServiceDays(days: string[] | null | undefined): WeekDay[] {
  if (!days?.length) return [];
  const allowed = new Set(
    days
      .map((day) => day.trim().toUpperCase())
      .filter((day): day is WeekDay => WEEK_DAY_SET.has(day)),
  );
  return WEEK_DAY_ORDER.filter((day) => allowed.has(day));
}
