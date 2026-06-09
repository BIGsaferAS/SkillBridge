import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/AdminHeader";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "COMPANY_MANAGER" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const companyId = (session.user as any).companyId;
  let companyName = "";
  if (companyId) {
    const comp = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });
    if (comp) {
      companyName = comp.name;
    }
  }

  const userName = session.user?.name || "Yönetici";

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader userName={userName} companyName={companyName} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
