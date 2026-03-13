import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch store settings
export async function GET(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    const { shop_slug } = await params;
    try {

        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug },
            select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
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
                // @ts-ignore
                deliveryFee: true,
                themeColor: true,
                logoUrl: true,
                bannerUrl: true,
                description: true,
                promptPayQrUrl: true,
                socialLinks: true,
                weeklyHolidays: true
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        // Handle Decimal serialization
        const serializedTenant = {
            ...tenant,
            deliveryFee: Number(tenant.deliveryFee)
        };

        return NextResponse.json(serializedTenant);
    } catch (error: any) {
        console.error("Error fetching settings:", {
            error,
            message: error.message,
            stack: error.stack,
            shop_slug
        });
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            shop_slug
        }, { status: 500 });
    }
}

// PUT: Update store settings
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    const { shop_slug } = await params;
    try {
        const session = await getServerSession(authOptions);

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
    } catch (error: any) {
        console.error("Error updating settings:", {
            error,
            message: error.message,
            stack: error.stack,
            shop_slug
        });
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            shop_slug
        }, { status: 500 });
    }
}
