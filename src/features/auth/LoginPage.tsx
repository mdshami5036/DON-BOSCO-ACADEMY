import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import { useToast } from '../../components/common/Toast';
import { isFirebaseConfigured } from '../../lib/firebase';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Sparkles,
  Shield,
  BookOpen,
  Users,
  ChevronLeft,
  Flame,
} from 'lucide-react';
import { Button, Input } from '../../components/common/UI';

export const LoginPage: React.FC = () => {
  const { login, loginWithFirebase, demoLoginAs } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isFirebaseConfigured) {
        // Real Supabase Authentication
        const res = await loginWithFirebase(email, password);
        if (res.success) {
          success('Logged in successfully via Firebase!');
          // Profile redirect based on role
          const role = res.user?.role || 'SCHOOL_ADMIN';
          if (role === 'SUPER_ADMIN') navigate('/school/dashboard');
          else if (role === 'SCHOOL_ADMIN') navigate('/school/dashboard');
          else if (role === 'TEACHER') navigate('/teacher');
          else navigate('/student');
        } else {
          toastError(res.error || 'Invalid email or password');
        }
      } else {
        // Local Fallback Login
        const res = await login(email, 'SCHOOL_ADMIN');
        if (res.success) {
          success('Logged in successfully');
          navigate('/school/dashboard');
        } else {
          toastError(res.error || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      toastError(err.message || 'Login error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: any) => {
    demoLoginAs(role);
    success(`Logged in as ${role.replace('_', ' ')}`);
    if (role === 'SUPER_ADMIN') navigate('/school/dashboard');
    else if (role === 'SCHOOL_ADMIN') navigate('/school/dashboard');
    else if (role === 'TEACHER') navigate('/teacher');
    else navigate('/student');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-sapphire-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-coral-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar back to website */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 text-left">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to School Website</span>
        </Link>
      </div>

      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex flex-col items-center gap-2 group">
          <div className="relative">
            <img
              src="/assets/branding/don-bosco-logo.png"
              alt="Don Bosco Academy Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-contain bg-white border-2 border-sapphire-700/20 p-2 shadow-lg shadow-sapphire-900/10 group-hover:scale-105 transition-transform"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full border border-white">
              ESTD 1997
            </div>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0B192C] tracking-tight uppercase mt-1">
            DON BOSCO ACADEMY
          </h1>
          <p className="text-xs font-bold text-coral-600 tracking-wider">
            ★ KNOWLEDGE IS POWER • SITAMARHI ★
          </p>
        </Link>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Unified Institutional ERP &amp; Portal Authentication
        </p>
      </div>

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-hover space-y-6">
          
          {/* Email / Password Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@donbosco.edu"
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-sapphire-500 focus:outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-sapphire-500 focus:outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sapphire-800 to-indigo-700 hover:from-sapphire-900 hover:to-indigo-800 text-white font-black text-xs sm:text-sm tracking-wide shadow-md hover:shadow-indigo-glow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In with Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Role Sandbox */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              or instant 1-click sandbox entry
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-coral-500" /> Choose Role Persona
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                Pre-Loaded
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Super Admin: Indigo Gradient badge */}
              <button
                type="button"
                onClick={() => handleDemoLogin('SUPER_ADMIN')}
                className="p-3 rounded-xl bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-400 text-left transition-all duration-200 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-indigo-700 group-hover:translate-x-0.5 transition-transform">
                    Super Admin
                  </div>
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">Master ERP &amp; Templates</div>
              </button>

              {/* School Admin / Principal: Deep Navy badge */}
              <button
                type="button"
                onClick={() => handleDemoLogin('SCHOOL_ADMIN')}
                className="p-3 rounded-xl bg-white hover:bg-sapphire-50/70 border border-slate-200 hover:border-sapphire-600 text-left transition-all duration-200 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-sapphire-900 group-hover:translate-x-0.5 transition-transform">
                    Principal &amp; Admin
                  </div>
                  <Building2 className="w-3.5 h-3.5 text-sapphire-800" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">Certificates &amp; Branding</div>
              </button>

              {/* Teacher Portal: Emerald Green badge */}
              <button
                type="button"
                onClick={() => handleDemoLogin('TEACHER')}
                className="p-3 rounded-xl bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-400 text-left transition-all duration-200 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                    Teacher Portal
                  </div>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">Attendance &amp; Marks Entry</div>
              </button>

              {/* Student & Parent: Flame Coral badge */}
              <button
                type="button"
                onClick={() => handleDemoLogin('STUDENT')}
                className="p-3 rounded-xl bg-white hover:bg-coral-50/70 border border-slate-200 hover:border-coral-400 text-left transition-all duration-200 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-coral-600 group-hover:translate-x-0.5 transition-transform">
                    Student &amp; Parent
                  </div>
                  <GraduationCap className="w-3.5 h-3.5 text-coral-500" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">Gradebook, ID &amp; Admit Card</div>
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400">
            Official System of <strong className="text-slate-700">DON BOSCO ACADEMY</strong>, Sitamarhi (843326)
          </div>

        </div>
      </motion.div>
    </div>
  );
};
