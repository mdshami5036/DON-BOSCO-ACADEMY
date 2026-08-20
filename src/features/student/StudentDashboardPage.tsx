import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Student, ExamResult, GeneratedDocument, Homework, FeePayment } from '../../types/database';
import { normalizeImageUrl, isGoogleDriveUrl, SafeImage } from '../../lib/image-helper';
import { useToast } from '../../components/common/Toast';
import {
  Award,
  CalendarCheck,
  CreditCard,
  BookOpen,
  QrCode,
  Download,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  UserCheck,
  Edit2,
  Camera,
  Save,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  FileBadge,
  TrendingUp,
  Clock,
  Shield,
  Printer,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Modal } from '../../components/common/UI';

export const StudentDashboardPage: React.FC = () => {
  const { currentSchool, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    photo_url: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    blood_group: 'O+',
  });

  const loadData = async () => {
    if (!currentSchool) return;
    const stus = await db.getStudents(currentSchool.id);
    const activeStu = stus[0] || null;
    setStudent(activeStu);

    if (activeStu) {
      setProfileForm({
        first_name: activeStu.first_name,
        last_name: activeStu.last_name,
        photo_url: activeStu.photo_url || '',
        parent_phone: activeStu.parent_phone || '',
        parent_email: activeStu.parent_email || '',
        address: activeStu.address || '',
        blood_group: activeStu.blood_group || 'O+',
      });

      const [rList, dList, hList, pList] = await Promise.all([
        db.getResults(currentSchool.id, 'exam-annual-2026'),
        db.getGeneratedDocuments(currentSchool.id, activeStu.id),
        db.getHomework(currentSchool.id),
        db.getFeePayments(currentSchool.id, activeStu.id),
      ]);
      setResults(rList.filter((r) => r.student_id === activeStu.id));
      setDocuments(dList);
      setHomeworkList(hList);
      setPayments(pList);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  const chartData = [
    { subject: 'English', studentScore: 94, classAverage: 78 },
    { subject: 'Mathematics', studentScore: 98, classAverage: 72 },
    { subject: 'Science', studentScore: 92, classAverage: 75 },
    { subject: 'Social Science', studentScore: 90, classAverage: 74 },
    { subject: 'Hindi', studentScore: 95, classAverage: 80 },
    { subject: 'Computer / AI', studentScore: 97, classAverage: 82 },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. VISUAL STUDENT HERO BANNER */}
      <div className="bg-gradient-to-r from-sapphire-950 via-[#0F2756] to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-soft-hover border border-sapphire-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5">
          <div className="relative">
            <SafeImage
              src={student?.photo_url}
              alt="Student"
              fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 p-0.5 bg-white shrink-0 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border border-white">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                ★ Rank #1 in Class 10th
              </span>
              <span className="text-xs text-slate-300">• Roll No: {student?.roll_number || '1001'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              {student?.first_name || 'Aman'} {student?.last_name || 'Singh'}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Class: <strong>{student?.class_name || 'Class 10'}</strong> (Section {student?.section_name || 'A'}) • Adm: {student?.admission_number || 'DBA-2026-001'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 2. STATS & ATTENDANCE RING OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Attendance Widget */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Overall Attendance</span>
            <div className="text-3xl font-black text-slate-900 font-display mt-1">96.4%</div>
            <p className="text-xs text-emerald-600 font-bold mt-0.5">188 Present / 195 Days</p>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-slate-200 flex items-center justify-center font-black text-xs text-slate-900">
            96%
          </div>
        </div>

        {/* Academic GPA / Percentage */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Academic Score</span>
            <div className="text-3xl font-black text-coral-600 font-display mt-1">93.67%</div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Grade A1 with Distinction</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-coral-50 border border-coral-200 flex items-center justify-center text-coral-600 font-black">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Fee Status */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Fee Clearance</span>
            <div className="text-2xl font-black text-emerald-600 font-display mt-1">Cleared (₹0 Due)</div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Receipt #DBA-FEE-891</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. VISUAL GRADEBOOK COMPARISON CHART */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-[#0B192C] font-display">Academic Gradebook &amp; Subject Analytics</h3>
            <p className="text-xs text-slate-500">Comparing your marks with the Class 10th benchmark average.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-sapphire-50 text-sapphire-900 text-xs font-bold border border-sapphire-200">
            Annual Examination 2025-2026
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F2756', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="studentScore" name="Your Marks" fill="#0F2756" radius={[6, 6, 0, 0]} />
              <Bar dataKey="classAverage" name="Class Average" fill="#94A3B8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. DIGITAL VERIFIED DOCUMENTS GRID */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-[#0B192C] font-display">Issued Documents &amp; Digital Credentials</h3>
            <p className="text-xs text-slate-500">Official CBSE marksheets, excellence certificates, and hall tickets.</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> 100% Cryptographic QR
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-2">
                <FileBadge className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Certificate of Academic Excellence</h4>
              <p className="text-[11px] text-slate-500 mt-1">Issued for Rank 1 in Class 10 (Session 2025-2026)</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">DBA/CLASS10/2026/101</span>
              <a
                href="/school/documents/certificates"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                View &amp; Print →
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-2">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">CBSE Annual Marksheet</h4>
              <p className="text-[11px] text-slate-500 mt-1">Official report card with theory, practical &amp; GPA</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">93.67% (Grade A1)</span>
              <a
                href="/school/documents/marksheets"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Download PDF →
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Student Identity Card</h4>
              <p className="text-[11px] text-slate-500 mt-1">Digital badge with barcode for library &amp; gates</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-600">Valid 2026-2027</span>
              <a
                href="/school/documents/id-cards"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Print ID Card →
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Profile Details"
        size="md"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!student) return;
            try {
              const updated = await db.updateStudent(student.id, profileForm);
              if (updated) {
                setStudent(updated);
                success('Profile updated successfully!');
                setIsEditModalOpen(false);
              }
            } catch (err: any) {
              toastError(err.message || 'Error updating profile');
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone Number</label>
            <input
              type="text"
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              value={profileForm.parent_phone}
              onChange={(e) => setProfileForm({ ...profileForm, parent_phone: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sapphire-900 text-white font-bold text-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
