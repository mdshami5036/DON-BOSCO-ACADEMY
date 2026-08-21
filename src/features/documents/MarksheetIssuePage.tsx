import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Exam, ClassRoom, Student } from '../../types/database';
import { FixedOfficialMarksheet, MarksheetData, MarksheetSubjectRow } from './FixedOfficialMarksheet';
import { useToast } from '../../components/common/Toast';
import {
  FileSpreadsheet,
  Search,
  Printer,
  Download,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Eye,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Modal } from '../../components/common/UI';

const DEFAULT_SUBJECTS = [
  { subject_name: 'English Language & Literature (184)', full_marks: 100, pass_marks: 33, theory_marks: 80, practical_marks: null },
  { subject_name: 'Mathematics (Standard / Basic) (041)', full_marks: 100, pass_marks: 33, theory_marks: 80, practical_marks: null },
  { subject_name: 'Science (Physics, Chem, Bio) (086)', full_marks: 100, pass_marks: 33, theory_marks: 80, practical_marks: 18 },
  { subject_name: 'Social Science (087)', full_marks: 100, pass_marks: 33, theory_marks: 80, practical_marks: null },
  { subject_name: 'Hindi Course-A (002)', full_marks: 100, pass_marks: 33, theory_marks: 80, practical_marks: null },
  { subject_name: 'Computer Applications & AI (165/417)', full_marks: 100, pass_marks: 33, theory_marks: 80, practical_marks: null },
];

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

function calculateDivision(percentage: number, result: string): string {
  if (result === 'FAIL') return 'Failed';
  if (percentage >= 75) return '1st Div (Distinction)';
  if (percentage >= 60) return '1st Division';
  if (percentage >= 45) return '2nd Division';
  if (percentage >= 33) return '3rd Division';
  return 'Passed';
}

export const MarksheetIssuePage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Lists from DB
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);

  // Step 1: Exam & Session State
  const [academicSession, setAcademicSession] = useState('2025-2026');
  const [selectedExamName, setSelectedExamName] = useState('CBSE Annual Board Examination 2026');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  // Step 2: Student Details State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentName, setStudentName] = useState('Aman Singh');
  const [fatherName, setFatherName] = useState('Rajesh Singh');
  const [motherName, setMotherName] = useState('Sunita Devi');
  const [admissionNo, setAdmissionNo] = useState('DBA-2026-001');
  const [registrationNo, setRegistrationNo] = useState('DBA/2026/1001');
  const [rollNo, setRollNo] = useState('1001');
  const [dob, setDob] = useState('2010-04-15');
  const [gender, setGender] = useState('Male');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  // Step 3: Marks & Subjects State
  const [subjects, setSubjects] = useState<Array<{
    subject_name: string;
    full_marks: number;
    pass_marks: number;
    theory_marks: number;
    practical_marks: number | null;
  }>>(DEFAULT_SUBJECTS);

  // Additional Meta
  const [attendance, setAttendance] = useState('214 / 225 Days');
  const [classRank, setClassRank] = useState('1st Position');
  const [remarks, setRemarks] = useState('Outstanding academic performance and conduct.');

  // Generated Result state
  const [marksheetNo, setMarksheetNo] = useState('MS-2026-000101');
  const [verificationId, setVerificationId] = useState('DBA-MARK-2026-0103');
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isGeneratedSuccessOpen, setIsGeneratedSuccessOpen] = useState(false);

  // Load classes, exams, students
  useEffect(() => {
    async function loadMeta() {
      if (!currentSchool) return;
      const [eList, cList, stuList] = await Promise.all([
        db.getExams(currentSchool.id),
        db.getClasses(currentSchool.id),
        db.getStudents(currentSchool.id),
      ]);
      setExams(eList);
      setClasses(cList);
      setStudents(stuList);

      if (eList.length > 0) setSelectedExamName(eList[0].name);
      if (cList.length > 0) {
        setSelectedClass(cList[0].name);
        if (cList[0].assigned_subjects && cList[0].assigned_subjects.length > 0) {
          setSubjects(
            cList[0].assigned_subjects.map((s) => ({
              subject_name: s.subject_name,
              full_marks: s.full_marks || 100,
              pass_marks: s.pass_marks || 33,
              theory_marks: Math.round((s.full_marks || 100) * 0.8),
              practical_marks: s.has_practical ? Math.round((s.full_marks || 100) * 0.18) : null,
            }))
          );
        }
      }
    }
    loadMeta();
  }, [currentSchool]);

  const handleClassChange = (className: string) => {
    setSelectedClass(className);
    const matchedClass = classes.find((c) => c.name === className);
    if (matchedClass && matchedClass.assigned_subjects && matchedClass.assigned_subjects.length > 0) {
      setSubjects(
        matchedClass.assigned_subjects.map((s) => ({
          subject_name: s.subject_name,
          full_marks: s.full_marks || 100,
          pass_marks: s.pass_marks || 33,
          theory_marks: Math.round((s.full_marks || 100) * 0.8),
          practical_marks: s.has_practical ? Math.round((s.full_marks || 100) * 0.18) : null,
        }))
      );
      success(`Loaded ${matchedClass.assigned_subjects.length} subjects configured for ${className}!`);
    }
  };

  // Handle Student Auto-load
  const handleSelectStudent = (stu: Student) => {
    setSelectedStudent(stu);
    setStudentName(`${stu.first_name} ${stu.last_name}`);
    setFatherName(stu.father_name || 'Rajesh Singh');
    setMotherName(stu.mother_name || 'Sunita Devi');
    setAdmissionNo(stu.admission_number || 'DBA-2026-001');
    setRegistrationNo('DBA/REG/' + (stu.roll_number || '1001'));
    setRollNo(stu.roll_number || '1001');
    setDob(stu.date_of_birth || '2010-04-15');
    setGender(stu.gender || 'Male');
    setPhotoUrl(stu.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    setMarksheetNo('MS-2026-' + (stu.roll_number || '000101'));
    setVerificationId('DBA-MARK-2026-' + (stu.roll_number || '0103'));
    success(`Student profile for ${stu.first_name} auto-loaded!`);
  };

  const handleSearchStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchStudentQuery.trim()) return;
    setIsSearchingStudent(true);
    try {
      const q = searchStudentQuery.trim().toLowerCase();
      const matched = students.find(
        (s) =>
          s.admission_number.toLowerCase().includes(q) ||
          s.first_name.toLowerCase().includes(q) ||
          s.last_name.toLowerCase().includes(q) ||
          (s.roll_number && s.roll_number.toLowerCase().includes(q))
      );
      if (matched) {
        handleSelectStudent(matched);
      } else {
        toastError('No student found matching "' + searchStudentQuery + '"');
      }
    } finally {
      setIsSearchingStudent(false);
    }
  };

  // Live Marks & Calculation Engine
  const calculatedRows: MarksheetSubjectRow[] = subjects.map((sub) => {
    const th = Number(sub.theory_marks) || 0;
    const pr = sub.practical_marks !== null && sub.practical_marks !== undefined ? Number(sub.practical_marks) : 0;
    const tot = th + pr;
    const pct = sub.full_marks > 0 ? (tot / sub.full_marks) * 100 : 0;
    const gr = calculateGrade(pct);
    return {
      subject_name: sub.subject_name,
      full_marks: sub.full_marks,
      pass_marks: sub.pass_marks,
      theory_marks: th,
      practical_marks: sub.practical_marks !== null ? pr : null,
      total_marks: tot,
      grade: gr,
    };
  });

  const totalFullMarks = calculatedRows.reduce((acc, curr) => acc + curr.full_marks, 0);
  const totalMarksObtained = calculatedRows.reduce((acc, curr) => acc + curr.total_marks, 0);
  const overallPercentage = totalFullMarks > 0 ? (totalMarksObtained / totalFullMarks) * 100 : 0;
  const overallGrade = calculateGrade(overallPercentage);

  const isAnyFailed = calculatedRows.some((r) => r.total_marks < r.pass_marks);
  const finalResult: 'PASS' | 'FAIL' = isAnyFailed ? 'FAIL' : 'PASS';
  const finalDivision = calculateDivision(overallPercentage, finalResult);

  // Compiled Marksheet Data
  const marksheetData: MarksheetData = {
    school_name: currentSchool?.name || 'DON BOSCO ACADEMY',
    school_address: currentSchool?.address || 'Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326',
    affiliation_text: 'Affiliated to CBSE, New Delhi • School Code: 65001 • UDISE Code: 100204001',
    marksheet_title: 'ANNUAL EXAMINATION MARKSHEET',
    marksheet_no: marksheetNo,
    verification_id: verificationId,
    academic_session: academicSession,
    exam_name: selectedExamName,
    issue_date: issueDate,
    student_name: studentName,
    father_name: fatherName,
    mother_name: motherName,
    admission_no: admissionNo,
    registration_no: registrationNo,
    roll_no: rollNo,
    dob: dob,
    gender: gender,
    class_name: selectedClass,
    section_name: selectedSection,
    photo_url: photoUrl,
    subjects: calculatedRows,
    total_full_marks: totalFullMarks,
    total_marks_obtained: totalMarksObtained,
    percentage: overallPercentage,
    overall_grade: overallGrade,
    division: finalDivision,
    result: finalResult,
    attendance,
    class_rank: classRank,
    remarks,
  };

  const handleUpdateSubjectMarks = (index: number, field: 'theory_marks' | 'practical_marks', val: string) => {
    const updated = [...subjects];
    if (field === 'theory_marks') {
      const num = Math.max(0, Number(val) || 0);
      updated[index].theory_marks = num;
    } else {
      if (val === '' || val === '—') {
        updated[index].practical_marks = null;
      } else {
        const num = Math.max(0, Number(val) || 0);
        updated[index].practical_marks = num;
      }
    }
    setSubjects(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerate = async () => {
    try {
      // Save record in db
      await db.createIssuedMarksheet({
        school_id: currentSchool?.id || 'sch-don-bosco',
        marksheet_number: marksheetNo,
        verification_id: verificationId,
        student_id: selectedStudent?.id,
        student_name: studentName,
        admission_no: admissionNo,
        roll_no: rollNo,
        class_name: selectedClass,
        section_name: selectedSection,
        exam_name: selectedExamName,
        academic_session: academicSession,
        issue_date: issueDate,
        total_full_marks: totalFullMarks,
        total_marks_obtained: totalMarksObtained,
        percentage: overallPercentage,
        overall_grade: overallGrade,
        division: finalDivision,
        result: finalResult,
        subjects: calculatedRows,
        photo_url: photoUrl,
        status: 'ISSUED',
      });
      setIsGeneratedSuccessOpen(true);
      success('Official Marksheet generated and verified successfully!');
    } catch (err: any) {
      toastError(err.message || 'Error generating marksheet');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/school/documents/marksheets" className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] font-display">Marksheet Studio & Issue Desk</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-8">
            Official single-design marksheet generation with permanent security-paper background and live A4 calculation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobilePreviewOpen(true)}
            className="lg:hidden px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /><span>Preview A4</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" /><span>Print A4</span>
          </button>
          <button
            onClick={handleGenerate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sapphire-900 via-sapphire-800 to-indigo-800 text-white font-extrabold text-xs shadow-md hover:shadow-indigo-glow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-300" /><span>Generate Official Marksheet</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: DATA ENTRY WORKFLOW (7 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6 no-print">
          {/* STEP 1: EXAMINATION & ACADEMIC DETAILS */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sapphire-900 text-white text-xs font-black flex items-center justify-center">1</span>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Examination & Session</h2>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                CBSE Pattern
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Session</label>
                <select value={academicSession} onChange={(e) => setAcademicSession(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-slate-50">
                  <option value="2025-2026">2025–2026</option>
                  <option value="2026-2027">2026–2027</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Examination Name</label>
                <input type="text" value={selectedExamName} onChange={(e) => setSelectedExamName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900" />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Class (Loads Class Subjects)</label>
                <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-slate-50">
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  {classes.length === 0 && <option value="Class 10">Class 10</option>}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Marksheet Serial Number</label>
                <input type="text" value={marksheetNo} onChange={(e) => setMarksheetNo(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-[#0F2756]" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Issue</label>
                <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900" />
              </div>
            </div>
          </div>

          {/* STEP 2: STUDENT PROFILE & AUTO-LOAD */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sapphire-900 text-white text-xs font-black flex items-center justify-center">2</span>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Student Information</h2>
              </div>
            </div>

            {/* Quick 1-Tap Search Box */}
            <form onSubmit={handleSearchStudent} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quick lookup by Admission No, Roll No, or Student Name..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 font-semibold"
                />
              </div>
              <button type="submit" disabled={isSearchingStudent} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 transition cursor-pointer">
                {isSearchingStudent ? 'Loading...' : 'Auto-Load'}
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admission Number (Unique) *</label>
                <input type="text" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-[#0F2756]" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Father's Name</label>
                <input type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mother's Name</label>
                <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Verification Code / ID</label>
                <input type="text" value={verificationId} onChange={(e) => setVerificationId(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-indigo-700 bg-slate-50" />
              </div>
            </div>
          </div>

          {/* STEP 3: MARKS ENTRY INTERFACE */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sapphire-900 text-white text-xs font-black flex items-center justify-center">3</span>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Subject-Wise Marks Entry</h2>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">Live Real-time Computation</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5 text-center w-16">Max</th>
                    <th className="p-2.5 text-center w-20">Theory</th>
                    <th className="p-2.5 text-center w-20">Practical</th>
                    <th className="p-2.5 text-center w-16">Total</th>
                    <th className="p-2.5 text-center w-14">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((sub, idx) => {
                    const rowCalc = calculatedRows[idx];
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-2.5 font-bold text-slate-800">
                          <input
                            type="text"
                            value={sub.subject_name}
                            onChange={(e) => {
                              const updated = [...subjects];
                              updated[idx].subject_name = e.target.value;
                              setSubjects(updated);
                            }}
                            className="w-full p-1 rounded border border-transparent hover:border-slate-300 focus:border-sapphire-500 text-xs font-bold text-slate-900"
                          />
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-500">{sub.full_marks}</td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            max={sub.full_marks}
                            value={sub.theory_marks}
                            onChange={(e) => handleUpdateSubjectMarks(idx, 'theory_marks', e.target.value)}
                            className="w-16 p-1 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-sapphire-500"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="text"
                            placeholder="—"
                            value={sub.practical_marks !== null ? String(sub.practical_marks) : '—'}
                            onChange={(e) => handleUpdateSubjectMarks(idx, 'practical_marks', e.target.value)}
                            className="w-16 p-1 text-center font-mono text-slate-700 border border-slate-300 rounded focus:ring-1 focus:ring-sapphire-500"
                          />
                        </td>
                        <td className="p-2.5 text-center font-mono font-black text-[#0F2756] bg-slate-50/50">
                          {rowCalc?.total_marks}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-800 bg-slate-50/50">
                          {rowCalc?.grade}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculated Summary Strip */}
            <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-[#0F2756] text-white text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-300 block">Total Marks</span>
                <strong className="text-sm font-mono font-black">{totalMarksObtained} / {totalFullMarks}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 block">Percentage</span>
                <strong className="text-sm font-mono font-black text-emerald-400">{overallPercentage.toFixed(2)}%</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 block">Grade</span>
                <strong className="text-sm font-black text-amber-300">{overallGrade}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 block">Status</span>
                <strong className={'text-sm font-black uppercase ' + (finalResult === 'PASS' ? 'text-emerald-300' : 'text-rose-400')}>{finalResult}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE REAL-TIME A4 MARKSHEET PREVIEW (6 Cols) */}
        {/* ========================================================================= */}
        <div className="hidden lg:block lg:col-span-6 sticky top-6 space-y-3">
          <div className="flex items-center justify-between bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Live A4 Marksheet Canvas</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(0.6, prev - 0.05))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-600">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(1.1, prev + 0.05))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1 bg-sapphire-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /><span>Print</span>
              </button>
            </div>
          </div>

          <div
            className="overflow-auto max-h-[calc(100vh-140px)] p-4 bg-slate-200/70 rounded-3xl border border-slate-300 flex justify-center items-start shadow-inner"
          >
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
            >
              <FixedOfficialMarksheet data={marksheetData} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      <Modal isOpen={isMobilePreviewOpen} onClose={() => setIsMobilePreviewOpen(false)} title="Official Marksheet A4 Preview" size="xl">
        <div className="overflow-auto max-h-[80vh] p-2 bg-slate-200 rounded-2xl flex justify-center">
          <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}>
            <FixedOfficialMarksheet data={marksheetData} />
          </div>
        </div>
      </Modal>

      {/* Success Notification Modal */}
      <Modal isOpen={isGeneratedSuccessOpen} onClose={() => setIsGeneratedSuccessOpen(false)} title="🎉 Marksheet Generated Successfully" size="md">
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-black text-sm text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Official Marksheet Issued & Digitally Registered!</span>
            </div>
            <p className="text-xs text-emerald-800">
              Candidate <strong>{studentName}</strong> (Admission No: <strong>{admissionNo}</strong>, Roll #{rollNo}) ka verified marksheet safaltapoorvak generate ho chuka hai.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between"><span className="text-slate-400">Marksheet Serial No:</span><strong className="font-mono text-[#0F2756]">{marksheetNo}</strong></div>
            <div className="flex justify-between"><span className="text-slate-400">Digital Verification ID:</span><strong className="font-mono text-indigo-700">{verificationId}</strong></div>
            <div className="flex justify-between"><span className="text-slate-400">Percentage & Grade:</span><strong className="text-emerald-700">{overallPercentage.toFixed(2)}% ({overallGrade})</strong></div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/verify?id=${verificationId}`);
                success('Verification Link copied to clipboard!');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /><span>Copy Verify URL</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-3.5 h-3.5" /><span>Print A4</span>
              </button>
              <button onClick={() => navigate('/school/documents/marksheets')} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer">
                Go to Marksheet Records
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
