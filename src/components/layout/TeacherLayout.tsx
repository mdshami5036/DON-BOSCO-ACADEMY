import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AppNavbar } from './AppNavbar';
import { useAuth } from '../../features/auth/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  FileSpreadsheet,
  BookOpen,
  Calendar,
  Bell,
  GraduationCap,
} from 'lucide-react';
import { cn } from '../common/UI';

export const TeacherLayout: React.FC = () => {
  const { currentSchool, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Faculty Dashboard', href: '/teacher', icon: LayoutDashboard },
    { label: 'Mark Class Attendance', href: '/teacher/attendance', icon: CalendarCheck },
    { label: 'Enter Subject Marks', href: '/teacher/marks', icon: FileSpreadsheet },
    { label: 'Homework & Assignments', href: '/teacher/homework', icon: BookOpen },
    { label: 'Weekly Teaching Schedule', href: '/teacher/timetable', icon: Calendar },
    { label: 'School Notices', href: '/teacher/notices', icon: Bell },
  ];

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#F8FAFC] flex flex-col font-sans">
      <AppNavbar />

      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <aside className="w-64 bg-white border-r border-slate-200/90 flex-shrink-0 flex flex-col p-4 shadow-xs">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 mb-4">
            <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-emerald-600" /> Faculty Workspace
            </div>
            <p className="text-xs font-bold text-slate-900 mt-1">{user?.full_name || 'Faculty Member'}</p>
            <p className="text-[10px] text-slate-500 font-medium">Class 10th Teacher • Don Bosco</p>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto overscroll-contain pr-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition duration-200',
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
