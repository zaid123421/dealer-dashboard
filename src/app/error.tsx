"use client";

import { Button } from "@/components/ui/button";

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
      <p className="text-body-md text-muted-foreground">
        {error.message || "يرجى المحاولة مرة أخرى."}
      </p>
      <Button onClick={reset} variant="outline">
        إعادة المحاولة
      </Button>
    </div>
  );
}
