import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBuildingRole } from "@/lib/roleGuards";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest, { params }: { params: { buildingId: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getBuildingRole(session.user.id as string, params.buildingId);
  if (role !== "ADMINISTRATION" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { email, name, password, buildingRole } = await req.json();
  let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 12);
    user = await prisma.user.create({ data: { email: email.toLowerCase(), name, passwordHash } });
  }
  const bu = await prisma.buildingUser.upsert({
    where: { userId_buildingId: { userId: user.id, buildingId: params.buildingId } },
    update: { role: buildingRole },
    create: { userId: user.id, buildingId: params.buildingId, role: buildingRole },
  });
  return NextResponse.json(bu, { status: 201 });
}