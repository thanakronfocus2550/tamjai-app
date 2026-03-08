"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Star, AlertTriangle, MessageCircle, Clock } from "lucide-react";
import Link from "next/link";

// Using Framer Motion for smooth entrance
import { motion, AnimatePresence } from "framer-motion";

export default function StorefrontLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ storeDomain: string }>;
}) {
    const unwrappedParams = React.use(params);
    const storeName = unwrappedParams.storeDomain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const [themeColor, setThemeColor] = useState("#FF6B00");
    const [logoUrl, setLogoUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStoreConfig = async () => {
            try {
                const res = await fetch(`/api/shop/${unwrappedParams.storeDomain}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.themeColor) setThemeColor(data.themeColor);
                    if (data.logoUrl) setLogoUrl(data.logoUrl);
                    setIsActive(data.isActive !== false);
                }
            } catch (error) {
                console.error("Failed to load store config", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStoreConfig();
    }, [unwrappedParams.storeDomain]);

    // Mock global cart state. In a real app, this comes from a StoreContext or Redux.
    const isCartVisible = true;

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900 selection:bg-brand-orange/20 selection:text-brand-orange relative overflow-x-hidden flex justify-center">
            {/* Dynamic Theme Colors injected here as CSS variables */}
            <style suppressHydrationWarning>{`
        :root {
          --store-primary: ${themeColor};
        }
      `}</style>

            {/* Desktop Background (Hidden on Mobile) */}
            <div className="hidden lg:block fixed inset-0 z-0 bg-gray-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-40 blur-sm scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80"></div>

                {/* Desktop Store Info Sidebar */}
                <div className="absolute top-1/2 left-[15%] -translate-y-1/2 text-white max-w-md hidden xl:block">
                    <div className="h-24 w-24 rounded-3xl bg-white p-1 shadow-2xl mb-6">
                        <div className="h-full w-full rounded-2xl bg-gradient-to-br from-brand-orange to-orange-500 flex items-center justify-center text-white font-black text-4xl shadow-inner overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt={storeName} className="h-full w-full object-cover" />
                            ) : (
                                storeName.charAt(0)
                            )}
                        </div>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight leading-tight mb-4">{storeName}</h1>
                    <p className="text-lg text-white/80 font-medium mb-8 leading-relaxed">
                        ระบบสั่งอาหารออนไลน์ที่ใช้งานง่าย สะดวก รวดเร็ว สั่งได้เลยไม่ต้องโหลดแอป
                    </p>
                    <div className="flex items-center gap-6 text-sm font-bold">
                        <div className="flex flex-col gap-1">
                            <span className="text-white/60 uppercase tracking-wider text-xs">Rating</span>
                            <span className="flex items-center gap-1.5 text-amber-400 text-lg">
                                <Star className="h-5 w-5 fill-amber-400" /> 4.8
                            </span>
                        </div>
                        <div className="w-px h-10 bg-white/20"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white/60 uppercase tracking-wider text-xs">Status</span>
                            <span className="flex items-center gap-1.5 text-emerald-400 text-lg">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></div> Open Now
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area (Mobile Frame) */}
            <div className="w-full max-w-md min-h-screen bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] relative pb-28 z-10 lg:mr-0 xl:mr-[15%]">
                {!isActive ? (
                    <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-gray-50">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center"
                        >
                            <div className="h-20 w-20 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                                <AlertTriangle className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">หน้าร้านปิดปรับปรุงชั่วคราว</h2>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
                                ขออภัยในความไม่สะดวก ร้านค้า {storeName} กำลังอัปเดตระบบ หรืออยู่ระหว่างการต่ออายุแพ็กเกจ กรุณาลองใหม่อีกครั้งในภายหลัง
                            </p>
                            <div className="w-full space-y-3">
                                <Link
                                    href="/"
                                    className="block w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all"
                                >
                                    กลับหน้าหลัก Tamjai Pro
                                </Link>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="block w-full py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all"
                                >
                                    ลองโหลดใหม่อีกครั้ง
                                </button>
                            </div>
                            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <Clock className="h-3 w-3" /> Powered by Tamjai Pro
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <>
                        {children}

                        {/* Global Floating Cart */}
                        <AnimatePresence>
                            {isCartVisible && (
                                <motion.div
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 100, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
                                >
                                    <div className="max-w-md mx-auto pointer-events-auto">
                                        <button className="w-full bg-brand-orange rounded-2xl p-4 flex justify-between items-center text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all active:scale-95 group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                                                    <ShoppingBag className="h-5 w-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-90 leading-none">ตะกร้าสินค้า</p>
                                                    <p className="font-bold text-sm mt-1 leading-none">2 รายการ</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold opacity-80 uppercase leading-none mb-1 text-white/80">ยอดรวม</p>
                                                <span className="font-black text-lg leading-none tracking-tight">฿240.00</span>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}
