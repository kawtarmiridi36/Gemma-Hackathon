import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Mic, HeartPulse, FileText, Calendar, ShieldCheck, Sparkles, Play, Pause,
  ArrowRight, ChevronRight, Activity, CheckCircle2, MapPin, 
  Stethoscope, Menu, X, AlertTriangle, Lock, Heart,
  WifiOff, RefreshCw, Cpu, Check, Radio, Award, Info, Plus, UserCheck, Users
} from 'lucide-react'
import { translations } from '../i18n/translations'

// Scroll animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  const [lang, setLang] = useState('fr')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSandboxCase, setActiveSandboxCase] = useState('case1')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [activeHotspot, setActiveHotspot] = useState('hotspot1')
  const navigate = useNavigate()

  const t = translations[lang]
  const isRtl = lang === 'ar'

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang, isRtl])

  const toggleLanguage = (newLang) => {
    setLang(newLang)
  }

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const currentCase = t.sandbox[activeSandboxCase]

  return (
    <div className={`min-h-screen bg-[#FAFDFB] text-[#0F1F17] font-sans antialiased selection:bg-[#4ADE80]/30 selection:text-[#0F1F17] ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* ── 1. ENTERPRISE INSTITUTIONAL NAVBAR ── */}
      <div className="sticky top-0 z-50 bg-[#0F172A] border-b border-slate-800 text-white">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-lg bg-emerald-600 p-0.5 shadow-sm flex items-center justify-center shrink-0">
              <img src="/logo_icon.jpg" alt="Dar Al Oumouma Logo" className="w-full h-full object-cover rounded-md" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white font-display flex items-center gap-1.5">
                Dar Al Oumouma
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider hidden sm:inline">
                Royaume du Maroc · Ministère de la Santé
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <button onClick={() => scrollToSection('features')} className="hover:text-emerald-400 transition-colors">
              Protocoles & Fonctionnalités
            </button>
            <button onClick={() => scrollToSection('nurse-role')} className="hover:text-emerald-400 transition-colors">
              Espace Soignants
            </button>
            <button onClick={() => scrollToSection('sandbox')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <span>Démonstration CPN</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-400 transition-colors">
              Architecture & Réseau
            </button>
          </nav>

          {/* Right Action Buttons & Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold">
              <button 
                onClick={() => toggleLanguage('fr')} 
                className={`px-2.5 py-1 rounded-md transition-all ${lang === 'fr' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                FR
              </button>
              <button 
                onClick={() => toggleLanguage('ar')} 
                className={`px-2.5 py-1 rounded-md transition-all ${lang === 'ar' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                ع
              </button>
            </div>

            <button 
              onClick={() => navigate('/login')} 
              className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Accès Espace Soignants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex items-center p-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold mr-1">
              <button onClick={() => toggleLanguage('fr')} className={`px-2 py-0.5 rounded-full ${lang === 'fr' ? 'bg-[#0F1F17] text-white' : 'text-emerald-900'}`}>FR</button>
              <button onClick={() => toggleLanguage('ar')} className={`px-2 py-0.5 rounded-full ${lang === 'ar' ? 'bg-[#0F1F17] text-white' : 'text-emerald-900'}`}>ع</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 rounded-xl bg-emerald-50 text-[#0F1F17]">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="md:hidden bg-white/95 backdrop-blur-2xl border border-emerald-100 rounded-2xl mt-2 px-6 py-5 flex flex-col gap-3 shadow-2xl"
            >
              <button onClick={() => scrollToSection('features')} className="text-left text-xs font-semibold text-[#0F1F17] py-2 border-b border-gray-100">{t.nav.features}</button>
              <button onClick={() => scrollToSection('nurse-role')} className="text-left text-xs font-semibold text-[#0F1F17] py-2 border-b border-gray-100">{t.nav.nurseRole}</button>
              <button onClick={() => scrollToSection('sandbox')} className="text-left text-xs font-semibold text-[#0F1F17] py-2 border-b border-gray-100">{t.nav.sandbox}</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left text-xs font-semibold text-[#0F1F17] py-2 border-b border-gray-100">{t.nav.howItWorks}</button>
              <button onClick={() => scrollToSection('about')} className="text-left text-xs font-semibold text-[#0F1F17] py-2 border-b border-gray-100">{t.nav.about}</button>
              
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={() => navigate('/login')} className="w-full py-2.5 text-center text-xs font-bold border border-emerald-200 text-[#0F1F17] rounded-xl">{t.nav.login}</button>
                <button onClick={() => navigate('/login')} className="w-full py-2.5 text-center text-xs font-extrabold bg-[#4ADE80] text-[#0F1F17] rounded-xl shadow-md">{t.nav.start}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* ── 2. HERO SECTION (IMAGE-FIRST WITH VERTEX HOTSPOTS) ── */}
      <section className="relative pt-8 pb-20 md:pt-14 md:pb-28 overflow-hidden">
        {/* Background glow graphics */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-200/30 via-teal-100/20 to-amber-100/20 blur-3xl rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="lg:col-span-6 flex flex-col items-start"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#34D399]/40 text-[#059669] text-xs font-bold mb-6 shadow-sm">
                <WifiOff className="w-3.5 h-3.5 text-[#10B981]" />
                <span>{t.hero.badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F1F17] leading-[1.12] mb-6 font-display">
                {t.hero.titleLine1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] via-[#10B981] to-[#D4A574]">
                  {t.hero.titleLine2}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-[#1A2E22]/80 leading-relaxed mb-8 max-w-2xl font-normal">
                {t.hero.subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-12">
                <button 
                  onClick={() => scrollToSection('sandbox')} 
                  className="px-8 py-4 rounded-2xl bg-[#4ADE80] hover:bg-[#34D399] text-[#0F1F17] font-extrabold text-base shadow-xl shadow-emerald-400/30 hover:shadow-emerald-400/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5 text-[#0F1F17]" />
                  <span>{t.hero.ctaDemo}</span>
                </button>

                <button 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="px-8 py-4 rounded-2xl bg-white hover:bg-emerald-50/50 border border-emerald-200/80 text-[#0F1F17] font-bold text-base shadow-sm transition-all flex items-center justify-center gap-3 group"
                >
                  <div className="w-7 h-7 rounded-full bg-[#ECFDF5] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 text-[#059669] fill-current ml-0.5" />
                  </div>
                  <span>{t.hero.ctaLearn}</span>
                </button>
              </div>

              {/* Key Highlights Micro Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-emerald-100/80 w-full">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#0F1F17]">{t.hero.stats.femmes.split(' ')[0]}</div>
                  <div className="text-xs text-[#1A2E22]/70 font-medium">{lang === 'fr' ? 'Suivis prénataux' : 'متابعة حوامل'}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#059669]">{t.hero.stats.centres.split(' ')[0]}</div>
                  <div className="text-xs text-[#1A2E22]/70 font-medium">{lang === 'fr' ? 'Dispensaires ruraux' : 'مستوصف قروي'}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#D4A574]">{t.hero.stats.precision.split(' ')[0]}</div>
                  <div className="text-xs text-[#1A2E22]/70 font-medium">{lang === 'fr' ? 'Dépistage alerte' : 'دقة التنبيه'}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#0F1F17]">{t.hero.stats.offline.split(' ')[0]}</div>
                  <div className="text-xs text-[#1A2E22]/70 font-medium">{lang === 'fr' ? 'Hors-réseau PWA' : 'بدون إنترنت'}</div>
                </div>
              </div>

            </motion.div>

            {/* Hero Right IMAGE-FIRST CONTAINER WITH VERTEX HOTSPOTS */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 relative"
            >
              {/* Main Photo Card Container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/15 border-4 border-white bg-white group">
                <img 
                  src="/hero_midwife.jpg" 
                  alt="Sage-femme marocaine avec tablette médicale en consultation prénatale" 
                  className="w-full h-[500px] sm:h-[580px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1F17]/85 via-[#0F1F17]/25 to-transparent pointer-events-none" />

                {/* ── VERTEX / HOTSPOT 1 (Tablette PWA) ── */}
                <div className="absolute top-[42%] left-[45%] z-30">
                  <button 
                    onClick={() => setActiveHotspot('hotspot1')}
                    className="relative group/hotspot flex items-center justify-center"
                  >
                    <span className="absolute w-8 h-8 rounded-full bg-[#4ADE80]/40 animate-ping" />
                    <span className="relative w-7 h-7 rounded-full bg-[#4ADE80] text-[#0F1F17] flex items-center justify-center font-bold text-xs shadow-lg shadow-emerald-500/50">
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>

                  <AnimatePresence>
                    {activeHotspot === 'hotspot1' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-[#0F1F17]/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-emerald-500/40 shadow-2xl z-40 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-[#4ADE80] mb-1">
                          <span>📱 Tablette PWA Off-Grid</span>
                          <button onClick={() => setActiveHotspot(null)}><X className="w-3.5 h-3.5 text-gray-400" /></button>
                        </div>
                        <p className="text-[11px] text-gray-200 leading-relaxed">
                          Modèle médical embarqué sur l'appareil. Fonctionne sans connexion 3G/4G.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── VERTEX / HOTSPOT 2 (Anamnèse Darija) ── */}
                <div className="absolute top-[62%] left-[25%] z-30">
                  <button 
                    onClick={() => setActiveHotspot('hotspot2')}
                    className="relative group/hotspot flex items-center justify-center"
                  >
                    <span className="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping" />
                    <span className="relative w-7 h-7 rounded-full bg-[#D4A574] text-white flex items-center justify-center font-bold text-xs shadow-lg">
                      <Mic className="w-3.5 h-3.5" />
                    </span>
                  </button>

                  <AnimatePresence>
                    {activeHotspot === 'hotspot2' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-[#0F1F17]/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl z-40 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-[#D4A574] mb-1">
                          <span>🎙️ Retranscription Darija</span>
                          <button onClick={() => setActiveHotspot(null)}><X className="w-3.5 h-3.5 text-gray-400" /></button>
                        </div>
                        <p className="text-[11px] text-gray-200 leading-relaxed">
                          « Fiya sda3 f ras kbir... » Traduction et extraction de constantes vitales en direct.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Floating Top Alert Card */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-100 shadow-xl flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                      <span className="truncate">{t.hero.alertCard.title}</span>
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">ALERTE CPN</span>
                    </div>
                    <p className="text-[11px] text-gray-600 truncate">{t.hero.alertCard.patient}</p>
                    <p className="text-[11px] font-semibold text-amber-700">{t.hero.alertCard.finding}</p>
                  </div>
                </motion.div>

                {/* Floating Bottom Voice Badge */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute bottom-4 left-4 right-4 bg-[#0F1F17]/95 backdrop-blur-md text-white p-4 rounded-2xl border border-emerald-500/30 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#4ADE80] text-[#0F1F17] flex items-center justify-center animate-pulse">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#4ADE80]">{t.hero.voiceCard.title}</div>
                      <div className="text-[10px] text-gray-300">SFT Darija Medical Spec</div>
                    </div>
                  </div>
                  <p className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-lg text-emerald-200 dir-ltr mb-1">
                    {t.hero.voiceCard.transcript}
                  </p>
                  <div className="text-[11px] text-gray-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                    <span>{t.hero.voiceCard.translated}</span>
                  </div>
                </motion.div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>


      {/* ── 3. DEDICATED NURSE & PATIENT CONSULTATION SECTION ── */}
      <section id="nurse-role" className="py-20 bg-gradient-to-b from-[#ECFDF5]/60 to-[#FAFDFB] border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image Card featuring Nurse & Patient */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-emerald-950/10 group">
                <img 
                  src="/avatar_nurse.jpg" 
                  alt="Infirmier de santé rurale en consultation avec la patiente enceinte" 
                  className="w-full h-[480px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1F17]/90 via-[#0F1F17]/30 to-transparent" />
                
                {/* Floating Consultation Active Badge */}
                <div className="absolute top-4 left-4 right-4 bg-[#0F1F17]/90 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/40 text-white flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4ADE80] text-[#0F1F17] flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#4ADE80]">Consultation Prénatale en Douar</div>
                    <div className="text-[11px] text-gray-300">Infirmier & Patiente aux côtés de l'Assistant IA</div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="text-sm font-bold text-[#4ADE80] mb-1">
                    {t.nurseSection.nurseName}
                  </div>
                  <div className="text-xs text-gray-200">
                    {t.nurseSection.nurseLoc}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Nurse Content */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="lg:col-span-6 flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#059669] text-xs font-bold uppercase tracking-wider mb-4 border border-[#34D399]/40 shadow-sm">
                <UserCheck className="w-4 h-4" />
                <span>{t.nurseSection.tag}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1F17] tracking-tight mb-4 font-display">
                {t.nurseSection.title}
              </h2>

              <p className="text-base text-[#1A2E22]/80 leading-relaxed mb-6">
                {t.nurseSection.subtitle}
              </p>

              {/* Quote Card */}
              <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-md mb-6 w-full">
                <p className="text-sm text-[#0F1F17] italic leading-relaxed mb-3">
                  {t.nurseSection.nurseQuote}
                </p>
                <div className="text-xs font-bold text-[#059669]">
                  — {t.nurseSection.nurseName}
                </div>
              </div>

              {/* Bullet Features */}
              <div className="space-y-3 w-full mb-8">
                <div className="flex items-start gap-3 bg-white/70 p-3 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-[#0F1F17]">{t.nurseSection.feat1}</span>
                </div>
                <div className="flex items-start gap-3 bg-white/70 p-3 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-[#0F1F17]">{t.nurseSection.feat2}</span>
                </div>
                <div className="flex items-start gap-3 bg-white/70 p-3 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-[#0F1F17]">{t.nurseSection.feat3}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-3.5 rounded-xl bg-[#4ADE80] hover:bg-[#34D399] text-[#0F1F17] font-extrabold text-xs shadow-lg shadow-emerald-400/25 transition-all flex items-center gap-2"
              >
                <span>{lang === 'fr' ? 'Accéder à l\'Espace Infirmier' : 'الدخول لفضاء الممرض'}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>

            </motion.div>

          </div>
        </div>
      </section>


      {/* ── 4. INTERACTIVE DARIJA VOICE SANDBOX ── */}
      <section id="sandbox" className="py-20 sm:py-28 bg-[#0F1F17] text-white relative overflow-hidden">
        {/* Background glow graphics */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4ADE80]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4A574]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#4ADE80] text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
              <span>{t.sandbox.tag}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 font-display text-white">
              {t.sandbox.title}
            </h2>
            <p className="text-base sm:text-lg text-emerald-100/70">
              {t.sandbox.subtitle}
            </p>
          </motion.div>

          {/* Interactive Sandbox Wrapper */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-[#142E22] rounded-3xl border border-emerald-500/30 p-6 sm:p-10 shadow-2xl"
          >
            
            {/* Case Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {['case1', 'case2', 'case3'].map((cKey) => (
                <button
                  key={cKey}
                  onClick={() => {
                    setActiveSandboxCase(cKey)
                    setIsPlayingAudio(false)
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    activeSandboxCase === cKey 
                      ? 'bg-[#4ADE80] text-[#0F1F17] border-[#4ADE80] font-bold shadow-lg shadow-emerald-500/20' 
                      : 'bg-white/5 border-white/10 text-emerald-100 hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm font-semibold">{t.sandbox[cKey].label}</span>
                  {activeSandboxCase === cKey && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Selected Case Triage Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Audio & Transcript Input */}
              <div className="lg:col-span-5 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#4ADE80] uppercase tracking-wider flex items-center gap-2">
                      <Radio className="w-4 h-4 animate-pulse" />
                      Entrée Vocale Darija
                    </span>
                    <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-emerald-200">Format WMA 16kHz</span>
                  </div>

                  {/* Audio Waveform Play Button Box */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-6">
                    <div className="flex items-center gap-4 mb-3">
                      <button 
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-12 h-12 rounded-full bg-[#4ADE80] text-[#0F1F17] flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0 shadow-md"
                      >
                        {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                      </button>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-white mb-1">
                          {isPlayingAudio ? 'Lecture audio en Darija...' : 'Cliquer pour écouter la patiente'}
                        </div>
                        {/* Animated Waveform Lines */}
                        <div className="flex items-center gap-1 h-6">
                          {[40, 70, 30, 90, 50, 80, 40, 100, 60, 30, 75, 45, 85, 30].map((h, i) => (
                            <span 
                              key={i} 
                              style={{ height: isPlayingAudio ? `${Math.max(15, (h * Math.random()).toFixed(0))}%` : '20%' }}
                              className={`w-1 rounded-full transition-all duration-150 ${isPlayingAudio ? 'bg-[#4ADE80]' : 'bg-white/30'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-mono text-emerald-200 bg-white/5 p-3 rounded-lg border border-white/5 italic">
                      {currentCase.audio}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-bold text-gray-300">Symptômes Déduits :</div>
                    <p className="text-xs text-emerald-100/80 leading-relaxed bg-white/5 p-3 rounded-xl">
                      {currentCase.symptoms}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-300/60">
                  <span>Modèle: Gemma 4 Darija SFT</span>
                  <span>Temps d'inférence: 0.18s</span>
                </div>
              </div>

              {/* Right Live Triage Output */}
              <div className="lg:col-span-7 bg-[#0F1F17] p-6 rounded-2xl border border-emerald-500/40 flex flex-col justify-between relative">
                
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-900/60">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-[#4ADE80]" />
                      <span className="font-bold text-sm text-white font-display">Résultat du Dépistage Clinique</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                      currentCase.triage.includes('ROUGE') 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                        : currentCase.triage.includes('ORANGE')
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {currentCase.triage}
                    </span>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-emerald-300/70 font-semibold">Tension Artérielle</div>
                      <div className="text-base font-extrabold text-white mt-0.5">{currentCase.constants.pa}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-emerald-300/70 font-semibold">Albuminurie</div>
                      <div className="text-base font-extrabold text-white mt-0.5">{currentCase.constants.albumin}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-emerald-300/70 font-semibold">Terme SA</div>
                      <div className="text-base font-extrabold text-white mt-0.5">{currentCase.constants.term}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-emerald-300/70 font-semibold">Pouls Maternel</div>
                      <div className="text-base font-extrabold text-white mt-0.5">{currentCase.constants.pulse}</div>
                    </div>
                  </div>

                  {/* PNSG Recommendation Box */}
                  <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/60 mb-6">
                    <div className="text-xs font-bold text-[#4ADE80] mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Recommandation PNSG Maroc :</span>
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed">
                      {currentCase.recommendation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-emerald-900/60">
                  <div className="text-xs text-emerald-200/70">
                    Fiche de liaison CPN générée automatiquement
                  </div>
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 rounded-xl bg-[#4ADE80] text-[#0F1F17] font-bold text-xs hover:bg-[#34D399] transition-colors flex items-center gap-1.5"
                  >
                    <span>Voir le rapport complet</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </section>


      {/* ── 5. FEATURES SECTION ── */}
      <section id="features" className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] text-[#059669] text-xs font-bold uppercase tracking-wider mb-4 border border-[#34D399]/30">
              {t.features.tag}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1F17] tracking-tight mb-4 font-display">
              {t.features.title}
            </h2>
            <p className="text-base sm:text-lg text-[#1A2E22]/70">
              {t.features.subtitle}
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            
            {/* Feature 1 */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="bg-[#FAFDFB] p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/[0.03] flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#4ADE80]/15 to-transparent rounded-bl-full pointer-events-none" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center mb-6 group-hover:bg-[#4ADE80] group-hover:text-[#0F1F17] transition-all duration-300 shadow-sm">
                  <Mic className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1F17] mb-3 font-display">
                  {t.features.f1.title}
                </h3>
                <p className="text-sm text-[#1A2E22]/75 leading-relaxed">
                  {t.features.f1.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-100/60 flex items-center gap-2 text-xs font-bold text-[#059669]">
                <span>Darija & Amazigh</span>
                <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="bg-[#FAFDFB] p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/[0.03] flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4A574]/15 to-transparent rounded-bl-full pointer-events-none" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-6 group-hover:bg-[#D4A574] group-hover:text-white transition-all duration-300 shadow-sm">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1F17] mb-3 font-display">
                  {t.features.f2.title}
                </h3>
                <p className="text-sm text-[#1A2E22]/75 leading-relaxed">
                  {t.features.f2.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-100/60 flex items-center gap-2 text-xs font-bold text-amber-700">
                <span>Protocole PNSG Maroc</span>
                <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="bg-[#FAFDFB] p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/[0.03] flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#4ADE80]/15 to-transparent rounded-bl-full pointer-events-none" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center mb-6 group-hover:bg-[#4ADE80] group-hover:text-[#0F1F17] transition-all duration-300 shadow-sm">
                  <WifiOff className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1F17] mb-3 font-display">
                  {t.features.f3.title}
                </h3>
                <p className="text-sm text-[#1A2E22]/75 leading-relaxed">
                  {t.features.f3.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-100/60 flex items-center gap-2 text-xs font-bold text-[#059669]">
                <span>100% PWA Off-Grid</span>
                <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="bg-[#FAFDFB] p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/[0.03] flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-300/15 to-transparent rounded-bl-full pointer-events-none" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center mb-6 group-hover:bg-[#4ADE80] group-hover:text-[#0F1F17] transition-all duration-300 shadow-sm">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1F17] mb-3 font-display">
                  {t.features.f4.title}
                </h3>
                <p className="text-sm text-[#1A2E22]/75 leading-relaxed">
                  {t.features.f4.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-100/60 flex items-center gap-2 text-xs font-bold text-[#059669]">
                <span>Liaison CHR Régionale</span>
                <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </div>
            </motion.div>

          </motion.div>

        </div>
      </section>


      {/* ── 6. OFFLINE-FIRST ARCHITECTURE DIAGRAM ── */}
      <section className="py-16 bg-[#ECFDF5]/50 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#059669] text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200">
              <Cpu className="w-3.5 h-3.5" />
              <span>{t.architecture.tag}</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#0F1F17] font-display">
              {t.architecture.title}
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center flex-shrink-0 font-bold">
                <WifiOff className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F1F17] mb-1">{t.architecture.s1Title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{t.architecture.s1Desc}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center flex-shrink-0 font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F1F17] mb-1">{t.architecture.s2Title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{t.architecture.s2Desc}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center flex-shrink-0 font-bold">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F1F17] mb-1">{t.architecture.s3Title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{t.architecture.s3Desc}</p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ── 7. HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-[#FAFDFB] to-[#ECFDF5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#059669] text-xs font-bold uppercase tracking-wider mb-4 border border-[#34D399]/40 shadow-sm">
              {t.howItWorks.tag}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1F17] tracking-tight mb-4 font-display">
              {t.howItWorks.title}
            </h2>
            <p className="text-base sm:text-lg text-[#1A2E22]/70">
              {t.howItWorks.subtitle}
            </p>
          </motion.div>

          <div className="relative">
            {/* Dashed Line */}
            <div className="hidden lg:block absolute top-1/2 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-[#34D399]/60 -translate-y-6 z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/[0.04] text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0F1F17] text-[#4ADE80] font-black text-2xl flex items-center justify-center mb-6 shadow-md font-display">
                  {t.howItWorks.step1.num}
                </div>
                <h3 className="text-xl font-bold text-[#0F1F17] mb-3 font-display">
                  {t.howItWorks.step1.title}
                </h3>
                <p className="text-sm text-[#1A2E22]/75 leading-relaxed">
                  {t.howItWorks.step1.desc}
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-3xl border-2 border-[#34D399] shadow-2xl shadow-emerald-500/10 text-center flex flex-col items-center relative transform lg:-translate-y-4">
                <div className="absolute -top-3.5 bg-[#4ADE80] text-[#0F1F17] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Moteur Gemma 4 SFT
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#4ADE80] text-[#0F1F17] font-black text-2xl flex items-center justify-center mb-6 shadow-md font-display">
                  {t.howItWorks.step2.num}
                </div>
                <h3 className="text-xl font-bold text-[#0F1F17] mb-3 font-display">
                  {t.howItWorks.step2.title}
                </h3>
                <p className="text-sm text-[#1A2E22]/75 leading-relaxed">
                  {t.howItWorks.step2.desc}
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/[0.04] text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0F1F17] text-[#4ADE80] font-black text-2xl flex items-center justify-center mb-6 shadow-md font-display">
                  {t.howItWorks.step3.num}
                </div>
                <h3 className="text-xl font-bold text-[#0F1F17] mb-3 font-display">
                  {t.howItWorks.step3.title}
                </h3>
                <p className="text-sm text-[#1A2E22]/75 leading-relaxed">
                  {t.howItWorks.step3.desc}
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* ── 8. QUI SOMMES-NOUS ── */}
      <section id="about" className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image with Hotspot overlay */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-emerald-900/10 group">
                <img 
                  src="/team_clinic.jpg" 
                  alt="Équipe médicale marocaine devant un centre de santé dans le Haut Atlas" 
                  className="w-full h-[460px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1F17]/85 via-transparent to-transparent" />
                
                {/* Hotspot sur la clinique rurale */}
                <div className="absolute top-[30%] left-[60%]">
                  <div className="relative flex items-center justify-center group/spot">
                    <span className="w-6 h-6 rounded-full bg-[#4ADE80] animate-ping opacity-75" />
                    <span className="absolute w-5 h-5 rounded-full bg-[#4ADE80] border-2 border-white" />
                    <div className="absolute left-7 top-0 w-52 bg-white/95 backdrop-blur-md p-2.5 rounded-xl text-[11px] font-bold text-gray-900 shadow-xl border border-emerald-100 opacity-0 group-hover/spot:opacity-100 transition-opacity pointer-events-none">
                      📍 Centre de Santé Rurale Al Haouz (1800m altitude)
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="text-sm font-bold text-[#4ADE80] mb-1">
                    {lang === 'fr' ? 'Équipe Santé Rurale · Haut Atlas & Souss' : 'فريق الصحة القروية بالمغرب'}
                  </div>
                  <div className="text-xs text-gray-200">
                    {lang === 'fr' ? 'Dispensaire Mobile & Centres de Santé Al Haouz / Taroudant' : 'المراكز الصحية بإقليم الحوز وتارودانت'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Story Content */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="lg:col-span-6 flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] text-[#059669] text-xs font-bold uppercase tracking-wider mb-4 border border-[#34D399]/30">
                {t.about.tag}
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1F17] tracking-tight mb-6 font-display">
                {t.about.title}
              </h2>

              <p className="text-base text-[#1A2E22]/80 leading-relaxed mb-4">
                {t.about.p1}
              </p>

              <p className="text-base text-[#1A2E22]/80 leading-relaxed mb-8">
                {t.about.p2}
              </p>

              {/* Highlight Quote Box */}
              <div className="p-6 rounded-2xl bg-[#ECFDF5] border-l-4 border-[#34D399] w-full mb-8">
                <p className="text-sm font-semibold text-[#0F1F17] italic mb-3">
                  {t.about.quote}
                </p>
                <div className="text-xs font-bold text-[#059669]">
                  {t.about.founder}
                </div>
              </div>

              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-3.5 rounded-xl bg-[#0F1F17] hover:bg-emerald-950 text-[#4ADE80] font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>{lang === 'fr' ? 'Rejoindre le Collège Médical' : 'الانضمام للهيئة الطبية'}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </motion.div>

          </div>
        </div>
      </section>


      {/* ── 9. TESTIMONIALS ── */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-[#FAFDFB] to-[#ECFDF5]/40 border-t border-emerald-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#059669] text-xs font-bold uppercase tracking-wider mb-4 border border-[#34D399]/40 shadow-sm">
              {t.testimonials.tag}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1F17] tracking-tight mb-4 font-display">
              {t.testimonials.title}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/[0.03] flex flex-col justify-between">
              <p className="text-sm text-[#1A2E22]/80 leading-relaxed italic mb-8">
                « {t.testimonials.t1.quote} »
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-emerald-100/60">
                <img src="/avatar_midwife.jpg" alt={t.testimonials.t1.author} className="w-12 h-12 rounded-full object-cover border-2 border-[#34D399]" />
                <div>
                  <div className="font-bold text-sm text-[#0F1F17]">{t.testimonials.t1.author}</div>
                  <div className="text-xs text-[#059669] font-medium">{t.testimonials.t1.role}</div>
                  <div className="text-[11px] text-gray-400">{t.testimonials.t1.loc}</div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/[0.03] flex flex-col justify-between">
              <p className="text-sm text-[#1A2E22]/80 leading-relaxed italic mb-8">
                « {t.testimonials.t2.quote} »
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-emerald-100/60">
                <img src="/avatar_doctor.jpg" alt={t.testimonials.t2.author} className="w-12 h-12 rounded-full object-cover border-2 border-[#34D399]" />
                <div>
                  <div className="font-bold text-sm text-[#0F1F17]">{t.testimonials.t2.author}</div>
                  <div className="text-xs text-[#059669] font-medium">{t.testimonials.t2.role}</div>
                  <div className="text-[11px] text-gray-400">{t.testimonials.t2.loc}</div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/[0.03] flex flex-col justify-between">
              <p className="text-sm text-[#1A2E22]/80 leading-relaxed italic mb-8">
                « {t.testimonials.t3.quote} »
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-emerald-100/60">
                <img src="/avatar_nurse.jpg" alt={t.testimonials.t3.author} className="w-12 h-12 rounded-full object-cover border-2 border-[#34D399]" />
                <div>
                  <div className="font-bold text-sm text-[#0F1F17]">{t.testimonials.t3.author}</div>
                  <div className="text-xs text-[#059669] font-medium">{t.testimonials.t3.role}</div>
                  <div className="text-[11px] text-gray-400">{t.testimonials.t3.loc}</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ── 10. FINAL CTA ── */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-[#0F1F17] text-white p-10 sm:p-16 overflow-hidden shadow-2xl border border-emerald-800/40">
            
            {/* Glowing background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#4ADE80]/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4A574]/15 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#4ADE80] text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-500/30">
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Déploiement National' : 'إطلاق وطني'}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 font-display leading-tight">
                {t.cta.title}
              </h2>

              <p className="text-base sm:text-lg text-emerald-100/80 mb-10 leading-relaxed max-w-2xl mx-auto font-normal">
                {t.cta.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#4ADE80] hover:bg-[#34D399] text-[#0F1F17] font-extrabold text-base shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-3"
                >
                  <span>{t.cta.btn1}</span>
                  <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>

                <button 
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-base transition-all flex items-center justify-center gap-2"
                >
                  <span>{t.cta.btn2}</span>
                </button>
              </div>

              <div className="mt-8 text-xs text-emerald-300/70 font-medium">
                {t.cta.note}
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ── 11. FOOTER ── */}
      <footer className="bg-[#0A1610] text-white pt-16 pb-12 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-emerald-900/50">
            
            {/* Col 1 Brand */}
            <div className="md:col-span-5 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4ADE80] to-[#10B981] p-0.5">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <img src="/logo_icon.jpg" alt="Dar Al Oumouma" className="w-8 h-8 object-cover rounded-xl" />
                  </div>
                </div>
                <span className="font-extrabold text-xl tracking-tight text-white font-display">
                  Dar Al Oumouma
                </span>
              </div>
              <p className="text-sm text-emerald-100/70 leading-relaxed mb-6 max-w-sm">
                {t.footer.desc}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#4ADE80] bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-800/40">
                <MapPin className="w-4 h-4" />
                <span>{t.footer.address}</span>
              </div>
            </div>

            {/* Col 2 Platform */}
            <div className="md:col-span-2">
              <div className="font-bold text-sm text-emerald-400 mb-4">{t.footer.col1Title}</div>
              <ul className="space-y-2.5 text-xs text-emerald-100/70 font-medium">
                {t.footer.links1.map((item, idx) => (
                  <li key={idx}><a href="#sandbox" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Col 3 Resources */}
            <div className="md:col-span-2">
              <div className="font-bold text-sm text-emerald-400 mb-4">{t.footer.col2Title}</div>
              <ul className="space-y-2.5 text-xs text-emerald-100/70 font-medium">
                {t.footer.links2.map((item, idx) => (
                  <li key={idx}><a href="#about" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Col 4 Language & Contact */}
            <div className="md:col-span-3 flex flex-col justify-between">
              <div>
                <div className="font-bold text-sm text-emerald-400 mb-4">{t.footer.col3Title}</div>
                <div className="text-xs text-emerald-100/80 font-mono mb-2">{t.footer.email}</div>
                <div className="text-xs text-emerald-100/60">+212 522 00 11 22</div>
              </div>

              <div className="pt-6">
                <div className="text-xs text-emerald-100/60 mb-2">{lang === 'fr' ? 'Langue / اللغـة' : 'اللغة'}</div>
                <div className="inline-flex p-1 rounded-xl bg-emerald-950 border border-emerald-800/60 text-xs">
                  <button onClick={() => toggleLanguage('fr')} className={`px-3 py-1 rounded-lg ${lang === 'fr' ? 'bg-[#4ADE80] text-[#0F1F17] font-bold' : 'text-emerald-200'}`}>Français</button>
                  <button onClick={() => toggleLanguage('ar')} className={`px-3 py-1 rounded-lg ${lang === 'ar' ? 'bg-[#4ADE80] text-[#0F1F17] font-bold' : 'text-emerald-200'}`}>العربية</button>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-100/50">
            <div>{t.footer.rights}</div>
            <div className="flex items-center gap-6">
              <a href="#about" className="hover:text-emerald-300 transition-colors">Politique de Confidentialité</a>
              <a href="#about" className="hover:text-emerald-300 transition-colors">Mentions Légales CNDP 09-08</a>
              <a href="#about" className="hover:text-emerald-300 transition-colors">Protocole PNSG</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}
