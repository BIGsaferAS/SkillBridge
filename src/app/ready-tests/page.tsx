import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ReadyTestsClient from "./ReadyTestsClient";

export default async function ReadyTestsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  const companyId = (session.user as any).companyId;

  // Candidates (INDIVIDUAL) shouldn't access this admin page
  if (role === "INDIVIDUAL") {
    redirect("/dashboard");
  }

  // Fetch filters dynamically from database seeded tables
  const sectors = await prisma.industry.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  const roles = await prisma.jobRole.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  // Fetch companies based on companyId restrictions
  const companies = await prisma.company.findMany({
    where: companyId ? { id: companyId } : undefined,
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  // Fetch both system default templates (companyId: null) and company-specific tests
  const initialTests = await prisma.test.findMany({
    where: {
      OR: [
        { companyId: null },
        companyId ? { companyId } : {}
      ]
    },
    select: {
      id: true,
      title: true,
      sector: true,
      department: true,
      roleName: true,
      difficulty: true,
      _count: {
        select: { questions: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <ReadyTestsClient
      sectors={sectors}
      departments={departments}
      roles={roles}
      initialTests={initialTests}
      companyId={companyId}
      companies={companies}
    />
  );
}
