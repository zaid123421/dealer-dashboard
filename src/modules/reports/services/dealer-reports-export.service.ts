import api from "@/lib/api";

type ReportExportFormat = "excel" | "pdf";

export type DealerTiresReportExportQuery = {
  from?: string;
  to?: string;
};

export type DealerTiresReportExportResult = {
  blob: Blob;
  filename: string;
};

function contentDispositionFilename(headerValue: string | null | undefined): string | undefined {
  if (!headerValue) return undefined;
  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].trim());
  const basicMatch = headerValue.match(/filename="?([^";]+)"?/i);
  if (basicMatch?.[1]) return basicMatch[1].trim();
  return undefined;
}

function makeDefaultFilename(format: ReportExportFormat): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const ext = format === "excel" ? "xlsx" : "pdf";
  return `dealer-tires-report-${stamp}.${ext}`;
}

async function exportDealerTiresReport(
  endpoint: string,
  format: ReportExportFormat,
  query?: DealerTiresReportExportQuery,
): Promise<DealerTiresReportExportResult> {
  const response = await api.get<Blob>(endpoint, {
    params: {
      ...(query?.from ? { from: query.from } : {}),
      ...(query?.to ? { to: query.to } : {}),
    },
    responseType: "blob",
  });

  const filename =
    contentDispositionFilename(response.headers["content-disposition"]) ??
    makeDefaultFilename(format);

  return { blob: response.data, filename };
}

export function exportDealerTiresReportExcel(
  query?: DealerTiresReportExportQuery,
): Promise<DealerTiresReportExportResult> {
  return exportDealerTiresReport("/v1/dealer/reports/tires/export", "excel", query);
}

export function exportDealerTiresReportPdf(
  query?: DealerTiresReportExportQuery,
): Promise<DealerTiresReportExportResult> {
  return exportDealerTiresReport("/v1/dealer/reports/tires/export/pdf", "pdf", query);
}
