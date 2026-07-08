"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  startIcon?: React.ReactNode;
};

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      showPasswordLabel = "Show password",
      hidePasswordLabel = "Hide password",
      startIcon,
      ...props
    },
    ref,
  ) => {
    const [show, setShow] = React.useState(false);

    return (
      <div className="relative">
        {startIcon ? (
          <div className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {startIcon}
          </div>
        ) : null}
        <Input
          ref={ref}
          type={show ? "text" : "password"}
          className={cn(startIcon ? "ps-10" : "", "pe-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute end-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={show ? hidePasswordLabel : showPasswordLabel}
          tabIndex={-1}
        >
          <Eye className={cn("size-4", show && "hidden")} aria-hidden={show} />
          <EyeOff className={cn("size-4", !show && "hidden")} aria-hidden={!show} />
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
