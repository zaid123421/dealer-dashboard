"use client";

import { AppSidebar } from "@/shared/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-background sm:flex-row">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-auto p-3 sm:p-6">
        {children}
      </main>
    </div>
  );
}
