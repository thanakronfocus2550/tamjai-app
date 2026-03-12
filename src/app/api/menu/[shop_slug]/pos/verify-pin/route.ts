import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    try {
        const { shop_slug } = await params;
        const session = await getServerSession(authOptions) as any;

        if (!session || (session.user.role !== "TENANT_ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "STAFF")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { pin } = await req.json();

        // Find user by PIN and TenantId
        const user = await prisma.user.findFirst({
            where: {
                tenantId: session.user.tenantId,
                // @ts-ignore
                posPin: pin
            },
            select: {
                name: true,
                role: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid PIN" }, { status: 403 });
        }

        return NextResponse.json({
            name: user.name,
            role: user.role
        });

    } catch (err) {
        console.error("PIN verification error:", err);
        return NextResponse.json({ error: "PIN verification failed" }, { status: 500 });
    }
}
