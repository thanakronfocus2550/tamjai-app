import { NextResponse } from "next/server";
import { sendLineFlexMessage } from "@/lib/line-utils";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // Sample order data for testing
        const sampleOrder = {
            orderId: "TEST-LINE-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
            shop_slug: "tamjai-test-shop",
            items: [
                { name: "ข้าวกะเพราไก่ไข่ดาว", qty: 1, price: 65 },
                { name: "น้ำอัญชันมะนาว", qty: 2, price: 25 }
            ],
            totalAmount: 115
        };

        await sendLineFlexMessage(userId, sampleOrder);

        return NextResponse.json({
            success: true,
            message: "ส่งข้อความทดสอบสำเร็จ! โปรดเช็ค LINE ของคุณ",
            userId
        });
    } catch (error: any) {
        console.error("Test LINE Error:", error);
        return NextResponse.json({
            error: "ส่งข้อความไม่สำเร็จ",
            message: error.message
        }, { status: 500 });
    }
}
