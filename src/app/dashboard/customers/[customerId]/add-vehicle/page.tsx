"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, Car, CircleDot, ChevronRight, Info } from "lucide-react";
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

const MAKES = ["Toyota", "BMW", "Mercedes", "Honda", "Audi"] as const;
const SEASON_TYPES = ["Summer", "Winter", "All-Season"] as const;

// Mock customer data - in real app would come from API
const MOCK_CUSTOMERS: Record<string, { name: string; email: string }> = {
  "1": { name: "Ahmed Rashid", email: "ahmed.r@example.com" },
  "2": { name: "Sarah Al-Mutairi", email: "sarah.m@example.com" },
  "3": { name: "Mohammed Khalid", email: "m.khalid@example.com" },
  "4": { name: "Fatima Hassan", email: "fatima.h@example.com" },
  "5": { name: "Omar Al-Sayed", email: "omar.s@example.com" },
};

export default function AddVehiclePage() {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const customerId = params.customerId as string;
  const customer = MOCK_CUSTOMERS[customerId] ?? {
    name: "Customer",
    email: "customer@example.com",
  };
  const [tireCount, setTireCount] = useState(4);
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
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("title")}
        </Link>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        <span className="min-w-0 truncate text-muted-foreground">{customer.name}</span>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        <span className="font-medium text-primary-dark">
          {t("breadcrumbAddVehicle")}
        </span>
      </nav>

      {/* Customer Banner */}
      <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 sm:gap-4 sm:p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-dark/20 text-primary-dark">
          <User className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-foreground">
            {t("addingVehicleFor")} {customer.name}
          </p>
          <p className="truncate text-body-md text-muted-foreground">
            {customer.email.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            {/* Vehicle Information */}
            <div className="space-y-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Car className="size-5 text-primary-dark" />
                {t("vehicleInformation")}
              </CardTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="make">{t("makeBrand")}</Label>
                  <Select name="make" defaultValue="Toyota">
                    <SelectTrigger>
                      <SelectValue placeholder={t("makeBrand")} />
                    </SelectTrigger>
                    <SelectContent>
                      {MAKES.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">{t("model")}</Label>
                  <Input
                    id="model"
                    name="model"
                    placeholder={t("modelPlaceholder")}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="year">{t("year")}</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min={2000}
                    max={2026}
                    placeholder={t("yearPlaceholder")}
                  />
                </div>
                <div className="sm:col-span-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">{t("vinNumber")}</Label>
                <div className="relative">
                  <Input
                    id="vin"
                    name="vin"
                    placeholder={t("vinPlaceholder")}
                    maxLength={17}
                    className="pe-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Info"
                  >
                    <Info className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tire Information */}
            <div className="mt-8 space-y-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CircleDot className="size-5 text-primary-dark" />
                {t("tireInformation")}
              </CardTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tireSize">{t("tireSize")}</Label>
                  <Input
                    id="tireSize"
                    name="tireSize"
                    placeholder={t("tireSizePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tireCount">{t("numberOfTires")}</Label>
                  <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-card px-2 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setTireCount((n) => Math.max(1, n - 1))}
                      className="flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] flex-1 text-center font-medium">
                      {tireCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTireCount((n) => Math.min(8, n + 1))}
                      className="flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="hidden"
                    name="tireCount"
                    value={tireCount}
                    readOnly
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tireBrand">{t("tireBrand")}</Label>
                  <Input
                    id="tireBrand"
                    name="tireBrand"
                    placeholder={t("tireBrandPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seasonType">{t("seasonType")}</Label>
                  <Select name="seasonType" defaultValue="Winter">
                    <SelectTrigger>
                      <SelectValue placeholder={t("seasonType")} />
                    </SelectTrigger>
                    <SelectContent>
                      {SEASON_TYPES.map((season) => (
                        <SelectItem key={season} value={season}>
                          {season === "All-Season"
                            ? t("allSeason")
                            : season === "Summer"
                              ? t("summer")
                              : t("winter")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col-reverse justify-end gap-2 border-t pt-6 sm:flex-row">
            <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
              <Link href={ROUTES.DASHBOARD.CUSTOMERS}>
                {tCommon("cancel")}
              </Link>
            </Button>
            <Button
              type="submit"
              className="w-full bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90 sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "..." : t("saveVehicle")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
