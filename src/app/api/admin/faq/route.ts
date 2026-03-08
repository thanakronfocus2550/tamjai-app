import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
    try {
        const faqs = await prisma.faqItem.findMany({
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        });
        return NextResponse.json(faqs);
    } catch (err) {
        console.error("Admin FAQ GET error:", err);
        return NextResponse.json({ error: "Failed to load FAQs" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { question, answer, category, order, isActive } = body;

        if (!question || !answer) {
            return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
        }

        const faq = await prisma.faqItem.create({
            data: {
                question,
                answer,
                category: category || "General",
                order: order ?? 0,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json(faq, { status: 201 });
    } catch (err) {
        console.error("Admin FAQ POST error:", err);
        return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
    }
}
