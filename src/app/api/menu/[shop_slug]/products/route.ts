import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch all products for a shop
export async function GET(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    try {
        const { shop_slug } = await params;

        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug },
            select: { id: true }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        const products = await prisma.product.findMany({
            where: { tenantId: tenant.id },
            include: { category: true },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new product
export async function POST(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { shop_slug } = await params;

        if (!session || (session.user.shopSlug !== shop_slug && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description, price, imageUrl, categoryId, isAvailable, isRecommended, addons, stockQuantity, trackStock } = await request_json(req);

        if (!name || !price || !categoryId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        // @ts-ignore
        const product = await prisma.product.create({
            // @ts-ignore
            data: {
                name,
                description,
                // @ts-ignore
                price: new Prisma.Decimal(price),
                imageUrl,
                categoryId,
                isAvailable: isAvailable ?? true,
                // isRecommended: isRecommended ?? false,
                // stockQuantity: stockQuantity ?? 0,
                // trackStock: trackStock ?? false,
                // @ts-ignore
                addons: (addons || []) as any,
                tenantId: tenant.id
            }
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Error creating product:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            code: error.code
        }, { status: 500 });
    }
}

async function request_json(req: Request) {
    return await req.json();
}
