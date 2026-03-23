import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await isAuthenticated();
  if (!auth) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminNav />
      <main className="p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
