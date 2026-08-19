import React, { useState } from 'react';
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
} from 'lucide-react';
import { Badge, Button } from '../common/UI';

export const AppNavbar: React.FC = () => {
  const { user, currentSchool, logout, demoLoginAs } = useAuth();
  const navigate = useNavigate();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; color: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral' }> = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'danger' },
    SCHOOL_ADMIN: { label: 'School Admin', color: 'primary' },
    TEACHER: { label: 'Teacher', color: 'success' },
    STUDENT: { label: 'Student', color: 'purple' },
    PARENT: { label: 'Parent', color: 'warning' },
    STAFF: { label: 'Staff', color: 'neutral' },
  };

  const handleSwitchRole = (role: UserRole) => {
    demoLoginAs(role);
    setIsRoleDropdownOpen(false);
    if (role === 'SUPER_ADMIN') {
      navigate('/admin');
    } else if (role === 'SCHOOL_ADMIN') {
      navigate('/school/dashboard');
    } else if (role === 'TEACHER') {
      navigate('/teacher');
    } else if (role === 'STUDENT' || role === 'PARENT') {
      navigate('/student');
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / School Identity */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 font-bold text-slate-900 dark:text-white">
            <img
              src={currentSchool?.logo_url || '/assets/branding/don-bosco-logo.svg'}
              alt="Don Bosco Academy Logo"
              className="w-10 h-10 rounded-lg object-contain bg-slate-950 p-1 border border-amber-500/30 shadow-sm"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm md:text-base tracking-tight text-blue-900 dark:text-blue-100 uppercase">
                {currentSchool?.name || 'DON BOSCO ACADEMY'}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold tracking-wider uppercase -mt-0.5">
                {currentSchool?.tagline || 'KNOWLEDGE IS POWER'} • ESTD {currentSchool?.established_year || '1997'}
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-medium text-slate-500">
              Raipur Bazar, Nanpur, Sitamarhi
            </span>
            <Link
              to="/school/don-bosco-academy"
              target="_blank"
              title="View Public School Website"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 transition ml-1 flex items-center gap-0.5 text-xs font-semibold"
            >
              <span>Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Right: Demo Switcher, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800/60 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>Role: <strong>{user ? roleLabels[user.role]?.label : 'Guest'}</strong></span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 tracking-wider">
                  Test Portal Views
                </div>
                <button
                  onClick={() => handleSwitchRole('SUPER_ADMIN')}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200 transition"
                >
                  <span className="flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Super Admin</span>
                  <Badge variant="danger" size="sm">Admin</Badge>
                </button>
                <button
                  onClick={() => handleSwitchRole('SCHOOL_ADMIN')}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200 transition"
                >
                  <span className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-indigo-500" /> School Principal</span>
                  <Badge variant="primary" size="sm">School</Badge>
                </button>
                <button
                  onClick={() => handleSwitchRole('TEACHER')}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200 transition"
                >
                  <span className="flex items-center gap-2"><UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Teacher Portal</span>
                  <Badge variant="success" size="sm">Staff</Badge>
                </button>
                <button
                  onClick={() => handleSwitchRole('STUDENT')}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200 transition"
                >
                  <span className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-purple-500" /> Student & Parent</span>
                  <Badge variant="purple" size="sm">Portal</Badge>
                </button>
              </div>
            )}
          </div>

          {/* Quick QR Verify shortcut */}
          <Link
            to="/verify"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
          >
            Verify QR
          </Link>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50">
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{user?.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-1.5">
                    <Badge variant={user ? roleLabels[user.role]?.color : 'neutral'}>
                      {user ? roleLabels[user.role]?.label : 'Guest'}
                    </Badge>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs font-semibold transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
