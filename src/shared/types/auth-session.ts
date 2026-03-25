/**
 * بيانات المستخدم والمستأجر من استجابة تسجيل الدخول (TreadX API).
 */
export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  /** الدور كما يعيده الـ backend، مثل DEALER_ADMIN */
  backendRole: string;
  tenantType: string;
  tenantId: number;
  tenantName: string;
  /** مدة صلاحية access token بالثواني */
  expiresInSeconds: number;
}
