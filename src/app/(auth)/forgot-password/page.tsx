"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorAlert } from "@/components/ui/error-alert";
import { ROUTES } from "@/constants/routes";
import { Mail, KeyRound, CheckCircle2 } from "lucide-react";
import { AUTH_PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { toast } from "sonner";
import {
  ForgotPasswordError,
  requestPasswordResetUseCase,
} from "@/application/auth/forgot-password.use-case";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function obfuscateEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***.***";
  const masked = (local?.[0] ?? "?") + "***";
  return `${masked}@${domain}`;
}

function BrandingPanel({ t }: { t: (key: string) => string }) {
  return (
    <section className="relative hidden overflow-hidden bg-background lg:flex lg:flex-col">
      <div className="absolute -top-4 -start-2 h-[65%] w-auto max-w-[42%] -rotate-[-10deg]">
        <div className="relative h-full w-full">
          <Image
            src="/images/feather.png"
            alt={t("brandPanelAlt")}
            width={400}
            height={500}
            priority
            className="h-full w-full object-contain"
          />
        </div>
      </div>
      <div className="absolute top-24 -end-16 h-[65%] w-auto max-w-[42%] rotate-[-60deg] [&_img]:mix-blend-multiply [&_img]:opacity-90">
        <div className="relative h-full w-full bg-primary">
          <Image
            src="/images/feather.png"
            alt={t("brandPanelAlt")}
            width={400}
            height={500}
            priority
            className="h-full w-full object-contain"
          />
        </div>
      </div>
      <div className="relative z-10 flex flex-1 flex-col justify-center items-center px-12 py-16 xl:px-16">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/images/logo.png"
            alt={t("logoAlt")}
            width={200}
            height={200}
            priority
            className="h-auto w-24 xl:w-32"
          />
          <div className="text-center">
            <h1 className="text-display-md font-black text-primary xl:text-display-lg">
              TreadX
            </h1>
            <p className="mt-1 text-headline-sm font-medium text-primary-dark xl:text-headline-md">
              {t("vendorDashboard")}
            </p>
          </div>

          <div className="h-0.5 w-full max-w-md bg-primary-dark/50" />

          <p className="text-body-md text-muted-foreground">
            {t("seasonalPlatform")}
          </p>
        </div>
      </div>
    </section>
  );
}

function SecuredBy({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex items-center justify-center gap-2 pb-6 pt-2">
      <Image
        src="/images/logo.png"
        alt={t("logoAlt")}
        width={20}
        height={20}
        className="h-5 w-5 opacity-60"
      />
      <span className="text-label-md text-muted-foreground">{t("securedBy")}</span>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tForgot = (key: string, values?: Record<string, string>) =>
    t(`forgotPassword.${key}`, values);
  const tValidation = useTranslations("validation");

  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRequesting, setIsRequesting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = (e.currentTarget.elements.namedItem("email") as HTMLInputElement)?.value?.trim() ?? "";
    if (!trimmedEmail) {
      setErrors({ email: tValidation("emailRequired") });
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrors({ email: tValidation("invalidEmail") });
      return;
    }
    setErrors({});
    setIsRequesting(true);
    try {
      await requestPasswordResetUseCase({ email: trimmedEmail });
      setEmail(trimmedEmail);
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ForgotPasswordError) {
        toast.error(err.message.trim() || tForgot("requestFailed"));
      } else {
        toast.error(tForgot("requestFailed"));
      }
    } finally {
      setIsRequesting(false);
    }
  }

  function handleTryAnotherEmail() {
    setIsSuccess(false);
    setEmail("");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[45fr_55fr]">
      <BrandingPanel t={t} />

      <section className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-[400px]">
            <Link
              href={isSuccess ? ROUTES.AUTH.FORGOT_PASSWORD : ROUTES.AUTH.LOGIN}
              onClick={
                isSuccess
                  ? (ev) => {
                      ev.preventDefault();
                      handleTryAnotherEmail();
                    }
                  : undefined
              }
              className="mb-6 inline-flex items-center gap-2 text-label-lg font-semibold text-primary-dark hover:underline"
            >
              <span className="rtl:rotate-180">←</span>
              {isSuccess ? tForgot("tryAnotherEmail") : tForgot("backToSignIn")}
            </Link>

            {!isSuccess ? (
              <>
                <div className="mb-10">
                  <div className="mb-4 flex justify-center">
                    <KeyRound className="size-18 text-primary-dark" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-center text-headline-lg font-bold text-foreground">
                    {tForgot("title")}
                  </h2>
                  <p className="mt-2 text-center text-body-lg text-muted-foreground">
                    {tForgot("subtitle")}
                  </p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-start text-label-lg text-foreground">
                      {t("emailAddress")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={tForgot("emailPlaceholder")}
                        autoComplete="email"
                        className="ps-12"
                        required
                      />
                    </div>
                    {errors.email ? (
                      <ErrorAlert message={errors.email} className="px-3 py-2" />
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={isRequesting}
                    className={AUTH_PRIMARY_BUTTON_CLASS}
                  >
                    {isRequesting ? tForgot("submitting") : tForgot("submitButton")}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-10">
                  <div className="mb-4 flex justify-center">
                    <CheckCircle2 className="size-18 text-primary-dark" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-center text-headline-lg font-bold text-foreground">
                    {tForgot("successTitle")}
                  </h2>
                  <p className="mt-2 text-center text-body-lg text-muted-foreground">
                    {tForgot("successDescription", { email: obfuscateEmail(email) })}
                  </p>
                  <p className="mt-4 text-center text-body-md text-muted-foreground">
                    {tForgot("spamHint")}
                  </p>
                </div>

                <div className="space-y-4">
                  <Link
                    href={`${ROUTES.AUTH.LOGIN}?sent=1`}
                    className={AUTH_PRIMARY_BUTTON_CLASS}
                  >
                    {tForgot("backToSignIn")}
                  </Link>
                </div>
              </>
            )}

            {!isSuccess && (
              <div className="mt-6 border-t border-surface-container pt-6 text-center">
                <span className="text-body-md text-muted-foreground">{tForgot("rememberPassword")} </span>
                <Link href={ROUTES.AUTH.LOGIN} className="font-semibold text-primary-dark hover:underline">
                  {t("signIn")}
                </Link>
              </div>
            )}
          </div>
        </div>

        <SecuredBy t={t} />
      </section>
    </div>
  );
}
