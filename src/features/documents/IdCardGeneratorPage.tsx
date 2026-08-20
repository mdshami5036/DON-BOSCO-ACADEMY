import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Student, DocumentTemplate, ClassRoom } from '../../types/database';
import { compileTemplateHtml, generateDocumentNumber } from '../../lib/template-engine';
import { exportElementToPdf, printDocumentHtml } from '../../lib/pdf-generator';
import { generateQrCodeDataUri } from '../../lib/qr-generator';
import { useToast } from '../../components/common/Toast';
import { Users, Printer, Download, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { Button, Select, Badge, Card } from '../../components/common/UI';

export const IdCardGeneratorPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Mode: single or bulk
  const [generationMode, setGenerationMode] = useState<'single' | 'bulk'>('single');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const [compiledHtml, setCompiledHtml] = useState('');
  const [bulkCompiledHtml, setBulkCompiledHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      if (!currentSchool) return;
      const [cList, sList, tList, effective] = await Promise.all([
        db.getClasses(currentSchool.id),
        db.getStudents(currentSchool.id),
        db.getMasterTemplates(),
        db.getEffectiveTemplate(currentSchool.id, 'ID_CARD'),
      ]);
      setClasses(cList);
      setStudents(sList);
      if (cList.length > 0) setSelectedClassId(cList[0].id);
      if (sList.length > 0) setSelectedStudentId(sList[0].id);

      const idTmpls = tList.filter((t) => t.category === 'ID_CARD');
      setTemplates(idTmpls);

      const matched = idTmpls.find((t) => t.id === effective.template_id) || idTmpls[0];
      if (matched) {
        setSelectedTemplate({
          ...matched,
          html_content: effective.html_content,
          css_content: effective.css_content,
          name: effective.name,
        });
      }
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

  useEffect(() => {
    async function compileSingle() {
      if (!currentSchool || !selectedTemplate || !selectedStudentId) return;
      const student = students.find((s) => s.id === selectedStudentId);
      if (!student) return;

      const vCode = `VERIFY-ID-${student.admission_number.replace(/[^0-9]/g, '') || '5501'}`;
      const qrDataUrl = await generateQrCodeDataUri(`${window.location.origin}/verify?id=${vCode}`);

      const compiled = compileTemplateHtml(selectedTemplate.html_content, selectedTemplate.css_content, {
        school_name: currentSchool.name,
        school_logo: currentSchool.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
        school_phone: currentSchool.phone,
        principal_signature: currentSchool.principal_signature_url,

        student_name: `${student.first_name} ${student.last_name}`,
        student_photo: student.photo_url,
        admission_number: student.admission_number,
        roll_number: student.roll_number,
        class_name: student.class_name || 'Class 10',
        section: student.section_name || 'A',
        blood_group: student.blood_group || 'O+',
        parent_phone: student.parent_phone,
        date_of_birth: student.date_of_birth,

        qr_code: qrDataUrl,
        verification_code: vCode,
      });

      setCompiledHtml(compiled);
    }
    compileSingle();
  }, [currentSchool, selectedTemplate, selectedStudentId, students]);

  const handleBulkGenerateIdCards = async () => {
    if (!currentSchool || !selectedTemplate || students.length === 0) return;
    setIsBulkGenerating(true);
    try {
      const renderedCards: string[] = [];

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const vCode = `VERIFY-ID-${student.admission_number.replace(/[^0-9]/g, '') || String(i + 1)}`;
        const qrDataUrl = await generateQrCodeDataUri(`${window.location.origin}/verify?id=${vCode}`);

        const singleHtml = compileTemplateHtml(selectedTemplate.html_content, selectedTemplate.css_content, {
          school_name: currentSchool.name,
          school_logo: currentSchool.logo_url,
          school_phone: currentSchool.phone,
          principal_signature: currentSchool.principal_signature_url,

          student_name: `${student.first_name} ${student.last_name}`,
          student_photo: student.photo_url,
          admission_number: student.admission_number,
          roll_number: student.roll_number,
          class_name: student.class_name,
          section: student.section_name || 'A',
          blood_group: student.blood_group || 'O+',
          parent_phone: student.parent_phone,
          date_of_birth: student.date_of_birth,

          qr_code: qrDataUrl,
          verification_code: vCode,
        });

        renderedCards.push(`
          <div style="display: inline-block; margin: 15px; vertical-align: top;">
            ${singleHtml}
          </div>
        `);
      }

      setBulkCompiledHtml(`
        <div style="display: flex; flex-wrap: wrap; justify-content: center; padding: 20px;">
          ${renderedCards.join('')}
        </div>
      `);
      setGenerationMode('bulk');
      success(`Generated ID cards for all ${students.length} students!`);
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
        ? `Class-${classes.find((c) => c.id === selectedClassId)?.name || 'Class'}-ID-Cards.pdf`
        : `IDCard-${student?.admission_number}.pdf`;

      await exportElementToPdf(previewContainerRef.current, filename, 'portrait', 'a4');
      success('Student ID Card exported as PDF!');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Student & Staff Identity Cards Studio</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Produce official CR-80 portrait student ID cards with student photos, QR security seals, and emergency contact details
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleBulkGenerateIdCards} isLoading={isBulkGenerating}>
            <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Bulk Generate Class Cards ({students.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => printDocumentHtml(generationMode === 'bulk' ? bulkCompiledHtml : compiledHtml, 'ID Cards')}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Preview
          </Button>

          <Button variant="primary" size="sm" onClick={handleDownload} isLoading={isGenerating} className="font-bold">
            <Download className="w-4 h-4 mr-1.5" /> Download ID Card PDF
          </Button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none font-semibold text-indigo-600"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_number})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">ID Card Style</label>
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
            {generationMode === 'bulk' ? `Bulk Batch (${students.length} ID Cards)` : 'Single Card Preview'}
          </Badge>
          {generationMode === 'bulk' && (
            <button
              onClick={() => setGenerationMode('single')}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Switch to Single Card Preview
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

      {/* Scaled Sandbox Viewport */}
      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex justify-center items-start min-h-[560px] overflow-auto shadow-inner">
        <div
          ref={previewContainerRef}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="bg-transparent"
          dangerouslySetInnerHTML={{ __html: generationMode === 'bulk' ? bulkCompiledHtml : compiledHtml }}
        />
      </div>
    </div>
  );
};
