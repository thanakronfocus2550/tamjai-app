import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ shop_slug: string, id: string }> }
) {
    const { id } = await params;

    const session = await getServerSession(authOptions) as any;
    if (!session || (session.user.role !== 'TENANT_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // @ts-ignore
        await prisma.table.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete table error:", err);
        return NextResponse.json({ error: "Failed to delete table" }, { status: 500 });
    }
}
