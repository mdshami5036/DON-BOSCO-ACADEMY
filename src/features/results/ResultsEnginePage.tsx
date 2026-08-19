import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Exam, ClassRoom, ExamResult } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import {
  Award,
  Sparkles,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Trophy,
} from 'lucide-react';
import { Button, Select, Badge, Card, StatCard } from '../../components/common/UI';
import { exportToCsv } from '../../lib/export-utils';
import confetti from 'canvas-confetti';

export const ResultsEnginePage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadInitial = async () => {
    if (!currentSchool) return;
    setIsLoading(true);
    try {
      const [eList, cList] = await Promise.all([
        db.getExams(currentSchool.id),
        db.getClasses(currentSchool.id),
      ]);
      setExams(eList);
      setClasses(cList);
      if (eList.length > 0) setSelectedExamId(eList[0].id);
      if (cList.length > 0) setSelectedClassId(cList[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, [currentSchool]);

  const loadResults = async () => {
    if (!currentSchool || !selectedExamId || !selectedClassId) return;
    setIsLoading(true);
    try {
      const rList = await db.getResults(currentSchool.id, selectedExamId, selectedClassId);
      setResults(rList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [currentSchool, selectedExamId, selectedClassId]);

  const handleComputeResults = async () => {
    if (!currentSchool || !selectedExamId || !selectedClassId) return;
    setIsCalculating(true);
    try {
      const computed = await db.calculateResults(currentSchool.id, selectedExamId, selectedClassId);
      setResults(computed);
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      success(`Calculated grades, percentages & ranks for ${computed.length} students`);
    } catch (err: any) {
      toastError(err.message || 'Error computing results');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExport = () => {
    const exportData = results.map((r) => ({
      Rank: r.rank_in_class,
      Student_Name: r.student?.first_name + ' ' + r.student?.last_name,
      Roll_No: r.student?.roll_number,
      Admission_No: r.student?.admission_number,
      Total_Max: r.total_max_marks,
      Total_Obtained: r.total_obtained_marks,
      Percentage: `${r.percentage}%`,
      Grade: r.grade,
      Status: r.result_status,
      Remarks: r.remarks,
    }));
    exportToCsv(exportData, `results-${selectedExamId}.csv`);
  };

  const passedCount = results.filter((r) => r.result_status === 'PASS').length;
  const passPercentage = results.length > 0 ? ((passedCount / results.length) * 100).toFixed(1) : '100';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Automated Results & Grading Engine</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregate student subject marks, compute GPA & grading scales, assign class ranks, and publish reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          {results.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export Result Sheet
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={handleComputeResults} isLoading={isCalculating} className="font-bold shadow-sm">
            <Calculator className="w-4 h-4 mr-1.5" /> Compute Results & Ranks
          </Button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Exam</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
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
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Class Topper Score" value={results.length > 0 ? `${results[0].percentage}%` : 'N/A'} icon={Trophy} color="amber" />
        <StatCard title="Evaluated Students" value={results.length} icon={Award} color="indigo" />
        <StatCard title="Pass Rate" value={`${passPercentage}%`} icon={CheckCircle2} color="emerald" />
        <StatCard title="Grading System" value="Standard 7-Point" icon={Calculator} color="purple" />
      </div>

      {/* Result Sheet Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Roll No</th>
                <th className="px-4 py-3.5">Total Marks</th>
                <th className="px-4 py-3.5">Percentage</th>
                <th className="px-4 py-3.5">Grade</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5">Teacher's Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.length > 0 ? (
                results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        res.rank_in_class === 1
                          ? 'bg-amber-100 text-amber-800 font-extrabold border border-amber-300'
                          : res.rank_in_class === 2
                          ? 'bg-slate-200 text-slate-800'
                          : res.rank_in_class === 3
                          ? 'bg-amber-900/20 text-amber-700'
                          : 'text-slate-400'
                      }`}>
                        {res.rank_in_class}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {res.student?.first_name} {res.student?.last_name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {res.student?.roll_number}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {res.total_obtained_marks} / {res.total_max_marks}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                      {res.percentage}%
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">{res.grade}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={res.result_status === 'PASS' ? 'success' : 'danger'}>
                        {res.result_status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 italic">
                      {res.remarks || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-xs text-slate-400">
                    No results calculated for this exam yet. Click "Compute Results & Ranks" to calculate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
