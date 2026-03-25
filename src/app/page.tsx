import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/**
 * الصفحة الرئيسية: توجيه المستخدم إلى صفحة تسجيل الدخول.
 */
export default function Home() {
  redirect(ROUTES.AUTH.LOGIN);
}
