import axios from "axios";
import api from "@/lib/api";

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class ChangePasswordError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: "WRONG_CURRENT_PASSWORD",
  ) {
    super(message);
    this.name = "ChangePasswordError";
  }
}

function isWrongCurrentPasswordPayload(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const msg = (data as Record<string, unknown>).message;
  if (typeof msg !== "string") return false;
  const lower = msg.toLowerCase();
  return lower.includes("current password") && lower.includes("incorrect");
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  const errors = rec.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (first && typeof first === "object" && "message" in first) {
      const m = (first as { message?: unknown }).message;
      if (typeof m === "string" && m.trim()) return m;
    }
  }
  return undefined;
}

export async function changePasswordUseCase(input: ChangePasswordInput): Promise<void> {
  try {
    await api.post("/v1/auth/change-password", {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      confirmPassword: input.confirmPassword,
    });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status;
      const data = e.response?.data;
      const wrongCurrent = status === 401 && isWrongCurrentPasswordPayload(data);
      const msg =
        messageFromResponseData(data) ??
        (typeof e.message === "string" && e.message.trim() ? e.message : undefined) ??
        "Change password failed";
      throw new ChangePasswordError(
        msg,
        status,
        wrongCurrent ? "WRONG_CURRENT_PASSWORD" : undefined,
      );
    }
    throw e;
  }
}
