import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { SafeImage } from '../../lib/image-helper';
import { Modal } from '../../components/common/UI';

export const PublicSchoolPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [school, setSchool] = useState<School | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'exam' | 'events'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Online Admission Modal & Form State
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [admissionSubmitting, setAdmissionSubmitting] = useState(false);
  const [admissionSuccess, setAdmissionSuccess] = useState(false);

  const [admissionForm, setAdmissionForm] = useState({
    student_name: '',
    dob: '2016-04-10',
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
      success('Admission inquiry submitted successfully! The school office will contact you.');
      setTimeout(() => {
        setIsAdmissionModalOpen(false);
        setAdmissionSuccess(false);
      }, 3000);
    } catch (err: any) {
      toastError(err.message || 'Error submitting application');
    } finally {
      setAdmissionSubmitting(false);
    }
  };

  if (isLoading || !school) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="animate-spin w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full mb-4" />
        <p className="text-base font-bold tracking-wide text-amber-300 font-serif">Loading DON BOSCO ACADEMY Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. TOP NOTIFICATION / CONTACT BAR */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-b border-blue-900/60 text-xs py-2 px-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {school.address}, {school.city} ({school.postal_code || '843326'})
            </span>
            <span className="hidden sm:flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <a href={`mailto:${school.email}`} className="hover:text-amber-300 transition">
                {school.email}
              </a>
            </span>
            <span className="hidden md:flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <a href={`tel:${school.phone}`} className="hover:text-amber-300 transition">
                {school.phone}
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {school.facebook_url && (
              <a
                href={school.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-[11px] font-bold transition"
              >
                <Facebook className="w-3.5 h-3.5 fill-current" />
                <span>Facebook</span>
              </a>
            )}

            <Link
              to="/verify"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-[11px] font-bold transition"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Verify Marksheet/Cert</span>
            </Link>

            <Link
              to="/login"
              className="px-3.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold text-xs transition shadow-md shadow-blue-600/20"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </div>

      {/* 2 & 3. SCHOOL LOGO, BRAND HEADER & NAVIGATION */}
      <header className="bg-slate-900/95 border-b border-slate-800 sticky top-9 z-30 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="/assets/branding/don-bosco-logo.png"
              alt={school.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-white border-2 border-amber-500/40 p-1 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform"
            />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-serif">
                {school.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold mt-0.5">
                <span className="text-amber-400 font-mono tracking-wider">
                  ★ {school.tagline || 'KNOWLEDGE IS POWER'} ★
                </span>
                <span className="text-slate-400 hidden sm:inline">• ESTD: {school.established_year || '1997'}</span>
                <span className="text-emerald-400 hidden md:inline">• {school.academic_pattern || 'CBSE Pattern'}</span>
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="#about" className="hover:text-amber-400 transition">About</a>
            <a href="#academics" className="hover:text-amber-400 transition">Academics</a>
            <a href="#facilities" className="hover:text-amber-400 transition">Facilities</a>
            <a href="#admissions" className="hover:text-amber-400 transition">Admissions</a>
            <a href="#activities" className="hover:text-amber-400 transition">Activities</a>
            <a href="#notices" className="hover:text-amber-400 transition">Notices</a>
            <a href="#contact" className="hover:text-amber-400 transition">Contact</a>
            <button
              onClick={() => setIsAdmissionModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              Apply Online
            </button>
          </nav>
        </div>
      </header>

      {/* 4. MAIN SCHOOL HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 py-16 md:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Excellence in Education Since 1997 • Raipur Bazar
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight font-serif tracking-tight">
                Nurturing Minds,<br />
                <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                  Inspiring Greatness.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Welcome to <strong>DON BOSCO ACADEMY</strong>, Raipur Bazar, Nanpur, Sitamarhi (Bihar). 
                A premier <strong>Residential Cum Day School</strong> operating on the <strong>CBSE Pattern</strong> from 
                <strong> Play Group to Class 10th</strong>. Fostering academic rigor, moral character, and discipline for over two decades.
              </p>

              {/* Highlights Pill Badges */}
              <div className="flex flex-wrap gap-3 pt-1">
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> CBSE Curriculum
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Play Group to Class 10th
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Residential Hostel Facilities
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => setIsAdmissionModalOpen(true)}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 text-sm uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Admission 2026-27
                </button>
                <a
                  href="#contact"
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-2xl text-sm transition flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-amber-400" /> Contact Campus
                </a>
              </div>
            </div>

            {/* Hero Main Banner Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-900 shadow-2xl p-2 group hover:border-amber-500/40 transition-all">
                <SafeImage
                  src={school.banner_url || '/assets/branding/main-banner.svg'}
                  alt="Don Bosco Academy Main Banner"
                  fallbackSrc="/assets/branding/main-banner.svg"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent rounded-2xl flex flex-col justify-end p-6">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                    DON BOSCO ACADEMY • RAIPUR BAZAR
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1 font-serif">
                    Empowering Every Student to Lead
                  </h3>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5 & 6. SCHOOL INTRODUCTION & ABOUT DON BOSCO ACADEMY */}
      <section id="about" className="py-20 bg-slate-900/50 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
              Institutional Heritage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-serif">
              About Don Bosco Academy
            </h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Founded in 1997 at Raipur Bazar, Nanpur, Sitamarhi (Bihar), Don Bosco Academy was established
              with a commitment to provide high quality CBSE pattern education in a disciplined, character-building atmosphere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-blue-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Our Vision</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                To cultivate enlightened, courageous, and compassionate leaders equipped with deep knowledge,
                scientific inquiry, moral uprightness, and global competence.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-amber-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Our Mission</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Delivering holistic education that fuses rigorous CBSE academic curriculum with sports, moral values,
                leadership training, and individualized student mentoring.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Core Values</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                "Knowledge is Power" — Integrity, Discipline, Academic Rigor, Respect for Heritage, and Community Service
                form the cornerstone of life at Don Bosco Academy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRINCIPAL'S MESSAGE */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-4 text-center lg:text-left space-y-4">
                <div className="relative inline-block mx-auto">
                  <SafeImage
                    src={school.principal_photo_url}
                    alt={school.principal_name}
                    fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
                    className="w-48 h-48 md:w-56 md:h-56 rounded-3xl object-cover border-4 border-amber-500/30 shadow-2xl mx-auto"
                  />
                  <div className="absolute -bottom-3 right-4 px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-full uppercase tracking-wider shadow">
                    Principal Desk
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-serif">{school.principal_name}</h3>
                  <p className="text-xs text-amber-400 font-mono">Head of Institution • Don Bosco Academy</p>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                  Leadership Address
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                  "Education is the most powerful weapon which you can use to change the world."
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  At DON BOSCO ACADEMY, our mission extends far beyond textbooks and examinations. 
                  Since 1997, our institution in Raipur Bazar has stood as a center of scholastic excellence and character formation. 
                  We believe that every child possesses unique talent and curiosity.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Our dedicated faculty, modern digital infrastructure, safe residential hostel facilities, and CBSE curriculum 
                  ensure that every student emerges confident and prepared for the future. We warmly invite parents to visit 
                  our campus and become part of our institution.
                </p>
                <div className="pt-2">
                  <SafeImage
                    src={school.principal_signature_url}
                    alt="Signature"
                    fallbackSrc="/assets/branding/principal-signature.svg"
                    className="h-10 object-contain brightness-200"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 8 & 9. ACADEMIC INFORMATION & CLASSES (PLAY TO CLASS 10TH) */}
      <section id="academics" className="py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
              Academic Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-serif">
              Curriculum & Classes Offered
            </h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-300 text-sm sm:text-base">
              Comprehensive CBSE pattern education designed for systematic intellectual growth from Play Group to Class 10th.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-pink-500/40 transition">
              <div className="px-3 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-bold rounded-lg w-fit">
                Early Childhood
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Pre-Primary Wing</h3>
              <p className="text-xs text-amber-300 font-semibold">Play Group, Nursery, LKG, UKG</p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• Activity-based joyful learning</li>
                <li>• Phonics & language development</li>
                <li>• Motor skills & creative play</li>
                <li>• Caring and attentive teachers</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-blue-500/40 transition">
              <div className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-lg w-fit">
                Foundational
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Primary Wing</h3>
              <p className="text-xs text-amber-300 font-semibold">Class 1 to Class 5</p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• Strong English & Hindi foundations</li>
                <li>• Mathematics & Mental Reasoning</li>
                <li>• Environmental Studies (EVS)</li>
                <li>• Computer Literacy & General Science</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition">
              <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-lg w-fit">
                Preparatory
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Middle Wing</h3>
              <p className="text-xs text-amber-300 font-semibold">Class 6 to Class 8</p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• Specialized Science (Phy/Chem/Bio)</li>
                <li>• Social Sciences & History</li>
                <li>• Third Language (Sanskrit / Urdu)</li>
                <li>• Coding & Information Technology</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-amber-500/40 transition">
              <div className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-lg w-fit">
                Board Excellence
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Secondary Wing</h3>
              <p className="text-xs text-amber-300 font-semibold">Class 9 & Class 10 (CBSE)</p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• Intensive CBSE Board syllabus preparation</li>
                <li>• Dedicated Science Practical Labs</li>
                <li>• Periodic Assessments & Mock Exams</li>
                <li>• Doubt clearing & exam counseling</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 10. SCHOOL FACILITIES */}
      <section id="facilities" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
              World-Class Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-serif">
              Campus Facilities
            </h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-300 text-sm sm:text-base">
              Modern facilities designed to provide a secure, stimulating, and technologically advanced learning environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex gap-4 items-start hover:border-slate-700 transition">
              <div className="p-3 bg-blue-600/10 text-blue-400 rounded-2xl border border-blue-500/20 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Smart Classrooms</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Interactive digital learning tools, visual teaching aids, and spacious seating.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex gap-4 items-start hover:border-slate-700 transition">
              <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Computer & AI Lab</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Modern computer systems with coding, digital tools, and practical curriculum.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex gap-4 items-start hover:border-slate-700 transition">
              <div className="p-3 bg-purple-600/10 text-purple-400 rounded-2xl border border-purple-500/20 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Science Practical Labs</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Physics, Chemistry, and Biology apparatus for hands-on experiments.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex gap-4 items-start hover:border-slate-700 transition">
              <div className="p-3 bg-amber-600/10 text-amber-400 rounded-2xl border border-amber-500/20 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Sports & Athletics Grounds</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cricket, football, volleyball, badminton, and indoor games for fitness.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex gap-4 items-start hover:border-slate-700 transition">
              <div className="p-3 bg-rose-600/10 text-rose-400 rounded-2xl border border-rose-500/20 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Residential Hostels</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Safe, hygienic, and supervised boarding hostel for boys and girls with nutritious meals.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex gap-4 items-start hover:border-slate-700 transition">
              <div className="p-3 bg-teal-600/10 text-teal-400 rounded-2xl border border-teal-500/20 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">CCTV & Safe Transport</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  24/7 CCTV campus surveillance, fire safety, and reliable bus transport network.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 11. ADMISSION INFORMATION & APPLICATION BANNER */}
      <section id="admissions" className="py-20 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-amber-900/20 border-2 border-amber-500/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                  Admissions Open 2026 - 2027
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white font-serif">
                  Enroll Your Child at Don Bosco Academy
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Admissions are now open for <strong>Play Group, Nursery, LKG, UKG, and Classes 1 to 10</strong>.
                  Limited seats are available for both Day Scholars and Residential Hostel boarders. 
                  Submit an inquiry online or visit our school office in Raipur Bazar.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-300">
                  <span>✔ Transparent Merit Process</span>
                  <span>✔ Concession for Meritorious Students</span>
                  <span>✔ Seamless Online Registration</span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3">
                <button
                  onClick={() => setIsAdmissionModalOpen(true)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/30 text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Fill Online Admission Form
                </button>
                <a
                  href={`tel:${school.phone}`}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-center text-xs font-bold text-white rounded-2xl transition"
                >
                  Call Admission Desk: {school.phone}
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 12. SCHOOL ACTIVITIES */}
      <section id="activities" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
              Beyond Academics
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-serif">
              Co-Curricular Activities & Events
            </h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-300 text-sm sm:text-base">
              Sports tournaments, science exhibitions, cultural drama, and debate competitions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 hover:border-slate-700 transition">
              <div className="h-36 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white">
                <Trophy className="w-12 h-12" />
              </div>
              <h3 className="text-base font-bold text-white font-serif">Annual Sports Meet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track and field events, inter-house championships, and sports leagues.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 hover:border-slate-700 transition">
              <div className="h-36 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
                <Sparkles className="w-12 h-12" />
              </div>
              <h3 className="text-base font-bold text-white font-serif">Science Exhibition</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Student-built science models, robotics, and environmental presentations.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 hover:border-slate-700 transition">
              <div className="h-36 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white">
                <Users className="w-12 h-12" />
              </div>
              <h3 className="text-base font-bold text-white font-serif">Cultural Celebrations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Music, dance, annual function drama, and national festivals.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 hover:border-slate-700 transition">
              <div className="h-36 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white">
                <BookOpen className="w-12 h-12" />
              </div>
              <h3 className="text-base font-bold text-white font-serif">Debate & Quiz Club</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Speech, general knowledge Olympiads, and essay contests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 13. ANNOUNCEMENTS & LIVE NOTICES BOARD */}
      <section id="notices" className="py-20 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                Official Updates
              </span>
              <h2 className="text-3xl font-black text-white font-serif mt-1">
                Notice Board & Circulars
              </h2>
            </div>
            <span className="text-xs text-slate-400">Showing active notices for parents and students</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 relative hover:border-amber-500/30 transition shadow-lg"
              >
                {n.is_pinned && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded uppercase">
                    Important
                  </span>
                )}
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {n.publish_date}
                </div>
                <h3 className="text-base font-bold text-white font-serif">{n.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14 & 15. CONTACT INFORMATION & SOCIAL LINKS */}
      <section id="contact" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
              Get in Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-serif">
              Contact Don Bosco Academy
            </h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-300 text-sm sm:text-base">
              Visit our administrative office or contact our admission and inquiries desk.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Contact Details Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
              <div>
                <h3 className="text-xl font-bold text-white font-serif uppercase tracking-wide">
                  DON BOSCO ACADEMY
                </h3>
                <p className="text-xs text-amber-400 font-mono mt-1">ESTABLISHED 1997 • CBSE PATTERN</p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 text-slate-300">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Campus Address:</strong>
                    Raipur Bazar, Nanpur, Sitamarhi,<br />
                    Sitamarhi, Bihar, India — 843326
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-300">
                  <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Official Email:</strong>
                    <a href={`mailto:${school.email}`} className="text-blue-400 hover:underline">
                      {school.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-300">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Helpline / Phone:</strong>
                    <a href={`tel:${school.phone}`} className="text-blue-400 hover:underline">
                      {school.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                <a
                  href={`mailto:${school.email}?subject=Inquiry regarding Don Bosco Academy`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20"
                >
                  <Mail className="w-4 h-4" /> Send Email to School
                </a>

                <a
                  href={`tel:${school.phone}`}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-4 h-4 text-emerald-400" /> Call Campus Office
                </a>

                {school.facebook_url && (
                  <a
                    href={school.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-blue-900/60 hover:bg-blue-900 text-blue-200 border border-blue-700/50 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                  >
                    <Facebook className="w-4 h-4 text-blue-400 fill-current" /> Visit Official Facebook Page
                  </a>
                )}
              </div>
            </div>

            {/* Location & Map Section */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white font-serif">Location & Connectivity</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  DON BOSCO ACADEMY is located at <strong>Raipur Bazar, Nanpur</strong> in the Sitamarhi district of Bihar (PIN: 843326). 
                  The school is well connected with major district roads and operates transport routes across neighboring areas.
                </p>

                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Campus Location:</span>
                    <span className="font-semibold text-white">Raipur Bazar, Nanpur, Sitamarhi</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Postal PIN:</span>
                    <span className="font-mono text-amber-400 font-bold">843326</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">School Type:</span>
                    <span className="font-semibold text-blue-300">Residential Cum Day School (Play to 10th)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="https://maps.google.com/?q=Raipur+Bazar+Nanpur+Sitamarhi"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  <MapPin className="w-4 h-4 text-rose-400" /> Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 16. FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/branding/don-bosco-logo.png"
                  alt="Logo"
                  className="w-12 h-12 object-contain rounded-xl bg-white p-0.5 border border-amber-500/30"
                />
                <span className="font-black text-white text-base tracking-wide font-serif">
                  DON BOSCO ACADEMY
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Raipur Bazar, Nanpur, Sitamarhi, Bihar (843326). Established in 1997. 
                Residential Cum Day School operating on the CBSE curriculum from Play to Class 10th.
              </p>
              <p className="text-xs text-amber-400 font-mono font-bold">
                Motto: KNOWLEDGE IS POWER
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs font-mono">Quick Navigation</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><a href="#about" className="hover:text-white transition">About School</a></li>
                <li><a href="#academics" className="hover:text-white transition">Classes & Syllabus</a></li>
                <li><a href="#facilities" className="hover:text-white transition">Hostel & Labs</a></li>
                <li><a href="#notices" className="hover:text-white transition">Notice Board</a></li>
                <li><Link to="/verify" className="hover:text-amber-400 transition text-amber-300 font-semibold">Verify Documents</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs font-mono">Administration</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><Link to="/login" className="hover:text-white transition">Principal & Faculty Login</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Student & Parent Portal</Link></li>
                <li><a href={`mailto:${school.email}`} className="hover:text-white transition">{school.email}</a></li>
                <li><span className="text-slate-500">Phone: {school.phone}</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© 1997 - {new Date().getFullYear()} DON BOSCO ACADEMY. All Rights Reserved.</p>
            <p className="flex items-center gap-2">
              <span>Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326</span>
              <span>•</span>
              <span className="text-amber-500 font-semibold">Single-School Management System</span>
            </p>
          </div>

        </div>
      </footer>

      {/* ONLINE ADMISSION APPLICATION MODAL */}
      <Modal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        title="Online Admission Application (2026-2027)"
      >
        {admissionSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white font-serif">Application Submitted!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Thank you for applying to <strong>DON BOSCO ACADEMY</strong>. The school admission office in Raipur Bazar will review your inquiry and contact you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAdmissionSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-medium">
              ★ Don Bosco Academy, Raipur Bazar • Admissions open for Play to Class 10th
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={admissionForm.student_name}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, student_name: e.target.value })}
                  placeholder="e.g. Aman Kumar Singh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Applying For Class *</label>
                <select
                  required
                  value={admissionForm.applying_class_id}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, applying_class_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={admissionForm.dob}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, dob: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Gender *</label>
                <select
                  value={admissionForm.gender}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, gender: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Parent / Guardian Name *</label>
                <input
                  type="text"
                  required
                  value={admissionForm.parent_name}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, parent_name: e.target.value })}
                  placeholder="e.g. Ramesh Singh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Parent Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={admissionForm.parent_phone}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, parent_phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Residential Address *</label>
              <textarea
                rows={2}
                required
                value={admissionForm.address}
                onChange={(e) => setAdmissionForm({ ...admissionForm, address: e.target.value })}
                placeholder="Village / Town, Raipur Bazar, Sitamarhi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdmissionModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={admissionSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer"
              >
                {admissionSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
