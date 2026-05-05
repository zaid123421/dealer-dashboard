"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { Mail, KeyRound, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const OTP_LENGTH = 6;
const CODE_EXPIRY_SECONDS = 300;

function obfuscateEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***.***";
  const masked = (local?.[0] ?? "?") + "***";
  return `${masked}@${domain}`;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== 2 || countdown <= 0) return;
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step, countdown]);

  useEffect(() => {
    if (step === 2 && countdown === 0 && !canResend) {
      setCountdown(CODE_EXPIRY_SECONDS);
      setCanResend(false);
    }
  }, [step]);

  useEffect(() => {
    if (step === 2) {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  function handleSendCode(e: React.FormEvent<HTMLFormElement>) {
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
    setEmail(trimmedEmail);
    setCode("");
    setCountdown(CODE_EXPIRY_SECONDS);
    setCanResend(false);
    setStep(2);
    toast.success(tForgot("codeSent"));
  }

  function handleVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const codeStr = code.replace(/\D/g, "");
    if (codeStr.length !== OTP_LENGTH) {
      setErrors({ code: tForgot("codeRequired") });
      return;
    }
    setErrors({});
    setStep(3);
  }

  function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!password) next.password = tValidation("passwordRequired");
    else if (password.length < MIN_PASSWORD_LENGTH) next.password = tValidation("passwordMin");
    if (password !== confirmPassword) next.confirmPassword = tValidation("passwordMismatch");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    toast.success(tForgot("resetSuccess"));
    setIsSubmitting(false);
    router.push(`${ROUTES.AUTH.LOGIN}?reset=1`);
    router.refresh();
  }

  function handleResend() {
    if (!canResend) return;
    setCountdown(CODE_EXPIRY_SECONDS);
    setCanResend(false);
    setCode("");
    otpRefs.current[0]?.focus();
    toast.success(tForgot("codeSent"));
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = code.split("");
    next[index] = digit;
    const joined = next.join("");
    setCode(joined);
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = pasted.split("");
    while (next.length < OTP_LENGTH) next.push("");
    setCode(next.join(""));
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
  }

  const isVerifyDisabled = code.replace(/\D/g, "").length !== OTP_LENGTH || countdown <= 0;

  return (
    <div className="grid min-h-screen lg:grid-cols-[45fr_55fr]">
      <BrandingPanel t={t} />

      <section className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-[400px]">
            {step === 1 ? (
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="mb-6 inline-flex items-center gap-2 text-label-lg font-semibold text-primary-dark hover:underline"
              >
                <span className="rtl:rotate-180">←</span>
                {tForgot("backToSignIn")}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setStep(step === 2 ? 1 : 2)}
                className="mb-6 inline-flex items-center gap-2 text-label-lg font-semibold text-primary-dark hover:underline"
              >
                <span className="rtl:rotate-180">←</span>
                {tForgot("back")}
              </button>
            )}

            {step === 1 ? (
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

                <form onSubmit={handleSendCode} className="space-y-6">
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
                    {errors.email && (
                      <p className="text-start text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="flex h-13 w-full items-center justify-center rounded-lg bg-primary-dark text-title-md font-bold text-secondary-main shadow-md transition-all hover:bg-primary-dark/90 hover:shadow-lg active:scale-[0.98]"
                  >
                    {tForgot("sendCode")}
                  </button>
                </form>
              </>
            ) : step === 2 ? (
              <>
                <div className="mb-10">
                  <div className="mb-4 flex justify-center">
                    <ShieldCheck className="size-18 text-primary-dark" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-center text-headline-md font-bold text-foreground">
                    {tForgot("enterVerificationCode")}
                  </h2>
                  <p className="mt-2 text-center text-body-lg text-muted-foreground">
                    {tForgot("weSentCodeTo")}{" "}
                    <span className="font-semibold text-foreground">{obfuscateEmail(email)}</span>{" "}
                    {tForgot("checkInbox")}
                  </p>
                </div>

                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div className="space-y-2">
                    <div
                      className="flex gap-2 justify-center"
                      onPaste={handleOtpPaste}
                    >
                      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                        <Input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          autoComplete={i === 0 ? "one-time-code" : "off"}
                          value={code[i] ?? ""}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="h-14 w-12 rounded-lg text-center text-headline-md font-bold"
                        />
                      ))}
                    </div>
                    {errors.code && (
                      <p className="text-center text-sm text-destructive">{errors.code}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyDisabled}
                    className="flex h-13 w-full items-center justify-center rounded-lg bg-primary-dark text-title-md font-bold text-secondary-main shadow-md transition-all hover:bg-primary-dark/90 hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {tForgot("verifyCode")}
                  </button>

                  <div className="space-y-1 text-center">
                    <p className="text-body-md text-muted-foreground">
                      {tForgot("didntReceive")}{" "}
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={!canResend}
                        className="font-semibold text-primary-dark hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tForgot("resend")}
                      </button>
                    </p>
                    {countdown > 0 && (
                      <p className="text-label-md text-muted-foreground">
                        {tForgot("codeExpiresIn", { time: formatCountdown(countdown) })}
                      </p>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-10">
                  <div className="mb-4 flex justify-center">
                    <Lock className="size-18 text-primary-dark" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-center text-headline-lg font-bold text-foreground">
                    {tForgot("resetTitle")}
                  </h2>
                  <p className="mt-2 text-center text-body-md text-muted-foreground">
                    {tForgot("resetSubtitle", { email: obfuscateEmail(email) })}
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-start text-label-lg text-foreground">
                      {tForgot("newPassword")}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="ps-12 pe-12"
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
                    <Label htmlFor="confirmPassword" className="text-start text-label-lg text-foreground">
                      {tForgot("confirmPassword")}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="********"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="ps-12 pe-12"
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
                    className="flex h-13 w-full items-center justify-center rounded-lg bg-primary-dark text-title-md font-bold text-secondary-main shadow-md transition-all hover:bg-primary-dark/90 hover:shadow-lg active:scale-[0.98] disabled:opacity-70"
                  >
                    {tForgot("resetButton")}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 border-t border-surface-container pt-6 text-center">
              <span className="text-body-md text-muted-foreground">{tForgot("rememberPassword")} </span>
              <Link href={ROUTES.AUTH.LOGIN} className="font-semibold text-primary-dark hover:underline">
                {t("signIn")}
              </Link>
            </div>
          </div>
        </div>

        <SecuredBy t={t} />
      </section>
    </div>
  );
}
