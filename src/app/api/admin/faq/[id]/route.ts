import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const faq = await prisma.faqItem.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(faq);
    } catch (err) {
        console.error("Admin FAQ PATCH error:", err);
        return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.faqItem.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Admin FAQ DELETE error:", err);
        return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
    }
}
