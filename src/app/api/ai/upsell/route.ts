import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { cartItems, shopSlug } = await req.json();

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ recommendations: [] });
        }

        // 1. Get all products from this shop to provide context to AI
        const tenant = await prisma.tenant.findUnique({
            where: { slug: shopSlug },
            include: { products: { where: { isAvailable: true } } }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        const menuContext = tenant.products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            // @ts-ignore
            stock: p.trackStock ? p.stockQuantity : "unlimited"
        }));

        const cartContext = cartItems.map((i: any) => i.name).join(", ");

        const prompt = `
            You are an expert restaurant sales assistant for "${tenant.name}".
            The customer has these items in their cart: [${cartContext}].
            
            Based on the following menu, suggest 2-3 COMPLEMENTARY items that would go well with their current selection to increase the total bill.
            
            Menu:
            ${JSON.stringify(menuContext)}

            Rules:
            1. Suggest only items present in the menu.
            2. Don't suggest items already in the cart.
            3. Focus on items that "pair" well (e.g., if they have spicy food, suggest a cold drink or sticky rice).
            4. If stock is 0, DO NOT suggest it.
            5. Return ONLY a valid JSON array of product IDs. NO EXPLANATION.
            
            Format: ["id1", "id2"]
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON array from text (Gemini sometimes adds markdown backticks)
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const recommendedIds = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        // Fetch the full product details for the recommended IDs
        const recommendations = tenant.products.filter(p => recommendedIds.includes(p.id));

        return NextResponse.json({ recommendations });
    } catch (error) {
        console.error("AI Upsell Error:", error);
        return NextResponse.json({ recommendations: [] }); // Fallback to empty
    }
}
