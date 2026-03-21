"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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

const MOCK_CUSTOMERS: Record<
  string,
  { name: string; email: string; phone: string; notes?: string }
> = {
  "1": {
    name: "Ahmed Rashid",
    email: "ahmed.r@example.com",
    phone: "+966 50 123 4567",
    notes: "",
  },
  "2": {
    name: "Sarah Al-Mutairi",
    email: "sarah.m@example.com",
    phone: "+966 55 987 6543",
    notes: "",
  },
  "3": {
    name: "Mohammed Khalid",
    email: "m.khalid@example.com",
    phone: "+966 54 456 7890",
    notes: "",
  },
  "4": {
    name: "Fatima Hassan",
    email: "fatima.h@example.com",
    phone: "+966 53 321 0987",
    notes: "",
  },
  "5": {
    name: "Omar Al-Sayed",
    email: "omar.s@example.com",
    phone: "+966 56 654 3210",
    notes: "",
  },
};

function parseCustomerData(customer: { name: string; email: string; phone: string }) {
  const nameParts = customer.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") ?? "";
  const phoneMatch = customer.phone.match(/^(\+\d+)\s*(.*)$/);
  const countryCode = phoneMatch?.[1] ?? "+966";
  const phoneNumber = phoneMatch?.[2]?.trim() ?? customer.phone;
  return { firstName, lastName, countryCode, phoneNumber };
}

export default function EditCustomerPage() {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const customerId = params.customerId as string;
  const customer = MOCK_CUSTOMERS[customerId];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+966");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (customer) {
      const parsed = parseCustomerData(customer);
      setFirstName(parsed.firstName);
      setLastName(parsed.lastName);
      setCountryCode(parsed.countryCode);
      setPhoneNumber(parsed.phoneNumber);
      setEmail(customer.email);
      setNotes(customer.notes ?? "");
    }
    setIsLoading(false);
  }, [customer]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: API integration
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(ROUTES.DASHBOARD.CUSTOMERS);
    }, 500);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-body-md text-muted-foreground">
          {t("loading")}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body-md text-muted-foreground">
          {t("customerNotFound")}
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.DASHBOARD.CUSTOMERS}>{tCommon("cancel")}</Link>
        </Button>
      </div>
    );
  }

  const displayName = customer.name;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-2 overflow-hidden text-sm"
      >
        <Link
          href={ROUTES.DASHBOARD.CUSTOMERS}
          className="min-w-0 truncate text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("title")}
        </Link>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 truncate text-muted-foreground">
          {displayName}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="shrink-0 font-medium text-foreground">
          {t("breadcrumbEdit")}
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("editCustomer")}
        </h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          {t("editCustomerSubtitle")}
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("firstNamePlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
