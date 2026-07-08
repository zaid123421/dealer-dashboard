"use client";

import * as React from "react";
import { FieldError, FieldHint, Label, OptionalMark, RequiredMark } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FormFieldProps = {
  id?: string;
  label: React.ReactNode;
  required?: boolean;
  optional?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
};

export function FormField({
  id,
  label,
  required,
  optional,
  hint,
  error,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={cn("text-label-md font-medium", labelClassName)}>
        {label}
        {required ? <RequiredMark /> : null}
        {optional != null ? <OptionalMark>{optional}</OptionalMark> : null}
      </Label>
      {hint != null ? <FieldHint>{hint}</FieldHint> : null}
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}
