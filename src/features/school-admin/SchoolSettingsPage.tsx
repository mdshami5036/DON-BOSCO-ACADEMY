import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { SchoolSettings, GradeScale, NumberingPatterns } from '../../types/database';
import { generateDocumentNumber } from '../../lib/template-engine';
import { useToast } from '../../components/common/Toast';
import { Settings, Save, Plus, Trash2, Sliders, DollarSign, Calendar, Hash, Sparkles } from 'lucide-react';
import { Button, Input, Select, Card, Badge } from '../../components/common/UI';

export const SchoolSettingsPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [currency, setCurrency] = useState('$');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timezone, setTimezone] = useState('America/New_York');
  const [themeColor, setThemeColor] = useState('#4f46e5');
  const [grades, setGrades] = useState<GradeScale[]>([]);
  const [numberingPatterns, setNumberingPatterns] = useState<NumberingPatterns>({
    marksheet_pattern: '{CLASS}/{YEAR}/MS-{SEQ}',
    certificate_pattern: '{CLASS}/{YEAR}/{SEQ}',
    admit_card_pattern: 'AC/{CLASS}/{YEAR}/{SEQ}',
    id_card_pattern: 'ID/{YEAR}/{ROLL}',
    current_sequence: 1,
  });
  const [defaultCertBody, setDefaultCertBody] = useState(
    'In recognition of outstanding scholastic achievement, ranking 1st in Class with distinguished merit in the Academic Year 2025-2026.'
  );
  const [defaultMarksheetRemarks, setDefaultMarksheetRemarks] = useState(
    'Outstanding performance. Promoted to next higher class with distinction.'
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!currentSchool) return;
      setIsLoading(true);
      try {
        const s = await db.getSchoolSettings(currentSchool.id);
        setSettings(s);
        setCurrency(s.currency_symbol);
        setDateFormat(s.date_format);
        setTimezone(s.timezone);
        setThemeColor(s.theme_color);
        setGrades(s.grading_system);
        if (s.numbering_patterns) {
          setNumberingPatterns(s.numbering_patterns);
        }
        if (s.default_certificate_body) setDefaultCertBody(s.default_certificate_body);
        if (s.default_marksheet_remarks) setDefaultMarksheetRemarks(s.default_marksheet_remarks);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [currentSchool]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    try {
      await db.updateSchoolSettings(currentSchool.id, {
        currency_symbol: currency,
        date_format: dateFormat,
        timezone,
        theme_color: themeColor,
        grading_system: grades,
        numbering_patterns: numberingPatterns,
        default_certificate_body: defaultCertBody,
        default_marksheet_remarks: defaultMarksheetRemarks,
      });
      success('School settings & document numbering formulas updated!');
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleAddGrade = () => {
    setGrades((prev) => [
      ...prev,
      { grade: 'New', min_percentage: 0, max_percentage: 100, gpa: 3.0, description: 'Pass' },
    ]);
  };

  const handleRemoveGrade = (idx: number) => {
    setGrades((prev) => prev.filter((_, i) => i !== idx));
  };

  // Compute live sample previews
  const certSample = generateDocumentNumber(
    numberingPatterns.certificate_pattern,
    { class_name: 'LKG', year: 2026, school_name: currentSchool?.name },
    numberingPatterns.current_sequence
  );

  const msSample = generateDocumentNumber(
    numberingPatterns.marksheet_pattern,
    { class_name: '10TH', year: 2026, school_name: currentSchool?.name },
    numberingPatterns.current_sequence
  );

  const acSample = generateDocumentNumber(
    numberingPatterns.admit_card_pattern,
    { class_name: '10TH', year: 2026, school_name: currentSchool?.name },
    numberingPatterns.current_sequence
  );

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Institutional Settings & Document Formulas</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure certificate numbering schemes, academic grade thresholds, international currencies, and branding
          </p>
        </div>

        <Button type="submit" variant="primary" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Save Configuration
        </Button>
      </div>

      {/* Document Numbering Pattern Builder */}
      <Card
        title="Official Document Numbering Formulas"
        subtitle="Define how your certificates, marksheets, admit cards, and ID cards are automatically serialized"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs space-y-2">
            <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Supported Dynamic Formula Tokens:
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <code className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 font-bold text-indigo-600 border border-indigo-200">&#123;CLASS&#125;</code> (e.g. LKG, 10TH)
              <code className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 font-bold text-indigo-600 border border-indigo-200">&#123;YEAR&#125;</code> (e.g. 2026)
              <code className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 font-bold text-indigo-600 border border-indigo-200">&#123;SEQ&#125;</code> (e.g. 1, 2, 3)
              <code className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 font-bold text-indigo-600 border border-indigo-200">&#123;SEQ:3&#125;</code> (zero-padded e.g. 001, 002)
              <code className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 font-bold text-indigo-600 border border-indigo-200">&#123;SCHOOL_CODE&#125;</code> (e.g. XAV, DPS)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Certificate Number Formula *"
                placeholder="{CLASS}/{YEAR}/{SEQ}"
                value={numberingPatterns.certificate_pattern}
                onChange={(e) =>
                  setNumberingPatterns({ ...numberingPatterns, certificate_pattern: e.target.value })
                }
                helperText={`Live Output Preview: ${certSample}`}
                required
              />
            </div>

            <div>
              <Input
                label="Marksheet Number Formula *"
                placeholder="{CLASS}/{YEAR}/MS-{SEQ}"
                value={numberingPatterns.marksheet_pattern}
                onChange={(e) =>
                  setNumberingPatterns({ ...numberingPatterns, marksheet_pattern: e.target.value })
                }
                helperText={`Live Output Preview: ${msSample}`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Admit Card Number Formula *"
                placeholder="AC/{CLASS}/{YEAR}/{SEQ}"
                value={numberingPatterns.admit_card_pattern}
                onChange={(e) =>
                  setNumberingPatterns({ ...numberingPatterns, admit_card_pattern: e.target.value })
                }
                helperText={`Live Preview: ${acSample}`}
                required
              />
            </div>

            <div>
              <Input
                label="ID Card Number Formula *"
                placeholder="ID/{YEAR}/{ROLL}"
                value={numberingPatterns.id_card_pattern}
                onChange={(e) =>
                  setNumberingPatterns({ ...numberingPatterns, id_card_pattern: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Input
                label="Current Sequence Counter"
                type="number"
                min={1}
                value={numberingPatterns.current_sequence}
                onChange={(e) =>
                  setNumberingPatterns({ ...numberingPatterns, current_sequence: Number(e.target.value) })
                }
                helperText="Next generated document will use this sequence number"
                required
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Default Certificate Citation Body & Marksheet Remarks */}
      <Card
        title="Default Certificate Citation & Marksheet Remarks"
        subtitle="Admin sets the default body text printed on every certificate. Each student's name and details are auto-filled."
      >
        <div className="space-y-5">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Template Variables You Can Use in Body Text:
            </div>
            <p>
              <code className="bg-white dark:bg-slate-900 px-1.5 rounded font-mono text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">{'{student_name}'}</code>,{' '}
              <code className="bg-white dark:bg-slate-900 px-1.5 rounded font-mono text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">{'{class_name}'}</code>,{' '}
              <code className="bg-white dark:bg-slate-900 px-1.5 rounded font-mono text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">{'{academic_session}'}</code>,{' '}
              <code className="bg-white dark:bg-slate-900 px-1.5 rounded font-mono text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">{'{rank}'}</code>
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Default Certificate Body / Citation Text *
            </label>
            <textarea
              rows={4}
              className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              value={defaultCertBody}
              onChange={(e) => setDefaultCertBody(e.target.value)}
              placeholder="e.g. In recognition of outstanding scholastic achievement, ranking 1st in {class_name} with distinguished merit in the Academic Year {academic_session}."
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              This text auto-fills in the Certificate Generator. The teacher can edit it per student before printing.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Default Marksheet Teacher Remarks *
            </label>
            <textarea
              rows={2}
              className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              value={defaultMarksheetRemarks}
              onChange={(e) => setDefaultMarksheetRemarks(e.target.value)}
              placeholder="e.g. Excellent performance. Promoted to next class with distinction."
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Default remarks printed on marksheets (can be overridden per student at the time of generation).
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional & System (1 col) */}
        <Card title="Regional & Display Formats">
          <div className="space-y-4">
            <Select
              label="Currency Symbol"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="$">USD ($)</option>
              <option value="₹">INR (₹)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="C$">CAD (C$)</option>
              <option value="A$">AUD (A$)</option>
            </Select>

            <Select
              label="Date Display Format"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 15/10/2025)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/15/2025)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2025-10-15)</option>
            </Select>

            <Input
              label="System Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-600">{themeColor}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Grading Scale Engine (2 cols) */}
        <div className="lg:col-span-2">
          <Card
            title="Academic Grading Scale Rules"
            subtitle="Configurable percentage brackets and GPA values used by the automated marksheet engine"
            action={
              <Button type="button" size="sm" variant="outline" onClick={handleAddGrade}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Grade Bracket
              </Button>
            }
          >
            <div className="space-y-3">
              {grades.map((g, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Grade</label>
                    <input
                      type="text"
                      value={g.grade}
                      onChange={(e) => {
                        const updated = [...grades];
                        updated[idx].grade = e.target.value;
                        setGrades(updated);
                      }}
                      className="w-full text-xs font-bold p-1.5 bg-white dark:bg-slate-800 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Min %</label>
                    <input
                      type="number"
                      value={g.min_percentage}
                      onChange={(e) => {
                        const updated = [...grades];
                        updated[idx].min_percentage = Number(e.target.value);
                        setGrades(updated);
                      }}
                      className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Max %</label>
                    <input
                      type="number"
                      value={g.max_percentage}
                      onChange={(e) => {
                        const updated = [...grades];
                        updated[idx].max_percentage = Number(e.target.value);
                        setGrades(updated);
                      }}
                      className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">GPA Point</label>
                    <input
                      type="number"
                      step="0.1"
                      value={g.gpa}
                      onChange={(e) => {
                        const updated = [...grades];
                        updated[idx].gpa = Number(e.target.value);
                        setGrades(updated);
                      }}
                      className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4 sm:pt-0">
                    <input
                      type="text"
                      placeholder="Remarks"
                      value={g.description}
                      onChange={(e) => {
                        const updated = [...grades];
                        updated[idx].description = e.target.value;
                        setGrades(updated);
                      }}
                      className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGrade(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
};
