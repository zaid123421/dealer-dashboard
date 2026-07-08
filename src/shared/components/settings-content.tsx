"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PRIMARY_BUTTON_RESPONSIVE } from "@/lib/primary-button-styles";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import {
  DialogDescription,
  DialogTitle,
  FormDialogContent,
  FormDialogFooter,
  FormDialogHeader,
  SuccessDialogContent,
} from "@/components/ui/app-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeSwitcher } from "./theme-switcher";
import { LocaleSwitcher } from "./locale-switcher";
import { cn } from "@/lib/utils";
import { useDealerAccount } from "@/shared/hooks/use-dealer-account";
import { DealerQuotaPanel } from "@/modules/dealer/components/dealer-quota-panel";
import { RenewSubscriptionButton } from "@/modules/dealer/components/renew-subscription-actions";
import { useSubscriptionRenewalContext } from "@/modules/dealer/hooks/use-subscription-renewal-context";
import {
  changePasswordUseCase,
  ChangePasswordError,
} from "@/application/auth/change-password.use-case";

const MIN_PASSWORD_LENGTH = 8;

/** Mobile-only card header: stack title + action vertically */
const MOBILE_CARD_HEADER = cn(
  "max-sm:grid-cols-1 max-sm:has-data-[slot=card-action]:grid-cols-1 max-sm:gap-3 max-sm:px-4 max-sm:pb-4",
);
const MOBILE_CARD_ACTION = cn(
  "max-sm:col-start-1 max-sm:row-start-auto max-sm:w-full max-sm:justify-self-stretch max-sm:pt-0.5",
);

export function SettingsContent() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const {
    user,
    displayName,
    roleDisplay,
    planName,
    subscriptionStatus,
    accessLevel,
    dealerUniqueId,
    avatarInitials,
  } = useDealerAccount();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordSuccessOpen, setPasswordSuccessOpen] = useState(false);
  const renewalContext = useSubscriptionRenewalContext();

  function resetChangePasswordForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFieldErrors({});
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  }

  function onChangePasswordOpenChange(open: boolean) {
    setChangePasswordOpen(open);
    if (!open) resetChangePasswordForm();
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!currentPassword.trim()) nextErrors.currentPassword = tValidation("passwordRequired");
    if (!newPassword.trim()) nextErrors.newPassword = tValidation("passwordRequired");
    else if (newPassword.length < MIN_PASSWORD_LENGTH)
      nextErrors.newPassword = tValidation("passwordMin");
    if (!confirmPassword.trim()) nextErrors.confirmPassword = tValidation("passwordRequired");
    else if (newPassword !== confirmPassword)
      nextErrors.confirmPassword = tValidation("passwordMismatch");
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await changePasswordUseCase({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      resetChangePasswordForm();
      setChangePasswordOpen(false);
      queueMicrotask(() => setPasswordSuccessOpen(true));
    } catch (err) {
      if (err instanceof ChangePasswordError) {
        if (err.code === "WRONG_CURRENT_PASSWORD") {
          toast.error(t("wrongCurrentPassword"));
          return;
        }
        toast.error(err.message);
        return;
      }
      toast.error(tCommon("formError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="min-w-0 space-y-6 break-words max-sm:space-y-4">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground max-sm:text-title-lg">
            {t("title")}
          </h1>
          <p className="mt-2 text-body-md text-subtle max-sm:mt-1.5 max-sm:text-body-sm">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-6 max-sm:space-y-4">
          <Card className="max-sm:gap-4 max-sm:py-4">
            <CardHeader className="max-sm:px-4">
              <CardTitle className="text-title-lg font-semibold text-foreground">{t("accountSection")}</CardTitle>
            </CardHeader>
            <CardContent className="max-sm:px-4">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-dark/20 text-sm font-bold uppercase tracking-tight text-primary-dark max-sm:size-12"
                  aria-hidden
                >
                  {avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">{roleDisplay}</p>
                  <p className="text-title-md font-semibold leading-tight text-foreground">{displayName}</p>
                  {user?.email ? (
                    <p className="mt-1 truncate text-body-sm text-muted-foreground max-sm:break-all max-sm:whitespace-normal">
                      {user.email}
                    </p>
                  ) : null}
                  {user?.tenantName ? (
                    <p className="mt-0.5 truncate text-body-sm text-muted-foreground max-sm:whitespace-normal">
                      {user.tenantName}
                      {dealerUniqueId ? (
                        <span className="text-muted-foreground/80"> · {dealerUniqueId}</span>
                      ) : null}
                    </p>
                  ) : null}
                  {accessLevel ? (
                    <p className="mt-0.5 text-body-sm text-muted-foreground">
                      {t("accessLevelLabel")}: {accessLevel}
                    </p>
                  ) : null}
                  {planName ? (
                    <span className="mt-2 inline-block rounded-full bg-primary-dark px-2.5 py-0.5 text-[11px] font-medium text-primary-onContainer">
                      {planName}
                      {subscriptionStatus ? ` · ${subscriptionStatus}` : ""}
                    </span>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="max-sm:gap-4 max-sm:py-4">
            <CardHeader
              className={cn(
                "border-b border-[var(--color-surface-light-container)] pb-6 dark:border-[var(--color-surface-container-high)]",
                MOBILE_CARD_HEADER,
              )}
            >
              <CardTitle className="text-title-lg font-semibold text-foreground">
                {t("subscriptionSection")}
              </CardTitle>
              {renewalContext.showRenewInSettings ? (
                <CardAction className={MOBILE_CARD_ACTION}>
                  <RenewSubscriptionButton
                    urgency={
                      renewalContext.showRenewPrimary
                        ? "inactive"
                        : renewalContext.showRenewOutline
                          ? "expiring"
                          : "default"
                    }
                    variant={
                      renewalContext.showRenewPrimary ? "brand" : "outline"
                    }
                    className="max-sm:w-full"
                  />
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent className="max-sm:px-4">
              <DealerQuotaPanel showRoles variant="full" />
            </CardContent>
          </Card>

          <Card className="max-sm:gap-4 max-sm:py-4">
            <CardHeader
              className={cn(
                "border-b border-[var(--color-surface-light-container)] pb-6 dark:border-[var(--color-surface-container-high)]",
                MOBILE_CARD_HEADER,
              )}
            >
              <CardTitle className="text-title-lg font-semibold text-foreground">{t("securitySection")}</CardTitle>
              <CardDescription className="text-body-md text-muted-foreground">
                {t("securitySectionHint")}
              </CardDescription>
              <CardAction className={MOBILE_CARD_ACTION}>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-10 shrink-0 font-semibold shadow-none max-sm:w-full",
                    "border-primary-dark/25 bg-card text-primary-dark hover:border-primary-dark/40 hover:bg-primary-dark/5",
                    "dark:border-primary-dark/35 dark:hover:bg-primary-dark/10",
                    "sm:w-auto",
                  )}
                  onClick={() => setChangePasswordOpen(true)}
                >
                  <Lock className="size-4 shrink-0" aria-hidden />
                  {t("openChangePassword")}
                </Button>
              </CardAction>
            </CardHeader>
          </Card>

          <Card className="max-sm:gap-4 max-sm:py-4">
            <CardHeader className="max-sm:px-4">
              <CardTitle className="text-title-lg font-semibold text-foreground">{t("appearanceSection")}</CardTitle>
            </CardHeader>
            <CardContent className="max-sm:px-4">
              <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-start sm:gap-8">
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-label-md font-medium text-foreground">{t("themeLabel")}</span>
                  <ThemeSwitcher />
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-label-md font-medium text-foreground">{t("languageLabel")}</span>
                  <LocaleSwitcher />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={changePasswordOpen} onOpenChange={onChangePasswordOpenChange}>
        <FormDialogContent
          size="md"
          className="max-sm:w-[calc(100%-1.5rem)] max-sm:max-h-[min(92vh,640px)]"
        >
          <FormDialogHeader>
            <DialogTitle>{t("changePasswordModalTitle")}</DialogTitle>
            <DialogDescription>{t("changePasswordModalDescription")}</DialogDescription>
          </FormDialogHeader>

          <form
            id="settings-change-password-form"
            onSubmit={handleChangePassword}
            className="space-y-4 px-6 py-4 max-sm:px-4"
          >
            <div className="space-y-2">
              <Label htmlFor="settings-current-password" className="text-label-md">
                {t("currentPasswordLabel")}
              </Label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-current-password"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="ps-10 pe-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showCurrent ? t("hidePassword") : t("showPassword")}
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {fieldErrors.currentPassword ? (
                <p className="text-sm text-error-main">{fieldErrors.currentPassword}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-new-password" className="text-label-md">
                {t("newPasswordLabel")}
              </Label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-new-password"
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="ps-10 pe-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showNew ? t("hidePassword") : t("showPassword")}
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {fieldErrors.newPassword ? (
                <p className="text-sm text-error-main">{fieldErrors.newPassword}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-confirm-password" className="text-label-md">
                {t("confirmPasswordLabel")}
              </Label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="ps-10 pe-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirm ? t("hidePassword") : t("showPassword")}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword ? (
                <p className="text-sm text-error-main">{fieldErrors.confirmPassword}</p>
              ) : null}
            </div>
          </form>

          <FormDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onChangePasswordOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              form="settings-change-password-form"
              disabled={isSubmitting}
              variant="brand"
              className={PRIMARY_BUTTON_RESPONSIVE}
            >
              {t("updatePasswordButton")}
            </Button>
          </FormDialogFooter>
        </FormDialogContent>
      </Dialog>

      <Dialog open={passwordSuccessOpen} onOpenChange={setPasswordSuccessOpen}>
        <SuccessDialogContent>
          <div className="flex flex-col items-center gap-3 pb-1 pt-1 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="size-7 stroke-[2]" aria-hidden />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-title-md">{t("passwordChangeSuccessTitle")}</DialogTitle>
              <DialogDescription className="text-body-sm text-muted-foreground">
                {t("passwordChangeSuccess")}
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="brand"
              className={cn("mt-2 w-full max-w-[12rem]", PRIMARY_BUTTON_RESPONSIVE)}
              onClick={() => setPasswordSuccessOpen(false)}
            >
              {tCommon("ok")}
            </Button>
          </div>
        </SuccessDialogContent>
      </Dialog>
    </>
  );
}
