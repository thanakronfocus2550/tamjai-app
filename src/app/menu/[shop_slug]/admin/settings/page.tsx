"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { Save, Bell, Clock, MapPin, Phone, Globe, CreditCard, Palette, ChevronRight, MessageCircle, ExternalLink, CheckCircle2 } from "lucide-react";

export default function StoreSettingsPage({ params }: { params: Promise<{ shop_slug: string }> }) {
    const { shop_slug } = use(params);

    const [isLoading, setIsLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
        openTime: "09:00",
        closeTime: "17:00",
        isOpen: true,
        bankName: "กสิกรไทย (KBank)",
        bankAccount: "",
        deliveryEnabled: true,
        pickupEnabled: true,
        lineUserId: "",
        description: "",
        bannerUrl: "",
        promptPayQrUrl: "",
        socialLinks: { facebook: "", instagram: "", tiktok: "" },
        weeklyHolidays: [] as number[],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/menu/${shop_slug}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setForm({
                        name: data.name || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        openTime: data.openTime || "09:00",
                        closeTime: data.closeTime || "17:00",
                        isOpen: data.isOpen ?? true,
                        bankName: data.bankName || "กสิกรไทย (KBank)",
                        bankAccount: data.bankAccount || "",
                        deliveryEnabled: data.deliveryEnabled ?? true,
                        pickupEnabled: data.pickupEnabled ?? true,
                        lineUserId: data.lineUserId || "",
                        description: data.description || "",
                        bannerUrl: data.bannerUrl || "",
                        promptPayQrUrl: data.promptPayQrUrl || "",
                        socialLinks: data.socialLinks || { facebook: "", instagram: "", tiktok: "" },
                        weeklyHolidays: data.weeklyHolidays || [],
                    });
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [shop_slug]);

    const save = async () => {
        try {
            const res = await fetch(`/api/menu/${shop_slug}/settings`, {
                method: "PUT",
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการบันทึก");
        }
    };

    const connectLine = () => {
        // Mock LINE connection for now
        // In reality, this would open a LIFF or LINE Login URL
        const mockLineId = "U" + Math.random().toString(36).substring(2, 12).toUpperCase();
        setForm({ ...form, lineUserId: mockLineId });
        alert("เชื่อมต่อ LINE สำเร็จ! (Mock)");
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-bold">กำลังโหลดข้อมูล...</div>;

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
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">คำอธิบายร้าน / ประกาศ (Bio)</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                        placeholder="เช่น ร้านส้มตำรสเด็ดแซ่บสะท้านทรวง เปิดให้บริการแล้ว!"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                </div>
            </section>

            {/* Social Links */}
            <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-orange-500" /> โซเชียลมีเดีย
                </h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Facebook URL</label>
                        <input value={form.socialLinks.facebook} onChange={e => setForm({ ...form, socialLinks: { ...form.socialLinks, facebook: e.target.value } })}
                            placeholder="https://facebook.com/your-store"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Instagram URL</label>
                        <input value={form.socialLinks.instagram} onChange={e => setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })}
                            placeholder="https://instagram.com/your-store"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">TikTok URL</label>
                        <input value={form.socialLinks.tiktok} onChange={e => setForm({ ...form, socialLinks: { ...form.socialLinks, tiktok: e.target.value } })}
                            placeholder="https://tiktok.com/@your-store"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-all" />
                    </div>
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

                <hr className="border-gray-50" />
                <div>
                    <p className="font-semibold text-gray-900 text-sm mb-2">วันหยุดประจำสัปดาห์</p>
                    <div className="flex flex-wrap gap-2">
                        {["จัน", "อัง", "พุธ", "พฤ", "ศุก", "สอ", "อา"].map((day, i) => {
                            const dayIndex = (i + 1) % 7; // Adjust to match your expected 1=Mon, 0=Sun logic or similar
                            const isHoliday = form.weeklyHolidays.includes(dayIndex);
                            return (
                                <button
                                    key={day}
                                    onClick={() => {
                                        const newHolidays = isHoliday
                                            ? form.weeklyHolidays.filter(h => h !== dayIndex)
                                            : [...form.weeklyHolidays, dayIndex];
                                        setForm({ ...form, weeklyHolidays: newHolidays });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isHoliday ? "bg-red-500 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Media Settings */}
            <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Save className="h-4 w-4 text-indigo-500" /> สื่อและไฟล์ภาพ
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-2">รูปภาพหน้าปก (Store Banner)</label>
                        <div className="relative h-32 w-full rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group">
                            {form.bannerUrl ? (
                                <>
                                    <img src={form.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => setForm({ ...form, bannerUrl: "" })} className="text-white text-xs font-bold bg-red-500 px-3 py-1 rounded-full">ลบรูปภาพ</button>
                                    </div>
                                </>
                            ) : (
                                <button className="text-xs font-bold text-gray-400">+ อัปโหลดรูปหน้าปก</button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-2">QR Code พร้อมเพย์</label>
                        <div className="relative h-48 w-48 mx-auto rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group">
                            {form.promptPayQrUrl ? (
                                <>
                                    <img src={form.promptPayQrUrl} alt="PromptPay QR" className="h-full w-full object-contain p-2" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => setForm({ ...form, promptPayQrUrl: "" })} className="text-white text-xs font-bold bg-red-500 px-3 py-1 rounded-full">ลบรูปภาพ</button>
                                    </div>
                                </>
                            ) : (
                                <button className="text-xs font-bold text-gray-400">+ อัปโหลด QR Code</button>
                            )}
                        </div>
                    </div>
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

            {/* LINE Smart Notification */}
            <section className="bg-white border border-emerald-100 rounded-2xl p-4 space-y-4 shadow-sm shadow-emerald-50">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-emerald-500" /> LINE Smart Notification
                    </h3>
                    {form.lineUserId ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> เชื่อมต่อแล้ว
                        </span>
                    ) : (
                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                            ยังไม่ได้เชื่อมต่อ
                        </span>
                    )}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                    แจ้งเตือนออเดอร์ใหม่ผ่าน LINE พร้อมแสดงรายละเอียดออเดอร์และการ์ดสรุปยอดที่อ่านง่าย
                </p>

                {form.lineUserId ? (
                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">LINE USER ID</p>
                        <p className="text-xs font-mono text-emerald-700 font-bold truncate">{form.lineUserId}</p>
                        <button
                            onClick={() => setForm({ ...form, lineUserId: "" })}
                            className="text-[10px] text-red-400 font-bold mt-2 hover:underline"
                        >
                            ยกเลิกการเชื่อมต่อ
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={connectLine}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100"
                    >
                        <MessageCircle className="h-4 w-4" /> เชื่อมต่อ LINE รับออเดอร์
                    </button>
                )}

                <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Bell className="h-3 w-3" /> วิธีการเปิดใช้งาน:
                    </p>
                    <ol className="text-[10px] text-gray-500 list-decimal ml-4 mt-1 space-y-0.5 font-medium">
                        <li>กดปุ่ม "เชื่อมต่อ LINE" ด้านบน</li>
                        <li>เพิ่มเพื่อน LINE OA ของ Tamjai Pro</li>
                        <li>คุณจะได้รับแจ้งเตือนออเดอร์ทันทีเมื่อมีลูกค้าสั่งอาหาร</li>
                    </ol>
                </div>
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
