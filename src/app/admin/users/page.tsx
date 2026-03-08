"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
    Users,
    UserPlus,
    ShieldCheck,
    Mail,
    MoreHorizontal,
    Lock,
    UserCheck
} from "lucide-react";

import { useState, useEffect } from "react";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    async function fetchUsers() {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAdmin)
            });

            if (res.ok) {
                setIsAddModalOpen(false);
                setNewAdmin({ name: "", email: "", password: "" });
                fetchUsers();
            } else {
                const errData = await res.json();
                setErrorMsg(errData.error || "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้");
            }
        } catch (error) {
            setErrorMsg("เกิดข้อผิดพลาดของระบบ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold">กำลังโหลดข้อมูลผู้ดูแลระบบ...</p>
            </div>
        );
    }

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
                        <Users className="h-8 w-8 text-brand-orange" />
                        ผู้ใช้งานระบบ (System Users)
                    </motion.h1>
                    <motion.p variants={itemVariants} className="mt-1 text-sm font-medium text-gray-500">
                        จัดการสิทธิ์การเข้าถึงของผู้ดูแลระบบส่วนกลาง (Platform Admins)
                    </motion.p>
                </div>
                <motion.div variants={itemVariants} className="flex gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5"
                    >
                        <UserPlus className="h-4 w-4" /> เพิ่มผู้ดูแลระบบ
                    </button>
                </motion.div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Users", value: users.length.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Super Admins", value: users.filter(u => u.role === 'SUPER_ADMIN').length.toString(), icon: ShieldCheck, color: "text-brand-orange", bg: "bg-orange-50" },
                    { label: "Active Now", value: users.length.toString(), icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Pending Invites", value: "0", icon: Mail, color: "text-amber-500", bg: "bg-amber-50" }
                ].map((stat, i) => (
                    <motion.div key={i} variants={itemVariants} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 mt-0.5">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={itemVariants} className="rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="text-lg font-black text-gray-900">รายการผู้ดูแลระบบ</h3>
                </div>
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                <th className="px-6 py-3 pb-4">โปรไฟล์ผู้ใช้</th>
                                <th className="px-6 py-3 pb-4">สิทธิ์การเข้าถึง (Role)</th>
                                <th className="px-6 py-3 pb-4">วันที่เข้าร่วม</th>
                                <th className="px-6 py-3 pb-4 text-right">เพิ่มเติม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={i} className="group transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-gray-500 font-black text-sm border border-gray-200">
                                                {u.name?.split(' ').map((n: string) => n[0]).join('') || "U"}
                                            </div>
                                            <div>
                                                <span className="block font-bold text-gray-900">{u.name || "Anonymous"}</span>
                                                <span className="text-xs font-bold text-gray-500">{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold border ${u.role === 'SUPER_ADMIN' ? 'bg-orange-50 text-brand-orange border-orange-100' :
                                            'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                            {u.role === 'SUPER_ADMIN' ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-medium text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 flex items-center justify-center rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-900 transition-all ml-auto">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Add Admin Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900">เพิ่มผู้ดูแลระบบส่วนกลาง</h3>
                            <p className="text-sm text-gray-500 font-medium">ระบุข้อมูลผู้ดูแลระบบคนใหม่ ระบบจะตั้งเป็น Super Admin อัตโนมัติ</p>
                        </div>
                        <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">ชื่อ-นามสกุล <span className="text-brand-orange">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={newAdmin.name}
                                    onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm font-medium focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">อีเมล (ล็อกอิน) <span className="text-brand-orange">*</span></label>
                                <input
                                    type="email"
                                    required
                                    value={newAdmin.email}
                                    onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm font-medium focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">รหัสผ่าน <span className="text-brand-orange">*</span></label>
                                <input
                                    type="password"
                                    required
                                    value={newAdmin.password}
                                    onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm font-medium focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                />
                            </div>

                            {errorMsg && (
                                <p className="text-sm text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl font-medium">{errorMsg}</p>
                            )}

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl font-bold bg-brand-orange hover:bg-orange-600 text-white shadow-md transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "กำลังบันทึก..." : "เพิ่มผู้ดูแลระบบ"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
