"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { use } from "react";
import { Mail, Lock, LogIn, Store, Zap } from "lucide-react";

function TenantLoginForm({ shop_slug }: { shop_slug: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("from") || `/menu/${shop_slug}/admin`;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const storeName = shop_slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                shopSlug: shop_slug,
                redirect: false,
            });

            if (res?.error) {
                setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
            } else if (res?.ok) {
                router.push(redirectTo);
                router.refresh();
            }
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการเข้าระบบ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] bg-[size:32px_32px] opacity-5" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[400px] relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100 shadow-lg mb-4">
                        <Store className="h-8 w-8 text-brand-orange" />
                    </div>
                    <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1 mb-3">
                        <span className="text-xs font-black uppercase tracking-widest text-brand-orange">Store Admin</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">{storeName}</h1>
                    <p className="text-sm text-gray-500 mt-1">เข้าสู่ระบบเพื่อจัดการร้านของคุณ</p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 p-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">อีเมล</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder={`admin@${shop_slug}.com`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">รหัสผ่าน</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 whitespace-pre-line"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-brand-orange py-3.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(255,107,0,0.25)] hover:shadow-[0_12px_30px_rgba(255,107,0,0.35)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-60 mt-2"
                        >
                            {loading ? "กำลังเข้าระบบ..." : <><span>เข้าสู่ระบบ</span> <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" /></>}
                        </button>
                    </form>

                    {shop_slug === "demo-shop" && (
                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <p className="text-[10px] font-black uppercase text-gray-400 text-center mb-3 tracking-widest">Demo Access</p>
                            <button
                                onClick={() => {
                                    setEmail("demo@tamjai.pro");
                                    setPassword("demo1234");
                                }}
                                className="w-full rounded-2xl bg-gray-900 border border-gray-800 py-3 text-xs font-black text-white hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Zap className="h-3.5 w-3.5 text-brand-orange fill-current" />
                                ใช้บัญชีทดลอง (Auto Fill)
                            </button>
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                        <Link href={`/menu/${shop_slug}`} className="text-xs font-bold text-gray-400 hover:text-brand-orange transition-colors">
                            ← กลับหน้าเมนู
                        </Link>
                        <Link href="/" className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                            tamjai.pro
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function TenantAdminLoginPage({
    params,
}: {
    params: Promise<{ shop_slug: string }>;
}) {
    const { shop_slug } = use(params);
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">กำลังโหลด...</div>}>
            <TenantLoginForm shop_slug={shop_slug} />
        </Suspense>
    );
}
