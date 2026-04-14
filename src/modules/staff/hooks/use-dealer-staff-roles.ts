import { useQuery } from "@tanstack/react-query";
import { getDealerStaffRoles } from "@/modules/staff/services/dealer-staff.service";

export function dealerStaffRolesQueryKey() {
  return ["dealer-staff", "roles"] as const;
}

export function useDealerStaffRoles(enabled: boolean) {
  return useQuery({
    queryKey: dealerStaffRolesQueryKey(),
    queryFn: getDealerStaffRoles,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
