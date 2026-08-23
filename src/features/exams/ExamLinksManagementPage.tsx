import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../auth/AuthContext';
import { PublishableExamLink, ExamLinkType, ClassRoom } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import {
  Link as LinkIcon,
  Plus,
  QrCode,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Users,
  FileBadge,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Sparkles,
  Share2,
  Copy,
  Award,
  ShieldCheck,
  Check,
  CalendarCheck,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../../components/common/UI';

const DEFAULT_TIMETABLE = [
  { subject: 'English Language & Literature', date: '2026-03-02', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
  { subject: 'Mathematics (Standard)', date: '2026-03-05', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
  { subject: 'Science & Physics Lab', date: '2026-03-08', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
  { subject: 'Social Science', date: '2026-03-11', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
  { subject: 'Hindi Course-A', date: '2026-03-14', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
  { subject: 'Computer Applications & AI', date: '2026-03-17', time: '10:00 AM - 12:30 PM', room: 'Lab 2' },
];

export const ExamLinksManagementPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();
  const [links, setLinks] = useState<PublishableExamLink[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal 1: Create / Publish Examination Form
  const [isExamFormModalOpen, setIsExamFormModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<PublishableExamLink | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    academic_year: '2025-2026',
    exam_name: '',
    marksheet_title: 'ANNUAL EXAMINATION MARKSHEET',
    target_classes: ['ALL'] as string[],
    description: '',
    expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    exam_center: 'Don Bosco Academy Main Examination Hall, Sitamarhi',
    is_active: true,
  });

    // Modal 2: Issue Admit Cards with Timetable Scheduler
  const [isAdmitSchedulerOpen, setIsAdmitSchedulerOpen] = useState(false);
  const [selectedSourceExamId, setSelectedSourceExamId] = useState('');
  const [selectedSchedulerClass, setSelectedSchedulerClass] = useState('ALL');
  const [classTimetables, setClassTimetables] = useState<Record<string, Array<{ subject: string; date: string; time: string; room: string }>>>({});
  const [admitTimetable, setAdmitTimetable] = useState<Array<{
    subject: string;
    date: string;
    time: string;
    room: string;
  }>>(DEFAULT_TIMETABLE);

  // Modal 3: Issue Marksheets & Declare Results Modal
  const [isMarksheetModalOpen, setIsMarksheetModalOpen] = useState(false);
  const [selectedMarksheetExamId, setSelectedMarksheetExamId] = useState('');
  const [marksheetAuditData, setMarksheetAuditData] = useState<{
    total: number;
    graded: number;
    pending: number;
    list: Array<{
      id: string;
      student_name: string;
      roll_number: string;
      admission_number: string;
      class_name: string;
      is_graded: boolean;
      total_subjects: number;
      graded_subjects: number;
    }>;
  }>({ total: 0, graded: 0, pending: 0, list: [] });

  // Modal 4: Published URL Pop-up
  const [publishedDialog, setPublishedDialog] = useState<{ isOpen: boolean; url: string; title: string } | null>(null);

  const loadData = async () => {
    try {
      const [lList, cList, aList] = await Promise.all([
        db.getExamLinks(currentSchool?.id || 'sch-don-bosco'),
        db.getClasses(currentSchool?.id || 'sch-don-bosco'),
        db.getExamApplications(),
      ]);
      setLinks(lList);
      setClasses(cList);
      setApplications(aList);
      if (lList.length > 0 && !selectedSourceExamId) {
        setSelectedSourceExamId(lList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  // Toggle single class or ALL in multi-class selection
  const handleToggleClass = (className: string) => {
    if (className === 'ALL') {
      setForm((prev) => ({
        ...prev,
        target_classes: prev.target_classes.includes('ALL') ? [] : ['ALL'],
      }));
      return;
    }

    setForm((prev) => {
      let current = prev.target_classes.filter((c) => c !== 'ALL');
      if (current.includes(className)) {
        current = current.filter((c) => c !== className);
      } else {
        current = [...current, className];
      }
      return {
        ...prev,
        target_classes: current.length === 0 ? ['ALL'] : current,
      };
    });
  };

  // Open Create Exam Form
  const handleOpenCreateForm = () => {
    setEditingLink(null);
    setForm({
      title: '',
      slug: '',
      academic_year: '2025-2026',
      exam_name: '',
      marksheet_title: 'ANNUAL EXAMINATION MARKSHEET',
      target_classes: ['ALL'],
      description: 'Fill candidate examination particulars for upcoming annual examination.',
      expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      exam_center: 'Don Bosco Academy Main Examination Hall, Sitamarhi',
      is_active: true,
    });
    setIsExamFormModalOpen(true);
  };

  // Open Edit Link
  const handleOpenEdit = (link: PublishableExamLink) => {
    setEditingLink(link);
    const expDate = link.expiry_date ? link.expiry_date.split('T')[0] : new Date().toISOString().split('T')[0];
    setForm({
      title: link.title || '',
      slug: link.slug || '',
      academic_year: link.academic_year || '2025-2026',
      exam_name: link.exam_name || '',
      marksheet_title: link.marksheet_title || 'ANNUAL EXAMINATION MARKSHEET',
      target_classes: link.target_classes && link.target_classes.length > 0 ? link.target_classes : ['ALL'],
      description: link.description || '',
      expiry_date: expDate,
      exam_center: link.exam_center || 'Don Bosco Academy Main Examination Hall, Sitamarhi',
      is_active: link.is_active !== undefined ? link.is_active : true,
    });
    setIsExamFormModalOpen(true);
  };

  // Save Examination Form
  const handleSaveExamForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.exam_name) {
      toastError('Title and Exam Name are required.');
      return;
    }
    try {
      const expiryIso = new Date(form.expiry_date + 'T23:59:59').toISOString();
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (editingLink) {
        await db.updateExamLink(editingLink.id, {
          title: form.title,
          slug,
          academic_year: form.academic_year,
          exam_name: form.exam_name,
          marksheet_title: form.marksheet_title,
          description: form.description,
          expiry_date: expiryIso,
          exam_center: form.exam_center,
          target_classes: form.target_classes.length === 0 ? ['ALL'] : form.target_classes,
          is_active: form.is_active,
        });
        success('Examination Form Link updated successfully!');
      } else {
        await db.createExamLink({
          school_id: currentSchool?.id || 'sch-don-bosco',
          title: form.title,
          slug,
          link_type: 'ADMIT_CARD_FORM',
          academic_year: form.academic_year,
          exam_name: form.exam_name,
          marksheet_title: form.marksheet_title,
          description: form.description,
          expiry_date: expiryIso,
          exam_center: form.exam_center,
          target_classes: form.target_classes.length === 0 ? ['ALL'] : form.target_classes,
          is_active: form.is_active,
        });
        const urlPath = '/exam-portal/form/' + slug;
        setPublishedDialog({
          isOpen: true,
          url: window.location.origin + urlPath,
          title: form.title,
        });
        success('New Examination Form posted live to ERP Portal!');
      }
      setIsExamFormModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error saving examination form');
    }
  };

    // Open Issue Admit Cards Scheduler
  const handleOpenAdmitScheduler = (linkId?: string) => {
    const targetId = linkId || selectedSourceExamId || (links[0]?.id || '');
    setSelectedSourceExamId(targetId);
    setSelectedSchedulerClass('ALL');

    const matchedLink = links.find((l) => l.id === targetId);
    if (matchedLink && matchedLink.timetable && matchedLink.timetable.length > 0) {
      setAdmitTimetable(matchedLink.timetable as any);
    } else {
      setAdmitTimetable(DEFAULT_TIMETABLE);
    }
    if (matchedLink && matchedLink.class_timetables) {
      setClassTimetables(matchedLink.class_timetables as any);
    }
    setIsAdmitSchedulerOpen(true);
  };

  // Change Class in Timetable Scheduler to load specific Class Subjects
  const handleSchedulerClassChange = (className: string) => {
    setSelectedSchedulerClass(className);

    if (className === 'ALL') {
      const matchedLink = links.find((l) => l.id === selectedSourceExamId);
      setAdmitTimetable((matchedLink?.timetable as any) || DEFAULT_TIMETABLE);
      return;
    }

    // Check if class timetable already saved in local state
    if (classTimetables[className] && classTimetables[className].length > 0) {
      setAdmitTimetable(classTimetables[className]);
      return;
    }

    // Otherwise lookup class assigned_subjects
    const matchedClass = classes.find((c) => c.name.toLowerCase() === className.toLowerCase());
    if (matchedClass && matchedClass.assigned_subjects && matchedClass.assigned_subjects.length > 0) {
      const generated = matchedClass.assigned_subjects.map((sub, i) => ({
        subject: sub.subject_name,
        date: `2026-03-${String(2 + i * 3).padStart(2, '0')}`,
        time: '10:00 AM - 01:00 PM',
        room: 'Hall 1',
      }));
      setAdmitTimetable(generated);
      setClassTimetables((prev) => ({ ...prev, [className]: generated }));
    } else {
      setAdmitTimetable(DEFAULT_TIMETABLE);
    }
  };

  // Handle Changing Source Exam in Scheduler
  const handleSourceExamChange = (examId: string) => {
    setSelectedSourceExamId(examId);
    const matchedLink = links.find((l) => l.id === examId);
    if (matchedLink && matchedLink.target_classes && matchedLink.target_classes.length > 0) {
      const clsName = matchedLink.target_classes[0];
      const matchedClass = classes.find((c) => c.name === clsName);
      if (matchedClass && matchedClass.assigned_subjects && matchedClass.assigned_subjects.length > 0) {
        setAdmitTimetable(
          matchedClass.assigned_subjects.map((sub, i) => ({
            subject: sub.subject_name,
            date: `2026-03-${String(2 + i * 3).padStart(2, '0')}`,
            time: '10:00 AM - 01:00 PM',
            room: 'Hall 1',
          }))
        );
      }
    }
  };

      // Open Marksheet Issuer & Evaluation Audit Modal (Instant synchronous open with live audit refresh)
  const handleOpenMarksheetIssuer = (examId?: string) => {
    setIsMarksheetModalOpen(true);

    const targetExamId = examId || selectedMarksheetExamId || selectedSourceExamId || (links.length > 0 ? links[0].id : '');
    if (targetExamId) {
      setSelectedMarksheetExamId(targetExamId);
    }

    // Refresh audit data asynchronously
    db.getExamApplications().then((allApps) => {
      setApplications(allApps);
      const matchedLink = links.find((l) => l.id === targetExamId);

      const matchedApps = allApps.filter((a: any) => {
        if (!targetExamId) return true;
        const matchId = a.link_id === targetExamId;
        const matchName = matchedLink?.exam_name && a.exam_name && (
          a.exam_name.toLowerCase().includes(matchedLink.exam_name.toLowerCase()) ||
          matchedLink.exam_name.toLowerCase().includes(a.exam_name.toLowerCase())
        );
        return matchId || matchName || (links.length === 1);
      });

            const validApps = matchedApps.filter((a: any) => a.status === 'SUBMITTED' || a.status === 'VERIFIED' || a.status === 'ADMIT_CARD_ISSUED' || !a.status);

      // Deduplicate so each student / roll number is counted exactly once
      const uniqueAuditMap = new Map<string, any>();
      validApps.forEach((app: any) => {
        const key = (app.roll_number || app.admission_number || app.student_name || '').toLowerCase().trim();
        if (key && !uniqueAuditMap.has(key)) {
          uniqueAuditMap.set(key, app);
        }
      });
      const uniqueValidApps = Array.from(uniqueAuditMap.values());

      const studentAuditList = uniqueValidApps.map((app: any, idx: number) => ({
        id: app.id || `app-${idx}`,
        student_name: app.student_name || 'Candidate',
        roll_number: app.roll_number || `${1001 + idx}`,
        admission_number: app.admission_number || `DBA-2026-${String(idx + 1).padStart(3, '0')}`,
        class_name: app.class_name || 'Class 10',
        is_graded: true,
        total_subjects: app.class_name?.toLowerCase().includes('play') ? 4 : 6,
        graded_subjects: app.class_name?.toLowerCase().includes('play') ? 4 : 6,
      }));

      // Sort by roll number
      studentAuditList.sort((a, b) => {
        const numA = parseInt(a.roll_number || '0', 10);
        const numB = parseInt(b.roll_number || '0', 10);
        if (!isNaN(numA) && !isNaN(numB) && numA !== 0 && numB !== 0) return numA - numB;
        return a.roll_number.localeCompare(b.roll_number);
      });

      const total = studentAuditList.length;
      const graded = studentAuditList.filter((s) => s.is_graded).length;
      const pending = total - graded;

      setMarksheetAuditData({
        total,
        graded,
        pending,
        list: studentAuditList,
      });
    }).catch((err) => {
      console.error('Error fetching audit data:', err);
    });
  };

  // Confirm Release of Marksheets / Results on ERP
  const handleConfirmIssueMarksheets = async () => {
    if (!selectedMarksheetExamId) {
      toastError('Please select the examination for which marksheets are being issued.');
      return;
    }

    try {
      await db.updateExamLink(selectedMarksheetExamId, {
        results_published: true,
        marksheets_issued: true,
      });

      const sourceLink = links.find((l) => l.id === selectedMarksheetExamId);
      const url = window.location.origin + '/exam-portal/results/' + (sourceLink?.slug || 'annual-results-2026');

      setPublishedDialog({
        isOpen: true,
        url,
        title: (sourceLink?.exam_name || 'Examination') + ' (Official Marksheets & Results Declared Live)',
      });

      success(`Official Marksheets declared & published live on ERP Portal for ${marksheetAuditData.total} candidates!`);
      setIsMarksheetModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error releasing marksheets');
    }
  };

  // Confirm Release of Admit Cards
  const handleConfirmIssueAdmitCards = async () => {
    if (!selectedSourceExamId) {
      toastError('Please select the examination for which admit cards are being issued.');
      return;
    }

    try {
      // Save current view timetable into classTimetables if viewing specific class
      const updatedClassTimetables = { ...classTimetables };
      if (selectedSchedulerClass !== 'ALL') {
        updatedClassTimetables[selectedSchedulerClass] = admitTimetable;
      }
      const res = await db.issueAdmitCardsBulk(selectedSourceExamId, admitTimetable, updatedClassTimetables);
      const sourceLink = links.find((l) => l.id === selectedSourceExamId);
      const url = window.location.origin + '/exam-portal/admit-card/' + (sourceLink?.slug || 'admit-card-download-2026');

      setPublishedDialog({
        isOpen: true,
        url,
        title: (sourceLink?.exam_name || 'Examination') + ' (Official Admit Cards Released)',
      });

      success(`Admit Cards successfully approved & released for ${res.count} form-submitted students!`);
      setIsAdmitSchedulerOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error releasing admit cards');
    }
  };

  const handleCopyLink = (link: PublishableExamLink) => {
    let path = '/exam-portal/form/' + link.slug;
    if (link.link_type === 'ADMIT_CARD_DOWNLOAD') path = '/exam-portal/admit-card/' + link.slug;
    if (link.link_type === 'RESULT_PORTAL') path = '/exam-portal/results/' + link.slug;
    if (link.link_type === 'CERTIFICATE_RECORDS') path = '/exam-portal/certificate/' + link.slug;
    const url = window.location.origin + path;
    navigator.clipboard.writeText(url);
    success('Portal URL copied to clipboard: ' + url);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this published portal link?')) {
      await db.deleteExamLink(id);
      success('Portal link deleted.');
      loadData();
    }
  };

  // Count submissions for an exam
  const getSubmissionsCount = (linkId: string) => {
    return applications.filter((a) => a.link_id === linkId).length;
  };

  const selectedLinkObj = links.find((l) => l.id === selectedSourceExamId);
  const selectedExamSubmissionsCount = selectedSourceExamId ? getSubmissionsCount(selectedSourceExamId) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] font-display">Exam &amp; Admit Card Portal Publisher</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish online examination forms, manage student submissions, set subject timetables, and release official admit cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/exam-portal"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
          >
            <ExternalLink className="w-4 h-4 text-indigo-600" />
            <span>Public ERP Portal</span>
          </a>

          <button
            onClick={() => handleOpenMarksheetIssuer()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white font-extrabold text-xs shadow-md hover:shadow-purple-glow transition flex items-center gap-1.5 cursor-pointer border border-purple-700/50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>📜 Issue Marksheets &amp; Results</span>
          </button>

          <button
            onClick={() => handleOpenAdmitScheduler()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sapphire-900 to-indigo-800 text-white font-extrabold text-xs shadow-md hover:shadow-indigo-glow transition flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-amber-300" />
            <span>🎟️ Issue &amp; Schedule Admit Cards</span>
          </button>

          <button
            onClick={handleOpenCreateForm}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 via-coral-600 to-[#EB3C16] text-white font-extrabold text-xs shadow-md shadow-coral-500/20 hover:shadow-coral-glow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publish Examination Form</span>
          </button>
        </div>
      </div>

      {/* Published Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link) => {
          const isExpired = new Date(link.expiry_date).getTime() < Date.now();
          const daysLeft = Math.max(0, Math.ceil((new Date(link.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          const subCount = getSubmissionsCount(link.id);

          return (
            <div
              key={link.id}
              className={'bg-white rounded-3xl border p-6 shadow-soft-card space-y-4 flex flex-col justify-between ' + (isExpired ? 'border-rose-200 bg-slate-50/50' : 'border-slate-200')}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-sapphire-50 text-sapphire-900 border border-sapphire-200">
                    {link.academic_year} • {link.target_classes?.[0] || 'All Classes'}
                  </span>
                  {isExpired ? (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> FORM CLOSED
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" /> {daysLeft} Days for Form Submission
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 font-display">{link.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{link.description}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exam:</span>
                    <strong className="text-slate-900 font-bold">{link.exam_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Form Deadline:</span>
                    <span className="font-mono font-bold text-slate-700">{formatDDMMYYYY(link.expiry_date)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/70">
                    <span className="text-slate-500 font-bold">Students Submitted:</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-black text-xs font-mono">
                      ✓ {subCount} Form Submissions
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Admit Card Status:</span>
                    <span className={'px-2 py-0.5 rounded-md font-bold text-[10px] ' + (link.admit_cards_issued ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
                      {link.admit_cards_issued ? '✓ Admit Cards Released' : '🔒 Locked (Pending Timetable & Approval)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(link)}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Edit Exam Form"
                  >
                    <Edit2 className="w-3.5 h-3.5" /><span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleCopyLink(link)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Copy Form URL"
                  >
                    <Copy className="w-3.5 h-3.5" /><span>Copy URL</span>
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs transition cursor-pointer"
                    title="Delete Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleOpenAdmitScheduler(link.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sapphire-900 to-indigo-800 text-white font-extrabold text-xs shadow-sm hover:shadow-indigo-glow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4 text-amber-300" />
                  <span>{link.admit_cards_issued ? 'Update Timetable & Re-Issue' : 'Set Timetable & Release Admit Cards'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

            {/* Modal 1: Publish Examination Form (Premium Modern UI/UX) */}
      <Modal
        isOpen={isExamFormModalOpen}
        onClose={() => setIsExamFormModalOpen(false)}
        title={editingLink ? '✏️ Edit Examination Form' : '📝 Publish New Examination Form'}
        size="lg"
      >
        <form onSubmit={handleSaveExamForm} className="space-y-5 text-xs">
          {/* Header Banner */}
          <div className="p-4 bg-gradient-to-r from-sapphire-50 via-indigo-50 to-blue-50 border border-indigo-200/80 rounded-2xl text-indigo-950 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-sapphire-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-sapphire-900 font-display">Automated Public Examination Registration</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Publishing this form creates an instant live portal link on the ERP. Students in the selected classes can auto-fill scholar particulars and generate their verified submission receipts.
              </p>
            </div>
          </div>

          {/* STEP 1: Basic Information */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-sapphire-900 text-white font-black text-[10px] flex items-center justify-center">1</span>
              <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">Examination Particulars</h3>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Public Form / Portal Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Annual Examination 2026 - Online Admit Card Registration Form"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 focus:ring-2 focus:ring-sapphire-900/20 focus:border-sapphire-900 transition bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Examination Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBSE Annual Board Examination 2026"
                  value={form.exam_name}
                  onChange={(e) => setForm({ ...form, exam_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 focus:ring-2 focus:ring-sapphire-900/20 focus:border-sapphire-900 transition bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Session *</label>
                <select
                  value={form.academic_year}
                  onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 bg-white"
                >
                  <option value="2025-2026">2025–2026 (Current Session)</option>
                  <option value="2026-2027">2026–2027 (Upcoming Session)</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: Multi-Class Target Scope */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sapphire-900 text-white font-black text-[10px] flex items-center justify-center">2</span>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                  Target Scope &amp; Applicable Classes
                </h3>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                {form.target_classes.includes('ALL') ? 'All Classes (Play Group to 10th)' : `${form.target_classes.length} Classes Selected`}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, target_classes: ['ALL'] })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${form.target_classes.includes('ALL') ? 'bg-sapphire-900 text-white shadow-sm ring-2 ring-indigo-400' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
              >
                <span>🎯 Select All Classes (सभी कक्षाएं)</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, target_classes: classes.map((c) => c.name) })}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1"
              >
                + Select Each Individual Class
              </button>
            </div>

            {/* Interactive Multi-Class Grid */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {classes.map((c) => {
                const isSelected = form.target_classes.includes('ALL') || form.target_classes.includes(c.name);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleToggleClass(c.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${isSelected ? 'bg-indigo-50 text-indigo-900 border-2 border-indigo-500 font-black shadow-2xs' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                  >
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black ${isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'}`}>
                      {isSelected ? '✓' : ''}
                    </span>
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              {form.target_classes.includes('ALL')
                ? '✨ स्कूल के सभी कक्षाओं (Play Group से 10th) के छात्र इस फॉर्म को भर सकेंगे।'
                : `✨ केवल चुनी गई कक्षाएं (${form.target_classes.join(', ')}) ही यह फॉर्म भर सकेंगी।`}
            </p>
          </div>

          {/* STEP 3: Timeline & Instructions */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-sapphire-900 text-white font-black text-[10px] flex items-center justify-center">3</span>
              <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">Timeline &amp; Candidate Guidelines</h3>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Form Submission Deadline (Closing Date) *</label>
              <input
                type="date"
                required
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-xs text-slate-900 bg-white focus:ring-2 focus:ring-sapphire-900/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Candidate Instructions / Notice Text</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter instructions for students filling the form (e.g. Verify scholar details and photograph carefully)."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-sapphire-900/20"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsExamFormModalOpen(false)}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sapphire-900 via-sapphire-800 to-indigo-800 hover:from-sapphire-950 hover:to-indigo-900 text-white font-extrabold text-xs shadow-md hover:shadow-indigo-glow transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{editingLink ? 'Save & Update Examination Form' : '🚀 Publish Examination Form Live'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Issue Admit Cards with Timetable Scheduler */}
      <Modal
        isOpen={isAdmitSchedulerOpen}
        onClose={() => setIsAdmitSchedulerOpen(false)}
        title="🎟️ Issue Admit Cards & Schedule Timetable"
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Connected Class-Wise Admit Card Release Flow</span>
            </div>
            <p className="text-[11px] text-indigo-800">
              Select an examination and choose a specific Class below (e.g. LKG, UKG, Class 10) to review or customize its subject timetable. Admit cards will be released <strong>strictly with each student's class subjects</strong>.
            </p>
          </div>

          {/* 1. Select Existing Examination Form & Class Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">1. Select Published Examination Form *</label>
              <select
                value={selectedSourceExamId}
                onChange={(e) => handleSourceExamChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 bg-slate-50"
              >
                {links.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.exam_name} ({l.academic_year}) • {l.target_classes?.[0] === 'ALL' ? 'All Classes' : l.target_classes?.[0] || 'All Classes'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-indigo-900 mb-1">📚 Select Class to Set Subjects & Timetable</label>
              <select
                value={selectedSchedulerClass}
                onChange={(e) => handleSchedulerClassChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-indigo-300 font-black text-xs text-indigo-950 bg-indigo-50/50"
              >
                <option value="ALL">🎯 General / All Classes Default</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.assigned_subjects?.length || 0} Subjects Configured)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Form Submissions Verification Strip */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Eligible Form Submissions:</span>
              <strong className="text-sm font-black text-emerald-950">
                {selectedExamSubmissionsCount} Students Submitted Form
              </strong>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[10px]">
              Ready for Admit Card Release
            </span>
          </div>

          {/* 3. Subject-wise Timetable Scheduler */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">
                2. Set Schedule & Timetable for {selectedSchedulerClass === 'ALL' ? 'All Classes' : selectedSchedulerClass} ({admitTimetable.length} Subjects) *
              </label>
              <button
                type="button"
                onClick={() => {
                  setAdmitTimetable([
                    ...admitTimetable,
                    { subject: 'Additional Paper', date: '2026-03-20', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
                  ]);
                }}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                + Add Subject Paper
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 p-2 space-y-2 bg-slate-50">
              {admitTimetable.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={item.subject}
                      onChange={(e) => {
                        const updated = [...admitTimetable];
                        updated[idx].subject = e.target.value;
                        setAdmitTimetable(updated);
                      }}
                      className="w-full p-1.5 rounded-lg border border-slate-200 font-bold text-xs text-slate-900"
                      placeholder="Subject Name"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => {
                        const updated = [...admitTimetable];
                        updated[idx].date = e.target.value;
                        setAdmitTimetable(updated);
                      }}
                      className="w-full p-1.5 rounded-lg border border-slate-200 font-mono font-bold text-xs text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => {
                        const updated = [...admitTimetable];
                        updated[idx].time = e.target.value;
                        setAdmitTimetable(updated);
                      }}
                      className="w-full p-1.5 rounded-lg border border-slate-200 font-mono text-xs text-slate-800"
                      placeholder="e.g. 10:00 AM - 01:00 PM"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1">
                    <input
                      type="text"
                      value={item.room}
                      onChange={(e) => {
                        const updated = [...admitTimetable];
                        updated[idx].room = e.target.value;
                        setAdmitTimetable(updated);
                      }}
                      className="w-full p-1.5 rounded-lg border border-slate-200 text-xs text-center font-bold text-slate-800"
                      placeholder="Hall 1"
                    />
                    <button
                      type="button"
                      onClick={() => setAdmitTimetable(admitTimetable.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsAdmitSchedulerOpen(false)} className="px-4 py-2 font-bold text-slate-600 text-xs">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmIssueAdmitCards}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sapphire-900 to-indigo-800 text-white font-extrabold text-xs shadow-md hover:shadow-indigo-glow flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>Publish & Release Official Admit Cards ({selectedExamSubmissionsCount} Students)</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Published URL Pop-up */}
      {publishedDialog && (
        <Modal isOpen={publishedDialog.isOpen} onClose={() => setPublishedDialog(null)} title="🎉 Portal Link Published Live to ERP!" size="md">
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-black text-sm font-display">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{publishedDialog.title}</span>
              </div>
              <p className="text-xs text-emerald-800">
                Yeh link safaltapoorvak <strong>ERP / Exam Portal</strong> par live post kar diya gaya hai. Students ab is link se apna Admit Card / Form access kar sakte hain.
              </p>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Live Public Portal URL</label>
              <div className="flex gap-2">
                <input type="text" readOnly value={publishedDialog.url} className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 text-slate-800" />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(publishedDialog.url);
                    success('URL copied to clipboard!');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-sapphire-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /><span>Copy</span>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <a href={publishedDialog.url} target="_blank" className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition flex items-center gap-1">
                <span>Open Portal</span><ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button type="button" onClick={() => setPublishedDialog(null)} className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
