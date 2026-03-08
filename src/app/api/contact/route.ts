import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, topic, shopName, message } = body;

        // Verify we have a tenant for the shop string or default to the platform if none/unknown
        let tenantId = "platform";
        if (shopName) {
            const tenant = await prisma.tenant.findFirst({
                where: { OR: [{ name: shopName }, { slug: shopName }] }
            });
            if (tenant) {
                tenantId = tenant.id;
            }
        }

        // Generate ticket ID
        const dateStr = new Date().getFullYear().toString();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const ticketId = `TK-${dateStr}-${randomNum}`;

        // Create helpdesk ticket
        const ticketData: any = {
            ticketId,
            subject: topic,
            ownerName: name,
            email,
            priority: (topic === "support" || topic === "complaint") ? "HIGH" : "MEDIUM",
            messages: [{
                role: "merchant",
                content: message + `\n\n[Contact Info: ${phone}]`,
                createdAt: new Date()
            }]
        };

        if (tenantId && tenantId !== "platform") {
            ticketData.tenantId = tenantId;
        }

        // @ts-ignore - Prisma schema generated types might be slightly out of sync or missing
        const ticket = await prisma.helpdeskTicket.create({
            data: ticketData
        });

        return NextResponse.json({ success: true, ticket });
    } catch (err) {
        console.error("Failed to create ticket", err);
        return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }
}
