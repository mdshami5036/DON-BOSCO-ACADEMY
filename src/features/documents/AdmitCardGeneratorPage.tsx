import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Exam, ClassRoom, Student, DocumentTemplate, ExamSubject } from '../../types/database';
import { compileTemplateHtml, generateDocumentNumber } from '../../lib/template-engine';
import { exportElementToPdf, printDocumentHtml } from '../../lib/pdf-generator';
import { generateQrCodeDataUri } from '../../lib/qr-generator';
import { useToast } from '../../components/common/Toast';
import {
  BookOpen,
  Printer,
  Download,
  Users,
  Calendar,
  Clock,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button, Select, Input, Badge, Card, Modal } from '../../components/common/UI';

export const AdmitCardGeneratorPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Mode: 'single' or 'bulk'
  const [generationMode, setGenerationMode] = useState<'single' | 'bulk'>('single');
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  // Live Compiled HTML for single and bulk batch
  const [compiledHtml, setCompiledHtml] = useState('');
  const [bulkCompiledHtml, setBulkCompiledHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  // Subject Exam Scheduler Modal
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [scheduleEdits, setScheduleEdits] = useState<Record<string, { date: string; start: string; end: string; room: string }>>({});

  useEffect(() => {
    async function loadMeta() {
      if (!currentSchool) return;
      const [eList, cList, tList, effective] = await Promise.all([
        db.getExams(currentSchool.id),
        db.getClasses(currentSchool.id),
        db.getMasterTemplates(),
        db.getEffectiveTemplate(currentSchool.id, 'ADMIT_CARD'),
      ]);
      setExams(eList);
      setClasses(cList);

      const adTmpls = tList.filter((t) => t.category === 'ADMIT_CARD');
      setTemplates(adTmpls);

      const matched = adTmpls.find((t) => t.id === effective.template_id) || adTmpls[0];
      if (matched) {
        setSelectedTemplate({
          ...matched,
          html_content: effective.html_content,
          css_content: effective.css_content,
          name: effective.name,
        });
      }

      if (eList.length > 0) setSelectedExamId(eList[0].id);
      if (cList.length > 0) setSelectedClassId(cList[0].id);
    }
    loadMeta();
  }, [currentSchool]);

  useEffect(() => {
    async function loadClassData() {
      if (!currentSchool || !selectedClassId || !selectedExamId) return;
      const [stuList, esList] = await Promise.all([
        db.getStudents(currentSchool.id, selectedClassId),
        db.getExamSubjects(currentSchool.id, selectedExamId, selectedClassId),
      ]);
      setStudents(stuList);
      setExamSubjects(esList);
      if (stuList.length > 0) setSelectedStudentId(stuList[0].id);

      // Initialize schedule edits
      const map: Record<string, { date: string; start: string; end: string; room: string }> = {};
      esList.forEach((es, idx) => {
        const day = 15 + idx * 2;
        map[es.id] = {
          date: es.exam_date || `2025-10-${day < 10 ? `0${day}` : day}`,
          start: es.start_time || '09:00',
          end: es.end_time || '12:00',
          room: 'Exam Hall 3',
        };
      });
      setScheduleEdits(map);
    }
    loadClassData();
  }, [currentSchool, selectedClassId, selectedExamId]);

  // Single Candidate Admit Card Compiler
  useEffect(() => {
    async function compileSingle() {
      if (!currentSchool || !selectedTemplate || !selectedStudentId) return;
      const student = students.find((s) => s.id === selectedStudentId);
      if (!student) return;

      const exam = exams.find((e) => e.id === selectedExamId);

      const scheduleList = examSubjects.map((es) => ({
        subject_name: es.subject_name || 'Subject',
        date: scheduleEdits[es.id]?.date || es.exam_date || '2025-10-15',
        time: `${scheduleEdits[es.id]?.start || es.start_time || '09:00'} - ${scheduleEdits[es.id]?.end || es.end_time || '12:00'}`,
        room_no: scheduleEdits[es.id]?.room || 'Exam Hall 3',
      }));

      // Document Numbering
      const settings = await db.getSchoolSettings(currentSchool.id);
      const pattern = settings.numbering_patterns?.admit_card_pattern || 'AC/{CLASS}/{YEAR}/{SEQ}';
      const docNumber = generateDocumentNumber(pattern, {
        class_name: student.class_name,
        roll_number: student.roll_number,
        school_name: currentSchool.name,
      }, 1);

      const vCode = `VERIFY-${docNumber.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const qrDataUrl = await generateQrCodeDataUri(`https://educloud.io/verify/${vCode}`);

      const compiled = compileTemplateHtml(selectedTemplate.html_content, selectedTemplate.css_content, {
        school_name: currentSchool.name,
        school_logo: currentSchool.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
        school_address: currentSchool.address,
        principal_name: currentSchool.principal_name,
        principal_signature: currentSchool.principal_signature_url,

        student_name: `${student.first_name} ${student.last_name}`,
        student_photo: student.photo_url,
        admission_number: student.admission_number,
        roll_number: student.roll_number,
        class_name: student.class_name || 'Class 10',
        section: student.section_name || 'A',
        exam_name: exam?.name || 'Mid-Term Examination 2025',

        qr_code: qrDataUrl,
        verification_code: vCode,
        schedule_list: scheduleList,
      });

      setCompiledHtml(compiled);
    }
    compileSingle();
  }, [currentSchool, selectedTemplate, selectedStudentId, selectedExamId, selectedClassId, students, examSubjects, scheduleEdits]);

  // Bulk Class Compilation
  const compileBulkBatch = async () => {
    if (!currentSchool || !selectedTemplate || students.length === 0) return;
    setIsBulkGenerating(true);
    try {
      const exam = exams.find((e) => e.id === selectedExamId);
      const settings = await db.getSchoolSettings(currentSchool.id);
      const pattern = settings.numbering_patterns?.admit_card_pattern || 'AC/{CLASS}/{YEAR}/{SEQ}';

      const scheduleList = examSubjects.map((es) => ({
        subject_name: es.subject_name || 'Subject',
        date: scheduleEdits[es.id]?.date || es.exam_date || '2025-10-15',
        time: `${scheduleEdits[es.id]?.start || es.start_time || '09:00'} - ${scheduleEdits[es.id]?.end || es.end_time || '12:00'}`,
        room_no: scheduleEdits[es.id]?.room || 'Exam Hall 3',
      }));

      const renderedCards: string[] = [];

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const docNumber = generateDocumentNumber(pattern, {
          class_name: student.class_name,
          roll_number: student.roll_number,
          school_name: currentSchool.name,
        }, i + 1);

        const vCode = `VERIFY-${docNumber.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const qrDataUrl = await generateQrCodeDataUri(`https://educloud.io/verify/${vCode}`);

        const singleHtml = compileTemplateHtml(selectedTemplate.html_content, selectedTemplate.css_content, {
          school_name: currentSchool.name,
          school_logo: currentSchool.logo_url,
          school_address: currentSchool.address,
          principal_name: currentSchool.principal_name,
          principal_signature: currentSchool.principal_signature_url,

          student_name: `${student.first_name} ${student.last_name}`,
          student_photo: student.photo_url,
          admission_number: student.admission_number,
          roll_number: student.roll_number,
          class_name: student.class_name,
          section: student.section_name || 'A',
          exam_name: exam?.name,

          qr_code: qrDataUrl,
          verification_code: vCode,
          schedule_list: scheduleList,
        });

        renderedCards.push(`
          <div style="page-break-after: always; margin-bottom: 30px;">
            ${singleHtml}
          </div>
        `);
      }

      setBulkCompiledHtml(renderedCards.join(''));
      setGenerationMode('bulk');
      success(`Generated Admit Cards for all ${students.length} students in class!`);
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!previewContainerRef.current) return;
    setIsGenerating(true);
    try {
      const student = students.find((s) => s.id === selectedStudentId);
      const filename = generationMode === 'bulk'
        ? `All-Admit-Cards-${classes.find((c) => c.id === selectedClassId)?.name || 'Class'}.pdf`
        : `AdmitCard-${student?.admission_number}.pdf`;

      await exportElementToPdf(previewContainerRef.current, filename, 'portrait', 'a4');
      success('Admit Card downloaded successfully!');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSchedules = async () => {
    try {
      for (const es of examSubjects) {
        const edit = scheduleEdits[es.id];
        if (edit) {
          await db.updateExamSubject(es.id, {
            exam_date: edit.date,
            start_time: edit.start,
            end_time: edit.end,
          });
        }
      }
      setIsSchedulerOpen(false);
      success('Exam schedule timetable updated and saved for all admit cards!');
      if (currentSchool && selectedExamId && selectedClassId) {
        const esList = await db.getExamSubjects(currentSchool.id, selectedExamId, selectedClassId);
        setExamSubjects(esList);
      }
    } catch (err: any) {
      toastError(err.message || 'Error saving schedules');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Exam Admit Card / Hall Ticket Studio</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure subject timetable schedules, seat hall allocations, and bulk-generate admit passes for entire cohorts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsSchedulerOpen(true)}>
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Set Exam Schedule & Halls ({examSubjects.length})
          </Button>

          <Button variant="outline" size="sm" onClick={compileBulkBatch} isLoading={isBulkGenerating}>
            <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Bulk Generate All Students ({students.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => printDocumentHtml(generationMode === 'bulk' ? bulkCompiledHtml : compiledHtml, 'Admit Cards', 'portrait', 'A4')}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Batch
          </Button>

          <Button variant="primary" size="sm" onClick={handleDownload} isLoading={isGenerating} className="font-bold">
            <Download className="w-4 h-4 mr-1.5" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Target Class</label>
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Student Candidate</label>
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setGenerationMode('single');
            }}
            className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none font-semibold text-indigo-600 dark:text-indigo-400"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_number})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Master Design</label>
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const found = templates.find((t) => t.id === e.target.value);
              if (found) setSelectedTemplate(found);
            }}
            className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Viewport Toolbar */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 text-xs">
          <Badge variant={generationMode === 'bulk' ? 'purple' : 'primary'}>
            {generationMode === 'bulk' ? `Bulk Mode (${students.length} Students)` : 'Single Preview Mode'}
          </Badge>
          {generationMode === 'bulk' && (
            <button
              onClick={() => setGenerationMode('single')}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Switch to Single Candidate Preview
            </button>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-300 font-bold w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1.0)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold transition"
          >
            100%
          </button>
        </div>
      </div>

      {/* Sandboxed Scaled Document Canvas */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-auto min-h-[620px] max-h-[850px] flex justify-center items-start shadow-inner">
        <div
          ref={previewContainerRef}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            width: '794px',
            height: '1123px',
            minHeight: '1123px',
            maxHeight: '1123px',
            boxSizing: 'border-box',
            transition: 'transform 0.15s ease-out',
          }}
          className="shadow-2xl rounded-md overflow-hidden shrink-0 border border-slate-700 bg-transparent"
          dangerouslySetInnerHTML={{ __html: generationMode === 'bulk' ? bulkCompiledHtml : compiledHtml }}
        />
      </div>

      {/* Exam Subject Schedule Setter Modal */}
      <Modal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        title="Configure Exam Subject Dates & Rooms"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Set the examination date, start time, end time, and assigned exam hall/room number for each subject in this examination.
          </p>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {examSubjects.map((es) => (
              <div key={es.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-xs">
                <div>
                  <div className="font-bold text-white text-xs">{es.subject_name}</div>
                  <div className="text-[10px] font-mono text-indigo-400">{es.subject_code}</div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={scheduleEdits[es.id]?.date || '2025-10-15'}
                    onChange={(e) =>
                      setScheduleEdits((prev) => ({
                        ...prev,
                        [es.id]: { ...prev[es.id], date: e.target.value },
                      }))
                    }
                    className="w-full text-xs p-1.5 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Start</label>
                    <input
                      type="time"
                      value={scheduleEdits[es.id]?.start || '09:00'}
                      onChange={(e) =>
                        setScheduleEdits((prev) => ({
                          ...prev,
                          [es.id]: { ...prev[es.id], start: e.target.value },
                        }))
                      }
                      className="w-full text-xs p-1 bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">End</label>
                    <input
                      type="time"
                      value={scheduleEdits[es.id]?.end || '12:00'}
                      onChange={(e) =>
                        setScheduleEdits((prev) => ({
                          ...prev,
                          [es.id]: { ...prev[es.id], end: e.target.value },
                        }))
                      }
                      className="w-full text-xs p-1 bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Hall / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall 302"
                    value={scheduleEdits[es.id]?.room || 'Exam Hall'}
                    onChange={(e) =>
                      setScheduleEdits((prev) => ({
                        ...prev,
                        [es.id]: { ...prev[es.id], room: e.target.value },
                      }))
                    }
                    className="w-full text-xs p-1.5 bg-slate-950 border border-slate-700 rounded text-white font-semibold"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsSchedulerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="font-bold" onClick={handleSaveSchedules}>
              Save Exam Schedules
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
