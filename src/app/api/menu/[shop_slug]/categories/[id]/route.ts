import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH: Update category
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

        const { name, order } = await req.json();

        const category = await prisma.category.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(order !== undefined && { order })
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove category
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

        // Check if there are products in this category before deleting? 
        // For now, let's just delete (Prisma might fail if there's a constraint, which is fine)
        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
