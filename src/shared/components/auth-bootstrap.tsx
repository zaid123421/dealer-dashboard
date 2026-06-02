"use client";

import { useDealerMe } from "@/modules/dealer/hooks/use-dealer-me";

/** Loads GET /v1/dealer/me on dashboard mount and keeps auth store in sync. */
export function AuthBootstrap() {
  useDealerMe();
  return null;
}
