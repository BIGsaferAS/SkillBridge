import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminHeader from "@/components/AdminHeader";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const userName = session.user?.name || "Süper Yönetici";

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader userName={userName} companyName="Süper Yönetici" />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
