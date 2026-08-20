import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import {
  CalendarCheck,
  FileSpreadsheet,
  BookOpen,
  Calendar,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Check,
} from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const TeacherDashboardPage: React.FC = () => {
  const { currentSchool, user } = useAuth();
  const { success } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);

  // Quick Attendance Mock state
  const [quickMarked, setQuickMarked] = useState(false);

  useEffect(() => {
    async function load() {
      if (!currentSchool) return;
      const [cList, hList, tList] = await Promise.all([
        db.getClasses(currentSchool.id),
        db.getHomework(currentSchool.id),
        db.getTimetable(currentSchool.id),
      ]);
      setClasses(cList);
      setHomeworkList(hList);
      setTimetables(tList);
    }
    load();
  }, [currentSchool]);

  const handleMarkAllPresent = () => {
    setQuickMarked(true);
    success('1-Tap: All 24 students of Class 10-A marked PRESENT for today!');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. FACULTY WELCOME BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-hover border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            ★ Faculty Teaching Workspace • Session 2025-2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white mt-1">
            {user?.full_name || 'Md. Shami Ahmad'}
          </h1>
          <p className="text-xs text-emerald-200 mt-0.5">
            Primary In-Charge: <strong>Class 10th (Section A)</strong> • Don Bosco Academy
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleMarkAllPresent}
            disabled={quickMarked}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            {quickMarked ? (
              <>
                <Check className="w-4 h-4" />
                <span>Class 10-A Marked Present</span>
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                <span>1-Tap Mark All Present</span>
              </>
            )}
          </button>

          <Link
            to="/teacher/marks"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Enter Marks</span>
          </Link>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Assigned Classes</span>
            <div className="text-2xl sm:text-3xl font-black text-[#0B192C] font-display mt-1">
              {classes.length || 10} Classes
            </div>
            <p className="text-xs text-emerald-600 font-bold mt-0.5">Class 10th &bull; Mathematics &amp; Science</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Active Homework</span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-display mt-1">
              {homeworkList.length || 4} Tasks
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Due for evaluation this week</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Daily Periods</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-display mt-1">
              5 Lectures
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Next period: Physics in Lab 2</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. QUICK FACULTY WORKFLOWS BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Quick Tools */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#0B192C] font-display">Faculty Quick Workflows</h3>
            <span className="text-xs font-bold text-emerald-600">Instant Access</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Link
              to="/teacher/attendance"
              className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100 transition group"
            >
              <CalendarCheck className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-black text-xs text-slate-900 font-display">Class Attendance</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Toggle daily status</div>
            </Link>

            <Link
              to="/teacher/marks"
              className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 hover:bg-indigo-100 transition group"
            >
              <FileSpreadsheet className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-black text-xs text-slate-900 font-display">Spreadsheet Marks</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Tabular grade entry</div>
            </Link>

            <Link
              to="/teacher/homework"
              className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 hover:bg-purple-100 transition group"
            >
              <BookOpen className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-black text-xs text-slate-900 font-display">Post Assignments</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Upload daily tasks</div>
            </Link>

            <Link
              to="/teacher/timetable"
              className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 hover:bg-amber-100 transition group"
            >
              <Calendar className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-black text-xs text-slate-900 font-display">Period Timetable</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Room &amp; time slots</div>
            </Link>
          </div>
        </div>

        {/* Today's Teaching Schedule */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#0B192C] font-display">Today's Class Schedule</h3>
            <span className="text-xs font-mono font-bold text-slate-400">Class 10th Track</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900">Period 1: Mathematics (Algebra &amp; Trigonometry)</span>
                <div className="text-[11px] text-slate-500">Class 10-A • Room 102</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                09:00 - 09:45
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900">Period 2: Physics Practical (Optics Experiment)</span>
                <div className="text-[11px] text-slate-500">Class 10-A • Science Lab 1</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sapphire-50 text-sapphire-900 text-xs font-bold border border-sapphire-200">
                09:50 - 10:35
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900">Period 3: Computer Science (Python Coding)</span>
                <div className="text-[11px] text-slate-500">Class 9-B • AI &amp; STEM Lab</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                10:40 - 11:25
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
