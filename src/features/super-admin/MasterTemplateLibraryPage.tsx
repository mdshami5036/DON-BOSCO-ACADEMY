import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../services/db';
import { DocumentTemplate, DocType } from '../../types/database';
import { compileTemplateHtml } from '../../lib/template-engine';
import { printDocumentHtml } from '../../lib/pdf-generator';
import { generateQrCodeDataUri } from '../../lib/qr-generator';
import { useToast } from '../../components/common/Toast';
import {
  FileCode,
  Eye,
  Save,
  Plus,
  Copy,
  Layers,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  Code2,
  Monitor,
  LayoutTemplate,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Select, Badge, Card, Modal } from '../../components/common/UI';

export const MasterTemplateLibraryPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [activeCategory, setActiveCategory] = useState<DocType | 'ALL'>('ALL');

  // Studio View Mode: 'split' | 'preview-only' | 'code-only'
  const [viewMode, setViewMode] = useState<'split' | 'preview-only' | 'code-only'>('split');
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css'>('html');
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  // Editor Form State
  const [tmplName, setTmplName] = useState('');
  const [tmplCategory, setTmplCategory] = useState<DocType>('MARKSHEET');
  const [tmplPageSize, setTmplPageSize] = useState<string>('A4');
  const [tmplOrientation, setTmplOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');

  // Live compiled preview output
  const [compiledPreview, setCompiledPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  // New Template Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newDesignName, setNewDesignName] = useState('');
  const [newDesignCategory, setNewDesignCategory] = useState<DocType>('MARKSHEET');

  const loadTemplates = async () => {
    const list = await db.getMasterTemplates();
    setTemplates(list);
    if (list.length > 0 && !selectedTemplate) {
      handleSelectTemplate(list[0]);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSelectTemplate = (tmpl: DocumentTemplate) => {
    setSelectedTemplate(tmpl);
    setTmplName(tmpl.name);
    setTmplCategory(tmpl.category);
    setTmplPageSize(tmpl.page_size);
    setTmplOrientation(tmpl.orientation);
    setHtmlCode(tmpl.html_content);
    setCssCode(tmpl.css_content);

    // Auto-adjust default zoom for large vs small cards
    if (tmpl.category === 'ID_CARD') {
      setZoomLevel(1.0);
    } else if (tmpl.orientation === 'landscape') {
      setZoomLevel(0.75);
    } else {
      setZoomLevel(0.85);
    }
  };

  // Compile Live Preview
  useEffect(() => {
    async function updatePreview() {
      if (!htmlCode) return;

      const sampleQr = await generateQrCodeDataUri('https://educloud.io/verify/VERIFY-XAV-001-A9F');

      const sampleMarks = [
        { subject_name: 'Advanced Mathematics', max_total: 100, max_theory: 80, max_practical: 20, theory_obtained: 76, practical_obtained: 19, total_obtained: 95, grade: 'A+' },
        { subject_name: 'Physics & Chemistry Lab', max_total: 100, max_theory: 70, max_practical: 30, theory_obtained: 64, practical_obtained: 28, total_obtained: 92, grade: 'A+' },
        { subject_name: 'English Literature', max_total: 100, max_theory: 80, max_practical: 20, theory_obtained: 72, practical_obtained: 18, total_obtained: 90, grade: 'A+' },
        { subject_name: 'Computer Science & AI', max_total: 100, max_theory: 70, max_practical: 30, theory_obtained: 68, practical_obtained: 29, total_obtained: 97, grade: 'A+' },
        { subject_name: 'World History', max_total: 100, max_theory: 80, max_practical: 20, theory_obtained: 70, practical_obtained: 17, total_obtained: 87, grade: 'A' },
      ];

      const sampleSchedule = [
        { date: '15/10/2025', time: '09:00 - 12:00', subject_name: 'Advanced Mathematics', room_no: 'Exam Hall 3A' },
        { date: '17/10/2025', time: '09:00 - 12:00', subject_name: 'Physics & Chemistry Lab', room_no: 'Science Hall 1' },
        { date: '19/10/2025', time: '09:00 - 12:00', subject_name: 'English Literature', room_no: 'Exam Hall 3A' },
        { date: '22/10/2025', time: '09:00 - 12:00', subject_name: 'Computer Science & AI', room_no: 'Computer Lab 2' },
      ];

      const compiled = compileTemplateHtml(htmlCode, cssCode, {
        school_name: "St. Xavier's International School",
        school_logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
        school_address: '450 Innovation Parkway, San Francisco, CA',
        school_phone: '+1 (555) 234-5678',
        school_email: 'admin@xavier.edu',
        school_website: 'https://xavier.edu',
        principal_name: 'Dr. Arthur Pendelton',
        principal_signature: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Signature_example.svg',
        school_stamp: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Sample_Seal.svg',

        student_name: 'Alexander Hayes',
        student_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        admission_number: 'ADM-2025-001',
        roll_number: '1001',
        class_name: 'Class 10',
        section: 'A',
        academic_session: '2025-2026',
        father_name: 'Marcus Hayes',
        mother_name: 'Sarah Hayes',
        date_of_birth: '12/04/2010',
        blood_group: 'O+',
        parent_phone: '+1 (555) 987-6543',

        exam_name: 'Mid-Term Examination 2025',
        total_max_marks: 500,
        total_obtained_marks: 461,
        percentage: '92.2',
        grade: 'A+',
        result_status: 'PASS',
        rank_in_class: 1,
        remarks: 'Distinguished academic achievement with outstanding critical problem-solving skills.',

        certificate_title: 'Certificate of Academic Excellence',
        certificate_body: 'In recognition of outstanding scholastic achievement, ranking 1st in Class 10 with distinguished honors for the Academic Year 2025-2026.',
        certificate_number: '10TH/2026/1',
        issue_date: formatDDMMYYYY(new Date()),

        qr_code: sampleQr,
        verification_code: 'VERIFY-XAV-001-A9F',
        marks_list: sampleMarks,
        schedule_list: sampleSchedule,
      });

      setCompiledPreview(compiled);
    }

    const timer = setTimeout(updatePreview, 120);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode]);

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    try {
      const updated = await db.updateMasterTemplate(selectedTemplate.id, {
        name: tmplName,
        category: tmplCategory,
        page_size: tmplPageSize as any,
        orientation: tmplOrientation,
        html_content: htmlCode,
        css_content: cssCode,
        version: selectedTemplate.version + 1,
      });
      if (updated) {
        success(`Template "${tmplName}" saved as version v${updated.version}!`);
        loadTemplates();
      }
    } catch (err: any) {
      toastError(err.message || 'Error saving template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const base = templates.find((t) => t.category === newDesignCategory) || templates[0];
      const created = await db.createMasterTemplate({
        name: newDesignName,
        category: newDesignCategory,
        description: `Custom ${newDesignCategory.toLowerCase()} design`,
        html_content: base ? base.html_content : '<div><h1>{{school_name}}</h1></div>',
        css_content: base ? base.css_content : 'body { font-family: sans-serif; }',
        variables: base ? base.variables : ['school_name'],
        page_size: base ? base.page_size : 'A4',
        orientation: base ? base.orientation : 'portrait',
      });
      success(`Design "${newDesignName}" created!`);
      setIsNewModalOpen(false);
      setNewDesignName('');
      await loadTemplates();
      handleSelectTemplate(created);
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleAutoAssignAllSchools = async () => {
    try {
      const schools = await db.getSchools();
      for (let i = 0; i < schools.length; i++) {
        await db.assignUniqueTemplatesToSchool(schools[i].id, i);
      }
      success(`Assigned distinct custom templates to all ${schools.length} registered schools!`);
    } catch (err: any) {
      toastError(err.message || 'Error assigning templates');
    }
  };

  const insertVariable = (varName: string) => {
    const placeholder = `{{${varName}}}`;
    if (activeCodeTab === 'html') {
      setHtmlCode((prev) => prev + placeholder);
      success(`Inserted ${placeholder}`);
    }
  };

  const filteredTemplates = activeCategory === 'ALL'
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  // Available dynamic variables
  const variablesList = [
    'school_name', 'school_logo', 'school_address', 'school_phone', 'school_email',
    'principal_name', 'principal_signature', 'school_stamp',
    'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section',
    'academic_session', 'father_name', 'date_of_birth', 'blood_group', 'parent_phone',
    'exam_name', 'total_max_marks', 'total_obtained_marks', 'percentage', 'grade', 'result_status',
    'rank_in_class', 'remarks', 'certificate_title', 'certificate_body', 'certificate_number',
    'issue_date', 'qr_code', 'verification_code', 'marks_table', 'exam_schedule_table'
  ];

  // Document Container Sizing depending on Page Size & Orientation
  const getDocContainerStyle = () => {
    if (tmplCategory === 'ID_CARD' || tmplPageSize.includes('ID_CARD')) {
      if (tmplOrientation === 'landscape' || tmplPageSize === 'ID_CARD_LANDSCAPE') {
        return { width: '480px', height: '300px', minHeight: '300px', maxHeight: '300px' };
      }
      return { width: '320px', height: '480px', minHeight: '480px', maxHeight: '480px' };
    }
    if (tmplOrientation === 'landscape') {
      return { width: '1123px', height: '794px', minHeight: '794px', maxHeight: '794px' };
    }
    return { width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px' };
  };

  return (
    <div className="space-y-5">
      {/* Studio Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              Master Document Template Studio
              <Badge variant="purple" size="sm">20 Master Designs</Badge>
            </h1>
            <p className="text-xs text-slate-400">
              5 Unique designs per category with pure code injection & distinct per-school assignment
            </p>
          </div>
        </div>

        {/* View Mode & Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="ghost" size="sm" onClick={handleAutoAssignAllSchools} className="text-xs text-purple-300 hover:text-purple-100 border border-purple-800/60">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Re-assign Unique Designs to All Schools
          </Button>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Split Studio
            </button>
            <button
              onClick={() => setViewMode('preview-only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'preview-only' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Zen Preview
            </button>
            <button
              onClick={() => setViewMode('code-only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'code-only' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Code Only
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setIsNewModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Register New Design Via Code
          </Button>

          <Button variant="primary" size="sm" onClick={handleSaveTemplate} isLoading={isSaving} className="font-bold shadow-md shadow-indigo-600/30">
            <Save className="w-3.5 h-3.5 mr-1" /> Save Version (v{selectedTemplate ? selectedTemplate.version + 1 : 1})
          </Button>
        </div>
      </div>

      {/* Category Pills & Template Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { cat: 'ALL', label: 'All Templates', count: templates.length },
              { cat: 'MARKSHEET', label: 'Marksheets', count: templates.filter((t) => t.category === 'MARKSHEET').length },
              { cat: 'CERTIFICATE', label: 'Certificates', count: templates.filter((t) => t.category === 'CERTIFICATE').length },
              { cat: 'ADMIT_CARD', label: 'Admit Cards', count: templates.filter((t) => t.category === 'ADMIT_CARD').length },
              { cat: 'ID_CARD', label: 'ID Cards', count: templates.filter((t) => t.category === 'ID_CARD').length },
            ] as const
          ).map((item) => (
            <button
              key={item.cat}
              onClick={() => setActiveCategory(item.cat as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeCategory === item.cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{item.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === item.cat ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Active Template:</span>
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const found = templates.find((t) => t.id === e.target.value);
              if (found) handleSelectTemplate(found);
            }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 sm:w-72"
          >
            {filteredTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.category}] {t.name} (v{t.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className={`grid gap-5 ${
        viewMode === 'split'
          ? 'grid-cols-1 xl:grid-cols-12'
          : 'grid-cols-1'
      }`}>
        {/* Left Column: Code Editor & Variables Palette (6 Cols in Split Mode) */}
        {(viewMode === 'split' || viewMode === 'code-only') && (
          <div className={`${viewMode === 'split' ? 'xl:col-span-6' : 'w-full'} space-y-4`}>
            {/* Dimension & Meta Controls */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Template Display Name *"
                  value={tmplName}
                  onChange={(e) => setTmplName(e.target.value)}
                  required
                />
                <Select
                  label="Category *"
                  value={tmplCategory}
                  onChange={(e) => setTmplCategory(e.target.value as any)}
                >
                  <option value="MARKSHEET">Marksheet / Report Card</option>
                  <option value="CERTIFICATE">Official Certificate</option>
                  <option value="ADMIT_CARD">Exam Admit Card</option>
                  <option value="ID_CARD">Student & Staff ID Card</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Page Size Standard"
                  value={tmplPageSize}
                  onChange={(e) => setTmplPageSize(e.target.value)}
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="A5">A5 (148 × 210 mm)</option>
                  <option value="LETTER">US Letter (8.5 × 11 in)</option>
                  <option value="LEGAL">US Legal (8.5 × 14 in)</option>
                  <option value="ID_CARD_PORTRAIT">CR-80 ID Card Portrait (54 × 86 mm)</option>
                  <option value="ID_CARD_LANDSCAPE">CR-80 ID Card Landscape (86 × 54 mm)</option>
                  <option value="CUSTOM">Custom Sizing</option>
                </Select>

                <Select
                  label="Page Orientation"
                  value={tmplOrientation}
                  onChange={(e) => setTmplOrientation(e.target.value as any)}
                >
                  <option value="portrait">Portrait (Vertical)</option>
                  <option value="landscape">Landscape (Horizontal)</option>
                </Select>
              </div>
            </div>

            {/* Variable Insertion Palette */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Click Variable to Insert into HTML:
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Dynamic Placeholders</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-950/60 rounded-lg border border-slate-800/80">
                {variablesList.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-indigo-950/80 text-[10px] font-mono text-indigo-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer"
                  >
                    &#123;&#123;{v}&#125;&#125;
                  </button>
                ))}
              </div>
            </div>

            {/* Code Tabs & Textareas */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('html')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      activeCodeTab === 'html' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    HTML Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('css')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      activeCodeTab === 'css' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    CSS Stylesheet
                  </button>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Compiling
                </span>
              </div>

              <div className="p-3 bg-slate-950">
                {activeCodeTab === 'html' ? (
                  <textarea
                    rows={16}
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    className="w-full font-mono text-xs bg-slate-900 text-indigo-200 p-3 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y leading-relaxed"
                    placeholder="Type HTML template with {{variables}}..."
                    spellCheck={false}
                  />
                ) : (
                  <textarea
                    rows={16}
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    className="w-full font-mono text-xs bg-slate-900 text-purple-200 p-3 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-y leading-relaxed"
                    placeholder="Type CSS styles for document..."
                    spellCheck={false}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Column: High-Res Zoomable Sandboxed Live Preview Canvas (6 Cols in Split Mode) */}
        {(viewMode === 'split' || viewMode === 'preview-only') && (
          <div className={`${viewMode === 'split' ? 'xl:col-span-6' : 'w-full'} space-y-3`}>
            {/* Canvas Zoom & Control Bar */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Live Render Preview</span>
                <Badge variant="success" size="sm">Real-time Sandbox</Badge>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Presets */}
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
                <button
                  type="button"
                  onClick={() => setZoomLevel(tmplOrientation === 'landscape' ? 0.75 : 0.85)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold transition"
                >
                  Fit
                </button>
                <button
                  type="button"
                  onClick={() => printDocumentHtml(compiledPreview, tmplName)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Test Print Output"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(true)}
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
                  title="Fullscreen Inspection"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Viewport with Transformed Scaled Sheet (Zero squishing or overlapping words) */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-auto min-h-[580px] max-h-[820px] flex justify-center items-start shadow-inner">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                  ...getDocContainerStyle(),
                }}
                className="shadow-2xl rounded-md overflow-hidden shrink-0 border border-slate-700 bg-transparent"
                dangerouslySetInnerHTML={{ __html: compiledPreview }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Inspection Modal */}
      <Modal
        isOpen={isFullscreenModalOpen}
        onClose={() => setIsFullscreenModalOpen(false)}
        title={`Fullscreen Inspection: ${tmplName}`}
        maxWidth="2xl"
      >
        <div className="bg-slate-950 p-6 rounded-xl overflow-auto max-h-[80vh] flex justify-center shadow-inner">
          <div
            style={getDocContainerStyle()}
            className="shadow-2xl rounded-md overflow-hidden border border-slate-700 bg-transparent"
            dangerouslySetInnerHTML={{ __html: compiledPreview }}
          />
        </div>
      </Modal>

      {/* New Template Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Master Document Design"
      >
        <form onSubmit={handleCreateNewDesign} className="space-y-4">
          <Input
            label="Design Template Title *"
            placeholder="e.g. CBSE Modern Term Marksheet"
            value={newDesignName}
            onChange={(e) => setNewDesignName(e.target.value)}
            required
          />

          <Select
            label="Document Category *"
            value={newDesignCategory}
            onChange={(e) => setNewDesignCategory(e.target.value as any)}
          >
            <option value="MARKSHEET">Marksheet / Report Card</option>
            <option value="CERTIFICATE">Official Certificate</option>
            <option value="ADMIT_CARD">Exam Admit Card</option>
            <option value="ID_CARD">Student & Staff ID Card</option>
          </Select>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Initialize Design
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
