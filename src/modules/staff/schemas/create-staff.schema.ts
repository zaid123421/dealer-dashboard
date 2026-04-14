import { z } from "zod";
import type { DealerStaffMember } from "@/modules/staff/schemas/dealer-staff-page.schema";

export const createStaffFormSchema = z.object({
  email: z.string().trim().min(1).email(),
  username: z.string().optional(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  position: z.string().trim().min(1),
  role: z.string().trim().min(1),
  accessLevel: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateStaffFormValues = z.infer<typeof createStaffFormSchema>;

export type CreateStaffRequest = {
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  role: string;
  notes: string;
  username?: string;
  accessLevel?: string;
};

/** إنشاء: بدون username/accessLevel في الجسم إن لم يُجمعا (نموذج الإضافة لا يعرضهما). */
export function mapStaffFormToRequest(
  values: CreateStaffFormValues,
  forEdit: boolean,
): CreateStaffRequest {
  const base: CreateStaffRequest = {
    email: values.email.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    position: values.position.trim(),
    role: values.role.trim(),
    notes: (values.notes ?? "").trim(),
  };
  if (forEdit) {
    return {
      ...base,
      username: (values.username ?? "").trim(),
      accessLevel: (values.accessLevel ?? "").trim(),
    };
  }
  return base;
}

/** تعبئة النموذج من صف القائمة عند التعديل */
export function dealerStaffMemberToFormValues(member: DealerStaffMember): CreateStaffFormValues {
  return {
    email: member.email?.trim() ?? "",
    username: member.username?.trim() ?? "",
    firstName: member.firstName?.trim() ?? "",
    lastName: member.lastName?.trim() ?? "",
    position: member.position?.trim() ?? "",
    role: member.role?.trim() ?? "",
    accessLevel: member.accessLevel?.trim() ?? "",
    notes: member.notes?.trim() ?? "",
  };
}
