import { z } from "zod";
import { dealerCustomerResponseSchema } from "@/modules/customers/schemas/create-dealer-customer.schema";

const sortMetaSchema = z.object({
  unsorted: z.boolean(),
  sorted: z.boolean(),
  empty: z.boolean(),
});

/** صفحة Spring Data لقائمة عملاء الـ dealer */
export const dealerCustomerPageSchema = z
  .object({
    content: z.array(dealerCustomerResponseSchema),
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

export type DealerCustomerPage = z.infer<typeof dealerCustomerPageSchema>;

export type MyDealerCustomersParams = {
  page: number;
  size: number;
  sortBy: string;
  direction: "asc" | "desc";
  includeArchived: boolean;
};

export type SearchDealerCustomersParams = MyDealerCustomersParams & {
  searchTerm: string;
  /** يُرسَل للـ API لمطابقة البادئة (starts with) */
  startsWith?: boolean;
};
