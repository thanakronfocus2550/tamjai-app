import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const faqs = await prisma.faqItem.findMany({
            where: { isActive: true },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        });
        return NextResponse.json(faqs);
    } catch (err) {
        console.error("FAQ GET error:", err);
        return NextResponse.json({ error: "Failed to load FAQs" }, { status: 500 });
    }
}
