"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/** Red asterisk for required form fields. */
function RequiredMark({ className }: { className?: string }) {
  return (
    <span
      data-slot="required-mark"
      className={cn("text-error-main", className)}
      aria-hidden
    >
      *
    </span>
  )
}

/** Inline validation message — same red as invalid field border. */
function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  if (children == null || (typeof children === "string" && !children.trim())) {
    return null
  }

  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-sm text-error-main", className)}
      {...props}
    >
      {children}
    </p>
  )
}

/** Lighter hint for optional form fields (e.g. in modals). */
function OptionalMark({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      data-slot="optional-mark"
      className={cn(
        "font-normal normal-case tracking-normal text-muted-foreground/45 dark:text-muted-foreground/35",
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Helper text under a field label — smaller & softer than the label title. */
function FieldHint({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      data-slot="field-hint"
      className={cn(
        "text-label-sm font-normal normal-case leading-relaxed tracking-normal text-subtle dark:text-muted-foreground/55",
        className,
      )}
    >
      {children}
    </p>
  )
}

export { Label, RequiredMark, OptionalMark, FieldHint, FieldError }
