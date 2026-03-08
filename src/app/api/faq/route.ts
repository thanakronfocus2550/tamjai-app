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
    } catch (err: any) {
        console.error("FAQ GET error:", {
            message: err.message,
            stack: err.stack,
            code: err.code
        });
        return NextResponse.json({ error: "Failed to load FAQs", debug: err.message }, { status: 500 });
    }
}
