import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH: Update product
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string; id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { shop_slug, id } = await params;

        if (!session || (session.user.shopSlug !== shop_slug && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, price, imageUrl, categoryId, isAvailable, isRecommended, addons, stockQuantity, trackStock } = body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(categoryId && { categoryId }),
                ...(isAvailable !== undefined && { isAvailable }),
                ...(isRecommended !== undefined && { isRecommended }),
                ...(stockQuantity !== undefined && { stockQuantity }),
                ...(trackStock !== undefined && { trackStock }),
                // @ts-ignore
                ...(addons !== undefined && { addons })
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove product
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string; id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { shop_slug, id } = await params;

        if (!session || (session.user.shopSlug !== shop_slug && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
