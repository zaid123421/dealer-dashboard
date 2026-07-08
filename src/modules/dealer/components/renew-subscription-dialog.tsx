"use client";

import { useState, type FormEvent } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DialogDescription,
  DialogTitle,
  FormDialogContent,
  FormDialogFooter,
  SuccessDialogContent,
} from "@/components/ui/app-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { RADIUS_PANEL } from "@/lib/radius";
import { PRIMARY_BUTTON_RESPONSIVE, PRIMARY_BUTTON_PILL_CLASS } from "@/lib/primary-button-styles";
import { TABLE_BORDER } from "@/lib/table-border";
import { formatLocaleDate } from "@/lib/format-locale";
import { useRenewSubscription } from "@/modules/dealer/hooks/use-renew-subscription";
import { RenewSubscriptionError } from "@/modules/dealer/services/renew-subscription.service";
import type { DealerMeSubscription } from "@/modules/dealer/types/dealer-profile";

type RenewSubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: number;
  subscription: DealerMeSubscription | null;
};

function formatSubscriptionDate(value: string | null, locale: string): string {
  return formatLocaleDate(value, locale);
}

type RenewSubscriptionFormProps = {
  subscription: DealerMeSubscription | null;
  subscriptionId: number;
  onClose: () => void;
  onSuccess: () => void;
};

function RenewSubscriptionForm({
  subscription,
  subscriptionId,
  onClose,
  onSuccess,
}: RenewSubscriptionFormProps) {
  const t = useTranslations("subscription");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const renewMutation = useRenewSubscription();

  const [amountPaid, setAmountPaid] = useState(() =>
    subscription?.amountPaid != null && subscription.amountPaid > 0
      ? String(subscription.amountPaid)
      : "",
  );
  const [autoRenew, setAutoRenew] = useState(() => subscription?.autoRenew ?? true);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldError(null);

    const trimmedAmount = amountPaid.trim();
    let parsedAmount: number | undefined;
    if (trimmedAmount) {
      parsedAmount = Number(trimmedAmount);
      if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
        setFieldError(t("amountPaidInvalid"));
        return;
      }
    }

    try {
      await renewMutation.mutateAsync({
        subscriptionId,
        payload: {
          ...(parsedAmount != null ? { amountPaid: parsedAmount } : {}),
          autoRenew,
        },
      });
      onSuccess();
    } catch (err) {
      if (err instanceof RenewSubscriptionError) {
        toast.error(err.message);
        return;
      }
      toast.error(tCommon("formError"));
    }
  }

  const planName = subscription?.planName?.trim() || "—";
  const endDate = formatSubscriptionDate(subscription?.endDate ?? null, locale);
  const pending = renewMutation.isPending;

  return (
    <FormDialogContent
      size="md"
      className="max-h-[min(92vh,640px)] overflow-y-auto overflow-x-hidden max-sm:w-[calc(100%-1.5rem)]"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="border-b px-6 pb-5 pt-6 dark:border-[var(--color-surface-container-high)] max-sm:px-4 max-sm:pb-4 max-sm:pt-5">
        <div className="space-y-3 text-start">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-dark/15 text-primary-dark max-sm:size-10">
              <RefreshCw className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1 pt-0.5">
              <DialogTitle className="text-title-md font-semibold leading-tight">
                {t("renewModalTitle")}
              </DialogTitle>
              <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
                {t("renewModalDescription")}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Plan summary card */}
        <div
          className={cn(
            "mt-5 grid gap-3 bg-muted/25 p-4 sm:grid-cols-2",
            RADIUS_PANEL,
            TABLE_BORDER,
            "max-sm:mt-4 max-sm:p-3",
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-dark/10 text-primary-dark">
              <Sparkles className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-label-sm font-medium uppercase tracking-wide text-muted-foreground">
                {t("planLabel")}
              </p>
              <p className="truncate text-body-md font-semibold text-foreground">{planName}</p>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-dark/10 text-primary-dark">
              <CalendarDays className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-label-sm font-medium uppercase tracking-wide text-muted-foreground">
                {t("currentEndDateLabel")}
              </p>
              <p className="text-body-md font-semibold text-foreground">{endDate}</p>
            </div>
          </div>
          <p className="col-span-full border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground">
            {t("renewExtensionHint")}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        id="renew-subscription-form"
        onSubmit={handleSubmit}
        className="space-y-5 px-6 py-5 max-sm:px-4 max-sm:py-4"
      >
        <div className="space-y-2">
          <Label htmlFor="renew-amount-paid" className="text-label-md font-medium">
            {t("amountPaidLabel")}
          </Label>
          <div className="relative">
            <Banknote
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="renew-amount-paid"
              name="amountPaid"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder={t("amountPaidPlaceholder")}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              disabled={pending}
              aria-invalid={!!fieldError}
              className="ps-10 text-body-lg tabular-nums"
            />
          </div>
          <p className="text-label-sm leading-relaxed text-muted-foreground">
            {t("amountPaidHint")}
          </p>
          {fieldError ? (
            <p className="text-sm text-error-main">{fieldError}</p>
          ) : null}
        </div>

        <button
          type="button"
          disabled={pending}
          aria-pressed={autoRenew}
          aria-label={t("autoRenewLabel")}
          onClick={() => setAutoRenew((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between gap-4 p-4 text-start transition-colors",
            "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
            "hover:border-primary-dark/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark/30",
            RADIUS_PANEL,
            TABLE_BORDER,
            autoRenew
              ? "border-primary-dark/25 bg-primary-dark/[0.04] dark:bg-primary-dark/10"
              : "bg-muted/20 hover:bg-muted/30",
            "max-sm:gap-3 max-sm:p-3",
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                autoRenew
                  ? "bg-primary-dark/15 text-primary-dark"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <CreditCard className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 space-y-0.5">
              <span className="block text-label-md font-medium text-foreground">
                {t("autoRenewLabel")}
              </span>
              <p className="text-label-sm leading-relaxed text-muted-foreground">
                {t("autoRenewHint")}
              </p>
            </div>
          </div>
          <Switch
            checked={autoRenew}
            disabled={pending}
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none shrink-0 data-[state=checked]:bg-primary-dark"
          />
        </button>
      </form>

      <FormDialogFooter
        className={cn(
          "gap-3 bg-muted/15",
          "max-sm:flex max-sm:flex-col-reverse max-sm:gap-2",
        )}
      >
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onClose}
          className="h-10 w-full border-border sm:w-auto"
        >
          {tCommon("cancel")}
        </Button>
        <Button
          type="submit"
          form="renew-subscription-form"
          disabled={pending}
          variant="brand"
          className={cn(
            PRIMARY_BUTTON_PILL_CLASS,
            PRIMARY_BUTTON_RESPONSIVE,
            "h-10 min-w-[9.5rem] max-sm:w-full max-sm:min-w-0",
          )}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {t("renewSubmitting")}
            </>
          ) : (
            <>
              <RefreshCw className="size-4" aria-hidden />
              {t("renewSubmit")}
            </>
          )}
        </Button>
      </FormDialogFooter>
    </FormDialogContent>
  );
}

export function RenewSubscriptionDialog({
  open,
  onOpenChange,
  subscriptionId,
  subscription,
}: RenewSubscriptionDialogProps) {
  const t = useTranslations("subscription");
  const tCommon = useTranslations("common");
  const [successOpen, setSuccessOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {open ? (
          <RenewSubscriptionForm
            key={`${subscriptionId}-${subscription?.amountPaid ?? "none"}-${subscription?.autoRenew ?? "none"}`}
            subscription={subscription}
            subscriptionId={subscriptionId}
            onClose={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false);
              queueMicrotask(() => setSuccessOpen(true));
            }}
          />
        ) : null}
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <SuccessDialogContent>
          <div className="flex flex-col items-center gap-4 pb-1 pt-2 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-8 stroke-[2]" aria-hidden />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-title-md font-semibold">
                {t("renewSuccessTitle")}
              </DialogTitle>
              <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
                {t("renewSuccessDescription")}
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="brand"
              className={cn(
                PRIMARY_BUTTON_PILL_CLASS,
                "mt-1 w-full max-w-[12rem]",
                PRIMARY_BUTTON_RESPONSIVE,
              )}
              onClick={() => setSuccessOpen(false)}
            >
              {tCommon("ok")}
            </Button>
          </div>
        </SuccessDialogContent>
      </Dialog>
    </>
  );
}
