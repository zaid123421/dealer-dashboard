"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { UserCog } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  createStaffFormSchema,
  dealerStaffMemberToFormValues,
  mapStaffFormToRequest,
  type CreateStaffFormValues,
} from "@/modules/staff/schemas/create-staff.schema";
import type { DealerStaffMember } from "@/modules/staff/schemas/dealer-staff-page.schema";
import { DealerQuotaNotice } from "@/modules/dealer/components/dealer-quota-notice";
import { useDealerQuota } from "@/modules/dealer/hooks/use-dealer-quota";
import { useCreateDealerStaff } from "@/modules/staff/hooks/use-create-dealer-staff";
import { useDealerStaffDetail } from "@/modules/staff/hooks/use-dealer-staff-detail";
import { useDealerStaffRoles } from "@/modules/staff/hooks/use-dealer-staff-roles";
import { useUpdateDealerStaff } from "@/modules/staff/hooks/use-update-dealer-staff";

const defaultFormValues: CreateStaffFormValues = {
  email: "",
  username: "",
  firstName: "",
  lastName: "",
  position: "",
  role: "",
  accessLevel: "",
  notes: "",
};

function staffDisplayName(member: DealerStaffMember): string {
  const parts = [member.firstName?.trim(), member.lastName?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : member.email?.trim() || "—";
}

export type AddStaffModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** إن وُجد — وضع التعديل (PUT) */
  staffToEdit?: DealerStaffMember | null;
};

export function AddStaffModal({ open, onOpenChange, staffToEdit = null }: AddStaffModalProps) {
  const t = useTranslations("staff");
  const tQuota = useTranslations("quota");
  const tCommon = useTranslations("common");
  const { snapshot, profile, canAddStaff, getRoleQuota } = useDealerQuota();
  const createStaff = useCreateDealerStaff();
  const updateStaff = useUpdateDealerStaff();
  const isEdit = staffToEdit != null;
  const editStaffId = staffToEdit?.id ?? null;
  const detailQuery = useDealerStaffDetail(editStaffId, open && isEdit);
  const rolesQuery = useDealerStaffRoles(open);

  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffFormSchema) as Resolver<CreateStaffFormValues>,
    defaultValues: defaultFormValues,
  });

  /** إضافة: تصفير النموذج */
  useEffect(() => {
    if (!open) return;
    if (!staffToEdit) {
      reset(defaultFormValues);
    }
  }, [open, staffToEdit, reset]);

  /** تعديل: تعبئة أولية من صف الجدول ثم استبدالها بتفاصيل GET عند توفرها (غالباً notes لا تأتي في قائمة الجدول). */
  useEffect(() => {
    if (!open || !staffToEdit) return;
    reset(dealerStaffMemberToFormValues(staffToEdit));
  }, [open, staffToEdit, reset]);

  useEffect(() => {
    if (!open || !staffToEdit) return;
    if (detailQuery.isSuccess && detailQuery.data) {
      reset(dealerStaffMemberToFormValues(detailQuery.data));
    }
  }, [open, staffToEdit, detailQuery.isSuccess, detailQuery.data, reset]);

  const selectedRole = watch("role");
  const roleOptions = useMemo(() => {
    const fromApi = rolesQuery.data ?? [];
    const fromProfile = profile?.availableRoles ?? [];
    const base = fromProfile.length > 0 ? fromProfile : fromApi;
    if (selectedRole && !base.includes(selectedRole)) {
      return [selectedRole, ...base];
    }
    return base;
  }, [rolesQuery.data, profile?.availableRoles, selectedRole]);

  const selectedRoleQuota = selectedRole ? getRoleQuota(selectedRole) : null;
  const canSubmitNewStaff =
    isEdit || (selectedRole ? canAddStaff(selectedRole) : canAddStaff());

  function onSubmit(data: CreateStaffFormValues) {
    if (!isEdit && !canAddStaff(data.role)) {
      if (!snapshot.hasActiveSubscription) {
        toast.error(tQuota("noActiveSubscription"));
        return;
      }
      const roleQuota = getRoleQuota(data.role);
      if (roleQuota && !roleQuota.canAdd) {
        toast.error(
          tQuota("roleLimitReached", {
            role: data.role,
            current: roleQuota.current,
            max: roleQuota.max,
            remaining: roleQuota.remaining,
          }),
        );
        return;
      }
      if (snapshot.staff && !snapshot.staff.canAdd) {
        toast.error(
          tQuota("staffLimitReached", {
            current: snapshot.staff.current,
            max: snapshot.staff.max,
            remaining: snapshot.staff.remaining,
          }),
        );
        return;
      }
    }
    const payload = mapStaffFormToRequest(data, isEdit);
    if (isEdit && staffToEdit) {
      updateStaff.mutate(
        { staffId: staffToEdit.id, payload },
        {
          onSuccess: () => {
            toast.success(t("updateStaffSuccess"));
            onOpenChange(false);
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : t("updateStaffError"));
          },
        },
      );
      return;
    }
    createStaff.mutate(payload, {
      onSuccess: () => {
        toast.success(t("createStaffSuccess"));
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t("createStaffError"));
      },
    });
  }

  const pending = createStaff.isPending || updateStaff.isPending;
  const rolesLoading = rolesQuery.isPending;
  const formLocked = pending || (isEdit && detailQuery.isPending);
  const displayMember = isEdit ? (detailQuery.data ?? staffToEdit) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,720px)] w-full max-w-2xl overflow-y-auto gap-0 overflow-hidden p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-6 pb-4 pt-6">
          <DialogHeader>
            <DialogTitle>{isEdit ? t("editStaffTitle") : t("addStaffTitle")}</DialogTitle>
            <DialogDescription
              className={isEdit ? "text-label-sm text-muted-foreground" : "sr-only"}
            >
              {isEdit ? t("editStaffSubtitle") : t("addStaffSubtitle")}
            </DialogDescription>
            {isEdit && detailQuery.isPending ? (
              <p className="mt-2 text-body-sm text-muted-foreground">{t("loadingStaffDetails")}</p>
            ) : null}
          </DialogHeader>
          <div className="mt-4 flex min-w-0 items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-dark/15 text-primary-dark">
              <UserCog className="size-5" />
            </div>
            <div className="min-w-0">
              {isEdit && displayMember ? (
                <>
                  <p className="truncate text-body-sm font-semibold text-foreground">
                    {staffDisplayName(displayMember)}
                  </p>
                  <p className="truncate text-label-sm text-muted-foreground">
                    {(displayMember.email ?? displayMember.username ?? "").toLowerCase()}
                  </p>
                </>
              ) : (
                <>
                  <p className="truncate text-body-sm font-semibold text-foreground">{t("addStaffCardTitle")}</p>
                  <p className="truncate text-label-sm text-muted-foreground">{t("addStaffCardHint")}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {!isEdit && open ? (
          <div className="space-y-3 px-6 pb-2">
            {!snapshot.hasActiveSubscription ? (
              <DealerQuotaNotice variant="subscription" />
            ) : null}
            {snapshot.staff && !snapshot.staff.canAdd ? (
              <DealerQuotaNotice variant="staff" staffQuota={snapshot.staff} />
            ) : null}
            {selectedRole && selectedRoleQuota && !selectedRoleQuota.canAdd ? (
              <DealerQuotaNotice
                variant="role"
                roleName={selectedRole}
                roleQuota={selectedRoleQuota}
              />
            ) : null}
          </div>
        ) : null}

        <form id="staff-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff-email">{t("email")}</Label>
              <Input
                id="staff-email"
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                className={cn(errors.email && "border-destructive")}
                disabled={formLocked}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-label-sm text-error-main">{errors.email.message}</p>
              ) : null}
            </div>

            {isEdit ? (
              <div className="space-y-2">
                <Label htmlFor="staff-username">{t("username")}</Label>
                <Input
                  id="staff-username"
                  autoComplete="username"
                  placeholder={t("usernamePlaceholder")}
                  className={cn(errors.username && "border-destructive")}
                  disabled={formLocked}
                  {...register("username")}
                />
                {errors.username ? (
                  <p className="text-label-sm text-error-main">{errors.username.message}</p>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="staff-firstName">{t("firstName")}</Label>
                <Input
                  id="staff-firstName"
                  autoComplete="given-name"
                  placeholder={t("firstNamePlaceholder")}
                  className={cn(errors.firstName && "border-destructive")}
                  disabled={formLocked}
                  {...register("firstName")}
                />
                {errors.firstName ? (
                  <p className="text-label-sm text-error-main">{errors.firstName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-lastName">{t("lastName")}</Label>
                <Input
                  id="staff-lastName"
                  autoComplete="family-name"
                  placeholder={t("lastNamePlaceholder")}
                  className={cn(errors.lastName && "border-destructive")}
                  disabled={formLocked}
                  {...register("lastName")}
                />
                {errors.lastName ? (
                  <p className="text-label-sm text-error-main">{errors.lastName.message}</p>
                ) : null}
              </div>
            </div>

            <div className={cn("grid gap-4", isEdit ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
              <div className="space-y-2">
                <Label htmlFor="staff-position">{t("position")}</Label>
                <Input
                  id="staff-position"
                  placeholder={t("positionPlaceholder")}
                  className={cn(errors.position && "border-destructive")}
                  disabled={formLocked}
                  {...register("position")}
                />
                {errors.position ? (
                  <p className="text-label-sm text-error-main">{errors.position.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-role">{t("role")}</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? field.value : undefined}
                      onValueChange={field.onChange}
                      disabled={formLocked || rolesLoading}
                    >
                      <SelectTrigger
                        id="staff-role"
                        className={cn(errors.role && "border-destructive")}
                        aria-invalid={errors.role ? true : undefined}
                      >
                        <SelectValue placeholder={t("selectRolePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((r) => {
                          const roleQuota = getRoleQuota(r);
                          const roleAllowed = isEdit || canAddStaff(r);
                          const label =
                            roleQuota != null
                              ? tQuota("roleOptionRemaining", {
                                  role: r,
                                  remaining: roleQuota.remaining,
                                  max: roleQuota.max,
                                })
                              : r;
                          return (
                            <SelectItem key={r} value={r} disabled={!isEdit && !roleAllowed}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {rolesQuery.isError ? (
                  <ErrorAlert message={t("rolesLoadError")} className="px-3 py-2" />
                ) : null}
                {errors.role ? (
                  <p className="text-label-sm text-error-main">{errors.role.message}</p>
                ) : null}
              </div>
              {isEdit ? (
                <div className="space-y-2">
                  <Label htmlFor="staff-accessLevel">{t("accessLevel")}</Label>
                  <Input
                    id="staff-accessLevel"
                    placeholder={t("accessLevelPlaceholder")}
                    className={cn(errors.accessLevel && "border-destructive")}
                    disabled={formLocked}
                    {...register("accessLevel")}
                  />
                  {errors.accessLevel ? (
                    <p className="text-label-sm text-error-main">{errors.accessLevel.message}</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-notes">{t("notes")}</Label>
              <Textarea
                id="staff-notes"
                rows={3}
                placeholder={t("notesPlaceholder")}
                disabled={formLocked}
                className={cn(errors.notes && "border-destructive")}
                {...register("notes")}
              />
            </div>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 gap-2 sm:justify-end sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={formLocked} className="w-full sm:w-auto">
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            form="staff-form"
            variant="brand"
            className="w-full sm:w-auto"
            disabled={formLocked || (!isEdit && !canSubmitNewStaff)}
          >
            {pending ? t("savingStaff") : isEdit ? t("saveStaffChanges") : t("saveStaff")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
