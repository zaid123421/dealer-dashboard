"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const COUNTRY_CODES = [
  { value: "+966", label: "+966" },
  { value: "+971", label: "+971" },
  { value: "+965", label: "+965" },
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
] as const;

export default function AddCustomerPage() {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("+966");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: API integration
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(ROUTES.DASHBOARD.CUSTOMERS);
    }, 500);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 overflow-hidden text-sm">
        <Link
          href={ROUTES.DASHBOARD.CUSTOMERS}
          className="min-w-0 truncate text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("title")}
        </Link>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        <span className="shrink-0 font-medium text-foreground">
          {t("breadcrumbAdd")}
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("addNewCustomer")}
        </h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          {t("addCustomerSubtitle")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="size-5 text-primary-dark" />
              {t("personalInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder={t("firstNamePlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder={t("lastNamePlaceholder")}
                  required
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="phone">{t("phoneNumber")}</Label>
                <div className="flex min-w-0 overflow-hidden rounded-md border border-input bg-card shadow-xs">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="h-10 w-[90px] shrink-0 border-0 border-e border-input rounded-none bg-surface-container/80 focus:ring-0 [&>span]:text-primary-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={t("phonePlaceholder")}
                    className={cn(
                      "h-10 min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-body-md outline-none",
                      "placeholder:text-primary-dark/70",
                      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-dark/30"
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("emailAddress")}</Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    className="ps-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="notes">{t("additionalNotes")}</Label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder={t("notesPlaceholder")}
                className={cn(
                  "w-full rounded-md border border-input bg-card px-3 py-2 text-body-md shadow-xs outline-none",
                  "placeholder:text-muted-foreground",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  "min-h-[100px] resize-y"
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col-reverse justify-end gap-2 border-t pt-6 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              <Link href={ROUTES.DASHBOARD.CUSTOMERS}>
                {tCommon("cancel")}
              </Link>
            </Button>
            <Button
              type="submit"
              className="w-full bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90 sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "..." : t("saveCustomer")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
