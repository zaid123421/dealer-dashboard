/**
 * تسجيل مستخدم جديد (محاكاة).
 * لاحقاً استبدل باستدعاء API التسجيل من الـ Backend.
 */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  success: true;
}

export async function registerUseCase(input: RegisterInput): Promise<RegisterResult> {
  // محاكاة: تأخير بسيط ثم نجاح
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true };
}
