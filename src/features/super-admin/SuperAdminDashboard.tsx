import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, store } from '../../services/db';
import { School, DocumentTemplate, GeneratedDocument, Student, Teacher, Exam } from '../../types/database';
import {
  Building2,
  Users,
  GraduationCap,
  FileCode,
  QrCode,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  FileSpreadsheet,
  Settings,
  CreditCard,
  Bell,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { StatCard, Card, Badge, Button } from '../../components/common/UI';

export const SuperAdminDashboard: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [docs, setDocs] = useState<GeneratedDocument[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentSchool = store.schools[0];

  useEffect(() => {
    async function loadData() {
      try {
        const [sList, tList, dList, stuList, teachList, exList] = await Promise.all([
          db.getSchools(),
          db.getMasterTemplates(),
          db.getGeneratedDocuments(''),
          db.getStudents(currentSchool?.id || 'sch-xavier-demo'),
          db.getTeachers(currentSchool?.id || 'sch-xavier-demo'),
          db.getExams(currentSchool?.id || 'sch-xavier-demo'),
        ]);
        setSchools(sList);
        setTemplates(tList);
        setDocs(dList);
        setStudents(stuList);
        setTeachers(teachList);
        setExams(exList);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Master Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentSchool?.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150'}
            alt="School Logo"
            className="w-14 h-14 rounded-2xl object-contain bg-slate-800/80 p-2 border border-slate-700 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-white">{currentSchool?.name || 'School ERP Master Hub'}</h1>
              <Badge variant="danger" size="md">Super Admin Master Control</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete administrative authority over academic curricula, marks, practical evaluations, documents, and student records.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/school/profile">
            <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-slate-200">
              <Building2 className="w-3.5 h-3.5 mr-1.5" /> School Branding
            </Button>
          </Link>
          <Link to="/admin/templates">
            <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 font-bold shadow-md shadow-rose-600/30">
              <FileCode className="w-4 h-4 mr-1.5" /> Master Template Studio ({templates.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Enrolled Students"
          value={students.length}
          icon={Users}
          color="indigo"
          change="All Cohorts & Sections"
        />
        <StatCard
          title="Faculty & Teachers"
          value={teachers.length}
          icon={GraduationCap}
          color="purple"
          change="Assigned & Active"
        />
        <StatCard
          title="Master Document Designs"
          value={templates.length}
          icon={FileCode}
          color="amber"
          change="20 Production Templates"
        />
        <StatCard
          title="Documents Issued"
          value={docs.length}
          icon={QrCode}
          color="emerald"
          change="Cryptographically Verified"
        />
      </div>

      {/* Master Operations Quick Access Matrix */}
      <Card
        title="Super Admin Master Operations Hub"
        subtitle="Direct 1-click access to manage all operational modules of the school"
        className="bg-slate-900 border-slate-800"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/templates" className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-rose-400 transition">Master Template Studio</h4>
                <p className="text-xs text-slate-400">Live HTML/CSS editor for Marksheets, Certificates, Admit Cards, ID Cards</p>
              </div>
            </div>
          </Link>

          <Link to="/school/exams" className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">Exams & Practicals Manager</h4>
                <p className="text-xs text-slate-400">Configure theory vs practical weightage and record student exam scores</p>
              </div>
            </div>
          </Link>

          <Link to="/school/documents/marksheets" className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition">Marksheet & Certificate Generator</h4>
                <p className="text-xs text-slate-400">Print pixel-perfect A4 report cards and merit awards with QR verification</p>
              </div>
            </div>
          </Link>

          <Link to="/school/documents/admit-cards" className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-purple-400 transition">Admit Card & Hall Ticket Studio</h4>
                <p className="text-xs text-slate-400">Configure exam timetable dates, rooms, and bulk-generate hall tickets</p>
              </div>
            </div>
          </Link>

          <Link to="/school/students" className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-cyan-400 transition">Students & Bulk Import</h4>
                <p className="text-xs text-slate-400">Manage student profiles, parent info, and bulk CSV enrollment</p>
              </div>
            </div>
          </Link>

          <Link to="/school/settings" className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition">School Settings & Formulas</h4>
                <p className="text-xs text-slate-400">Configure serial number formulas, academic sessions, and institutional seals</p>
              </div>
            </div>
          </Link>
        </div>
      </Card>

      {/* Master Template Library Preview */}
      <Card
        title="Active Master Template Library"
        subtitle="20 production-grade document templates ready for printing and live preview"
        className="bg-slate-900 border-slate-800"
        action={
          <Link to="/admin/templates">
            <Button size="sm" variant="outline" className="border-slate-700 text-xs">Open Code Studio</Button>
          </Link>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-indigo-500/50 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={t.category === 'MARKSHEET' ? 'primary' : t.category === 'CERTIFICATE' ? 'warning' : t.category === 'ADMIT_CARD' ? 'purple' : 'neutral'} size="sm">
                    {t.category}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">v{t.version}</span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">{t.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>{t.page_size} ({t.orientation})</span>
                <Link to="/admin/templates" className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                  Inspect Code <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
