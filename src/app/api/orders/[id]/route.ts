import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        // 1. Fetch current order to check tenant ownership
        // Try id (PK) first, then fallback to orderId
        let currentOrder = await prisma.order.findUnique({
            where: { id }
        });

        if (!currentOrder) {
            currentOrder = await prisma.order.findUnique({
                where: { orderId: id }
            });
        }

        if (!currentOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 2. Security Check: Only SuperAdmin or TenantAdmin for THIS shop
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.tenantId !== currentOrder.tenantId)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Missing status" }, { status: 400 });
        }

        const order = await prisma.order.update({
            where: { id: currentOrder.id }, // Use the absolute id we found
            data: { status }
        });

        return NextResponse.json(order, { status: 200 });
    } catch (err) {
        console.error("Update order error:", err);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = await prisma.order.findUnique({
            where: { orderId: id }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order, { status: 200 });
    } catch (err) {
        console.error("Fetch order error:", err);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}
