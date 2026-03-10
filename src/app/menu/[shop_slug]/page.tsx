"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { ShoppingBag, Clock, ChevronLeft, Plus, Minus, X, ChevronDown, MapPin, Bike, Users, Store, Loader2, ExternalLink, Search, Flame } from "lucide-react";
import { useCart, CartItem as GlobalCartItem } from "@/context/CartContext";

// ─── Types ─────────────────────────────────────────────
type OrderType = "delivery" | "pickup" | "table";

interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    options: { spicy: string; addons: string[]; note: string };
}

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    categoryId: string;
    category?: { name: string };
    popular?: boolean;
    isRecommended?: boolean;
    sold?: number;
}

interface Category {
    id: string;
    name: string;
    order: number;
}

// ─── Mock Data ──────────────────────────────────────────
// (Mock data removed, now fetching from API)

function isStoreOpen(): boolean {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const mins = h * 60 + m;
    return mins >= 9 * 60 && mins < 17 * 60;
}

// ─── Add-ons Modal ──────────────────────────────────────
function AddonsModal({
    item,
    onClose,
    onAdd,
}: {
    item: MenuItem;
    onClose: () => void;
    onAdd: (item: MenuItem, options: CartItem["options"], qty: number) => void;
}) {
    const [spicy, setSpicy] = useState("กลาง");
    const [addons, setAddons] = useState<string[]>([]);
    const [note, setNote] = useState("");
    const [qty, setQty] = useState(1);

    const SPICY_OPTS = ["ไม่เผ็ด", "น้อย", "กลาง", "แซ่บมาก"];
    const ADDON_OPTS = [
        { label: "ไข่ดาว", price: 10 },
        { label: "ข้าวเพิ่ม", price: 15 },
    ];

    const totalAddonPrice = addons.reduce((s, a) => s + (ADDON_OPTS.find(o => o.label === a)?.price ?? 0), 0);
    const totalPrice = (item.price + totalAddonPrice) * qty;

    const toggleAddon = (label: string) =>
        setAddons(prev => prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label]);

    return (
        <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Sheet */}
            <div
                className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[92vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
                style={{ animation: "slideUp 0.25s ease-out" }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                {/* Hero image */}
                <div className="relative h-44 bg-gray-100 shrink-0">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                            <ShoppingBag className="h-16 w-16" />
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 h-8 w-8 bg-black/30 text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                        {item.description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.description}</p>}
                        <p className="text-xl font-bold text-orange-500 mt-2">฿{item.price}</p>
                    </div>

                    {/* Spicy level */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">ระดับความเผ็ด <span className="text-red-400 ml-1">*เลือก 1</span></p>
                        <div className="grid grid-cols-2 gap-2">
                            {SPICY_OPTS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setSpicy(opt)}
                                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${spicy === opt ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add-ons */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">เพิ่มเติม (ไม่บังคับ)</p>
                        <div className="space-y-2">
                            {ADDON_OPTS.map(opt => (
                                <label key={opt.label} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${addons.includes(opt.label) ? "border-orange-500 bg-orange-50" : "border-gray-100 hover:border-gray-200"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${addons.includes(opt.label) ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                                            {addons.includes(opt.label) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-orange-500">+฿{opt.price}</span>
                                    <input type="checkbox" className="sr-only" checked={addons.includes(opt.label)} onChange={() => toggleAddon(opt.label)} />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">บอกแม่ค้า (ถ้ามี)</p>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="เช่น ไม่ใส่ผักชี, ขอถุงแยก..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                    </div>
                </div>

                {/* Bottom action */}
                <div className="p-4 pb-6 border-t border-gray-100 shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-100 rounded-xl">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="h-11 w-11 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900">{qty}</span>
                            <button onClick={() => setQty(q => q + 1)} className="h-11 w-11 flex items-center justify-center text-orange-500 hover:text-orange-600 transition-colors">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <button
                            onClick={() => onAdd(item, { spicy, addons, note }, qty)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] transition-all text-white h-12 rounded-xl font-bold flex items-center justify-between px-5 shadow-md shadow-orange-200"
                        >
                            <span>ใส่ตะกร้า</span>
                            <span>฿{totalPrice.toLocaleString()}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function MenuPage({ params, searchParams }: {
    params: Promise<{ shop_slug: string }> | { shop_slug: string };
    searchParams: Promise<{ table?: string }> | { table?: string };
}) {
    // Robustly handle params (Next 14 vs 15)
    // @ts-ignore
    const { shop_slug } = params instanceof Promise ? use(params) : params;
    // @ts-ignore
    const { table } = searchParams instanceof Promise ? use(searchParams) : searchParams;

    const storeName = shop_slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const tableNumber = table ? parseInt(table as string) : null;

    const { cart, addToCart: addToCartCtx, cartTotal, cartCount } = useCart();

    const [orderType, setOrderType] = useState<OrderType>(tableNumber ? "table" : "delivery");
    const [activeCategory, setActiveCategory] = useState("");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [address, setAddress] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [aiRecommendations, setAiRecommendations] = useState<MenuItem[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [note, setNote] = useState(""); // Add missing note state if needed
    const [qty, setQty] = useState(1); // Add missing qty state if needed

    // Initial check on mount
    useEffect(() => {
        setMounted(true);
        setIsOpen(isStoreOpen());
    }, []);

    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const contentRef = useRef<HTMLDivElement>(null);

    // Fetch real data
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [catsRes, productsRes, settingsRes] = await Promise.all([
                    fetch(`/api/menu/${shop_slug}/categories`),
                    fetch(`/api/menu/${shop_slug}/products`),
                    fetch(`/api/menu/${shop_slug}/settings`)
                ]);
                const catsData = await catsRes.json();
                const productsData = await productsRes.json();
                const settingsData = await settingsRes.json();

                // Format price for decimal
                const formattedProducts = productsData.map((p: any) => ({
                    ...p,
                    price: parseFloat(p.price)
                }));

                setCategories(catsData);
                setMenuItems(formattedProducts);
                setSettings(settingsData);
                if (catsData.length > 0) setActiveCategory(catsData[0].id);

                // Update Order Type based on store settings
                if (settingsData) {
                    const canDelivery = settingsData.deliveryEnabled ?? true;
                    const canPickup = settingsData.pickupEnabled ?? true;

                    // If currently on table mode (from QR), keep it. 
                    // Otherwise, pick the first available method.
                    if (orderType !== "table") {
                        if (canDelivery) setOrderType("delivery");
                        else if (canPickup) setOrderType("pickup");
                    }
                }
            } catch (err) {
                console.error("Failed to fetch menu data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [shop_slug]);

    const addToCart = (item: MenuItem, options: GlobalCartItem["options"], qty: number) => {
        const addonPrice = options.addons.reduce((s, a) => {
            const found = [{ label: "ไข่ดาว", price: 10 }, { label: "ข้าวเพิ่ม", price: 15 }].find(o => o.label === a);
            return s + (found?.price ?? 0);
        }, 0);
        const key = `${item.id}-${options.spicy}-${options.addons.join(",")}`;

        addToCartCtx({
            id: key,
            productId: item.id,
            name: item.name,
            price: item.price + addonPrice,
            qty,
            options,
            imageUrl: item.imageUrl || undefined
        });
        setSelectedItem(null);
    };

    const scrollToCategory = (id: string) => {
        setActiveCategory(id);
        categoryRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Track scroll to update active category
    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const handler = () => {
            for (const cat of categories) {
                const ref = categoryRefs.current[cat.id];
                if (!ref) continue;
                const top = ref.getBoundingClientRect().top;
                if (top <= 160) setActiveCategory(cat.id);
            }
        };
        el.addEventListener("scroll", handler);
        return () => el.removeEventListener("scroll", handler);
    }, []);

    const filteredMenuItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const recommendedItems = menuItems.filter(m => m.isRecommended);

    const ORDER_TYPES: { id: OrderType; label: string; icon: React.ReactNode }[] = [
        { id: "delivery", label: "เดลิเวอรี่", icon: <Bike className="h-4 w-4" /> },
        { id: "pickup", label: "รับเอง", icon: <Store className="h-4 w-4" /> },
        { id: "table", label: "ทานที่ร้าน", icon: <Users className="h-4 w-4" /> },
    ];

    return (
        <>
            <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

            {/* Root wrapper — desktop centering */}
            <div className="min-h-screen bg-gray-100 lg:flex lg:justify-center">
                {/* Mobile frame */}
                <div className="w-full max-w-md lg:shadow-2xl bg-white flex flex-col min-h-screen relative">

                    {/* ── HERO BANNER ── */}
                    <div className="relative h-48 sm:h-56 bg-gray-900 overflow-hidden shrink-0">
                        {settings?.bannerUrl ? (
                            <img src={settings.bannerUrl} alt="Store Banner" className="w-full h-full object-cover opacity-80" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-600 to-orange-400 opacity-60 flex items-center justify-center">
                                <Store className="h-20 w-20 text-white/20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Store Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3 text-white">
                            <div className="h-16 w-16 rounded-2xl bg-white p-1 shadow-xl shrink-0">
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-white font-black text-2xl">
                                    {settings?.logoUrl ? <img src={settings.logoUrl} className="w-full h-full object-cover rounded-xl" /> : storeName.charAt(0)}
                                </div>
                            </div>
                            <div className="flex-1 pb-1">
                                <h1 className="text-xl font-black leading-tight drop-shadow-md">{storeName}</h1>
                                <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-0.5 line-clamp-1">
                                    {settings?.description || "ความอร่อยที่คุณออกแบบเองได้ ตลอด 24 ชม."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── STORE INFO & TABS ── */}
                    <header className="bg-white border-b border-gray-100 px-4 py-4">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${isOpen ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></span>
                                    {isOpen ? "OPEN NOW" : "CLOSED"}
                                </span>
                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 09:00 – 17:00</span>
                            </div>
                        </div>

                        {/* Order type tabs */}
                        <div className="flex bg-gray-100 p-1 rounded-2xl gap-0.5">
                            {ORDER_TYPES.filter(t => {
                                if (t.id === "delivery") return settings?.deliveryEnabled ?? true;
                                if (t.id === "pickup") return settings?.pickupEnabled ?? true;
                                return true;
                            }).map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setOrderType(t.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${orderType === t.id ? "bg-white text-orange-600 shadow-lg shadow-orange-100" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    {t.icon}
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="mt-4 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="ค้นหาเมนูที่คุณอยากทาน..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {/* Delivery address (shown only when delivery) */}
                        {orderType === "delivery" && (
                            <div className="mt-3 flex items-center gap-3 bg-orange-50/50 border border-orange-100/50 rounded-2xl px-4 py-3">
                                <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="เพิ่มพิกัดจัดส่งความอร่อย..."
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className="flex-1 bg-transparent text-sm font-semibold text-gray-700 placeholder-gray-400 outline-none"
                                />
                            </div>
                        )}
                        {/* Table info (shown when table mode) */}
                        {orderType === "table" && tableNumber && (
                            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-sm text-blue-700 font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 shrink-0" />
                                โต๊ะ {tableNumber}
                            </div>
                        )}
                    </header>

                    {/* ── CATEGORY BAR (Sticky) ── */}
                    <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
                        <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => scrollToCategory(cat.id)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat.id ? "bg-orange-500 text-white shadow-sm shadow-orange-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── MENU LIST ── */}
                    <div ref={contentRef} className="flex-1 overflow-y-auto pb-28 pt-2 scrollbar-hide">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
                                <p className="text-sm font-medium">กำลังโหลดความอร่อย...</p>
                            </div>
                        ) : (
                            <>
                                {/* Recommended Section */}
                                {recommendedItems.length > 0 && searchQuery === "" && (
                                    <section className="mt-6">
                                        <div className="px-4 flex items-center justify-between mb-3 text-orange-600">
                                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                                <Flame className="h-4 w-4" /> RECOMMENDED
                                            </h2>
                                        </div>
                                        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
                                            {recommendedItems.map(item => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setSelectedItem(item)}
                                                    className="w-40 shrink-0 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm active:scale-95 transition-all text-left"
                                                >
                                                    <div className="h-40 bg-gray-100 relative">
                                                        {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="text-orange-200" /></div>}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                        <span className="absolute bottom-2 left-2 font-black text-white text-base">฿{item.price}</span>
                                                    </div>
                                                    <div className="p-3">
                                                        <h3 className="text-xs font-black text-gray-900 line-clamp-1">{item.name}</h3>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">Highly Recommended</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <div className="px-4">
                                    {categories.map(cat => {
                                        const items = filteredMenuItems.filter(m => m.categoryId === cat.id);
                                        if (!items.length) return null;
                                        return (
                                            <div key={cat.id} ref={el => { categoryRefs.current[cat.id] = el; }} className="mt-6">
                                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                                                    {cat.name}
                                                    <span className="h-px flex-1 bg-gray-100"></span>
                                                </h2>
                                                <div className="grid gap-3">
                                                    {items.map(item => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => setSelectedItem(item)}
                                                            className="flex gap-4 bg-white rounded-3xl p-3 border border-gray-100 hover:border-orange-200 active:scale-[0.98] transition-all text-left w-full group shadow-sm hover:shadow-md"
                                                        >
                                                            {/* Image */}
                                                            <div className="h-28 w-28 rounded-2xl overflow-hidden shrink-0 bg-gray-100 relative">
                                                                {item.imageUrl ? (
                                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                                                                        <ShoppingBag className="h-10 w-10" />
                                                                    </div>
                                                                )}
                                                                {item.popular && (
                                                                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">HOT</div>
                                                                )}
                                                            </div>
                                                            {/* Info */}
                                                            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                                                <div>
                                                                    <h3 className="font-black text-gray-900 text-sm leading-tight group-hover:text-orange-600 transition-colors uppercase tracking-tight">{item.name}</h3>
                                                                    {item.description && <p className="text-xs font-semibold text-gray-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>}
                                                                </div>
                                                                <div className="flex items-end justify-between">
                                                                    <span className="font-black text-gray-900 text-lg tracking-tighter">฿{item.price}</span>
                                                                    <div className="h-10 w-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform">
                                                                        <Plus className="h-5 w-5" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {filteredMenuItems.length === 0 && searchQuery !== "" && (
                                        <div className="py-20 text-center">
                                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <p className="font-bold text-gray-500">ไม่พบเมนู "{searchQuery}"</p>
                                            <button onClick={() => setSearchQuery("")} className="text-orange-500 font-bold text-sm mt-2">ล้างการค้นหา</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Store Footer & Report */}
                        <div className="mt-12 mb-8 text-center pb-20">
                            <p className="text-xs text-gray-400 font-medium mb-3">Powered by Tamjai Pro</p>
                            <Link href={`/contact?shop=${shop_slug}&topic=complaint`} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> ร้องเรียนร้านค้านี้
                            </Link>
                        </div>
                    </div>

                    {/* ── FLOATING CART ── */}
                    {cartCount > 0 && (
                        <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto px-4 pb-5 z-40 pointer-events-none">
                            <Link
                                href={`/menu/${shop_slug}/checkout`}
                                className="pointer-events-auto w-full flex items-center justify-between bg-orange-500 hover:bg-orange-600 transition-colors text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-orange-300/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 h-9 w-9 rounded-xl flex items-center justify-center">
                                        <ShoppingBag className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold opacity-80 leading-none uppercase tracking-widest">ตะกร้าของคุณ</p>
                                        <p className="font-semibold text-sm mt-0.5 leading-none">{cartCount} รายการ</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] opacity-80 leading-none uppercase tracking-widest">ยอดรวม</p>
                                    <p className="font-bold text-base leading-none mt-0.5">฿{cartTotal.toLocaleString()}</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ── ADD-ONS MODAL ── */}
            {selectedItem && (
                <AddonsModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAdd={addToCart}
                />
            )}
        </>
    );
}
