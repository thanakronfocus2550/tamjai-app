"use client";

import React, { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, ShoppingBag, Bike, Loader2, ChevronRight, Bell, Volume2, VolumeX } from "lucide-react";
import { playOrderSound, requestNotificationPermission, showBrowserNotification } from "@/hooks/useOrderSound";

type OrderStatus = "new" | "prepping" | "ready" | "completed" | "cancelled";

export default function KitchenPage({ params }: { params: Promise<{ shop_slug: string }> }) {
    const { shop_slug } = use(params);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notifEnabled, setNotifEnabled] = useState(false);
    const [alertsActive, setAlertsActive] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const seenOrderIds = useRef<Set<string>>(new Set());

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/orders?shop_slug=${shop_slug}`);
            if (res.ok) {
                const data = await res.json();
                // We only care about active kitchen orders (new, prepping, ready)
                const activeOrders = data.filter((o: any) => ["new", "prepping", "ready"].includes(o.status));

                // Sound and Notification logic for REALLY new orders
                const newOrders = data.filter((o: any) => o.status === "new");
                const brandNewOrders = newOrders.filter((o: any) => !seenOrderIds.current.has(o.orderId));

                if (brandNewOrders.length > 0 && !isLoading && alertsActive) {
                    playOrderSound();
                    showBrowserNotification(`🔔 ออเดอร์ใหม่!`, `มีออเดอร์ใหม่ ${brandNewOrders.length} รายการ`);
                }

                // Update seen orders
                newOrders.forEach((o: any) => seenOrderIds.current.add(o.orderId));
                setOrders(activeOrders);
            }
        } catch (err) {
            console.error("Failed to fetch kitchen orders:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        requestNotificationPermission().then(() => {
            setNotifEnabled(typeof Notification !== "undefined" && Notification.permission === "granted");
        });
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // 5s for PRO feel
        return () => clearInterval(interval);
    }, [shop_slug, isLoading, alertsActive]);

    const updateStatus = async (orderId: string, nextStatus: OrderStatus) => {
        setUpdatingId(orderId);

        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
            .filter(o => ["new", "prepping", "ready"].includes(o.status)));

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            if (res.ok) await fetchOrders();
        } catch (err) {
            console.error("Status update error:", err);
            fetchOrders();
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
            {/* KDS Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href={`/menu/${shop_slug}/admin`} className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                        <ChevronRight className="h-6 w-6 rotate-180" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                            KITCHEN SYSTEM <span className="text-orange-500">PRO</span>
                        </h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> LIVE ORDER MONITORING
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => playOrderSound()}
                        className="h-11 w-11 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all active:scale-90 shadow-lg shadow-orange-500/10"
                        title="Test Sound"
                    >
                        <Volume2 className="h-5 w-5" />
                    </button>

                    <button
                        onClick={() => {
                            if (!notifEnabled) {
                                requestNotificationPermission().then(() => {
                                    setNotifEnabled(Notification.permission === "granted");
                                });
                            }
                            if (!alertsActive) {
                                playOrderSound();
                            }
                            setAlertsActive(!alertsActive);
                        }}
                        className={`group relative flex items-center gap-3 px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl ${alertsActive ? "bg-white text-orange-600 shadow-orange-500/20" : "bg-black/40 text-white/40 border border-white/10 shadow-none"}`}
                    >
                        {alertsActive ? <Bell className="h-5 w-5 animate-pulse" /> : <VolumeX className="h-5 w-5" />}
                        <span>{alertsActive ? "ALERTS ACTIVE" : "ALERTS MUTED"}</span>
                        {alertsActive && !notifEnabled && <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-4 border-[#0F0F0F] animate-pulse" />}
                        {alertsActive && notifEnabled && <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-4 border-[#0F0F0F] animate-pulse" />}
                    </button>

                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Kitchen Monitor</span>
                        <span className="text-sm font-black text-white uppercase tracking-tighter">{shop_slug}</span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 text-gray-500">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
                    <p className="font-bold uppercase tracking-widest text-sm">Initializing Kitchen...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {orders.length === 0 && (
                        <div className="col-span-full py-40 text-center border-2 border-dashed border-white/10 rounded-[3rem]">
                            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-white/10" />
                            <h3 className="text-xl font-black text-gray-500 uppercase">NO ORDERS FOR NOW</h3>
                            <p className="text-gray-600 text-sm mt-2 font-bold uppercase tracking-widest">Go take a break, Chef!</p>
                        </div>
                    )}

                    {orders.map((order) => {
                        const items = order.items || [];
                        const isNew = order.status === "new";
                        const isPrepping = order.status === "prepping";
                        const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                        const orderType = order.orderType || "pickup";

                        // Urgency logic
                        let urgencyClass = "border-white/5";
                        let headerClass = "bg-white/5 text-white";
                        let pulseClass = "";

                        if (isNew) {
                            urgencyClass = "border-orange-500 shadow-2xl shadow-orange-500/10 ring-4 ring-orange-500/20";
                            headerClass = "bg-orange-500 text-white";
                        } else if (elapsed >= 15) {
                            urgencyClass = "border-red-500 shadow-2xl shadow-red-500/20 animate-pulse-red";
                            headerClass = "bg-red-600 text-white";
                            pulseClass = "animate-pulse";
                        } else if (elapsed >= 5) {
                            urgencyClass = "border-amber-500 shadow-xl shadow-amber-500/10";
                            headerClass = "bg-amber-500 text-white";
                        }

                        return (
                            <div key={order.id} className={`flex flex-col bg-gray-800 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${urgencyClass}`}>
                                {/* Card Header */}
                                <div className={`p-5 flex items-center justify-between transition-colors duration-500 ${headerClass}`}>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">Order ID</p>
                                        <h2 className="text-xl font-black tracking-tight mt-1 leading-none">#{order.orderId}</h2>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${elapsed >= 15 ? "bg-white text-red-600" : elapsed >= 5 ? "bg-white text-amber-600" : "bg-white/20 text-white"}`}>
                                            <Clock className={`h-3 w-3 ${pulseClass}`} />
                                            {elapsed}m
                                        </div>
                                    </div>
                                </div>

                                {/* Items Container */}
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="space-y-3">
                                        {items.map((item: any, i: number) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-orange-500 shrink-0">
                                                    {item.qty}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-lg leading-tight uppercase tracking-tight">{item.name}</p>
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {Object.entries(item.options || {}).map(([group, labels]) => {
                                                            if (group === "note") return null;
                                                            const selected = Array.isArray(labels) ? labels : [labels];
                                                            return selected.map((label, idx) => (
                                                                <span key={group + idx} className="text-[9px] font-black bg-white/10 text-white/80 px-2 py-1 rounded-lg uppercase tracking-widest border border-white/5">
                                                                    <span className="text-orange-500">{group}:</span> {label}
                                                                </span>
                                                            ));
                                                        })}
                                                        {item.note && (
                                                            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl w-full mt-2">
                                                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Kitchen Note:</p>
                                                                <p className="text-sm font-bold text-white leading-relaxed">"{item.note}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Info Footer */}
                                <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {orderType === "delivery" ? (
                                            <><Bike className="h-4 w-4 text-orange-500" /><span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Delivery</span></>
                                        ) : orderType === "pickup" ? (
                                            <><ShoppingBag className="h-4 w-4 text-emerald-500" /><span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Pick-up</span></>
                                        ) : (
                                            <><div className="h-4 w-4 rounded-full bg-blue-500" /><span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Dine-in</span></>
                                        )}
                                    </div>
                                    <p className="text-xs font-black text-white/50">{(order.customer as any).name}</p>
                                </div>

                                {/* Actions */}
                                <div className="p-3">
                                    {isNew && (
                                        <button
                                            disabled={updatingId === order.id}
                                            onClick={() => updateStatus(order.id, "prepping")}
                                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 active:scale-95 transition-all text-white py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                                        >
                                            {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "ACCEPT & COOK"}
                                        </button>
                                    )}
                                    {isPrepping && (
                                        <button
                                            disabled={updatingId === order.id}
                                            onClick={() => updateStatus(order.id, "ready")}
                                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 active:scale-95 transition-all text-white py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                        >
                                            {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "READY TO SERVE"}
                                        </button>
                                    )}
                                    {order.status === "ready" && (
                                        <button
                                            disabled={updatingId === order.id}
                                            onClick={() => updateStatus(order.id, "completed")}
                                            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 active:scale-95 transition-all text-white py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                        >
                                            {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> MARK AS DONE</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
