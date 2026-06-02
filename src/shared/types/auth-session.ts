/**
 * بيانات المستخدم من GET /v1/dealer/me (المصدر الرئيسي بعد تسجيل الدخول).
 */
export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  /** الدور كما يعيده الـ backend، مثل DEALER_ADMIN */
  backendRole: string;
  accessLevel: string;
  userActive: boolean;
  tenantType: string;
  tenantId: number;
  tenantName: string;
  /** مدة صلاحية access token بالثواني */
  expiresInSeconds: number;
}
