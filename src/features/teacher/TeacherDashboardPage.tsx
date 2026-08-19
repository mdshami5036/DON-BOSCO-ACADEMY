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
} from 'lucide-react';
import { Card, StatCard, Badge, Button } from '../../components/common/UI';

export const TeacherDashboardPage: React.FC = () => {
  const { currentSchool, user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);

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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <Badge variant="success" size="sm" className="bg-emerald-700/60 text-emerald-100 border-emerald-500/40 mb-2">
            Faculty Teaching Workspace
          </Badge>
          <h1 className="text-2xl font-extrabold">{user?.full_name || 'Prof. David Sterling'}</h1>
          <p className="text-xs text-emerald-200 mt-1">
            Assigned to Class 10 (Mathematics & Science) &bull; {currentSchool?.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/teacher/attendance">
            <Button size="sm" variant="primary" className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold">
              <CalendarCheck className="w-4 h-4 mr-1 text-emerald-700" /> Mark Attendance
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Assigned Classes" value={classes.length} icon={Users} color="emerald" change="Primary Faculty" />
        <StatCard title="Active Homework" value={homeworkList.length} icon={BookOpen} color="indigo" change="Due this week" />
        <StatCard title="Weekly Periods" value={timetables.length} icon={Calendar} color="purple" change="Classroom lessons" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card title="Faculty Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/teacher/attendance"
              className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition"
            >
              <CalendarCheck className="w-6 h-6 text-emerald-600 mb-2" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Class Attendance</div>
              <div className="text-[10px] text-slate-500">Record today's register</div>
            </Link>

            <Link
              to="/teacher/marks"
              className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition"
            >
              <FileSpreadsheet className="w-6 h-6 text-indigo-600 mb-2" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Enter Exam Marks</div>
              <div className="text-[10px] text-slate-500">Mid-term evaluation</div>
            </Link>

            <Link
              to="/teacher/homework"
              className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 transition"
            >
              <BookOpen className="w-6 h-6 text-purple-600 mb-2" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Assignments</div>
              <div className="text-[10px] text-slate-500">Create new tasks</div>
            </Link>

            <Link
              to="/teacher/timetable"
              className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition"
            >
              <Calendar className="w-6 h-6 text-amber-600 mb-2" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">My Schedule</div>
              <div className="text-[10px] text-slate-500">View weekly timetable</div>
            </Link>
          </div>
        </Card>

        {/* Schedule */}
        <Card title="Today's Teaching Schedule">
          <div className="space-y-2.5">
            {timetables.slice(0, 4).map((t, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{t.subject_name}</span>
                  <div className="text-[11px] text-slate-400">Class 10-A &bull; Room {t.room_no}</div>
                </div>
                <Badge variant="primary">{t.start_time.slice(0,5)} - {t.end_time.slice(0,5)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
