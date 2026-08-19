import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../../components/common/Toast';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Button, Input, Card } from '../../components/common/UI';

export const LoginPage: React.FC = () => {
  const { login, loginWithSupabase, demoLoginAs } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        // Real Supabase Authentication
        const res = await loginWithSupabase(email, password);
        if (res.success) {
          success('Logged in successfully via Supabase!');
          // Profile redirect based on role
          const role = res.user?.role || 'SCHOOL_ADMIN';
          if (role === 'SUPER_ADMIN') navigate('/admin');
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
    if (role === 'SUPER_ADMIN') navigate('/admin');
    else if (role === 'SCHOOL_ADMIN') navigate('/school/dashboard');
    else if (role === 'TEACHER') navigate('/teacher');
    else navigate('/student');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex flex-col items-center gap-2 mb-2">
          <img
            src="/assets/branding/don-bosco-logo.png"
            alt="Don Bosco Academy Logo"
            className="w-24 h-24 rounded-2xl object-contain bg-white border-2 border-amber-500/40 p-1 shadow-xl shadow-amber-500/10"
          />
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide uppercase mt-1">
            DON BOSCO ACADEMY
          </h1>
          <p className="text-xs font-mono font-bold text-amber-400">
            ★ KNOWLEDGE IS POWER • ESTD 1997 ★
          </p>
          <p className="text-xs text-slate-400">
            Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326
          </p>
        </Link>
        <h2 className="text-lg font-bold text-slate-200 mt-2">Single-School Management Portal</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Real Supabase Sign-in Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full font-bold py-2.5" isLoading={isLoading}>
              Sign In with Email & Password
            </Button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">or 1-click portal entry</span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Select Your Designated Role Portal
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('SUPER_ADMIN')}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-left transition cursor-pointer"
              >
                <div className="text-xs font-bold text-rose-400">Super Admin</div>
                <div className="text-[9px] text-slate-400">Master Data Control</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('SCHOOL_ADMIN')}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-left transition cursor-pointer"
              >
                <div className="text-xs font-bold text-indigo-400">School Admin</div>
                <div className="text-[9px] text-slate-400">Principal & Documents</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('TEACHER')}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-left transition cursor-pointer"
              >
                <div className="text-xs font-bold text-emerald-400">Teacher Portal</div>
                <div className="text-[9px] text-slate-400">Marks & Attendance</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('STUDENT')}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-left transition cursor-pointer"
              >
                <div className="text-xs font-bold text-purple-400">Student Portal</div>
                <div className="text-[9px] text-slate-400">Report Card & Admit</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Official Institution Enterprise Management System &bull; Cryptographically Verified
          </p>
        </div>
      </div>
    </div>
  );
};
