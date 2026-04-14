import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDealerStaffPage } from "@/modules/staff/services/dealer-staff.service";
import type { DealerStaffListParams } from "@/modules/staff/schemas/dealer-staff-page.schema";
import { useAuthUser } from "@/shared/hooks/use-can-access";

export function dealerStaffQueryKey(params: DealerStaffListParams) {
  return [
    "dealer-staff",
    params.page,
    params.size,
    params.sortBy,
    params.direction,
  ] as const;
}

export function useDealerStaff(params: DealerStaffListParams) {
  const user = useAuthUser();
  return useQuery({
    queryKey: dealerStaffQueryKey(params),
    queryFn: () => getDealerStaffPage(params),
    enabled: !!user,
    placeholderData: keepPreviousData,
  });
}
