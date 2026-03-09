"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowRight,
  Smartphone,
  TrendingUp,
  CheckCircle2,
  Store,
  QrCode,
  Settings2,
  MenuSquare,
  Clock,
  ShieldCheck,
  Check,
  ArrowLeft,
  Search,
  ShoppingBag,
  Globe,
  X,
  Gift
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import FloatingMascot from "@/components/FloatingMascot";

const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const STATIC_FAQS = [
  { id: "1", question: "Tamjai Pro คืออะไร?", answer: "Tamjai Pro เป็นแพลตฟอร์ม SaaS สำหรับร้านอาหารและเครื่องดื่ม ช่วยให้ร้านค้าสามารถรับออเดอร์ผ่าน QR Code ออนไลน์ได้ทันที ไม่ต้องพัฒนาแอปพลิเคชันเอง" },
  { id: "2", question: "สมัครใช้งานอย่างไร?", answer: "คลิก 'ทดลองใช้ฟรี 7 วัน' กรอกข้อมูลร้านค้า ตั้งชื่อ URL แล้วเลือกแพ็กเกจ ระบบจะเปิดหน้าร้านให้คุณภายใน 5-10 นาที" },
  { id: "3", question: "ราคาค่าบริการเท่าไหร่?", answer: "แพ็กเกจ Pro ราคา 450 บาทต่อเดือน ซึ่งรวมทุกฟีเจอร์ ไม่จำกัดจำนวนเมนูและพนักงาน มีทดลองใช้ฟรี 7 วัน (10 ร้านแรก)" },
  { id: "4", question: "ยกเลิกได้ตลอดเวลาหรือเปล่า?", answer: "ได้เลยครับ ไม่มีสัญญาผูกมัด ยกเลิกได้ทุกเมื่อ และไม่มีค่าปรับใดๆ" },
  { id: "5", question: "ออเดอร์แจ้งเตือนอย่างไร?", answer: "เมื่อมีออเดอร์ใหม่เข้า ระบบจะแจ้งเตือนผ่านเสียงและ Browser Notification บนหน้า Admin ของร้านคุณแบบ Real-time ไม่พลาดแน่นอน" },
  { id: "6", question: "รองรับ Custom Domain ไหม?", answer: "รองรับครับ! คุณสามารถนำโดเมนของคุณเองมาใช้ได้ เช่น order.yourrestaurant.com โดยติดต่อทีมงานเพื่อตั้งค่า" },
];

function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState(STATIC_FAQS);

  // Try to load from API, fall back to static if fails
  useEffect(() => {
    fetch("/api/faq")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setFaqs(data); })
      .catch(() => { });
  }, []);

  return (
    <section id="faq" className="py-24 lg:py-32 bg-white border-t border-gray-100 scroll-mt-20">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeIn} className="mb-4 inline-flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest">
            FAQ
          </motion.div>
          <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
            คำถามที่<span className="text-brand-orange">พบบ่อย</span>
          </motion.h2>
          <motion.p variants={fadeIn} className="text-lg text-gray-500">
            มีข้อสงสัยอะไรเพิ่มเติม ติดต่อทีมงานได้ตลอด 24 ชม.
          </motion.p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openId === faq.id
                ? "border-brand-orange/30 bg-orange-50/30 shadow-sm"
                : "border-gray-100 bg-white hover:border-gray-200"
                }`}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className={`font-bold text-base transition-colors ${openId === faq.id ? "text-brand-orange" : "text-gray-900"
                  }`}>
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openId === faq.id ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`text-2xl font-light shrink-0 ml-4 leading-none ${openId === faq.id ? "text-brand-orange" : "text-gray-300"
                    }`}
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-gray-600 font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Default Promo Config (In real app, fetch from superadmin API)
const PROMO_CONFIG = {
  enabled: true,
  imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800", // Placeholder poster image
  title: "โปรโมชั่นพิเศษ ลด 50%", // Optional if image says it all
  buttonText: "กดรับสิทธิ์เลย",
  buttonLink: "/register",
};

// PromotionalPopup component
interface PromoProps {
  show: boolean;
  onClose: () => void;
  onDismiss: () => void;
  config: typeof PROMO_CONFIG;
}

const PromotionalPopup = ({ show, onClose, onDismiss, config }: PromoProps) => {
  if (!config.enabled) return null; // Don't render if disabled

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 md:p-8"
          onClick={onClose} // Clicking backdrop closes popup temporarily
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking modal
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 transition-colors p-2 rounded-full backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Poster Image */}
            <div className="w-full relative bg-gray-100 aspect-[4/5] sm:aspect-square flex-shrink-0">
              {config.imageUrl ? (
                <img
                  src={config.imageUrl}
                  alt={config.title || "Promotion Popup"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <Gift className="h-16 w-16 mb-4 opacity-50" />
                  <p>No Image Provided</p>
                </div>
              )}
            </div>

            {/* Optional Title & Action Area */}
            <div className="p-6 md:p-8 bg-white text-center">
              {config.title && (
                <h3 className="text-xl font-black text-gray-900 mb-4 truncate">
                  {config.title}
                </h3>
              )}
              {config.buttonText && config.buttonLink && (
                <Link
                  href={config.buttonLink}
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 active:scale-95 transition-all"
                >
                  {config.buttonText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <button onClick={onDismiss} className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest inline-block border-b border-transparent hover:border-gray-400 transition-all pb-0.5">
                ไม่สนใจ, ไม่แสดงอีก
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const { data: session } = useSession();

  // Check 24hr local storage for promo
  useEffect(() => {
    if (typeof window !== "undefined" && PROMO_CONFIG.enabled) {
      const hideUntil = localStorage.getItem("hidePromoUntil");
      if (!hideUntil || new Date().getTime() > parseInt(hideUntil)) {
        // Show popup shortly after load
        const timer = setTimeout(() => setShowPromo(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const closePromo = () => {
    setShowPromo(false);
    // Does NOT set localStorage, will show again on refresh
  };

  const dismissPromo = () => {
    setShowPromo(false);
    // Hide for 24 hours
    const hideTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem("hidePromoUntil", hideTime.toString());
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] font-sans text-gray-900 selection:bg-brand-orange/20 selection:text-brand-orange overflow-x-hidden relative">
      <FloatingMascot shopSlug="superadmin" />
      <PromotionalPopup show={showPromo} onClose={closePromo} onDismiss={dismissPromo} config={PROMO_CONFIG} />

      {/* Abstract Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 z-50 flex w-full flex-col md:flex-row md:items-center justify-between border-b border-gray-200/50 bg-white/80 px-6 py-4 backdrop-blur-xl md:px-12 transition-all shadow-sm"
      >
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-orange-50 shadow-sm border border-orange-100">
              <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
            </div>
            <span className="text-2xl font-black tracking-tighter">Tamjai<span className="text-brand-orange">Pro</span></span>
          </div>
          <button
            className="md:hidden p-2 rounded-lg bg-gray-50 text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <MenuSquare className="h-6 w-6" />
          </button>
        </div>

        <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mt-6 md:mt-0 pb-4 md:pb-0 w-full md:w-auto`}>
          {["Solutions", "Pro Features", "Reviews", "Pricing", "FAQ"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-gray-500 hover:text-brand-orange transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              {item}
            </Link>
          ))}
          <Link href="/contact" className="text-sm font-bold text-gray-500 hover:text-brand-orange transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 items-center">
            <Link href="/track" className="flex items-center justify-center text-xs font-bold text-gray-400 hover:text-brand-orange transition-colors">เช็คสถานะ / ต่ออายุ</Link>
            <Link
              href="/register"
              className="group relative inline-flex w-full md:w-auto items-center justify-center overflow-hidden rounded-full bg-brand-orange px-6 py-2.5 font-bold text-white shadow-xl shadow-orange-500/20 transition-transform hover:-translate-y-0.5 hover:shadow-orange-500/40 active:scale-95 border border-orange-500"
            >
              <span className="relative z-10 flex items-center gap-2 text-sm drop-shadow-sm">
                ทดลองใช้ฟรี 7 วัน <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      <main className="flex-1 pt-24 relative z-10">
        {/* Hero Section */}
        <section className="relative px-6 pt-12 pb-24 md:px-12 md:pt-32 md:pb-40 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] max-w-[1200px] h-[600px] bg-gradient-to-b from-brand-orange/10 via-orange-50/50 to-transparent blur-[120px] -z-10 rounded-b-full"></div>

          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="relative z-10 text-center lg:text-left pt-10 md:pt-0"
              >
                <motion.div variants={fadeIn} className="mb-8 mx-auto lg:mx-0 inline-flex items-center gap-3 rounded-full border border-orange-200/50 bg-white/60 px-5 py-2 text-xs font-black uppercase tracking-widest text-brand-orange backdrop-blur-md shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-orange"></span>
                  </span>
                  The Future of Food Business
                </motion.div>

                <motion.h1 variants={fadeIn} className="mb-8 text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gray-900 leading-[1.1]">
                  Transform Your<br />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-orange-400">Restaurant</span>
                  </span>
                </motion.h1>

                <motion.p variants={fadeIn} className="mb-10 text-lg md:text-xl font-medium leading-relaxed text-gray-500 max-w-xl mx-auto lg:mx-0">
                  ระบบสั่งอาหารออนไลน์ที่เปลี่ยนร้านอาหารธรรมดา ให้เป็นเครื่องจักรรับออเดอร์อัตโนมัติ <br className="hidden md:block" />
                  <span className="text-brand-orange font-bold text-sm uppercase tracking-widest mt-2 block">โครงการนำร่อง: จำกัดเพียง 10 ร้านค้าแรกเท่านั้น</span>
                </motion.p>

                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start">
                  <Link
                    href="/register"
                    className="group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-full bg-brand-orange px-10 py-5 text-lg font-black text-white shadow-[0_0_40px_-10px_rgba(255,107,0,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_0_60px_-15px_rgba(255,107,0,0.6)]"
                  >
                    <span>เริ่มต้นใช้งานฟรี</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="#solutions"
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-md px-10 py-5 text-lg font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300"
                  >
                    ดูโซลูชันของเรา
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
                className="relative mt-8 lg:mt-0 max-w-md mx-auto lg:max-w-none w-full"
              >
                <div className="relative rounded-[2.5rem] bg-white/80 p-3 shadow-2xl ring-1 ring-gray-900/5 rotate-0 lg:rotate-2 hover:rotate-0 transition-transform duration-700 ease-out z-10 backdrop-blur-xl">
                  <div className="relative aspect-[3/4] sm:aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#F8F9FA] border border-gray-100/50 shadow-inner">
                    <div className="flex items-center justify-between border-b border-gray-200/50 bg-white/90 px-5 py-4 backdrop-blur-md">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                        <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                        <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                      </div>
                      <div className="flex gap-2 items-center px-4 py-1.5 bg-gray-100/50 rounded-full">
                        <Globe className="h-3 w-3 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400">tamjai.pro/your-store</span>
                      </div>
                    </div>
                    <div className="p-6 h-full flex flex-col gap-6">
                      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="space-y-2 w-1/2">
                          <div className="h-4 w-full bg-gray-200 rounded-lg"></div>
                          <div className="h-3 w-2/3 bg-gray-100 rounded-lg"></div>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-brand-orange to-orange-400 flex items-center justify-center shadow-lg shadow-orange-100 text-white font-black text-xs">LOGO</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="h-28 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-5 flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute right-0 top-0 w-16 h-16 bg-gradient-to-br from-green-50 to-green-100/50 rounded-bl-full"></div>
                          <div className="h-3 w-16 bg-green-100 rounded-full mb-2"></div>
                          <div className="h-7 w-24 bg-gray-900 rounded-lg relative z-10"></div>
                        </motion.div>
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 0.5, ease: "easeInOut" }} className="h-28 bg-gradient-to-br from-brand-orange to-orange-500 rounded-2xl shadow-xl shadow-orange-200 p-5 flex flex-col justify-between text-white relative overflow-hidden">
                          <div className="absolute right-0 top-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
                          <div className="h-3 w-20 bg-white/30 rounded-full mb-2"></div>
                          <div className="h-7 w-16 bg-white rounded-lg relative z-10"></div>
                        </motion.div>
                      </div>
                      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-brand-orange"></div>
                        <div className="p-5 flex gap-4 items-center h-full">
                          <div className="h-14 w-14 bg-gray-100 rounded-xl group-hover:scale-105 transition-transform"></div>
                          <div className="space-y-3 flex-1">
                            <div className="h-4 w-3/4 bg-gray-200 rounded-md"></div>
                            <div className="h-3 w-1/2 bg-gray-100 rounded-md"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Notification Badge */}
                <motion.div
                  initial={{ y: 20, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 15 }}
                  className="absolute -right-4 md:-right-10 top-20 z-20 flex items-center gap-4 rounded-[2rem] bg-white p-4 pr-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-gray-900/5 hidden sm:flex"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-emerald-50 text-emerald-500 relative">
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                    </span>
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Order Received</p>
                    <p className="font-black text-gray-900 text-lg">฿ 850.00</p>
                  </div>
                </motion.div>

                {/* Floating Customer Review */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: -20, y: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.5, type: "spring" }}
                  className="absolute -left-4 md:-left-16 bottom-10 z-20 bg-white/90 backdrop-blur-xl border border-gray-100 p-5 rounded-[2rem] max-w-[280px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] ring-1 ring-gray-900/5 hidden sm:block"
                >
                  <div className="flex gap-1 text-amber-400 mb-2">★ ★ ★ ★ ★</div>
                  <p className="text-gray-600 font-medium text-xs leading-relaxed mb-3">"ตั้งแต่ใช้ Tamjai Pro ออเดอร์ไม่เคยหล่นเลย ลูกค้าชอบมาก ประหยัดเวลาไปได้เยอะ แนะนำเลยครับ"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-orange to-orange-400"></div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">คุณบอย, สุกี้หม่าล่า</p>
                      <p className="text-[10px] font-bold text-gray-400">ใช้งานมาแล้ว 6 เดือน</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Demo Section (New Section 2) */}
        <section id="demo" className="py-24 bg-[#FAFAFA] relative overflow-hidden border-y border-gray-100">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-orange-500/5 blur-[120px] -z-10 rounded-l-full translate-x-1/2"></div>

          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="mb-6 inline-flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest px-4 py-1.5 bg-orange-50 rounded-full border border-orange-100">
                  <Smartphone className="h-4 w-4" /> Live Storefront Demo
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
                  Experience the <span className="text-brand-orange">Premium</span> Mobile UX
                </h2>
                <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                  นี่คือหน้าตาที่ลูกค้าของคุณจะเห็น เมื่อสแกน QR Code ที่โต๊ะ ระบบถูกออกแบบมาให้ลื่นไหลเหมือนแอป Native แต่เข้าถึงได้ทันทีผ่านเบราว์เซอร์
                </p>

                <div className="space-y-4 mb-10">
                  {[
                    "Smooth Category Navigation",
                    "Beautiful Product Modals",
                    "One-Tap Checkout Process",
                    "Instant Order Confirmation"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 items-center mb-8">
                  <Link
                    href="/menu/demo-shop"
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-white font-bold hover:bg-black transition-all hover:-translate-y-1 shadow-lg"
                  >
                    🛒 ลองดูหน้าร้านลูกค้า <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>

              <div className="order-1 lg:order-2 relative flex justify-center">
                {/* Mobile UI Mockup Showcase */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="relative z-10 mx-auto max-w-[320px]"
                >
                  <div className="relative rounded-[3rem] bg-gray-900 p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] ring-1 ring-gray-900/10">
                    <div className="overflow-hidden rounded-[2rem] bg-white aspect-[9/19.5] relative">
                      {/* Header */}
                      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-50">
                        <ArrowLeft className="h-5 w-5 text-gray-400" />
                        <span className="font-bold text-gray-900">Tamjai Restaurant</span>
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>

                      {/* Banner */}
                      <div className="h-32 bg-gray-100 m-3 rounded-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 flex gap-1">
                          {[1, 2, 3].map(i => <div key={i} className={`h-1 w-4 rounded-full ${i === 1 ? 'bg-white' : 'bg-white/40'}`}></div>)}
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="px-4 py-2 flex gap-3 overflow-x-auto no-scrollbar">
                        {["All", "Popular", "Spicy", "Drinks"].map((cat, i) => (
                          <div key={i} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${i === 0 ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {cat}
                          </div>
                        ))}
                      </div>

                      {/* Menu List */}
                      <div className="p-4 space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="flex gap-4">
                            <div className="h-20 w-20 bg-gray-100 rounded-xl shrink-0"></div>
                            <div className="flex-1 space-y-2 py-1">
                              <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                              <div className="h-3 w-1/2 bg-gray-50 rounded"></div>
                              <div className="flex justify-between items-center pt-1">
                                <span className="font-black text-brand-orange">฿120</span>
                                <div className="h-6 w-6 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center">
                                  <span className="font-bold">+</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Nav / Cart */}
                      <div className="absolute bottom-0 inset-x-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
                        <div className="bg-brand-orange rounded-2xl p-4 flex justify-between items-center text-white shadow-lg shadow-orange-200">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                              <ShoppingBag className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold opacity-80 uppercase leading-none">2 Items</p>
                              <p className="font-black leading-none mt-1">฿240.00</p>
                            </div>
                          </div>
                          <span className="font-black text-sm">View Cart</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative dots */}
                <div className="absolute -top-10 -right-10 w-20 h-20 text-brand-orange/20">
                  <div className="grid grid-cols-5 gap-2">
                    {[...Array(25)].map((_, i) => <div key={i} className="h-1.5 w-1.5 rounded-full bg-current"></div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The "Why" / Solution Section */}
        <section id="solutions" className="py-24 lg:py-32 bg-white relative scroll-mt-20 border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mb-20 md:text-center max-w-3xl mx-auto"
            >
              <motion.div variants={fadeIn} className="mb-4 inline-flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest">
                <ShieldCheck className="h-5 w-5" /> Why Tamjai Pro?
              </motion.div>
              <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6">
                Total Control.<br className="md:hidden" /> <span className="text-gray-400">Zero Chaos.</span>
              </motion.h2>
              <motion.p variants={fadeIn} className="text-lg text-gray-500">
                หมดปัญหาออเดอร์มั่ว ลูกค้าบ่นรอนาน เราออกแบบโซลูชัน 6 มิติที่ตอบโจทย์เจ้าของร้านยุคดิจิทัลโดยเฉพาะ
              </motion.p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Smartphone, title: "ระบบสั่งอาหารออนไลน์ครบวงจร", desc: "หน้าสั่งอาหารในชื่อแบรนด์ของคุณ ดีไซน์แอปฯ ใช้งานง่าย รองรับทั้ง Delivery, รับที่ร้าน และสั่งล่วงหน้าตลอด 24 ชม." },
                { icon: QrCode, title: "สั่งอาหารที่โต๊ะง่ายๆ ด้วย QR Code", desc: "ลูกค้าสแกนดูเมนู สั่ง และชำระเงินจบใน 1-2 นาที ลดค่าพิมพ์เมนูกระดาษ และความผิดพลาดในการจดออเดอร์" },
                { icon: CheckCircle2, title: "จัดการออเดอร์อย่างมืออาชีพ", desc: "Dashboard จัดการทุกคำสั่งซื้อในที่เดียว แจ้งเตือนออเดอร์ใหม่ทันที และพิมพ์ใบสั่งอาหารเข้าครัวอัตโนมัติ" },
                { icon: Store, title: "รองรับการทำงานหลากหลายรูปแบบ", desc: "แยกอิสระในแต่ละสาขา กำหนดพื้นที่จัดส่งได้เอง และรองรับการสั่งแบบทานที่ร้าน (Table Ordering)" },
                { icon: TrendingUp, title: "เครื่องมือเพิ่มยอดขายและการตลาด", desc: "เพิ่มตัวเลือกเสริม (Add-ons) ฟังก์ชัน Up-Sell เก็บข้อมูลลูกค้าวิเคราะห์ และสร้างโปรโมชันส่วนลดได้เอง" },
                { icon: Search, title: "โอกาสในการค้นพบร้านบน Google", desc: "หน้าเพจเป็นมิตรกับ SEO ช่วยให้ลูกค้าค้นหาร้านเจอได้ง่ายขึ้นผ่านประเภทอาหาร ทำเลที่ตั้ง หรือชื่อร้านของคุณโดยตรง" }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative rounded-[2rem] border border-gray-100 bg-gray-50/50 p-8 transition-all hover:bg-white inset-0 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-orange-100 overflow-hidden"
                >
                  {/* Subtle hover gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 text-gray-600 transition-all duration-300 group-hover:bg-brand-orange group-hover:text-white group-hover:-translate-y-1">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-xl font-black text-gray-900 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Feature Showcase */}
        <section id="pro-features" className="py-24 lg:py-32 bg-[#111] text-white overflow-hidden relative scroll-mt-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,107,0,0.15),transparent_50%)]"></div>

          <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-5">
                <div className="mb-4 inline-flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest">
                  Pro Features
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">Everything you need to <span className="text-brand-orange">scale.</span></h2>
                <p className="text-gray-400 text-lg mb-10 leading-relaxed">สัมผัสประสบการณ์การใช้งานระดับโลก ออกแบบมาให้ง่ายจนไม่ว่าใครก็ใช้เป็น</p>

                <div className="flex flex-col gap-3">
                  {[
                    { id: "dashboard", icon: TrendingUp, t: "Live Dashboard", d: "ดูออเดอร์และยอดขายแบบวินาทีต่อวินาที" },
                    { id: "menu", icon: MenuSquare, t: "Menu Management", d: "จัดหมวดหมู่ เปลี่ยนรูป อัปราคา ทันใจ" },
                    { id: "config", icon: Settings2, t: "Store Customization", d: "สร้างธีมร้านที่สะท้อนตัวตนคุณ" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-start gap-5 rounded-3xl p-5 text-left transition-all duration-300 ${activeTab === tab.id
                        ? "bg-white/10 ring-1 ring-white/20 shadow-lg backdrop-blur-md translate-x-2"
                        : "hover:bg-white/5 opacity-50 hover:opacity-100"
                        }`}
                    >
                      <div className={`rounded-2xl p-3.5 shrink-0 transition-colors ${activeTab === tab.id ? "bg-brand-orange text-white shadow-lg shadow-orange-500/30" : "bg-white/5 text-gray-400"}`}>
                        <tab.icon className="h-6 w-6" />
                      </div>
                      <div className="pt-1">
                        <h4 className="font-bold text-lg mb-1">{tab.t}</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{tab.d}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 relative flex items-center justify-center min-h-[400px] lg:h-[650px] mt-10 lg:mt-0">
                {/* Dynamic Image/Mockup based on tab */}
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                  className="w-full aspect-square sm:aspect-video lg:aspect-auto lg:absolute lg:inset-0 bg-[#1A1A1A] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden group"
                >
                  {/* Abstract representation of the UI */}
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-brand-orange/20 text-brand-orange flex items-center justify-center">
                          <Settings2 className="h-4 w-4" />
                        </div>
                        <div className="h-6 w-32 bg-white/10 rounded-lg"></div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-orange to-orange-400 p-1">
                        <div className="h-full w-full bg-[#1A1A1A] rounded-full"></div>
                      </div>
                    </div>

                    {activeTab === 'dashboard' && (
                      <div className="flex-1 flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-32 bg-white/5 rounded-3xl flex flex-col justify-center p-6 border border-white/5 hover:border-white/10 transition-colors">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Today's Sales</span>
                            <span className="text-4xl font-black text-white mt-2">฿4,250</span>
                          </div>
                          <div className="h-32 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange rounded-3xl flex flex-col justify-center p-6 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                              <TrendingUp className="h-24 w-24" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest opacity-80 z-10">Active Orders</span>
                            <span className="text-4xl font-black mt-2 z-10">12</span>
                          </div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-3xl mt-2 p-6 border border-white/5 flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Revenue Overview</span>
                          <div className="flex-1 w-full flex items-end gap-2 sm:gap-4">
                            {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                              <div key={i} className="flex-1 bg-gradient-to-t from-orange-600 to-brand-orange rounded-t-lg relative group/bar hover:brightness-110 transition-all cursor-pointer" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                  {h * 10}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'menu' && (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex gap-4 sm:gap-6 p-4 sm:p-5 bg-white/5 hover:bg-white/10 transition-colors rounded-3xl border border-white/5 items-center cursor-pointer">
                            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white/10 rounded-2xl shrink-0 border border-white/5"></div>
                            <div className="flex-1 space-y-3">
                              <div className="h-5 w-3/4 sm:w-1/2 bg-white/20 rounded-md"></div>
                              <div className="flex items-center gap-3">
                                <div className="h-4 w-16 bg-brand-orange/80 rounded-md"></div>
                                <div className="h-4 w-12 bg-emerald-500/50 rounded-md"></div>
                              </div>
                            </div>
                            <div className="hidden sm:flex h-10 w-10 bg-white/5 rounded-full items-center justify-center text-white/30">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'config' && (
                      <div className="space-y-8 flex-1 flex flex-col">
                        <div>
                          <span className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 block">Brand Colors</span>
                          <div className="flex flex-wrap gap-4 sm:gap-6">
                            {['bg-brand-orange shadow-[0_0_20px_rgba(255,107,0,0.4)]', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500'].map((color, i) => (
                              <div key={i} className={`h-12 w-12 sm:h-16 sm:w-16 rounded-full ${color} ${i === 0 ? 'ring-2 ring-white ring-offset-4 ring-offset-[#1A1A1A] scale-110' : 'opacity-40 hover:opacity-100 cursor-pointer transition-all'}`}></div>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-brand-orange to-orange-400 rounded-3xl flex items-center justify-center p-6 shadow-2xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 w-full max-w-sm flex flex-col items-center">
                            <div className="h-16 w-16 bg-white rounded-2xl mb-6 shadow-lg rotate-3"></div>
                            <div className="h-5 w-3/4 bg-white/80 rounded-full mb-3"></div>
                            <div className="h-3 w-1/2 bg-white/40 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="reviews" className="py-24 lg:py-32 bg-white relative border-b border-gray-100 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 inline-flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest">
                  Real Feedback
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">เสียงตอบรับจากร้านค้าจริง</h2>
                <p className="text-lg text-gray-500">
                  พิสูจน์แล้วว่า Tamjai Pro ช่วยประหยัดเวลา ลดปวดหัว และเพิ่มยอดขายได้จริง
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "เจ๊นก",
                  role: "ร้านส้มตำเจ๊นก แซ่บเวอร์",
                  quote: "แต่ก่อนจดผิดจดถูก ลูกค้าบ่นประจำ พอเปลี่ยนมาใช้สแกน QR ลูกค้าเลือกเองได้เลยว่าเอาเผ็ดแค่ไหน ไม่ใส่ผงชูรส สบายขึ้นเยอะมากค่ะ ยอดขายก็ไม่ตกเพราะระบบเสถียร",
                  bgColor: "bg-orange-50/50"
                },
                {
                  name: "พี่เอก",
                  role: "คาเฟ่ มุมโปรด",
                  quote: "ชอบตรงหน้า Dashboard ดูง่ายมากครับ วันไหนเมนูไหนขายดี เราดู Real-time ได้เลย ทำให้กะปริมาณวัตถุดิบวันพรุ่งนี้ได้แม่นขึ้น ประหยัดต้นทุนของเหลือทิ้งไปได้เยอะ",
                  bgColor: "bg-emerald-50/50"
                },
                {
                  name: "ต้า",
                  role: "ร้านเนื้อย่าง บาร์บีคิว",
                  quote: "ที่ร้านคนเยอะมากช่วงเย็น พนักงานเดินบิลไม่ทัน พอใช้ Tamjai ให้ลูกค้าสั่งเองปุ๊บ ออเดอร์เด้งเข้าครัวรัวๆ ปิดโต๊ะไวขึ้น รับลูกค้าได้เยอะขึ้นในเวลาเท่าเดิม คุ้มค่ารายเดือนมาก",
                  bgColor: "bg-blue-50/50"
                }
              ].map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className={`rounded-3xl ${review.bgColor} border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all`}
                >
                  <div className="flex gap-1 text-amber-400 mb-6">★ ★ ★ ★ ★</div>
                  <p className="text-gray-700 font-medium leading-relaxed mb-8">"{review.quote}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <div>
                      <p className="font-bold text-gray-900">{review.name}</p>
                      <p className="text-sm font-medium text-gray-500">{review.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 px-6 md:px-12 bg-[#FAFAFA] scroll-mt-20">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 inline-flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest">
                Simple Pricing
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                One Plan.<br className="md:hidden" /> <span className="text-gray-400">Unlimited Potential.</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, type: "spring" }}
              className="mt-16 rounded-[2.5rem] bg-white p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden ring-1 ring-gray-900/5 max-w-3xl mx-auto"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-400 via-brand-orange to-orange-600"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-50 rounded-full blur-3xl mix-blend-multiply"></div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 pb-12 border-b border-gray-100">
                  <div className="text-left flex-1">
                    <h3 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Pro Package</h3>
                    <p className="text-gray-500 font-medium">คุ้มค่าที่สุด ระบบเดียวจบ <span className="text-brand-orange font-bold">(จำกัด 10 สิทธิ์แรก)</span></p>
                  </div>
                  <div className="flex flex-col items-center md:items-end justify-center shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl md:text-7xl font-black text-gray-900 tracking-tighter">450</span>
                      <span className="text-xl font-bold text-gray-400">.-</span>
                    </div>
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest mt-1">/ Month</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-y-5 gap-x-8 text-left mb-12">
                  {[
                    "ระบบสแกนรับออเดอร์ QR Code",
                    "Dashboard จัดการร้าน Real-time",
                    "ไม่จำกัดจำนวนเมนูและหมวดหมู่",
                    "ปรับแต่งธีมสีและโลโก้ได้เองอิสระ",
                    "เพิ่มพนักงานได้ไม่จำกัดจำนวน",
                    "บริการ Support ทีมงานคนไทย"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-gray-700 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    href="/register"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-brand-orange px-10 py-5 text-lg font-black text-white transition-all hover:bg-orange-600 hover:-translate-y-1 shadow-[0_10px_30px_rgba(255,107,0,0.3)] hover:shadow-[0_20px_40px_rgba(255,107,0,0.4)] active:scale-95"
                  >
                    Start 7-Day Free Trial <ArrowRight className="h-5 w-5" />
                  </Link>
                  <button className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-10 py-5 text-lg font-bold text-gray-700 transition-all hover:bg-gray-50 ring-1 ring-gray-200">
                    ติดต่อฝ่ายขาย
                  </button>
                </div>
                <p className="mt-6 text-sm font-bold text-gray-400 text-left sm:text-center">ไม่ต้องใช้บัตรเครดิต ยกเลิกได้ตลอดเวลา</p>
              </div>
            </motion.div>
          </div>
        </section>
        {/* FAQ Section */}
        <FaqSection />
      </main>

      <footer className="bg-white py-12 md:py-16 px-6 border-t border-gray-100 z-10 relative">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-12 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-orange-50 shadow-sm border border-orange-100">
                <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
              </div>
              <span className="text-xl font-black tracking-tighter">Tamjai<span className="text-brand-orange">Pro</span></span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {["Product", "Features", "Pricing"].map((link) => (
                <Link key={link} href={`#${link.toLowerCase()}`} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest">{link}</Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-gray-400">© 2024 Tamjai SaaS Platform. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-xs font-bold text-gray-400 hover:text-gray-900">Privacy Policy</Link>
              <Link href="#" className="text-xs font-bold text-gray-400 hover:text-gray-900">Terms of Service</Link>
              <Link href="/contact" className="text-xs font-bold text-gray-400 hover:text-brand-orange">Contact Support</Link>
            </div>
          </div>

        </div>
      </footer>
    </div >
  );
}
