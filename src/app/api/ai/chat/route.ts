import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("AI Configuration Error: GEMINI_API_KEY is missing");
            return NextResponse.json({
                error: "Configuration Error",
                message: "GEMINI_API_KEY is not configured on the server."
            }, { status: 500 });
        }

        // Initialize Gemini model inside handler for robustness
        const genAI = new GoogleGenerativeAI(apiKey);
        const { message, shopSlug } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Build System Prompt
        const systemPrompt = `
คุณคือ "น้องตามใจ" มาสคอตผู้ช่วยอัจฉริยะของแพลตฟอร์ม Tamjai Pro (ระบบจัดการร้านอาหารสแกนสั่งอาหารผ่าน QR Code)
บุคลิก: น่ารัก, สุภาพ, กระตือรือร้น, ใช้คำลงท้ายว่า "นะคะ/ค่ะ" เสมอ, ชอบช่วยเหลือ

ข้อมูลแพลตฟอร์ม Tamjai Pro:
1. เป็นระบบ SaaS สำหรับร้านอาหาร ให้ลูกค้าสแกน QR Code สั่งอาหารได้เองที่โต๊ะ
2. มีระบบหลังบ้าน (Admin Dashboard) ให้เจ้าของร้านจัดการเมนู, ดูยอดขายแบบ Real-time, และจัดการพนักงาน
3. ราคาแพ็คเกจ Pro เพียง 450 บาทต่อเดือน (มีช่วงทดลองใช้ฟรี 7 วัน)
4. จุดเด่น: สะดวก, ลดความผิดพลาดในการรับออเดอร์, ประหยัดค่าจ้างพนักงานรับออเดอร์

หน้าที่ของคุณ:
- ตอบคำถามเกี่ยวกับฟีเจอร์ของ Tamjai Pro
- ช่วยแก้ปัญหาเบื้องต้นให้ผู้ใช้งาน
- หากผู้ใช้ถามเรื่องที่ซับซ้อนเกินไป หรือต้องการแจ้งบั๊ก/ปัญหาบิล แนะนำให้เขาสลับไปที่แท็บ "แจ้งปัญหา (Ticket)" เพื่อให้ทีมงานมนุษย์ตรวจสอบ
- หากคุยในบริบทของร้านค้า (shopSlug: ${shopSlug || 'general'}), ให้เน้นการซัพพอร์ตเจ้าของร้านนั้นๆ

คำถามจากผู้ใช้: "${message}"
`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error: any) {
        console.error("Gemini API Error (Details):", {
            message: error.message,
            stack: error.stack,
            status: error.status
        });
        return NextResponse.json({
            error: "Failed to generate AI response",
            message: error.message || "Unknown error occurred",
            status: error.status || 500
        }, { status: 500 });
    }
}
