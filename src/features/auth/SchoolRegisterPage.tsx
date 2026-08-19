import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../../components/common/Toast';
import {
  GraduationCap,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Button, Input, Select, Card } from '../../components/common/UI';
import confetti from 'canvas-confetti';

export const SchoolRegisterPage: React.FC = () => {
  const { registerSchool } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredSchoolName, setRegisteredSchoolName] = useState('');

  // Form State
  const [schoolData, setSchoolData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    principal_name: '',
    logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
    subscription_plan_id: 'plan-starter',
  });

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSchoolData((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminData.password !== adminData.confirmPassword) {
      toastError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerSchool(schoolData, adminData);
      if (res.success) {
        setRegisteredSchoolName(schoolData.name);
        setIsSuccess(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        success('School account created successfully!');
      } else {
        toastError(res.error || 'Failed to register school');
      }
    } catch (err: any) {
      toastError(err.message || 'Registration error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h2>
          <p className="text-sm text-slate-300 mb-6">
            <strong>{registeredSchoolName}</strong> has been registered in the system. The platform Super Admin can now review and approve your tenant account.
          </p>

          <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 text-left mb-6 space-y-1.5 border border-slate-700">
            <div><strong>Tenant Slug:</strong> {schoolData.slug}</div>
            <div><strong>Admin Email:</strong> {adminData.email}</div>
            <div><strong>Status:</strong> <span className="text-amber-400 font-semibold">Pending Approval</span></div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              className="w-full font-semibold"
              onClick={() => navigate('/school/dashboard')}
            >
              Enter School Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-700 text-slate-300"
              onClick={() => navigate('/admin/schools')}
            >
              Go to Super Admin Approvals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5 font-bold text-2xl text-white mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span>EduCloud SaaS</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-white">Register Your School Account</h2>
        <p className="text-xs text-slate-400 mt-1">Create an independent tenant for your educational institution</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 1 ? 'text-indigo-400' : 'text-slate-500'}`}>
              <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-500 flex items-center justify-center text-xs">1</span>
              <span>School Info</span>
            </div>
            <div className="w-12 h-px bg-slate-800" />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 2 ? 'text-indigo-400' : 'text-slate-500'}`}>
              <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-500 flex items-center justify-center text-xs">2</span>
              <span>Branding</span>
            </div>
            <div className="w-12 h-px bg-slate-800" />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 3 ? 'text-indigo-400' : 'text-slate-500'}`}>
              <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-500 flex items-center justify-center text-xs">3</span>
              <span>Admin Account</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="School Name *"
                  placeholder="e.g. Oakridge International Academy"
                  value={schoolData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
                <Input
                  label="School URL Slug *"
                  placeholder="e.g. oakridge-academy"
                  value={schoolData.slug}
                  onChange={(e) => setSchoolData({ ...schoolData, slug: e.target.value })}
                  helperText="Your public school website will be: /school/your-slug"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Official Email *"
                    type="email"
                    placeholder="admin@school.edu"
                    value={schoolData.email}
                    onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone Number *"
                    placeholder="+1 (555) 000-0000"
                    value={schoolData.phone}
                    onChange={(e) => setSchoolData({ ...schoolData, phone: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Campus Address *"
                  placeholder="123 Education Boulevard"
                  value={schoolData.address}
                  onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                  required
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="City"
                    placeholder="City"
                    value={schoolData.city}
                    onChange={(e) => setSchoolData({ ...schoolData, city: e.target.value })}
                  />
                  <Input
                    label="State"
                    placeholder="State"
                    value={schoolData.state}
                    onChange={(e) => setSchoolData({ ...schoolData, state: e.target.value })}
                  />
                  <Input
                    label="Country"
                    placeholder="Country"
                    value={schoolData.country}
                    onChange={(e) => setSchoolData({ ...schoolData, country: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      if (!schoolData.name || !schoolData.email) {
                        toastError('Please fill in school name and email');
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    Next Step <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Input
                  label="Principal / Head of School Name *"
                  placeholder="e.g. Dr. Eleanor Vance, Ph.D."
                  value={schoolData.principal_name}
                  onChange={(e) => setSchoolData({ ...schoolData, principal_name: e.target.value })}
                  required
                />
                <Input
                  label="School Logo Image URL"
                  placeholder="https://.../logo.png"
                  value={schoolData.logo_url}
                  onChange={(e) => setSchoolData({ ...schoolData, logo_url: e.target.value })}
                  helperText="You can also upload your logo and principal signature later from the school profile dashboard."
                />

                <Select
                  label="Select Subscription Tier"
                  value={schoolData.subscription_plan_id}
                  onChange={(e) => setSchoolData({ ...schoolData, subscription_plan_id: e.target.value })}
                >
                  <option value="plan-starter">Starter Free (150 Students)</option>
                  <option value="plan-growth">Growth Academy ($49/mo - 1,000 Students)</option>
                  <option value="plan-enterprise">Enterprise Multi-Campus ($149/mo)</option>
                </Select>

                <div className="pt-4 flex items-center justify-between">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      if (!schoolData.principal_name) {
                        toastError('Please enter principal name');
                        return;
                      }
                      setStep(3);
                    }}
                  >
                    Next Step <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Input
                  label="School Administrator Full Name *"
                  placeholder="e.g. John Doe"
                  value={adminData.name}
                  onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                  required
                />
                <Input
                  label="Admin Login Email *"
                  type="email"
                  placeholder="admin@your-school.edu"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password *"
                    type="password"
                    placeholder="••••••••"
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    required
                  />
                  <Input
                    label="Confirm Password *"
                    type="password"
                    placeholder="••••••••"
                    value={adminData.confirmPassword}
                    onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isLoading} className="font-bold">
                    Complete School Registration
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
              School Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
