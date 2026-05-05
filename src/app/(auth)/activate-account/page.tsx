"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import {
  activateDealerAccountUseCase,
  ActivateDealerAccountError,
} from "@/application/auth/activate-dealer-account.use-case";

const MIN_PASSWORD_LENGTH = 8;

export default function ActivateAccountPage() {
  const t = useTranslations("auth");
  const tActivate = (key: string) => t(`activateAccount.${key}`);
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams],
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasToken = token.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!hasToken) return;

    const next: Record<string, string> = {};
    if (!password) next.password = tValidation("passwordRequired");
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = tValidation("passwordMin");
    if (password !== confirmPassword)
      next.confirmPassword = tValidation("passwordMismatch");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    try {
      await activateDealerAccountUseCase({ token, newPassword: password });
      router.push(`${ROUTES.AUTH.LOGIN}?activated=1`);
      router.refresh();
    } catch (err) {
      if (err instanceof ActivateDealerAccountError) {
        setFormError(err.message.trim() || tActivate("errorFallback"));
      } else {
        setFormError(tActivate("errorFallback"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[45fr_55fr]">
      <section className="relative hidden overflow-hidden bg-background lg:flex lg:flex-col">
        <Image
          src="/images/tire-track.png"
          alt={t("brandPanelAlt")}
          width={800}
          height={900}
          priority
          className="absolute -top-4 -start-4 h-[80%] w-auto opacity-40 mix-blend-screen dark:mix-blend-normal [mask-image:radial-gradient(ellipse_at_top_left,black_30%,transparent_70%)]"
        />
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

      <section className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-[400px]">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="mb-6 inline-flex items-center gap-2 text-label-lg font-semibold text-primary-dark hover:underline"
            >
              <span className="rtl:rotate-180">←</span>
              {tActivate("backToSignIn")}
            </Link>

            <div className="mb-10 text-center">
              <div className="mb-4 flex justify-center">
                <KeyRound className="size-18 text-primary-dark" strokeWidth={1.5} />
              </div>
              <h2 className="text-headline-lg font-bold text-foreground">
                {hasToken ? tActivate("title") : tActivate("missingTokenTitle")}
              </h2>
              <p className="mt-2 text-body-lg text-muted-foreground">
                {hasToken ? tActivate("subtitle") : tActivate("missingTokenDescription")}
              </p>
            </div>

            {formError && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-start text-sm text-destructive">
                {formError}
              </div>
            )}

            {hasToken ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="activate-password" className="text-start text-label-lg text-foreground">
                    {tActivate("newPassword")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="activate-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="ps-12 pe-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-primary-dark"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-start text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activate-confirm" className="text-start text-label-lg text-foreground">
                    {tActivate("confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="activate-confirm"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="ps-12 pe-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-primary-dark"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-start text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-13 w-full items-center justify-center rounded-lg bg-primary-dark text-title-md font-bold text-secondary-main shadow-md transition-all hover:bg-primary-dark/90 hover:shadow-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSubmitting ? tActivate("submitting") : tActivate("submit")}
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pb-6 pt-2">
          <Image
            src="/images/logo.png"
            alt={t("logoAlt")}
            width={20}
            height={20}
            className="h-10 w-10 opacity-60"
          />
          <span className="mt-2 text-label-md text-muted-foreground">{t("securedBy")}</span>
        </div>
      </section>
    </div>
  );
}
