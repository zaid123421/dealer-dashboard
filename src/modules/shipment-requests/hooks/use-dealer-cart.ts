import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartListQuery } from "@/modules/shipment-requests/lib/dealer-cart-dto";
import {
  listDealerCart,
  moveCartItemIn,
  submitAllCartItems,
  submitCartItem,
} from "@/modules/shipment-requests/services/dealer-cart.service";

export const dealerCartBaseQueryKey = ["dealer", "cart"] as const;

export function dealerCartQueryKey(query: CartListQuery) {
  return [...dealerCartBaseQueryKey, query] as const;
}

export function useDealerCart(query: CartListQuery) {
  return useQuery({
    queryKey: dealerCartQueryKey(query),
    queryFn: () => listDealerCart(query),
  });
}

export function useMoveCartItemIn(query: CartListQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveCartItemIn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dealerCartBaseQueryKey });
      await queryClient.invalidateQueries({ queryKey: dealerCartQueryKey(query) });
    },
  });
}

export function useSubmitCartItem(query: CartListQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitCartItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dealerCartBaseQueryKey });
      await queryClient.invalidateQueries({ queryKey: dealerCartQueryKey(query) });
    },
  });
}

export function useSubmitAllCartItems(query: CartListQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitAllCartItems,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dealerCartBaseQueryKey });
      await queryClient.invalidateQueries({ queryKey: dealerCartQueryKey(query) });
    },
  });
}
