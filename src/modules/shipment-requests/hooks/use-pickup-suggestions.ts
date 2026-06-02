import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  combinePickup,
  getPickupSuggestions,
  type CombinePickupPayload,
} from "@/modules/shipment-requests/services/dealer-pickup-suggestion.service";

export const pickupSuggestionsBaseKey = ["dealer", "pickup-suggestions"] as const;

export function pickupSuggestionsQueryKey(deliveryId: number) {
  return [...pickupSuggestionsBaseKey, deliveryId] as const;
}

export function usePickupSuggestions(deliveryId: number | null) {
  return useQuery({
    queryKey: pickupSuggestionsQueryKey(deliveryId ?? -1),
    queryFn: () => getPickupSuggestions(deliveryId as number),
    enabled: typeof deliveryId === "number" && deliveryId > 0,
    staleTime: 30_000,
  });
}

export function useCombinePickupMutation(deliveryId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CombinePickupPayload) => {
      if (typeof deliveryId !== "number" || deliveryId <= 0) {
        return Promise.reject(new Error("Invalid delivery id"));
      }
      return combinePickup(deliveryId, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dealer", "cart"] }),
        queryClient.invalidateQueries({ queryKey: ["dealer", "shipment-requests-paged"] }),
        queryClient.invalidateQueries({ queryKey: pickupSuggestionsBaseKey }),
      ]);
    },
  });
}
