"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ChevronLeft, Package, Clock, CheckCircle2, MapPin, Phone, ExternalLink, Loader2, ShoppingBag } from "lucide-react";

interface Order {
    id: string;
    orderId: string;
    shopSlug: string;
    status: string; // new, prepping, ready, completed, cancelled
    totalAmount: any;
    items: Array<{ name: string; qty: number; price: number; options: { [key: string]: any }; isServed?: boolean }>;
    customer: { name: string; phone: string; address?: string };
    paymentMethod: string;
    createdAt: string;
}

export default function OrderStatusPage({ params }: { params: Promise<{ shop_slug: string, id: string }> }) {
    const { shop_slug, id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const res = await fetch(`/api/orders/${id}`);
                if (!res.ok) throw new Error("Order not found");
                const data = await res.json();
                setOrder(data);
            } catch (err) {
                setError("ไม่พบข้อมูลออเดอร์ กรุณาตรวจสอบลิงก์อีกครั้ง");
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();

        // Polling for status updates every 20 seconds
        const timer = setInterval(fetchOrder, 20000);
        return () => clearInterval(timer);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
                <p className="text-gray-500">กำลังดึงข้อมูลออเดอร์...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="h-10 w-10" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">ไม่พบออเดอร์</h1>
                <p className="text-gray-500 mb-8">{error}</p>
                <Link href={`/menu/${shop_slug}`} className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200">
                    กลับไปหน้าเมนู
                </Link>
            </div>
        );
    }

    const { status } = order;
    const total = parseFloat(order.totalAmount);

    const steps = [
        { id: "new", label: "รับออเดอร์", icon: <Package className="h-5 w-5" />, color: "bg-orange-500" },
        { id: "prepping", label: "กำลังปรุง", icon: <Clock className="h-5 w-5" />, color: "bg-amber-500" },
        { id: "ready", label: "รอกระจายของ", icon: <CheckCircle2 className="h-5 w-5" />, color: "bg-emerald-500" },
        { id: "completed", label: "จัดส่งสำเร็จ", icon: <CheckCircle2 className="h-5 w-5" />, color: "bg-blue-500" },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === status);
    const displayStatus = steps.find(s => s.id === status) || steps[0];

    return (
        <div className="min-h-screen bg-gray-50 lg:flex lg:justify-center">
            <div className="w-full max-w-md bg-white min-h-screen flex flex-col">
                <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/menu/${shop_slug}`} className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="font-bold text-gray-900">ติดตามออเดอร์</h1>
                    </div>
                </header>

                <main className="flex-1 p-4 pb-20 space-y-6">
                    {/* Status Tracker */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-24 w-24 bg-orange-50 rounded-bl-full -mr-8 -mt-8 opacity-50" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`h-16 w-16 ${displayStatus.color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 mb-4 animate-bounce`}>
                                {displayStatus.icon}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                {status === "cancelled" ? "ยกเลิกออเดอร์" : displayStatus.label}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">หมายเลขรายการ: <span className="font-bold text-orange-500">#{order.orderId}</span></p>
                        </div>

                        {status !== "cancelled" && (
                            <div className="mt-8 flex justify-between relative">
                                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 -z-0" />
                                <div
                                    className="absolute top-4 left-0 h-0.5 bg-orange-500 transition-all duration-1000 -z-0"
                                    style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                                />
                                {steps.map((step, idx) => (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                        <div className={`h-8 w-8 rounded-full border-4 ${idx <= currentStepIndex ? "bg-orange-500 border-white shadow-md" : "bg-white border-gray-100 text-gray-300"} flex items-center justify-center`}>
                                            {idx < currentStepIndex ? <CheckCircle2 className="h-4 w-4 text-white" /> : <div className={`h-2 w-2 rounded-full ${idx === currentStepIndex ? "bg-white animate-ping" : "bg-current"}`} />}
                                        </div>
                                        <span className={`text-[10px] font-bold mt-2 uppercase tracking-tighter ${idx <= currentStepIndex ? "text-orange-500" : "text-gray-300"}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ข้อมูลการจัดส่ง</p>
                        <div className="flex gap-3">
                            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{order.customer.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{order.customer.address || "รับที่ร้าน"}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{order.customer.phone}</p>
                                <a href={`tel:${order.customer.phone}`} className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">โทรหาลูกค้า</a>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">รายการอาหาร</p>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start gap-3">
                                    <div className="flex gap-2 min-w-0">
                                        <span className="font-bold text-orange-500 text-sm">{item.qty}x</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                {item.isServed ? (
                                                    <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                                                        <CheckCircle2 className="h-2.5 w-2.5" /> เสิร์ฟแล้ว
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-widest border border-amber-100 flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5 animate-pulse" /> กำลังปรุง
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-1">
                                                {Object.entries(item.options || {}).map(([group, labels]) => {
                                                    if (group === "note") return null;
                                                    const selected = Array.isArray(labels) ? labels : [labels];
                                                    if (selected.length === 0) return null;
                                                    return (
                                                        <span key={group} className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 flex items-center gap-1">
                                                            <span className="text-gray-500">{group}:</span> {selected.join(", ")}
                                                        </span>
                                                    );
                                                })}
                                                {item.options?.note && (
                                                    <span className="text-orange-400 italic font-medium w-full mt-0.5">
                                                        "{item.options.note}"
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 shrink-0">฿{(item.price * item.qty).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-dashed border-gray-100 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">ชำระด้วย {order.paymentMethod === "promptpay" ? "พร้อมเพย์" : "เงินสด"}</p>
                                <p className="text-lg font-black text-gray-900 mt-0.5 line-none">ยอดรวมทั้งหมด</p>
                            </div>
                            <p className="text-2xl font-black text-orange-500 line-height-none">฿{total.toLocaleString()}</p>
                        </div>
                    </div>
                </main>

                <div className="p-4 border-t border-gray-50">
                    <Link href={`/menu/${shop_slug}`} className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-gray-200">
                        สั่งอาหารเพิ่ม <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
