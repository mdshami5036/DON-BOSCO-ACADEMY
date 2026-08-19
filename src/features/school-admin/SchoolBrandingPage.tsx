import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../services/db';
import { School } from '../../types/database';
import { useAuth } from '../auth/AuthContext';
import {
  Building2,
  Upload,
  Image as ImageIcon,
  Save,
  CheckCircle,
  Eye,
  Sparkles,
  Shield,
  Facebook,
  RefreshCw,
} from 'lucide-react';
import { DON_BOSCO_SCHOOL_ID } from '../../lib/mock-data';

export const SchoolBrandingPage: React.FC = () => {
  const { currentSchool, switchSchool } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState<'web' | 'certificate' | 'marksheet' | 'verification'>('web');

  const [formData, setFormData] = useState<Partial<School>>({
    name: 'DON BOSCO ACADEMY',
    tagline: 'KNOWLEDGE IS POWER',
    established_year: '1997',
    school_type: 'Residential Cum Day School',
    academic_pattern: 'CBSE Pattern',
    classes_offered: 'Play to Class 10th',
    address: 'Raipur Bazar, Nanpur, Sitamarhi',
    city: 'Sitamarhi',
    state: 'Bihar',
    country: 'India',
    postal_code: '843326',
    email: 'donboscoacademy002@gmail.com',
    phone: '+91 91024 35126',
    website: 'https://donboscoacademy.edu.in',
    facebook_url: 'https://www.facebook.com/donboscoacademy002',
    about: 'Established in 1997, DON BOSCO ACADEMY is a premier Residential Cum Day School in Raipur Bazar, Nanpur, Sitamarhi (Bihar). Operating on the CBSE pattern from Play Group to Class 10th.',
    logo_url: '/assets/branding/don-bosco-logo.png',
    banner_url: '/assets/branding/main-banner.svg',
    admission_banner_url: '/assets/branding/admission-banner.svg',
    announcement_banner_url: '/assets/branding/main-banner.svg',
    header_banner_url: '/assets/branding/main-banner.svg',
    principal_name: 'Md. Shami Ahmad',
    principal_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    principal_signature_url: '/assets/branding/principal-signature.svg',
    stamp_url: '/assets/branding/don-bosco-stamp.svg',
    certificate_bg_url: '/official-certificate-border.jpg',
    marksheet_bg_url: '/official-certificate-border.jpg',
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    loadSchoolData();
  }, []);

  const loadSchoolData = async () => {
    setLoading(true);
    try {
      const school = await db.getPrimarySchool();
      if (school) {
        setFormData(school);
      }
    } catch (e) {
      console.error('Error loading school branding data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (field: keyof School, file: File) => {
    setUploadingField(field as string);
    try {
      const publicUrl = await db.uploadBrandingAsset(file, 'branding');
      setFormData((prev) => ({ ...prev, [field]: publicUrl }));
    } catch (error) {
      console.error('Error uploading ' + String(field) + ':', error);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const schoolId = formData.id || DON_BOSCO_SCHOOL_ID;
      const updated = await db.updateSchool(schoolId, formData);
      if (updated) {
        setFormData(updated);
        if (currentSchool?.id === updated.id) {
          await switchSchool(updated.id);
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to save branding:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderUploadCard = (
    label: string,
    field: keyof School,
    description: string,
    currentValue?: string | null
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isUploading = uploadingField === field;

    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white text-sm">{label}</h4>
            {isUploading && (
              <span className="text-xs text-amber-400 flex items-center gap-1 font-mono">
                <RefreshCw className="w-3 h-3 animate-spin" /> Uploading...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3">{description}</p>
        </div>

        <div className="relative group rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/80 flex items-center justify-center p-3">
          {currentValue ? (
            <img
              src={currentValue}
              alt={label}
              className="max-h-32 object-contain w-full rounded-lg transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="py-8 text-center text-slate-500 flex flex-col items-center">
              <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
              <span className="text-xs">No asset configured</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" /> Replace
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(field, f);
            }}
          />
          <input
            type="text"
            name={field as string}
            value={currentValue || ''}
            onChange={handleInputChange}
            placeholder="Asset URL or upload file"
            className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                School Branding & Identity
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Official single-school visual identity, promotional banners, stamps, signatures & CBSE details
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium animate-fadeIn">
              <CheckCircle className="w-4 h-4" /> Branding Saved Successfully!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save School Identity
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Core School Identity Info */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Institutional Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Official School Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tagline / Motto *
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline || ''}
                onChange={handleInputChange}
                placeholder="e.g. KNOWLEDGE IS POWER"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-amber-300 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Established Year *
              </label>
              <input
                type="text"
                name="established_year"
                value={formData.established_year || ''}
                onChange={handleInputChange}
                placeholder="e.g. 1997"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                School Type *
              </label>
              <input
                type="text"
                name="school_type"
                value={formData.school_type || ''}
                onChange={handleInputChange}
                placeholder="e.g. Residential Cum Day School"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Academic Pattern *
              </label>
              <input
                type="text"
                name="academic_pattern"
                value={formData.academic_pattern || ''}
                onChange={handleInputChange}
                placeholder="e.g. CBSE Pattern"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Classes Offered *
              </label>
              <input
                type="text"
                name="classes_offered"
                value={formData.classes_offered || ''}
                onChange={handleInputChange}
                placeholder="e.g. Play to Class 10th"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/60">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                School Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="Raipur Bazar, Nanpur, Sitamarhi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                City / District
              </label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Postal PIN Code
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code || ''}
                onChange={handleInputChange}
                placeholder="843326"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/60">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Official Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Contact Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Facebook Page URL
              </label>
              <input
                type="text"
                name="facebook_url"
                value={formData.facebook_url || ''}
                onChange={handleInputChange}
                placeholder="https://facebook.com/donboscoacademy002"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              About School / Introduction
            </label>
            <textarea
              name="about"
              rows={3}
              value={formData.about || ''}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Branding Assets & Media Section */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Visual Branding Assets & Banners</h2>
                <p className="text-xs text-slate-400">All uploaded media synchronizes with Supabase Storage automatically</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderUploadCard(
              'Official School Logo',
              'logo_url',
              'Used across Header, Footer, Admin, Certificates, Marksheets & Verifier',
              formData.logo_url
            )}

            {renderUploadCard(
              'Main Website Hero Banner',
              'banner_url',
              'Main prominent hero banner for public homepage',
              formData.banner_url
            )}

            {renderUploadCard(
              'Admission Campaign Banner',
              'admission_banner_url',
              'Used in admissions section & online enrollment notices',
              formData.admission_banner_url
            )}

            {renderUploadCard(
              'Public Announcement Banner',
              'announcement_banner_url',
              'Used for notice boards and special circulars',
              formData.announcement_banner_url
            )}

            {renderUploadCard(
              'Principal Photo',
              'principal_photo_url',
              "Used in Principal's desk & leadership section",
              formData.principal_photo_url
            )}

            {renderUploadCard(
              'Principal Signature',
              'principal_signature_url',
              'Official signature automatically printed on Certificates & Marksheets',
              formData.principal_signature_url
            )}

            {renderUploadCard(
              'Official School Stamp / Seal',
              'stamp_url',
              'High-resolution authorized stamp embedded on verification docs',
              formData.stamp_url
            )}

            {renderUploadCard(
              'Certificate Background',
              'certificate_bg_url',
              'A4 border background for Achievement & Passing Certificates',
              formData.certificate_bg_url
            )}

            {renderUploadCard(
              'Marksheet Background',
              'marksheet_bg_url',
              'Official background border for CBSE Marksheets & Report Cards',
              formData.marksheet_bg_url
            )}
          </div>
        </div>

        {/* Live Brand Preview Sandbox */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Live Brand Preview Sandbox</h2>
            </div>

            <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPreviewTab('web')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  previewTab === 'web' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Website Header
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('certificate')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  previewTab === 'certificate' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Certificate
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('marksheet')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  previewTab === 'marksheet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Marksheet
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center">
            {previewTab === 'web' && (
              <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-blue-950/80 px-4 py-2 border-b border-blue-900/50 flex items-center justify-between text-xs text-blue-200">
                  <div className="flex items-center gap-4">
                    <span>📍 {formData.address}</span>
                    <span>✉️ {formData.email}</span>
                  </div>
                  {formData.facebook_url && (
                    <a href={formData.facebook_url} target="_blank" rel="noreferrer" className="text-blue-400 flex items-center gap-1">
                      <Facebook className="w-3 h-3" /> Facebook
                    </a>
                  )}
                </div>
                <div className="p-4 flex items-center justify-between bg-slate-900">
                  <div className="flex items-center gap-3">
                    <img src={formData.logo_url || ''} alt="Logo" className="w-12 h-12 object-contain" />
                    <div>
                      <h3 className="font-bold text-white text-base tracking-wide">{formData.name}</h3>
                      <p className="text-xs text-amber-400 font-semibold">{formData.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                    <span>Home</span>
                    <span>About</span>
                    <span>Academics</span>
                    <span>Admissions</span>
                    <button type="button" className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold">Portal Login</button>
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'certificate' && (
              <div className="w-full max-w-xl bg-white text-slate-900 rounded-xl p-8 shadow-2xl border-4 border-amber-500/40 relative font-serif text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <img src={formData.logo_url || ''} alt="Logo" className="w-16 h-16 object-contain" />
                </div>
                <h2 className="text-2xl font-black text-blue-950 tracking-wider uppercase">{formData.name}</h2>
                <p className="text-xs text-slate-600 -mt-2">{formData.address} • ESTD {formData.established_year}</p>
                <div className="py-2 border-y border-amber-500/30">
                  <span className="text-amber-800 font-bold uppercase tracking-widest text-sm">Certificate of Excellence</span>
                </div>
                <p className="text-sm italic text-slate-700">This is to certify that student Aman Kumar Singh has achieved outstanding academic distinction.</p>
                <div className="flex items-end justify-between pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <img src={formData.stamp_url || ''} alt="Seal" className="w-14 h-14 object-contain mx-auto" />
                    <span className="text-[10px] uppercase font-bold text-slate-500">Official Seal</span>
                  </div>
                  <div className="text-center">
                    <img src={formData.principal_signature_url || ''} alt="Sign" className="h-8 object-contain mx-auto" />
                    <span className="text-[10px] uppercase font-bold text-slate-500">Principal Signature</span>
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'marksheet' && (
              <div className="w-full max-w-xl bg-white text-slate-900 rounded-xl p-6 shadow-2xl border border-slate-300 font-sans space-y-3">
                <div className="flex items-center gap-3 border-b pb-3">
                  <img src={formData.logo_url || ''} alt="Logo" className="w-12 h-12 object-contain" />
                  <div>
                    <h3 className="font-bold text-blue-950 text-base">{formData.name}</h3>
                    <p className="text-xs text-slate-500">{formData.address}</p>
                    <p className="text-[11px] font-semibold text-blue-800">{formData.academic_pattern} • Session 2025-2026</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded text-xs grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Student:</strong> Aman Kumar Singh</div>
                  <div><strong>Class:</strong> Class 10 (Sec A)</div>
                  <div><strong>Roll No:</strong> 1001</div>
                  <div><strong>Result:</strong> <span className="text-emerald-600 font-bold">PASS (93.67%)</span></div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t text-[11px] text-slate-500">
                  <span>Verification Code: DBA-VERIFY-2026-001</span>
                  <img src={formData.stamp_url || ''} alt="Seal" className="w-10 h-10 object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
