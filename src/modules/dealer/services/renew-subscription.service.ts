import axios from "axios";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

export type SubscriptionRenewalRequest = {
  amountPaid?: number;
  autoRenew?: boolean;
};

export class RenewSubscriptionError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "RenewSubscriptionError";
  }
}

/** POST /v1/subscriptions/{id}/renew */
export async function renewSubscription(
  subscriptionId: number,
  payload: SubscriptionRenewalRequest,
): Promise<void> {
  try {
    const body: SubscriptionRenewalRequest = {};
    if (payload.amountPaid != null && !Number.isNaN(payload.amountPaid)) {
      body.amountPaid = payload.amountPaid;
    }
    if (payload.autoRenew != null) {
      body.autoRenew = payload.autoRenew;
    }
    await api.post(`/v1/subscriptions/${subscriptionId}/renew`, body);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        getApiErrorMessage(err.response?.data) ??
        err.message ??
        "Request failed";
      throw new RenewSubscriptionError(msg, status);
    }
    if (err instanceof Error) throw new RenewSubscriptionError(err.message);
    throw new RenewSubscriptionError("Request failed");
  }
}
