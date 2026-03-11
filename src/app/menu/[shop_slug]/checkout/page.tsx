"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { ChevronLeft, Bike, Store, QrCode, Banknote, MapPin, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";

// (Mock data removed, now using CartContext)

type PayMethod = "promptpay" | "cash";
type OrderMode = "delivery" | "pickup";

export default function CheckoutPage({ params }: { params: Promise<{ shop_slug: string }> }) {
    const { shop_slug } = use(params);
    const storeName = shop_slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const { cart, cartTotal, clearCart } = useCart();

    const [orderMode, setOrderMode] = useState<OrderMode>("delivery");
    const [payMethod, setPayMethod] = useState<PayMethod>("promptpay");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [isCheckingPromo, setIsCheckingPromo] = useState(false);
    const [promoError, setPromoError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const { addToCart } = useCart();

    const subtotal = cartTotal;
    const deliveryFee = orderMode === "delivery" ? 30 : 0;
    const total = Math.max(0, subtotal + deliveryFee - promoDiscount);
    const isFormValid = !!(name.trim() && phone.trim() && (orderMode === "pickup" || address.trim()));

    // AI Upsell Logic
    React.useEffect(() => {
        if (cart.length > 0) {
            const fetchUpsell = async () => {
                setIsAiLoading(true);
                try {
                    const res = await fetch(`/api/ai/upsell`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cartItems: cart, shopSlug: shop_slug })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setAiRecommendations(data.recommendations || []);
                    }
                } catch (err) {
                    console.error("AI Upsell error:", err);
                } finally {
                    setIsAiLoading(false);
                }
            };
            fetchUpsell();
        }
    }, [cart.length]); // Re-fetch only if number of items changes to avoid loops

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setIsCheckingPromo(true);
        setPromoError("");
        try {
            // Simplified validation: send to a mock or real api
            // Since we don't have a dedicated public validation API yet, 
            // we'll just implement a simple check here or assume it's valid if we want to show it.
            // Better: Add an API for this.
            const res = await fetch(`/api/admin/promotions?code=${promoCode}`);
            if (res.ok) {
                const promo = await res.json();
                if (promo && promo.status === 'ACTIVE') {
                    if (subtotal < Number(promo.minPurchase)) {
                        setPromoError(`ขั้นต่ำ ฿${promo.minPurchase}`);
                        setPromoDiscount(0);
                    } else {
                        const disc = promo.type === 'PERCENTAGE'
                            ? (subtotal * Number(promo.value)) / 100
                            : Number(promo.value);
                        setPromoDiscount(disc);
                        setPromoError("");
                    }
                } else {
                    setPromoError("โค้ดไม่ถูกต้องหรือหมดอายุ");
                    setPromoDiscount(0);
                }
            } else {
                setPromoError("ไม่พบโค้ดส่วนลดนี้");
                setPromoDiscount(0);
            }
        } catch (err) {
            setPromoError("เกิดข้อผิดพลาด");
        } finally {
            setIsCheckingPromo(false);
        }
    };

    const handleOrder = async () => {
        if (!isFormValid) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shop_slug,
                    items: cart,
                    customer: { name, phone, address },
                    // @ts-ignore
                    orderType: orderMode,
                    total: subtotal + deliveryFee, // Send raw total, server will re-apply promo
                    promoCode: promoDiscount > 0 ? promoCode : undefined
                }),
            });
            const data = await res.json();
            clearCart();
            window.location.href = "/menu/" + shop_slug + "/order/" + data.orderId;
        } catch {
            window.location.href = "/menu/" + shop_slug + "/order/TJP-DEMO";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 lg:flex lg:justify-center">
            <div className="w-full max-w-md bg-white min-h-screen flex flex-col">

                <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                    <Link href={"/menu/" + shop_slug} className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-none">ยืนยันการสั่งซื้อ</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{storeName}</p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pb-32 space-y-4 p-4">

                    {/* Customer info */}
                    <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ข้อมูลผู้รับ</p>
                        <input type="text" placeholder="ชื่อ-นามสกุล *" value={name} onChange={e => setName(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                        <input type="tel" placeholder="เบอร์โทรศัพท์ *" value={phone} onChange={e => setPhone(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 transition-all font-medium" />

                        {orderMode === "delivery" && (
                            <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                                <MapPin className="h-4 w-4 text-orange-500 mt-1 shrink-0" />
                                <textarea
                                    placeholder="ที่อยู่จัดส่ง (บ้านเลขที่, ซอย, ถนน, เขต) *"
                                    value={address} onChange={e => setAddress(e.target.value)} rows={3}
                                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none resize-none font-medium"
                                />
                            </div>
                        )}
                    </section>

                    {/* Order Mode - Re-enabled Pickup */}
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                        <button
                            type="button"
                            onClick={() => setOrderMode("delivery")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${orderMode === "delivery" ? "bg-white text-orange-600 shadow-lg shadow-orange-100/50" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            <Bike className="h-4 w-4" />
                            จัดส่งถึงที่
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrderMode("pickup")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${orderMode === "pickup" ? "bg-white text-orange-600 shadow-lg shadow-orange-100/50" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            <Store className="h-4 w-4" />
                            รับเองที่ร้าน
                        </button>
                    </div>

                    {/* Promotion Code */}
                    <section className="bg-white border border-gray-100 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">โค้ดส่วนลด</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="ใส่รหัสเพื่อรับส่วนลด"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
                            />
                            <button
                                onClick={handleApplyPromo}
                                disabled={isCheckingPromo || !promoCode}
                                className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 disabled:bg-gray-200 transition-all"
                            >
                                {isCheckingPromo ? "..." : "ตกลง"}
                            </button>
                        </div>
                        {promoError && <p className="text-[10px] text-red-500 mt-1.5 font-bold ml-1">{promoError}</p>}
                        {promoDiscount > 0 && <p className="text-[10px] text-emerald-600 mt-1.5 font-bold ml-1">ประหยัดไป ฿{promoDiscount.toLocaleString()}</p>}
                    </section>

                    {/* Order summary */}
                    <section className="bg-white border border-gray-100 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">สรุปรายการ</p>
                        <div className="space-y-3 mb-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-start justify-between gap-3">
                                    <div className="flex gap-2">
                                        <span className="font-bold text-orange-500 text-sm shrink-0">{item.qty}x</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                            <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-1">
                                                {Object.entries(item.options).map(([group, labels]) => {
                                                    if (group === "note") return null;
                                                    const selected = Array.isArray(labels) ? labels : [labels];
                                                    if (selected.length === 0) return null;
                                                    return (
                                                        <span key={group} className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                            <span className="text-gray-500">{group}:</span> {selected.join(", ")}
                                                        </span>
                                                    );
                                                })}
                                                {item.options.note && (
                                                    <span className="text-orange-400 italic font-medium w-full mt-0.5">
                                                        "{item.options.note}"
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-sm text-gray-800 shrink-0">{"฿" + (item.price * item.qty)}</span>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">ไม่มีรายการในตะกร้า</p>
                            )}
                        </div>
                        <div className="border-t border-gray-100 pt-3 space-y-1.5">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>ค่าอาหาร</span><span>{"฿" + subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>ค่าจัดส่ง</span><span>{"฿" + deliveryFee}</span>
                            </div>
                            {promoDiscount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 font-bold">
                                    <span>ส่วนลด ({promoCode})</span><span>{"- ฿" + promoDiscount}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-base text-gray-900 pt-1">
                                <span>รวมทั้งหมด</span>
                                <span className="text-orange-500">{"฿" + total}</span>
                            </div>
                        </div>
                    </section>

                    {/* AI Upsell Section */}
                    {aiRecommendations.length > 0 && (
                        <section className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                                    ทานคู่กับอะไรดี? ✨
                                </p>
                            </div>
                            <div className="space-y-3">
                                {aiRecommendations.map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-orange-200/50">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {item.imageUrl && <img src={item.imageUrl} className="h-10 w-10 rounded-lg object-cover" />}
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">{item.name}</p>
                                                <p className="text-xs text-orange-600 font-black">฿{item.price}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addToCart({
                                                id: item.id + "-upsell",
                                                productId: item.id,
                                                name: item.name,
                                                price: Number(item.price),
                                                qty: 1,
                                                options: { note: "AI Upsell" },
                                                imageUrl: item.imageUrl
                                            })}
                                            className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter shadow-sm active:scale-95 transition-all"
                                        >
                                            เพิ่ม
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Payment method */}
                    <section className="bg-white border border-gray-100 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ช่องทางชำระเงิน</p>
                        <div className="space-y-2">
                            {([
                                { id: "promptpay" as PayMethod, label: "โอนเงิน / พร้อมเพย์", sublabel: "ได้เลขบัญชีร้านหลังยืนยันออเดอร์", icon: <CreditCard className="h-5 w-5 text-blue-600" />, bg: "bg-blue-50" },
                                { id: "cash" as PayMethod, label: "เงินสด (ปลายทาง)", sublabel: "จ่ายให้ไรเดอร์ / เมื่อรับที่ร้าน", icon: <Banknote className="h-5 w-5 text-emerald-600" />, bg: "bg-emerald-50" },
                            ]).map(p => (
                                <label key={p.id} onClick={() => setPayMethod(p.id)}
                                    className={"flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all " + (payMethod === p.id ? "border-orange-500 bg-orange-50/30" : "border-gray-100 hover:bg-gray-50")}
                                >
                                    <div className={"h-9 w-9 " + p.bg + " rounded-lg flex items-center justify-center shrink-0"}>{p.icon}</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm">{p.label}</p>
                                        <p className="text-xs text-gray-500">{p.sublabel}</p>
                                    </div>
                                    <div className={"h-5 w-5 rounded-full border-2 transition-all shrink-0 " + (payMethod === p.id ? "border-orange-500 border-[6px]" : "border-gray-300")} />
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Bottom CTA */}
                <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto p-4 bg-white border-t border-gray-100">
                    <button onClick={handleOrder} disabled={!isFormValid || isSubmitting}
                        className={"w-full py-4 rounded-2xl font-bold text-base transition-all " + (isFormValid && !isSubmitting ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 active:scale-[0.98]" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
                    >
                        {isSubmitting ? "กำลังส่งออเดอร์..." : "ยืนยันสั่งซื้อ   ฿" + total.toLocaleString()}
                    </button>
                    {!isFormValid && <p className="text-center text-xs text-gray-400 mt-2">กรุณากรอกข้อมูลให้ครบก่อน</p>}
                </div>
            </div>
        </div>
    );
}
