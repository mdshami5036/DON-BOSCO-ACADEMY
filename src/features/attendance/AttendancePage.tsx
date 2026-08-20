import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Student, ClassRoom, Section, AttendanceRecord, AttendanceStatus } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Save,
  Download,
  Users,
} from 'lucide-react';
import { Button, Select, Badge, Card } from '../../components/common/UI';

export const AttendancePage: React.FC = () => {
  const { currentSchool, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks?: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load initial classes
  useEffect(() => {
    async function loadMeta() {
      if (!currentSchool) return;
      const [cList, sList] = await Promise.all([
        db.getClasses(currentSchool.id),
        db.getSections(currentSchool.id),
      ]);
      setClasses(cList);
      setSections(sList);
      if (cList.length > 0) setSelectedClassId(cList[0].id);
      if (sList.length > 0) setSelectedSectionId(sList[0].id);
    }
    loadMeta();
  }, [currentSchool]);

  // Load students and attendance records
  useEffect(() => {
    async function loadSheet() {
      if (!currentSchool || !selectedClassId) return;
      setIsLoading(true);
      try {
        const [stuList, existingAtt] = await Promise.all([
          db.getStudents(currentSchool.id, selectedClassId, selectedSectionId || undefined),
          db.getAttendance(currentSchool.id, selectedClassId, selectedDate),
        ]);
        setStudents(stuList);

        const newMap: Record<string, { status: AttendanceStatus; remarks?: string }> = {};
        stuList.forEach((s) => {
          const rec = existingAtt.find((a) => a.student_id === s.id);
          newMap[s.id] = {
            status: rec ? rec.status : 'present',
            remarks: rec?.remarks || '',
          };
        });
        setAttendanceMap(newMap);
      } finally {
        setIsLoading(false);
      }
    }
    loadSheet();
  }, [currentSchool, selectedClassId, selectedSectionId, selectedDate]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; remarks?: string }> = {};
    students.forEach((s) => {
      updated[s.id] = { status: 'present', remarks: '' };
    });
    setAttendanceMap(updated);
    success('Marked all students as Present');
  };

  const handleSaveAttendance = async () => {
    if (!currentSchool || !selectedClassId) return;
    setIsSaving(true);
    try {
      const recordsToSave = students.map((s) => ({
        school_id: currentSchool.id,
        student_id: s.id,
        class_id: selectedClassId,
        section_id: selectedSectionId || undefined,
        date: selectedDate,
        status: attendanceMap[s.id]?.status || 'present',
        remarks: attendanceMap[s.id]?.remarks || '',
        marked_by: user?.id,
      }));

      await db.saveAttendance(currentSchool.id, recordsToSave);
      success(`Attendance saved for ${students.length} students on ${selectedDate}`);
    } catch (err: any) {
      toastError(err.message || 'Error saving attendance');
    } finally {
      setIsSaving(false);
    }
  };

  // Metrics
  const total = students.length;
  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'present').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter((a) => a.status === 'late').length;
  const leaveCount = Object.values(attendanceMap).filter((a) => a.status === 'leave').length;
  const attendanceRate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '100';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Daily Attendance Register</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily class attendance, unexcused absences, late arrivals, and student engagement percentages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Mark All Present
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveAttendance} isLoading={isSaving} className="font-bold">
            <Save className="w-3.5 h-3.5 mr-1.5" /> Save Attendance
          </Button>
        </div>
      </div>

      {/* Selector & Metrics Header Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Class</label>
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
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Counters (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Present</span>
            <div className="text-xl font-extrabold text-emerald-600">{presentCount}</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Absent</span>
            <div className="text-xl font-extrabold text-rose-600">{absentCount}</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Late / Leave</span>
            <div className="text-xl font-extrabold text-amber-600">{lateCount + leaveCount}</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Rate</span>
            <div className="text-xl font-extrabold text-indigo-600">{attendanceRate}%</div>
          </div>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Roll No</th>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Admission No</th>
                <th className="px-6 py-3.5 text-center">Mark Attendance Status</th>
                <th className="px-6 py-3.5">Remarks (Optional)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((stu) => {
                const currentStatus = attendanceMap[stu.id]?.status || 'present';
                return (
                  <tr key={stu.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {stu.roll_number || '-'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={stu.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={stu.first_name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <span>{stu.first_name} {stu.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {stu.admission_number}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                        <button
                          type="button"
                          onClick={() => setStatus(stu.id, 'present')}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(stu.id, 'absent')}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(stu.id, 'late')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(stu.id, 'leave')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                            currentStatus === 'leave'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                          }`}
                        >
                          Leave
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <input
                        type="text"
                        placeholder="e.g. Doctor appointment"
                        value={attendanceMap[stu.id]?.remarks || ''}
                        onChange={(e) =>
                          setAttendanceMap((prev) => ({
                            ...prev,
                            [stu.id]: { ...prev[stu.id], remarks: e.target.value },
                          }))
                        }
                        className="w-full text-xs px-2.5 py-1 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
