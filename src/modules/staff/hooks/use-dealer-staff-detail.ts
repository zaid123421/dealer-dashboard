import { useQuery } from "@tanstack/react-query";
import { getDealerStaffById } from "@/modules/staff/services/dealer-staff.service";

export function dealerStaffDetailQueryKey(staffId: number) {
  return ["dealer-staff", "detail", staffId] as const;
}

export function useDealerStaffDetail(staffId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ["dealer-staff", "detail", staffId ?? 0],
    queryFn: () => getDealerStaffById(staffId!),
    enabled: Boolean(enabled && staffId != null && staffId > 0),
  });
}
