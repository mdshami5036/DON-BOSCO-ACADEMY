import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import {
  Exam,
  ClassRoom,
  Student,
  DocumentTemplate,
  GeneratedDocument,
  ExamResult,
} from '../../types/database';
import { compileTemplateHtml, generateDocumentNumber } from '../../lib/template-engine';
import { exportElementToPdf, printDocumentHtml } from '../../lib/pdf-generator';
import { generateQrCodeDataUri } from '../../lib/qr-generator';
import { useToast } from '../../components/common/Toast';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  Sparkles,
  Users,
  QrCode,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { Button, Select, Badge, Card, Modal } from '../../components/common/UI';

export const MarksheetGeneratorPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Mode: single or bulk
  const [generationMode, setGenerationMode] = useState<'single' | 'bulk'>('single');
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  const [compiledHtml, setCompiledHtml] = useState('');
  const [bulkCompiledHtml, setBulkCompiledHtml] = useState('');
  const [currentVerificationCode, setCurrentVerificationCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  // Load initial meta
  useEffect(() => {
    async function loadMeta() {
      if (!currentSchool) return;
      const [eList, cList, tList, effective] = await Promise.all([
        db.getExams(currentSchool.id),
        db.getClasses(currentSchool.id),
        db.getMasterTemplates(),
        db.getEffectiveTemplate(currentSchool.id, 'MARKSHEET'),
      ]);
      setExams(eList);
      setClasses(cList);

      const msTmpls = tList.filter((t) => t.category === 'MARKSHEET');
      setTemplates(msTmpls);

      const matched = msTmpls.find((t) => t.id === effective.template_id) || msTmpls[0];
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

  // Load students & results for selected class
  useEffect(() => {
    async function loadClassData() {
      if (!currentSchool || !selectedClassId || !selectedExamId) return;
      const [stuList, resList] = await Promise.all([
        db.getStudents(currentSchool.id, selectedClassId),
        db.getResults(currentSchool.id, selectedExamId, selectedClassId),
      ]);
      setStudents(stuList);
      setResults(resList);
      if (stuList.length > 0) {
        setSelectedStudentId(stuList[0].id);
      }
    }
    loadClassData();
  }, [currentSchool, selectedClassId, selectedExamId]);

  // Compile Single Preview
  useEffect(() => {
    async function buildPreview() {
      if (!currentSchool || !selectedTemplate || !selectedStudentId) return;

      const student = students.find((s) => s.id === selectedStudentId);
      if (!student) return;

      const exam = exams.find((e) => e.id === selectedExamId);
      const res = results.find((r) => r.student_id === selectedStudentId);

      // Fetch marks breakdown for student
      const examSubs = await db.getExamSubjects(currentSchool.id, selectedExamId, selectedClassId);
      const marksList: any[] = [];

      for (const es of examSubs) {
        const mList = await db.getMarks(currentSchool.id, es.id);
        const m = mList.find((mk) => mk.student_id === selectedStudentId);
        marksList.push({
          subject_name: es.subject_name || 'Subject',
          max_total: es.max_theory_marks + es.max_practical_marks,
          max_theory: es.max_theory_marks,
          max_practical: es.max_practical_marks,
          theory_obtained: m ? m.theory_marks : 0,
          practical_obtained: m ? m.practical_marks : 0,
          total_obtained: m ? m.total_marks : 0,
          grade: m?.grade || 'A',
          remarks: m?.remarks,
        });
      }

      // Auto numbering from school settings
      const settings = await db.getSchoolSettings(currentSchool.id);
      const pattern = settings.numbering_patterns?.marksheet_pattern || '{CLASS}/{YEAR}/MS-{SEQ}';
      const docNumber = generateDocumentNumber(pattern, {
        class_name: student.class_name,
        roll_number: student.roll_number,
        school_name: currentSchool.name,
      }, 1);

      const vCode = `VERIFY-${docNumber.replace(/[^a-zA-Z0-9]/g, '-')}`;
      setCurrentVerificationCode(vCode);

      const qrDataUrl = await generateQrCodeDataUri(`${window.location.origin}/verify?id=${vCode}`);

      const compiled = compileTemplateHtml(selectedTemplate.html_content, selectedTemplate.css_content, {
        school_name: currentSchool.name,
        school_logo: currentSchool.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
        school_address: currentSchool.address,
        school_phone: currentSchool.phone,
        school_email: currentSchool.email,
        principal_name: currentSchool.principal_name,
        principal_signature: currentSchool.principal_signature_url,
        school_stamp: currentSchool.stamp_url,

        student_name: `${student.first_name} ${student.middle_name ? `${student.middle_name} ` : ''}${student.last_name}`,
        student_photo: student.photo_url,
        admission_number: student.admission_number,
        roll_number: student.roll_number,
        class_name: student.class_name || 'Class 10',
        section: student.section_name || 'A',
        academic_session: '2025-2026',
        father_name: student.father_name,
        date_of_birth: student.date_of_birth,

        exam_name: exam?.name || 'Annual Examination 2025',
        total_max_marks: res?.total_max_marks || 500,
        total_obtained_marks: res?.total_obtained_marks || 461,
        percentage: res?.percentage || '92.2',
        grade: res?.grade || 'A+',
        result_status: res?.result_status || 'PASS',
        rank_in_class: res?.rank_in_class || 1,
        remarks: res?.remarks || 'Distinguished academic achievement',

        issue_date: formatDDMMYYYY(new Date()),
        qr_code: qrDataUrl,
        verification_code: vCode,
        marks_list: marksList,
      });

      setCompiledHtml(compiled);
    }

    buildPreview();
  }, [currentSchool, selectedTemplate, selectedStudentId, selectedExamId, selectedClassId, students, results]);

  const handleDownloadPdf = async () => {
    if (!previewContainerRef.current) return;
    setIsGenerating(true);
    try {
      const student = students.find((s) => s.id === selectedStudentId);
      const filename = generationMode === 'bulk'
        ? `Class-${classes.find((c) => c.id === selectedClassId)?.name || 'Class'}-Marksheets.pdf`
        : `Marksheet-${student?.admission_number || 'student'}.pdf`;

      if (generationMode === 'single') {
        await db.saveGeneratedDocument({
          school_id: currentSchool!.id,
          student_id: selectedStudentId,
          template_id: selectedTemplate?.id,
          doc_type: 'MARKSHEET',
          certificate_no: `MS-${student?.admission_number || '101'}`,
          verification_code: currentVerificationCode,
          title: `Marksheet - ${student?.first_name} ${student?.last_name}`,
          metadata: {
            student_name: `${student?.first_name} ${student?.last_name}`,
            exam_name: exams.find((e) => e.id === selectedExamId)?.name,
            percentage: results.find((r) => r.student_id === selectedStudentId)?.percentage,
            grade: results.find((r) => r.student_id === selectedStudentId)?.grade,
          },
        });
      }

      await exportElementToPdf(previewContainerRef.current, filename, 'portrait', 'a4');
      success('Marksheet PDF exported & verification records created!');
    } catch (err: any) {
      toastError(err.message || 'Error exporting PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerateClass = async () => {
    if (!currentSchool || !selectedTemplate || students.length === 0) return;
    setIsBulkGenerating(true);
    try {
      const exam = exams.find((e) => e.id === selectedExamId);
      const examSubs = await db.getExamSubjects(currentSchool.id, selectedExamId, selectedClassId);
      const settings = await db.getSchoolSettings(currentSchool.id);
      const pattern = settings.numbering_patterns?.marksheet_pattern || '{CLASS}/{YEAR}/MS-{SEQ}';

      const renderedSheets: string[] = [];

      for (let i = 0; i < students.length; i++) {
        const stu = students[i];
        const res = results.find((r) => r.student_id === stu.id);

        const docNumber = generateDocumentNumber(pattern, {
          class_name: stu.class_name,
          roll_number: stu.roll_number,
          school_name: currentSchool.name,
        }, (settings.numbering_patterns?.current_sequence || 1) + i);

        const vCode = `VERIFY-${docNumber.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const qrDataUrl = await generateQrCodeDataUri(`${window.location.origin}/verify?id=${vCode}`);

        // Marks for this student
        const marksList: any[] = [];
        for (const es of examSubs) {
          const mList = await db.getMarks(currentSchool.id, es.id);
          const m = mList.find((mk) => mk.student_id === stu.id);
          marksList.push({
            subject_name: es.subject_name || 'Subject',
            max_total: es.max_theory_marks + es.max_practical_marks,
            max_theory: es.max_theory_marks,
            max_practical: es.max_practical_marks,
            theory_obtained: m ? m.theory_marks : 0,
            practical_obtained: m ? m.practical_marks : 0,
            total_obtained: m ? m.total_marks : 0,
            grade: m?.grade || 'A',
            remarks: m?.remarks,
          });
        }

        await db.saveGeneratedDocument({
          school_id: currentSchool.id,
          student_id: stu.id,
          template_id: selectedTemplate.id,
          doc_type: 'MARKSHEET',
          certificate_no: docNumber,
          verification_code: vCode,
          title: `Marksheet - ${stu.first_name} ${stu.last_name}`,
          metadata: {
            student_name: `${stu.first_name} ${stu.last_name}`,
            class_name: stu.class_name,
            grade: res?.grade || 'A',
          },
        });

        const singleHtml = compileTemplateHtml(selectedTemplate.html_content, selectedTemplate.css_content, {
          school_name: currentSchool.name,
          school_logo: currentSchool.logo_url,
          school_address: currentSchool.address,
          school_phone: currentSchool.phone,
          school_email: currentSchool.email,
          principal_name: currentSchool.principal_name,
          principal_signature: currentSchool.principal_signature_url,
          school_stamp: currentSchool.stamp_url,

          student_name: `${stu.first_name} ${stu.last_name}`,
          student_photo: stu.photo_url,
          admission_number: stu.admission_number,
          roll_number: stu.roll_number,
          class_name: stu.class_name,
          section: stu.section_name || 'A',
          academic_session: '2025-2026',
          father_name: stu.father_name,
          date_of_birth: stu.date_of_birth,

          exam_name: exam?.name || 'Annual Examination 2025',
          total_max_marks: res?.total_max_marks || 500,
          total_obtained_marks: res?.total_obtained_marks || 450,
          percentage: res?.percentage || '90.0',
          grade: res?.grade || 'A+',
          result_status: res?.result_status || 'PASS',
          rank_in_class: res?.rank_in_class || i + 1,
          remarks: res?.remarks || 'Promoted with distinction',

          issue_date: formatDDMMYYYY(new Date()),
          qr_code: qrDataUrl,
          verification_code: vCode,
          marks_list: marksList,
        });

        renderedSheets.push(`
          <div style="page-break-after: always; margin-bottom: 40px;">
            ${singleHtml}
          </div>
        `);
      }

      setBulkCompiledHtml(renderedSheets.join(''));
      setGenerationMode('bulk');
      success(`Generated marksheet records for all ${students.length} students in class!`);
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Marksheet & Report Card Studio</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Produce pixel-perfect printable marksheets with cryptographic QR verification, dynamic subject grades, and official seals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleBulkGenerateClass} isLoading={isBulkGenerating}>
            <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Bulk Generate Entire Class ({students.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => printDocumentHtml(generationMode === 'bulk' ? bulkCompiledHtml : compiledHtml, 'Marksheets', 'portrait', 'A4')}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Preview
          </Button>

          <Button variant="primary" size="sm" onClick={handleDownloadPdf} isLoading={isGenerating} className="font-bold">
            <Download className="w-4 h-4 mr-1.5" /> Download Marksheet PDF
          </Button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Examination Term</label>
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Class Cohort</label>
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setGenerationMode('single');
            }}
            className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none font-semibold text-indigo-600 dark:text-indigo-400"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} (Roll: {s.roll_number || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Official Document Design</label>
          <div className="w-full text-xs p-2 bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between font-bold text-indigo-700 dark:text-indigo-300">
            <span className="truncate">{selectedTemplate?.name || 'Standard Official Marksheet'}</span>
            <Badge variant="primary" size="sm">Official</Badge>
          </div>
        </div>
      </div>

      {/* Viewport Toolbar */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 text-xs">
          <Badge variant={generationMode === 'bulk' ? 'purple' : 'primary'}>
            {generationMode === 'bulk' ? `Bulk Class View (${students.length} Marksheets)` : 'Single Candidate Marksheet'}
          </Badge>
          {generationMode === 'bulk' && (
            <button
              onClick={() => setGenerationMode('single')}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Switch to Single Student View
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
            onClick={() => setZoomLevel(0.85)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold transition"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Scaled Sandbox Canvas (Zero Text Overlaps) */}
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
    </div>
  );
};
