'use client';

import { useCanAccess } from '@/shared/hooks/use-can-access';

interface RequireRoleProps {
  /** المسار أو البادئة المطلوبة للوصول */
  path: string;
  children: React.ReactNode;
  /** يُعرض عند عدم وجود الصلاحية (اختياري) */
  fallback?: React.ReactNode;
}

/**
 * يعرض الأطفال فقط إذا كان المستخدم الحالي يملك صلاحية الوصول للمسار المعطى.
 */
export function RequireRole({ path, children, fallback = null }: RequireRoleProps) {
  const allowed = useCanAccess(path);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
