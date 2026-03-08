"use client";

import React, { useState, useEffect, use } from "react";
import { Plus, Pencil, Eye, EyeOff, X, Check, ChevronDown, Trash2, Loader2, Save } from "lucide-react";

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

    const [newItem, setNewItem] = useState({ name: "", price: "", categoryId: "", imageUrl: "" });
    const [newCategoryName, setNewCategoryName] = useState("");

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

    const saveEdit = async (id: string, name: string, price: number) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, name, price } : i));
        setEditingId(null);

        try {
            await fetch(`/api/menu/${shop_slug}/products/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ name, price })
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
                setNewItem({ name: "", price: "", categoryId: categories[0]?.id || "", imageUrl: "" });
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
                                onSave={(n, p) => saveEdit(item.id, n, p)}
                                onCancel={() => setEditingId(null)} />
                        ) : (
                            <div className="flex items-center gap-3 p-2.5">
                                <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                    <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"} alt={item.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 py-0.5">
                                    <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{item.name}</p>
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
        </div>
    );
}

function EditInline({ item, onSave, onCancel }: { item: MenuItem; onSave: (n: string, p: number) => void; onCancel: () => void }) {
    const [name, setName] = useState(item.name);
    const [price, setPrice] = useState(item.price.toString());
    return (
        <div className="p-3 space-y-2">
            <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-orange-400" />
            <div className="flex gap-2">
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="ราคา"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-orange-400" />
                <button onClick={() => onSave(name, +price)}
                    className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600">
                    <Check className="h-4 w-4" />
                </button>
                <button onClick={onCancel}
                    className="h-10 w-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center hover:bg-gray-200">
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
