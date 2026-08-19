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
} from 'lucide-react';
import { Card, StatCard, Badge, Button, Modal, Input, Select } from '../../components/common/UI';

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
    const activeStu = stus[0] || null; // default active student
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
        db.getResults(currentSchool.id, 'exam-midterm-2025'),
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileForm((prev) => ({ ...prev, photo_url: reader.result as string }));
        success('Photo uploaded from device!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    try {
      const normalizedPayload = {
        ...profileForm,
        photo_url: normalizeImageUrl(profileForm.photo_url) || student.photo_url,
      };

      const updated = await db.updateStudent(student.id, normalizedPayload);
      if (updated) {
        setStudent(updated);
        success('Your profile details and photo have been updated!');
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      toastError(err.message || 'Error updating profile');
    }
  };

  const latestResult = results[0] || null;

  return (
    <div className="space-y-6">
      {/* Student ID Card Strip */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <SafeImage
            src={student?.photo_url}
            alt="Student"
            fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            className="w-16 h-16 rounded-xl object-cover border-2 border-purple-400 p-0.5 bg-white/10 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple" size="sm">Enrolled Scholar</Badge>
              <span className="text-xs text-purple-200">Roll No: {student?.roll_number || '1001'}</span>
            </div>
            <h1 className="text-2xl font-extrabold">{student?.first_name} {student?.last_name}</h1>
            <p className="text-xs text-purple-200 mt-0.5">
              Class: {student?.class_name || 'Class 10'} (Section {student?.section_name || 'A'}) &bull; Adm: {student?.admission_number}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success" size="md">Attendance: 96.8%</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="text-xs text-white border-purple-400/50 hover:bg-white/10"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit My Profile
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Overall Grade" value={latestResult?.grade || 'A+'} icon={Award} color="purple" change={`${latestResult?.percentage || '92.2'}% Aggregate`} />
        <StatCard title="Class Standing" value={`Rank #${latestResult?.rank_in_class || '1'}`} icon={GraduationCap} color="amber" />
        <StatCard title="Attendance" value="96.8%" icon={CalendarCheck} color="emerald" change="2 absences" />
        <StatCard title="Fee Status" value="Cleared" icon={CreditCard} color="indigo" change="Receipts active" />
      </div>

      {/* Results & Marksheets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Published Report Cards & Marksheets">
          <div className="space-y-3">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{doc.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{doc.verification_code}</span>
                    </div>
                  </div>

                  <a
                    href={`/verify/${doc.verification_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No official documents issued yet for this academic session.
              </div>
            )}
          </div>
        </Card>

        {/* Homework Feed */}
        <Card title="Active Assignments & Homework">
          <div className="space-y-3">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{hw.title}</span>
                  <Badge variant="warning" size="sm">Due: {hw.due_date}</Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{hw.description}</p>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">{hw.subject_name}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Scholar Profile & Photo"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <SafeImage
              src={profileForm.photo_url}
              alt="Profile"
              fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500 p-0.5 bg-white shrink-0"
            />
            <div className="flex-1 space-y-1">
              <Input
                label="Photo URL or Google Drive Link"
                placeholder="Paste Google Drive link or image URL"
                value={profileForm.photo_url}
                onChange={(e) => setProfileForm({ ...profileForm, photo_url: e.target.value })}
                helperText={isGoogleDriveUrl(profileForm.photo_url) ? '✓ Google Drive link auto-converted' : undefined}
              />
              <label className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer border border-slate-300 dark:border-slate-700">
                <Camera className="w-3 h-3" /> Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Parent Contact Phone *"
              value={profileForm.parent_phone}
              onChange={(e) => setProfileForm({ ...profileForm, parent_phone: e.target.value })}
              required
            />
            <Input
              label="Parent Email Address"
              type="email"
              value={profileForm.parent_email}
              onChange={(e) => setProfileForm({ ...profileForm, parent_email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Blood Group"
              value={profileForm.blood_group}
              onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })}
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </Select>

            <Input
              label="Residential Address"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              <Save className="w-4 h-4 mr-1.5" /> Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
