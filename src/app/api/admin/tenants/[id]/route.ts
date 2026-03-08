import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, slug, plan, isActive } = body;

        const updatedTenant = await prisma.tenant.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
                ...(plan && { plan }),
                ...(isActive !== undefined && { isActive }),
            }
        });

        return NextResponse.json(updatedTenant);
    } catch (err: any) {
        console.error("Update tenant error:", err);
        return NextResponse.json({ error: err.message || "Failed to update tenant" }, { status: 500 });
    }
}
