import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch store settings
export async function GET(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    try {
        const { shop_slug } = await params;

        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug },
            select: {
                id: true,
                name: true,
                slug: true,
                phone: true,
                address: true,
                openTime: true,
                closeTime: true,
                isOpen: true,
                lineUserId: true,
                bankName: true,
                bankAccount: true,
                deliveryEnabled: true,
                pickupEnabled: true,
                themeColor: true,
                logoUrl: true
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        return NextResponse.json(tenant);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Update store settings
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { shop_slug } = await params;

        if (!session || (session.user.shopSlug !== shop_slug && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Remove fields that shouldn't be updated here
        const { id, slug, createdAt, updatedAt, ...updateData } = body;

        const tenant = await prisma.tenant.update({
            where: { slug: shop_slug },
            data: updateData
        });

        return NextResponse.json(tenant);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
