import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { ClassRoom, Section, Teacher, Subject } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import {
  Layers,
  Plus,
  Users,
  DoorOpen,
  UserCheck,
  Trash2,
  Edit2,
  Sparkles,
  School,
  Save,
  BookOpen,
  Check,
  X,
  BookMarked,
  Settings,
} from 'lucide-react';
import { Button, Input, Select, Modal, Badge, Card } from '../../components/common/UI';

const SUBJECT_PRESETS = {
  PRE_PRIMARY: [
    { subject_name: 'English (Rhymes & Oral)', full_marks: 50, pass_marks: 17, has_practical: true },
    { subject_name: 'Hindi (Kavita & Akshar)', full_marks: 50, pass_marks: 17, has_practical: false },
    { subject_name: 'Mathematics (Numbers & Counting)', full_marks: 50, pass_marks: 17, has_practical: false },
    { subject_name: 'Drawing, Art & Coloring', full_marks: 50, pass_marks: 17, has_practical: true },
    { subject_name: 'General Awareness & Conversation', full_marks: 50, pass_marks: 17, has_practical: false },
  ],
  PRIMARY: [
    { subject_name: 'English (Textbook & Grammar)', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'Hindi (Bhasha & Vyakaran)', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'Mathematics', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'Environmental Studies (EVS)', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'General Knowledge', full_marks: 50, pass_marks: 17, has_practical: false },
    { subject_name: 'Art, Craft & Drawing', full_marks: 50, pass_marks: 17, has_practical: true },
    { subject_name: 'Computer Basics', full_marks: 50, pass_marks: 17, has_practical: true },
  ],
  MIDDLE: [
    { subject_name: 'English Language & Literature', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'Hindi Vyakaran & Sahitya', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'Mathematics', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'General Science', full_marks: 100, pass_marks: 33, has_practical: true },
    { subject_name: 'Social Science (History, Civics, Geo)', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'Sanskrit / Third Language', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'Computer Science', full_marks: 100, pass_marks: 33, has_practical: true },
    { subject_name: 'General Knowledge & Moral Science', full_marks: 50, pass_marks: 17, has_practical: false },
  ],
  SECONDARY: [
    { subject_name: 'English Language & Literature (184)', full_marks: 100, pass_marks: 33, has_practical: true },
    { subject_name: 'Mathematics (Standard / Basic) (041)', full_marks: 100, pass_marks: 33, has_practical: true },
    { subject_name: 'Science (Physics, Chem, Bio) (086)', full_marks: 100, pass_marks: 33, has_practical: true },
    { subject_name: 'Social Science (087)', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'Hindi Course-A (002)', full_marks: 100, pass_marks: 33, has_practical: false },
    { subject_name: 'Computer Applications & AI (165/417)', full_marks: 100, pass_marks: 33, has_practical: true },
  ],
};

export const ClassesSectionsPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Class Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classForm, setClassForm] = useState({
    name: '',
    numeric_grade: 10,
    class_teacher_id: '',
    assigned_subjects: [] as Array<{
      subject_name: string;
      full_marks: number;
      pass_marks: number;
      has_practical: boolean;
    }>,
  });

  // Manage Subjects Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectManagingClass, setSubjectManagingClass] = useState<ClassRoom | null>(null);
  const [tempSubjectsList, setTempSubjectsList] = useState<Array<{
    subject_name: string;
    full_marks: number;
    pass_marks: number;
    has_practical: boolean;
  }>>([]);
  const [newCustomSubName, setNewCustomSubName] = useState('');

  // Add / Edit Section Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sectionForm, setSectionForm] = useState({
    name: '',
    room_no: '',
    capacity: 40,
  });

  const loadData = async () => {
    if (!currentSchool) return;
    setIsLoading(true);
    try {
      const [cList, sList, tList, subList] = await Promise.all([
        db.getClasses(currentSchool.id),
        db.getSections(currentSchool.id),
        db.getTeachers(currentSchool.id),
        db.getSubjects(currentSchool.id),
      ]);
      setClasses(cList);
      setSections(sList);
      setTeachers(tList);
      setAvailableSubjects(subList);
      if (cList.length > 0 && !selectedClassId) setSelectedClassId(cList[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  // Open Create Class Modal
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassForm({
      name: '',
      numeric_grade: 10,
      class_teacher_id: teachers[0]?.id || '',
      assigned_subjects: [...SUBJECT_PRESETS.SECONDARY],
    });
    setIsClassModalOpen(true);
  };

  // Open Edit Class Modal
  const handleOpenEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      numeric_grade: cls.numeric_grade || 10,
      class_teacher_id: cls.class_teacher_id || '',
      assigned_subjects: cls.assigned_subjects && cls.assigned_subjects.length > 0
        ? [...cls.assigned_subjects]
        : [...SUBJECT_PRESETS.SECONDARY],
    });
    setIsClassModalOpen(true);
  };

  // Apply Preset
  const handleApplyPreset = (presetKey: keyof typeof SUBJECT_PRESETS) => {
    setClassForm((prev) => ({
      ...prev,
      assigned_subjects: [...SUBJECT_PRESETS[presetKey]],
    }));
    success(`Applied ${presetKey.replace('_', ' ')} subject preset!`);
  };

  // Save Class
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    if (!classForm.name.trim()) {
      toastError('Class name is required.');
      return;
    }

    try {
      const teacherObj = teachers.find((t) => t.id === classForm.class_teacher_id);
      const teacherName = teacherObj ? `${teacherObj.first_name} ${teacherObj.last_name}` : undefined;

      if (editingClass) {
        await db.updateClass(editingClass.id, {
          name: classForm.name,
          numeric_grade: Number(classForm.numeric_grade),
          class_teacher_id: classForm.class_teacher_id || null,
          class_teacher_name: teacherName || null,
          assigned_subjects: classForm.assigned_subjects,
        });
        success(`Class ${classForm.name} updated successfully with ${classForm.assigned_subjects.length} subjects!`);
      } else {
        await db.createClass({
          school_id: currentSchool.id,
          name: classForm.name,
          numeric_grade: Number(classForm.numeric_grade),
          class_teacher_id: classForm.class_teacher_id || null,
          class_teacher_name: teacherName || null,
          assigned_subjects: classForm.assigned_subjects,
        });
        success(`Class ${classForm.name} created successfully with ${classForm.assigned_subjects.length} subjects!`);
      }
      setIsClassModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error saving class');
    }
  };

  // Open Quick Manage Subjects Modal
  const handleOpenManageSubjects = (cls: ClassRoom) => {
    setSubjectManagingClass(cls);
    setTempSubjectsList(cls.assigned_subjects && cls.assigned_subjects.length > 0 ? [...cls.assigned_subjects] : [...SUBJECT_PRESETS.SECONDARY]);
    setIsSubjectModalOpen(true);
  };

  const handleSaveClassSubjects = async () => {
    if (!subjectManagingClass) return;
    try {
      await db.updateClassSubjects(subjectManagingClass.id, tempSubjectsList);
      success(`Subjects for ${subjectManagingClass.name} saved successfully (${tempSubjectsList.length} subjects)!`);
      setIsSubjectModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error updating class subjects');
    }
  };

  const handleAddCustomSubject = () => {
    if (!newCustomSubName.trim()) return;
    setTempSubjectsList((prev) => [
      ...prev,
      {
        subject_name: newCustomSubName.trim(),
        full_marks: 100,
        pass_marks: 33,
        has_practical: false,
      },
    ]);
    setNewCustomSubName('');
  };

  const handleRemoveSubject = (index: number) => {
    setTempSubjectsList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] font-display">Classes, Sections &amp; Subjects</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure classes, manage section allocations, and define class-wise subject curriculums for accurate marksheet and exam auto-generation.
          </p>
        </div>

        <button
          onClick={handleOpenAddClass}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 via-coral-600 to-[#EB3C16] text-white font-extrabold text-xs shadow-md shadow-coral-500/20 hover:shadow-coral-glow transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Class</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classSections = sections.filter((s) => s.class_id === cls.id);
          const subCount = cls.assigned_subjects?.length || 0;

          return (
            <div
              key={cls.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft-card space-y-4 hover:shadow-soft-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-sapphire-50 text-sapphire-900 border border-sapphire-200 text-xs font-black">
                    Grade {cls.numeric_grade || cls.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditClass(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Class"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display">{cls.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Class Teacher: <strong>{cls.class_teacher_name || 'Not Assigned'}</strong></span>
                  </p>
                </div>

                {/* Assigned Subjects Badge Strip */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <BookMarked className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Class Subjects ({subCount})</span>
                    </span>
                    <button
                      onClick={() => handleOpenManageSubjects(cls)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                    >
                      Edit Subjects →
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {cls.assigned_subjects && cls.assigned_subjects.length > 0 ? (
                      cls.assigned_subjects.slice(0, 4).map((sub, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-semibold truncate max-w-[140px]">
                          {sub.subject_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No specific subjects configured.</span>
                    )}
                    {subCount > 4 && (
                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px]">
                        +{subCount - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Sections List */}
                <div className="text-xs text-slate-600">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Sections:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {classSections.length > 0 ? (
                      classSections.map((sec) => (
                        <span key={sec.id} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono font-bold text-xs border border-slate-200">
                          Sec {sec.name} ({sec.capacity} seats)
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Section A (Default)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenManageSubjects(cls)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Configure {cls.name} Subjects</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Class Modal with Integrated Subject Assignment */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={editingClass ? `Edit ${editingClass.name} &amp; Subjects` : 'Add New Class &amp; Set Subjects'}
        size="lg"
      >
        <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Name * (e.g. Class 1, Class 5, Class 10)</label>
              <input
                type="text"
                required
                placeholder="e.g. Class 1"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Numeric Grade Level *</label>
              <input
                type="number"
                required
                min={1}
                max={12}
                value={classForm.numeric_grade}
                onChange={(e) => setClassForm({ ...classForm, numeric_grade: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Class Teacher</label>
            <select
              value={classForm.class_teacher_id}
              onChange={(e) => setClassForm({ ...classForm, class_teacher_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50"
            >
              <option value="">-- No Class Teacher Assigned --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.designation})</option>
              ))}
            </select>
          </div>

          {/* Quick Subject Presets */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Set Subjects for this Class *</label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Presets:</span>
                <button type="button" onClick={() => handleApplyPreset('PRIMARY')} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold">Class 1–5</button>
                <button type="button" onClick={() => handleApplyPreset('MIDDLE')} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold">Class 6–8</button>
                <button type="button" onClick={() => handleApplyPreset('SECONDARY')} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold">Class 9–10</button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 p-2 space-y-1.5 bg-slate-50">
              {classForm.assigned_subjects.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs">
                  <span className="w-5 text-center font-mono text-slate-400 font-bold">{idx + 1}</span>
                  <input
                    type="text"
                    value={sub.subject_name}
                    onChange={(e) => {
                      const updated = [...classForm.assigned_subjects];
                      updated[idx].subject_name = e.target.value;
                      setClassForm({ ...classForm, assigned_subjects: updated });
                    }}
                    className="flex-1 p-1 rounded border border-slate-200 font-bold text-slate-800 text-xs"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Full:</span>
                    <input
                      type="number"
                      value={sub.full_marks}
                      onChange={(e) => {
                        const updated = [...classForm.assigned_subjects];
                        updated[idx].full_marks = Number(e.target.value);
                        setClassForm({ ...classForm, assigned_subjects: updated });
                      }}
                      className="w-14 p-1 text-center font-mono font-bold text-xs border border-slate-200 rounded"
                    />
                  </div>
                  <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sub.has_practical}
                      onChange={(e) => {
                        const updated = [...classForm.assigned_subjects];
                        updated[idx].has_practical = e.target.checked;
                        setClassForm({ ...classForm, assigned_subjects: updated });
                      }}
                      className="rounded text-indigo-600"
                    />
                    <span>Practical</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setClassForm({
                        ...classForm,
                        assigned_subjects: classForm.assigned_subjects.filter((_, i) => i !== idx),
                      });
                    }}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setClassForm({
                  ...classForm,
                  assigned_subjects: [
                    ...classForm.assigned_subjects,
                    { subject_name: 'New Subject', full_marks: 100, pass_marks: 33, has_practical: false },
                  ],
                });
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
            >
              <Plus className="w-3.5 h-3.5" /><span>+ Add Another Subject to this Class</span>
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsClassModalOpen(false)} className="px-4 py-2 font-bold text-slate-600 text-xs">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-sm">
              {editingClass ? 'Save Class & Subjects' : 'Create Class with Subjects'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Manage Subjects Modal */}
      {subjectManagingClass && (
        <Modal
          isOpen={isSubjectModalOpen}
          onClose={() => setIsSubjectModalOpen(false)}
          title={`📚 Set Subjects for ${subjectManagingClass.name}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-950 space-y-1">
              <p className="text-xs font-semibold">
                Set all the subjects examined in <strong>{subjectManagingClass.name}</strong>. These exact subjects will automatically populate when issuing marksheets or creating examination schedules for this class.
              </p>
            </div>

            <div className="space-y-2">
              <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 p-2 space-y-1.5 bg-slate-50">
                {tempSubjectsList.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="w-5 text-center font-mono text-slate-400 font-bold">{idx + 1}</span>
                    <input
                      type="text"
                      value={sub.subject_name}
                      onChange={(e) => {
                        const updated = [...tempSubjectsList];
                        updated[idx].subject_name = e.target.value;
                        setTempSubjectsList(updated);
                      }}
                      className="flex-1 p-1.5 rounded-lg border border-slate-200 font-bold text-slate-800 text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold">Max:</span>
                      <input
                        type="number"
                        value={sub.full_marks}
                        onChange={(e) => {
                          const updated = [...tempSubjectsList];
                          updated[idx].full_marks = Number(e.target.value);
                          setTempSubjectsList(updated);
                        }}
                        className="w-14 p-1.5 text-center font-mono font-bold text-xs border border-slate-200 rounded-lg"
                      />
                    </div>
                    <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sub.has_practical}
                        onChange={(e) => {
                          const updated = [...tempSubjectsList];
                          updated[idx].has_practical = e.target.checked;
                          setTempSubjectsList(updated);
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span>Practical</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Subject */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Enter custom subject name (e.g. Sanskrit, EVS, Moral Science)..."
                  value={newCustomSubName}
                  onChange={(e) => setNewCustomSubName(e.target.value)}
                  className="flex-1 p-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  + Add Subject
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="px-4 py-2 font-bold text-slate-600 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveClassSubjects}
                className="px-5 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-sm"
              >
                Save {subjectManagingClass.name} Subjects ({tempSubjectsList.length})
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
