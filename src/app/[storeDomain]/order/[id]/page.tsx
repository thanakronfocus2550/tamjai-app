"use client";

import React, { useState, useEffect, use } from "react";
import {
    CheckCircle2,
    Circle,
    Clock,
    ChevronLeft,
    Bike,
    Store,
    Phone,
    MapPin,
    Timer,
    MessageSquare,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_STEPS = [
    { id: "new", label: "รับออเดอร์แล้ว", desc: "ทางร้านได้รับออเดอร์ของคุณแล้ว", icon: Clock },
    { id: "preparing", label: "กำลังจัดเตรียม", desc: "เชฟกำลังปรุงอาหารให้คุณอย่างตั้งใจ", icon: Timer },
    { id: "ready", label: "เตรียมเสร็จแล้ว", desc: "อาหารของคุณพร้อมจัดส่ง/รับแล้ว", icon: CheckCircle2 },
    { id: "completed", label: "สำเร็จ", desc: "ขอบคุณที่ใช้บริการค่ะ", icon: CheckCircle2 },
];

export default function OrderTrackingPage({ params }: { params: Promise<{ storeDomain: string, id: string }> }) {
    const { storeDomain, id: orderId } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrderData = async () => {
        try {
            const [orderRes, storeRes] = await Promise.all([
                fetch(`/api/orders/${orderId}`),
                fetch(`/api/shop/${storeDomain}`)
            ]);

            if (orderRes.ok) {
                const orderData = await orderRes.json();
                setOrder(orderData);
            } else {
                setError("ไม่พบข้อมูลออเดอร์");
            }

            if (storeRes.ok) {
                const storeData = await storeRes.json();
                setStore(storeData);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderData();
        // Polling status every 15 seconds
        const interval = setInterval(fetchOrderData, 15000);
        return () => clearInterval(interval);
    }, [orderId, storeDomain]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center text-center">
            <div className="bg-red-50 p-4 rounded-2xl mb-4">
                <CheckCircle2 className="h-10 w-10 text-red-500 mx-auto" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{error || "ออเดอร์ไม่ถูกต้อง"}</h1>
            <p className="text-gray-500 text-sm mb-6">กรุณาตรวจสอบลิงก์อีกครั้ง</p>
            <Link href={`/${storeDomain}`} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold">
                กลับไปยังเมนู
            </Link>
        </div>
    );

    const currentStatus = order.status;
    const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === currentStatus || (currentStatus === "prepping" && s.id === "preparing"));
    const displayStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    const themeColor = store?.themeColor || "#FF6B00";

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 px-4 py-4">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <Link href={`/${storeDomain}`} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
                        <ChevronLeft className="h-5 w-5 text-gray-900" />
                    </Link>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ออเดอร์สถานะ</p>
                        <p className="text-sm font-black text-gray-900">#{order.orderId}</p>
                    </div>
                    <div className="w-9" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-4">

                {/* Main Status Hero */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        {order.orderType === "delivery" ? (
                            <Bike className="h-6 w-6 text-orange-200" />
                        ) : (
                            <Store className="h-6 w-6 text-blue-200" />
                        )}
                    </div>

                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-orange-100 rounded-full opacity-50"
                        />
                        {React.createElement(STATUS_STEPS[displayStepIndex].icon, { className: "h-10 w-10 text-orange-500 relative z-10" })}
                    </div>

                    <h2 className="text-xl font-black text-gray-900 mb-1">{STATUS_STEPS[displayStepIndex].label}</h2>
                    <p className="text-sm text-gray-500">{STATUS_STEPS[displayStepIndex].desc}</p>
                </div>

                {/* Progress Tracker */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Timer className="h-4 w-4 text-orange-500" />
                        ไทม์ไลน์ออเดอร์
                    </h3>
                    <div className="space-y-6">
                        {STATUS_STEPS.map((step, idx) => {
                            const isDone = idx < displayStepIndex;
                            const isCurrent = idx === displayStepIndex;
                            const isLast = idx === STATUS_STEPS.length - 1;

                            return (
                                <div key={step.id} className="relative flex gap-4">
                                    {!isLast && (
                                        <div className={`absolute top-6 left-3 w-0.5 h-6 ${isDone ? "bg-orange-500" : "bg-gray-100"}`} />
                                    )}
                                    <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${isDone || isCurrent ? "bg-orange-500 shadow-sm shadow-orange-100" : "bg-gray-100"}`}>
                                        {isDone ? (
                                            <CheckCircle2 className="h-3 w-3 text-white" />
                                        ) : isCurrent ? (
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        ) : (
                                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                                        )}
                                    </div>
                                    <div className={isCurrent ? "text-gray-900" : "text-gray-400"}>
                                        <p className={`text-sm font-bold ${isCurrent ? "text-orange-500" : ""}`}>{step.label}</p>
                                        {isCurrent && <p className="text-[10px] opacity-80 mt-0.5">ปัจจุบัน</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Summary Summary */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">สรุปรายการ</h3>
                        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            {order.paymentMethod === 'promptpay' ? 'PAYMENT: PromptPay' : 'PAYMENT: Cash'}
                        </span>
                    </div>

                    <div className="space-y-3 mb-4">
                        {(order.items as any[]).map((item, i) => (
                            <div key={i} className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-800">{item.qty}× {item.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                        {item.options?.variants && (
                                            <span className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded">{item.options.variants}</span>
                                        )}
                                        {item.options?.addons?.map((a: string) => (
                                            <span key={a} className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded">+ {a}</span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-900">฿{item.price * item.qty}</p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">ยอดรวมทั้งหมด</span>
                        <span className="text-lg font-black text-orange-500">฿{Number(order.totalAmount)}</span>
                    </div>
                </div>

                {/* Tracking & Help */}
                <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-lg">
                    <h4 className="font-bold flex items-center gap-2 mb-4">
                        <MessageSquare className="h-4 w-4 text-orange-400" />
                        ติดต่อร้านค้า
                    </h4>
                    <div className="space-y-3">
                        <a href={"tel:" + store?.phone} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-colors">
                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-white/60">โทรหาร้าน</p>
                                <p className="font-bold">{store?.phone || "0xx-xxx-xxxx"}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 ml-auto text-white/40" />
                        </a>

                        {order.orderType === "delivery" && order.customer.address && (
                            <div className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl">
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/60">จัดส่งที่</p>
                                    <p className="font-medium text-sm line-clamp-2">{order.customer.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t z-20">
                <div className="max-w-md mx-auto">
                    <Link href={`/${storeDomain}`}
                        style={{ backgroundColor: themeColor }}
                        className="w-full text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-100">
                        สั่งเพิ่มอีกลูกค้าใหม่ <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
