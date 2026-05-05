"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, Lock, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeSwitcher } from "./theme-switcher";
import { LocaleSwitcher } from "./locale-switcher";
import { useAuthUser, useRole } from "@/shared/hooks/use-can-access";
import { ROLES } from "@/shared/config/roles";
import type { Role } from "@/shared/config/roles";
import {
  changePasswordUseCase,
  ChangePasswordError,
} from "@/application/auth/change-password.use-case";

const MIN_PASSWORD_LENGTH = 8;

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

export function SettingsContent() {
  const t = useTranslations("settings");
  const tNav = useTranslations("nav");
  const tValidation = useTranslations("validation");
  const tCommon = useTranslations("common");
  const role = useRole();
  const user = useAuthUser();
  const roleLabel = getRoleLabel(role, tNav);

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
  const accountName = (() => {
    if (!user) return tNav("defaultAccountName");
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return name || user.email || tNav("defaultAccountName");
  })();

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
    <div className="space-y-6 break-words">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-title-md font-semibold text-foreground mb-4">
            {t("accountSection")}
          </h2>
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-dark/20 text-primary-dark">
              <User className="size-7" />
            </div>
            <div className="min-w-0">
              <p className="text-label-md text-muted-foreground">{roleLabel}</p>
              <p className="text-title-md font-semibold text-foreground">
                {accountName}
              </p>
              {user?.email ? (
                <p className="mt-1 truncate text-body-sm text-muted-foreground">{user.email}</p>
              ) : null}
              {user?.tenantName ? (
                <p className="mt-0.5 truncate text-body-sm text-muted-foreground">
                  {user.tenantName}
                  {user.backendRole ? (
                    <span className="text-muted-foreground/80"> · {user.backendRole}</span>
                  ) : null}
                </p>
              ) : null}
              <span className="mt-2 inline-block rounded-full bg-primary-dark px-2.5 py-0.5 text-label-sm font-medium text-primary-onContainer">
                {tNav("professionalPlan")}
              </span>
            </div>
          </div>
        </section>

        {/* Security — change password (modal) */}
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h2 className="text-title-md font-semibold text-foreground">
                {t("securitySection")}
              </h2>
              <p className="text-body-sm text-muted-foreground">{t("securitySectionHint")}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 gap-2 sm:ms-4"
              onClick={() => setChangePasswordOpen(true)}
            >
              <Lock className="size-4 shrink-0" />
              {t("openChangePassword")}
            </Button>
          </div>

          <Dialog open={changePasswordOpen} onOpenChange={onChangePasswordOpenChange}>
            <DialogContent className="max-w-md gap-0 p-0 sm:rounded-xl">
              <DialogHeader className="p-6 pb-4 text-start">
                <DialogTitle>{t("changePasswordModalTitle")}</DialogTitle>
                <DialogDescription>{t("changePasswordModalDescription")}</DialogDescription>
              </DialogHeader>

              <form
                id="settings-change-password-form"
                onSubmit={handleChangePassword}
                className="space-y-4 p-6 pt-4"
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
                    <p className="text-sm text-destructive">{fieldErrors.currentPassword}</p>
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
                    <p className="text-sm text-destructive">{fieldErrors.newPassword}</p>
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
                    <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
                  ) : null}
                </div>
              </form>

              <DialogFooter className="gap-2 p-6 pt-4 sm:space-x-0">
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
                  className="w-full sm:w-auto"
                >
                  {t("updatePasswordButton")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={passwordSuccessOpen} onOpenChange={setPasswordSuccessOpen}>
            <DialogContent className="max-w-[calc(100%-2rem)] gap-0 border border-border p-6 shadow-lg sm:max-w-sm [&>button.absolute]:hidden">
              <div className="flex flex-col items-center gap-3 pb-1 pt-1 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CheckCircle2 className="size-7 stroke-[2]" aria-hidden />
                </div>
                <DialogHeader className="space-y-2 text-center sm:text-center">
                  <DialogTitle className="text-title-md">{t("passwordChangeSuccessTitle")}</DialogTitle>
                  <DialogDescription className="text-body-sm text-muted-foreground">
                    {t("passwordChangeSuccess")}
                  </DialogDescription>
                </DialogHeader>
                <Button
                  type="button"
                  className="mt-2 w-full max-w-[12rem]"
                  onClick={() => setPasswordSuccessOpen(false)}
                >
                  {tCommon("ok")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Appearance Section */}
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-title-md font-semibold text-foreground mb-4">
            {t("appearanceSection")}
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-foreground">
                {t("themeLabel")}
              </span>
              <ThemeSwitcher />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-foreground">
                {t("languageLabel")}
              </span>
              <LocaleSwitcher />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
