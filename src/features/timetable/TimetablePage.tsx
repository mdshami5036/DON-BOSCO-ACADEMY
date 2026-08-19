import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { TimetableEntry, ClassRoom, Subject, Teacher } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { Calendar, Plus, Clock, BookOpen, User } from 'lucide-react';
import { Button, Input, Select, Modal, Card, Badge } from '../../components/common/UI';

export const TimetablePage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    day_of_week: 'Monday' as any,
    period_number: 1,
    start_time: '08:30',
    end_time: '09:20',
    subject_id: '',
    teacher_id: '',
    room_no: '301',
  });

  const loadData = async () => {
    if (!currentSchool) return;
    const [cList, sList, tList] = await Promise.all([
      db.getClasses(currentSchool.id),
      db.getSubjects(currentSchool.id),
      db.getTeachers(currentSchool.id),
    ]);
    setClasses(cList);
    setSubjects(sList);
    setTeachers(tList);
    if (cList.length > 0) setSelectedClassId(cList[0].id);
    if (sList.length > 0) setFormData((p) => ({ ...p, subject_id: sList[0].id }));
    if (tList.length > 0) setFormData((p) => ({ ...p, teacher_id: tList[0].id }));
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  useEffect(() => {
    async function loadTable() {
      if (!currentSchool || !selectedClassId) return;
      const tList = await db.getTimetable(currentSchool.id, selectedClassId);
      setTimetables(tList);
    }
    loadTable();
  }, [currentSchool, selectedClassId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool || !selectedClassId) return;
    try {
      await db.saveTimetableEntry({
        school_id: currentSchool.id,
        class_id: selectedClassId,
        ...formData,
      });
      success('Timetable period scheduled');
      setIsModalOpen(false);
      const tList = await db.getTimetable(currentSchool.id, selectedClassId);
      setTimetables(tList);
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Weekly Class Timetable</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Class period schedules, subject instructor allocations, and room assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-48"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="font-bold">
            <Plus className="w-4 h-4 mr-1" /> Add Period
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 border-r border-slate-200 dark:border-slate-800">Day / Period</th>
                {periods.map((p) => (
                  <th key={p} className="p-3 border-r border-slate-200 dark:border-slate-800">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {days.map((day) => (
                <tr key={day}>
                  <td className="p-3 font-bold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                    {day}
                  </td>
                  {periods.map((periodNum) => {
                    const entry = timetables.find(
                      (t) => t.day_of_week === day && t.period_number === periodNum
                    );
                    return (
                      <td key={periodNum} className="p-3 border-r border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition min-w-[140px]">
                        {entry ? (
                          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-left space-y-0.5">
                            <div className="font-bold text-xs text-indigo-900 dark:text-indigo-200">{entry.subject_name}</div>
                            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">{entry.teacher_name}</div>
                            <div className="text-[9px] text-slate-400">{entry.room_no || 'Hall'} &bull; {entry.start_time.slice(0,5)}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-300 dark:text-slate-700 font-mono">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Timetable Period">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Day of Week *"
              value={formData.day_of_week}
              onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value as any })}
            >
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            <Input
              label="Period Number *"
              type="number"
              min={1}
              max={8}
              value={formData.period_number}
              onChange={(e) => setFormData({ ...formData, period_number: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Subject *"
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>

            <Select
              label="Instructor / Teacher *"
              value={formData.teacher_id}
              onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
            <Input
              label="End Time"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
            <Input
              label="Room / Hall"
              value={formData.room_no}
              onChange={(e) => setFormData({ ...formData, room_no: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Save Period
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
