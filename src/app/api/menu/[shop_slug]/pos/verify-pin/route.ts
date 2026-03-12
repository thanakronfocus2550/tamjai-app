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

        const { pin: rawPin } = await req.json();
        const pin = rawPin.trim();

        // 1. Get the tenant by slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug },
            select: { id: true, name: true }
        });

        if (!tenant) {
            console.error(`[POS PIN ERROR] Shop not found for slug: ${shop_slug}`);
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        // 2. Security check: User must be SUPER_ADMIN or own this specific tenant
        const isSuper = session.user.role === "SUPER_ADMIN";
        const isOwner = session.user.tenantId === tenant.id;

        if (!isSuper && !isOwner && session.user.role !== "STAFF") {
            console.warn(`[POS PIN ERROR] Unauthorized access attempt to shop ${shop_slug} by user ${session.user.id} (role: ${session.user.role})`);
            return NextResponse.json({ error: "Unauthorized access to this shop" }, { status: 403 });
        }

        // 3. Find user by PIN
        // Create lookup conditions
        const orConditions: any[] = [
            { tenantId: tenant.id, posPin: pin }
        ];

        // If Super Admin, allow their global PIN or master PIN "000000"
        if (isSuper) {
            orConditions.push({ role: "SUPER_ADMIN", posPin: pin });
            if (pin === "000000") {
                orConditions.push({ role: "SUPER_ADMIN" });
            }
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: orConditions
            },
            select: {
                name: true,
                role: true,
                tenantId: true
            }
        });

        if (!user) {
            console.warn(`[POS PIN ERROR] Shop: ${shop_slug}, Method: ${session.user.role}, Attempt: ${pin}`);
            return NextResponse.json({ error: "PIN ไม่ถูกต้อง หรือคุณจำกัดสิทธิ์การใช้งาน" }, { status: 403 });
        }

        console.log(`[POS PIN SUCCESS] User ${user.name} (${user.role}) unlocked terminal for ${shop_slug}`);

        return NextResponse.json({
            name: user.name,
            role: user.role
        });

    } catch (err) {
        console.error("PIN verification error:", err);
        return NextResponse.json({ error: "PIN verification failed" }, { status: 500 });
    }
}
