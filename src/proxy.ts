import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // This function runs AFTER authorized callback returns true
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // ─── Superadmin Guard ───
                if (pathname.startsWith("/admin")) {
                    // Allow login page
                    if (pathname === "/admin/login") return true;
                    // Require SUPER_ADMIN for everything else in /admin
                    return token?.role === "SUPER_ADMIN";
                }

                // ─── Tenant Admin Guard ───
                const tenantAdminMatch = pathname.match(/^\/menu\/([^/]+)\/admin/);
                if (tenantAdminMatch) {
                    const shopSlug = tenantAdminMatch[1];
                    // Allow login page
                    if (pathname === `/menu/${shopSlug}/admin/login`) return true;
                    // Require matching shopSlug OR SUPER_ADMIN
                    if (!token) return false;
                    return token.role === "SUPER_ADMIN" || token.shopSlug === shopSlug;
                }

                // Default allow for other routes (public storefront)
                return true;
            },
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/menu/:shop/admin/:path*"],
};
