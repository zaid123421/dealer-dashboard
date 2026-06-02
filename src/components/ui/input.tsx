import * as React from "react"

import { cn } from "@/lib/utils"
import { TABLE_FIELD_BORDER } from "@/lib/table-border"
import { FIELD_INVALID_BORDER_CLASS } from "@/lib/field-validation"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-12 w-full min-w-0 rounded-md px-3 text-body-lg text-foreground transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-label-md file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        TABLE_FIELD_BORDER,
        FIELD_INVALID_BORDER_CLASS,
        className
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input }
