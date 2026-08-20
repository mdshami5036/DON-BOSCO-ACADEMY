import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { UserRole } from '../../types/database';
import {
  GraduationCap,
  Bell,
  LogOut,
  ChevronDown,
  Building2,
  UserCheck,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Search,
  Command,
  X,
  FileSpreadsheet,
  FileBadge,
  CreditCard,
  CalendarCheck,
  Users,
  Settings,
  Flame,
} from 'lucide-react';
import { Badge } from '../common/UI';

export const AppNavbar: React.FC = () => {
  const { user, currentSchool, logout, demoLoginAs } = useAuth();
  const navigate = useNavigate();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const roleLabels: Record<UserRole, { label: string; color: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral' }> = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'danger' },
    SCHOOL_ADMIN: { label: 'Principal & Admin', color: 'primary' },
    TEACHER: { label: 'Teacher', color: 'success' },
    STUDENT: { label: 'Student', color: 'purple' },
    PARENT: { label: 'Parent', color: 'warning' },
    STAFF: { label: 'Staff', color: 'neutral' },
  };

  const handleSwitchRole = (role: UserRole) => {
    demoLoginAs(role);
    setIsRoleDropdownOpen(false);
    if (role === 'SUPER_ADMIN') {
      navigate('/school/dashboard');
    } else if (role === 'SCHOOL_ADMIN') {
      navigate('/school/dashboard');
    } else if (role === 'TEACHER') {
      navigate('/teacher');
    } else if (role === 'STUDENT' || role === 'PARENT') {
      navigate('/student');
    }
  };

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchItems = [
    { title: 'Student Directory', path: '/school/students', icon: Users, cat: 'People' },
    { title: 'Certificate Generator', path: '/school/documents/certificates', icon: FileBadge, cat: 'Documents' },
    { title: 'Marksheet Generator', path: '/school/documents/marksheets', icon: FileSpreadsheet, cat: 'Documents' },
    { title: 'Fee Collection & Dues', path: '/school/fees', icon: CreditCard, cat: 'Finance' },
    { title: 'Daily Attendance Register', path: '/school/attendance', icon: CalendarCheck, cat: 'Operations' },
    { title: 'School Branding & Seals', path: '/school/branding', icon: Building2, cat: 'Settings' },
    { title: 'Public Web Portal', path: '/', icon: ExternalLink, cat: 'Public' },
  ];

  const filteredSearch = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand / School Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 font-bold text-slate-900 group">
              <img
                src={currentSchool?.logo_url || '/assets/branding/don-bosco-logo.png'}
                alt="Don Bosco Academy Logo"
                className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border-2 border-sapphire-700/20 shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-display font-black text-sm md:text-base tracking-tight text-sapphire-900 uppercase">
                  {currentSchool?.name || 'DON BOSCO ACADEMY'}
                </span>
                <span className="text-[10px] text-coral-600 font-bold tracking-wider uppercase -mt-0.5">
                  ★ {currentSchool?.tagline || 'KNOWLEDGE IS POWER'} ★
                </span>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">
                Raipur Bazar, Nanpur, Sitamarhi
              </span>
              <Link
                to="/"
                target="_blank"
                title="View Public School Website"
                className="text-indigo-600 hover:text-indigo-700 transition ml-1 flex items-center gap-0.5 text-xs font-bold"
              >
                <span>Live Portal</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Center: Global Search Bar (Cmd + K Trigger) */}
          <div className="hidden md:flex flex-1 max-w-xs mx-6">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-500 text-xs border border-slate-200 transition group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span>Search pages, students, marks...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 font-mono text-[10px] font-bold bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-300 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Demo Role Switcher, Notifications, User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sapphire-50 hover:bg-sapphire-100 text-sapphire-900 text-xs font-bold border border-sapphire-200 transition shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-coral-500 animate-pulse" />
                <span>Role: <strong>{user ? roleLabels[user.role]?.label : 'Principal & Admin'}</strong></span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-hover border border-slate-200 p-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase px-2 py-1 tracking-wider">
                    Switch Sandbox Persona
                  </div>
                  <button
                    onClick={() => handleSwitchRole('SUPER_ADMIN')}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-indigo-700">
                      <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> Super Admin
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">ERP</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole('SCHOOL_ADMIN')}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-sapphire-900">
                      <Building2 className="w-3.5 h-3.5 text-sapphire-800" /> Principal / Admin
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sapphire-50 text-sapphire-800 border border-sapphire-200">School</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole('TEACHER')}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-emerald-700">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Teacher Portal
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Staff</span>
                  </button>
                  <button
                    onClick={() => handleSwitchRole('STUDENT')}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-coral-600">
                      <GraduationCap className="w-3.5 h-3.5 text-coral-500" /> Student &amp; Parent
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-coral-50 text-coral-600 border border-coral-200">Portal</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick QR Verify link */}
            <Link
              to="/verify"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              Verify QR
            </Link>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-800 hidden md:inline">
                  {user?.full_name || 'Administrator'}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sapphire-800 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-soft-hover border border-slate-200 p-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.full_name || 'Md. Shami Ahmad'}</p>
                    <p className="text-[11px] text-slate-500">{user?.email || 'principal@donbosco.edu'}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/school/branding"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold text-slate-700"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-500" /> School Branding
                    </Link>
                    <Link
                      to="/school/settings"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold text-slate-700"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" /> School Settings
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 text-xs font-bold transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Global Cmd+K Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-indigo-600 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Jump to page, certificate, or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1.5 tracking-wider">
                Quick Navigation
              </div>
              {filteredSearch.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching tools or pages found.
                </div>
              ) : (
                filteredSearch.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsSearchModalOpen(false);
                        navigate(item.path);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sapphire-50 text-sapphire-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400">{item.cat}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-indigo-600">
                        Jump →
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
