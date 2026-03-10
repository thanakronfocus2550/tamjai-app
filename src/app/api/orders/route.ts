import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface OrderPayload {
    shop_slug: string;
    items: Array<{ name: string; qty: number; price: number; options: Record<string, unknown> }>;
    customer: { name: string; phone: string; address?: string };
    payMethod: string;
    orderType: string;
    total: number;
    promoCode?: string; // Add promoCode field
}

// LINE Notify message builder
function buildLineMessage(order: OrderPayload, orderId: string): string {
    const itemList = order.items
        .map(i => `  • ${i.qty}× ${i.name} ฿${i.price * i.qty}`)
        .join("\n");

    return `
🔔 ออเดอร์ใหม่! #${orderId}
━━━━━━━━━━━━━━
📍 ร้าน: ${order.shop_slug}
👤 ${order.customer.name} (${order.customer.phone})
🛵 ${order.orderType === "delivery" ? "เดลิเวอรี่" : "รับเอง"}
${order.customer.address ? `📌 ${order.customer.address}` : ""}
━━━━━━━━━━━━━━
🍽️ รายการ:
${itemList}
━━━━━━━━━━━━━━
💰 รวม: ฿${order.total}
💳 ชำระ: ${order.payMethod === "promptpay" ? "PromptPay" : "เงินสด"}
  `.trim();
}

export async function POST(request: NextRequest) {
    try {
        const body: OrderPayload = await request.json();

        // 1. Generate order ID
        const orderId = `TJP-${Date.now().toString().slice(-4)}`;

        // 2. Lookup Tenant & Check Status (Subscription Lock)
        // @ts-ignore
        const tenant = await prisma.tenant.findUnique({
            where: { slug: body.shop_slug },
            // @ts-ignore
            select: { id: true, isActive: true, lineUserId: true }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        if (!tenant.isActive) {
            return NextResponse.json({ error: "Service Suspended (Subscription Expired)" }, { status: 403 });
        }

        // 2.5 Handle Promotion Code
        let discount = 0;
        let finalTotal = body.total;

        if (body.promoCode) {
            // @ts-ignore
            const promotion = await prisma.promotion.findUnique({
                where: { code: body.promoCode }
            });

            if (promotion && promotion.status === "ACTIVE") {
                const now = new Date();
                const isExpired = promotion.expiryDate && new Date(promotion.expiryDate) < now;
                const isLimitReached = promotion.usageLimit && promotion.usageCount >= promotion.usageLimit;
                const minPurchaseMet = !promotion.minPurchase || body.total >= Number(promotion.minPurchase);

                if (!isExpired && !isLimitReached && minPurchaseMet) {
                    if (promotion.type === "PERCENTAGE") {
                        discount = (body.total * Number(promotion.value)) / 100;
                    } else if (promotion.type === "FIXED") {
                        discount = Number(promotion.value);
                    }
                    finalTotal = Math.max(0, body.total - discount);

                    // Increment usage
                    // @ts-ignore
                    await prisma.promotion.update({
                        where: { id: promotion.id },
                        data: { usageCount: { increment: 1 } }
                    });
                }
            }
        }

        // 3. Save order to DB
        const savedOrder = await prisma.order.create({
            data: {
                orderId,
                shopSlug: body.shop_slug,
                customer: body.customer as any,
                items: body.items as any,
                totalAmount: finalTotal, // Use final total
                paymentMethod: body.payMethod,
                // @ts-ignore
                orderType: body.orderType || "pickup",
                tenantId: tenant.id,
                status: "new",
            }
        });

        // 4. Send LINE Smart Notification (Flex Message)
        // @ts-ignore
        if (tenant.lineUserId) {
            const { sendLineFlexMessage } = await import("@/lib/line-utils");
            // @ts-ignore
            await sendLineFlexMessage(tenant.lineUserId, {
                ...body,
                orderId,
            });
        }

        // 5. Advanced Inventory: Deduct Stock
        try {
            for (const item of body.items) {
                // Find product by name within the tenant
                const product = await prisma.product.findFirst({
                    where: {
                        tenantId: tenant.id,
                        name: item.name
                    }
                });

                // @ts-ignore
                if (product && product.trackStock) {
                    await prisma.product.update({
                        where: { id: product.id },
                        // @ts-ignore
                        data: { stockQuantity: { decrement: item.qty || 1 } }
                    });
                }
            }
        } catch (stockErr) {
            console.error("Stock deduction error:", stockErr);
            // Non-blocking for the order
        }

        return NextResponse.json({ success: true, orderId: (savedOrder as any).orderId }, { status: 201 });
    } catch (err) {
        console.error("Order error:", err);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const shop_slug = searchParams.get("shop_slug");
        const status = searchParams.get("status");

        if (!shop_slug) {
            return NextResponse.json({ error: "Missing shop_slug" }, { status: 400 });
        }

        // Security Check: Only SuperAdmin or TenantAdmin for THIS tenantId
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug },
            select: { id: true }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        if (session.user.role !== "SUPER_ADMIN" && session.user.tenantId !== tenant.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: {
                tenantId: tenant.id, // Use tenantId instead of shopSlug for filtering
                ...(status ? { status } : {})
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(orders, { status: 200 });
    } catch (err) {
        console.error("Fetch orders error:", err);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
