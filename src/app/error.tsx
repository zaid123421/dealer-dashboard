"use client";

import { ErrorAlert } from "@/components/ui/error-alert";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-headline-lg font-bold text-foreground">
        حدث خطأ غير متوقع
      </h1>
      <ErrorAlert
        message={error.message || "يرجى المحاولة مرة أخرى."}
        onRetry={reset}
        retryLabel="إعادة المحاولة"
        className="max-w-md"
      />
    </div>
  );
}
