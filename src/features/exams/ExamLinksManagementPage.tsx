import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../auth/AuthContext';
import { PublishableExamLink, ExamLinkType } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { Link as LinkIcon, Plus, QrCode, Calendar, Clock, CheckCircle2, AlertTriangle, Lock, ExternalLink, Users, FileBadge, FileSpreadsheet, Trash2, Edit2, Sparkles, Share2, Copy } from 'lucide-react';
import { Modal } from '../../components/common/UI';

export const ExamLinksManagementPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();
  const [links, setLinks] = useState<PublishableExamLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    link_type: 'ADMIT_CARD_FORM' as ExamLinkType,
    academic_year: '2025-2026',
    exam_name: '',
    description: '',
    expiry_days: 14,
    exam_center: 'Don Bosco Academy Examination Hall, Sitamarhi',
  });

  const loadLinks = async () => {
    try {
      const list = await db.getExamLinks(currentSchool?.id || 'sch-don-bosco');
      setLinks(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, [currentSchool]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.exam_name) {
      toastError('Title and Exam Name are required.');
      return;
    }
    try {
      const expiryDate = new Date(Date.now() + form.expiry_days * 24 * 60 * 60 * 1000).toISOString();
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await db.createExamLink({
        school_id: currentSchool?.id || 'sch-don-bosco',
        title: form.title,
        slug,
        link_type: form.link_type,
        academic_year: form.academic_year,
        exam_name: form.exam_name,
        description: form.description,
        expiry_date: expiryDate,
        exam_center: form.exam_center,
      });
      success('New Examination Portal Link published live!');
      setIsModalOpen(false);
      loadLinks();
    } catch (err: any) {
      toastError(err.message || 'Error creating link');
    }
  };

  const handleIssueAdmitCards = async (linkId: string) => {
    try {
      const res = await db.issueAdmitCardsBulk(linkId);
      success('1-Click Batch: ' + res.count + ' Admit Cards generated & issued with QR codes!');
      loadLinks();
    } catch (err: any) {
      toastError(err.message || 'Error issuing admit cards');
    }
  };

  const handlePublishResults = async (linkId: string) => {
    try {
      await db.publishExamResultsBulk(linkId);
      success('1-Click Batch: Marksheets & results published live to students portal!');
      loadLinks();
    } catch (err: any) {
      toastError(err.message || 'Error publishing results');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this published examination portal link?')) {
      await db.deleteExamLink(id);
      success('Portal link deleted.');
      loadLinks();
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = window.location.origin + '/exam-portal/' + slug;
    navigator.clipboard.writeText(url);
    success('Portal URL copied to clipboard: ' + url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] font-display">Exam & Admit Card Portal Publisher</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Publish time-limited exam forms, 1-click batch issue admit cards, release marksheets, and manage expiration.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/exam-portal" target="_blank" className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs">
            <ExternalLink className="w-4 h-4 text-indigo-600" /><span>View Public Portal</span>
          </a>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-[#EB3C16] text-white font-extrabold text-xs shadow-md shadow-coral-500/20 hover:shadow-coral-glow transition flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" /><span>Publish New Portal Link</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link) => {
          const isExpired = new Date(link.expiry_date).getTime() < Date.now();
          const daysLeft = Math.max(0, Math.ceil((new Date(link.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          return (
            <div key={link.id} className={'bg-white rounded-3xl border p-6 shadow-soft-card space-y-4 flex flex-col justify-between ' + (isExpired ? 'border-rose-200 bg-slate-50/50' : 'border-slate-200')}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-sapphire-50 text-sapphire-900 border border-sapphire-200">{link.academic_year} • {link.link_type.replace(/_/g, ' ')}</span>
                  {isExpired ? (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><Lock className="w-3 h-3" /> EXPIRED</span>
                  ) : (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-600" /> {daysLeft} Days Remaining</span>
                  )}
                </div>
                <div><h3 className="text-lg font-black text-slate-900 font-display">{link.title}</h3><p className="text-xs text-slate-500 mt-0.5">{link.description || 'Public exam portal link.'}</p></div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-slate-400">Exam:</span><strong>{link.exam_name}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Applications:</span><strong className="text-sapphire-900 font-bold">{link.applications_count || 0} Submitted</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Expiry Date:</span><span className="font-mono font-bold text-slate-700">{formatDDMMYYYY(link.expiry_date)}</span></div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCopyLink(link.slug)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer" title="Copy Link URL"><Copy className="w-3.5 h-3.5" /><span>Copy URL</span></button>
                  <button onClick={() => handleDelete(link.id)} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs transition cursor-pointer" title="Delete Link"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {link.link_type === 'ADMIT_CARD_FORM' && (
                  <button onClick={() => handleIssueAdmitCards(link.id)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-sapphire-900 to-indigo-700 text-white font-extrabold text-xs shadow-sm hover:shadow-indigo-glow transition flex items-center gap-1.5 cursor-pointer">
                    <FileBadge className="w-4 h-4 text-amber-300" /><span>1-Click Issue Admit Cards</span>
                  </button>
                )}
                {link.link_type === 'RESULT_PORTAL' && (
                  <button onClick={() => handlePublishResults(link.id)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4" /><span>1-Click Publish Results</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish Dynamic Examination Portal Link" size="lg">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div><label className="block font-bold text-slate-700 mb-1">Portal Title *</label><input type="text" required placeholder="e.g. CBSE Annual Board Exam 2026 - Admit Card Form" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block font-bold text-slate-700 mb-1">Link Function / Type</label><select value={form.link_type} onChange={(e) => setForm({ ...form, link_type: e.target.value as any })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"><option value="ADMIT_CARD_FORM">📝 Examination / Admit Card Form</option><option value="ADMIT_CARD_DOWNLOAD">🎟️ Admit Card Download Portal</option><option value="RESULT_PORTAL">📊 Marksheets & Results Portal</option><option value="CERTIFICATE_RECORDS">📜 Certificate Records Archive</option></select></div>
            <div><label className="block font-bold text-slate-700 mb-1">Academic Session</label><select value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"><option value="2025-2026">2025-2026</option><option value="2026-2027">2026-2027</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block font-bold text-slate-700 mb-1">Exam Name *</label><input type="text" required placeholder="e.g. CBSE Class X Annual Board Exam 2026" value={form.exam_name} onChange={(e) => setForm({ ...form, exam_name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs" /></div>
            <div><label className="block font-bold text-slate-700 mb-1">Active Duration (Days)</label><input type="number" min="1" max="90" value={form.expiry_days} onChange={(e) => setForm({ ...form, expiry_days: parseInt(e.target.value) || 14 })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs" /></div>
          </div>
          <div><label className="block font-bold text-slate-700 mb-1">Instructions / Description</label><textarea rows={2} placeholder="Candidate instructions for this portal..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs" /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-slate-600 text-xs">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-sapphire-900 text-white font-bold text-xs">Publish Link Live</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};