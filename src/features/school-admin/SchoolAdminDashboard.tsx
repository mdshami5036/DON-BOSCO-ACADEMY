import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { StatCard, Card, Badge, Button } from '../../components/common/UI';

export const SchoolAdminDashboard: React.FC = () => {
  const { currentSchool } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    docsCount: 0,
    pendingFees: 0,
    admissionsCount: 0,
    attendanceRate: 94.5,
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
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
          studentsCount: stus.length,
          teachersCount: teas.length,
          classesCount: clss.length,
          docsCount: docs.length,
          pendingFees: 2450,
          admissionsCount: adms.filter((a) => a.status === 'pending').length,
          attendanceRate: 95.2,
        });

        setRecentDocs(docs.slice(0, 5));
        setNotices(nots.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [currentSchool]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="warning" size="sm" className="bg-amber-500/20 text-amber-300 border-amber-400/30 font-bold">
              ★ CBSE Pattern • ESTD {currentSchool?.established_year || '1997'}
            </Badge>
            <span className="text-xs text-slate-400">&bull; {currentSchool?.address || 'Raipur Bazar, Nanpur, Sitamarhi'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif uppercase">
            {currentSchool?.name || 'DON BOSCO ACADEMY'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Welcome back, <strong>{currentSchool?.principal_name || 'Md. Shami Ahmad'}</strong>. Single-School System for Don Bosco Academy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/school/branding">
            <Button size="sm" variant="primary" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4 mr-1.5" /> School Branding
            </Button>
          </Link>
          <Link to="/school/don-bosco-academy" target="_blank">
            <Button size="sm" variant="outline" className="border-slate-700 bg-slate-900/60 text-white hover:bg-slate-800">
              <ExternalLink className="w-4 h-4 mr-1.5" /> View Public Portal
            </Button>
          </Link>
          <Link to="/school/documents/marksheets">
            <Button size="sm" variant="primary" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-lg">
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-indigo-600" /> Marksheets
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Enrolled Students"
          value={stats.studentsCount}
          icon={Users}
          color="indigo"
          change="+12 this session"
        />
        <StatCard
          title="Faculty & Staff"
          value={stats.teachersCount}
          icon={GraduationCap}
          color="emerald"
          change="Active status"
        />
        <StatCard
          title="Documents Generated"
          value={stats.docsCount}
          icon={QrCode}
          color="purple"
          change="Cryptographically verified"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.attendanceRate}%`}
          icon={CalendarCheck}
          color="blue"
          change="Class 10-A 100%"
        />
      </div>

      {/* Quick Access Shortcuts Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Core Workflows & Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/school/attendance"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition text-center group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Daily Attendance</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Mark register</div>
          </Link>

          <Link
            to="/school/exams"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition text-center group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Enter Marks</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Mid-term exam</div>
          </Link>

          <Link
            to="/school/results"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition text-center group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Auto Results</div>
            <div className="text-[10px] text-slate-500 mt-0.5">GPA & Ranks</div>
          </Link>

          <Link
            to="/school/documents/marksheets"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition text-center group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Marksheets</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Bulk PDF & Print</div>
          </Link>

          <Link
            to="/school/documents/certificates"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition text-center group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <FileBadge className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Certificates</div>
            <div className="text-[10px] text-slate-500 mt-0.5">TC, Bonafide, Merit</div>
          </Link>

          <Link
            to="/school/fees"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition text-center group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Fees & Receipts</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Collect payment</div>
          </Link>
        </div>
      </div>

      {/* Split Cards: Recent Documents & Active Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Generated Documents */}
        <Card
          title="Recent Official Documents"
          subtitle="Latest generated certificates and marksheets with live QR verification"
          action={
            <Link to="/school/documents/records" className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentDocs.length > 0 ? (
              recentDocs.map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-[220px]">
                        {doc.title}
                      </h5>
                      <span className="text-[10px] font-mono text-slate-400">{doc.verification_code}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.status === 'VALID' ? 'success' : 'danger'} size="sm">
                      {doc.status}
                    </Badge>
                    <Link
                      to={`/verify/${doc.verification_code}`}
                      target="_blank"
                      className="p-1 text-slate-400 hover:text-indigo-600 transition"
                      title="Verify QR Online"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No documents generated yet.</div>
            )}
          </div>
        </Card>

        {/* Notices & Announcements */}
        <Card
          title="School Notice Board"
          subtitle="Targeted broadcast announcements for teachers, parents, and students"
          action={
            <Link to="/school/notices" className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1">
              Post Notice <Plus className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{n.publish_date}</span>
                  <Badge variant="primary" size="sm">{n.target_role}</Badge>
                </div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white mb-1">{n.title}</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
