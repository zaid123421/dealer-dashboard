import axios from "axios";
import api from "@/lib/api";
import type { AddressCity, AddressCountry, AddressProvince } from "@/modules/addresses/types";

function unwrapAsArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const inner = (raw as Record<string, unknown>).data;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function pickNumber(rec: Record<string, unknown>, key: string): number | undefined {
  const v = rec[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pickString(rec: Record<string, unknown>, key: string): string | undefined {
  const v = rec[key];
  return typeof v === "string" && v.trim() ? v : undefined;
}

function parseCountry(row: unknown): AddressCountry | null {
  if (!isRecord(row)) return null;
  const id = pickNumber(row, "id");
  const name = pickString(row, "name");
  if (id === undefined || !name) return null;
  const out: AddressCountry = { id, name };
  const iso3 = pickString(row, "iso3");
  if (iso3) out.iso3 = iso3;
  const lat = pickNumber(row, "latitude");
  const lng = pickNumber(row, "longitude");
  if (lat !== undefined) out.latitude = lat;
  if (lng !== undefined) out.longitude = lng;
  return out;
}

function parseProvince(row: unknown): AddressProvince | null {
  if (!isRecord(row)) return null;
  const id = pickNumber(row, "id");
  const name = pickString(row, "name");
  const countryId = pickNumber(row, "countryId");
  if (id === undefined || !name || countryId === undefined) return null;
  const out: AddressProvince = { id, name, countryId };
  const type = pickString(row, "type");
  if (type) out.type = type;
  const countryName = pickString(row, "countryName");
  if (countryName) out.countryName = countryName;
  return out;
}

function parseCity(row: unknown): AddressCity | null {
  if (!isRecord(row)) return null;
  const id = pickNumber(row, "id");
  const name = pickString(row, "name");
  const stateId = pickNumber(row, "stateId");
  if (id === undefined || !name || stateId === undefined) return null;
  const out: AddressCity = { id, name, stateId };
  const st = pickString(row, "stateName");
  if (st) out.stateName = st;
  const cid = pickNumber(row, "countryId");
  if (cid !== undefined) out.countryId = cid;
  const cn = pickString(row, "countryName");
  if (cn) out.countryName = cn;
  const lat = pickNumber(row, "latitude");
  const lng = pickNumber(row, "longitude");
  if (lat !== undefined) out.latitude = lat;
  if (lng !== undefined) out.longitude = lng;
  return out;
}

export async function fetchAddressCountries(): Promise<AddressCountry[]> {
  try {
    const { data } = await api.get<unknown>("/v1/addresses/base/countries");
    return unwrapAsArray(data)
      .map(parseCountry)
      .filter((x): x is AddressCountry => x !== null)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw new Error(e.message || "Failed to load countries");
    }
    throw e;
  }
}

export async function fetchAddressProvinces(countryId: string): Promise<AddressProvince[]> {
  const id = countryId.trim();
  if (!/^\d+$/.test(id)) return [];
  try {
    const { data } = await api.get<unknown>(
      `/v1/addresses/base/countries/${encodeURIComponent(id)}/provinces`,
    );
    return unwrapAsArray(data)
      .map(parseProvince)
      .filter((x): x is AddressProvince => x !== null)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw new Error(e.message || "Failed to load provinces");
    }
    throw e;
  }
}

export async function fetchAddressCities(provinceId: string): Promise<AddressCity[]> {
  const id = provinceId.trim();
  if (!/^\d+$/.test(id)) return [];
  try {
    const { data } = await api.get<unknown>(
      `/v1/addresses/base/provinces/${encodeURIComponent(id)}/cities`,
    );
    return unwrapAsArray(data)
      .map(parseCity)
      .filter((x): x is AddressCity => x !== null)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw new Error(e.message || "Failed to load cities");
    }
    throw e;
  }
}
