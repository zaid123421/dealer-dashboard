"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { registerUseCase } from "@/application/auth/register.use-case";
import { ROUTES } from "@/constants/routes";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const t = useTranslations("register");
  const tValidation = useTranslations("validation");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = tValidation("nameRequired");
    if (!email.trim()) next.email = tValidation("emailRequired");
    else if (!EMAIL_REGEX.test(email)) next.email = tValidation("invalidEmail");
    if (!password) next.password = tValidation("passwordRequired");
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = tValidation("passwordMin");
    if (password !== confirmPassword)
      next.confirmPassword = tValidation("passwordMismatch");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      await registerUseCase({ name: name.trim(), email: email.trim(), password });
      router.push(`${ROUTES.AUTH.LOGIN}?registered=1`);
      router.refresh();
    } catch {
      setErrors({ form: tCommon("formError") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-2 sm:p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-headline-sm font-bold text-foreground">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {errors.form && (
              <p className="rounded-lg border border-destructive bg-destructive/10 p-2 text-right text-sm text-destructive">
                {errors.form}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-right">
                {t("fullName")}
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("fullName")}
                className="text-end"
              />
              {errors.name && (
                <p className="text-right text-sm text-destructive">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-right">
                {tAuth("email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="text-end"
              />
              {errors.email && (
                <p className="text-right text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-right">
                {tAuth("password")}
              </Label>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ps-12 pe-12 text-end"
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
                <p className="text-right text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-right">
                {t("confirmPassword")}
              </Label>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="ps-12 pe-12 text-end"
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
                <p className="text-right text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {tAuth("haveAccount")}{" "}
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="font-medium text-primary hover:underline"
              >
                {tAuth("login")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
