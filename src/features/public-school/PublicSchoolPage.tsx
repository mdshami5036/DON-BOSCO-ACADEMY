import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../services/db';
import { School, Notice, ClassRoom } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  GraduationCap,
  Calendar,
  Bell,
  Award,
  CheckCircle2,
  Send,
  QrCode,
  Sparkles,
  Facebook,
  BookOpen,
  Users,
  Shield,
  Clock,
  Compass,
  Cpu,
  Trophy,
  ExternalLink,
  ChevronRight,
  Star,
  Check,
  ArrowRight,
  HeartHandshake,
  Lightbulb,
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle,
  PlayCircle,
  Laptop,
  Flame,
  UserCheck,
  BookMarked,
  Microscope,
  Palette,
  Music,
  Bus,
  Home,
  Target,
  Sparkle,
  Menu,
  X,
} from 'lucide-react';
import { Modal } from '../../components/common/UI';

// Animated Live Number Counter
const AnimatedCounter: React.FC<{ value: number; suffix?: string; duration?: number; decimals?: number }> = ({
  value,
  suffix = '',
  duration = 2,
  decimals = 0,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    const reqId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(reqId);
  }, [value, duration]);

  return (
    <span>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
};

export const PublicSchoolPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [school, setSchool] = useState<School | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'ACADEMIC' | 'EXAM' | 'ADMISSION' | 'HOLIDAY'>('all');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [activeWing, setActiveWing] = useState<'pre-primary' | 'primary' | 'middle' | 'secondary'>('primary');
  const [noticeSearch, setNoticeSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Online Admission Modal & Form State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [admissionSubmitting, setAdmissionSubmitting] = useState(false);
  const [admissionSuccess, setAdmissionSuccess] = useState(false);

  const [admissionForm, setAdmissionForm] = useState({
    student_name: '',
    dob: '2018-05-12',
    gender: 'Male',
    applying_class_id: '',
    previous_school: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    async function loadSchoolData() {
      setIsLoading(true);
      try {
        const s = await db.getPrimarySchool();
        if (s) {
          setSchool(s);
          const [nList, cList] = await Promise.all([
            db.getNotices(s.id, 'ALL'),
            db.getClasses(s.id),
          ]);
          setNotices(nList);
          setClasses(cList);
          if (cList.length > 0) {
            setAdmissionForm((prev) => ({ ...prev, applying_class_id: cList[0].id }));
          }
        }
      } catch (err) {
        console.error('Error loading Don Bosco Academy portal:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSchoolData();
  }, []);

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    setAdmissionSubmitting(true);
    try {
      await db.createAdmission({
        school_id: school.id,
        ...admissionForm,
      });
      setAdmissionSuccess(true);
      success('Admission inquiry submitted successfully! The school admissions desk will contact you.');
      setTimeout(() => {
        setIsAdmissionModalOpen(false);
        setAdmissionSuccess(false);
        setAdmissionForm({
          student_name: '',
          dob: '2018-05-12',
          gender: 'Male',
          applying_class_id: classes[0]?.id || '',
          previous_school: '',
          parent_name: '',
          parent_phone: '',
          parent_email: '',
          address: '',
          notes: '',
        });
      }, 2500);
    } catch (err: any) {
      toastError(err.message || 'Error submitting application');
    } finally {
      setAdmissionSubmitting(false);
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchCategory =
      activeTab === 'all' ||
      (activeTab === 'ACADEMIC' && (n.category === 'ACADEMIC' || !n.category)) ||
      (activeTab === 'EXAM' && n.category === 'EXAM') ||
      (activeTab === 'ADMISSION' && n.category === 'ADMISSION') ||
      (activeTab === 'HOLIDAY' && (n.category === 'HOLIDAY' || n.category === 'EVENTS'));

    const matchSearch =
      noticeSearch === '' ||
      n.title.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(noticeSearch.toLowerCase());

    return matchCategory && matchSearch;
  });

  if (isLoading || !school) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="w-14 h-14 border-4 border-sapphire-600 border-t-coral-500 rounded-full mb-4 shadow-lg"
        />
        <p className="text-base font-bold tracking-wide text-sapphire-900 font-display">
          Loading DON BOSCO ACADEMY Official Portal...
        </p>
      </div>
    );
  }

  const wingData = {
    'pre-primary': {
      title: 'Pre-Primary Wing (Play, Nursery, LKG, UKG)',
      badge: 'Early Childhood Foundational Stage',
      desc: 'Play-based experiential learning fostering curiosity, sensory-motor skills, cognitive thinking, and emotional growth in a caring, safe environment.',
      features: ['Activity-Based Smart Play Classrooms', 'Phonics, Rhymes & Language Immersion', 'Motor Skills & Creative Art Play', 'Caring Faculty & 1:15 Teacher-Student Ratio'],
      image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&auto=format&fit=crop&q=80',
    },
    'primary': {
      title: 'Primary Wing (Classes 1st to 5th)',
      badge: 'Core Academic & Value Building',
      desc: 'Comprehensive CBSE foundational curriculum emphasizing conceptual clarity in Mathematics, Science, Languages (English, Hindi, Sanskrit), and Environmental Studies.',
      features: ['STEM-Driven Interactive Science & Math Lab', 'Reading Culture & Dedicated Children’s Library', 'Computer Fundamentals & Digital Literacy', 'Yoga, Karate, Physical Fitness & Sports'],
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    },
    'middle': {
      title: 'Middle School Wing (Classes 6th to 8th)',
      badge: 'Analytical & Experimental Inquiry',
      desc: 'Transition to analytical rigor with integrated science experiments, coding fundamentals, collaborative projects, debate, and leadership workshops.',
      features: ['Hands-on Physics, Chemistry & Biology Labs', 'AI, Robotics & Python Programming Basics', 'Public Speaking, Quizzing & Olympiad Training', 'Comprehensive Moral & Personality Development'],
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    },
    'secondary': {
      title: 'Secondary Wing (Classes 9th & 10th)',
      badge: 'CBSE Board Excellence & Career Foundation',
      desc: 'Intensive academic preparation for CBSE Class X Board examinations with specialized faculty mentoring, periodic tests, remedial support, and career guidance.',
      features: ['100% CBSE Board Pass Track Record (99.4% Avg)', 'Rigorous Periodic Assessment & Mock Board Series', 'Career Counseling & NTSE / Olympiad Mentorship', 'Modern Audio-Visual Smart Lecture Theatres'],
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      
      {/* 1. TOP ANNOUNCEMENT & CONTACT BAR */}
      <div className="bg-[#0F2756] text-white border-b border-sapphire-800/80 text-xs py-2 px-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-slate-200">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{school.address}, {school.city} ({school.postal_code || '843326'})</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <a href={`mailto:${school.email}`} className="hover:text-amber-300 transition-colors">
                {school.email}
              </a>
            </span>
            <span className="hidden md:flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <a href={`tel:${school.phone}`} className="hover:text-amber-300 transition-colors">
                {school.phone}
              </a>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {school.facebook_url && (
              <a
                href={school.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-white hover:bg-blue-600 border border-white/10 text-[11px] font-bold transition"
              >
                <Facebook className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Facebook</span>
              </a>
            )}

            <Link
              to="/verify"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 hover:bg-amber-400/30 text-[11px] font-bold transition"
            >
              <QrCode className="w-3 h-3 text-amber-400" />
              <span>Verify Docs</span>
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-bold text-xs shadow-sm hover:shadow-indigo-glow transition"
            >
              <span>Portal Login</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STICKY GLASS HEADER WITH REAL BRAND CREST */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-8 z-40 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative shrink-0">
              <img
                src="/assets/branding/don-bosco-logo.png"
                alt={school.name}
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl object-contain bg-white border border-sapphire-700/20 p-0.5 shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-black text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-full border border-white shadow-2xs whitespace-nowrap">
                ESTD 1997
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-[#0B192C] tracking-tight font-display whitespace-nowrap">
                {school.name}
              </h1>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="text-coral-500 font-bold tracking-wide">
                  ★ {school.tagline || 'KNOWLEDGE IS POWER'} ★
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-emerald-700 font-semibold hidden sm:inline">
                  {school.school_type || 'Residential Cum Day School'}
                </span>
                <span className="text-slate-300 hidden md:inline">•</span>
                <span className="text-sapphire-800 font-bold hidden md:inline">
                  {school.academic_pattern || 'CBSE Pattern'}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-xs 2xl:text-sm font-bold text-slate-700 shrink-0">
            <a href="#about" className="hover:text-indigo-600 transition-colors whitespace-nowrap">About</a>
            <a href="#academics" className="hover:text-indigo-600 transition-colors whitespace-nowrap">Academic Wings</a>
            <Link
              to="/exam-portal"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 hover:text-indigo-900 transition-colors whitespace-nowrap font-extrabold shadow-2xs"
            >
              <span>🎓 ERP / EXAM PORTAL</span>
            </Link>
            <a href="#principal" className="hover:text-indigo-600 transition-colors whitespace-nowrap">Principal's Desk</a>
            <a href="#notices" className="hover:text-indigo-600 transition-colors whitespace-nowrap">Notices</a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors whitespace-nowrap">Contact</a>
          </nav>

          {/* Right Action: Admission Button + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsAdmissionModalOpen(true)}
              className="relative group overflow-hidden px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-coral-500 via-coral-600 to-[#EB3C16] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-coral-500/30 hover:shadow-coral-glow hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-bounce shrink-0" />
                <span className="whitespace-nowrap">Admission 2026-27</span>
              </span>
              <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="xl:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="xl:hidden border-t border-slate-100 bg-white/98 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
              <a
                href="#about"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                🏫 About School
              </a>
              <a
                href="#academics"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                📚 Academic Wings
              </a>
              <Link
                to="/exam-portal"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition font-extrabold flex items-center gap-1.5"
              >
                🎓 ERP / EXAM PORTAL
              </Link>
              <a
                href="#principal"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                ✍ Principal's Desk
              </a>
              <a
                href="#notices"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                📢 Live Notices
              </a>
              <a
                href="#contact"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                📞 Contact School
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 3. DYNAMIC SPLIT HERO SECTION WITH 3D FLOATING WIDGETS */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sapphire-50/50 via-white to-[#F8FAFC] py-14 sm:py-20 lg:py-24 border-b border-slate-200">
        {/* Subtle decorative background blur orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-indigo-200/40 via-coral-100/30 to-amber-200/30 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: School Value Proposition & CTAs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sapphire-50 border border-sapphire-200 text-sapphire-800 text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-coral-500 animate-ping" />
                <span className="text-sapphire-900 font-extrabold">CBSE Pattern Standard</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-700">Play to Class 10th</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold">ESTD 1997</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0B192C] leading-[1.15] tracking-tight font-display">
                Nurturing Future Leaders with{' '}
                <span className="bg-gradient-to-r from-sapphire-800 via-indigo-600 to-coral-500 bg-clip-text text-transparent">
                  Academic Excellence
                </span>{' '}
                & Modern Innovation.
              </h1>

              <p className="text-base sm:text-lg text-[#334155] leading-relaxed max-w-2xl">
                Welcome to <strong>DON BOSCO ACADEMY</strong>, Raipur Bazar, Nanpur, Sitamarhi. Empowering students since 1997 with holistic CBSE pedagogy, world-class smart classrooms, digital STEM labs, value-centric moral training, and premier residential facilities.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsAdmissionModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-coral-500 to-[#EB3C16] text-white font-black text-sm sm:text-base shadow-lg shadow-coral-500/30 hover:shadow-coral-glow hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>Apply for Admission 2026-27</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/verify"
                  className="px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-sm sm:text-base shadow-soft-card hover:bg-slate-50 hover:border-slate-400 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>📜 Verify Certificate / Marksheet</span>
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">100% Smart Labs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">Expert Faculty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">Safe Campus & Hostel</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Visual with 3D Floating Achievement Widgets */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Campus Card */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=900&auto=format&fit=crop&q=80"
                    alt="Don Bosco Academy Campus"
                    className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="p-5 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-base text-slate-900 font-display">Campus Main Wing</h4>
                        <p className="text-xs text-slate-500">Raipur Bazar, Nanpur, Sitamarhi, Bihar</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        Open for Admissions
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Widget 1: 99.4% Board Pass Rate (Top Left) */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -top-6 -left-6 sm:-left-8 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-soft-hover border border-slate-200 flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-black shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-900 font-display">99.4% Pass Rate</div>
                    <div className="text-[11px] text-slate-500 font-medium">CBSE Board Exam Honors</div>
                  </div>
                </motion.div>

                {/* Floating Widget 2: 1500+ Active Scholars (Bottom Right) */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -right-6 sm:-right-8 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-soft-hover border border-slate-200 flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-sapphire-50 border border-sapphire-200 flex items-center justify-center text-sapphire-700 shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-900 font-display">1500+ Students</div>
                    <div className="text-[11px] text-slate-500 font-medium">Holistic Day & Boarding</div>
                  </div>
                </motion.div>

                {/* Floating Widget 3: Digital QR Security Badge (Center Bottom) */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 1 }}
                  className="hidden sm:flex absolute top-1/2 -right-6 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-soft-card border border-slate-200 items-center gap-2 text-xs font-bold text-indigo-700"
                >
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Verifiable Marksheets</span>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. LIVE STATS COUNTER STRIP */}
      <section className="bg-[#0F2756] text-white py-10 sm:py-14 border-y border-sapphire-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-sapphire-800/60">
            
            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-400 font-display">
                <AnimatedCounter value={28} suffix="+" />
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-1">Years of Legacy (Estd 1997)</p>
            </div>

            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display">
                <AnimatedCounter value={1500} suffix="+" />
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-1">Enrolled Happy Scholars</p>
            </div>

            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-coral-400 font-display">
                <AnimatedCounter value={99.4} suffix="%" decimals={1} />
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-1">CBSE Board Distinction</p>
            </div>

            <div className="pt-4 sm:pt-0 sm:px-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 font-display">
                <AnimatedCounter value={100} suffix="%" />
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-1">Smart Labs & Digitized Class</p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. ACADEMIC WINGS INTERACTIVE SECTION */}
      <section id="academics" className="py-16 sm:py-24 bg-[#F8FAFC] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-coral-600 font-extrabold text-xs tracking-wider uppercase bg-coral-50 px-3 py-1 rounded-full border border-coral-200">
              Structured CBSE Pedagogy
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B192C] mt-2 font-display">
              Academic Wings & Curriculum Structure
            </h2>
            <p className="text-base text-[#334155] mt-3">
              Tailored developmental and scholastic learning tracks from Playgroup foundation to Class 10th CBSE Board success.
            </p>

            {/* Interactive Tab Switcher with sliding pill */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-slate-200/80 rounded-2xl max-w-2xl mx-auto">
              {(['pre-primary', 'primary', 'middle', 'secondary'] as const).map((wing) => (
                <button
                  key={wing}
                  onClick={() => setActiveWing(wing)}
                  className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all duration-200 ${
                    activeWing === wing ? 'text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {activeWing === wing && (
                    <motion.div
                      layoutId="activeAcademicWing"
                      className="absolute inset-0 bg-[#0F2756] rounded-xl shadow-md"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{wing.replace('-', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Display Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWing}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-5">
                <span className="inline-block px-3 py-1 rounded-full bg-sapphire-50 text-sapphire-800 font-bold text-xs border border-sapphire-200">
                  {wingData[activeWing].badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                  {wingData[activeWing].title}
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  {wingData[activeWing].desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {wingData[activeWing].features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setIsAdmissionModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-glow transition flex items-center gap-2"
                  >
                    <span>Inquire for {activeWing.toUpperCase()} Admission</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md">
                  <img
                    src={wingData[activeWing].image}
                    alt={wingData[activeWing].title}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* 6. SMART CAMPUS BENTO GRID */}
      <section id="campus" className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-indigo-600 font-extrabold text-xs tracking-wider uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              World-Class Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B192C] mt-2 font-display">
              Smart Campus & 21st-Century Facilities
            </h2>
            <p className="text-base text-[#334155] mt-3">
              State-of-the-art labs, digitally equipped smart rooms, modern athletic arenas, and peaceful residential wings designed for holistic excellence.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Computer & AI Lab (Large 2 Col) */}
            <div className="md:col-span-2 bg-gradient-to-br from-sapphire-900 to-[#0B1B3C] text-white p-7 rounded-3xl shadow-soft-hover border border-sapphire-800 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 mb-4">
                  <Laptop className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                  STEM & Coding
                </span>
                <h3 className="text-2xl font-black text-white mt-3 font-display">
                  Computer & AI Technology Center
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-md">
                  High-speed networked computer systems equipped with coding compilers, robotics kits, and digital literacy tools preparing students for the AI revolution.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>1:1 Student Computer Ratio</span>
                <span className="text-amber-400 font-bold">100% Broadband Connected</span>
              </div>
            </div>

            {/* Card 2: Smart Classrooms */}
            <div className="bg-[#F8FAFC] p-6 rounded-3xl shadow-soft-card border border-slate-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Interactive Smart Panels</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Touch-enabled interactive flat panels with 3D audio-visual lessons making abstract concepts easy to understand.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 mt-4 flex items-center gap-1">
                Visual Pedagogic Modules <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 3: Science Labs */}
            <div className="bg-[#F8FAFC] p-6 rounded-3xl shadow-soft-card border border-slate-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                  <Microscope className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Composite Science Lab</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Full apparatus for Physics, Chemistry, and Biology experiments fostering an empirical scientific temperament.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
                Hands-on Experiments <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 4: Library */}
            <div className="bg-[#F8FAFC] p-6 rounded-3xl shadow-soft-card border border-slate-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Enriched Central Library</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  5,000+ volumes, encyclopedia series, CBSE reference guides, journals, and a quiet reading haven for book lovers.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 mt-4 flex items-center gap-1">
                Digital & Print Catalogs <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 5: Sports & Physical Education */}
            <div className="bg-[#F8FAFC] p-6 rounded-3xl shadow-soft-card border border-slate-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-coral-50 border border-coral-200 flex items-center justify-center text-coral-600 mb-4">
                  <Trophy className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Sports Arena & Karate</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Football field, cricket pitch, badminton, table tennis, and martial arts self-defense training for all students.
                </p>
              </div>
              <span className="text-xs font-bold text-coral-700 mt-4 flex items-center gap-1">
                Physical Fitness Focus <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 6: Residential Hostel & Transport (2 Col) */}
            <div className="md:col-span-2 bg-gradient-to-r from-slate-900 to-sapphire-950 text-white p-7 rounded-3xl shadow-soft-hover border border-slate-800 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
                    <Bus className="w-5 h-5" />
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                  Care & Safety First
                </span>
                <h3 className="text-2xl font-black text-white mt-3 font-display">
                  Residential Hostel & Safe Bus Transit
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-lg">
                  Clean, nutritious dining, 24/7 warden supervision, secure premises, and GPS-equipped school buses connecting Nanpur, Raipur Bazar, Sitamarhi, and adjoining zones.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Separate Boys & Girls Quarters</span>
                <span className="text-emerald-400 font-bold">24x7 Security & CCTV</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. PRINCIPAL'S DESK & LEADERSHIP ADDRESS */}
      <section id="principal" className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-soft-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

            {/* Principal Photo & Credential Pillar */}
            <div className="lg:col-span-4 text-center lg:text-left space-y-4">
              <div className="relative inline-block mx-auto lg:mx-0">
                <img
                  src="/assets/branding/don-bosco-logo.png"
                  alt="Principal Md. Shami Ahmad"
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl object-contain bg-slate-50 border-4 border-sapphire-800/20 p-2 shadow-lg mx-auto"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0F2756] text-white px-4 py-1 rounded-full text-xs font-extrabold shadow-md whitespace-nowrap">
                  Principal &amp; Head of Institution
                </div>
              </div>
              <div className="pt-3">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">Md. Shami Ahmad</h3>
                <p className="text-xs font-bold text-coral-600 uppercase tracking-wider">Don Bosco Academy Leadership</p>
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-500 mt-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>28+ Years of Academic Administration</span>
                </div>
              </div>
            </div>

            {/* Principal's Message & Verified Signature */}
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sapphire-50 text-sapphire-900 text-xs font-bold border border-sapphire-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Message from the Principal's Desk</span>
              </div>

              <blockquote className="text-base sm:text-lg text-slate-700 italic leading-relaxed font-serif border-l-4 border-sapphire-700 pl-4">
                "At Don Bosco Academy, we firmly believe that true education goes beyond textbooks—it is the holistic cultivation of intellect, character, morality, and compassionate leadership. Since 1997, we have dedicated ourselves to providing rural and semi-urban learners of Sitamarhi with quality education on par with national standards."
              </blockquote>

              <p className="text-sm text-slate-600 leading-relaxed">
                Our blended CBSE methodology fuses rigor in core sciences and mathematics with hands-on computer innovation, creative arts, and sportsmanship. We welcome parents and students into our Don Bosco family to achieve stellar milestones together.
              </p>

              {/* Digital Verification & Stamp/Signature Block */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Endorsement</div>
                  <div className="text-sm font-extrabold text-slate-900">DON BOSCO ACADEMY, SITAMARHI</div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Official Stamp */}
                  <div className="text-center">
                    <img
                      src="/assets/branding/don-bosco-stamp.svg"
                      alt="Official Seal"
                      className="h-12 w-auto object-contain opacity-90 mx-auto"
                    />
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Institutional Seal</div>
                  </div>

                  {/* Principal Signature */}
                  <div className="text-center">
                    <img
                      src="/assets/branding/principal-signature.svg"
                      alt="Principal Signature"
                      className="h-10 w-auto object-contain mx-auto"
                    />
                    <div className="border-t border-slate-400 w-24 mx-auto my-0.5"></div>
                    <div className="text-[10px] font-bold text-slate-700 uppercase">Authorized Signatory</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 8. LIVE NOTICE BOARD & ANNOUNCEMENTS */}
      <section id="notices" className="py-16 sm:py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-coral-600 font-extrabold text-xs tracking-wider uppercase bg-coral-50 px-3 py-1 rounded-full border border-coral-200">
                School Circulars
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B192C] mt-2 font-display">
                Notice Board &amp; Academic News
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Stay updated with the latest exam schedules, admission circulars, holidays, and events.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'ACADEMIC', 'EXAM', 'ADMISSION', 'HOLIDAY'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-[#0F2756] text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab === 'all' ? 'All Notices' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Notices Grid */}
          {filteredNotices.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-base">No notices found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotices.slice(0, 6).map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="cursor-pointer bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        notice.category === 'EXAM'
                          ? 'bg-amber-100 text-amber-800'
                          : notice.category === 'ADMISSION'
                          ? 'bg-coral-100 text-coral-800'
                          : notice.category === 'HOLIDAY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {notice.category || 'General'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDDMMYYYY(notice.publish_date || notice.created_at)}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 font-display">
                      {notice.title}
                    </h4>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>Read Full Circular</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 9. CONTACT & ADMISSION ENQUIRY SECTION */}
      <section id="contact" className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-sapphire-900 via-[#0F2756] to-slate-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-sapphire-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Contact Info Column */}
              <div className="lg:col-span-6 space-y-6">
                <span className="px-3 py-1 rounded-full bg-coral-500/20 text-coral-300 font-extrabold text-xs border border-coral-500/30">
                  Connect with Don Bosco Academy
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
                  Admissions Open for Session 2026-2027
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Join a tradition of academic distinction, moral integrity, and technological innovation. Visit our campus or submit an inquiry to schedule an interaction.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Campus Location</div>
                      <div className="text-sm font-bold text-white">{school.address}, {school.city}, Sitamarhi (843326)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Official Inquiries</div>
                      <div className="text-sm font-bold text-white">{school.email}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Helpdesk Hotline</div>
                      <div className="text-sm font-bold text-white">{school.phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Call-to-Action Card */}
              <div className="lg:col-span-6 bg-white text-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 space-y-5">
                <div className="flex items-center gap-2 text-coral-600 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Quick Admission Desk
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-display">Schedule a Campus Visit</h3>
                <p className="text-xs text-slate-600">
                  Fill in your details and our admission officer will get in touch with you within 24 hours with syllabus, fee details, and entrance guidelines.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setIsAdmissionModalOpen(true)}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-coral-500 to-[#EB3C16] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-coral-500/30 hover:shadow-coral-glow hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Open Online Admission Form</span>
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    Already a student or staff? Go to Portal Login →
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 10. COMPREHENSIVE FOOTER */}
      <footer className="bg-[#0B192C] text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            
            {/* Brand Col */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/branding/don-bosco-logo.png"
                  alt={school.name}
                  className="w-12 h-12 rounded-xl object-contain bg-white p-1"
                />
                <div>
                  <div className="text-base font-black text-white font-display uppercase tracking-tight">
                    {school.name}
                  </div>
                  <div className="text-[11px] text-amber-400 font-bold">
                    {school.tagline || 'KNOWLEDGE IS POWER'} • ESTD 1997
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                A premier CBSE pattern Residential Cum Day School in Raipur Bazar, Nanpur, Sitamarhi, Bihar (843326). Fostering scholastic achievement, moral character, and lifelong leadership.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <div className="text-sm font-bold text-white mb-3 font-display uppercase tracking-wider">
                Quick Navigation
              </div>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" className="hover:text-white transition">About Don Bosco</a></li>
                <li><a href="#academics" className="hover:text-white transition">Curriculum & Wings</a></li>
                <li><Link to="/login" className="hover:text-white transition font-semibold text-indigo-300">🎓 ERP / Exam Portal</Link></li>
                <li><a href="#principal" className="hover:text-white transition">Principal's Address</a></li>
                <li><a href="#notices" className="hover:text-white transition">Notice Board</a></li>
                <li><Link to="/verify" className="hover:text-white transition text-amber-400 font-semibold">Verify Documents</Link></li>
              </ul>
            </div>

            {/* Portals & Login */}
            <div>
              <div className="text-sm font-bold text-white mb-3 font-display uppercase tracking-wider">
                System Portals
              </div>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-white transition">Principal & Admin ERP</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Teacher Portal</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Student & Parent Portal</Link></li>
                <li><Link to="/verify" className="hover:text-white transition">CBSE Marksheet QR Verify</Link></li>
                <li><Link to="/verify" className="hover:text-white transition">Certificate Authentication</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} <strong>{school.name}</strong>, Sitamarhi. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Affiliated to CBSE Pattern</span>
              <span>•</span>
              <span>ESTD: 1997</span>
              <span>•</span>
              <Link to="/login" className="text-indigo-400 hover:underline">ERP Login</Link>
            </div>
          </div>

        </div>
      </footer>

      {/* ADMISSION INQUIRY MODAL */}
      <Modal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        title="Online Admission Inquiry (2026-2027)"
        size="lg"
      >
        {admissionSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">Inquiry Registered Successfully!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you for applying to Don Bosco Academy. Our admissions coordinator will contact you shortly on the provided phone number.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAdmissionSubmit} className="space-y-4">
            <div className="p-3 bg-sapphire-50 border border-sapphire-200 rounded-xl text-xs text-sapphire-900 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-coral-500 shrink-0" />
              <span>Applying for Academic Session 2026-2027 (Classes Play to 10th)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student's Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aman Singh"
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-sapphire-500 focus:outline-none"
                  value={admissionForm.student_name}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, student_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Applying For Class *</label>
                <select
                  required
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-sapphire-500 focus:outline-none"
                  value={admissionForm.applying_class_id}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, applying_class_id: e.target.value })}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Singh"
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-sapphire-500 focus:outline-none"
                  value={admissionForm.parent_name}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, parent_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-sapphire-500 focus:outline-none"
                  value={admissionForm.parent_phone}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, parent_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. parent@gmail.com"
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-sapphire-500 focus:outline-none"
                  value={admissionForm.parent_email}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, parent_email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-sapphire-500 focus:outline-none"
                  value={admissionForm.dob}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, dob: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                placeholder="Village / Town, Post Office, District"
                className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-sapphire-500 focus:outline-none"
                value={admissionForm.address}
                onChange={(e) => setAdmissionForm({ ...admissionForm, address: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAdmissionModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={admissionSubmitting}
                className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-extrabold text-xs shadow-md shadow-coral-500/20 hover:shadow-coral-glow transition flex items-center gap-1.5"
              >
                {admissionSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* NOTICE DETAILS MODAL */}
      {selectedNotice && (
        <Modal
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          title={selectedNotice.title}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span className="px-2.5 py-0.5 rounded-full bg-sapphire-50 text-sapphire-800 font-bold uppercase text-[11px]">
                {selectedNotice.category || 'General'}
              </span>
              <span>Published: {formatDDMMYYYY(selectedNotice.publish_date || selectedNotice.created_at)}</span>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedNotice.content}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
