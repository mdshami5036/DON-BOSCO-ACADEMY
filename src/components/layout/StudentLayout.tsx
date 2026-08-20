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
  GraduationCap,
  Sparkles,
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
    { label: 'Certificates & Digital ID', href: '/student/documents', icon: FileBadge },
    { label: 'Homework & Assignments', href: '/student/homework', icon: BookOpen },
    { label: 'Weekly Timetable', href: '/student/timetable', icon: Calendar },
    { label: 'School Notices', href: '/student/notices', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <AppNavbar />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-white border-r border-slate-200/90 flex-shrink-0 flex flex-col p-4 shadow-xs">
          <div className="p-3.5 bg-coral-50 rounded-2xl border border-coral-200 mb-4">
            <div className="flex items-center gap-1.5 text-coral-700 font-extrabold text-xs uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-coral-600" /> Student &amp; Parent Portal
            </div>
            <p className="text-xs font-bold text-slate-900 mt-1">{user?.full_name || 'Aman Singh'}</p>
            <p className="text-[10px] text-slate-500 font-medium">Class 10-A • Roll: 1001</p>
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
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition duration-200',
                      isActive
                        ? 'bg-coral-50 text-coral-700 border border-coral-200 shadow-2xs font-extrabold'
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
