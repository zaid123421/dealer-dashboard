import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[95dvh] flex-col items-center justify-center gap-4 px-4 py-12">
      <h1 className="text-headline-lg font-bold text-foreground">404</h1>
      <p className="text-body-md text-muted-foreground">
        الصفحة المطلوبة غير موجودة.
      </p>
      <Button variant="outline" asChild>
        <Link href="/">العودة للصفحة الرئيسية</Link>
      </Button>
    </div>
  );
}
