"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, Star, Clock, MapPin, X, Plus, Minus, ShoppingBag, Loader2, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, CartItem as GlobalCartItem } from "@/context/CartContext";

export default function StorefrontPage({ params, searchParams }: {
    params: Promise<{ storeDomain: string }>;
    searchParams: Promise<{ table?: string }>;
}) {
    const { storeDomain } = use(params);
    const { table } = use(searchParams);
    const router = useRouter();
    const { cart, addToCart: addToCartCtx, cartTotal, cartCount } = useCart();

    const [activeCategory, setActiveCategory] = useState("all");
    const [scrolled, setScrolled] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const storeName = storeDomain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [catsRes, productsRes] = await Promise.all([
                    fetch(`/api/menu/${storeDomain}/categories`),
                    fetch(`/api/menu/${storeDomain}/products`)
                ]);
                const catsData = await catsRes.json();
                const productsData = await productsRes.json();

                setCategories([{ id: "all", name: "ทั้งหมด" }, ...catsData]);
                setMenuItems(productsData.map((p: any) => ({
                    ...p,
                    price: parseFloat(p.price)
                })));
                if (catsData.length > 0) setActiveCategory("all");
            } catch (err) {
                console.error("Failed to fetch menu data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [storeDomain]);

    const handleAddToCart = () => {
        if (!selectedProduct) return;
        const options = { spicy: "กลาง", addons: [], note: "" };
        const cartItemId = `${selectedProduct.id}-${JSON.stringify(options)}`;
        addToCartCtx({
            id: cartItemId,
            productId: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            qty: 1,
            options: options,
            imageUrl: selectedProduct.imageUrl || ""
        });
        setSelectedProduct(null);
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            <p className="font-bold">กำลังเปิดร้าน...</p>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
            {/* Store Header / Cover */}
            <div className="relative h-56 bg-gray-900 overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-10"></div>
                {/* Placeholder Cover Image */}
                <div className="absolute inset-0 opacity-70 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 hover:scale-105"></div>

                {/* Top Nav (Back/Search) */}
                <div className="absolute top-0 inset-x-0 p-4 z-20 flex justify-between items-center">
                    <button className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors border border-white/10 shadow-sm">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div className="flex gap-2">
                        <button className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors border border-white/10 shadow-sm">
                            <Search className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Store Info Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-5 z-20">
                    <div className="flex gap-4 items-end">
                        <div className="h-24 w-24 rounded-[1.25rem] bg-white p-1 shadow-2xl shrink-0 translate-y-4">
                            <div className="h-full w-full rounded-xl bg-gradient-to-br from-brand-orange to-orange-500 flex items-center justify-center text-white font-black text-3xl shadow-inner">
                                {storeName.charAt(0)}
                            </div>
                        </div>
                        <div className="pb-1 text-white">
                            <h1 className="text-2xl font-black tracking-tight leading-loose mb-1 drop-shadow-lg">{storeName}</h1>
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-200">
                                <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> 4.8 (120 รีวิว)
                                </span>
                                <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                                    <Clock className="h-3 w-3" /> เปิด 10:00 - 22:00
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-gray-50 z-30 flex flex-col pt-6">

                {/* Info Bar */}
                <div className="flex items-center justify-between px-6 py-4 bg-white mx-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <MapPin className="h-4 w-4 text-brand-orange" />
                        <span className="truncate max-w-[200px]">ซอยเอกมัย 12, วัฒนา, กรุงเทพฯ</span>
                    </div>
                    <button className="text-brand-orange font-bold text-sm bg-orange-50 px-3 py-1.5 rounded-xl hover:bg-orange-100 transition-colors">
                        ดูแผนที่
                    </button>
                </div>

                {/* Categories (Sticky) */}
                <div className={`sticky top-0 z-40 bg-gray-50/90 backdrop-blur-xl py-3 transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
                    <div className="flex gap-2.5 overflow-x-auto px-5 scrollbar-hide pb-2 snap-x">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 snap-center relative ${activeCategory === cat.id
                                    ? "text-white shadow-md shadow-orange-500/20"
                                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"
                                    }`}
                            >
                                {activeCategory === cat.id && (
                                    <motion.div
                                        layoutId="category-background"
                                        className="absolute inset-0 bg-brand-orange rounded-full -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Items List */}
                <div className="p-4 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {categories.filter(c => activeCategory === 'all' || c.id === activeCategory).map(category => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="pt-2"
                            >
                                {activeCategory === 'all' && (
                                    <h2 className="text-lg font-black text-gray-900 mb-4 tracking-tight flex items-center gap-3 px-1">
                                        {category.name}
                                        <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
                                    </h2>
                                )}

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {menuItems.filter(item => activeCategory === 'all' ? item.category === category.id : activeCategory === 'all' || item.category === activeCategory).map((item) => (
                                        <motion.div
                                            layoutId={`product-${item.id}`}
                                            key={item.id}
                                            onClick={() => setSelectedProduct(item)}
                                            className="group flex gap-4 bg-white p-3 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer active:scale-[0.98] border border-gray-50"
                                        >
                                            {/* Image */}
                                            <div className="h-28 w-28 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                                                        <ShoppingBag className="h-10 w-10" />
                                                    </div>
                                                )}
                                                {item.popular && (
                                                    <div className="absolute top-0 right-0 bg-brand-orange text-white text-[9px] font-bold tracking-wider px-2 py-1 rounded-bl-lg">
                                                        ยอดฮิต
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
                                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
                                                </div>

                                                <div className="flex items-end justify-between mt-2">
                                                    <div className="flex flex-col">
                                                        {item.oldPrice && <span className="text-[10px] text-gray-400 line-through leading-none mb-0.5">฿{item.oldPrice}</span>}
                                                        <span className="font-bold text-gray-900 text-lg leading-none">฿{item.price}</span>
                                                    </div>
                                                    <button className="h-8 w-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white active:scale-95 transition-all duration-300">
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {menuItems.filter(i => activeCategory === 'all' ? i.category === category.id : true).length === 0 && (
                                        <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 col-span-full">
                                            <div className="text-4xl mb-3">🍽️</div>
                                            <div className="text-gray-400 font-bold">ไม่มีเมนูในหมวดหมู่นี้</div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Product Detail Modal (Bottom Sheet) */}
            <AnimatePresence>
                {selectedProduct && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
                        />
                        <motion.div
                            layoutId={`product-${selectedProduct.id}`}
                            className="fixed bottom-0 inset-x-0 bg-white rounded-t-[2rem] z-50 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            {/* Drag Handle */}
                            <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setSelectedProduct(null)}>
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                            </div>

                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
                                <div className="h-64 w-full bg-gray-100 overflow-hidden shrink-0 relative">
                                    {selectedProduct.imageUrl ? (
                                        <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200 text-4xl">
                                            <ShoppingBag className="h-24 w-24" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </div>
                                <div className="px-6 relative -mt-6">
                                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-50 relative z-10">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedProduct.name}</h2>
                                            <span className="text-2xl font-black text-brand-orange shrink-0">฿{selectedProduct.price}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed">{selectedProduct.description}</p>
                                    </div>
                                </div>

                                <div className="px-6 pt-6 pb-32">
                                    <div className="flex items-center gap-3 mb-6 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                        <div className="bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded-md">PROMO</div>
                                        <span className="text-brand-orange font-bold text-sm">รับคะแนนสะสม x2 เมื่อสั่งเมนูนี้</span>
                                    </div>

                                    {/* Mock Options (Upselling - Feature 5) */}
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-bold text-gray-900 text-lg">ระดับความเผ็ด</h3>
                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">เลือก 1</span>
                                            </div>
                                            <div className="space-y-3">
                                                {['ไม่พริกเลย', 'เผ็ดน้อย', 'เผ็ดปานกลาง', 'เผ็ดมาก (ตาเหลือก)'].map((level, i) => (
                                                    <label key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-orange transition-colors">
                                                        <span className="font-medium text-gray-700">{level}</span>
                                                        <div className="relative flex items-center justify-center">
                                                            <input type="radio" name="spicy" className="peer sr-only" defaultChecked={i === 2} />
                                                            <div className="h-5 w-5 rounded-full border-2 border-gray-300 peer-checked:border-brand-orange peer-checked:border-[6px] transition-all"></div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-bold text-gray-900 text-lg">เพิ่มท็อปปิ้ง (Add-ons)</h3>
                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">เลือกได้หลายรายการ</span>
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { name: 'ไข่เค็ม', price: 15 },
                                                    { name: 'หมูยอ', price: 20 },
                                                    { name: 'กุ้งสด', price: 40 }
                                                ].map((addon, i) => (
                                                    <label key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-orange transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative flex items-center justify-center">
                                                                <input type="checkbox" className="peer sr-only" />
                                                                <div className="h-5 w-5 rounded shadow-sm border border-gray-300 bg-white peer-checked:bg-brand-orange peer-checked:border-brand-orange transition-all"></div>
                                                                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                            <span className="font-medium text-gray-700">{addon.name}</span>
                                                        </div>
                                                        <span className="font-bold text-gray-900">+฿{addon.price}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-3">ความต้องการพิเศษ</h3>
                                            <textarea
                                                placeholder="เช่น ขอช้อนส้อม, ไม่ใส่ผักชี, แยกน้ำ..."
                                                className="w-full border border-gray-200 rounded-xl p-4 text-sm font-medium focus:border-brand-orange focus:ring-4 focus:ring-orange-50 outline-none transition-all resize-none min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Bottom Actions */}
                            <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                                        <button className="h-12 w-12 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                                            <Minus className="h-5 w-5" />
                                        </button>
                                        <span className="w-8 text-center font-black text-lg">1</span>
                                        <button className="h-12 w-12 flex items-center justify-center text-brand-orange hover:text-orange-600 transition-colors">
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-brand-orange text-white h-14 rounded-2xl font-black shadow-lg shadow-orange-500/30 flex items-center justify-between px-6 active:scale-[0.98] transition-all"
                                    >
                                        <span>ใส่ตะกร้า</span>
                                        <span>฿{selectedProduct.price}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence> {/* Closed AnimatePresence here */}

            {/* Floating Cart Button (Simplified for Unification) */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 inset-x-0 px-6 z-50 pointer-events-none">
                    <motion.button
                        onClick={() => router.push(`/menu/${storeDomain}/checkout`)}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-full max-w-md mx-auto h-16 bg-gray-900 rounded-3xl shadow-2xl flex items-center justify-between px-6 text-white pointer-events-auto active:scale-95 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center font-black">
                                {cartCount}
                            </div>
                            <span className="font-black">ตะกร้าของคุณ</span>
                        </div>
                        <span className="text-lg font-black text-orange-400">฿{cartTotal.toLocaleString()}</span>
                    </motion.button>
                </div>
            )}
        </div>
    );
}
