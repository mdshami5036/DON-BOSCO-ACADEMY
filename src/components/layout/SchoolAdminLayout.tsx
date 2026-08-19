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
} from 'lucide-react';
import { cn } from '../common/UI';
import { SafeImage } from '../../lib/image-helper';

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
        { label: 'Dashboard', href: '/school/dashboard', icon: LayoutDashboard },
        { label: 'School Branding (Logo & Banners)', href: '/school/branding', icon: Building2, badge: 'Official' },
        { label: 'School Profile & Contact', href: '/school/profile', icon: Settings },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { label: 'Classes & Sections', href: '/school/classes', icon: Layers },
        { label: 'Subjects', href: '/school/subjects', icon: BookMarked },
        { label: 'Weekly Timetable', href: '/school/timetable', icon: Calendar },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { label: 'Students Directory', href: '/school/students', icon: Users },
        { label: 'Bulk Student Import', href: '/school/students/import', icon: Upload, badge: 'CSV/XLSX' },
        { label: 'Teachers & Staff', href: '/school/teachers', icon: GraduationCap },
      ],
    },
    {
      title: 'DAILY OPERATIONS',
      items: [
        { label: 'Daily Attendance', href: '/school/attendance', icon: CalendarCheck },
        { label: 'Fees & Collection', href: '/school/fees', icon: CreditCard },
        { label: 'Examinations & Marks', href: '/school/exams', icon: FileSpreadsheet },
        { label: 'Automated Results', href: '/school/results', icon: Award },
      ],
    },
    {
      title: 'DOCUMENTS & QR ENGINE',
      items: [
        { label: 'Marksheet Generator', href: '/school/documents/marksheets', icon: FileSpreadsheet },
        { label: 'Certificate Generator', href: '/school/documents/certificates', icon: FileBadge },
        { label: 'Admit Cards (Hall Tickets)', href: '/school/documents/admit-cards', icon: BookOpen },
        { label: 'Student & Staff ID Cards', href: '/school/documents/id-cards', icon: Users },
        { label: 'Generated Records & QR', href: '/school/documents/records', icon: QrCode, badge: 'Verify' },
        { label: 'Assigned Templates', href: '/school/templates', icon: Layers },
      ],
    },
    {
      title: 'ENGAGEMENT',
      items: [
        { label: 'Online Admissions', href: '/school/admissions', icon: Inbox },
        { label: 'Notice Board', href: '/school/notices', icon: Bell },
        { label: 'Homework & Assignments', href: '/school/homework', icon: BookOpen },
      ],
    },
    {
      title: 'PORTAL & SETTINGS',
      items: [
        { label: 'Public School Website', href: `/school/${currentSchool?.slug || 'xavier-international'}`, icon: Globe },
        { label: 'Settings & Grading Scale', href: '/school/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AppNavbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Toggle Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 bg-indigo-600 text-white rounded-full shadow-2xl focus:outline-none"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            'w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col transition-all duration-300 z-30',
            'fixed inset-y-0 left-0 pt-16 lg:pt-0 lg:static lg:translate-x-0',
            isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          )}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <SafeImage
              src={currentSchool?.logo_url}
              alt="Logo"
              fallbackSrc="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150"
              className="w-9 h-9 rounded-lg object-contain border border-slate-200 dark:border-slate-700 p-0.5 bg-white shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                {currentSchool?.name || 'School Portal'}
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">/school/{currentSchool?.slug || 'demo'}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-5">
            {navSections.map((section, idx) => (
              <div key={idx}>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5 mb-1.5">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <NavLink
                        key={itemIdx}
                        to={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition group',
                            isActive
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                          )
                        }
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600')} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> RLS Isolated</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
