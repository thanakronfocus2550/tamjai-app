import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { name, category } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Product name is required" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `
คุณคือผู้เชี่ยวชาญด้านการตลาดอาหารและการเขียนคำโฆษณา (Copywriter) สำหรับร้านอาหารในไทย
ภารกิจ: เขียนคำอธิบายเมนูอาหารให้น่ารับประทาน (Appetizing), ดูพรีเมียม, และดึงดูดลูกค้า

ข้อมูลเมนู:
ชื่อเมนู: "${name}"
หมวดหมู่: "${category || "ทั่วไป"}"

ข้อกำหนดในการเขียน:
1. ความยาวประมาณ 1-2 ประโยค (ไม่เกิน 150 ตัวอักษร)
2. ใช้ภาษาชวนหิว บรรยายถึงรสชาติ รสสัมผัส หรือวัตถุประสงค์ของเมนู
3. ไม่ต้องมีคำนำหน้า (เช่น "คำอธิบายคือ:") ให้ส่งเฉพาะข้อความคำอธิบายมาเลย
4. หากเป็นเครื่องดื่ม ให้เน้นความสดชื่น หากเป็นของคาวให้เน้นความกลมกล่อมหรือวัตถุดิบหลัก

ตัวอย่าง:
ชื่อ: ข้าวกะเพราเนื้อสับไข่ดาว
คำอธิบาย: เนื้อสับผัดใบกะเพราป่าหอมฟุ้ง รสชาติเข้มข้นจัดจ้านถึงใจ เสิร์ฟคู่กับไข่ดาวขอบกรอบไข่แดงเยิ้มๆ ทานกับข้าวสวยร้อนๆ คือที่สุด!
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        return NextResponse.json({ description: text });
    } catch (error) {
        console.error("AI Generate Menu Error:", error);
        return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
    }
}
