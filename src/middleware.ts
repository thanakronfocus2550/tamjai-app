import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req }) as any;
    const { pathname } = req.nextUrl;

    // ─── Superadmin Guard ───
    if (pathname.startsWith("/admin")) {
        // Allow login page
        if (pathname === "/admin/login") {
            if (token?.role === "SUPER_ADMIN") {
                return NextResponse.redirect(new URL("/admin", req.url));
            }
            return NextResponse.next();
        }

        // Require SUPER_ADMIN for everything else in /admin
        if (!token || token.role !== "SUPER_ADMIN") {
            const url = new URL("/admin/login", req.url);
            url.searchParams.set("callbackUrl", req.url);
            return NextResponse.redirect(url);
        }
    }

    // ─── Tenant Admin Guard ───
    const tenantAdminMatch = pathname.match(/^\/menu\/([^/]+)\/admin/);
    if (tenantAdminMatch) {
        const shopSlug = tenantAdminMatch[1];
        const loginPath = `/menu/${shopSlug}/admin/login`;

        // Allow login page
        if (pathname === loginPath) {
            if (token && (token.shopSlug === shopSlug || token.role === "SUPER_ADMIN")) {
                return NextResponse.redirect(new URL(`/menu/${shopSlug}/admin`, req.url));
            }
            return NextResponse.next();
        }

        // Require token for anything else in /admin/
        if (!token) {
            const url = new URL(loginPath, req.url);
            url.searchParams.set("from", pathname);
            return NextResponse.redirect(url);
        }

        // Access check: Must be owner, Staff, or Super Admin
        const isSuper = token.role === "SUPER_ADMIN";
        const isOwner = token.shopSlug === shopSlug;
        const isStaff = token.role === "STAFF" && isOwner;

        if (!isSuper && !isOwner && !isStaff) {
            console.warn(`Denied access to ${shopSlug} for user ${token.email}`);
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Plan check for POS terminal
        if (pathname.includes("/admin/pos")) {
            const plan = ((token?.plan as string) || "FREE").toUpperCase();
            if (!isSuper && plan !== "POS") {
                return NextResponse.redirect(new URL(`/menu/${shopSlug}/admin?error=pos_plan_required`, req.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/menu/:shop/admin/:path*"],
};
