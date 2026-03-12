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
  Gift,
  ExternalLink,
  Users,
  CircleDollarSign,
  Flame,
  Zap,
  Laptop,
  BarChart3,
  HelpCircle,
  Minus,
  Plus,
  LayoutPanelTop,
  Wand2,
  ChevronDown,
  ChefHat,
  Volume2,
  Printer,
  Bell
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

function UrgencyBanner() {
  const [spots, setSpots] = useState(4);

  useEffect(() => {
    // Randomly "decrease" spots for effect
    const timer = setTimeout(() => {
      setSpots(3);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gray-900 text-white py-2.5 px-6 text-center text-xs font-bold relative z-[60] flex items-center justify-center gap-3 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-orange-600/20 animate-pulse"></div>
      <Flame className="h-3.5 w-3.5 text-orange-500 animate-bounce" />
      <span className="relative z-10">
        ด่วน! ราคาโปรโมชั่น 450.- พร้อมทดลองใช้ฟรี 7 วัน เหลือเพียง <span className="text-orange-500 text-sm font-black underline">{spots} สิทธิ์สุดท้าย</span> ของเดือนนี้เท่านั้น!
      </span>
      <Link href="/register" className="relative z-10 bg-white text-gray-900 px-3 py-1 rounded-full text-[10px] hover:bg-orange-50 transition-colors ml-2">
        จองสิทธิ์เลย
      </Link>
    </motion.div>
  );
}

function RoiCalculator() {
  const [sales, setSales] = useState(50000);
  const [gp, setGp] = useState(30);

  const deliveryCost = sales * (gp / 100);
  const tamjaiCost = 450;
  const saving = deliveryCost - tamjaiCost;

  return (
    <section id="roi-calculator" className="py-24 bg-gray-900 text-white relative overflow-hidden border-b border-white/5">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

      <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest">
              <CircleDollarSign className="h-4 w-4" /> ROI Calculator
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              จ่ายค่า GP ไปทำไม?<br />ในเมื่อคุณ <span className="text-brand-orange">เก็บกำไรได้ 100%</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              ลองคำนวณดูว่าในแต่ละเดือน คุณต้องเสียเงินให้แอปเดลิเวอรี่เท่าไหร่ และจะประหยัดไปได้แค่ไหนถ้าเปลี่ยนมาใช้ Tamjai Pro
            </p>

            <div className="space-y-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">ยอดขายเดลิเวอรี่ / เดือน</label>
                  <span className="text-2xl font-black text-brand-orange">฿{sales.toLocaleString()}</span>
                </div>
                <input
                  type="range" min="10000" max="500000" step="5000"
                  value={sales} onChange={(e) => setSales(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">GP ที่โดนหัก (%)</label>
                  <span className="text-2xl font-black text-brand-orange">{gp}%</span>
                </div>
                <input
                  type="range" min="15" max="35" step="1"
                  value={gp} onChange={(e) => setGp(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <motion.div
              key={saving}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-brand-orange to-orange-600 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-orange-500/20 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-white/80 mb-4">คุณจะประหยัดเงินได้ถึง</p>
              <h3 className="text-5xl md:text-7xl font-black text-white mb-2 tabular-nums">฿{saving.toLocaleString()}</h3>
              <p className="text-lg font-bold text-white/60 mb-8 lowercase">ต่อเดือน</p>

              <div className="h-px bg-white/20 mb-8 w-full"></div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-black/10 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase text-white/50 mb-1">เสียให้ GP</p>
                  <p className="text-xl font-bold text-white">฿{deliveryCost.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase text-white/50 mb-1">จ่ายให้ Tamjai</p>
                  <p className="text-xl font-bold text-white">฿450</p>
                </div>
              </div>

              <div className="mt-10 flex flex-col items-center gap-4">
                <div className="inline-flex items-center gap-2 text-xs font-black bg-white text-brand-orange px-4 py-2 rounded-full shadow-lg">
                  <Zap className="h-3 w-3 fill-current" /> ประหยัดเงินได้ 99.8% ทันที
                </div>
                <Link href="/register" className="text-white text-sm font-bold underline hover:text-white/80 transition-colors">
                  เปลี่ยนมาใช้ Tamjai Pro เลยวันนี้
                </Link>
              </div>
            </motion.div>
          </div>
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
  const [platformConfig, setPlatformConfig] = useState({
    supportEmail: "support@tamjai.pro",
    supportPhone: "02-XXX-XXXX",
  });

  useEffect(() => {
    fetch("/api/config/platform")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setPlatformConfig({
            supportEmail: data.supportEmail,
            supportPhone: data.supportPhone,
          });
        }
      })
      .catch(err => console.error("Failed to fetch platform config:", err));
  }, []);

  const { scrollYProgress } = useScroll();
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
      <UrgencyBanner />
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
            <Link href="/login" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-brand-orange transition-colors">เข้าสู่ระบบ</Link>
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

        {/* Trust Badges */}
        <section className="py-12 bg-white border-b border-gray-100 relative z-10">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 md:mb-0">Secure Payments & Trusted by</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                {['KBank', 'SCB', 'Krungthai', 'PromptPay', 'Visa', 'Mastercard'].map(bank => (
                  <div key={bank} className="text-xl font-black tracking-tighter text-gray-900 border-x border-gray-100 px-4">{bank}</div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-gray-900">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">256-bit SSL</span>
              </div>
            </div>
          </div>
        </section>

        {/* Product Ecosystem Section */}
        <section id="solutions" className="py-24 lg:py-32 bg-white relative overflow-hidden border-y border-gray-100 scroll-mt-20">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-orange-500/5 blur-[120px] -z-10 rounded-l-full translate-x-1/2"></div>

          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="mb-4 inline-flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest">
                  The Ecosystem
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                  One Platform. <span className="text-brand-orange">Two Powerful</span> Worlds.
                </h2>
                <p className="text-lg text-gray-500">
                  เลือกเครื่องมือที่ใช่สำหรับรูปแบบธุรกิจของคุณ หรือใช้ร่วมกันเพื่อประสิทธิภาพสูงสุด
                </p>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Product 1: Tamjai Pro */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-0 opacity-50"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="inline-flex items-center gap-2 text-brand-orange font-black text-xs uppercase tracking-[0.2em] mb-6">
                    <Globe className="h-4 w-4" /> Web-Based Direct
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Tamjai <span className="text-brand-orange">Pro</span></h3>
                  <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                    ระบบสั่งอาหารออนไลน์ผ่าน QR Code สำหรับลูกค้า เหมาะสำหรับร้านที่เน้น Delivery, Takeaway หรือสั่งทานที่โต๊ะแบบ Staff-less
                  </p>

                  <div className="space-y-4 mb-10 flex-1">
                    {[
                      "No App Install Required",
                      "Instant Online Payments",
                      "LINE Smart Notifications",
                      "SEO Optimized Storefront"
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="font-bold text-sm text-gray-700">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/menu/demo-shop" target="_blank" className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-white font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-lg hover:-translate-y-1">
                      Live Storefront Demo <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Product 2: Orange Terminal */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative bg-[#0F1115] rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl hover:shadow-orange-500/10 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-bl-full -z-0 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="inline-flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-[0.2em] mb-6">
                    <LayoutPanelTop className="h-4 w-4" /> Professional POS
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Orange <span className="text-orange-500">Terminal</span></h3>
                  <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                    ชุดซอฟต์แวร์ขายหน้าร้านระดับโปร สำหรับพนักงานและแคชเชียร์ เน้นความเร็ว จัดการผังโต๊ะ และระบบรับเงินสด/PromptPay
                  </p>

                  <div className="space-y-4 mb-10 flex-1">
                    {[
                      "Advanced Table Management",
                      "Flash-Speed Checkout",
                      "Dynamic PromptPay QR",
                      "Shift & Money Control"
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-orange-500" />
                        <span className="font-bold text-sm text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/menu/demo-shop/admin/pos" target="_blank" className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 py-4 text-white font-black uppercase tracking-widest text-sm hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 hover:-translate-y-1">
                      Open POS Demo <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Zero Hardware Messaging Section */}
        <section className="py-24 bg-brand-orange relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] p-4 border border-white/20 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1556742049-3ad443f02164?auto=format&fit=crop&q=80&w=800"
                    alt="No Hardware Needed"
                    className="rounded-[2.5rem] w-full h-[400px] object-cover"
                  />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-3xl p-6 shadow-2xl rotate-3 border border-orange-100">
                  <p className="text-brand-orange font-black text-2xl leading-none">0.-</p>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Hardware Cost</p>
                </div>
              </motion.div>

              <div className="text-white">
                <h2 className="text-4xl md:text-5xl font-black mb-8 leading-[1.2] tracking-tight">
                  "ป้าไม่ต้องซื้อเครื่องใหม่<br />ใช้มือถือป้า หรือแท็บเล็ตเก่าลูกก็ได้"
                </h2>
                <p className="text-white/80 text-lg font-medium mb-10 leading-relaxed">
                  ไม่ต้องจ่ายเงินก้อนซื้อเครื่อง POS ราคาแพง เปลี่ยนทุกหน้าจอที่คุณมีให้เป็นเครื่องมือทำเงินระดับโปร แค่เปิดเว็บเราก็เริ่มขายได้ทันที
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { t: "จัดการผังโต๊ะระดับโปร", d: "Advanced Table Management", icon: LayoutPanelTop },
                    { t: "เช็คบิลไวในพริบตา", d: "Flash-Speed Checkout", icon: Zap },
                    { t: "พร้อมรับเงินผ่าน PromptPay QR", d: "Dynamic PromptPay QR", icon: QrCode },
                    { t: "ควบคุมกะและยอดเงินสด", d: "Shift & Money Control", icon: ShieldCheck },
                    { t: "ไม่ต้องติดตั้งแอปฯ ให้วุ่นวาย", d: "No App Install Required", icon: Smartphone },
                    { t: "รับเงินออนไลน์ทันใจ", d: "Instant Online Payments", icon: Globe },
                    { t: "แจ้งเตือนผ่าน LINE ทันที", d: "LINE Smart Notifications", icon: Bell },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all">
                      <item.icon className="h-6 w-6 text-white shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-white leading-tight">{item.t}</p>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">{item.d}</p>
                      </div>
                    </div>
                  ))}
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
                <ShieldCheck className="h-5 w-5" /> ทำไมต้อง Tamjai Pro?
              </motion.div>
              <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6">
                จัดการครบ.<br className="md:hidden" /> <span className="text-gray-400">จบทุกความวุ่นวาย</span>
              </motion.h2>
              <motion.p variants={fadeIn} className="text-lg text-gray-500">
                หมดปัญหาออเดอร์มั่ว ลูกค้าบ่นรอนาน เราออกแบบโซลูชัน 6 มิติที่ตอบโจทย์เจ้าของร้านยุคดิจิทัลโดยเฉพาะ
              </motion.p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Smartphone, title: "ระบบสั่งอาหารออนไลน์ครบวงจร", desc: "หน้าสั่งอาหารในชื่อแบรนด์ของคุณ ดีไซน์แอปฯ ใช้งานง่าย รองรับทั้ง Delivery, รับที่ร้าน และสั่งล่วงหน้าตลอด 24 ชม." },
                { icon: QrCode, title: "สั่งอาหารที่โต๊ะด้วย QR Code", desc: "ลูกค้าสแกนดูเมนู สั่ง และชำระเงินจบใน 1-2 นาที ลดค่าพิมพ์เมนูกระดาษ และความผิดพลาดในการจดออเดอร์" },
                { icon: CheckCircle2, title: "จัดการออเดอร์อย่างมืออาชีพ", desc: "Dashboard จัดการทุกคำสั่งซื้อในที่เดียว แจ้งเตือนออเดอร์ใหม่ทันที และอัปเกรดเป็น KDS Pro จอภาพในครัว" },
                { icon: Store, title: "รองรับการทำงานหลากหลายรูปแบบ", desc: "แยกอิสระในแต่ละสาขา กำหนดพื้นที่จัดส่งได้เอง และรองรับการสั่งแบบทานที่ร้าน (Table Ordering)" },
                { icon: Gift, title: "ระบบสมาชิกและโปรโมชั่น", desc: "เพิ่มตัวเลือกเสริม (Add-ons) ฟังก์ชัน Up-Sell เก็บข้อมูลลูกค้าวิเคราะห์ และสร้างโปรโมชันส่วนลดได้เอง" },
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
        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 lg:py-32 bg-orange-50/30 relative overflow-hidden border-b border-gray-100 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 inline-flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest">
                  How it Works
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">3 ขั้นตอนง่ายๆ <span className="text-brand-orange">เริ่มรับออเดอร์</span> วันนี้</h2>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line (Desktop) */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-orange/10 -translate-y-1/2 hidden md:block"></div>

              {[
                { step: "01", title: "สมัครสมาชิก", desc: "เลือกแพ็กเกจที่ต้องการ กรอกชื่อร้านเพื่อสร้าง URL ของตัวเอง (เช่น tamjai.pro/your-store)", icon: Users },
                { step: "02", title: "ตั้งค่าเมนู", desc: "ใส่ชื่อเมนู ราคา และรูปภาพ ได้ง่ายๆ ผ่านมือถือ หรือถ่ายรูปเมนูกระดาษให้ AI ช่วยจัดการ", icon: MenuSquare },
                { step: "03", title: "รับออเดอร์", desc: "สแกน QR Code พิมพ์วางที่โต๊ะ รับออเดอร์เข้าครัว (KDS) และแจ้งเตือนผ่าน LINE ทันที พร้อมระบบตัดสต๊อกอัจฉริยะ", icon: ShoppingBag }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-500/5 border border-white relative z-10 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-500"
                >
                  <div className="absolute -top-6 bg-brand-orange text-white font-black px-5 py-2 rounded-full shadow-lg shadow-orange-500/30 text-sm">
                    STEP {step.step}
                  </div>
                  <div className="h-20 w-20 rounded-3xl bg-orange-50 text-brand-orange flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <step.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <RoiCalculator />

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
                    { id: "pos", icon: Laptop, t: "Professional POS", d: "ระบบขายหน้าร้าย จัดการโต๊ะ และรับชำระเงิน" },
                    { id: "kitchen", icon: ChefHat, t: "KDS Pro", d: "ระบบหน้าจอในครัว รับออเดอร์และตัดคิวทันใจ" },
                    { id: "menu", icon: MenuSquare, t: "Menu & Inventory", d: "จัดหมวดหมู่ อัปราคา และตัดสต๊อกอัตโนมัติ" }
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
                      <div className="flex-1 flex flex-col gap-6 relative">
                        {/* Floating Notification */}
                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="absolute -right-4 -top-4 bg-emerald-500 text-white px-4 py-2 rounded-2xl shadow-xl z-20 flex items-center gap-2 border border-white/20"
                        >
                          <div className="h-2 w-2 rounded-full bg-white animate-ping"></div>
                          <span className="text-[10px] font-black uppercase">New Order!</span>
                        </motion.div>

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
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Revenue Overview</span>
                            <div className="flex gap-1">
                              {[1, 2, 3].map(i => <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === 3 ? 'bg-brand-orange' : 'bg-white/10'}`}></div>)}
                            </div>
                          </div>
                          <div className="flex-1 w-full flex items-end gap-2 sm:gap-4">
                            {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                              <div key={i} className="flex-1 bg-gradient-to-t from-orange-600 to-brand-orange rounded-t-lg relative group/bar hover:brightness-110 transition-all cursor-pointer" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                  ฿{h * 100}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'pos' && (
                      <div className="flex-1 flex flex-col gap-6 relative">
                        <div className="flex gap-4">
                          <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center">
                            <Users className="h-8 w-8 text-orange-500 mb-2" />
                            <span className="text-2xl font-black text-white">15</span>
                            <span className="text-[10px] font-black text-gray-500 uppercase">Tables</span>
                          </div>
                          <div className="flex-1 bg-orange-500/10 border border-orange-500/30 rounded-3xl p-6 flex flex-col items-center justify-center">
                            <QrCode className="h-8 w-8 text-orange-500 mb-2" />
                            <span className="text-xs font-black text-white uppercase">PromptPay</span>
                            <span className="text-[10px] font-black text-orange-500 uppercase mt-1">Ready</span>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex-1 flex flex-col">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Table Map (Real-time)</span>
                            <div className="flex gap-1">
                              <div className="h-1 w-1 rounded-full bg-emerald-500"></div>
                              <div className="h-1 w-1 rounded-full bg-emerald-500"></div>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                              <div key={i} className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 ${i % 3 === 0 ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white/5 border-white/10 text-gray-500"}`}>
                                <span className="text-[8px] font-black">T-{i}</span>
                                <div className={`h-1 w-3 rounded-full ${i % 3 === 0 ? "bg-white/30" : "bg-white/10"}`}></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'kitchen' && (
                      <div className="flex-1 flex flex-col gap-6 relative">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: "101", items: "2 Items", status: "Cooking", color: "bg-orange-500" },
                            { id: "102", items: "1 Item", status: "New", color: "bg-emerald-500 animate-pulse" }
                          ].map((order, i) => (
                            <div key={i} className="bg-white/5 rounded-3xl p-5 border border-white/10 relative overflow-hidden">
                              <div className={`absolute top-0 right-0 px-3 py-1 ${order.color} text-[8px] font-black uppercase rounded-bl-xl`}>{order.status}</div>
                              <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Order #{order.id}</p>
                              <div className="h-4 w-24 bg-white/20 rounded mb-4"></div>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400">{order.items}</span>
                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex-1 flex flex-col justify-center items-center text-center">
                          <Volume2 className="h-10 w-10 text-brand-orange mb-4 animate-bounce" />
                          <p className="text-sm font-black text-white uppercase tracking-widest">Kitchen Audio Alerts</p>
                          <p className="text-xs text-gray-500 mt-1">Never miss an order with smart notifications.</p>
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

        <ComparisonSection />

        <section id="features-grid" className="py-24 bg-gray-50/50">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">ฟีเจอร์ที่ช่วยให้คุณ <span className="text-brand-orange">เหนือกว่า</span> คู่แข่ง</h2>
              <p className="text-gray-500 font-medium">ทุกเครื่องมือถูกออกแบบมาเพื่อเพิ่มยอดขายและลดขั้นตอนการทำงานที่ซับซ้อน</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Wand2, t: "AI Menu Generator", d: "ถ่ายรูปเมนูกระดาษ แล้วให้ AI แปลงเป็นเมนูเว็บบอร์ดอัตโนมัติในหลักวินาที" },
                { icon: Zap, t: "✨ AI Smart Upselling", d: "ระบบแนะนำเมนูที่ทานคู่กันอัจฉริยะ (Powered by Gemini) ช่วยเพิ่มยอดขายต่อบิลได้ 15-30%" },
                { icon: ShieldCheck, t: "🛡️ Real-time Inventory", d: "ระบบตัดสต๊อกอัตโนมัติ และขึ้นสถานะ 'Sold Out' ทันทีเมื่อของหมด ป้องกันออเดอร์ซ้อน" },
                { icon: Printer, t: "Digital Receipt & Print", d: "ส่งใบเสร็จเข้า LINE อัตโนมัติ หรือพิมพ์ผ่านเครื่องความร้อน (Compatible with 80mm printers) เลือกได้ตามใจคุณ" },
                { icon: Bell, t: "🛎️ LINE Messaging API", d: "แจ้งเตือนออเดอร์ใหม่เข้า LINE ส่วนตัวของเจ้าของร้านแบบ Real-time พร้อมสรุปยอด" },
                { icon: LayoutPanelTop, t: "Dynamic Table Layout", d: "จัดวางผังโต๊ะอาหารแบบ Visual ช่วยให้พนักงานบริหารจัดการโต๊ะได้ไม่พลาด" },
                { icon: BarChart3, t: "Deep Analytics", d: "รายงานวิเคราะห์เมนูไหนขายดี ช่วงเวลาไหนออเดอร์พีค เพื่อวางแผนสต็อกได้แม่นยำ" },
                { icon: Smartphone, t: "PWA Storefront", d: "รองรับการติดตั้งแอปบนมือถือลูกค้า (Add to Home Screen) ลื่นไหลเหมือนแอป Native" }
              ].map((f, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-brand-orange/50 transition-all group">
                  <div className="h-14 w-14 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">{f.t}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ConversionFaq />

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

      <footer className="bg-gray-950 text-white py-20 px-6 md:px-12 z-10 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 pb-16 border-b border-white/5">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/10 shadow-sm border border-white/10">
                  <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
                </div>
                <span className="text-2xl font-black tracking-tighter">Tamjai<span className="text-brand-orange">Pro</span></span>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed max-w-xs">
                เราช่วยเปลี่ยนร้านอาหารของคุณให้เข้าสู่ยุคดิจิทัลอย่างมืออาชีพ ประหยัดเวลา เพิ่มประสิทธิภาพ และสร้างประสบการณ์ที่ดีให้ลูกค้า
              </p>
              <div className="flex gap-4">
                {['Facebook', 'LINE', 'TikTok'].map(sc => (
                  <div key={sc} className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                    <span className="text-[10px] font-black">{sc.charAt(0)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-black text-lg mb-8 uppercase tracking-widest text-brand-orange">Product</h4>
              <ul className="space-y-4">
                {["Home", "Solutions", "Pro Features", "Pricing"].map(item => (
                  <li key={item}>
                    <Link href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white transition-colors font-bold">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-lg mb-8 uppercase tracking-widest text-brand-orange">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Contact Us", "Terms of Service", "Privacy Policy"].map(item => (
                  <li key={item}>
                    <Link href={item.includes("Privacy") ? "/privacy" : item.includes("Terms") ? "/terms" : "/contact"} className="text-gray-400 hover:text-white transition-colors font-bold">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-lg mb-8 uppercase tracking-widest text-brand-orange">News Letter</h4>
              <p className="text-gray-400 mb-6 font-medium">ติดตามอัปเดตฟีเจอร์ใหม่ๆ และโปรโมชั่นก่อนใคร</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 text-sm focus:outline-none focus:border-brand-orange transition-colors" />
                <button className="bg-brand-orange px-4 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">Go</button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm font-bold text-gray-500">© 2026 Tamjai Pro SaaS Platform. Created with ❤️ for Food Businesses.</p>
            <div className="flex gap-6 md:gap-8">
              <Link href="/privacy" className="text-xs font-black text-gray-400 hover:text-brand-orange transition-colors uppercase tracking-widest">Privacy Policy</Link>
              <Link href="/terms" className="text-xs font-black text-gray-400 hover:text-brand-orange transition-colors uppercase tracking-widest">Terms of Service</Link>
              <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Support: {platformConfig.supportPhone} | {platformConfig.supportEmail}</span>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}

function ComparisonSection() {
  const points = [
    { label: "ค่าธรรมเนียม (GP)", tamjai: "0% (จ่ายรายเดือนคงที่)", others: "30-35% ต่อออเดอร์" },
    { label: "การเป็นเจ้าของข้อมูลลูกค้า", tamjai: "เป็นของคุณ 100% (ดูเบอร์/LINE ได้)", others: "เป็นความลับของแอป" },
    { label: "ความล่าช้าของการโอนเงิน", tamjai: "เงินเข้าบัญชีคุณโดยตรงทันที", others: "7-15 วันทำการ" },
    { label: "การปรับแต่งหน้าตา (Branding)", tamjai: "ปรับธีม/สี/โลโก้ ได้อิสระ", others: "ใช้หน้าตารวมของแอป" },
    { label: "ฟีเจอร์พรีเมียม (AI, พิมพ์ครัว)", tamjai: "รวมอยู่ในราคาเดียว", others: "ต้องซื้ออุปกรณ์แยกแพงๆ" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">ทำไมคุณถึงควรเปลี่ยน?</h2>
          <p className="text-gray-500 font-medium">เปรียบเทียบอิสระที่คุณจะได้รับ เมื่อเปลี่ยนจากแอปเดลิเวอรี่ทั่วไปมาเป็น Tamjai Pro</p>
        </div>

        <div className="bg-gray-50/50 rounded-[3rem] border border-gray-100 overflow-hidden shadow-xl">
          <div className="grid grid-cols-3 bg-gray-900 text-white p-6 md:p-8">
            <div className="font-black text-sm uppercase tracking-widest opacity-50">Feature</div>
            <div className="font-black text-sm uppercase tracking-widest text-center text-brand-orange">Tamjai Pro</div>
            <div className="font-black text-sm uppercase tracking-widest text-center opacity-50">Other Apps</div>
          </div>
          <div className="divide-y divide-gray-100">
            {points.map((p: any, i: number) => (
              <div key={i} className="grid grid-cols-3 p-6 md:p-8 items-center bg-white hover:bg-orange-50/20 transition-colors">
                <div className="text-sm font-black text-gray-900">{p.label}</div>
                <div className="flex flex-col items-center gap-2">
                  <Check className="h-6 w-6 text-brand-orange" />
                  <span className="text-xs font-bold text-gray-900 text-center">{p.tamjai}</span>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <X className="h-6 w-6 text-gray-400" />
                  <span className="text-xs font-bold text-gray-500 text-center">{p.others}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-orange-50 p-8 text-center border-t border-orange-100">
            <p className="text-brand-orange font-black mb-4">ไม่ติดสัญญาผูกมัด | ทดลองใช้ฟรี 7 วัน | ย้ายข้อมูลเมนูให้ฟรี!</p>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-8 py-3 text-white font-black hover:bg-orange-600 transition-all">
              เริ่มประหยัด GP วันนี้ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConversionFaq() {
  const faqs = [
    { q: "ไม่ได้จดทะเบียนบริษัท สมัครได้ไหม?", a: "ได้แน่นอนครับ! เราสนับสนุนทั้งร้านค้าบุคคลธรรมดา แผงลอย และร้านขนาดเล็ก เพียงมีเบอร์โทรศัพท์และบัญชีธนาคารก็เริ่มได้ทันที" },
    { q: "ต้องซื้อเครื่อง POS หรือ iPad ใหม่ไหม?", a: "ไม่จำเป็นครับ Tamjai Pro ทำงานบนมือถือทั่วไป หรือใช้แท็บเล็ตที่คุณมีอยู่แล้วได้เลย ขอแค่มีอินเทอร์เน็ตก็พอ" },
    { q: "ไม่ได้ซื้อเครื่องพิมพ์/ปริ้นเตอร์ จะใช้งานได้ไหม?", a: "ใช้งานได้ 100% ครับ! ระบบของเรามี 'Digital Receipt' ส่งใบแจ้งออเดอร์เข้า LINE หรือแสดงหน้าจอ KDS ให้เชฟดูได้ทันที ประหยัดค่ากระดาษไปในตัว" },
    { q: "มีพนักงานช่วยสอนการใช้งานไหม?", a: "เรามี AI Mascot คอยสแตนด์บายตอบคำถาม 24 ชม. และมีคู่มือภาษาไทยแบบวิดีโอให้ดู ทำตามได้ใน 5 นาทีครับ" },
    { q: "ลูกค้ายกเลิกออเดอร์ได้ไหม?", a: "คุณ (เจ้าของร้าน) มีอำนาจตัดสินใจสูงสุดครับ สามารถกดยกเลิกหรือแจ้งสถานะอาหารให้ลูกค้าทราบได้แบบ Real-time" },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-gray-50 scroll-mt-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <div className="mb-4 inline-flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest px-4 py-1 bg-white rounded-full border border-orange-100">
            <HelpCircle className="h-4 w-4" /> FAQ
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">คำถามที่คุณ <span className="text-brand-orange">อาจจะสงสัย</span></h2>
          <p className="text-gray-500 font-medium leading-relaxed">เราตอบคำถามที่เจ้าของร้านส่วนใหญ่กังวลใจ เพื่อให้คุณมั่นใจที่สุดก่อนเริ่มงาน</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f: any, i: number) => (
            <motion.div
              key={i}
              className={`bg-white rounded-[2rem] border overflow-hidden transition-all ${open === i ? 'border-brand-orange shadow-lg' : 'border-gray-100 shadow-sm'}`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full p-8 flex items-center justify-between text-left"
              >
                <span className="text-lg font-black text-gray-900 pr-8">{f.q}</span>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all ${open === i ? 'bg-brand-orange text-white rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 text-gray-500 font-medium leading-relaxed">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-gray-900 rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-brand-orange/10 blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-6">ยังลังเลอยู่ใช่ไหม? ให้เราช่วยย้ายเมนูให้ฟรี!</h3>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">เพียงส่งรูปเมนูของคุณมา ทีมงาน (และ AI) ของเรายินดีตั้งค่าเริ่มต้นให้คุณพร้อมเปิดร้านได้ในทันที</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="bg-brand-orange text-white px-10 py-4 rounded-full font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                สมัครรับสิทธิ์ย้ายเมนูฟรี
              </Link>
              <Link href="https://lin.ee/example" className="bg-white/10 text-white px-10 py-4 rounded-full font-black hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md">
                คุยกับทีมงานผ่าน LINE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
