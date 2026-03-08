"use client";

import React, { use } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Settings, ExternalLink, ChevronLeft, LogOut } from "lucide-react";


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

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "tenant", shop_slug }),
        });
        router.push(`/menu/${shop_slug}/admin/login`);
    };

    const nav = [
        { href: `/menu/${shop_slug}/admin`, label: "ออเดอร์ Live", icon: LayoutDashboard, exact: true },
        { href: `/menu/${shop_slug}/admin/menu`, label: "จัดการเมนู", icon: UtensilsCrossed },
        { href: `/menu/${shop_slug}/admin/settings`, label: "ตั้งค่าร้าน", icon: Settings },
    ];

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

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
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                                Pro Plan
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                            หมดอายุ: <span className="font-bold text-orange-500">30 พ.ย. 2024</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
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
