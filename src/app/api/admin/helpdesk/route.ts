import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Check if prisma is ready for this model
        // @ts-ignore
        if (!prisma.helpdeskTicket) {
            console.error("Prisma client is out of sync: helpdeskTicket model not found.");
            return NextResponse.json({ error: "Prisma client out of sync. Please run 'npx prisma generate'." }, { status: 500 });
        }

        // @ts-ignore
        const tickets = await prisma.helpdeskTicket.findMany({
            include: {
                tenant: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, status, reply } = await request.json();

        // @ts-ignore
        const currentTicket = await prisma.helpdeskTicket.findUnique({
            where: { id }
        });

        if (!currentTicket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        const messages = Array.isArray(currentTicket.messages) ? [...currentTicket.messages as any[]] : [];
        if (reply) {
            messages.push({
                role: 'admin',
                content: reply,
                createdAt: new Date()
            });
        }

        // @ts-ignore
        const updatedTicket = await prisma.helpdeskTicket.update({
            where: { id },
            data: {
                status: status || currentTicket.status,
                messages: messages
            }
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error("Error updating ticket:", error);
        return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
    }
}
