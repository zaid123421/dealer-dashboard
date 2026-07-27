"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BarChart3,
  CalendarRange,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatLocaleDateTime } from "@/lib/format-locale";
import { RADIUS_PANEL, RADIUS_PILL } from "@/lib/radius";
import { TABLE_BORDER_COLOR } from "@/lib/table-border";
import {
  exportDealerTiresReportExcel,
  exportDealerTiresReportPdf,
  type DealerTiresReportExportQuery,
} from "@/modules/reports/services/dealer-reports-export.service";

type DownloadFormat = "excel" | "pdf";
type RangePreset = "default" | "7d" | "30d" | "90d" | "month" | "custom";

const RANGE_PRESETS: { id: Exclude<RangePreset, "custom">; labelKey: string }[] = [
  { id: "default", labelKey: "reportsRangePresetDefault" },
  { id: "7d", labelKey: "reportsRangePreset7d" },
  { id: "30d", labelKey: "reportsRangePreset30d" },
  { id: "90d", labelKey: "reportsRangePreset90d" },
  { id: "month", labelKey: "reportsRangePresetMonth" },
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateTimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoOrUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type FormatAccent = "excel" | "pdf";

const FORMAT_ACCENT_STYLES: Record<FormatAccent, { icon: string; button: string }> = {
  excel: {
    icon: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-400",
    button:
      "border-0 bg-[#16a34a] font-semibold text-white hover:bg-[#15803d] dark:bg-emerald-500 dark:hover:bg-emerald-600",
  },
  pdf: {
    icon: "border-red-500/25 bg-red-500/10 text-red-600 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-400",
    button:
      "border-0 bg-[#dc2626] font-semibold text-white hover:bg-[#b91c1c] dark:bg-red-500 dark:hover:bg-red-600",
  },
};

function ReportFormatCard({
  icon: Icon,
  accent,
  title,
  description,
  actionLabel,
  isDownloading,
  disabled,
  onDownload,
}: {
  icon: LucideIcon;
  accent: FormatAccent;
  title: string;
  description: string;
  actionLabel: string;
  isDownloading: boolean;
  disabled: boolean;
  onDownload: () => void;
}) {
  const styles = FORMAT_ACCENT_STYLES[accent];
  return (
    <div
      className={cn(
        "group flex flex-col gap-4 border-2 p-5 transition-all duration-200 hover:shadow-md",
        RADIUS_PANEL,
        TABLE_BORDER_COLOR,
        "bg-surface-lightContainer dark:bg-surface-container",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-110",
            styles.icon,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-body-md font-semibold text-foreground">{title}</p>
          <p className="text-body-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button
        type="button"
        onClick={onDownload}
        disabled={disabled}
        className={cn("w-full gap-2 sm:w-auto sm:self-start", styles.button)}
      >
        {isDownloading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Download className="size-4" aria-hidden />
        )}
        {actionLabel}
      </Button>
    </div>
  );
}

export function ReportsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const [fromDateTime, setFromDateTime] = useState("");
  const [toDateTime, setToDateTime] = useState("");
  const [activePreset, setActivePreset] = useState<RangePreset>("default");
  const [downloading, setDownloading] = useState<DownloadFormat | null>(null);

  function applyPreset(preset: Exclude<RangePreset, "custom">) {
    setActivePreset(preset);
    if (preset === "default") {
      setFromDateTime("");
      setToDateTime("");
      return;
    }
    const now = new Date();
    let from: Date;
    if (preset === "7d") from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (preset === "30d") from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (preset === "90d") from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    else from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    setFromDateTime(toDateTimeLocalValue(from));
    setToDateTime(toDateTimeLocalValue(now));
  }

  function onFromInputChange(value: string) {
    setFromDateTime(value);
    setActivePreset("custom");
  }

  function onToInputChange(value: string) {
    setToDateTime(value);
    setActivePreset("custom");
  }

  const hasCustomRange = fromDateTime.trim() !== "" || toDateTime.trim() !== "";
  const rangeSummaryText = hasCustomRange
    ? t("reportsRangeSummaryCustom", {
        from: formatLocaleDateTime(fromDateTime, locale),
        to: formatLocaleDateTime(toDateTime, locale),
      })
    : t("reportsRangeSummaryDefault");

  async function onDownload(format: DownloadFormat) {
    if (downloading != null) return;

    const fromIso = toIsoOrUndefined(fromDateTime);
    const toIso = toIsoOrUndefined(toDateTime);
    if (fromDateTime && !fromIso) {
      toast.error(t("reportsInvalidFrom"));
      return;
    }
    if (toDateTime && !toIso) {
      toast.error(t("reportsInvalidTo"));
      return;
    }
    if (fromIso && toIso && new Date(fromIso).getTime() > new Date(toIso).getTime()) {
      toast.error(t("reportsInvalidRange"));
      return;
    }

    setDownloading(format);
    const loadingToast = toast.loading(
      format === "excel" ? t("reportsDownloadingExcel") : t("reportsDownloadingPdf"),
    );
    const query: DealerTiresReportExportQuery = {
      ...(fromIso ? { from: fromIso } : {}),
      ...(toIso ? { to: toIso } : {}),
    };

    try {
      const result =
        format === "excel"
          ? await exportDealerTiresReportExcel(query)
          : await exportDealerTiresReportPdf(query);
      triggerBrowserDownload(result.blob, result.filename);
      toast.success(
        format === "excel" ? t("reportsDownloadExcelSuccess") : t("reportsDownloadPdfSuccess"),
        { id: loadingToast },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : format === "excel"
            ? t("reportsDownloadExcelError")
            : t("reportsDownloadPdfError");
      toast.error(message, { id: loadingToast });
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div
        className={cn(
          "flex flex-col gap-4 border-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
          RADIUS_PANEL,
          TABLE_BORDER_COLOR,
          "bg-surface-lightContainer dark:bg-surface-container",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary-dark/20 bg-primary-dark/10 text-primary-dark dark:border-primary/30 dark:bg-primary-dark/20 dark:text-primary">
            <BarChart3 className="size-5" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-body-md font-semibold text-foreground">{t("reportsHeroTitle")}</p>
            <p className="text-body-sm text-muted-foreground">{t("reportsHeroDescription")}</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 self-start border border-primary-dark/25 bg-primary-dark/10 px-3 py-1.5 text-label-sm font-medium text-primary-dark dark:border-primary/30 dark:bg-primary/10 dark:text-primary sm:self-auto",
            RADIUS_PILL,
          )}
        >
          <CalendarRange className="size-3.5 shrink-0" aria-hidden />
          {rangeSummaryText}
        </span>
      </div>

      <div className={cn("flex flex-col gap-4 border-2 p-4", RADIUS_PANEL, TABLE_BORDER_COLOR)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("reportsRangeSectionTitle")}
          </p>
          {hasCustomRange ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => applyPreset("default")}
              className="gap-1.5 text-muted-foreground"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              {t("reportsRangeClear")}
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {RANGE_PRESETS.map((preset) => {
            const active = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={cn(
                  RADIUS_PILL,
                  "border px-3.5 py-1.5 text-label-sm font-medium transition-all duration-200",
                  active
                    ? "border-0 bg-primary-dark text-primary-onContainer shadow-sm dark:bg-primary-dark dark:text-primary-onContainer"
                    : "border-border/60 bg-transparent text-muted-foreground hover:border-primary-dark/40 hover:text-foreground dark:hover:border-primary/40",
                )}
              >
                {t(preset.labelKey)}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
              {t("reportsFilterFrom")}
            </span>
            <Input
              type="datetime-local"
              value={fromDateTime}
              onChange={(e) => onFromInputChange(e.target.value)}
              className="w-full sm:w-[220px]"
              aria-label={t("reportsFilterFrom")}
            />
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
              {t("reportsFilterTo")}
            </span>
            <Input
              type="datetime-local"
              value={toDateTime}
              onChange={(e) => onToInputChange(e.target.value)}
              className="w-full sm:w-[220px]"
              aria-label={t("reportsFilterTo")}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ReportFormatCard
          icon={FileSpreadsheet}
          accent="excel"
          title={t("reportsFormatExcelTitle")}
          description={t("reportsFormatExcelDescription")}
          actionLabel={t("reportsDownloadExcel")}
          isDownloading={downloading === "excel"}
          disabled={downloading != null}
          onDownload={() => void onDownload("excel")}
        />
        <ReportFormatCard
          icon={FileText}
          accent="pdf"
          title={t("reportsFormatPdfTitle")}
          description={t("reportsFormatPdfDescription")}
          actionLabel={t("reportsDownloadPdf")}
          isDownloading={downloading === "pdf"}
          disabled={downloading != null}
          onDownload={() => void onDownload("pdf")}
        />
      </div>
    </div>
  );
}
