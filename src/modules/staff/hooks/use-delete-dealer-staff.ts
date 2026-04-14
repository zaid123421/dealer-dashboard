import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDealerStaff } from "@/modules/staff/services/dealer-staff.service";

export function useDeleteDealerStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffId: number) => deleteDealerStaff(staffId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dealer-staff"] });
    },
  });
}
