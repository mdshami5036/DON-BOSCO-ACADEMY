import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AppNavbar } from './AppNavbar';
import { useAuth } from '../../features/auth/AuthContext';
import {
  LayoutDashboard,
  Award,
  CalendarCheck,
  CreditCard,
  BookOpen,
  Calendar,
  Bell,
  FileBadge,
} from 'lucide-react';
import { cn } from '../common/UI';

export const StudentLayout: React.FC = () => {
  const { currentSchool, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Student Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'My Report Cards & Results', href: '/student/results', icon: Award },
    { label: 'My Attendance Record', href: '/student/attendance', icon: CalendarCheck },
    { label: 'Fee Dues & Receipts', href: '/student/fees', icon: CreditCard },
    { label: 'Certificates & ID Card', href: '/student/documents', icon: FileBadge },
    { label: 'Homework & Classwork', href: '/student/homework', icon: BookOpen },
    { label: 'Class Timetable', href: '/student/timetable', icon: Calendar },
    { label: 'School Notices', href: '/student/notices', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AppNavbar />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col p-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/50 mb-4">
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold text-xs">
              <Award className="w-4 h-4" /> Student / Parent Portal
            </div>
            <p className="text-[11px] text-purple-700 font-semibold mt-0.5">{user?.full_name}</p>
            <p className="text-[10px] text-slate-500">{currentSchool?.name}</p>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition',
                      isActive
                        ? 'bg-purple-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
