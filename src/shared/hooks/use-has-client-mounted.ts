"use client";

import { useSyncExternalStore } from "react";

/**
 * False during SSR and the hydration pass; true after the client has mounted.
 * Use to avoid SSR/client text or attribute mismatches (auth cookies, clocks, etc.).
 */
export function useHasClientMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
