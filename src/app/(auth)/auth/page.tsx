"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function LoginPage() {
  const t = useTranslations("auth")
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">بوابة الموردين</CardTitle>
          <CardDescription>
            {t(`login`)}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
            <Input id="email" type="email" placeholder="name@example.com" className="text-right" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password text-right" className="text-right">كلمة المرور</Label>
            <Input id="password" type="password" className="text-right" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            تسجيل الدخول
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}