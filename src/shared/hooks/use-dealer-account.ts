"use client";

import { useTranslations } from "next-intl";
import { ROLES, type Role } from "@/shared/config/roles";
import type { AuthUser } from "@/shared/types/auth-session";
import { useAuthUser, useDealerProfile, useRole } from "@/shared/hooks/use-can-access";

function getRoleLabel(role: Role | null | undefined, t: (key: string) => string): string {
  if (!role) return "—";
  switch (role) {
    case ROLES.ADMIN:
      return t("roleAdmin");
    case ROLES.SUPPLIER:
      return t("roleSupplier");
    case ROLES.USER:
      return t("roleUser");
    default:
      return role;
  }
}

export function getAvatarInitials(
  user: Pick<AuthUser, "firstName" | "lastName" | "email"> | null | undefined,
  fallback: string,
): string {
  if (user) {
    const fi = user.firstName?.trim();
    const la = user.lastName?.trim();
    if (fi && la) return `${fi[0]}${la[0]}`.toUpperCase();
    if (fi && fi.length >= 2) return fi.slice(0, 2).toUpperCase();
    if (fi) return `${fi[0]}${fi[0]}`.toUpperCase();
    const em = user.email?.trim();
    if (em) {
      const alpha = em.replace(/[^a-zA-Z\u0600-\u06FF]/g, "");
      if (alpha.length >= 2) return alpha.slice(0, 2).toUpperCase();
      return em.slice(0, 2).toUpperCase();
    }
  }
  const p = fallback.trim();
  const words = p.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  if (p.length >= 2) return p.slice(0, 2).toUpperCase();
  return "?";
}

/** Display helpers sourced from GET /v1/dealer/me (user + dealerProfile). */
export function useDealerAccount() {
  const tNav = useTranslations("nav");
  const user = useAuthUser();
  const profile = useDealerProfile();
  const role = useRole();

  const displayName = (() => {
    if (!user) return tNav("defaultAccountName");
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return name || user.email || tNav("defaultAccountName");
  })();

  const roleDisplay = user?.backendRole?.trim()
    ? user.backendRole
    : getRoleLabel(role, tNav);

  const planName = profile?.activeSubscription?.planName?.trim() || null;
  const subscriptionStatus =
    profile?.activeSubscription?.status?.trim() ||
    profile?.usage?.subscriptionStatus?.trim() ||
    null;
  const accessLevel =
    user?.accessLevel?.trim() || profile?.currentUser?.accessLevel?.trim() || null;
  const dealerUniqueId = profile?.dealer?.dealerUniqueId?.trim() || null;
  const alerts = profile?.alerts ?? [];
  const usage = profile?.usage ?? null;
  const avatarInitials = getAvatarInitials(user, displayName);

  return {
    user,
    profile,
    displayName,
    roleDisplay,
    planName,
    subscriptionStatus,
    accessLevel,
    dealerUniqueId,
    alerts,
    usage,
    avatarInitials,
  };
}
