"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchableComboboxOption = {
  value: string;
  label: string;
};

export type SearchableComboboxProps = {
  id?: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  options: SearchableComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  className?: string;
};

export function SearchableCombobox({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  "aria-invalid": ariaInvalid,
  className,
}: SearchableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const selected = React.useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-card px-3 py-2 text-body-md font-normal shadow-xs hover:bg-card focus-visible:border-primary-dark focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            open && "border-primary-dark",
            !selected && "text-muted-foreground",
            ariaInvalid &&
              "border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate text-start text-body-md">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="min-w-[var(--radix-popover-trigger-width)] rounded-lg border-transparent bg-surface-light p-0 text-popover-foreground shadow-lg dark:bg-surface-bright"
        sideOffset={4}
      >
        <div className="flex items-center gap-2 px-2 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            ref={searchInputRef}
            className="h-9 border-0 bg-transparent text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            disabled={disabled}
          />
        </div>
        <ul
          className="max-h-[min(280px,50vh)] overflow-y-auto overscroll-contain p-1"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</li>
          ) : (
            filtered.map((opt) => {
              const isSel = opt.value === value;
              return (
                <li key={opt.value} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    className={cn(
                      "relative flex w-full cursor-default items-center rounded-md py-2 ps-3 pe-8 text-start text-body-md text-foreground outline-none",
                      "hover:bg-primary-dark/10 hover:text-primary-dark focus:bg-primary-dark/10 focus:text-primary-dark focus-visible:ring-0",
                      isSel && "text-primary-dark",
                    )}
                    onClick={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <span className="line-clamp-2">{opt.label}</span>
                    {isSel ? (
                      <Check className="absolute end-2 size-4" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
