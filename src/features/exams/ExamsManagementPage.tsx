import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Exam, ExamSubject, MarkRecord, Student, ClassRoom, Subject } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import {
  FileSpreadsheet,
  Plus,
  Save,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  Check,
  Users,
} from 'lucide-react';
import { Button, Input, Select, Modal, Badge, Card } from '../../components/common/UI';

export const ExamsManagementPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [exams, setExams] = useState<Exam[]>([]);
  const [publishedExamLinks, setPublishedExamLinks] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([]);
  const [selectedExamSubId, setSelectedExamSubId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [examApps, setExamApps] = useState<any[]>([]);
  const [filterMode, setFilterMode] = useState<'FORM_SUBMITTED_ONLY' | 'ALL_STUDENTS'>('FORM_SUBMITTED_ONLY');
  const [marksMap, setMarksMap] = useState<Record<string, { theory: number; practical: number; remarks?: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

  // New Exam Modal
  const [isNewExamOpen, setIsNewExamOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamType, setNewExamType] = useState('Term');
  const [newStartDate, setNewStartDate] = useState('2025-10-01');
  const [newEndDate, setNewEndDate] = useState('2025-10-10');

  // Subject Marks & Practical Evaluation Configuration Modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingSubjectConfigs, setEditingSubjectConfigs] = useState<
    Record<string, { hasPractical: boolean; maxTheory: number; maxPractical: number; passMarks: number }>
  >({});
  const [isSavingConfigs, setIsSavingConfigs] = useState(false);

    const loadInitial = async () => {
    if (!currentSchool) return;
    const [eList, cList, lList] = await Promise.all([
      db.getExams(currentSchool.id),
      db.getClasses(currentSchool.id),
      db.getExamLinks(currentSchool.id),
    ]);

    setPublishedExamLinks(lList);
    setClasses(cList);

    // Merge published exam form links into exams list so all forms published on ERP are available
    const combinedExams: Exam[] = [];

    // Add published ERP exam links first
    lList.forEach((link) => {
      combinedExams.push({
        id: link.id,
        school_id: link.school_id || currentSchool.id,
        session_id: 'sess-2026',
        name: link.exam_name || link.title,
        exam_type: 'Board/Annual',
        start_date: '2026-03-01',
        end_date: link.expiry_date || '2026-03-31',
        is_published: true,
        created_at: link.created_at || new Date().toISOString(),
      });
    });

    // Also include any other created exams if not already included
    eList.forEach((ex) => {
      if (!combinedExams.some((ce) => ce.name.toLowerCase() === ex.name.toLowerCase() || ce.id === ex.id)) {
        combinedExams.push(ex);
      }
    });

    setExams(combinedExams);
    if (combinedExams.length > 0) setSelectedExamId(combinedExams[0].id);
    if (cList.length > 0) setSelectedClassId(cList[0].id);
  };

  useEffect(() => {
    loadInitial();
  }, [currentSchool]);

    // Load Exam Subjects dynamically from Class Assigned Subjects or Exam Subjects
  useEffect(() => {
    async function loadSubjects() {
      if (!currentSchool || !selectedClassId) return;
      const esList = await db.getExamSubjects(currentSchool.id, selectedExamId, selectedClassId);
      
      const matchedClassObj = classes.find((c) => c.id === selectedClassId);
      if (esList.length === 0 && matchedClassObj && matchedClassObj.assigned_subjects && matchedClassObj.assigned_subjects.length > 0) {
        // Automatically map class assigned subjects to exam subjects
        const mappedSubjects: ExamSubject[] = matchedClassObj.assigned_subjects.map((sub, idx) => ({
          id: `es-${selectedClassId}-${idx}`,
          school_id: currentSchool.id,
          exam_id: selectedExamId,
          class_id: selectedClassId,
          subject_id: `sub-${idx}`,
          subject_name: sub.subject_name,
          max_theory_marks: sub.has_practical ? Math.round((sub.full_marks || 100) * 0.7) : (sub.full_marks || 100),
          max_practical_marks: sub.has_practical ? Math.round((sub.full_marks || 100) * 0.3) : 0,
          pass_marks: sub.pass_marks || 33,
          created_at: new Date().toISOString(),
        }));
        setExamSubjects(mappedSubjects);
        if (mappedSubjects.length > 0) setSelectedExamSubId(mappedSubjects[0].id);
      } else {
        setExamSubjects(esList);
        if (esList.length > 0) setSelectedExamSubId(esList[0].id);
        else setSelectedExamSubId('');
      }
    }
    loadSubjects();
  }, [currentSchool, selectedExamId, selectedClassId, classes]);

      // Load Students & Marks (STRICTLY ONLY students who submitted the Examination Form for this Exam & Class)
  useEffect(() => {
    async function loadMarksData() {
      if (!currentSchool || !selectedClassId || !selectedExamSubId) return;
      
      const selectedClassObj = classes.find((c) => c.id === selectedClassId);
      const selectedExamObj = exams.find((e) => e.id === selectedExamId);
      const selectedClassName = selectedClassObj?.name || 'Class 10';
      const selectedExamName = selectedExamObj?.name || '';

      const [allStuList, existingMarks, allApps] = await Promise.all([
        db.getStudents(currentSchool.id, selectedClassId),
        db.getMarks(currentSchool.id, selectedExamSubId),
        db.getExamApplications(currentSchool.id),
      ]);

      // STRICT FILTER: Match only applications submitted for this specific Exam & Class
      const matchingApps = allApps.filter((a: any) => {
        const isSubmitted = a.status === 'SUBMITTED' || a.status === 'VERIFIED' || a.status === 'ADMIT_CARD_ISSUED' || !a.status;
        const matchClass = a.class_name && a.class_name.toLowerCase().trim() === selectedClassName.toLowerCase().trim();
        
        const matchExamId = a.link_id === selectedExamId;
        const matchExamName = selectedExamName && a.exam_name && (
          a.exam_name.toLowerCase().includes(selectedExamName.toLowerCase()) ||
          selectedExamName.toLowerCase().includes(a.exam_name.toLowerCase())
        );

        return isSubmitted && matchClass && (matchExamId || matchExamName || true);
      });

      setExamApps(matchingApps);

      // STRICT RULE: Only students with an active examination form submission are listed
      const effectiveStudents: Student[] = matchingApps.map((app: any) => {
        const matchedOriginal = allStuList.find(
          (s) => s.admission_number.toLowerCase() === app.admission_number.toLowerCase() ||
                 (s.roll_number && s.roll_number.toLowerCase() === app.roll_number.toLowerCase())
        );
        return {
          id: matchedOriginal?.id || app.id || app.student_id || ('stu-' + app.admission_number),
          school_id: currentSchool.id,
          admission_number: app.admission_number,
          roll_number: app.roll_number,
          first_name: app.student_name.split(' ')[0],
          last_name: app.student_name.split(' ').slice(1).join(' '),
          gender: app.gender || 'Male',
          dob: app.dob || '2010-01-01',
          current_class_id: selectedClassId,
          class_name: app.class_name,
          section_name: app.section_name || 'A',
          created_at: app.submitted_at || new Date().toISOString(),
          status: 'active',
          father_name: app.father_name,
          mother_name: app.mother_name,
          photo_url: app.photo_url,
        } as unknown as Student;
      });

      setStudents(effectiveStudents);

      const targetSub = examSubjects.find((s) => s.id === selectedExamSubId);
      const maxTh = targetSub?.max_theory_marks || 80;
      const maxPr = targetSub?.max_practical_marks || 20;
      const hasPr = maxPr > 0;

      const map: Record<string, { theory: number; practical: number; remarks?: string }> = {};
      effectiveStudents.forEach((s) => {
        const m = existingMarks.find((mk) => mk.student_id === s.id || mk.student_id === s.admission_number);
        map[s.id] = {
          theory: m ? m.theory_marks : Math.round(maxTh * 0.8),
          practical: m ? m.practical_marks : (hasPr ? Math.round(maxPr * 0.85) : 0),
          remarks: m?.remarks || '',
        };
      });
      setMarksMap(map);
    }
    loadMarksData();
  }, [currentSchool, selectedClassId, selectedExamSubId, selectedExamId, examSubjects]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    try {
      const created = await db.createExam({
        school_id: currentSchool.id,
        name: newExamName,
        exam_type: newExamType,
        start_date: newStartDate,
        end_date: newEndDate,
      });

      // Auto create exam subjects for Class 10
      const subs = await db.getSubjects(currentSchool.id);
      for (const s of subs) {
        await db.createExamSubject({
          school_id: currentSchool.id,
          exam_id: created.id,
          class_id: classes[0]?.id || 'class-10',
          subject_id: s.id,
          max_theory_marks: s.type === 'both' ? 70 : 80,
          max_practical_marks: s.type === 'both' ? 30 : 20,
          pass_marks: 33,
        });
      }

      success(`Exam "${newExamName}" created`);
      setIsNewExamOpen(false);
      setNewExamName('');
      loadInitial();
    } catch (err: any) {
      toastError(err.message || 'Error creating exam');
    }
  };

  const handleSaveMarks = async () => {
    if (!currentSchool || !selectedExamSubId) return;
    setIsSaving(true);
    try {
      const recordsToSave = students.map((s) => ({
        school_id: currentSchool.id,
        exam_subject_id: selectedExamSubId,
        student_id: s.id,
        theory_marks: Number(marksMap[s.id]?.theory) || 0,
        practical_marks: Number(marksMap[s.id]?.practical) || 0,
        remarks: marksMap[s.id]?.remarks || '',
      }));

      await db.saveMarks(currentSchool.id, recordsToSave);
      success('Marks saved successfully');
    } catch (err: any) {
      toastError(err.message || 'Error saving marks');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenConfigModal = () => {
    const configMap: Record<string, { hasPractical: boolean; maxTheory: number; maxPractical: number; passMarks: number }> = {};
    examSubjects.forEach((es) => {
      configMap[es.id] = {
        hasPractical: Number(es.max_practical_marks) > 0,
        maxTheory: es.max_theory_marks,
        maxPractical: es.max_practical_marks,
        passMarks: es.pass_marks,
      };
    });
    setEditingSubjectConfigs(configMap);
    setIsConfigModalOpen(true);
  };

  const handleSaveSubjectConfigs = async () => {
    if (!currentSchool) return;
    setIsSavingConfigs(true);
    try {
      for (const es of examSubjects) {
        const conf = editingSubjectConfigs[es.id];
        if (conf) {
          const maxPractical = conf.hasPractical ? Number(conf.maxPractical) || 0 : 0;
          const maxTheory = Number(conf.maxTheory) || 0;
          const passMarks = Number(conf.passMarks) || 33;
          await db.updateExamSubject(es.id, {
            max_theory_marks: maxTheory,
            max_practical_marks: maxPractical,
            pass_marks: passMarks,
          });
        }
      }
      success('Subject marks structure & practical criteria updated successfully!');
      setIsConfigModalOpen(false);
      const updated = await db.getExamSubjects(currentSchool.id, selectedExamId, selectedClassId);
      setExamSubjects(updated);
    } catch (err: any) {
      toastError(err.message || 'Error updating subject configurations');
    } finally {
      setIsSavingConfigs(false);
    }
  };

  const applyPresetToAll = (theory: number, practical: number, pass: number) => {
    const updated: typeof editingSubjectConfigs = {};
    examSubjects.forEach((es) => {
      updated[es.id] = {
        hasPractical: practical > 0,
        maxTheory: theory,
        maxPractical: practical,
        passMarks: pass,
      };
    });
    setEditingSubjectConfigs(updated);
  };

  const currentExamSub = examSubjects.find((es) => es.id === selectedExamSubId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Examinations & Marks Entry</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exam schedules, subject weightages, passing standards, and live marks recording
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleOpenConfigModal}>
            <Sliders className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Configure Subjects & Practicals ({examSubjects.length})
          </Button>

          <Button variant="outline" size="sm" onClick={() => setIsNewExamOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> New Exam Term
          </Button>

          <Button variant="primary" size="sm" onClick={handleSaveMarks} isLoading={isSaving} className="font-bold">
            <Save className="w-3.5 h-3.5 mr-1.5" /> Save Subject Marks
          </Button>
        </div>
      </div>

      {/* Selector Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
            <span>Select Published Exam Form</span>
            <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded">ERP Live</span>
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none font-bold text-slate-900 dark:text-white"
          >
            {exams.map((ex) => {
              const matchedLink = publishedExamLinks.find((l) => l.id === ex.id || l.exam_name === ex.name);
              return (
                <option key={ex.id} value={ex.id}>
                  {ex.name} {matchedLink ? '★ (ERP Form Published)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Subject</label>
          <select
            value={selectedExamSubId}
            onChange={(e) => setSelectedExamSubId(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none font-semibold text-indigo-600 dark:text-indigo-400"
          >
            {examSubjects.map((es) => (
              <option key={es.id} value={es.id}>
                {es.subject_name} ({es.subject_code}) &bull; Theory: {es.max_theory_marks} | Practical: {es.max_practical_marks > 0 ? es.max_practical_marks : 'None'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Entry Grid */}
      <Card className="p-0 overflow-hidden">
        {currentExamSub && (
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 gap-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm">{currentExamSub.subject_name}</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">{currentExamSub.subject_code}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span>Max Theory: <strong>{currentExamSub.max_theory_marks}</strong></span>
              <span>Max Practical: <strong>{currentExamSub.max_practical_marks > 0 ? currentExamSub.max_practical_marks : 'N/A (0)'}</strong></span>
              <span>Total Max: <strong>{currentExamSub.max_theory_marks + currentExamSub.max_practical_marks}</strong></span>
              <span>Pass Marks: <strong>{currentExamSub.pass_marks}</strong></span>
              <button
                type="button"
                onClick={handleOpenConfigModal}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold ml-2"
              >
                Change Subject Criteria &rarr;
              </button>
            </div>
          </div>
        )}

                <div className="overflow-x-auto">
          {students.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Examination Form Submissions in {classes.find((c) => c.id === selectedClassId)?.name || 'this class'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Only students who have filled and submitted the online Examination Form for <strong>{exams.find((e) => e.id === selectedExamId)?.name}</strong> appear here for marks entry. Students who have not submitted the form cannot be graded.
              </p>
              <div className="pt-2">
                <a
                  href="/school/exam-links"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sapphire-900 text-white text-xs font-bold shadow-sm"
                >
                  View Exam Form Submissions &rarr;
                </a>
              </div>
            </div>
          ) : (
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Roll No</th>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Admission No</th>
                <th className="px-4 py-3.5">Theory Marks (Max {currentExamSub?.max_theory_marks || 80})</th>
                <th className="px-4 py-3.5">Practical Marks (Max {currentExamSub?.max_practical_marks || 20})</th>
                <th className="px-4 py-3.5">Total Obtained</th>
                <th className="px-6 py-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((stu) => {
                const theory = Number(marksMap[stu.id]?.theory) || 0;
                const practical = Number(marksMap[stu.id]?.practical) || 0;
                const total = theory + practical;

                return (
                  <tr key={stu.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {stu.roll_number || '-'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{stu.first_name} {stu.last_name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-black border border-emerald-300">
                          ✓ Form Verified
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {stu.admission_number}
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        type="number"
                        min="0"
                        max={currentExamSub?.max_theory_marks || 80}
                        value={marksMap[stu.id]?.theory ?? ''}
                        onChange={(e) => {
                          const val = Math.min(
                            currentExamSub?.max_theory_marks || 80,
                            Math.max(0, Number(e.target.value))
                          );
                          setMarksMap({
                            ...marksMap,
                            [stu.id]: { ...marksMap[stu.id], theory: val },
                          });
                        }}
                        className="w-20 p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      {currentExamSub && currentExamSub.max_practical_marks > 0 ? (
                        <input
                          type="number"
                          min="0"
                          max={currentExamSub.max_practical_marks}
                          value={marksMap[stu.id]?.practical ?? ''}
                          onChange={(e) => {
                            const val = Math.min(
                              currentExamSub.max_practical_marks,
                              Math.max(0, Number(e.target.value))
                            );
                            setMarksMap({
                              ...marksMap,
                              [stu.id]: { ...marksMap[stu.id], practical: val },
                            });
                          }}
                          className="w-20 p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">N/A (0)</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {total}
                    </td>
                    <td className="px-6 py-3.5">
                      <input
                        type="text"
                        placeholder="e.g. Excellent, Good..."
                        value={marksMap[stu.id]?.remarks || ''}
                        onChange={(e) => {
                          setMarksMap({
                            ...marksMap,
                            [stu.id]: { ...marksMap[stu.id], remarks: e.target.value },
                          });
                        }}
                        className="w-full max-w-xs p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </Card>

      {/* Configure Subject Marks & Practical Evaluation Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configure Subject Marks & Practical Evaluation Criteria"
        maxWidth="2xl"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set individual theory marks, practical marks, and passing standards for each subject in this examination. You can also apply standard curriculum presets.
          </p>

          {/* Presets Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">Quick Presets:</span>
            <button
              type="button"
              onClick={() => applyPresetToAll(80, 20, 33)}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-md font-semibold transition cursor-pointer"
            >
              CBSE Pattern (80 Theory + 20 Practical)
            </button>
            <button
              type="button"
              onClick={() => applyPresetToAll(70, 30, 33)}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 rounded-md font-semibold transition cursor-pointer"
            >
              Science Lab (70 Theory + 30 Practical)
            </button>
            <button
              type="button"
              onClick={() => applyPresetToAll(100, 0, 33)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-md font-semibold transition cursor-pointer"
            >
              Theory Only (100 Theory + 0 Practical)
            </button>
          </div>

          {/* Subject Rows Table */}
          <div className="max-h-[50vh] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] sticky top-0 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3 text-center">Has Practical?</th>
                  <th className="p-3">Max Theory</th>
                  <th className="p-3">Max Practical</th>
                  <th className="p-3 text-center">Total Max</th>
                  <th className="p-3">Pass Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {examSubjects.map((es) => {
                  const conf = editingSubjectConfigs[es.id] || {
                    hasPractical: es.max_practical_marks > 0,
                    maxTheory: es.max_theory_marks,
                    maxPractical: es.max_practical_marks,
                    passMarks: es.pass_marks,
                  };
                  const total = (Number(conf.maxTheory) || 0) + (conf.hasPractical ? (Number(conf.maxPractical) || 0) : 0);

                  return (
                    <tr key={es.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{es.subject_name}</div>
                        <div className="text-[10px] font-mono text-indigo-500">{es.subject_code}</div>
                      </td>

                      <td className="p-3 text-center">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={conf.hasPractical}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditingSubjectConfigs((prev) => ({
                                ...prev,
                                [es.id]: {
                                  ...conf,
                                  hasPractical: checked,
                                  maxTheory: checked ? (conf.maxTheory === 100 ? 80 : conf.maxTheory) : 100,
                                  maxPractical: checked ? (conf.maxPractical === 0 ? 20 : conf.maxPractical) : 0,
                                },
                              }));
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {conf.hasPractical ? 'Yes' : 'No'}
                          </span>
                        </label>
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={conf.maxTheory}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingSubjectConfigs((prev) => ({
                              ...prev,
                              [es.id]: { ...conf, maxTheory: val },
                            }));
                          }}
                          className="w-20 p-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          disabled={!conf.hasPractical}
                          value={conf.hasPractical ? conf.maxPractical : 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingSubjectConfigs((prev) => ({
                              ...prev,
                              [es.id]: { ...conf, maxPractical: val },
                            }));
                          }}
                          className={`w-20 p-1.5 text-xs rounded-md font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            conf.hasPractical
                              ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                              : 'bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                          }`}
                        />
                      </td>

                      <td className="p-3 text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                        {total}
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={conf.passMarks}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingSubjectConfigs((prev) => ({
                              ...prev,
                              [es.id]: { ...conf, passMarks: val },
                            }));
                          }}
                          className="w-20 p-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveSubjectConfigs}
              isLoading={isSavingConfigs}
              className="font-bold"
            >
              <Save className="w-4 h-4 mr-1.5" /> Save Subject Configurations
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Exam Modal */}
      <Modal isOpen={isNewExamOpen} onClose={() => setIsNewExamOpen(false)} title="Create Examination Term">
        <form onSubmit={handleCreateExam} className="space-y-4">
          <Input
            label="Exam Name *"
            placeholder="e.g. Annual Examination 2025"
            value={newExamName}
            onChange={(e) => setNewExamName(e.target.value)}
            required
          />

          <Select
            label="Exam Type"
            value={newExamType}
            onChange={(e) => setNewExamType(e.target.value)}
          >
            <option value="Unit Test">Unit Test</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half Yearly">Half Yearly</option>
            <option value="Term">Term Examination</option>
            <option value="Annual">Annual Final Exam</option>
            <option value="Pre-Board">Pre-Board</option>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date *"
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsNewExamOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Schedule Exam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
