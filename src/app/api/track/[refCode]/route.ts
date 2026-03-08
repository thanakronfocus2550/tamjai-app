import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ refCode: string }> }
) {
    try {
        const { refCode } = await params;

        if (!refCode) {
            return NextResponse.json({ error: "Missing refCode" }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { refCode: refCode.toUpperCase() } as any,
            select: {
                name: true,
                slug: true,
                isActive: true,
                createdAt: true,
                plan: true,
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: "ไม่พบรหัสอ้างอิงนี้ในระบบ" }, { status: 404 });
        }

        // Map status
        let status = "pending";
        let message = "แอดมินกำลังตรวจสอบข้อมูลและสลิปการโอนเงินของคุณ กรุณารอสักครู่ (ปกติใช้เวลา 15-30 นาที)";

        if (tenant.isActive) {
            status = "approved";
            message = "ร้านค้าของคุณได้รับอนุมัติแล้ว! คุณสามารถเข้าสู่ระบบเพื่อจัดการร้านได้ทันที";
        }

        return NextResponse.json({
            type: "registration",
            status,
            storeName: tenant.name,
            submittedAt: new Date(tenant.createdAt).toLocaleString('th-TH', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }) + " น.",
            message,
            shopSlug: tenant.slug
        });

    } catch (err) {
        console.error("Track error:", err);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล" }, { status: 500 });
    }
}
