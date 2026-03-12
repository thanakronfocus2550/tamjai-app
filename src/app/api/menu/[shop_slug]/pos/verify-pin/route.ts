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

        // 1. Get the tenant by slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug },
            select: { id: true }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        // 2. Security check: User must be SUPER_ADMIN or own this specific tenant
        const isSuper = session.user.role === "SUPER_ADMIN";
        const isOwner = session.user.tenantId === tenant.id;

        if (!isSuper && !isOwner && session.user.role !== "STAFF") {
            // For STAFF, we should also check if they belong to this tenant
            return NextResponse.json({ error: "Unauthorized access to this shop" }, { status: 403 });
        }

        // 3. Find user by PIN within this tenant
        const user = await prisma.user.findFirst({
            where: {
                tenantId: tenant.id,
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
