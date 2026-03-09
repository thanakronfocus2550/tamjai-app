import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        const { image } = await req.json(); // base64 image data

        if (!image) {
            return NextResponse.json({ error: "Image data is required" }, { status: 400 });
        }

        // Clean base64 string (remove data:image/jpeg;base64, etc.)
        const base64Data = image.split(',')[1] || image;
        const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `
Analyze this menu image and extract all food/drink items. 
For each item, identify:
- name: (string) The name of the dish/drink
- price: (number) The price
- description: (string) A short appetizing description (in Thai)
- category: (string) The category it belongs to (e.g., Appetizers, Main Course, Drinks)

Output ONLY a JSON array of objects with these keys. 
Example Output:
[
  { "name": "Som Tum", "price": 60, "description": "ส้มตำไทยรสชาติจัดจ้าน", "category": "อาหารอีสาน" },
  { "name": "Pepsi", "price": 20, "description": "เป๊ปซี่เย็นชื่นใจ", "category": "เครื่องดื่ม" }
]
`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text().trim();

        // Clean markdown code blocks if any
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const extractedData = JSON.parse(jsonStr);

        return NextResponse.json({ items: extractedData });
    } catch (error: any) {
        console.error("Menu Onboarding Error:", error);
        return NextResponse.json({
            error: "Failed to extract menu",
            message: error.message
        }, { status: 500 });
    }
}
