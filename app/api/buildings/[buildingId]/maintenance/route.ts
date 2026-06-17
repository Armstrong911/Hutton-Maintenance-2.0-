import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBuildingRole } from "@/lib/roleGuards";

export async function POST(req: NextRequest, { params }: { params: { buildingId: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getBuildingRole(session.user.id as string, params.buildingId);
  if (role !== "ADMINISTRATION" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const record = await prisma.maintenanceRecord.create({
      data: {
        buildingId:     params.buildingId,
        contractorName: body.contractorName,
        description:    body.description,
        workDate:       new Date(body.workDate),
        price:          parseFloat(body.price),
        status:         body.status ?? "COMPLETED",
        invoiceNumber:  body.invoiceNumber || null,
        notes:          body.notes || null,
        createdById:    session.user.id as string,
      }
    });
    await prisma.auditLog.create({
      data: { userId: session.user.id as string, buildingId: params.buildingId,
              action: "MAINTENANCE_CREATE", entityType: "MAINTENANCE_RECORD", entityId: record.id }
    });
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { buildingId: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getBuildingRole(session.user.id as string, params.buildingId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const records = await prisma.maintenanceRecord.findMany({
    where: { buildingId: params.buildingId },
    orderBy: { workDate: "desc" },
  });
  return NextResponse.json(records);
}