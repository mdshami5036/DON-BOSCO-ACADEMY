import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { parseCsvOrExcelFile, exportToCsv } from '../../lib/export-utils';
import { useToast } from '../../components/common/Toast';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  RotateCcw,
  Users,
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/common/UI';
import confetti from 'canvas-confetti';

interface ParsedRow {
  index: number;
  data: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

export const BulkStudentImportPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{ imported: number; failed: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setIsProcessing(true);
    setImportSummary(null);

    try {
      const { data, errors } = await parseCsvOrExcelFile(uploaded);
      if (data.length === 0) {
        toastError('The uploaded file contains no data rows.');
        setIsProcessing(false);
        return;
      }

      const detectedCols = Object.keys(data[0] || {});
      setColumns(detectedCols);

      // Validate each row
      const validated: ParsedRow[] = data.map((row, idx) => {
        const rowErrors: string[] = [];
        const firstName = row.first_name || row['First Name'] || row['firstname'];
        const lastName = row.last_name || row['Last Name'] || row['lastname'];

        if (!firstName) rowErrors.push('Missing First Name');
        if (!lastName) rowErrors.push('Missing Last Name');

        return {
          index: idx + 1,
          data: row,
          isValid: rowErrors.length === 0,
          errors: rowErrors,
        };
      });

      setParsedRows(validated);
      success(`Parsed ${validated.length} student records`);
    } catch (err: any) {
      toastError(err.message || 'Failed to parse file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!currentSchool || parsedRows.length === 0) return;
    setIsProcessing(true);

    const validData = parsedRows.filter((r) => r.isValid).map((r) => r.data);
    try {
      const res = await db.bulkImportStudents(currentSchool.id, validData);
      setImportSummary({
        imported: res.imported,
        failed: parsedRows.length - res.imported,
      });

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      success(`Successfully imported ${res.imported} students!`);
    } catch (err: any) {
      toastError(err.message || 'Import error');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleCsv = () => {
    const sample = [
      {
        'First Name': 'Liam',
        'Middle Name': 'Robert',
        'Last Name': 'Johnson',
        'Admission Number': 'ADM-2025-101',
        'Roll Number': '101',
        'Gender': 'Male',
        'DOB': '2010-05-12',
        "Father's Name": 'Robert Johnson',
        "Mother's Name": 'Sarah Johnson',
        'Parent Phone': '+1 555 234 5678',
        'Email': 'robert.j@example.com',
        'Address': '742 Maple Street, San Francisco',
      },
      {
        'First Name': 'Emma',
        'Middle Name': 'Rose',
        'Last Name': 'Watson',
        'Admission Number': 'ADM-2025-102',
        'Roll Number': '102',
        'Gender': 'Female',
        'DOB': '2010-09-21',
        "Father's Name": 'Chris Watson',
        "Mother's Name": 'Helen Watson',
        'Parent Phone': '+1 555 345 6789',
        'Email': 'watson.family@example.com',
        'Address': '124 Ocean Avenue, San Francisco',
      },
    ];
    exportToCsv(sample, 'student_bulk_import_sample.csv');
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Bulk Student CSV / Excel Importer</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Seamlessly onboard hundreds of students with real-time validation and error prevention
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={downloadSampleCsv}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download Sample CSV
          </Button>
          <Link to="/school/students">
            <Button variant="ghost" size="sm">
              <Users className="w-3.5 h-3.5 mr-1.5" /> View Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* Upload Zone */}
      {!file && (
        <Card className="p-10 text-center border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
            Choose CSV or Excel Spreadsheet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Supports CSV, XLSX, and XLS files. Required headers: First Name, Last Name, Admission No.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            className="font-bold"
          >
            Select Spreadsheet File
          </Button>
        </Card>
      )}

      {/* Summary Banner after import */}
      {importSummary && (
        <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-400 text-base">Import Complete</h4>
              <p className="text-xs text-emerald-200/80">
                Successfully enrolled <strong>{importSummary.imported}</strong> students into {currentSchool?.name}.
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={() => navigate('/school/students')} className="bg-emerald-600 hover:bg-emerald-700">
            Open Student Directory <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Parsed Preview Table */}
      {parsedRows.length > 0 && !importSummary && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                {file?.name}
              </div>
              <Badge variant="success">{validCount} Valid Rows</Badge>
              {invalidCount > 0 && <Badge variant="danger">{invalidCount} Invalid Rows</Badge>}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setParsedRows([]);
                }}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Re-upload
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                disabled={validCount === 0}
                onClick={handleExecuteImport}
                className="font-bold"
              >
                Import {validCount} Valid Students
              </Button>
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">Row</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">First Name</th>
                    <th className="px-4 py-3">Last Name</th>
                    <th className="px-4 py-3">Adm No</th>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Parent Phone</th>
                    <th className="px-4 py-3">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.map((r) => (
                    <tr
                      key={r.index}
                      className={r.isValid ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-rose-50/50 dark:bg-rose-950/20'}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-400">{r.index}</td>
                      <td className="px-4 py-3">
                        {r.isValid ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Error
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {r.data.first_name || r.data['First Name'] || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {r.data.last_name || r.data['Last Name'] || '-'}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {r.data.admission_number || r.data['Admission Number'] || 'Auto'}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {r.data.roll_number || r.data['Roll Number'] || '-'}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {r.data.parent_phone || r.data['Parent Phone'] || r.data['Phone'] || '-'}
                      </td>
                      <td className="px-4 py-3 text-rose-600 text-[11px]">
                        {r.errors.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
