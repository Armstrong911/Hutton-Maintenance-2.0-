import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, strataPlan, address, city, province, postalCode, notes } = await req.json();
  const building = await prisma.building.create({
    data: { name, strataPlan, address, city: city ?? "Victoria", province: province ?? "BC", postalCode, notes }
  });
  return NextResponse.json(building, { status: 201 });
}