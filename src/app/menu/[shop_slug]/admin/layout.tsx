"use client";

import React, { use } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Settings, ExternalLink, ChevronLeft, LogOut, QrCode } from "lucide-react";
import { useSession } from "next-auth/react";
import FloatingMascot from "@/components/FloatingMascot";

export default function StoreAdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ shop_slug: string }>;
}) {
    const { shop_slug } = use(params);
    const storeName = shop_slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    const userPlan = ((session?.user as any)?.plan || "FREE").toUpperCase();

    React.useEffect(() => {
        if (status === "loading") return;

        const isLoginPage = pathname.endsWith('/admin/login');
        const user = session?.user as any;

        if (isLoginPage) {
            if (status === "authenticated") {
                // If logged in and matches this shop, go to admin dashboard
                if (user?.shopSlug === shop_slug || user?.role === "SUPER_ADMIN") {
                    router.replace(`/menu/${shop_slug}/admin`);
                }
            }
            return;
        }

        if (status === "unauthenticated") {
            router.replace(`/menu/${shop_slug}/admin/login`);
        } else if (status === "authenticated") {
            // Check Role and Shop Ownership
            const isOwner = user?.shopSlug === shop_slug;
            const isSuper = user?.role === "SUPER_ADMIN";
            const isStaff = user?.role === "STAFF" && isOwner;

            if (!isSuper && !isStaff && (user?.role !== "TENANT_ADMIN" || !isOwner)) {
                console.warn("Access Denied: No permission for this shop");
                router.replace("/");
                return;
            }

            // Protection for POS pages, using case-insensitive check for userPlan
            if (pathname.includes('/admin/pos') && userPlan !== 'POS' && !isSuper) {
                router.replace(`/menu/${shop_slug}/admin`);
            }
        }
    }, [status, session, router, pathname, shop_slug, userPlan]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "tenant", shop_slug }),
        });
        router.push(`/menu/${shop_slug}/admin/login`);
    };

    // Ensure nav array is always an array before mapping
    const nav = [
        { href: `/menu/${shop_slug}/admin`, label: "ออเดอร์ Live", icon: LayoutDashboard, exact: true },
        { href: `/menu/${shop_slug}/admin/menu`, label: "จัดการเมนู", icon: UtensilsCrossed },
        // Use case-insensitive check for userPlan
        ...(userPlan === 'POS' ? [
            { href: `/menu/${shop_slug}/admin/pos`, label: "🔥 ระบบ POS", icon: LayoutDashboard },
            { href: `/menu/${shop_slug}/admin/qr`, label: "จัดการโต๊ะ & QR", icon: QrCode }
        ] : []),
        { href: `/menu/${shop_slug}/admin/settings`, label: "ตั้งค่าร้าน", icon: Settings },
    ];

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    if (status === "loading") {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-orange-500">กำลังโหลด...</div>;
    }

    // Defensive check for API errors in children and for inactive shops
    const isSuspended = (session?.user as any)?.isActive === false;

    if (pathname.endsWith('/admin/login')) {
        return <>{children}</>;
    }

    if (status === "unauthenticated" || (session?.user?.role !== "TENANT_ADMIN" && session?.user?.role !== "SUPER_ADMIN")) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Nav */}
            <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <Link href={`/menu/${shop_slug}`} className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-gray-900 leading-none text-sm">{storeName}</h1>
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${userPlan === 'POS'
                                ? 'bg-purple-50 text-purple-600 border-purple-100'
                                : userPlan === 'PRO'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : 'bg-gray-50 text-gray-500 border-gray-100'
                                }`}>
                                {userPlan} Plan
                            </span>
                            {isSuspended && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 animate-pulse">
                                    Pending Approval
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                            {((session?.user as any)?.trialEndsAt) ? (
                                <>หมดอายุ (Trial): <span className="font-bold text-orange-500">
                                    {(() => {
                                        try {
                                            const d = new Date((session?.user as any).trialEndsAt);
                                            return !isNaN(d.getTime()) ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                                        } catch { return 'N/A'; }
                                    })()}
                                </span></>
                            ) : (
                                <>สถานะแผน: <span className="font-bold text-emerald-500">Active</span></>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {userPlan === 'POS' && (
                        <Link
                            href={`/menu/${shop_slug}/admin/pos`}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all hover:-translate-y-0.5"
                        >
                            🔥 ระบบ POS หน้าร้าน
                        </Link>
                    )}
                    <Link
                        href={`/menu/${shop_slug}`}
                        target="_blank"
                        className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-2 rounded-xl hover:bg-orange-100 transition-colors"
                    >
                        <ExternalLink className="h-3.5 w-3.5" /> ดูหน้าร้าน
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </div>
            </header>

            {/* Bottom Tab Nav (mobile-first) */}
            <main className="flex-1 overflow-y-auto pb-20">
                {children}
            </main>

            {/* AI Mascot Support Button */}
            <FloatingMascot shopSlug={shop_slug} />

            <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-30">
                <div className="max-w-md mx-auto flex">
                    {nav.map((item) => {
                        const active = isActive(item.href, item.exact);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={"flex-1 flex flex-col items-center py-3 gap-1 transition-colors " + (active ? "text-orange-500" : "text-gray-400 hover:text-gray-600")}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-semibold">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
