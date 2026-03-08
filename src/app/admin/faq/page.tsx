"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HelpCircle,
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    ToggleLeft,
    ToggleRight,
    ChevronDown,
    Loader2,
} from "lucide-react";

interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
}

const EMPTY: Omit<FaqItem, "id"> = {
    question: "",
    answer: "",
    category: "General",
    order: 0,
    isActive: true,
};

export default function AdminFaqPage() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Omit<FaqItem, "id">>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/faq");
            const data = await res.json();
            setFaqs(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY);
        setShowForm(true);
    };

    const openEdit = (faq: FaqItem) => {
        setEditingId(faq.id);
        setForm({ question: faq.question, answer: faq.answer, category: faq.category, order: faq.order, isActive: faq.isActive });
        setShowForm(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingId) {
                await fetch(`/api/admin/faq/${editingId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
            } else {
                await fetch("/api/admin/faq", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
            }
            setShowForm(false);
            fetchFaqs();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("ลบคำถามนี้?")) return;
        await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
        fetchFaqs();
    };

    const handleToggle = async (faq: FaqItem) => {
        await fetch(`/api/admin/faq/${faq.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !faq.isActive }),
        });
        fetchFaqs();
    };

    return (
        <div className="space-y-6 pb-16">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">จัดการ FAQ</h1>
                    <p className="mt-1 text-sm font-medium text-gray-500">คำถามที่แสดงบนเว็บหลัก tamjai.pro</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 rounded-2xl bg-brand-orange px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-600 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="h-4 w-4" /> เพิ่มคำถาม
                </button>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-gray-900">
                                    {editingId ? "แก้ไขคำถาม" : "เพิ่มคำถามใหม่"}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">หมวดหมู่</label>
                                        <input
                                            value={form.category}
                                            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm font-medium outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-50 transition-all"
                                            placeholder="เช่น ระบบ, การชำระเงิน"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ลำดับ</label>
                                        <input
                                            type="number"
                                            value={form.order}
                                            onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm font-medium outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">คำถาม *</label>
                                    <input
                                        value={form.question}
                                        onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm font-medium outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-50 transition-all"
                                        placeholder="ถามอะไรบ่อยๆ?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">คำตอบ *</label>
                                    <textarea
                                        rows={5}
                                        value={form.answer}
                                        onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm font-medium outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-50 transition-all resize-none"
                                        placeholder="ตอบให้ชัดเจน..."
                                    />
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div
                                        onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-brand-orange" : "bg-gray-300"}`}
                                    >
                                        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${form.isActive ? "left-7" : "left-1"}`} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{form.isActive ? "แสดงบนหน้าเว็บ" : "ซ่อน (ไม่แสดง)"}</span>
                                </label>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !form.question || !form.answer}
                                    className="flex-1 rounded-2xl bg-brand-orange py-3 text-sm font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {editingId ? "บันทึกการแก้ไข" : "เพิ่มคำถาม"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAQ List */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                </div>
            ) : faqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center rounded-[2rem] bg-white border border-gray-100">
                    <HelpCircle className="h-12 w-12 text-gray-200 mb-4" />
                    <p className="font-bold text-gray-400">ยังไม่มีคำถาม</p>
                    <p className="text-sm text-gray-400 mt-1">คลิก "เพิ่มคำถาม" เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {faqs.map(faq => (
                        <div key={faq.id} className={`rounded-[1.5rem] bg-white border transition-all ${faq.isActive ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
                            <button
                                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                className="w-full flex items-center gap-4 px-6 py-4 text-left"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange bg-orange-50 px-2 py-0.5 rounded-full">{faq.category}</span>
                                        <span className="text-[10px] font-bold text-gray-400">#{faq.order}</span>
                                        {!faq.isActive && <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">ซ่อน</span>}
                                    </div>
                                    <p className="font-bold text-gray-900">{faq.question}</p>
                                </div>
                                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform shrink-0 ${expandedId === faq.id ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {expandedId === faq.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-4 border-t border-gray-100">
                                            <p className="text-sm text-gray-600 font-medium leading-relaxed py-4">{faq.answer}</p>
                                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleToggle(faq)}
                                                    className="flex items-center gap-1.5 text-sm font-bold transition-colors text-gray-500 hover:text-brand-orange"
                                                >
                                                    {faq.isActive ? <ToggleRight className="h-4 w-4 text-brand-orange" /> : <ToggleLeft className="h-4 w-4" />}
                                                    {faq.isActive ? "แสดงอยู่" : "ซ่อน"}
                                                </button>
                                                <button
                                                    onClick={() => openEdit(faq)}
                                                    className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-brand-orange transition-colors ml-4"
                                                >
                                                    <Pencil className="h-4 w-4" /> แก้ไข
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faq.id)}
                                                    className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors ml-4"
                                                >
                                                    <Trash2 className="h-4 w-4" /> ลบ
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
