import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
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
                themeColor: true,
                logoUrl: true,
                isActive: true,
            },
        });

        if (!tenant) {
            return NextResponse.json({ message: "Shop not found" }, { status: 404 });
        }

        return NextResponse.json(tenant, { status: 200 });
    } catch (error) {
        console.error("Fetch shop error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
