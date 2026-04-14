import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disableDealerStaff } from "@/modules/staff/services/dealer-staff.service";

export function useDisableDealerStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffId: number) => disableDealerStaff(staffId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dealer-staff"] });
    },
  });
}
