"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/shared/stores/auth-store";
import { ROUTES } from "@/constants/routes";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { loginUseCase, LoginError } from "@/application/auth/login.use-case";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);
  const [showActivatedMessage, setShowActivatedMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRegisteredSuccess = useMemo(
    () => searchParams.get("registered") === "1",
    [searchParams],
  );
  const isActivatedSuccess = useMemo(
    () => searchParams.get("activated") === "1",
    [searchParams],
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (!isRegisteredSuccess && !isActivatedSuccess) return;
    if (isRegisteredSuccess) setShowRegisteredMessage(true);
    if (isActivatedSuccess) setShowActivatedMessage(true);
    router.replace("/auth", { scroll: false });
  }, [isRegisteredSuccess, isActivatedSuccess, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitLockRef.current) return;
    setFormError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim() ?? "";
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "";
    if (!email || !password) {
      setFormError(t("loginFailed"));
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      const { role, user } = await loginUseCase({ email, password });
      setSession(role, user);
      router.push(ROUTES.DASHBOARD.ROOT);
    } catch (err) {
      if (err instanceof LoginError) {
        setFormError(err.message.trim() || t("loginFailed"));
      } else {
        setFormError(t("loginFailed"));
      }
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[45fr_55fr]">
      {/* ── Left branding panel (desktop only) ── */}
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

      {/* ── Right form panel ── */}
      <section className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-[400px]">
            {/* Heading */}
            <div className="mb-10 text-center">
              <h2 className="text-headline-lg font-bold text-foreground">
                {t("welcomeBack")}
              </h2>
              <p className="mt-2 text-body-lg text-muted-foreground">
                {t("signInSubtitle")}
              </p>
            </div>

            {showRegisteredMessage && (
              <div className="mb-6 rounded-lg bg-success-container px-4 py-3 text-center text-label-lg text-success-onContainer">
                {t("registerSuccess")}
              </div>
            )}

            {showActivatedMessage && (
              <div className="mb-6 rounded-lg bg-success-container px-4 py-3 text-center text-label-lg text-success-onContainer">
                {t("activateAccountSuccess")}
              </div>
            )}

            {formError && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
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
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="h-12 border-2 border-gray-400 bg-transparent ps-12 text-start text-body-lg text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary-dark focus-visible:ring-0"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-start text-label-lg text-foreground">
                  {t("passwordLabel")}
                </Label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    autoComplete="current-password"
                    className="h-12 border-2 border-gray-400 bg-transparent ps-12 pe-12 text-start text-body-lg text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary-dark focus-visible:ring-0"
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
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <Link
                  href={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="text-label-lg font-semibold text-primary-dark hover:underline"
                >
                  {t("forgotPassword.title")}
                </Link>
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-13 w-full items-center justify-center rounded-lg bg-primary-dark text-title-md font-bold text-secondary-main shadow-md transition-all hover:bg-primary-dark/90 hover:shadow-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
              >
                {isSubmitting ? t("signingIn") : t("signIn")}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom secured-by */}
        <div className="flex items-center justify-center gap-2 pb-6 pt-2">
          <Image
            src="/images/logo.png"
            alt={t("logoAlt")}
            width={20}
            height={20}
            className="h-10 w-10 opacity-60"
          />
          <span className="text-label-md text-muted-foreground mt-2">
            {t("securedBy")}
          </span>
        </div>
      </section>
    </div>
  );
}
