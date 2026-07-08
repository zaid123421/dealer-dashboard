"use client";

import * as React from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  DIALOG_FOOTER_BUTTON_CLASS,
  dialogConfirmContentClass,
  dialogFormContentClass,
  dialogSuccessContentClass,
  FORM_DIALOG_BODY_CLASS,
  FORM_DIALOG_FOOTER_CLASS,
  FORM_DIALOG_HEADER_CLASS,
  type DialogSize,
} from "@/lib/dialog-styles";

type FormDialogContentProps = React.ComponentPropsWithoutRef<typeof DialogContent> & {
  size?: DialogSize;
};

const FormDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  FormDialogContentProps
>(({ className, size = "lg", ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(dialogFormContentClass(size), className)}
    {...props}
  />
));
FormDialogContent.displayName = "FormDialogContent";

function FormDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogHeader
      className={cn(FORM_DIALOG_HEADER_CLASS, className)}
      {...props}
    />
  );
}

function FormDialogBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(FORM_DIALOG_BODY_CLASS, className)} {...props} />;
}

function FormDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogFooter
      className={cn(FORM_DIALOG_FOOTER_CLASS, className)}
      {...props}
    />
  );
}

const ConfirmDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(dialogConfirmContentClass(), className)}
    {...props}
  />
));
ConfirmDialogContent.displayName = "ConfirmDialogContent";

const SuccessDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(dialogSuccessContentClass(), className)}
    {...props}
  />
));
SuccessDialogContent.displayName = "SuccessDialogContent";

export {
  FormDialogContent,
  FormDialogHeader,
  FormDialogBody,
  FormDialogFooter,
  ConfirmDialogContent,
  SuccessDialogContent,
  DialogTitle,
  DialogDescription,
  DIALOG_FOOTER_BUTTON_CLASS,
};

export { DialogFooter } from "@/components/ui/dialog";
