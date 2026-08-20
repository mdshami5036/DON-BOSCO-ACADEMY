import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AppNavbar } from './AppNavbar';
import { useAuth } from '../../features/auth/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Award,
  FileSpreadsheet,
  FileBadge,
  QrCode,
  Layers,
  Inbox,
  Bell,
  BookOpen,
  Calendar,
  Settings,
  Globe,
  Upload,
  UserPlus,
  BookMarked,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '../common/UI';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const SchoolAdminLayout: React.FC = () => {
  const { currentSchool } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      title: 'CORE & BRANDING',
      items: [
        { label: 'ERP Dashboard', href: '/school/dashboard', icon: LayoutDashboard },
        { label: 'School Branding & Seals', href: '/school/branding', icon: Building2, badge: 'Official' },
        { label: 'School Profile & Info', href: '/school/profile', icon: Settings },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { label: 'Classes & Sections', href: '/school/classes', icon: Layers },
        { label: 'Subjects & Curriculum', href: '/school/subjects', icon: BookMarked },
        { label: 'Weekly Timetable', href: '/school/timetable', icon: Calendar },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { label: 'Students Directory', href: '/school/students', icon: Users },
        { label: 'Bulk Student Import', href: '/school/students/import', icon: Upload, badge: 'Excel' },
        { label: 'Teachers & Faculty', href: '/school/teachers', icon: GraduationCap },
      ],
    },
    {
      title: 'DAILY OPERATIONS',
      items: [
        { label: 'Daily Attendance', href: '/school/attendance', icon: CalendarCheck },
        { label: 'Fee Collection & Dues', href: '/school/fees', icon: CreditCard },
        { label: 'Exams & Assessment', href: '/school/exams', icon: FileSpreadsheet },
        { label: 'Exam & Portal Publisher', href: '/school/exam-links', icon: BookOpen, badge: 'Live' },
        { label: 'Automated Results Engine', href: '/school/results', icon: Award },
      ],
    },
    {
      title: 'DOCUMENTS & QR ENGINE',
      items: [
        { label: 'Marksheet Studio', href: '/school/documents/marksheets', icon: FileSpreadsheet },
        { label: 'Certificate Generator', href: '/school/documents/certificates', icon: FileBadge, badge: 'Master' },
        { label: 'Admit Cards (Hall Tickets)', href: '/school/documents/admit-cards', icon: BookOpen },
        { label: 'Student & Staff ID Cards', href: '/school/documents/id-cards', icon: Users },
        { label: 'Issued Document Records', href: '/school/documents/records', icon: QrCode, badge: 'QR' },
        { label: 'Master Templates', href: '/school/templates', icon: Layers },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        { label: 'Online Admissions Desk', href: '/school/admissions', icon: Inbox },
        { label: 'Live Notice Board', href: '/school/notices', icon: Bell },
        { label: 'Homework & Assignments', href: '/school/homework', icon: BookOpen },
      ],
    },
    {
      title: 'SYSTEM & SETTINGS',
      items: [
        { label: 'General Settings & Grading', href: '/school/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <AppNavbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Toggle Floating Button */}
        <div className="lg:hidden fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3.5 bg-[#0F2756] text-white rounded-2xl shadow-2xl focus:outline-none hover:bg-sapphire-900 transition cursor-pointer"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={cn(
            'w-64 bg-white border-r border-slate-200/90 flex-shrink-0 flex flex-col transition-all duration-300 z-30 shadow-xs',
            'fixed inset-y-0 left-0 pt-16 lg:pt-0 lg:static lg:translate-x-0',
            isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          )}
        >
          {/* School Badge Pill */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
            <img
              src="/assets/branding/don-bosco-logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-xl object-contain border border-slate-200 p-0.5 bg-white shrink-0 shadow-2xs"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight truncate font-display">
                {currentSchool?.name || 'DON BOSCO ACADEMY'}
              </h4>
              <span className="text-[10px] text-coral-600 font-bold">Raipur Bazar, Sitamarhi</span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </div>
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <NavLink
                      key={i}
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group',
                          isActive
                            ? 'bg-sapphire-50 text-sapphire-900 border border-sapphire-200/80 shadow-2xs font-extrabold'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        )
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-colors',
                            isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                            item.badge === 'Official'
                              ? 'bg-coral-50 text-coral-600 border border-coral-200'
                              : item.badge === 'Master'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Quick Footer inside Sidebar */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-2">
              <span>DBA ERP v2.6</span>
              <span className="text-emerald-600 font-bold">● Online</span>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
