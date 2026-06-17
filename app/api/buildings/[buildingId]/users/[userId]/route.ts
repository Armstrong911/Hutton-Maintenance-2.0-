import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBuildingRole } from "@/lib/roleGuards";

export async function DELETE(req: NextRequest, { params }: { params: { buildingId: string; userId: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getBuildingRole(session.user.id as string, params.buildingId);
  if (role !== "ADMINISTRATION" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.buildingUser.delete({ where: { id: params.userId } });
  return NextResponse.json({ success: true });
}