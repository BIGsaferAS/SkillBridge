import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const job = await prisma.jobPosting.create({
      data: {
        title: data.title,
        sector: data.sector,
        department: data.department,
        roleName: data.roleName,
        competencies: JSON.stringify(data.competencies),
      },
    });
    return NextResponse.json({ job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
