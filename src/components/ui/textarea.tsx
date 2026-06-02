import * as React from "react"

import { cn } from "@/lib/utils"
import { TABLE_FIELD_BORDER } from "@/lib/table-border"
import { FIELD_INVALID_BORDER_CLASS } from "@/lib/field-validation"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground min-h-[80px] w-full min-w-0 resize-none rounded-md px-3 py-2 text-body-lg text-foreground transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      TABLE_FIELD_BORDER,
      FIELD_INVALID_BORDER_CLASS,
      className
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export { Textarea }
