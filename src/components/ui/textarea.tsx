import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border border-input min-h-[80px] w-full min-w-0 resize-none rounded-md bg-transparent px-3 py-2 text-body-lg text-foreground transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      "focus-visible:border-primary-dark focus-visible:ring-0",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      className
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export { Textarea }
