import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactivateDealerStaff } from "@/modules/staff/services/dealer-staff.service";
import { invalidateDealerMe } from "@/modules/dealer/lib/invalidate-dealer-me";

export function useReactivateDealerStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffId: number) => reactivateDealerStaff(staffId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dealer-staff"] });
      void invalidateDealerMe(queryClient);
    },
  });
}
