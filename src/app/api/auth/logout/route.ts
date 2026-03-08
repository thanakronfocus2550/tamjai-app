import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { type, shop_slug } = await request.json();

    const response = NextResponse.json({ success: true });

    if (type === "superadmin") {
        // Clear superadmin cookie
        response.cookies.set("superadmin_session", "", {
            maxAge: 0,
            path: "/",
        });
    } else if (type === "tenant" && shop_slug) {
        // Clear tenant-specific cookie
        response.cookies.set(`tenant_session_${shop_slug}`, "", {
            maxAge: 0,
            path: "/",
        });
    }

    return response;
}
