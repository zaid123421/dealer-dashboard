import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disableDealerStaff } from "@/modules/staff/services/dealer-staff.service";
import { invalidateDealerMe } from "@/modules/dealer/lib/invalidate-dealer-me";

export function useDisableDealerStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffId: number) => disableDealerStaff(staffId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dealer-staff"] });
      void invalidateDealerMe(queryClient);
    },
  });
}
