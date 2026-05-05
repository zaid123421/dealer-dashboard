import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  canPrevious: boolean;
  canNext: boolean;
  previousLabel: string;
  nextLabel: string;
  pageLabel: string;
  pageText: string;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

export function PaginationControls({
  canPrevious,
  canNext,
  previousLabel,
  nextLabel,
  pageLabel,
  pageText,
  onPrevious,
  onNext,
  className,
}: PaginationControlsProps) {
  return (
    <nav
      className={cn("flex items-center justify-center", className)}
      aria-label={pageLabel}
    >
      <div className="inline-flex h-12 items-center gap-4 rounded-full bg-secondary-main p-1 shadow-md dark:bg-surface-high">
        <Button
          type="button"
          size="icon"
          className="size-10 rounded-full border-0 bg-surface-light text-secondary-main shadow-xs hover:bg-surface-lightContainer hover:text-secondary-main focus-visible:border-primary-dark focus-visible:ring-primary-dark/30 disabled:bg-surface-light disabled:text-secondary-main"
          disabled={!canPrevious}
          aria-label={previousLabel}
          onClick={onPrevious}
        >
          <ChevronLeft className="size-5" />
        </Button>

        <span className="min-w-16 text-center text-body-sm font-semibold text-secondary-onSurface">
          {pageText}
        </span>

        <Button
          type="button"
          size="icon"
          className="size-10 rounded-full border-0 bg-primary-dark text-primary-onContainer shadow-xs hover:bg-primary-dark/90 focus-visible:border-primary-dark focus-visible:ring-primary-dark/30 disabled:bg-primary-dark disabled:text-primary-onContainer"
          disabled={!canNext}
          aria-label={nextLabel}
          onClick={onNext}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </nav>
  );
}
