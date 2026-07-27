"use client";

import { AppSidebar } from "@/shared/components/app-sidebar";
import { AuthBootstrap } from "@/shared/components/auth-bootstrap";
import { RenewSubscriptionDialogProvider } from "@/modules/dealer/components/renew-subscription-dialog-provider";
import { SubscriptionViewOnlyBanner } from "@/modules/dealer/components/subscription-view-only-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RenewSubscriptionDialogProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background sm:flex-row">
        <AuthBootstrap />
        <AppSidebar />
        <main className="min-w-0 flex-1 overflow-auto p-3 sm:p-6">
          <SubscriptionViewOnlyBanner />
          {children}
        </main>
      </div>
    </RenewSubscriptionDialogProvider>
  );
}
