import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper to convert local file to GoogleGenerativeAI.Part
function fileToGenerativePart(path: string, mimeType: string) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        const { slipUrl } = await req.json();

        if (!slipUrl) {
            return NextResponse.json({ error: "Slip URL is required" }, { status: 400 });
        }

        // Convert public URL to local file path
        // Assuming slipUrl is like /uploads/slips/slip-123.jpg
        const localPath = path.join(process.cwd(), 'public', slipUrl);

        if (!fs.existsSync(localPath)) {
            return NextResponse.json({ error: "Slip file not found" }, { status: 404 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `
Analyze this Thai bank transfer slip. Extract the following information in JSON format:
- amount: (number) The transfer amount
- date: (string) The date of transfer (DD/MM/YYYY)
- time: (string) The time of transfer (HH:mm)
- bank: (string) The sending bank name
- receiver: (string) The receiver name (if visible)
- isSlip: (boolean) Is this actually a bank transfer slip?
- confidence: (number 0-1) Your confidence score

Output ONLY the JSON object.
`;

        const mimeType = slipUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        const imagePart = fileToGenerativePart(localPath, mimeType);

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text().trim();

        // Clean markdown code blocks if any
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const analysis = JSON.parse(jsonStr);

        return NextResponse.json({ analysis });
    } catch (error: any) {
        console.error("Slip Verification Error:", error);
        return NextResponse.json({
            error: "Failed to verify slip",
            message: error.message
        }, { status: 500 });
    }
}
