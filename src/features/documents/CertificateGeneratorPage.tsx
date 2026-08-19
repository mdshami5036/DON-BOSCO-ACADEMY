import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Student, DocumentTemplate, DocType, ClassRoom } from '../../types/database';
import { compileTemplateHtml, generateDocumentNumber } from '../../lib/template-engine';
import { exportElementToPdf, printDocumentHtml } from '../../lib/pdf-generator';
import { generateQrCodeDataUri } from '../../lib/qr-generator';
import { useToast } from '../../components/common/Toast';
import {
  FileBadge,
  Printer,
  Download,
  Award,
  Sparkles,
  QrCode,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { Button, Input, Select, Badge, Card } from '../../components/common/UI';

export const CertificateGeneratorPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [certType, setCertType] = useState<DocType>('CERTIFICATE');
  const [certTitle, setCertTitle] = useState('Certificate of Academic Excellence');
  const [certBody, setCertBody] = useState(
    'In recognition of outstanding scholastic achievement, ranking 1st in Class 10 with distinguished merit in the Academic Year 2025-2026.'
  );
  const [certNumber, setCertNumber] = useState('');

  // Mode: single or bulk
  const [generationMode, setGenerationMode] = useState<'single' | 'bulk'>('single');
  const [zoomLevel, setZoomLevel] = useState<number>(0.8);

  const [compiledHtml, setCompiledHtml] = useState('');
  const [bulkCompiledHtml, setBulkCompiledHtml] = useState('');
  const [currentVerificationCode, setCurrentVerificationCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      if (!currentSchool) return;
      const [cList, sList, tList, settings, effective] = await Promise.all([
        db.getClasses(currentSchool.id),
        db.getStudents(currentSchool.id),
        db.getMasterTemplates(),
        db.getSchoolSettings(currentSchool.id),
        db.getEffectiveTemplate(currentSchool.id, 'CERTIFICATE'),
      ]);
      setClasses(cList);
      setStudents(sList);
      if (cList.length > 0) setSelectedClassId(cList[0].id);
      if (sList.length > 0) setSelectedStudentId(sList[0].id);

      const certTmpls = tList.filter((t) => t.category === 'CERTIFICATE');
      setTemplates(certTmpls);

      const matched = certTmpls.find((t) => t.id === effective.template_id) || certTmpls[0];
      if (matched) {
        setSelectedTemplate({
          ...matched,
          html_content: effective.html_content,
          css_content: effective.css_content,
          name: effective.name,
        });
      }

      // Auto-compute next certificate number from school pattern
      const pattern = settings.numbering_patterns?.certificate_pattern || '{CLASS}/{YEAR}/{SEQ}';
      const initialNum = generateDocumentNumber(pattern, {
        class_name: sList[0]?.class_name || '10TH',
        school_name: currentSchool.name,
      }, settings.numbering_patterns?.current_sequence || 1);
      setCertNumber(initialNum);
    }
    load();
  }, [currentSchool]);

  useEffect(() => {
    async function loadClassStudents() {
      if (!currentSchool || !selectedClassId) return;
      const stuList = await db.getStudents(currentSchool.id, selectedClassId);
      setStudents(stuList);
      if (stuList.length > 0) setSelectedStudentId(stuList[0].id);
    }
    loadClassStudents();
  }, [currentSchool, selectedClassId]);

  // Recalculate certNumber when student changes
  useEffect(() => {
    async function updateNum() {
      if (!currentSchool || !selectedStudentId) return;
      const student = students.find((s) => s.id === selectedStudentId);
      const settings = await db.getSchoolSettings(currentSchool.id);
      const pattern = settings.numbering_patterns?.certificate_pattern || '{CLASS}/{YEAR}/{SEQ}';
      const autoNum = generateDocumentNumber(pattern, {
        class_name: student?.class_name || '10TH',
        roll_number: student?.roll_number,
        school_name: currentSchool.name,
      }, settings.numbering_patterns?.current_sequence || 1);
      setCertNumber(autoNum);
    }
    updateNum();
  }, [selectedStudentId, currentSchool, students]);

  // Single Certificate Compiler
  useEffect(() => {
    async function compileSingle() {
      if (!currentSchool || !selectedTemplate || !selectedStudentId) return;

      const student = students.find((s) => s.id === selectedStudentId);
      if (!student) return;

      const vCode = `VERIFY-CERT-${certNumber.replace(/[^a-zA-Z0-9]/g, '-')}`;
      setCurrentVerificationCode(vCode);

      const qrDataUrl = await generateQrCodeDataUri(`https://educloud.io/verify/${vCode}`);

      const compiled = compileTemplateHtml(selectedTemplate.html_content, selectedTemplate.css_content, {
        school_name: currentSchool.name,
        school_logo: currentSchool.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
        school_address: currentSchool.address,
        academic_session: '2025-2026',
        principal_name: currentSchool.principal_name,
        principal_signature: currentSchool.principal_signature_url,
        school_stamp: currentSchool.stamp_url,

        student_name: `${student.first_name} ${student.last_name}`,
        admission_number: student.admission_number,
        roll_number: student.roll_number || '1001',
        class_name: student.class_name || 'Class 10',
        section: student.section_name || 'A',
        certificate_title: certTitle,
        certificate_body: certBody,
        certificate_number: certNumber,
        issue_date: new Date().toLocaleDateString('en-GB'),
        qr_code: qrDataUrl,
        verification_code: vCode,
      });

      setCompiledHtml(compiled);
    }
    compileSingle();
  }, [currentSchool, selectedTemplate, selectedStudentId, certTitle, certBody, certNumber, students]);

  // Bulk Class Certificate Batch Generation
  const handleBulkGenerateCertificates = async () => {
    if (!currentSchool || !selectedTemplate || students.length === 0) return;
    setIsBulkGenerating(true);
    try {
      const settings = await db.getSchoolSettings(currentSchool.id);
      const pattern = settings.numbering_patterns?.certificate_pattern || '{CLASS}/{YEAR}/{SEQ}';
      const renderedCertificates: string[] = [];

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const docNumber = generateDocumentNumber(pattern, {
          class_name: student.class_name,
          roll_number: student.roll_number,
          school_name: currentSchool.name,
        }, (settings.numbering_patterns?.current_sequence || 1) + i);

        const vCode = `VERIFY-CERT-${docNumber.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const qrDataUrl = await generateQrCodeDataUri(`https://educloud.io/verify/${vCode}`);

        // Save generated document record
        await db.saveGeneratedDocument({
          school_id: currentSchool.id,
          student_id: student.id,
          template_id: selectedTemplate.id,
          doc_type: certType,
          certificate_no: docNumber,
          verification_code: vCode,
          title: `${certTitle} - ${student.first_name} ${student.last_name}`,
          metadata: {
            student_name: `${student.first_name} ${student.last_name}`,
            certificate_title: certTitle,
            certificate_body: certBody,
          },
        });

        const singleHtml = compileTemplateHtml(selectedTemplate.html_content, selectedTemplate.css_content, {
          school_name: currentSchool.name,
          school_logo: currentSchool.logo_url,
          school_address: currentSchool.address,
          academic_session: '2025-2026',
          principal_name: currentSchool.principal_name,
          principal_signature: currentSchool.principal_signature_url,
          school_stamp: currentSchool.stamp_url,

          student_name: `${student.first_name} ${student.last_name}`,
          admission_number: student.admission_number,
          roll_number: student.roll_number || '1001',
          class_name: student.class_name,
          section: student.section_name || 'A',
          certificate_title: certTitle,
          certificate_body: certBody,
          certificate_number: docNumber,
          issue_date: new Date().toLocaleDateString('en-GB'),
          qr_code: qrDataUrl,
          verification_code: vCode,
        });

        renderedCertificates.push(`
          <div style="page-break-after: always; margin-bottom: 40px;">
            ${singleHtml}
          </div>
        `);
      }

      setBulkCompiledHtml(renderedCertificates.join(''));
      setGenerationMode('bulk');
      success(`Generated & registered certificates for all ${students.length} students!`);
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewContainerRef.current) return;
    setIsGenerating(true);
    try {
      const student = students.find((s) => s.id === selectedStudentId);
      const filename = generationMode === 'bulk'
        ? `Class-${classes.find((c) => c.id === selectedClassId)?.name || 'Class'}-Certificates.pdf`
        : `Certificate-${certNumber.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;

      if (generationMode === 'single') {
        await db.saveGeneratedDocument({
          school_id: currentSchool!.id,
          student_id: selectedStudentId,
          template_id: selectedTemplate?.id,
          doc_type: certType,
          certificate_no: certNumber,
          verification_code: currentVerificationCode,
          title: `${certTitle} - ${student?.first_name} ${student?.last_name}`,
          metadata: {
            student_name: `${student?.first_name} ${student?.last_name}`,
            certificate_title: certTitle,
            certificate_body: certBody,
          },
        });
      }

      await exportElementToPdf(previewContainerRef.current, filename, 'landscape', 'a4');
      success('Official Certificate exported as high-resolution PDF!');
    } catch (err: any) {
      toastError(err.message || 'Error exporting certificate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Official Certificate Studio</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Issue automated Transfer Certificates (TC), Bonafide credentials, and Academic Excellence Merit Awards with custom serial numbers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleBulkGenerateCertificates} isLoading={isBulkGenerating}>
            <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Bulk Generate Class Batch ({students.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => printDocumentHtml(generationMode === 'bulk' ? bulkCompiledHtml : compiledHtml, 'Certificates', 'landscape', 'A4')}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Preview
          </Button>

          <Button variant="primary" size="sm" onClick={handleDownloadPdf} isLoading={isGenerating} className="font-bold">
            <Download className="w-4 h-4 mr-1.5" /> Download Certificate PDF
          </Button>
        </div>
      </div>

      {/* Editor Controls Bar */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Certificate Category"
            value={certType}
            onChange={(e) => {
              const val = e.target.value as DocType;
              setCertType(val);
              if (val === 'TRANSFER_CERTIFICATE') {
                setCertTitle('School Transfer Certificate');
                setCertBody('This is to certify that the student has completed their tenure and is leaving with exemplary academic record and deportment.');
              } else if (val === 'BONAFIDE_CERTIFICATE') {
                setCertTitle('Bonafide Student Certificate');
                setCertBody('This is to certify that the student is a bonafide enrolled scholar in our institution for the current academic session.');
              } else if (val === 'CHARACTER_CERTIFICATE') {
                setCertTitle('Character & Conduct Certificate');
                setCertBody('Certified that during their scholastic tenure, the student maintained high moral character and distinguished deportment.');
              } else {
                setCertTitle('Certificate of Academic Excellence');
                setCertBody('In recognition of outstanding scholastic achievement, ranking 1st in cohort for Academic Year 2025-2026.');
              }
            }}
          >
            <option value="CERTIFICATE">Academic Excellence Award</option>
            <option value="TRANSFER_CERTIFICATE">Transfer Certificate (TC)</option>
            <option value="BONAFIDE_CERTIFICATE">Bonafide Certificate</option>
            <option value="CHARACTER_CERTIFICATE">Character Certificate</option>
            <option value="ACHIEVEMENT_CERTIFICATE">Sports & Merit Award</option>
          </Select>

          <Select
            label="Class Cohort"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Select
            label="Student Recipient"
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setGenerationMode('single');
            }}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_number})</option>
            ))}
          </Select>

          <Input
            label="Certificate Serial Number"
            value={certNumber}
            onChange={(e) => setCertNumber(e.target.value)}
            helperText="Auto-computed from school formula"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Certificate Heading Title"
            value={certTitle}
            onChange={(e) => setCertTitle(e.target.value)}
          />
          <Input
            label="Certificate Body / Citation Text"
            value={certBody}
            onChange={(e) => setCertBody(e.target.value)}
          />
        </div>
      </div>

      {/* Viewport Toolbar */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 text-xs">
          <Badge variant={generationMode === 'bulk' ? 'purple' : 'primary'}>
            {generationMode === 'bulk' ? `Bulk Class Batch (${students.length} Certificates)` : 'Single Preview'}
          </Badge>
          {generationMode === 'bulk' && (
            <button
              onClick={() => setGenerationMode('single')}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Switch to Single Certificate Preview
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
            onClick={() => setZoomLevel(0.8)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold transition"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Scaled Sandbox Canvas (Zero Text Overlaps) */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-auto min-h-[600px] max-h-[850px] flex justify-center items-start shadow-inner">
        <div
          ref={previewContainerRef}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            width: '1123px',
            height: '794px',
            minHeight: '794px',
            maxHeight: '794px',
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
