"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { RenewSubscriptionDialog } from "@/modules/dealer/components/renew-subscription-dialog";
import { useSubscriptionRenewalContext } from "@/modules/dealer/hooks/use-subscription-renewal-context";

type RenewSubscriptionDialogContextValue = {
  openRenewDialog: () => void;
};

const RenewSubscriptionDialogContext =
  createContext<RenewSubscriptionDialogContextValue | null>(null);

export function RenewSubscriptionDialogProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("subscription");
  const renewalContext = useSubscriptionRenewalContext();
  const [open, setOpen] = useState(false);

  const openRenewDialog = useCallback(() => {
    if (!renewalContext.subscriptionId) {
      toast.error(t("noSubscriptionToRenew"));
      return;
    }
    if (!renewalContext.canManageRenewal) {
      toast.error(t("renewContactAdmin"));
      return;
    }
    setOpen(true);
  }, [renewalContext.canManageRenewal, renewalContext.subscriptionId, t]);

  const value = useMemo(
    () => ({ openRenewDialog }),
    [openRenewDialog],
  );

  return (
    <RenewSubscriptionDialogContext.Provider value={value}>
      {children}
      {renewalContext.subscriptionId ? (
        <RenewSubscriptionDialog
          open={open}
          onOpenChange={setOpen}
          subscriptionId={renewalContext.subscriptionId}
          subscription={renewalContext.subscription}
        />
      ) : null}
    </RenewSubscriptionDialogContext.Provider>
  );
}

export function useRenewSubscriptionDialog(): RenewSubscriptionDialogContextValue {
  const ctx = useContext(RenewSubscriptionDialogContext);
  if (!ctx) {
    throw new Error(
      "useRenewSubscriptionDialog must be used within RenewSubscriptionDialogProvider",
    );
  }
  return ctx;
}

export function useRenewSubscriptionDialogOptional(): RenewSubscriptionDialogContextValue | null {
  return useContext(RenewSubscriptionDialogContext);
}
