import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const tickets = await prisma.mascotTicket.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Enhance with shop name if needed
        const enhancedTickets = await Promise.all(tickets.map(async (t) => {
            if (t.shopSlug === 'general') return { ...t, shopName: 'General Inquiry' };
            const tenant = await prisma.tenant.findUnique({
                where: { slug: t.shopSlug },
                select: { name: true }
            });
            return { ...t, shopName: tenant?.name || t.shopSlug };
        }));

        return NextResponse.json(enhancedTickets);
    } catch (error) {
        console.error("[HELPDESK_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { id, status } = body;

        const ticket = await prisma.mascotTicket.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("[HELPDESK_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
