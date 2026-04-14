import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDealerStaff } from "@/modules/staff/services/dealer-staff.service";
import type { CreateStaffRequest } from "@/modules/staff/schemas/create-staff.schema";
import { dealerStaffDetailQueryKey } from "@/modules/staff/hooks/use-dealer-staff-detail";

export function useUpdateDealerStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, payload }: { staffId: number; payload: CreateStaffRequest }) =>
      updateDealerStaff(staffId, payload),
    onSuccess: (_void, { staffId }) => {
      void queryClient.invalidateQueries({ queryKey: ["dealer-staff"] });
      void queryClient.invalidateQueries({ queryKey: dealerStaffDetailQueryKey(staffId) });
    },
  });
}
