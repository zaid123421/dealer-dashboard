import { redirect } from "next/navigation";

/**
 * الصفحة الرئيسية: توجيه المستخدم إلى صفحة تسجيل الدخول.
 * صفحة تسجيل الدخول الفعلية عند /auth
 */
export default function Home() {
  redirect("/auth");
}
