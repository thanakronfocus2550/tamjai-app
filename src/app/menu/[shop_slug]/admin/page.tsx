"use client";

import React, { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, ChevronRight, TrendingUp, ShoppingBag, ChevronDown, MapPin, Phone, Bike, Store, Bell, QrCode, Download, X, ExternalLink } from "lucide-react";
import { playOrderSound, requestNotificationPermission, showBrowserNotification } from "@/hooks/useOrderSound";


type OrderStatus = "new" | "prepping" | "ready" | "completed" | "cancelled";

interface OrderItem {
    name: string;
    qty: number;
    price: number;
    spicy: string;
    addons: string[];
    note: string;
}

interface Order {
    id: string;
    customer: string;
    phone: string;
    address?: string;
    items: OrderItem[];
    total: number;
    type: "delivery" | "pickup";
    time: string;
    status: OrderStatus;
    payMethod: string;
}

const MOCK_ORDERS: Order[] = [
    {
        id: "TJP-0023", customer: "สมชาย ใจดี", phone: "081-234-5678",
        address: "99/1 ซ.เอกมัย 12 แขวงคลองตันเหนือ วัฒนา กรุงเทพฯ 10110",
        items: [
            { name: "ตำป่าแซ่บสะดุ้ง", qty: 1, price: 90, spicy: "แซ่บมาก", addons: ["ไข่ดาว"], note: "ไม่ใส่ผักชี" },
            { name: "ไก่ย่างวิเชียรบุรี", qty: 1, price: 120, spicy: "กลาง", addons: [], note: "" },
        ],
        total: 240, type: "delivery", time: "02:45", status: "new", payMethod: "PromptPay"
    },
    {
        id: "TJP-0022", customer: "มาลี สุขสันต์", phone: "089-876-5432",
        items: [
            { name: "น้ำตกคอหมูย่าง", qty: 2, price: 80, spicy: "น้อย", addons: ["ข้าวเพิ่ม"], note: "" },
            { name: "ชาไทยเย็น", qty: 1, price: 45, spicy: "ไม่เผ็ด", addons: [], note: "หวานน้อย" },
        ],
        total: 205, type: "pickup", time: "02:38", status: "prepping", payMethod: "เงินสด"
    },
    {
        id: "TJP-0021", customer: "ประเสริฐ ธรรมดี", phone: "062-111-2222",
        address: "5/5 ถ.สาทรใต้ บางรัก กรุงเทพฯ 10500",
        items: [
            { name: "ลาบเนื้อ", qty: 1, price: 90, spicy: "กลาง", addons: [], note: "" },
            { name: "ข้าวเหนียว", qty: 2, price: 20, spicy: "ไม่เผ็ด", addons: [], note: "" },
        ],
        total: 130, type: "delivery", time: "02:20", status: "ready", payMethod: "PromptPay"
    },
];

const STATUS_CONFIG = {
    new: { label: "รอรับออเดอร์", color: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-400", next: "prepping" as OrderStatus, nextLabel: "เริ่มทำอาหาร" },
    prepping: { label: "กำลังทำ 🍳", color: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-400 animate-pulse", next: "ready" as OrderStatus, nextLabel: "พร้อมเสิร์ฟ" },
    ready: { label: "พร้อมเสิร์ฟ ✅", color: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500", next: "completed" as OrderStatus, nextLabel: "จัดส่งแล้ว" },
    completed: { label: "จัดส่งสำเร็จ", color: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500", next: null, nextLabel: "" },
    cancelled: { label: "ยกเลิกแล้ว", color: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500", next: null, nextLabel: "" },
};

export default function StoreAdminPage({ params }: { params: Promise<{ shop_slug: string }> }) {
    const { shop_slug } = use(params);
    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState<string | "all">("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [notifEnabled, setNotifEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const prevNewCount = useRef(0);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/orders?shop_slug=${shop_slug}`);
            if (res.ok) {
                const data = await res.json();

                // Sound and Notification Logic
                const newOrders = data.filter((o: any) => o.status === "new");
                if (newOrders.length > prevNewCount.current && !isLoading) {
                    playOrderSound();
                    showBrowserNotification(
                        `🔔 ออเดอร์ใหม่!`,
                        `ร้านมีออเดอร์ใหม่รอรับ (${newOrders.length} รายการ)`
                    );
                }
                prevNewCount.current = newOrders.length;
                setOrders(data);
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Request browser notification permission on mount
    useEffect(() => {
        requestNotificationPermission().then(() => {
            setNotifEnabled(typeof Notification !== "undefined" && Notification.permission === "granted");
        });
        fetchOrders();
    }, []);

    // Poll for new orders every 10 seconds
    useEffect(() => {
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [shop_slug, isLoading]);

    const advance = async (orderId: string, currentStatus: string) => {
        const nextStatus = STATUS_CONFIG[currentStatus as OrderStatus]?.next;
        if (!nextStatus) return;

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (res.ok) {
                // Refresh list
                fetchOrders();
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
    const counts = {
        new: orders.filter(o => o.status === "new").length,
        prepping: orders.filter(o => o.status === "prepping").length,
        ready: orders.filter(o => o.status === "ready").length,
        completed: orders.filter(o => o.status === "completed").length,
    };
    const todayRevenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);

    return (
        <div className="p-4 space-y-4 max-w-md mx-auto">

            {/* Store URL card */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-4 flex items-center justify-between shadow-md shadow-orange-200">
                <div>
                    <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">🔗 URL หน้าร้านของคุณ</p>
                    <p className="font-mono text-sm text-white font-bold opacity-90 truncate max-w-[200px]">
                        {typeof window !== 'undefined' ? `${window.location.host}/menu/${shop_slug}` : `tamjai-app.vercel.app/menu/${shop_slug}`}
                    </p>
                    <p className="text-xs text-white/70 mt-0.5">ลูกค้าสแกนเพื่อสั่งอาหารที่โต๊ะ</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        <Link href={"/menu/" + shop_slug} target="_blank"
                            className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-white px-3 py-2 rounded-xl shrink-0 hover:bg-orange-50 transition-colors">
                            <ExternalLink className="h-3 w-3" /> หน้าร้าน
                        </Link>
                        <button
                            onClick={() => setShowQR(true)}
                            className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-white px-3 py-2 rounded-xl shrink-0 hover:bg-orange-50 transition-colors"
                        >
                            <QrCode className="h-3 w-3" /> QR Code
                        </button>
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${notifEnabled ? "bg-white/20 text-white" : "bg-black/20 text-white/60"}`}>
                        <Bell className="h-3 w-3" />
                        {notifEnabled ? "แจ้งเตือนเปิด" : "แจ้งเตือนปิด"}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "รอดำเนินการ", value: counts.new + counts.prepping, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "ออเดอร์วันนี้", value: orders.length, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "ยอดรวม", value: "฿" + todayRevenue.toLocaleString(), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl p-3 border border-gray-100 flex flex-col gap-2">
                        <div className={"h-8 w-8 rounded-xl " + stat.bg + " " + stat.color + " flex items-center justify-center"}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-gray-900 leading-none">{stat.value}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            {/* Order cards */}
            <div className="space-y-3">
                {filtered.length === 0 && (
                    <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="font-medium text-sm">ไม่มีออเดอร์ในหมวดนี้</p>
                    </div>
                )}

                {filtered.map((order: any) => {
                    const cfg = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.new;
                    const isExpanded = expandedId === order.id;
                    const orderItems = (order.items as any[]) || [];
                    const itemTotal = orderItems.reduce((s, i) => s + (Number(i.price) * (i.qty || 1)), 0);
                    const totalAmount = Number(order.totalAmount);
                    const deliveryFee = totalAmount - itemTotal;

                    return (
                        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

                            {/* Header Row */}
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100 hover:bg-gray-100/60 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-gray-900 text-sm">#{order.orderId || order.id.slice(-4)}</span>
                                    <span className={"inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-full " + cfg.color}>
                                        <span className={"h-1.5 w-1.5 rounded-full " + cfg.dot} />
                                        {cfg.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                                    <ChevronDown className={"h-4 w-4 text-gray-400 transition-transform " + (isExpanded ? "rotate-180" : "")} />
                                </div>
                            </button>

                            {/* Summary row (always visible) */}
                            <div className="px-4 py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{(order.customer as any).name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={"inline-flex items-center gap-1 text-xs font-medium " + (order.orderType === "delivery" ? "text-orange-500" : "text-blue-500")}>
                                            {order.orderType === "delivery" ? <Bike className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                                            {order.orderType === "delivery" ? "เดลิเวอรี่" : "รับเอง"}
                                        </span>
                                        <span className="text-gray-300">·</span>
                                        <span className="text-xs text-gray-500">{orderItems.length} รายการ</span>
                                    </div>
                                </div>
                                <span className="font-black text-orange-500 text-base">{"฿" + totalAmount}</span>
                            </div>

                            {/* Expanded detail */}
                            {isExpanded && (
                                <div className="px-4 pb-3 space-y-3 border-t border-gray-100">

                                    {/* Contact & delivery */}
                                    <div className="pt-3 space-y-2">
                                        <a href={"tel:" + (order.customer as any).phone}
                                            className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-gray-100 transition-colors">
                                            <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500 leading-none">เบอร์โทร</p>
                                                <p className="font-semibold text-gray-900 text-sm mt-0.5">{(order.customer as any).phone}</p>
                                            </div>
                                            <span className="ml-auto text-xs text-orange-500 font-semibold">โทรเลย</span>
                                        </a>

                                        {(order.customer as any).address && (
                                            <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
                                                <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 leading-none">ที่อยู่จัดส่ง</p>
                                                    <p className="font-medium text-gray-800 text-sm mt-0.5 leading-snug">{(order.customer as any).address}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Items detail */}
                                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 pt-2.5 pb-1.5">รายการอาหาร</p>
                                        <div className="divide-y divide-gray-100">
                                            {orderItems.map((item: any, i: number) => (
                                                <div key={i} className="px-3 py-2.5">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-semibold text-gray-900 text-sm">{item.qty}× {item.name}</p>
                                                        <p className="font-bold text-gray-700 text-sm">{"฿" + item.price * item.qty}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {item.options?.variants && (
                                                            <span className="text-[10px] bg-red-50 text-red-500 font-semibold px-1.5 py-0.5 rounded-md">
                                                                ตัวเลือก: {item.options.variants}
                                                            </span>
                                                        )}
                                                        {item.options?.addons?.map((a: string) => (
                                                            <span key={a} className="text-[10px] bg-blue-50 text-blue-500 font-semibold px-1.5 py-0.5 rounded-md">
                                                                + {a}
                                                            </span>
                                                        ))}
                                                        {item.note && (
                                                            <span className="text-[10px] bg-amber-50 text-amber-600 font-medium px-1.5 py-0.5 rounded-md">
                                                                📝 {item.note}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Price breakdown */}
                                        <div className="border-t border-gray-200 px-3 py-2.5 space-y-1">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>ค่าอาหาร</span><span>{"฿" + itemTotal}</span>
                                            </div>
                                            {deliveryFee > 0 && (
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>ค่าจัดส่ง</span><span>{"฿" + deliveryFee}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm font-black text-gray-900 pt-0.5">
                                                <span>รวม</span><span className="text-orange-500">{"฿" + totalAmount}</span>
                                            </div>
                                            <p className="text-xs text-gray-400">ชำระ: {order.paymentMethod === 'promptpay' ? 'PromptPay' : 'เงินสด'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action button */}
                            <div className="px-4 pb-4">
                                {cfg.next ? (
                                    <button onClick={() => advance(order.orderId, order.status)}
                                        className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] transition-all text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-100">
                                        {cfg.nextLabel} <ChevronRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <div className="w-full bg-emerald-50 text-emerald-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-200">
                                        <CheckCircle2 className="h-4 w-4" /> จัดส่งแล้ว / เสร็จสิ้น
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {/* QR Code Modal */}
                {showQR && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-black text-gray-900">QR Code ประจำร้าน</h3>
                                <button onClick={() => setShowQR(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="bg-white p-4 rounded-3xl aspect-square flex items-center justify-center border-2 border-orange-100 shadow-md">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${typeof window !== 'undefined' ? `https://${window.location.host}/menu/${shop_slug}` : `https://tamjai-app.vercel.app/menu/${shop_slug}`}`}
                                    alt="Store QR Code"
                                    className="w-full h-full"
                                />
                            </div>

                            <div className="space-y-1 text-center">
                                <p className="text-sm font-bold text-gray-900 break-all px-2">
                                    {typeof window !== 'undefined' ? `${window.location.host}/menu/${shop_slug}` : `tamjai-app.vercel.app/menu/${shop_slug}`}
                                </p>
                                <p className="text-xs font-medium text-gray-500">
                                    พิมพ์เพื่อวางบนโต๊ะอาหาร หรือแชร์ในโซเชียล
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${typeof window !== 'undefined' ? `https://${window.location.host}/menu/${shop_slug}` : `https://tamjai-app.vercel.app/menu/${shop_slug}`}`;
                                        window.open(qrUrl, '_blank');
                                    }}
                                    className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"
                                >
                                    <Download className="h-5 w-5" /> เปิดรูปภาพขนาดใหญ่
                                </button>
                                <button
                                    onClick={() => setShowQR(false)}
                                    className="w-full mt-2 py-2 rounded-2xl font-bold text-sm text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    ปิดหน้าต่าง
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

