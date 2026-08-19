import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AppNavbar } from './AppNavbar';
import {
  LayoutDashboard,
  Building2,
  FileCode,
  CreditCard,
  BarChart3,
  ShieldAlert,
  Layers,
  History,
  CheckCircle2,
  Users,
  UserCheck,
  BookOpen,
  FileSpreadsheet,
  Award,
  GraduationCap,
  Bell,
  Settings,
} from 'lucide-react';
import { cn } from '../common/UI';

export const SuperAdminLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Master Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Master Template Studio', href: '/admin/templates', icon: FileCode },
    { label: 'School Profile & Branding', href: '/school/profile', icon: Building2 },
    { label: 'Classes & Sections', href: '/school/classes', icon: Layers },
    { label: 'Subjects & Practicals', href: '/school/subjects', icon: BookOpen },
    { label: 'Teachers & Faculty', href: '/school/teachers', icon: UserCheck },
    { label: 'Students Database', href: '/school/students', icon: Users },
    { label: 'Exams & Marks Entry', href: '/school/exams', icon: FileSpreadsheet },
    { label: 'Marksheet Studio', href: '/school/documents/marksheets', icon: FileSpreadsheet },
    { label: 'Certificate Studio', href: '/school/documents/certificates', icon: Award },
    { label: 'Admit Card Studio', href: '/school/documents/admit-cards', icon: GraduationCap },
    { label: 'ID Card Studio', href: '/school/documents/id-cards', icon: CreditCard },
    { label: 'Fee Management', href: '/school/fees', icon: CreditCard },
    { label: 'Admissions Pipeline', href: '/school/admissions', icon: Users },
    { label: 'Notice Board', href: '/school/notices', icon: Bell },
    { label: 'System Audit Logs', href: '/admin/audit', icon: History },
    { label: 'School ERP Settings', href: '/school/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <AppNavbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Super Admin Dark High-Security Sidebar */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0 flex flex-col p-4">
          <div className="flex items-center gap-2.5 px-2 py-3 mb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400">Super Admin</div>
              <div className="text-[10px] text-slate-400">Cross-Tenant Authority</div>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={idx}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition',
                      isActive
                        ? 'bg-rose-600 text-white font-semibold shadow-lg shadow-rose-600/20'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> PostgreSQL RLS Active
            </div>
            <p className="text-[10px] text-slate-500">Master system controls for multi-tenant school onboarding and template distribution.</p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-900/90 text-slate-100">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
