"use client";

import React, { useState, useEffect, use, useRef } from "react";
import {
    Search, ShoppingBag, Plus, Minus, X,
    ChevronLeft, Loader2, CheckCircle2,
    Store, Bike, Users, CreditCard, Banknote,
    Clock, Trash2, Printer, QrCode, Power,
    LayoutGrid, List, Settings, User, Bell,
    ArrowRight, ChevronRight, Hash, Copy, Lock
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { generatePromptPayPayload } from "@/lib/promptpay";

// --- PROFESSIONAL POS CONFIG ---
const THEME = {
    dark: "bg-[#0F1115]",
    surface: "bg-[#1A1D23]",
    border: "border-[#2A2E37]",
    textDim: "text-[#8E94A0]",
    orange: "text-orange-500",
    orangeBg: "bg-orange-500",
    orangeShadow: "shadow-orange-500/20"
};

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    categoryId: string;
    category?: { name: string };
}

interface CartItem extends Product {
    qty: number;
}

export default function POSPage({ params }: { params: Promise<{ shop_slug: string }> }) {
    const { shop_slug } = use(params);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderType, setOrderType] = useState<"dinein" | "pickup" | "delivery">("dinein");
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "promptpay">("cash");
    const [customerName, setCustomerName] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastOrderId, setLastOrderId] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [settings, setSettings] = useState<any>(null);
    const [staffName, setStaffName] = useState("Admin");
    const [showPaymentQR, setShowPaymentQR] = useState(false);
    const [promptPayPayload, setPromptPayPayload] = useState("");
    const [riderName, setRiderName] = useState("");

    // New Features States
    const [showTableMap, setShowTableMap] = useState(false);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tables, setTables] = useState<any[]>([]);
    const [tableOrders, setTableOrders] = useState<any[]>([]);
    const [showVisualBilling, setShowVisualBilling] = useState(false);
    const [currentShift, setCurrentShift] = useState<any>(null);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [shiftAction, setShiftAction] = useState<"OPEN" | "CLOSE">("OPEN");
    const [shiftCash, setShiftCash] = useState("");
    const [shiftNotes, setShiftNotes] = useState("");
    const [showMoveTable, setShowMoveTable] = useState(false);
    const [moveFromTable, setMoveFromTable] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [prodRes, catRes, setRes, tabRes, shiftRes] = await Promise.all([
                    fetch(`/api/menu/${shop_slug}/products`),
                    fetch(`/api/menu/${shop_slug}/categories`),
                    fetch(`/api/menu/${shop_slug}/settings`),
                    fetch(`/api/menu/${shop_slug}/tables`),
                    fetch(`/api/tenant/${shop_slug}/shifts`)
                ]);
                const prodData = await prodRes.json();
                const catData = await catRes.json();
                const setData = await setRes.json();
                const tabData = await tabRes.json();
                const shiftData = await shiftRes.json();

                if (Array.isArray(prodData)) {
                    setProducts(prodData.map((p: any) => ({ ...p, price: Number(p.price) })));
                } else {
                    setProducts([]);
                }

                if (Array.isArray(catData)) setCategories(catData);
                if (setData && !setData.error) setSettings(setData);
                if (Array.isArray(tabData)) setTables(tabData);

                if (shiftData && !shiftData.error && shiftData.id) {
                    setCurrentShift(shiftData);
                } else {
                    setShiftAction("OPEN");
                    setShowShiftModal(true);
                }
            } catch (err) {
                console.error("Failed to fetch POS data", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [shop_slug]);

    const refreshTables = async () => {
        const res = await fetch(`/api/menu/${shop_slug}/tables`);
        const data = await res.json();
        setTables(data);
    };

    const fetchTableOrders = async (tableNum: string) => {
        try {
            const res = await fetch(`/api/orders?shop_slug=${shop_slug}&tableNumber=${tableNum}&status=prepping,ready,billing`);
            const data = await res.json();
            setTableOrders(data);
        } catch (err) {
            console.error("Failed to fetch table orders", err);
        }
    };

    const initTables = async () => {
        for (let i = 1; i <= 15; i++) {
            await fetch(`/api/menu/${shop_slug}/tables`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ number: i.toString(), capacity: 4 })
            });
        }
        refreshTables();
    };

    const updateTableStatus = async (tableId: string, status: string) => {
        await fetch(`/api/menu/${shop_slug}/tables`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tableId, status })
        });
        refreshTables();
    };

    const handleShiftAction = async () => {
        try {
            const res = await fetch(`/api/tenant/${shop_slug}/shifts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: shiftAction,
                    cashIn: shiftAction === "OPEN" ? Number(shiftCash) : undefined,
                    actualCash: shiftAction === "CLOSE" ? Number(shiftCash) : undefined,
                    notes: shiftNotes
                })
            });
            const data = await res.json();
            if (res.ok) {
                setCurrentShift(shiftAction === "OPEN" ? data : null);
                setShowShiftModal(false);
                setShiftCash("");
                setShiftNotes("");
                if (shiftAction === "CLOSE") {
                    alert(`กะถูกปิดแล้ว\nยอดขายสะสม: ฿${data.cashOut}\nเงินสดที่คาดรู: ฿${data.expectedCash}\nเงินสดจริง: ฿${data.actualCash}\nส่วนต่าง: ฿${data.difference}`);
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Shift error", err);
        }
    };

    const handleMoveTable = async (toTableNum: string) => {
        if (!moveFromTable) return;
        try {
            // Find orders for fromTable and move them
            const res = await fetch(`/api/orders?shop_slug=${shop_slug}&tableNumber=${moveFromTable}&status=prepping,ready,billing`);
            const orders = await res.json();

            for (const order of orders) {
                await fetch(`/api/orders/${order.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tableNumber: toTableNum })
                });
            }

            const fromTab = tables.find(t => t.number === moveFromTable);
            const toTab = tables.find(t => t.number === toTableNum);

            if (fromTab) updateTableStatus(fromTab.id, "vacant");
            if (toTab) updateTableStatus(toTab.id, "occupied");

            setShowMoveTable(false);
            setMoveFromTable(null);
            refreshTables();
            alert(`ย้ายจากโต๊ะ ${moveFromTable} ไปยังโต๊ะ ${toTableNum} สำเร็จ`);
        } catch (err) {
            console.error("Move table error", err);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = item.qty + delta;
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handleTableCheckout = async (payMethod: string) => {
        setIsSubmitting(true);
        try {
            // 1. Update all table orders to completed
            for (const order of tableOrders) {
                await fetch(`/api/orders/${order.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "completed", payMethod: payMethod })
                });
            }

            // 2. Set table to vacant
            const tableObj = tables.find(t => t.number === selectedTable);
            if (tableObj) {
                await updateTableStatus(tableObj.id, "vacant");
            }

            // 3. Reset states
            setShowVisualBilling(false);
            setShowPaymentQR(false);
            setShowSuccess(true);
            setLastOrderId(`TABLE-${selectedTable}`);
            setSelectedTable(null);
            setTableOrders([]);
            refreshTables();
        } catch (err) {
            console.error("Table checkout error", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // If PromptPay, show QR first
        if (paymentMethod === "promptpay" && !showPaymentQR) {
            const ppId = settings?.bankAccount || "0000000000000";
            const payload = generatePromptPayPayload(ppId, cartTotal);
            setPromptPayPayload(payload);
            setShowPaymentQR(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shop_slug,
                    items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price, options: {} })),
                    customer: { name: customerName || (selectedTable ? `Table ${selectedTable}` : "Guest"), phone: "000-000-0000" },
                    payMethod: paymentMethod,
                    orderType: orderType,
                    tableNumber: selectedTable,
                    riderName: orderType === "delivery" ? riderName : undefined,
                    total: cartTotal,
                    source: "pos"
                })
            });
            if (res.ok) {
                const data = await res.json();
                setLastOrderId(data.orderId);
                setShowSuccess(true);
                setCart([]);
                setCustomerName("");

                // If dine-in, update table status appropriately
                if (orderType === "dinein" && selectedTable) {
                    const tableObj = tables.find(t => t.number === selectedTable);
                    if (tableObj) {
                        // After checkout, if it was a direct POS bill, it becomes vacant? 
                        // Or if it was just adding an order, it stays occupied.
                        // The user said "เมื่อปิดบิลแล้วให้ระบบล้างโต๊ะกลับเป็นสถานะ 'ว่าง'"
                        // So in handleCheckout (creating a new order), it should probably stay occupied if it's new, 
                        // BUT if they are calling it 'Checkout' like closing the whole table, it should be vacant.
                        // However, handleCheckout here seems to be "Create New Order from POS".
                        // Closing bill is in the Visual Billing modal.
                        updateTableStatus(tableObj.id, "occupied");
                    }
                }

                setSelectedTable(null);
                setShowPaymentQR(false);
                setRiderName("");
            }
        } catch (err) { console.error("POS Error", err); }
        finally { setIsSubmitting(false); }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#0F1115]"><Loader2 className="h-10 w-10 animate-spin text-orange-500" /></div>;

    return (
        <div className="h-screen flex flex-col md:flex-row bg-[#0F1115] text-white overflow-hidden font-sans">

            {/* Left Rail: Navigation & Categories */}
            <div className="w-[80px] bg-[#14161C] border-r border-[#242933] flex flex-col items-center py-6 gap-8 shrink-0">
                <div className="h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <ShoppingBag className="h-6 w-6" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                    <button onClick={() => setShowTableMap(false)} className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${!showTableMap ? "bg-[#1A1D23] text-orange-500 shadow-xl" : "text-[#4E5460] hover:text-[#8E94A0]"}`}>
                        <LayoutGrid className="h-6 w-6" />
                    </button>
                    <button onClick={() => setShowTableMap(true)} className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${showTableMap ? "bg-[#1A1D23] text-orange-500 shadow-xl" : "text-[#4E5460] hover:text-[#8E94A0]"}`}>
                        <Store className="h-6 w-6" />
                    </button>
                    <button className="h-12 w-12 rounded-2xl flex items-center justify-center text-[#4E5460] hover:text-[#8E94A0]">
                        <Clock className="h-6 w-6" />
                    </button>
                    <button className="h-12 w-12 rounded-2xl flex items-center justify-center text-[#4E5460] hover:text-[#8E94A0]">
                        <Settings className="h-6 w-6" />
                    </button>
                </div>
                <button className="h-12 w-12 rounded-2xl flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all">
                    <Power className="h-6 w-6" />
                </button>
            </div>

            {/* Main Area: Menu or Table Map */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Dashboard Header */}
                <header className="h-[80px] border-b border-[#242933] px-8 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                            TAMJAI <span className="text-orange-500">POS</span>
                        </h1>
                        <p className="text-[10px] text-[#4E5460] font-black uppercase tracking-[0.2em]">{currentTime.toLocaleDateString('th-TH')}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative w-96">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4E5460]" />
                            <input
                                type="text"
                                placeholder="ค้นหาเมนู, หมวดหมู่..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1A1D23] border border-[#242933] rounded-[1.2rem] py-3.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all"
                            />
                        </div>
                        {currentShift ? (
                            <button
                                onClick={() => { setShiftAction("CLOSE"); setShowShiftModal(true); }}
                                className="h-12 px-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all group"
                            >
                                <Clock className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">ปิดกะ (฿{currentShift.cashIn})</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => { setShiftAction("OPEN"); setShowShiftModal(true); }}
                                className="h-12 px-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all"
                            >
                                <Power className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">เปิดกะการขาย</span>
                            </button>
                        )}
                        <div className="flex items-center gap-3 bg-[#14161C] border border-[#242933] rounded-2xl px-4 py-2.5">
                            <div className="h-8 w-8 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black leading-none text-[#4E5460] uppercase tracking-widest">Operator</p>
                                <p className="text-xs font-black mt-1">{staffName}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {!showTableMap ? (
                    <>
                        {/* Category Fast-Bar */}
                        <div className="px-8 py-6 flex gap-3 overflow-x-auto scrollbar-hide shrink-0">
                            <button onClick={() => setActiveCategory("all")} className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === "all" ? "bg-orange-500 text-white shadow-xl shadow-orange-500/20" : "bg-[#1A1D23] text-[#8E94A0] border border-[#242933] hover:border-[#4E5460]"}`}>ALL</button>
                            {categories.map(cat => (
                                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? "bg-orange-500 text-white shadow-xl shadow-orange-500/20" : "bg-[#1A1D23] text-[#8E94A0] border border-[#242933] hover:border-[#4E5460]"}`}>{cat.name}</button>
                            ))}
                        </div>

                        {/* Product Terminal Grid */}
                        <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                                {products.filter(p => (activeCategory === "all" || p.categoryId === activeCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                                    <button key={p.id} onClick={() => addToCart(p)} className="group bg-[#1A1D23] border border-[#242933] rounded-[2.2rem] p-4 text-left transition-all hover:bg-[#21242C] hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/5 active:scale-95 flex flex-col relative overflow-hidden">
                                        <div className="h-48 rounded-[1.6rem] bg-[#14161C] mb-4 overflow-hidden relative">
                                            {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="h-full w-full flex items-center justify-center text-orange-500/20"><ShoppingBag className="h-12 w-12" /></div>}
                                            <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 shadow-xl shadow-orange-500/40">
                                                <Plus className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <h3 className="font-black text-sm tracking-tight mb-2 px-1">{p.name}</h3>
                                        <div className="mt-auto flex items-center justify-between px-1">
                                            <span className="text-xl font-black text-orange-500 tracking-tighter">฿{p.price}</span>
                                            <div className="h-2 w-2 rounded-full bg-orange-500/20"></div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 p-8">
                        {tables.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-6">
                                <div className="p-8 bg-orange-500/10 rounded-full text-orange-500">
                                    <Store className="h-16 w-16" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-black">No Tables Configured</h2>
                                    <p className="text-[#8E94A0] mt-2">Generate default table layout to start testing.</p>
                                </div>
                                <button onClick={initTables} className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
                                    Initialize 15 Tables
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto max-h-full scrollbar-hide">
                                {tables.map(t => {
                                    const isSelected = selectedTable === t.number;
                                    const states: any = {
                                        vacant: { color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 shadow-xl shadow-emerald-500/5", label: "ว่าง (Available)" },
                                        occupied: { color: "bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-500/30 ring-8 ring-orange-500/10", label: "มีลูกค้า (Occupied)" },
                                        billing: { color: "bg-red-500 border-red-500 text-white animate-pulse shadow-xl shadow-red-500/30 ring-8 ring-red-500/10", label: "เรียกเก็บเงิน (Billing)" },
                                        cleaning: { color: "bg-purple-500/20 border-purple-500/50 text-purple-500", label: "กำลังทำความสะอาด" },
                                        reserved: { color: "bg-blue-500/20 border-blue-500/50 text-blue-500", label: "จองแล้ว" }
                                    };
                                    const cfg = states[t.status] || states.vacant;

                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                if (showMoveTable && moveFromTable) {
                                                    handleMoveTable(t.number);
                                                } else {
                                                    setSelectedTable(t.number);
                                                    setOrderType("dinein"); // Set order type to dinein when selecting a table
                                                    fetchTableOrders(t.number);
                                                    setShowTableMap(false);
                                                }
                                            }}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                const sequence: any = { vacant: "occupied", occupied: "billing", billing: "cleaning", cleaning: "vacant" };
                                                updateTableStatus(t.id, sequence[t.status] || "vacant");
                                            }}
                                            className={`aspect-square rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-3 transition-all ${isSelected || (moveFromTable === t.number) ? "ring-8 ring-white/10 scale-105" : ""} ${cfg.color} hover:scale-105 active:scale-95`}
                                        >
                                            <Users className={`h-6 w-6 ${t.status === 'occupied' || t.status === 'billing' ? 'text-white' : 'text-emerald-500'}`} />
                                            <span className="text-2xl font-black">T-{t.number}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{cfg.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Terminal: Checkout & Order Details */}
            <div className="w-[450px] bg-[#14161C] border-l border-[#242933] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] z-20">
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white">ยอดปัจจุบัน</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-[#8E94A0] uppercase tracking-widest">ORDER TYPE: {orderType.toUpperCase()}</span>
                        </div>
                    </div>
                    {orderType === 'delivery' && (
                        <div className="bg-orange-500/10 rounded-xl px-3 py-1 border border-orange-500/20">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">RIDER ASSIGNED</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
                    {orderType === 'delivery' && (
                        <div className="bg-[#1A1D23] border border-[#242933] rounded-[2rem] p-6 mb-4 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                    <Bike className="h-5 w-5 text-white" />
                                </div>
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Rider Assignment (สำหรับส่งบ้าน)</h4>
                            </div>
                            <select
                                value={riderName}
                                onChange={(e) => setRiderName(e.target.value)}
                                className="w-full bg-[#0F1115] border border-[#242933] rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-orange-500 transition-all appearance-none"
                            >
                                <option value="">-- เลือกพนักงานส่งของ --</option>
                                <option value="Somsak B.">สมศักดิ์ บี (Rider 1)</option>
                                <option value="Wichai D.">วิชัย ดี (Rider 2)</option>
                                <option value="Manual Assign">ระบุชื่อเอง...</option>
                            </select>
                        </div>
                    )}

                    {selectedTable && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-orange-500" />
                                <span className="text-sm font-black text-orange-500 uppercase">โต๊ะ {selectedTable}</span>
                            </div>
                            <button
                                onClick={() => setShowVisualBilling(true)}
                                className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                            >
                                เรียกเก็บเงิน
                            </button>
                        </div>
                    )}
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 filter grayscale">
                            <ShoppingBag className="h-24 w-24 mb-4" />
                            <p className="font-black uppercase tracking-widest text-sm">Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="bg-[#1A1D23] border border-[#242933] rounded-3xl p-5 flex gap-4 items-center">
                                <div className="h-14 w-14 rounded-2xl bg-[#0F1115] overflow-hidden shrink-0">
                                    {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-sm text-white truncate uppercase tracking-tight">{item.name}</h4>
                                    <p className="text-orange-500 font-black text-lg mt-0.5 tracking-tighter">฿{item.price * item.qty}</p>
                                </div>
                                <div className="flex bg-[#0F1115] p-1 rounded-2xl items-center gap-2">
                                    <button onClick={() => updateQty(item.id, -1)} className="h-9 w-9 bg-[#1A1D23] rounded-xl flex items-center justify-center text-[#8E94A0] hover:text-white transition-colors">
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-6 text-center font-black text-white">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="h-9 w-9 bg-[#1A1D23] rounded-xl flex items-center justify-center text-orange-500 hover:text-white transition-colors">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout & Actions */}
                <div className="p-8 space-y-8 bg-[#0F1115] border-t border-[#242933]">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: "dinein", icon: Users, label: "กินที่ร้าน" },
                            { id: "pickup", icon: Store, label: "รับกลับบ้าน" },
                            { id: "delivery", icon: Bike, label: "เดลิเวอรี่" }
                        ].map(m => (
                            <button key={m.id} onClick={() => setOrderType(m.id as any)} className={`flex flex-col items-center gap-2 py-5 rounded-3xl border-2 transition-all ${orderType === m.id ? "border-orange-500 bg-orange-500/5 text-orange-500 shadow-2xl shadow-orange-500/10" : "border-[#242933] bg-[#1A1D23] text-[#4E5460] hover:border-[#4E5460]"}`}>
                                <m.icon className="h-5 w-5" />
                                <span className="text-[10px] font-black tracking-widest uppercase">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setPaymentMethod("cash")} className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-3xl border-2 transition-all ${paymentMethod === "cash" ? "border-orange-500 bg-orange-500/5 text-orange-500 shadow-xl" : "border-[#242933] bg-[#1A1D23] text-[#4E5460]"}`}>
                            <Banknote className="h-6 w-6" />
                            <span className="font-black uppercase tracking-widest text-xs">เงินสด</span>
                        </button>
                        <button onClick={() => setPaymentMethod("promptpay")} className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-3xl border-2 transition-all ${paymentMethod === "promptpay" ? "border-orange-500 bg-orange-500/5 text-orange-500 shadow-xl" : "border-[#242933] bg-[#1A1D23] text-[#4E5460]"}`}>
                            <CreditCard className="h-6 w-6" />
                            <span className="font-black uppercase tracking-widest text-xs">พรอมต์เพย์</span>
                        </button>
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[#4E5460] font-black text-xs uppercase tracking-widest">ยอดที่ต้องชำระ</span>
                            <span className="text-5xl font-black text-white tracking-tighter"><span className="text-orange-500 text-3xl">฿</span>{cartTotal.toLocaleString()}</span>
                        </div>
                        <button
                            disabled={cart.length === 0 || isSubmitting}
                            onClick={handleCheckout}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-20 transition-all text-white py-7 rounded-[2.5rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30 active:scale-95 flex items-center justify-center gap-4 group"
                        >
                            {isSubmitting ? <Loader2 className="h-8 w-8 animate-spin" /> : <>ชำระเงิน <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" /></>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal - Terminal Style */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
                    <div className="bg-[#1A1D23] border border-orange-500/30 rounded-[4rem] w-full max-w-lg p-12 text-center shadow-[0_0_100px_rgba(249,115,22,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShoppingBag className="h-48 w-48 text-orange-500 rotate-12" />
                        </div>

                        <div className="h-24 w-24 bg-orange-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/40 mb-8">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>

                        <h3 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">ชำระเงินสำเร็จ</h3>
                        <p className="text-[#8E94A0] font-bold text-lg mb-12">REF: {lastOrderId} • {paymentMethod === "cash" ? "เงินสด" : "พรอมต์เพย์"}</p>

                        <div className="grid grid-cols-2 gap-6">
                            <button onClick={() => setShowSuccess(false)} className="bg-[#242933] hover:bg-[#2A2E37] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest transition-all">เปิดบิลใหม่</button>
                            <button
                                onClick={() => {
                                    const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : "";
                                    const orderUrl = `${baseUrl}/order/${lastOrderId}`;
                                    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(orderUrl)}`, '_blank');
                                }}
                                className="bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3"
                            >
                                <QrCode className="h-5 w-5" /> แชร์ใบเสร็จ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PromptPay Payment Overlay */}
            {showPaymentQR && (
                <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-[#1A1D23] border border-orange-500/30 rounded-[3.5rem] w-full max-w-lg p-10 text-center shadow-2xl relative">
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">สแกนเพื่อชำระเงิน</h3>
                        <p className="text-[#8E94A0] font-bold text-sm mb-8">ยอดชำระ: <span className="text-orange-500">฿{cartTotal.toLocaleString()}</span></p>

                        <div className="bg-white p-6 rounded-[2.5rem] mb-8 inline-block shadow-xl shadow-orange-500/10">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(promptPayPayload)}`}
                                alt="PromptPay QR"
                                className="h-64 w-64"
                            />
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <img src="/promptpay-logo.png" alt="PromptPay" className="h-6 opacity-80" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    if (tableOrders.length > 0) {
                                        handleTableCheckout("promptpay");
                                    } else {
                                        handleCheckout();
                                    }
                                }}
                                disabled={isSubmitting}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "ยืนยันการรับชำระเงิน"}
                            </button>
                            <button
                                onClick={() => setShowPaymentQR(false)}
                                className="w-full bg-transparent text-[#4E5460] hover:text-white py-3 rounded-2xl font-bold text-xs uppercase transition-all"
                            >
                                ย้อนกลับไปแก้ไข
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Visual Billing Modal - Professional Summary */}
            {showVisualBilling && (
                <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                    <div className="bg-[#1A1D23] border border-orange-500/20 rounded-[3.5rem] w-full max-w-2xl p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Banknote className="h-64 w-64 text-orange-500 -rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">เรียกเก็บเงิน (Visual Billing)</h3>
                                    <p className="text-[#8E94A0] font-bold mt-1 uppercase tracking-widest text-xs">สรุปรายการโต๊ะ {selectedTable}</p>
                                </div>
                                <button onClick={() => setShowVisualBilling(false)} className="h-12 w-12 bg-[#0F1115] rounded-2xl flex items-center justify-center text-[#4E5460] hover:text-white transition-all">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide mb-8">
                                {tableOrders.length === 0 ? (
                                    <p className="text-center py-12 text-[#4E5460] font-bold italic uppercase tracking-widest bg-[#0F1115] rounded-[2.5rem]">ไม่มีรายการรอชำระสำหรับโต๊ะนี้</p>
                                ) : tableOrders.map((order, idx) => (
                                    <div key={idx} className="bg-[#0F1115] border border-[#242933] rounded-[2rem] p-6">
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#242933]">
                                            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Order #{order.orderId}</span>
                                            <span className="text-xs font-black text-[#4E5460] uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {order.items.map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-white/80">{item.qty}× {item.name}</span>
                                                    <span className="text-sm font-black text-white">฿{item.price * item.qty}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-orange-500/5 border border-orange-500/20 rounded-[2.5rem] p-8 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-[#4E5460] uppercase tracking-[0.2em] mb-1">ยอดรวมทั้งหมด</p>
                                    <p className="text-5xl font-black text-white tracking-tighter"><span className="text-orange-500 text-3xl">฿</span>{tableOrders.reduce((s, o) => s + Number(o.totalAmount), 0).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            const total = tableOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
                                            const ppId = settings?.bankAccount || "0000000000000";
                                            const payload = generatePromptPayPayload(ppId, total);
                                            setPromptPayPayload(payload);
                                            setShowPaymentQR(true);
                                            setShowVisualBilling(false);
                                        }}
                                        className="bg-white text-gray-900 h-16 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all shadow-xl"
                                    >
                                        แสดง QR รับเงิน
                                    </button>
                                    <button
                                        onClick={() => handleTableCheckout("cash")}
                                        className="bg-orange-500 text-white h-16 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                                    >
                                        ชำระเงินสด
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shift Modal */}
            {showShiftModal && (
                <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-[#1A1D23] border border-[#242933] rounded-[3.5rem] w-full max-w-md p-10 shadow-2xl relative">
                        <div className="h-20 w-20 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-6">
                            {shiftAction === "OPEN" ? <Power className="h-10 w-10" /> : <Clock className="h-10 w-10" />}
                        </div>
                        <h3 className="text-2xl font-black text-white text-center mb-2 uppercase tracking-tight">
                            {shiftAction === "OPEN" ? "เริ่มเปิดกะการขาย" : "ปิดกะการขาย (Z-Report)"}
                        </h3>
                        <p className="text-[#8E94A0] font-bold text-sm text-center mb-8 uppercase tracking-widest">
                            {shiftAction === "OPEN" ? "กรอกจำนวนเงินสำรองในลิ้นชัก" : "นับจำนวนเงินสดที่มีอยู่ในลิ้นชัก"}
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-[#4E5460] uppercase tracking-widest pl-2 mb-2 block">
                                    {shiftAction === "OPEN" ? "เงินทอนเริ่มต้น (฿)" : "ยอดเงินสดที่นับได้จริง (฿)"}
                                </label>
                                <input
                                    type="number"
                                    value={shiftCash}
                                    onChange={(e) => setShiftCash(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-[#0F1115] border border-[#242933] rounded-2xl py-5 px-6 text-white font-black text-2xl focus:border-orange-500 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[#4E5460] uppercase tracking-widest pl-2 mb-2 block">หมายเหตุ</label>
                                <textarea
                                    value={shiftNotes}
                                    onChange={(e) => setShiftNotes(e.target.value)}
                                    className="w-full bg-[#0F1115] border border-[#242933] rounded-2xl py-4 px-6 text-white font-bold text-sm focus:border-orange-500 transition-all outline-none"
                                    rows={3}
                                />
                            </div>
                            <button
                                onClick={handleShiftAction}
                                className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${shiftAction === "OPEN" ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600" : "bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600"}`}
                            >
                                {shiftAction === "OPEN" ? "ยืนยันการเปิดกะ" : "ยืนยันการปิดกะและพิมพ์สรุป"}
                            </button>
                            {shiftAction === "CLOSE" && (
                                <button
                                    onClick={() => setShowShiftModal(false)}
                                    className="w-full py-4 text-[#4E5460] font-black text-xs uppercase tracking-widest"
                                >
                                    ยกเลิก
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Move Table Alert */}
            {showMoveTable && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[140] bg-orange-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-bounce">
                    <span className="font-black text-sm uppercase tracking-widest">กำลังย้ายจากโต๊ะ {moveFromTable} • เลือกโต๊ะปลายทาง</span>
                    <button
                        onClick={() => { setShowMoveTable(false); setMoveFromTable(null); }}
                        className="h-8 w-8 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/40 transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
