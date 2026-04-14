"use client";

import * as React from "react";
import { ChevronsUpDown, Search } from "lucide-react";
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
            "h-10 w-full justify-between gap-2 rounded-md border border-input bg-card px-3 font-normal shadow-xs hover:bg-card",
            !selected && "text-muted-foreground",
            ariaInvalid &&
              "border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate text-start text-body-md">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="border-neutral-800 bg-neutral-950 p-0 text-zinc-100 shadow-xl"
        sideOffset={4}
      >
        <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-2 py-2">
          <Search className="size-4 shrink-0 text-zinc-500" aria-hidden />
          <Input
            ref={searchInputRef}
            className="h-9 border-0 bg-transparent text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            disabled={disabled}
          />
        </div>
        <ul
          className="max-h-[min(280px,50vh)] overflow-y-auto overscroll-contain bg-neutral-950 p-1"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-zinc-500">{emptyText}</li>
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
                      "flex w-full cursor-default items-center rounded-md px-2.5 py-2 text-start text-body-md text-zinc-100 outline-none",
                      "hover:bg-neutral-800 focus:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-offset-neutral-950",
                      isSel && "bg-neutral-800 font-medium text-white",
                    )}
                    onClick={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <span className="line-clamp-2">{opt.label}</span>
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
