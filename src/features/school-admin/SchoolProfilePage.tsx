import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { useToast } from '../../components/common/Toast';
import { normalizeImageUrl, isGoogleDriveUrl, SafeImage } from '../../lib/image-helper';
import {
  Building2,
  Save,
  Upload,
  Globe,
  Phone,
  Mail,
  MapPin,
  FileSignature,
  Stamp,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { Button, Input, Card, Badge } from '../../components/common/UI';

export const SchoolProfilePage: React.FC = () => {
  const { currentSchool, switchSchool, user } = useAuth();
  const { success, error: toastError } = useToast();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.is_super_admin;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    website: '',
    about: '',
    principal_name: '',
    logo_url: '',
    banner_url: '',
    principal_photo_url: '',
    principal_signature_url: '',
    stamp_url: '',
  });

  useEffect(() => {
    if (currentSchool) {
      setFormData({
        name: currentSchool.name || '',
        slug: currentSchool.slug || '',
        email: currentSchool.email || '',
        phone: currentSchool.phone || '',
        address: currentSchool.address || '',
        city: currentSchool.city || '',
        state: currentSchool.state || '',
        country: currentSchool.country || 'United States',
        postal_code: currentSchool.postal_code || '',
        website: currentSchool.website || '',
        about: currentSchool.about || '',
        principal_name: currentSchool.principal_name || '',
        logo_url: currentSchool.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
        banner_url: currentSchool.banner_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
        principal_photo_url: currentSchool.principal_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        principal_signature_url: currentSchool.principal_signature_url || 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Signature_example.svg',
        stamp_url: currentSchool.stamp_url || 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Sample_Seal.svg',
      });
    }
  }, [currentSchool]);

  const handleFileUpload = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
        success(`${String(field).replace(/_/g, ' ')} loaded successfully!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    setIsLoading(true);
    try {
      // Normalize all Google Drive / cloud URLs before persisting
      const normalizedPayload = {
        ...formData,
        logo_url: normalizeImageUrl(formData.logo_url),
        banner_url: normalizeImageUrl(formData.banner_url),
        principal_photo_url: normalizeImageUrl(formData.principal_photo_url),
        principal_signature_url: normalizeImageUrl(formData.principal_signature_url),
        stamp_url: normalizeImageUrl(formData.stamp_url),
      };

      const updated = await db.updateSchool(currentSchool.id, normalizedPayload);
      if (updated) {
        await switchSchool(currentSchool.id);
        success('School profile updated successfully!');
      }
    } catch (err: any) {
      toastError(err.message || 'Error updating school profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">School Profile & Contact</h1>
            <Badge variant="primary" size="md">Don Bosco Academy</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure institutional profile, address in Raipur Bazar, Nanpur, Sitamarhi, contact details, and principal signature
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/school/${formData.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Globe className="w-3.5 h-3.5" /> View Public Site <ExternalLink className="w-3 h-3" />
          </a>
          {isSuperAdmin ? (
            <Button type="submit" variant="primary" isLoading={isLoading} className="font-bold">
              <Save className="w-4 h-4 mr-1.5" /> Save Changes
            </Button>
          ) : (
            <Button type="button" variant="outline" disabled className="text-xs opacity-60">
              <Lock className="w-3.5 h-3.5 mr-1" /> Controlled by Super Admin
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: School Details & Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Institutional Information">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="School Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isSuperAdmin}
                  required
                />
                <Input
                  label="Public Slug Identifier *"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  helperText="URL: /school/[slug]"
                  disabled={!isSuperAdmin}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isSuperAdmin}
                  required
                />
                <Input
                  label="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isSuperAdmin}
                  required
                />
              </div>

              <Input
                label="Campus Address *"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isSuperAdmin}
                required
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isSuperAdmin}
                />
                <Input
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isSuperAdmin}
                />
                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!isSuperAdmin}
                />
              </div>

              <Input
                label="Official Website URL"
                placeholder="https://yourschool.edu"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isSuperAdmin}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  About the School (Displayed on Public Page)
                </label>
                <textarea
                  rows={4}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  disabled={!isSuperAdmin}
                  className="w-full text-xs p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                  placeholder="Describe your institution's mission, history, and achievements..."
                />
              </div>
            </div>
          </Card>

          <Card title="Head of School & Principal Desk">
            <div className="space-y-4">
              <Input
                label="Principal Full Name *"
                value={formData.principal_name}
                onChange={(e) => setFormData({ ...formData, principal_name: e.target.value })}
                disabled={!isSuperAdmin}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Principal Photo (URL, Google Drive Link or Upload)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <SafeImage
                      src={formData.principal_photo_url}
                      alt="Principal"
                      fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500 p-0.5 bg-white"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <Input
                      placeholder="Paste image URL or Google Drive link"
                      value={formData.principal_photo_url}
                      onChange={(e) => setFormData({ ...formData, principal_photo_url: e.target.value })}
                      disabled={!isSuperAdmin}
                      helperText={isGoogleDriveUrl(formData.principal_photo_url) ? '✓ Google Drive link auto-converted to direct image preview' : undefined}
                    />

                    {isSuperAdmin && (
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer border border-slate-300 dark:border-slate-700">
                          <Upload className="w-3 h-3" /> Upload from Computer
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload('principal_photo_url')} />
                        </label>
                        {isGoogleDriveUrl(formData.principal_photo_url) && (
                          <Badge variant="purple" size="sm">Google Drive Link Connected</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Visual Branding & Signatures */}
        <div className="space-y-6">
          <Card title="Official Logos & Assets">
            <div className="space-y-5">
              {/* School Logo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  School Logo (Google Drive Link or URL)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-white shrink-0 flex items-center justify-center overflow-hidden">
                    <SafeImage
                      src={formData.logo_url}
                      alt="Logo"
                      fallbackSrc="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Input
                      placeholder="Logo URL or Google Drive link"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      disabled={!isSuperAdmin}
                      helperText={isGoogleDriveUrl(formData.logo_url) ? '✓ Google Drive link auto-converted to direct preview' : undefined}
                    />

                    {isSuperAdmin && (
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer border border-slate-300 dark:border-slate-700">
                          <Upload className="w-3 h-3" /> Upload Logo
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload('logo_url')} />
                        </label>
                        {isGoogleDriveUrl(formData.logo_url) && (
                          <Badge variant="purple" size="sm">Google Drive Active</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Public Banner */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Public Banner Photo
                </label>
                <div className="space-y-2">
                  <div className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <SafeImage
                      src={formData.banner_url}
                      alt="Banner"
                      fallbackSrc="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Input
                    placeholder="Banner photo URL or Google Drive link"
                    value={formData.banner_url}
                    onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                    disabled={!isSuperAdmin}
                    helperText={isGoogleDriveUrl(formData.banner_url) ? '✓ Google Drive link auto-converted to direct preview' : undefined}
                  />
                  {isSuperAdmin && (
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer border border-slate-300 dark:border-slate-700">
                      <Upload className="w-3 h-3" /> Upload Banner
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload('banner_url')} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Document Verification Stamps">
            <div className="space-y-4 text-xs">
              {/* Principal Signature */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Principal Signature (Google Drive link or PNG)
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center mb-2">
                  <SafeImage
                    src={formData.principal_signature_url}
                    alt="Sig"
                    fallbackSrc="https://upload.wikimedia.org/wikipedia/commons/f/f8/Signature_example.svg"
                    className="max-h-12 mx-auto"
                  />
                </div>
                <Input
                  value={formData.principal_signature_url}
                  onChange={(e) => setFormData({ ...formData, principal_signature_url: e.target.value })}
                  placeholder="Paste URL or Google Drive link"
                  disabled={!isSuperAdmin}
                  helperText={isGoogleDriveUrl(formData.principal_signature_url) ? '✓ Google Drive link auto-converted' : undefined}
                />
                {isSuperAdmin && (
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer border border-slate-300 dark:border-slate-700 mt-1">
                    <Upload className="w-3 h-3" /> Upload Signature PNG
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload('principal_signature_url')} />
                  </label>
                )}
              </div>

              {/* School Stamp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Official School Seal / Stamp
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center mb-2">
                  <SafeImage
                    src={formData.stamp_url}
                    alt="Stamp"
                    fallbackSrc="https://upload.wikimedia.org/wikipedia/commons/e/ea/Sample_Seal.svg"
                    className="max-h-14 mx-auto"
                  />
                </div>
                <Input
                  value={formData.stamp_url}
                  onChange={(e) => setFormData({ ...formData, stamp_url: e.target.value })}
                  placeholder="Paste URL or Google Drive link"
                  disabled={!isSuperAdmin}
                  helperText={isGoogleDriveUrl(formData.stamp_url) ? '✓ Google Drive link auto-converted' : undefined}
                />
                {isSuperAdmin && (
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer border border-slate-300 dark:border-slate-700 mt-1">
                    <Upload className="w-3 h-3" /> Upload Stamp PNG
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload('stamp_url')} />
                  </label>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
};
