"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Store,
  WalletCards,
  Users,
  Settings,
  Bell,
  Search,
  ChevronDown,
  CreditCard,
  MessageSquare,
  CheckSquare,
  Ticket,
  HelpCircle,
  LogOut
} from "lucide-react";
import FloatingMascot from "@/components/FloatingMascot";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const userName = session?.user?.name ?? "Super Admin";
  const userEmail = session?.user?.email ?? "admin@tamjai.pro";
  const userRole = session?.user?.role ?? "GUEST";
  const userPlan = ((session?.user?.plan as string) ?? "FREE").toUpperCase();

  React.useEffect(() => {
    if (status === "loading") return;

    if (pathname === "/admin/login") {
      // If already logged in as super admin, redirect to admin dashboard
      if (status === "authenticated" && session?.user?.role === "SUPER_ADMIN") {
        router.replace("/admin");
      }
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/admin/login");
    } else if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
      router.replace("/");
    }
  }, [status, session, router, pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "superadmin" }),
    });
    router.push("/admin/login");
  };

  const isCurrent = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname.startsWith(path)) return true;
    return false;
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-brand-orange font-bold">กำลังโหลดข้อมูล...</div>;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "SUPER_ADMIN") {
    return null; // Don't render layout content if not authorized
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-brand-orange/20 selection:text-brand-orange">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 flex w-[280px] flex-col border-r border-gray-200/60 bg-white shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-20">
        <Link href="/admin" className="flex h-[72px] items-center border-b border-gray-100 px-6 cursor-pointer">
          <div className="flex items-center gap-3 w-full rounded-xl transition-all hover:bg-gray-50 p-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50 shadow-sm">
              <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
            </div>
            <div className="max-w-[150px]">
              <span className="text-lg font-black tracking-tight block leading-none">Tamjai<span className="text-brand-orange">Pro</span></span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block leading-none mt-1">Super Admin</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
          </div>
        </Link>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8">
          <div>
            <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Main Menu</p>
            <nav className="space-y-1">
              {[
                { n: "ภาพรวมระบบ", i: LayoutDashboard, path: "/admin" },
                { n: "จัดการร้านค้า", i: Store, path: "/admin/tenants" },
                { n: "แพ็กเกจและการต่ออายุ", i: CreditCard, path: "/admin/subscriptions" },
                { n: "ตรวจสอบสลิป", i: CheckSquare, path: "/admin/approvals" },
                { n: "ส่วนลด & คูปอง", i: Ticket, path: "/admin/promotions" },
                { n: "รายได้และบิลลิ่ง", i: WalletCards, path: "/admin/billing" },
              ].map((item) => {
                const active = isCurrent(item.path);
                return (
                  <Link
                    href={item.path}
                    key={item.n}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all overflow-hidden ${active
                      ? "bg-orange-50/50 text-brand-orange shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 bg-brand-orange rounded-r-full shadow-[0_0_10px_rgba(255,107,0,0.6)]"></span>
                    )}
                    <item.i className={`h-5 w-5 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} />
                    <span className="relative z-10">{item.n}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">System</p>
            <nav className="space-y-1">
              {[
                { n: "ข้อร้องเรียน & ช่วยเหลือ", i: MessageSquare, path: "/admin/helpdesk" },
                { n: "คำถามที่พบบ่อย (FAQ)", i: HelpCircle, path: "/admin/faq" },
                { n: "ผู้ใช้งานส่วนกลาง", i: Users, path: "/admin/users" },
                { n: "ตั้งค่าแพลตฟอร์ม", i: Settings, path: "/admin/settings" },
              ].map((item) => {
                const active = isCurrent(item.path);
                return (
                  <Link
                    href={item.path}
                    key={item.n}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all overflow-hidden ${active
                      ? "bg-orange-50/50 text-brand-orange shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 bg-brand-orange rounded-r-full shadow-[0_0_10px_rgba(255,107,0,0.6)]"></span>
                    )}
                    <item.i className={`h-5 w-5 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} />
                    <span className="relative z-10">{item.n}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 border border-gray-200/50 hover:border-brand-orange/30 hover:shadow-sm transition-all cursor-pointer group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50 shadow-sm">
              <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-gray-900 truncate">{userName}</p>
              <p className="text-[10px] font-bold text-gray-400 truncate mt-0.5">{userEmail}</p>
            </div>
            <Settings className="h-4 w-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="h-4 w-4" /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-[280px]">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-gray-200/60 bg-white/70 px-8 backdrop-blur-xl transition-all">
          <div className="flex items-center gap-4 flex-1">
            <Link href="/admin" className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50 shadow-sm border border-orange-100">
              <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
            </Link>
            <div className="relative group w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-brand-orange transition-colors" />
              <input
                type="text"
                placeholder="ค้นหาร้านค้า, ผู้ใช้, หรือบิลลิ่ง..."
                className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-brand-orange ring-2 ring-white animate-pulse"></span>
            </button>
            <Link href="/admin/tenants" className="h-10 px-4 flex items-center justify-center rounded-full bg-gray-900 text-white text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto">
              เพิ่มร้านค้าใหม่
            </Link>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* AI Mascot Support Button */}
      <FloatingMascot shopSlug="superadmin" />
    </div>
  );
}
