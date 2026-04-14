import axios from "axios";
import api from "@/lib/api";
import {
  dealerStaffMemberSchema,
  dealerStaffPageSchema,
  type DealerStaffMember,
  type DealerStaffPage,
  type DealerStaffListParams,
} from "@/modules/staff/schemas/dealer-staff-page.schema";
import type { CreateStaffRequest } from "@/modules/staff/schemas/create-staff.schema";

function unwrapPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") return {};
  const root = data as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return root;
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

export async function getDealerStaffPage(
  params: DealerStaffListParams,
): Promise<DealerStaffPage> {
  try {
    const { data } = await api.get<unknown>("/dealer-portal/staff", {
      params: {
        page: params.page,
        size: params.size,
        sortBy: params.sortBy,
        direction: params.direction,
      },
    });
    const raw = unwrapPayload(data);
    return dealerStaffPageSchema.parse(raw);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}

/** تفاصيل موظف واحد (غالباً تتضمن حقولاً أكثر من قائمة الجدول مثل notes). */
export async function getDealerStaffById(staffId: number): Promise<DealerStaffMember> {
  try {
    const { data } = await api.get<unknown>(`/dealer-portal/staff/${staffId}`);
    const raw = unwrapPayload(data);
    return dealerStaffMemberSchema.parse(raw);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}

export async function createDealerStaff(payload: CreateStaffRequest): Promise<void> {
  try {
    await api.post("/dealer-portal/staff", payload);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}

export async function updateDealerStaff(
  staffId: number,
  payload: CreateStaffRequest,
): Promise<void> {
  try {
    await api.put(`/dealer-portal/staff/${staffId}`, payload);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}

/** أدوار الموظف المتاحة لنموذج الإضافة/التعديل. */
export async function getDealerStaffRoles(): Promise<string[]> {
  try {
    const { data } = await api.get<unknown>("/dealer-portal/staff/roles");
    if (!data || typeof data !== "object") return [];
    const root = data as Record<string, unknown>;
    const inner = root.data;
    if (!Array.isArray(inner)) return [];
    return inner.filter((item): item is string => typeof item === "string");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}

/** تعطيل حساب الموظف (الحساب يبقى مسجّلاً لكن غير نشط). */
export async function disableDealerStaff(staffId: number): Promise<void> {
  try {
    await api.delete(`/dealer-portal/staff/${staffId}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}

/** حذف حساب الموظف نهائياً. */
export async function deleteDealerStaff(staffId: number): Promise<void> {
  try {
    await api.delete(`/dealer-portal/staff/${staffId}/delete`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
