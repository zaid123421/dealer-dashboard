"use client";

import { useEffect, useState } from "react";

/**
 * Wall-clock timestamp available only after mount.
 * Returns `null` during SSR/hydration so time-based UI stays consistent.
 */
export function useClientNowMs(): number | null {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  return nowMs;
}
