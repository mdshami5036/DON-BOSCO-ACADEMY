import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { ClassRoom, Section, Teacher } from '../../types/database';
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
} from 'lucide-react';
import { Button, Input, Select, Modal, Badge, Card } from '../../components/common/UI';

export const ClassesSectionsPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Class Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classForm, setClassForm] = useState({
    name: '',
    numeric_grade: 10,
    class_teacher_id: '',
  });

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
      const [cList, sList, tList] = await Promise.all([
        db.getClasses(currentSchool.id),
        db.getSections(currentSchool.id),
        db.getTeachers(currentSchool.id),
      ]);
      setClasses(cList);
      setSections(sList);
      setTeachers(tList);
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
    });
    setIsClassModalOpen(true);
  };

  // Save Class (Create or Update)
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    try {
      const teacher = teachers.find((t) => t.id === classForm.class_teacher_id);
      const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : undefined;

      if (editingClass) {
        await db.updateClass(editingClass.id, {
          name: classForm.name,
          numeric_grade: Number(classForm.numeric_grade),
          class_teacher_id: classForm.class_teacher_id || null,
          class_teacher_name: teacherName || null,
        });
        success(`Class "${classForm.name}" updated successfully!`);
      } else {
        await db.createClass({
          school_id: currentSchool.id,
          name: classForm.name,
          numeric_grade: Number(classForm.numeric_grade),
          class_teacher_id: classForm.class_teacher_id || undefined,
          class_teacher_name: teacherName,
        });
        success(`Class "${classForm.name}" created with default Section A`);
      }
      setIsClassModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error saving class');
    }
  };

  // Delete Class
  const handleDeleteClass = async (cls: ClassRoom) => {
    if (!window.confirm(`Are you sure you want to delete "${cls.name}" and all its sections?`)) return;
    try {
      await db.deleteClass(cls.id);
      success(`Class "${cls.name}" removed`);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error deleting class');
    }
  };

  // Open Create Section Modal
  const handleOpenAddSection = (classId?: string) => {
    setEditingSection(null);
    if (classId) setSelectedClassId(classId);
    setSectionForm({
      name: '',
      room_no: '',
      capacity: 40,
    });
    setIsSectionModalOpen(true);
  };

  // Open Edit Section Modal
  const handleOpenEditSection = (sec: Section) => {
    setEditingSection(sec);
    setSelectedClassId(sec.class_id);
    setSectionForm({
      name: sec.name,
      room_no: sec.room_no || '',
      capacity: sec.capacity || 40,
    });
    setIsSectionModalOpen(true);
  };

  // Save Section (Create or Update)
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool || !selectedClassId) return;
    try {
      if (editingSection) {
        await db.updateSection(editingSection.id, {
          class_id: selectedClassId,
          name: sectionForm.name,
          room_no: sectionForm.room_no,
          capacity: Number(sectionForm.capacity),
        });
        success(`Section "${sectionForm.name}" updated successfully!`);
      } else {
        await db.createSection({
          school_id: currentSchool.id,
          class_id: selectedClassId,
          name: sectionForm.name,
          room_no: sectionForm.room_no,
          capacity: Number(sectionForm.capacity),
        });
        success(`Section "${sectionForm.name}" added`);
      }
      setIsSectionModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error saving section');
    }
  };

  // Delete Section
  const handleDeleteSection = async (sec: Section) => {
    if (!window.confirm(`Are you sure you want to delete Section "${sec.name}"?`)) return;
    try {
      await db.deleteSection(sec.id);
      success(`Section "${sec.name}" removed`);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error deleting section');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Classes & Sections Management
            <Badge variant="primary" size="sm">{classes.length} Classes</Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize student grade levels, classroom sections, room capacities, and faculty class teachers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleOpenAddSection()}>
            <Plus className="w-4 h-4 mr-1" /> Add Section
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAddClass} className="font-bold">
            <Plus className="w-4 h-4 mr-1" /> Add Class
          </Button>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classSections = sections.filter((s) => s.class_id === cls.id);
          return (
            <Card key={cls.id} className="flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-sm border border-indigo-200 dark:border-indigo-800">
                      {cls.numeric_grade || cls.name.replace(/[^0-9]/g, '') || 'G'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">{cls.name}</h3>
                      <span className="text-[10px] text-slate-400">Grade Level: {cls.numeric_grade || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditClass(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Class"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Class Teacher Badge */}
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">Class Teacher: <strong className="text-slate-900 dark:text-white">{cls.class_teacher_name || 'Not assigned'}</strong></span>
                  </div>
                </div>

                {/* Sections List */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Assigned Sections ({classSections.length}):</span>
                    <span>Capacity</span>
                  </div>

                  <div className="space-y-2">
                    {classSections.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-700/80 flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Section {sec.name}</span>
                            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                              {sec.room_no || 'Room N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-semibold">{sec.capacity} seats</span>
                          <button
                            onClick={() => handleOpenEditSection(sec)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition"
                            title="Edit Section"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(sec)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenAddSection(cls.id)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Section
                </button>
                <Badge variant="purple" size="sm">{classSections.reduce((acc, s) => acc + (s.capacity || 0), 0)} Total Seats</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={editingClass ? `Edit Class: ${editingClass.name}` : 'Create New Class Grade'}
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <Input
            label="Class Display Name *"
            placeholder="e.g. Class 10 or Grade 10"
            value={classForm.name}
            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
            required
          />
          <Input
            label="Numeric Grade Level *"
            type="number"
            value={classForm.numeric_grade}
            onChange={(e) => setClassForm({ ...classForm, numeric_grade: Number(e.target.value) })}
            required
          />
          <Select
            label="Class Teacher / Faculty Lead"
            value={classForm.class_teacher_id}
            onChange={(e) => setClassForm({ ...classForm, class_teacher_id: e.target.value })}
          >
            <option value="">-- None assigned --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.designation})</option>
            ))}
          </Select>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              {editingClass ? 'Save Class Updates' : 'Create Class'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Section Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={editingSection ? `Edit Section ${editingSection.name}` : 'Add Section to Class'}
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <Select
            label="Target Class Cohort *"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            required
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Input
            label="Section Identifier *"
            placeholder="e.g. A, B, C or Blue"
            value={sectionForm.name}
            onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Room / Hall Number"
              placeholder="e.g. Room 302"
              value={sectionForm.room_no}
              onChange={(e) => setSectionForm({ ...sectionForm, room_no: e.target.value })}
            />
            <Input
              label="Student Capacity *"
              type="number"
              value={sectionForm.capacity}
              onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              {editingSection ? 'Save Section Updates' : 'Add Section'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
