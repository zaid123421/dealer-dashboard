import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDealerStaff } from "@/modules/staff/services/dealer-staff.service";
import type { CreateStaffRequest } from "@/modules/staff/schemas/create-staff.schema";

export function useCreateDealerStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffRequest) => createDealerStaff(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dealer-staff"] });
    },
  });
}
