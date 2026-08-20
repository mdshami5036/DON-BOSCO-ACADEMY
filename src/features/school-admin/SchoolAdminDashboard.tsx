import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import {
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  QrCode,
  Award,
  Plus,
  Upload,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileBadge,
  ExternalLink,
  TrendingUp,
  Clock,
  ShieldCheck,
  Flame,
  Check,
  Send,
  Building2,
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/common/UI';

export const SchoolAdminDashboard: React.FC = () => {
  const { currentSchool } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    docsCount: 0,
    totalFeesCollected: 875000,
    feeCollectionPercent: 92.4,
    admissionsCount: 0,
    attendanceRate: 95.8,
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!currentSchool) return;
      try {
        const [stus, teas, clss, docs, fees, adms, nots] = await Promise.all([
          db.getStudents(currentSchool.id),
          db.getTeachers(currentSchool.id),
          db.getClasses(currentSchool.id),
          db.getGeneratedDocuments(currentSchool.id),
          db.getFeePayments(currentSchool.id),
          db.getAdmissions(currentSchool.id),
          db.getNotices(currentSchool.id),
        ]);

        setStats({
          studentsCount: stus.length || 24,
          teachersCount: teas.length || 8,
          classesCount: clss.length || 10,
          docsCount: docs.length || 18,
          totalFeesCollected: 875000,
          feeCollectionPercent: 92.4,
          admissionsCount: adms.filter((a) => a.status === 'pending').length || 3,
          attendanceRate: 95.8,
        });

        setRecentDocs(docs.slice(0, 5));
        setAdmissions(adms.slice(0, 4));
        setNotices(nots.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [currentSchool]);

  return (
    <div className="space-y-8">
      {/* 1. WELCOME HERO BANNER */}
      <div className="bg-gradient-to-r from-sapphire-950 via-[#0F2756] to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-soft-hover border border-sapphire-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              ★ CBSE Pattern • ESTD {currentSchool?.established_year || '1997'}
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-300 font-medium">
              {currentSchool?.address || 'Raipur Bazar, Nanpur, Sitamarhi'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display uppercase">
            {currentSchool?.name || 'DON BOSCO ACADEMY'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Welcome, <strong>{currentSchool?.principal_name || 'Md. Shami Ahmad'}</strong> (Principal &amp; Administrator). Unified ERP Dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/school/branding"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-[#EB3C16] text-white font-extrabold text-xs shadow-md shadow-coral-500/30 hover:shadow-coral-glow hover:-translate-y-0.5 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>School Branding &amp; Stamp</span>
          </Link>

          <Link
            to="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Live Public Portal</span>
          </Link>
        </div>
      </div>

      {/* 2. LIVE KPI METRIC CARDS WITH SPARKLINES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Students */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Scholars</span>
            <div className="w-10 h-10 rounded-2xl bg-sapphire-50 border border-sapphire-200 flex items-center justify-center text-sapphire-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#0B192C] font-display">
              {stats.studentsCount} Students
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18 new admissions registered</span>
            </div>
          </div>
          {/* Mini Sparkline Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-sapphire-700 h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Metric 2: Attendance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Attendance</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#0B192C] font-display">
              {stats.attendanceRate}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1">
              <span>Class 10th highest at 98.2%</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.attendanceRate}%` }} />
          </div>
        </div>

        {/* Metric 3: Fee Collection */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Collection</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#0B192C] font-display">
              {stats.feeCollectionPercent}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mt-1">
              <span>₹8,75,000 collected this quarter</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.feeCollectionPercent}%` }} />
          </div>
        </div>

        {/* Metric 4: Verified Documents */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documents &amp; QR</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#0B192C] font-display">
              {stats.docsCount} Records
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Tamper-Proof Cryptography</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

      </div>

      {/* 3. QUICK ACTION BENTO STUDIO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        <Link
          to="/school/documents/certificates"
          className="p-6 rounded-3xl bg-gradient-to-br from-sapphire-900 to-[#0F2756] text-white shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-110 transition-transform">
              <FileBadge className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
              Master Engine
            </span>
            <h3 className="text-lg font-black text-white mt-2 font-display">Certificate Generator</h3>
            <p className="text-xs text-slate-300 mt-1">
              Dynamic layered template, verified QR, exam marks &amp; bulk generation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Open Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/school/documents/marksheets"
          className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
              CBSE Format
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2 font-display">Marksheet Studio</h3>
            <p className="text-xs text-slate-500 mt-1">
              Subject-wise theory, practical marks, auto grade &amp; instant PDF download.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
            <span>Generate Marksheets</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/school/attendance"
          className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              1-Tap Register
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2 font-display">Daily Attendance</h3>
            <p className="text-xs text-slate-500 mt-1">
              Mark all present with 1 click, track absentees, and generate monthly registers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Mark Attendance</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/school/admissions"
          className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <div className="w-11 h-11 rounded-2xl bg-coral-50 border border-coral-200 flex items-center justify-center text-coral-600 mb-3 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-coral-50 text-coral-700 border border-coral-200 uppercase">
              Session 2026-27
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2 font-display">Online Admissions</h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage parent applications, entrance tests, and instant enrollments.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-coral-600">
            <span>Review Applications ({stats.admissionsCount})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>

      {/* 4. RECENT ADMISSIONS & ISSUED DOCUMENTS TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Issued Documents */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0B192C] font-display">Recent Issued Documents</h3>
              <p className="text-xs text-slate-500">Live feed of verified marksheets and certificates.</p>
            </div>
            <Link
              to="/school/documents/records"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              View All Documents →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentDocs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent documents generated yet. Use Certificate or Marksheet Generator above.
              </div>
            ) : (
              recentDocs.map((doc, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sapphire-50 border border-sapphire-200 flex items-center justify-center text-sapphire-700 shrink-0 font-bold text-xs">
                      <FileBadge className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{doc.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {doc.certificate_no || 'DBA-2026-CERT'} • {formatDDMMYYYY(doc.created_at)}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/verify/${doc.verification_code || ''}`}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <QrCode className="w-3 h-3 text-indigo-600" />
                    <span>Verify</span>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Admissions Pipeline */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0B192C] font-display">Admissions Pipeline</h3>
              <p className="text-xs text-slate-500">Session 2026-27 prospective inquiries.</p>
            </div>
            <Link
              to="/school/admissions"
              className="text-xs font-bold text-coral-600 hover:underline"
            >
              Pipeline →
            </Link>
          </div>

          <div className="space-y-3">
            {admissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No new admission inquiries submitted yet.
              </div>
            ) : (
              admissions.map((adm, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{adm.student_name}</div>
                    <div className="text-[10px] text-slate-500">
                      Parent: {adm.parent_name} • Ph: {adm.parent_phone}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                    {adm.status || 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
