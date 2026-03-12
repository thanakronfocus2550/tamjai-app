"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Store,
    Search,
    Filter,
    Download,
    MoreVertical,
    Crown,
    Plus,
    X,
    Edit,
    Eye,
    Trash2
} from "lucide-react";
import { useState, useEffect } from "react";

export default function TenantsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"ALL" | "POS" | "PRO" | "FREE">("ALL");

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        plan: "FREE"
    });

    const [editFormData, setEditFormData] = useState({
        name: "",
        slug: "",
        plan: "FREE",
        isActive: true
    });

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingTenant, setViewingTenant] = useState<any>(null);
    const [rejectionTarget, setRejectionTarget] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/tenants");
            if (res.ok) {
                const data = await res.json();
                setTenants(data);
            }
        } catch (err) {
            console.error("Failed to fetch tenants:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTenant = async () => {
        if (!formData.name || !formData.slug || !formData.adminEmail || !formData.adminPassword) {
            alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/tenants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("เพิ่มร้านค้าสำเร็จ!");
                setIsAddModalOpen(false);
                setFormData({
                    name: "",
                    slug: "",
                    adminName: "",
                    adminEmail: "",
                    adminPassword: "",
                    plan: "FREE"
                });
                fetchTenants();
            } else {
                const err = await res.json();
                alert("เกิดข้อผิดพลาด: " + err.error);
            }
        } catch (err) {
            alert("Failed to add tenant");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (tenant: any) => {
        setEditingTenant(tenant);
        setEditFormData({
            name: tenant.name,
            slug: tenant.slug,
            plan: tenant.package,
            isActive: tenant.status === "Active"
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateTenant = async () => {
        if (!editFormData.name || !editFormData.slug) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/tenants/${editingTenant.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData)
            });

            if (res.ok) {
                alert("อัปเดตข้อมูลสำเร็จ!");
                setIsEditModalOpen(false);
                fetchTenants();
            } else {
                const err = await res.json();
                alert("เกิดข้อผิดพลาด: " + err.error);
            }
        } catch (err) {
            alert("Failed to update tenant");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.owner.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === "ALL") return matchesSearch;
        return matchesSearch && t.package === activeTab;
    });

    const handleManage = (slug: string) => {
        // Redirect to the tenant's internal settings or dashboard
        window.open(`/menu/${slug}/admin/settings`, '_blank');
    };

    const handleApprove = async (tenant: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: true })
            });

            if (res.ok) {
                alert(`อนุมัติร้าน ${tenant.name} ให้ใช้งานเรียบร้อยแล้ว!`);
                fetchTenants();
            } else {
                const err = await res.json();
                alert("เกิดข้อผิดพลาด: " + err.error);
            }
        } catch (err) {
            alert("Failed to approve tenant");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (tenant: any) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้า "${tenant.name}"?\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                alert(`ลบร้าน ${tenant.name} เรียบร้อยแล้ว!`);
                fetchTenants();
            } else {
                const err = await res.json();
                alert("เกิดข้อผิดพลาด: " + err.error);
            }
        } catch (err) {
            alert("Failed to delete tenant");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionTarget) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/tenants/${rejectionTarget.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                alert(`ปฏิเสธการลงทะเบียนร้าน ${rejectionTarget.name} แล้ว (เหตุผล: ${rejectionReason || 'ไม่ระบุ'})`);
                setRejectionTarget(null);
                setRejectionReason("");
                fetchTenants();
            } else {
                const err = await res.json();
                alert("เกิดข้อผิดพลาด: " + err.error);
            }
        } catch (err) {
            alert("Failed to reject tenant");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFilter = () => {
        alert("กรองตามสถานะและแพ็กเกจ เร็วๆ นี้");
    };

    const handleExport = () => {
        alert("ระบบกำลังสร้างไฟล์สำหรับเจ้าของร้าน... กรุณารอสักครู่");
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 pb-12"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <motion.h1 variants={itemVariants} className="text-3xl font-black tracking-tight text-gray-900 inline-flex items-center gap-3">
                        <Store className="h-8 w-8 text-brand-orange" />
                        จัดการร้านค้า (Tenants)
                    </motion.h1>
                    <motion.p variants={itemVariants} className="mt-1 text-sm font-medium text-gray-500">
                        ดูและจัดการข้อมูลของลูกค้าที่เช่าระบบทั้งหมด
                    </motion.p>
                </div>
                <motion.div variants={itemVariants} className="flex gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5"
                    >
                        <Plus className="h-4 w-4" /> เพิ่มร้านค้า (Manual)
                    </button>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center shrink-0">
                        <Store className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400">ร้านค้าทั้งหมด</p>
                        <p className="text-3xl font-black text-gray-900">{tenants.length}</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center shrink-0">
                        <Crown className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400">แพ็กเกจ PRO / POS</p>
                        <p className="text-3xl font-black text-gray-900">{tenants.filter(t => t.package === 'PRO' || t.package === 'POS').length}</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                        <Store className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400">กำลังทดลองใช้</p>
                        <p className="text-3xl font-black text-gray-900">{tenants.filter(t => t.package === 'FREE').length}</p>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อร้านค้า หรือ ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-brand-orange focus:ring-2 focus:ring-orange-50"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setActiveTab("ALL")}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors shadow-sm ${activeTab === 'ALL' ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            ทั้งหมด
                        </button>
                        <button
                            onClick={() => setActiveTab("PRO")}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors shadow-sm ${activeTab === 'PRO' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Crown className="h-4 w-4" /> PRO
                        </button>
                        <button
                            onClick={() => setActiveTab("POS")}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors shadow-sm ${activeTab === 'POS' ? 'bg-orange-50 border-brand-orange text-brand-orange' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Store className="h-4 w-4" /> POS
                        </button>
                        <button
                            onClick={() => setActiveTab("FREE")}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors shadow-sm ${activeTab === 'FREE' ? 'bg-amber-50 border-amber-500 text-amber-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Store className="h-4 w-4" /> FREE
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Download className="h-4 w-4" /> Export
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-6 py-3 font-black">ข้อมูลร้านค้า</th>
                                <th className="px-6 py-3 font-black">เจ้าของร้าน</th>
                                <th className="px-6 py-3 font-black">สถานะ / แพ็กเกจ</th>
                                <th className="px-6 py-3 font-black">วันที่เข้าร่วม</th>
                                <th className="px-6 py-3 text-right font-black">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenants.map((t, i) => (
                                <tr key={i} className="group transition-colors bg-white hover:bg-gray-50 shadow-sm border border-transparent hover:border-gray-200 rounded-2xl">
                                    <td className="px-6 py-4 rounded-l-2xl border-b border-t border-l border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <span className="block font-bold text-gray-900">{t.name}</span>
                                        <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-1">
                                            <Store className="h-3 w-3" /> ID: {t.id.slice(-6)}
                                            <span className="text-blue-500 underline ml-2">({t.slug})</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 border-b border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{t.owner}</span>
                                            <span className="text-[10px] font-bold text-gray-400 mt-0.5">{t.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-b border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <div className="flex flex-col gap-1 w-full relative">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase border w-max ${t.package === 'POS' ? 'bg-orange-50 text-brand-orange border-orange-100' : t.package === 'PRO' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {(t.package === 'PRO' || t.package === 'POS') && <Crown className="h-3 w-3" />}
                                                    {t.package}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 sm:static sm:translate-y-0">
                                                    หมดอายุ: {new Date(new Date(t.joined).getTime() + (t.package === 'PRO' ? 365 : 7) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`h-2 w-2 rounded-full ${t.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                <span className={`text-[10px] font-bold ${t.status === 'Active' ? 'text-emerald-700' : 'text-red-700'}`}>{t.status}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-b border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <span className="text-sm font-medium text-gray-500">{new Date(t.joined).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4 rounded-r-2xl text-right border-b border-t border-r border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setViewingTenant(t);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all text-[10px] font-black uppercase shadow-sm active:scale-95"
                                            >
                                                ดูข้อมูล
                                            </button>
                                            {t.status === 'Inactive' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(t)}
                                                        disabled={isSubmitting}
                                                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black uppercase shadow-sm active:scale-95 disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectionTarget(t)}
                                                        disabled={isSubmitting}
                                                        className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase shadow-sm active:scale-95 disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleEditClick(t)}
                                                className="px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all text-[10px] font-black uppercase shadow-sm active:scale-95"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleManage(t.slug)}
                                                className="px-3 py-1.5 rounded-xl bg-orange-50 text-brand-orange hover:bg-brand-orange hover:text-white transition-all text-[10px] font-black uppercase shadow-sm active:scale-95"
                                            >
                                                Manage
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t)}
                                                disabled={isSubmitting}
                                                className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase shadow-sm active:scale-95 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-gray-900">เพิ่มร้านค้าใหม่ (Manual)</h3>
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="h-6 w-6 text-gray-400" />
                                    </button>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">ชื่อร้านค้า (Store Name)</label>
                                            <input
                                                type="text"
                                                placeholder="เช่น ร้านอาหารบ้านนา"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">Slug (ชื่อภาษาอังกฤษ)</label>
                                            <input
                                                type="text"
                                                placeholder="เช่น banna-shop"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">แพ็กเกจ</label>
                                            <select
                                                value={formData.plan}
                                                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all"
                                            >
                                                <option value="FREE">Free Trial</option>
                                                <option value="PRO">Tamjai Pro</option>
                                                <option value="POS">Tamjai POS</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">ชื่อเจ้าของร้าน</label>
                                            <input
                                                type="text"
                                                placeholder="ชื่อ-นามสกุล"
                                                value={formData.adminName}
                                                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">อีเมลแอดมิน</label>
                                            <input
                                                type="email"
                                                placeholder="example@email.com"
                                                value={formData.adminEmail}
                                                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">รหัสผ่านแอดมิน</label>
                                            <input
                                                type="password"
                                                placeholder="********"
                                                value={formData.adminPassword}
                                                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 rounded-2xl border border-gray-200 py-4 text-sm font-black text-gray-500 hover:bg-gray-50 transition-all"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        disabled={isSubmitting}
                                        onClick={handleAddTenant}
                                        className="flex-3 rounded-2xl bg-brand-orange py-4 text-sm font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? "กำลังสร้าง..." : "สร้างร้านค้าทันที"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isViewModalOpen && viewingTenant && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsViewModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-gray-900">ข้อมูลผู้สมัครเปิดร้าน</h3>
                                    <button
                                        onClick={() => setIsViewModalOpen(false)}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="h-6 w-6 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">ชื่อ-นามสกุลผู้สมัคร</p>
                                        <p className="font-bold text-gray-900 text-lg">{viewingTenant.owner}</p>
                                    </div>
                                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">อีเมลติดต่อ</p>
                                        <p className="font-bold text-gray-900">{viewingTenant.email}</p>
                                    </div>
                                    <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-1">POS PIN (รหัสพนักงาน)</p>
                                        <p className="font-black text-brand-orange text-xl tracking-[0.2em]">{viewingTenant.posPin}</p>
                                    </div>
                                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">ชื่อร้านค้า</p>
                                        <p className="font-bold text-gray-900">{viewingTenant.name}</p>
                                    </div>
                                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Store URL (โดเมน)</p>
                                        <p className="font-bold text-brand-orange">tamjai.pro/menu/{viewingTenant.slug}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">วันที่สมัคร</p>
                                            <p className="font-bold text-gray-900 text-sm">{new Date(viewingTenant.joined).toLocaleDateString()}</p>
                                        </div>
                                        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">แพ็กเกจที่เลือก</p>
                                            <p className="font-bold text-gray-900 text-sm">{viewingTenant.package}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => setIsViewModalOpen(false)}
                                        className="flex-1 rounded-2xl border border-gray-200 py-4 text-sm font-black text-gray-500 hover:bg-gray-50 transition-all font-inter"
                                    >
                                        ปิด
                                    </button>
                                    {viewingTenant.status === 'Inactive' && (
                                        <button
                                            onClick={() => {
                                                setIsViewModalOpen(false);
                                                handleApprove(viewingTenant);
                                            }}
                                            disabled={isSubmitting}
                                            className="flex-1 rounded-2xl bg-emerald-500 py-4 text-sm font-black text-white hover:bg-emerald-600 transition-all font-inter shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                                        >
                                            อนุมัติทันที
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900">แก้ไขข้อมูลร้านค้า</h2>
                                        <p className="text-sm text-gray-500 font-medium">ID: {editingTenant?.id}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-gray-400 ml-1">ชื่อร้านค้า (Store Name)</label>
                                        <input
                                            type="text"
                                            value={editFormData.name}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-brand-orange focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-gray-400 ml-1">Store Slug (Domain)</label>
                                        <input
                                            type="text"
                                            value={editFormData.slug}
                                            onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-brand-orange focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-gray-400 ml-1">Subscription Plan</label>
                                        <select
                                            value={editFormData.plan}
                                            onChange={(e) => setEditFormData({ ...editFormData, plan: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-brand-orange focus:bg-white transition-all appearance-none"
                                        >
                                            <option value="FREE">FREE Trial</option>
                                            <option value="PRO">PRO Member</option>
                                            <option value="POS">POS Member (NEW)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-gray-400 ml-1">สถานะร้านค้า (Status)</label>
                                        <div className="flex items-center gap-4 py-3">
                                            <button
                                                onClick={() => setEditFormData({ ...editFormData, isActive: true })}
                                                className={`flex-1 py-1 px-4 rounded-xl border text-[10px] font-black uppercase transition-all ${editFormData.isActive ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                            >
                                                Active
                                            </button>
                                            <button
                                                onClick={() => setEditFormData({ ...editFormData, isActive: false })}
                                                className={`flex-1 py-1 px-4 rounded-xl border text-[10px] font-black uppercase transition-all ${!editFormData.isActive ? 'bg-red-50 border-red-500 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                            >
                                                Inactive
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 rounded-2xl border border-gray-200 py-4 text-sm font-black uppercase text-gray-600 hover:bg-gray-50 transition-all font-inter"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleUpdateTenant}
                                        disabled={isSubmitting}
                                        className="flex-[2] rounded-2xl bg-gray-900 py-4 text-sm font-black uppercase text-white hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
                                    >
                                        {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {rejectionTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRejectionTarget(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-gray-900">ปฏิเสธการลงทะเบียน</h3>
                                    <button
                                        onClick={() => setRejectionTarget(null)}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="h-6 w-6 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-sm font-bold text-gray-500">
                                        ยืนยันการปฏิเสธการลงทะเบียนของร้าน <span className="text-gray-900">{rejectionTarget.name}</span>?
                                    </p>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">เหตุผลในการปฏิเสธ (Optional)</label>
                                        <textarea
                                            placeholder="เช่น เอกสารไม่ครบถ้วน, ข้อมูลไม่ถูกต้อง..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full h-32 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-200 focus:bg-white transition-all underline-none resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => setRejectionTarget(null)}
                                        className="flex-1 rounded-2xl border border-gray-200 py-4 text-sm font-black text-gray-500 hover:bg-gray-50 transition-all font-inter"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={isSubmitting}
                                        className="flex-1 rounded-2xl bg-red-500 py-4 text-sm font-black text-white hover:bg-red-600 transition-all font-inter shadow-lg shadow-red-500/30 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "กำลังดำเนินรายการ..." : "ยืนยันการปฏิเสธ"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
