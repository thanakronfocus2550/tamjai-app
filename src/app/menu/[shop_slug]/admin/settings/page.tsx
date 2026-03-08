"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { Save, Bell, Clock, MapPin, Phone, Globe, CreditCard, Palette, ChevronRight } from "lucide-react";

export default function StoreSettingsPage({ params }: { params: Promise<{ shop_slug: string }> }) {
    const { shop_slug } = use(params);
    const storeName = shop_slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const [form, setForm] = useState({
        name: storeName,
        phone: "081-234-5678",
        address: "ซอยเอกมัย 12 วัฒนา กรุงเทพฯ",
        openTime: "09:00",
        closeTime: "17:00",
        lineToken: "",
        deliveryEnabled: true,
        pickupEnabled: true,
        isOpen: true,
        bankName: "กสิกรไทย (KBank)",
        bankAccount: "012-3-45678-9",
    });

    const [saved, setSaved] = useState(false);

    const save = () => {
        // In production: PUT /api/stores/[shop_slug]
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="p-4 space-y-4 max-w-md mx-auto">

            {/* Theme Settings Link */}
            <Link href={`/menu/${shop_slug}/admin/settings/theme`} className="block bg-gradient-to-r from-orange-500 to-brand-orange rounded-2xl p-4 text-white shadow-lg shadow-orange-200 hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Palette className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">ปรับแต่ง ธีมร้านค้า</h3>
                            <p className="text-xs text-white/80 mt-0.5">เปลี่ยนสีหลัก และอัปโหลดโลโก้ร้าน</p>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/70" />
                </div>
            </Link>

            {/* Store info */}
            <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-500" /> ข้อมูลร้าน
                </h3>
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">ชื่อร้าน</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">เบอร์โทร</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">ที่อยู่ร้าน</label>
                    <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                </div>
            </section>

            {/* Opening hours */}
            <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" /> เวลาทำการ
                </h3>
                <div className="flex gap-3 items-center">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 block mb-1">เปิด</label>
                        <input type="time" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                    </div>
                    <span className="text-gray-400 mt-4">—</span>
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 block mb-1">ปิด</label>
                        <input type="time" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                    </div>
                </div>

                {/* Open/Close toggle */}
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">สถานะร้าน</p>
                        <p className="text-xs text-gray-500">{form.isOpen ? "ลูกค้าสามารถสั่งได้ตอนนี้" : "ปิดรับออเดอร์ชั่วคราว"}</p>
                    </div>
                    <button onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
                        className={"relative h-7 w-12 rounded-full transition-colors " + (form.isOpen ? "bg-emerald-500" : "bg-gray-300")}
                    >
                        <span className={"absolute top-0.5 h-6 w-6 bg-white rounded-full shadow-sm transition-all " + (form.isOpen ? "left-5" : "left-0.5")} />
                    </button>
                </div>
            </section>

            {/* Order types */}
            <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-500" /> ประเภทออเดอร์ที่รับ
                </h3>
                {([
                    { key: "deliveryEnabled" as const, label: "รับเดลิเวอรี่", desc: "ลูกค้าสั่งแล้วส่งถึงที่" },
                    { key: "pickupEnabled" as const, label: "รับการรับเองที่ร้าน", desc: "ลูกค้ามารับเองที่ร้าน" },
                ]).map(opt => (
                    <div key={opt.key} className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.desc}</p>
                        </div>
                        <button onClick={() => setForm({ ...form, [opt.key]: !form[opt.key] })}
                            className={"relative h-7 w-12 rounded-full transition-colors " + (form[opt.key] ? "bg-orange-500" : "bg-gray-300")}
                        >
                            <span className={"absolute top-0.5 h-6 w-6 bg-white rounded-full shadow-sm transition-all " + (form[opt.key] ? "left-5" : "left-0.5")} />
                        </button>
                    </div>
                ))}
            </section>

            {/* Bank Account */}
            <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-500" /> บัญชีรับเงิน (สำหรับโอน)
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">ข้อมูลนี้จะแสดงให้ลูกค้าเห็นเพื่อโอนเงินชำระค่าอาหาร</p>
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">ธนาคาร / พร้อมเพย์</label>
                    <select
                        value={form.bankName}
                        onChange={e => setForm({ ...form, bankName: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium appearance-none bg-white"
                        style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem top 50%", backgroundSize: "0.65rem auto" }}
                    >
                        <option value="กสิกรไทย (KBank)">กสิกรไทย (KBank)</option>
                        <option value="ไทยพาณิชย์ (SCB)">ไทยพาณิชย์ (SCB)</option>
                        <option value="กรุงเทพ (BBL)">กรุงเทพ (BBL)</option>
                        <option value="กรุงไทย (KTB)">กรุงไทย (KTB)</option>
                        <option value="กรุงศรีอยุธยา (BAY)">กรุงศรีอยุธยา (BAY)</option>
                        <option value="ทหารไทยธนชาต (TTB)">ทหารไทยธนชาต (TTB)</option>
                        <option value="ออมสิน (GSB)">ออมสิน (GSB)</option>
                        <option value="พร้อมเพย์ (PromptPay)">พร้อมเพย์ (PromptPay)</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">เลขบัญชี / เบอร์พร้อมเพย์</label>
                    <input
                        type="text"
                        placeholder="เช่น 012-3-45678-9 หรือ 0812345678"
                        value={form.bankAccount}
                        onChange={e => setForm({ ...form, bankAccount: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                    />
                </div>
            </section>

            {/* LINE Notify */}
            <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4 text-green-500" /> LINE Notify Token
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">รับการแจ้งเตือนออเดอร์ใหม่เข้ากลุ่ม LINE ของร้านทันที</p>
                <input
                    type="password" placeholder="วาง Token ที่ได้จาก notify-bot.line.me ที่นี่"
                    value={form.lineToken} onChange={e => setForm({ ...form, lineToken: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-mono"
                />
                <a href="https://notify-bot.line.me" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-orange-500 font-semibold hover:underline">
                    วิธีสร้าง LINE Notify Token →
                </a>
            </section>

            {/* Store URL */}
            <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-900 mb-1">URL หน้าร้านของคุณ</p>
                <p className="font-mono text-sm text-black font-black break-all py-2">tamjai.pro/menu/{shop_slug}</p>
                <p className="text-xs text-gray-500 mt-1">แชร์ลิงก์นี้ หรือสร้าง QR Code ให้ลูกค้าสแกน</p>
            </section>

            {/* Save button */}
            <button onClick={save}
                className={"w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] " + (saved ? "bg-emerald-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200")}
            >
                {saved ? <><Save className="h-5 w-5" /> บันทึกแล้ว!</> : <><Save className="h-5 w-5" /> บันทึกการตั้งค่า</>}
            </button>
        </div>
    );
}
