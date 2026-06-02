import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorAlertProps = {
  message: string;
  className?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorAlert({ message, className, onRetry, retryLabel }: ErrorAlertProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-[var(--color-error-main)] bg-transparent px-4 py-3 text-body-sm text-[var(--color-error-main)]",
        onRetry && "justify-between gap-3",
        className,
      )}
      role="alert"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <AlertCircle className="size-4 shrink-0" aria-hidden />
        <span className="font-medium">{message}</span>
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 gap-1.5 border-[var(--color-error-main)] bg-transparent text-[var(--color-error-main)] hover:bg-[var(--color-error-main)] hover:text-white"
        >
          <RefreshCw className="size-3.5" />
          {retryLabel ?? "Retry"}
        </Button>
      ) : null}
    </div>
  );
}
