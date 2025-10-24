"use client";

import withAuth from "@/components/withAuth";
import { Sidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
      <Toaster />
    </div>
  );
}

export default withAuth(AdminLayout);
