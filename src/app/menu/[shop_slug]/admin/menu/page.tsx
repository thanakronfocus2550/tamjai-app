"use client";

import React, { useState, useEffect, use } from "react";
import { Plus, Pencil, Eye, EyeOff, X, Check, ChevronDown, Trash2, Loader2, Save, Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Addon {
    name: string;
    price: number;
}

interface Category {
    id: string;
    name: string;
    order: number;
}

interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    isAvailable: boolean;
    imageUrl?: string;
    addons: Addon[];
}

export default function MenuManagePage({ params }: { params: Promise<{ shop_slug: string }> }) {
    const { shop_slug } = use(params);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedAddons, setExpandedAddons] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showCategoryMgr, setShowCategoryMgr] = useState(false);

    const [newItem, setNewItem] = useState({ name: "", price: "", categoryId: "", imageUrl: "", description: "" });
    const [isGenerating, setIsGenerating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    // Onboarding States
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [onboardingItems, setOnboardingItems] = useState<any[]>([]);
    const [onboardingStep, setOnboardingStep] = useState<'upload' | 'review'>('upload');
    const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, prodRes] = await Promise.all([
                fetch(`/api/menu/${shop_slug}/categories`),
                fetch(`/api/menu/${shop_slug}/products`)
            ]);

            if (catRes.ok && prodRes.ok) {
                const cats = await catRes.json();
                const prods = await prodRes.json();
                setCategories(cats);
                setItems(prods.map((p: any) => ({
                    ...p,
                    price: Number(p.price),
                    addons: Array.isArray(p.addons) ? p.addons : []
                })));

                if (cats.length > 0 && !newItem.categoryId) {
                    setNewItem(prev => ({ ...prev, categoryId: cats[0].id }));
                }
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [shop_slug]);

    const toggleAvailable = async (item: MenuItem) => {
        const newStatus = !item.isAvailable;
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isAvailable: newStatus } : i));

        try {
            await fetch(`/api/menu/${shop_slug}/products/${item.id}`, {
                method: "PATCH",
                body: JSON.stringify({ isAvailable: newStatus })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const saveEdit = async (id: string, name: string, price: number, description?: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, name, price, description } : i));
        setEditingId(null);

        try {
            await fetch(`/api/menu/${shop_slug}/products/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ name, price, description })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const updateAddons = async (itemId: string, newAddons: Addon[]) => {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, addons: newAddons } : i));

        try {
            await fetch(`/api/menu/${shop_slug}/products/${itemId}`, {
                method: "PATCH",
                body: JSON.stringify({ addons: newAddons })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleOnboarding = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsOnboarding(true);
        setShowOnboarding(true);
        setOnboardingStep('upload');

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const res = await fetch("/api/ai/onboard-menu", {
                    method: "POST",
                    body: JSON.stringify({ image: base64 })
                });
                if (res.ok) {
                    const data = await res.json();
                    setOnboardingItems(data.items);
                    setOnboardingStep('review');
                } else {
                    const err = await res.json();
                    alert("ไม่สามารถสแกนเมนูได้: " + (err.message || "Unknown error"));
                    setShowOnboarding(false);
                }
                setIsOnboarding(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error(err);
            setIsOnboarding(false);
            setShowOnboarding(false);
        }
    };

    const saveOnboarding = async () => {
        setIsSavingOnboarding(true);
        try {
            const catsToCreate = Array.from(new Set(onboardingItems.map(i => i.category)));
            const catMap: Record<string, string> = {};

            for (const catName of catsToCreate) {
                let existingCat = categories.find(c => c.name === catName);
                if (!existingCat) {
                    const res = await fetch(`/api/menu/${shop_slug}/categories`, {
                        method: "POST",
                        body: JSON.stringify({ name: catName, order: categories.length })
                    });
                    if (res.ok) {
                        const newCat = await res.json();
                        existingCat = newCat;
                    }
                }
                if (existingCat) {
                    catMap[catName] = existingCat.id;
                }
            }

            for (const item of onboardingItems) {
                const categoryId = catMap[item.category] || categories[0]?.id;
                if (!categoryId) continue;

                await fetch(`/api/menu/${shop_slug}/products`, {
                    method: "POST",
                    body: JSON.stringify({
                        name: item.name,
                        price: Number(item.price),
                        description: item.description,
                        categoryId,
                        isAvailable: true,
                        addons: []
                    })
                });
            }

            await fetchData();
            setShowOnboarding(false);
            setOnboardingItems([]);
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setIsSavingOnboarding(false);
        }
    };

    const generateDescription = async (name: string, categoryId: string, target: 'new' | 'edit') => {
        if (!name) {
            alert("กรุณาระบุชื่อเมนูก่อนค่ะ");
            return;
        }
        setIsGenerating(true);
        try {
            const cat = categories.find(c => c.id === categoryId)?.name || "";
            const res = await fetch("/api/ai/generate-menu", {
                method: "POST",
                body: JSON.stringify({ name, category: cat })
            });
            if (res.ok) {
                const data = await res.json();
                if (target === 'new') {
                    setNewItem(prev => ({ ...prev, description: data.description }));
                } else {
                    return data.description;
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const addItem = async () => {
        if (!newItem.name || !newItem.price || !newItem.categoryId) return;

        try {
            const res = await fetch(`/api/menu/${shop_slug}/products`, {
                method: "POST",
                body: JSON.stringify({
                    ...newItem,
                    price: Number(newItem.price),
                    isAvailable: true,
                    addons: []
                })
            });

            if (res.ok) {
                fetchData();
                setNewItem({ name: "", price: "", categoryId: categories[0]?.id || "", imageUrl: "", description: "" });
                setShowAdd(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const addCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const res = await fetch(`/api/menu/${shop_slug}/categories`, {
                method: "POST",
                body: JSON.stringify({ name: newCategoryName, order: categories.length })
            });
            if (res.ok) {
                setNewCategoryName("");
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteCategory = async (id: string) => {
        if (!confirm("ลบหมวดหมู่หรือไม่? รายการในหมวดนี้อาจได้รับผลกระทบ")) return;
        try {
            const res = await fetch(`/api/menu/${shop_slug}/categories/${id}`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("ลบเมนูนี้หรือไม่?")) return;
        try {
            const res = await fetch(`/api/menu/${shop_slug}/products/${id}`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="font-medium">กำลังโหลดข้อมูล...</p>
        </div>
    );

    const available = items.filter(i => i.isAvailable).length;
    const hidden = items.filter(i => !i.isAvailable).length;

    return (
        <div className="p-4 space-y-4 max-w-md mx-auto pb-24">

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-gray-900">จัดการเมนู</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        <span className="text-emerald-600 font-semibold">{available} แสดง</span>
                        {hidden > 0 && <span className="text-gray-400"> · {hidden} ซ่อน</span>}
                    </p>
                </div>
                <div className="flex gap-2">
                    <label className="cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleOnboarding} className="hidden" />
                        <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all">
                            <Sparkles className="h-3 w-3" /> AI Onboarding
                        </div>
                    </label>
                    <button onClick={() => setShowCategoryMgr(!showCategoryMgr)}
                        className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all border ${showCategoryMgr ? "bg-purple-50 border-purple-200 text-purple-600" : "bg-white border-gray-200 text-gray-500"}`}>
                        <ChevronDown className={`h-5 w-5 transition-transform ${showCategoryMgr ? "rotate-180" : ""}`} />
                    </button>
                    <button onClick={() => setShowAdd(true)}
                        className="flex items-center gap-1.5 bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-600 active:scale-95 transition-all">
                        <Plus className="h-4 w-4" /> เพิ่มเมนู
                    </button>
                </div>
            </div>

            {/* Category Manager */}
            {showCategoryMgr && (
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 space-y-3">
                    <p className="font-bold text-purple-900 text-sm flex items-center gap-2">หมวดหมู่ทั้งหมด</p>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-purple-100">
                                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                <button onClick={() => deleteCategory(cat.id)} className="text-gray-300 hover:text-red-500 p-1">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" placeholder="ชื่อหมวดหมู่ใหม่..." value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && addCategory()}
                            className="flex-1 bg-white border border-purple-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                        <button onClick={addCategory} className="bg-purple-500 text-white px-3 rounded-xl hover:bg-purple-600">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Add form */}
            {showAdd && (
                <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-800 text-sm">เพิ่มเมนูใหม่</p>
                        <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <input type="text" placeholder="ชื่อเมนู *" value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400" />
                    <div className="flex gap-2">
                        <input type="number" placeholder="ราคา *" value={newItem.price}
                            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-orange-400" />
                        <select value={newItem.categoryId} onChange={e => setNewItem({ ...newItem, categoryId: e.target.value })}
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-orange-400">
                            <option value="" disabled>เลือกหมวดหมู่</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5 mt-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-gray-400">คำอธิบาย</label>
                            <button
                                onClick={() => generateDescription(newItem.name, newItem.categoryId, 'new')}
                                disabled={isGenerating || !newItem.name}
                                className="text-[10px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg transition-all disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : "✨ ใช้ AI แต่งคำอธิบาย"}
                            </button>
                        </div>
                        <textarea
                            placeholder="บรรยายเมนูนี้ให้น่าสนใจ..."
                            value={newItem.description}
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            rows={2}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-orange-400 resize-none bg-gray-50/50"
                        />
                    </div>

                    <input type="url" placeholder="URL รูปภาพ (ไม่บังคับ)" value={newItem.imageUrl}
                        onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400" />

                    <button onClick={addItem}
                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
                        บันทึก
                    </button>
                </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
                {items.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">ยังไม่มีรายการอาหารในเมนู</p>
                    </div>
                )}

                {items.map(item => (
                    <div key={item.id} className={"bg-white rounded-2xl border overflow-hidden transition-all " + (item.isAvailable ? "border-gray-100" : "border-gray-100 opacity-55")}>

                        {/* Main row */}
                        {editingId === item.id ? (
                            <EditInline item={item}
                                onSave={(n, p, d) => saveEdit(item.id, n, p, d)}
                                onCancel={() => setEditingId(null)} />
                        ) : (
                            <div className="flex items-center gap-3 p-2.5">
                                <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                    <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"} alt={item.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 py-0.5">
                                    <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{item.name}</p>
                                    <p className="text-[10px] text-gray-400 line-clamp-1 italic">{item.description || "ไม่มีคำอธิบาย"}</p>
                                    <p className="text-xs text-gray-500">{categories.find(c => c.id === item.categoryId)?.name || "ไม่ระบุหมวด"}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="font-bold text-orange-500 text-sm">{"฿" + item.price}</p>
                                        {item.addons.length > 0 && (
                                            <span className="text-[10px] bg-purple-50 text-purple-600 font-semibold px-1.5 py-0.5 rounded-md">
                                                {item.addons.length} ตัวเลือก
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button onClick={() => setExpandedAddons(expandedAddons === item.id ? null : item.id)}
                                        className={"h-9 w-9 rounded-xl flex items-center justify-center transition-colors " + (expandedAddons === item.id ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                                        title="ตัวเลือกเพิ่มเติม">
                                        <ChevronDown className={"h-4 w-4 transition-transform " + (expandedAddons === item.id ? "rotate-180" : "")} />
                                    </button>
                                    <button onClick={() => toggleAvailable(item)}
                                        className={"h-9 w-9 rounded-xl flex items-center justify-center transition-colors " + (item.isAvailable ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200")}
                                        title={item.isAvailable ? "ซ่อน" : "แสดง"}>
                                        {item.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                    <button onClick={() => setEditingId(item.id)}
                                        className="h-9 w-9 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center hover:bg-orange-100 transition-colors"
                                        title="แก้ไข">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => deleteProduct(item.id)}
                                        className="h-9 w-9 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                                        title="ลบ">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add-ons section */}
                        {expandedAddons === item.id && (
                            <AddonsPanel
                                itemId={item.id}
                                addons={item.addons}
                                onUpdate={(newAddons) => updateAddons(item.id, newAddons)}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* AI Onboarding Modal */}
            <AnimatePresence>
                {showOnboarding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-indigo-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 leading-tight">AI Menu Onboarding</h3>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">สร้างเมนูอัตโนมัติจากรูปภาพ</p>
                                    </div>
                                </div>
                                <button onClick={() => !isSavingOnboarding && setShowOnboarding(false)} className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {isOnboarding ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <div className="relative">
                                            <div className="h-20 w-20 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                                                <ImageIcon className="h-8 w-8" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900">กำลังสกัดข้อมูลจากรูปภาพ...</p>
                                            <p className="text-sm font-bold text-gray-400">น้องตามใจกำลังอ่านชื่อเมนูและราคาให้ค่ะ</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-black text-gray-500">พบทั้งหมด {onboardingItems.length} รายการ</p>
                                            <p className="text-[10px] font-black text-orange-400 underline">ตรวจสอบความถูกต้องก่อนบันทึก</p>
                                        </div>

                                        <div className="space-y-2">
                                            {onboardingItems.map((item, idx) => (
                                                <div key={idx} className="p-4 rounded-3xl border border-gray-100 bg-gray-50/50 flex flex-col gap-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-black text-gray-900 text-sm">{item.name}</p>
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => {
                                                                const newItems = [...onboardingItems];
                                                                newItems[idx].price = e.target.value;
                                                                setOnboardingItems(newItems);
                                                            }}
                                                            className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-black text-orange-500 text-right"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">{item.category}</span>
                                                        <p className="text-[10px] text-gray-400 font-bold truncate">{item.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isOnboarding && onboardingItems.length > 0 && (
                                <div className="p-6 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={saveOnboarding}
                                        disabled={isSavingOnboarding}
                                        className="w-full bg-indigo-600 text-white py-4 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSavingOnboarding ? (
                                            <><Loader2 className="h-5 w-5 animate-spin" /> กำลังบันทึก...</>
                                        ) : (
                                            <><Save className="h-5 w-5" /> บันทึกทั้งหมด ({onboardingItems.length} รายการ)</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EditInline({ item, onSave, onCancel }: { item: MenuItem; onSave: (n: string, p: number, d?: string) => void; onCancel: () => void }) {
    const [name, setName] = useState(item.name);
    const [price, setPrice] = useState(item.price.toString());
    const [description, setDescription] = useState(item.description || "");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/ai/generate-menu", {
                method: "POST",
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                const data = await res.json();
                setDescription(data.description);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="p-3 space-y-2 bg-orange-50/30">
            <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-orange-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-orange-400" />

            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-gray-400">คำอธิบาย</span>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !name}
                        className="text-[10px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 px-1 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : "✨ ใช้ AI แต่งคำ"}
                    </button>
                </div>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-orange-100 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-orange-400 resize-none bg-white/80"
                />
            </div>

            <div className="flex gap-2">
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="ราคา"
                    className="flex-1 border border-orange-100 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-orange-400" />
                <button onClick={() => onSave(name, +price, description)}
                    className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600">
                    <Check className="h-4 w-4" />
                </button>
                <button onClick={onCancel}
                    className="h-10 w-10 bg-white border border-gray-200 text-gray-400 rounded-xl flex items-center justify-center hover:bg-gray-100">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function AddonsPanel({ itemId, addons, onUpdate }: {
    itemId: string;
    addons: Addon[];
    onUpdate: (addons: Addon[]) => void;
}) {
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");

    const handleAdd = () => {
        if (!newName.trim()) return;
        onUpdate([...addons, { name: newName.trim(), price: +newPrice || 0 }]);
        setNewName("");
        setNewPrice("");
    };

    const handleRemove = (idx: number) => {
        onUpdate(addons.filter((_, i) => i !== idx));
    };

    return (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3 space-y-2">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">ตัวเลือกเพิ่มเติม (ไม่บังคับ)</p>

            {addons.length === 0 && (
                <p className="text-xs text-gray-400 italic">ยังไม่มีตัวเลือก — เพิ่มได้ด้านล่าง</p>
            )}

            {/* Existing addons */}
            <div className="space-y-1">
                {addons.map((a, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                        <span className="text-sm text-gray-800 font-medium">{a.name}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-orange-500">{a.price > 0 ? "+" + a.price : "ฟรี"}</span>
                            <button onClick={() => handleRemove(idx)}
                                className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add new addon */}
            <div className="flex gap-2">
                <input
                    type="text" placeholder="ชื่อตัวเลือก เช่น ไข่ดาว" value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAdd()}
                    className="flex-1 border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400"
                />
                <input
                    type="number" placeholder="+฿" value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAdd()}
                    className="w-16 border border-gray-200 bg-white rounded-xl px-2 py-2 text-sm text-gray-800 focus:outline-none focus:border-purple-400"
                />
                <button onClick={handleAdd}
                    className="h-9 w-9 bg-purple-500 text-white rounded-xl flex items-center justify-center hover:bg-purple-600 transition-colors shrink-0">
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
