import { z } from "zod";

const sortMetaSchema = z.object({
  unsorted: z.boolean(),
  sorted: z.boolean(),
  empty: z.boolean(),
});

/** صف موظف في قائمة dealer portal */
export const dealerStaffMemberSchema = z
  .object({
    id: z.number(),
    userId: z.number(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    position: z.string().nullable().optional(),
    role: z.string(),
    accessLevel: z.string(),
    status: z.string(),
    temporaryPassword: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .passthrough();

export type DealerStaffMember = z.infer<typeof dealerStaffMemberSchema>;

/** صفحة Spring Data لقائمة موظفي الـ dealer */
export const dealerStaffPageSchema = z
  .object({
    content: z.array(dealerStaffMemberSchema),
    totalPages: z.number(),
    totalElements: z.number(),
    last: z.boolean(),
    first: z.boolean(),
    numberOfElements: z.number(),
    size: z.number(),
    number: z.number(),
    sort: sortMetaSchema,
    empty: z.boolean(),
  })
  .passthrough();

export type DealerStaffPage = z.infer<typeof dealerStaffPageSchema>;

export type DealerStaffListParams = {
  page: number;
  size: number;
  sortBy: string;
  direction: "asc" | "desc";
};
