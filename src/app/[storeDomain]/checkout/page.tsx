"use client";

import React, { useState } from "react";
import { ChevronLeft, MapPin, Clock, CreditCard, QrCode, ArrowRight, Store, Bike } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage({ params }: { params: Promise<{ storeDomain: string }> }) {
    const unwrappedParams = use(params);
    const storeDomain = unwrappedParams.storeDomain;
    const storeName = storeDomain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const router = useRouter();

    const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
    const [paymentMethod, setPaymentMethod] = useState<"promptpay" | "cash">("promptpay");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Mock Cart Data
    const cartItems = [
        { id: 1, name: "ตำป่าแซ่บสะดุ้ง", variants: "เผ็ดปานกลาง", price: 120, quantity: 1 },
        { id: 2, name: "ไก่ย่างวิเชียรบุรี", variants: "ครึ่งตัว", price: 140, quantity: 1 },
    ];

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderType === "delivery" ? 30 : 0;
    const total = subtotal + deliveryFee;

    const handleConfirmOrder = async () => {
        setIsSubmitting(true);
        setError("");

        try {
            const orderPayload = {
                shop_slug: storeDomain,
                items: cartItems.map(item => ({
                    name: item.name,
                    qty: item.quantity,
                    price: item.price,
                    options: { variants: item.variants }
                })),
                customer: {
                    name: "ลูกค้าทดสอบ", // In real app, get from form or session
                    phone: "081-234-5678",
                    address: orderType === "delivery" ? "123/45 ซอยสุขุมวิท 101, กรุงเทพฯ" : undefined
                },
                payMethod: paymentMethod,
                orderType: orderType,
                total: total
            };

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create order");
            }

            // Redirect to tracking page
            router.push(`/${storeDomain}/order/${data.orderId}`);
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Header */}
            <header className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 py-3 flex items-center gap-4 shadow-sm">
                <Link href={`/${storeDomain}`} className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="font-black text-lg text-gray-900 leading-none">ยืนยันคำสั่งซื้อ</h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">{storeName}</p>
                </div>
            </header>

            <main className="p-4 space-y-6">

                {/* Order Type Toggle */}
                <section>
                    <div className="bg-gray-100 p-1.5 rounded-2xl flex relative h-14">
                        <motion.div
                            className="absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-xl shadow-sm"
                            animate={{ left: orderType === "delivery" ? "0.375rem" : "calc(50% + 0.375rem)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setOrderType("delivery")}
                            className={`flex-[1] flex items-center justify-center gap-2 font-bold z-10 transition-colors ${orderType === "delivery" ? "text-brand-orange" : "text-gray-500"
                                }`}
                        >
                            <Bike className="h-5 w-5" />
                            จัดส่ง (Delivery)
                        </button>
                        <button
                            onClick={() => setOrderType("pickup")}
                            className={`flex-[1] flex items-center justify-center gap-2 font-bold z-10 transition-colors ${orderType === "pickup" ? "text-brand-orange" : "text-gray-500"
                                }`}
                        >
                            <Store className="h-5 w-5" />
                            รับเอง (Pickup)
                        </button>
                    </div>
                </section>

                {/* Delivery / Pickup Details */}
                <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    {orderType === "delivery" ? (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-brand-orange" />
                                    จัดส่งที่
                                </h2>
                                <button className="text-brand-orange text-sm font-bold bg-orange-50 px-3 py-1 rounded-lg">เปลี่ยน</button>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="font-bold text-gray-900 mb-1">บ้าน (สมชาย 081-234-5678)</p>
                                <p className="text-sm text-gray-500 leading-relaxed">123/45 ซอยสุขุมวิท 101, แขวงบางจาก, เขตพระโขนง, กรุงเทพฯ 10260 (จุดสังเกต: หน้าปากซอยมีร้านสะดวกซื้อ)</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Store className="h-5 w-5 text-brand-orange" />
                                    รับที่ร้าน
                                </h2>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="font-bold text-gray-900 mb-1">{storeName}</p>
                                <p className="text-sm text-gray-500 leading-relaxed">ซอยเอกมัย 12, วัฒนา, กรุงเทพฯ</p>
                                <p className="text-sm text-brand-orange font-bold mt-2 flex items-center gap-1">
                                    <Clock className="h-4 w-4" /> ระยะเวลาเตรียมอาหาร: ~15 นาที
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Order Summary */}
                <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-4 px-1">สรุปคำสั่งซื้อ</h2>
                    <div className="space-y-4 mb-4 pb-4 border-b border-gray-100 px-1">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-start gap-4">
                                <div className="font-bold text-brand-orange bg-orange-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                                    {item.quantity}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                                    {item.variants && <p className="text-xs text-gray-500 mt-1">{item.variants}</p>}
                                </div>
                                <div className="font-black text-gray-900 shrink-0">฿{item.price * item.quantity}</div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 px-1">
                        <div className="flex justify-between text-sm text-gray-600 font-medium">
                            <span>ยอดรวมค่าอาหาร</span>
                            <span>฿{subtotal}</span>
                        </div>
                        {orderType === "delivery" && (
                            <div className="flex justify-between text-sm text-gray-600 font-medium">
                                <span>ค่าจัดส่ง</span>
                                <span>฿{deliveryFee}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-black text-gray-900 pt-2">
                            <span>ยอดชำระสุทธิ</span>
                            <span className="text-brand-orange">฿{total}</span>
                        </div>
                    </div>
                </section>

                {/* Payment Method */}
                <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-4 px-1">ช่องทางการชำระเงิน</h2>
                    <div className="space-y-3">
                        <label className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'promptpay' ? 'border-brand-orange bg-orange-50/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 mr-4">
                                <QrCode className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">สแกนจ่าย (PromptPay)</h3>
                                <p className="text-xs text-gray-500 mt-0.5">รับ QR Code เพื่อสแกนจ่ายทันที</p>
                            </div>
                            <div className="relative flex items-center justify-center ml-2">
                                <input type="radio" name="payment" className="peer sr-only" checked={paymentMethod === 'promptpay'} onChange={() => setPaymentMethod('promptpay')} />
                                <div className="h-6 w-6 rounded-full border-2 border-gray-300 peer-checked:border-brand-orange peer-checked:border-[7px] transition-all"></div>
                            </div>
                        </label>

                        <label className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-brand-orange bg-orange-50/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 mr-4">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">เงินสด (ปลายทาง)</h3>
                                <p className="text-xs text-gray-500 mt-0.5">ชำระเงินสดให้พนักงานจัดส่ง</p>
                            </div>
                            <div className="relative flex items-center justify-center ml-2">
                                <input type="radio" name="payment" className="peer sr-only" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                                <div className="h-6 w-6 rounded-full border-2 border-gray-300 peer-checked:border-brand-orange peer-checked:border-[7px] transition-all"></div>
                            </div>
                        </label>
                    </div>
                </section>

            </main>

            {/* Bottom Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleConfirmOrder}
                        disabled={isSubmitting}
                        className="w-full bg-brand-orange text-white h-14 rounded-2xl font-black shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isSubmitting ? "กำลังดำเนินการ..." : (
                            <>
                                <span>ยืนยันการสั่งซื้อ</span>
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                    {error && <p className="text-red-500 text-xs text-center mt-2 font-bold">{error}</p>}
                </div>
            </div>
        </div>
    );
}
