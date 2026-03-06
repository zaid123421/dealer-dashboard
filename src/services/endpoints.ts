export const ENDPOINTS = {
  // Example
  PATIENT: {
    LIST: "/admin/patients",
    CHECK_EXISTS: "/admin/patients/check-exists",
    DETAILS: (id: string | number) => `/admin/patients/${id}`,
    ALLERGIES: "/admin/patient-allergies",
    SCAN_QR: "/patients/scan-qr-code",
  },
} as const;

export type Endpoints = typeof ENDPOINTS;

export const getFullUrl = (suffix: string, isClient: boolean = true): string => {
  const baseUrl = isClient
    ? process.env.NEXT_PUBLIC_BACKEND_URL_FOR_CLIENT_REQUESTS 
    : process.env.NEXT_PUBLIC_BACKEND_URL_FOR_SERVER_REQUESTS;
    
  return `${baseUrl}/api${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
};