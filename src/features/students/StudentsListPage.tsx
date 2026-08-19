import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Student, ClassRoom, Section } from '../../types/database';
import { exportToCsv, exportToExcel } from '../../lib/export-utils';
import { normalizeImageUrl, isGoogleDriveUrl, SafeImage } from '../../lib/image-helper';
import { useToast } from '../../components/common/Toast';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  User,
  GraduationCap,
  Sparkles,
  Camera,
} from 'lucide-react';
import { Button, Input, Select, Badge, Card, Modal } from '../../components/common/UI';

export const StudentsListPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Student Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    admission_number: '',
    roll_number: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    date_of_birth: '2010-01-01',
    blood_group: 'O+',
    photo_url: '',
    father_name: '',
    mother_name: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    city: 'San Francisco',
    state: 'CA',
    current_class_id: '',
    current_section_id: '',
  });

  const loadData = async () => {
    if (!currentSchool) return;
    setIsLoading(true);
    try {
      const [stuList, clsList, secList] = await Promise.all([
        db.getStudents(currentSchool.id, selectedClassId || undefined, selectedSectionId || undefined, searchQuery || undefined),
        db.getClasses(currentSchool.id),
        db.getSections(currentSchool.id),
      ]);
      setStudents(stuList);
      setClasses(clsList);
      setSections(secList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool, selectedClassId, selectedSectionId, searchQuery]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      admission_number: 'ADM-' + Math.floor(10000 + Math.random() * 90000),
      roll_number: '10' + Math.floor(10 + Math.random() * 90),
      gender: 'Male',
      date_of_birth: '2010-01-01',
      blood_group: 'O+',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      father_name: '',
      mother_name: '',
      parent_phone: '',
      parent_email: '',
      address: '',
      city: 'San Francisco',
      state: 'CA',
      current_class_id: classes[0]?.id || '',
      current_section_id: sections[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name || '',
      middle_name: student.middle_name || '',
      last_name: student.last_name || '',
      admission_number: student.admission_number || '',
      roll_number: student.roll_number || '',
      gender: student.gender || 'Male',
      date_of_birth: student.date_of_birth || '2010-01-01',
      blood_group: student.blood_group || 'O+',
      photo_url: student.photo_url || '',
      father_name: student.father_name || '',
      mother_name: student.mother_name || '',
      parent_phone: student.parent_phone || '',
      parent_email: student.parent_email || '',
      address: student.address || '',
      city: student.city || 'San Francisco',
      state: student.state || 'CA',
      current_class_id: student.current_class_id || classes[0]?.id || '',
      current_section_id: student.current_section_id || sections[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, photo_url: reader.result as string }));
        success('Student photo uploaded from device!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    try {
      const normalizedPayload = {
        ...formData,
        photo_url: normalizeImageUrl(formData.photo_url) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };

      if (editingStudent) {
        await db.updateStudent(editingStudent.id, normalizedPayload);
        success(`Student "${formData.first_name} ${formData.last_name}" updated successfully!`);
      } else {
        await db.createStudent({ ...normalizedPayload, school_id: currentSchool.id });
        success(`Student "${formData.first_name} ${formData.last_name}" enrolled successfully!`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error saving student');
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"?`)) return;
    try {
      await db.deleteStudent(studentId);
      success(`Student "${name}" removed`);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error deleting student');
    }
  };

  const handleExportCsv = () => {
    const exportData = students.map((s) => ({
      Admission_No: s.admission_number,
      Roll_No: s.roll_number,
      Name: `${s.first_name} ${s.last_name}`,
      Gender: s.gender,
      DOB: s.date_of_birth,
      Class: s.class_name,
      Section: s.section_name,
      Father_Name: s.father_name,
      Mother_Name: s.mother_name,
      Parent_Phone: s.parent_phone,
      Parent_Email: s.parent_email,
    }));
    exportToCsv(exportData, `${currentSchool?.slug || 'school'}-students.csv`);
    success('Exported to CSV');
  };

  const handleExportExcel = () => {
    const exportData = students.map((s) => ({
      Admission_No: s.admission_number,
      Roll_No: s.roll_number,
      Name: `${s.first_name} ${s.last_name}`,
      Gender: s.gender,
      DOB: s.date_of_birth,
      Class: s.class_name,
      Section: s.section_name,
      Father_Name: s.father_name,
      Mother_Name: s.mother_name,
      Parent_Phone: s.parent_phone,
      Parent_Email: s.parent_email,
    }));
    exportToExcel(exportData, `${currentSchool?.slug || 'school'}-students.xlsx`, 'Students');
    success('Exported to Excel');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Student Directory & Profiles
            <Badge variant="primary" size="sm">{students.length} Enrolled</Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage student registrations, Google Drive photos, class allocations, and complete parent records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/students/bulk-import">
            <Button variant="outline" size="sm">
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Bulk CSV/Excel Import
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Excel
          </Button>

          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="font-bold">
            <Plus className="w-4 h-4 mr-1.5" /> Enroll Student
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, roll no, adm no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
          >
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>Section {s.name}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-4 mb-3">
                <SafeImage
                  src={student.photo_url}
                  alt={student.first_name}
                  fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-500/40 shrink-0 bg-slate-100 dark:bg-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <Badge variant="purple" size="sm">Roll: {student.roll_number || 'N/A'}</Badge>
                    <span className="text-[10px] font-mono text-slate-400">{student.admission_number}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate mt-1">
                    {student.first_name} {student.middle_name ? `${student.middle_name} ` : ''}{student.last_name}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    {student.class_name || 'Class 10'} &bull; Sec {student.section_name || 'A'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Gender & Blood:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{student.gender} ({student.blood_group || 'O+'})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Father's Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{student.father_name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Parent Phone:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{student.parent_phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(student)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Profile
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteStudent(student.id, `${student.first_name} ${student.last_name}`)}
                className="p-1.5"
                title="Delete Student"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Edit Profile: ${editingStudent.first_name} ${editingStudent.last_name}` : 'Enroll New Scholar'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          {/* Photo & Basic Details */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <SafeImage
              src={formData.photo_url}
              alt="Photo"
              fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500 p-0.5 bg-white shrink-0"
            />
            <div className="flex-1 space-y-1 w-full">
              <Input
                label="Student Photo (Google Drive Link or URL)"
                placeholder="Paste image URL or Google Drive link"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                helperText={isGoogleDriveUrl(formData.photo_url) ? '✓ Google Drive link auto-converted to direct image' : undefined}
              />
              <label className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer border border-slate-300 dark:border-slate-700">
                <Camera className="w-3 h-3" /> Upload from Computer
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="First Name *"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Middle Name"
              value={formData.middle_name}
              onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
            />
            <Input
              label="Last Name *"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Admission No *"
              value={formData.admission_number}
              onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
              required
            />
            <Input
              label="Roll Number *"
              value={formData.roll_number}
              onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
              required
            />
            <Select
              label="Class Cohort *"
              value={formData.current_class_id}
              onChange={(e) => setFormData({ ...formData, current_class_id: e.target.value })}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <Select
              label="Section *"
              value={formData.current_section_id}
              onChange={(e) => setFormData({ ...formData, current_section_id: e.target.value })}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
            <Input
              label="Date of Birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
            <Select
              label="Blood Group"
              value={formData.blood_group}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Father's Full Name"
              value={formData.father_name}
              onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
            />
            <Input
              label="Mother's Full Name"
              value={formData.mother_name}
              onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Parent / Guardian Phone *"
              value={formData.parent_phone}
              onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
              required
            />
            <Input
              label="Parent Email Address"
              type="email"
              value={formData.parent_email}
              onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
            />
          </div>

          <Input
            label="Residential Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              {editingStudent ? 'Save Profile Updates' : 'Enroll Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
