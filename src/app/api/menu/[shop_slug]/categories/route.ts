import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch all categories for a shop
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

        const categories = await prisma.category.findMany({
            where: { tenantId: tenant.id },
            orderBy: { order: "asc" }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new category
export async function POST(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { shop_slug } = await params;

        // Simple auth check: user must be logged in and match the shop_slug (or be superadmin)
        if (!session || (session.user.shopSlug !== shop_slug && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, order } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\u0E00-\u0E7F\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const category = await prisma.category.create({
            data: {
                name,
                slug: slug || `cat-${Date.now()}`,
                order: order || 0,
                tenantId: tenant.id
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
