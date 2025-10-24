"use client";

import withAuth from "@/components/withAuth";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}

export default withAuth(AdminLayout);
