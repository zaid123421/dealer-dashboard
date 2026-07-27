import type {
  DealerMeSubscription,
  DealerProfile,
} from "@/modules/dealer/types/dealer-profile";

export const RENEW_SOON_DAYS = 7;

/** Only this backend role may renew dealer subscriptions. */
export const RENEW_SUBSCRIPTION_BACKEND_ROLE = "DEALER_ADMIN";

export function isDealerAdminBackendRole(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  return raw.trim().toUpperCase() === RENEW_SUBSCRIPTION_BACKEND_ROLE;
}

export type SubscriptionRenewalContext = {
  subscriptionId: number | null;
  subscription: DealerMeSubscription | null;
  hasActiveSubscription: boolean;
  daysToExpiry: number | null;
  canManageRenewal: boolean;
  showRenewPrimary: boolean;
  showRenewOutline: boolean;
  showRenewInSettings: boolean;
  showContactAdmin: boolean;
};

export function getSubscriptionRenewalContext(
  profile: DealerProfile | null,
  backendRole: string | null | undefined,
): SubscriptionRenewalContext {
  const subscription = profile?.activeSubscription ?? null;
  const subscriptionId =
    subscription?.id != null && subscription.id > 0 ? subscription.id : null;
  const hasActiveSubscription = profile?.usage?.hasActiveSubscription ?? false;
  const daysToExpiry = profile?.usage?.daysToSubscriptionExpiry ?? null;
  const roleName =
    backendRole?.trim() || profile?.currentUser?.roleName?.trim() || "";
  const canManageRenewal =
    isDealerAdminBackendRole(roleName) && subscriptionId != null;

  return {
    subscriptionId,
    subscription,
    hasActiveSubscription,
    daysToExpiry,
    canManageRenewal,
    showRenewPrimary: canManageRenewal && !hasActiveSubscription,
    showRenewOutline:
      canManageRenewal &&
      hasActiveSubscription &&
      daysToExpiry != null &&
      daysToExpiry <= RENEW_SOON_DAYS,
    /** Settings: renew only after the plan has ended (not while still active). */
    showRenewInSettings: canManageRenewal && !hasActiveSubscription,
    showContactAdmin: !canManageRenewal && !hasActiveSubscription,
  };
}
