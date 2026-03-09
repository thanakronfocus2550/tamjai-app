import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { shopSlug, subject, message } = body;

        if (!shopSlug || !subject || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const ticket = await prisma.mascotTicket.create({
            data: {
                shopSlug,
                subject,
                message,
                status: "PENDING"
            }
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
        console.error("Error creating mascot ticket:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tickets = await prisma.mascotTicket.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Try to join with tenant name if not "general"
        const formattedTickets = await Promise.all(tickets.map(async (t: any) => {
            let shopName = t.shopSlug;
            if (t.shopSlug !== "general") {
                const tenant = await prisma.tenant.findUnique({
                    where: { slug: t.shopSlug },
                    select: { name: true }
                });
                if (tenant) shopName = tenant.name;
            }
            return {
                ...t,
                shopName
            };
        }));

        return NextResponse.json(formattedTickets);
    } catch (error) {
        console.error("Error fetching mascot tickets:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
