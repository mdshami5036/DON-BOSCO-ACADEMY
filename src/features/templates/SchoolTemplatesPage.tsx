import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { SchoolTemplate, DocumentTemplate, DocType } from '../../types/database';
import { compileTemplateHtml } from '../../lib/template-engine';
import { printDocumentHtml } from '../../lib/pdf-generator';
import { generateQrCodeDataUri } from '../../lib/qr-generator';
import { normalizeImageUrl } from '../../lib/image-helper';
import { useToast } from '../../components/common/Toast';
import {
  Layers,
  FileCode,
  CheckCircle2,
  Eye,
  Sparkles,
  Save,
  RotateCcw,
  Palette,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Shield,
} from 'lucide-react';
import { Button, Input, Select, Badge, Card, Modal } from '../../components/common/UI';

export const SchoolTemplatesPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeCategory, setActiveCategory] = useState<DocType>('MARKSHEET');
  const [masterTemplates, setMasterTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [isCustomized, setIsCustomized] = useState(false);

  // Template HTML/CSS state for this school
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css'>('html');
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  // Quick Branding Overrides
  const [customMotto, setCustomMotto] = useState('Excellence in Education');
  const [customWatermark, setCustomWatermark] = useState('');
  const [accentColor, setAccentColor] = useState('#4f46e5');

  // Compiled Live Preview
  const [compiledPreview, setCompiledPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!currentSchool) return;
    setIsLoading(true);
    try {
      const allMasters = await db.getMasterTemplates();
      setMasterTemplates(allMasters);

      // Load effective template for active category
      await loadCategoryTemplate(activeCategory, allMasters);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoryTemplate = async (cat: DocType, masters: DocumentTemplate[]) => {
    if (!currentSchool) return;
    const effective = await db.getEffectiveTemplate(currentSchool.id, cat);
    setSelectedMasterId(effective.template_id);
    setHtmlCode(effective.html_content);
    setCssCode(effective.css_content);
    setIsCustomized(effective.is_customized);

    if (cat === 'ID_CARD') setZoomLevel(1.0);
    else if (effective.orientation === 'landscape') setZoomLevel(0.75);
    else setZoomLevel(0.85);
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  const handleCategoryChange = async (cat: DocType) => {
    setActiveCategory(cat);
    await loadCategoryTemplate(cat, masterTemplates);
  };

  const handleSwitchMasterBase = (masterId: string) => {
    const found = masterTemplates.find((t) => t.id === masterId);
    if (!found) return;
    setSelectedMasterId(found.id);
    setHtmlCode(found.html_content);
    setCssCode(found.css_content);
    setIsCustomized(false);
    success(`Loaded base design "${found.name}" for your school`);
  };

  // Compile Live Preview using School's actual profile details
  useEffect(() => {
    async function updatePreview() {
      if (!currentSchool || !htmlCode) return;

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
        school_name: currentSchool.name,
        school_logo: currentSchool.logo_url,
        school_address: currentSchool.address,
        school_phone: currentSchool.phone,
        school_email: currentSchool.email,
        school_website: currentSchool.website,
        principal_name: currentSchool.principal_name,
        principal_signature: currentSchool.principal_signature_url,
        school_stamp: currentSchool.stamp_url,

        student_name: 'Alexander Hayes',
        student_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        admission_number: 'ADM-2025-001',
        roll_number: '1001',
        class_name: 'Class 10',
        section: 'A',
        academic_session: '2025-2026',
        father_name: 'Marcus Hayes',
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
        remarks: 'Distinguished academic achievement and exemplary analytical acumen.',

        certificate_title: 'Certificate of Academic Excellence',
        certificate_body: `In recognition of outstanding scholastic achievement at ${currentSchool.name} for the Academic Year 2025-2026.`,
        certificate_number: '10TH/2026/1',
        issue_date: new Date().toLocaleDateString('en-GB'),

        qr_code: sampleQr,
        verification_code: 'VERIFY-XAV-001-A9F',
        marks_list: sampleMarks,
        schedule_list: sampleSchedule,
      });

      setCompiledPreview(compiled);
    }

    const timer = setTimeout(updatePreview, 100);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, currentSchool]);

  // Save customized template specifically for this school
  const handleSaveCustomizedTemplate = async () => {
    if (!currentSchool) return;
    setIsSaving(true);
    try {
      await db.customizeSchoolTemplate(currentSchool.id, activeCategory, {
        template_id: selectedMasterId,
        custom_html: htmlCode,
        custom_css: cssCode,
        custom_config: {
          motto: customMotto,
          watermark: customWatermark,
          accent_color: accentColor,
        },
      });

      setIsCustomized(true);
      success(`Saved custom ${activeCategory.replace('_', ' ')} design specifically for ${currentSchool.name}!`);
    } catch (err: any) {
      toastError(err.message || 'Error saving custom template');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to master template defaults
  const handleResetToDefaults = () => {
    const base = masterTemplates.find((t) => t.id === selectedMasterId) ||
      masterTemplates.find((t) => t.category === activeCategory);
    if (!base) return;

    if (!window.confirm('Reset this document to the original master layout? Your custom edits will be reverted.')) return;

    setHtmlCode(base.html_content);
    setCssCode(base.css_content);
    setIsCustomized(false);
    success('Reverted to original master design');
  };

  const availableInCat = masterTemplates.filter((t) => t.category === activeCategory);

  const getDocContainerStyle = () => {
    if (activeCategory === 'ID_CARD') {
      return { width: '320px', height: '480px', minHeight: '480px', maxHeight: '480px' };
    }
    if (activeCategory === 'CERTIFICATE') {
      return { width: '1123px', height: '794px', minHeight: '794px', maxHeight: '794px' };
    }
    return { width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            School Document Design Studio
            <Badge variant="purple" size="sm">Tenant Isolated</Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize official Marksheets, Certificates, Admit Cards, and ID Cards specifically for <strong>{currentSchool?.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isCustomized && (
            <Button variant="ghost" size="sm" onClick={handleResetToDefaults}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset to Master Design
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={handleSaveCustomizedTemplate} isLoading={isSaving} className="font-bold shadow-md shadow-indigo-600/30">
            <Save className="w-3.5 h-3.5 mr-1.5" /> Save Template for My School
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(
          [
            { type: 'MARKSHEET', label: '1. Marksheet / Report Card' },
            { type: 'CERTIFICATE', label: '2. Official Certificate' },
            { type: 'ADMIT_CARD', label: '3. Exam Admit Card' },
            { type: 'ID_CARD', label: '4. Student & Staff ID Card' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.type}
            onClick={() => handleCategoryChange(tab.type)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeCategory === tab.type
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Studio 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Master Selector, Customizer & Code Editor (5 Cols) */}
        <div className="xl:col-span-5 space-y-4">
          <Card title="Base Design Selection & Branding">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Choose Base Master Template:
                </label>
                <select
                  value={selectedMasterId}
                  onChange={(e) => handleSwitchMasterBase(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
                >
                  {availableInCat.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>
                  ))}
                </select>
              </div>

              {isCustomized ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your school has a customized active design for this category.</span>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500">
                  Using default master design. Edit the HTML/CSS below to create your school's unique branded look.
                </div>
              )}
            </div>
          </Card>

          {/* Code Editor */}
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
                  School HTML Template
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('css')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                    activeCodeTab === 'css' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  School CSS Stylesheet
                </button>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Rendering
              </span>
            </div>

            <div className="p-3 bg-slate-950">
              {activeCodeTab === 'html' ? (
                <textarea
                  rows={14}
                  value={htmlCode}
                  onChange={(e) => {
                    setHtmlCode(e.target.value);
                    setIsCustomized(true);
                  }}
                  className="w-full font-mono text-xs bg-slate-900 text-indigo-200 p-3 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y leading-relaxed"
                  spellCheck={false}
                />
              ) : (
                <textarea
                  rows={14}
                  value={cssCode}
                  onChange={(e) => {
                    setCssCode(e.target.value);
                    setIsCustomized(true);
                  }}
                  className="w-full font-mono text-xs bg-slate-900 text-purple-200 p-3 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-y leading-relaxed"
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Scaled Preview for this School (7 Cols) */}
        <div className="xl:col-span-7 space-y-3">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between shadow-md text-white">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold">Your School's Live Output: {currentSchool?.name}</span>
            </div>

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
              <button
                type="button"
                onClick={() => printDocumentHtml(compiledPreview, `${currentSchool?.name} Template`)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Print Preview"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scaled Sandbox Canvas (Zero Text Overlaps) */}
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
      </div>
    </div>
  );
};
