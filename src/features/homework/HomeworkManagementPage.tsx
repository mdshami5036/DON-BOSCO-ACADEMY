import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Homework, ClassRoom, Subject } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { BookOpen, Plus, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Button, Input, Select, Modal, Badge, Card } from '../../components/common/UI';

export const HomeworkManagementPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    title: '',
    description: '',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
  });

  const loadData = async () => {
    if (!currentSchool) return;
    const [hList, cList, sList] = await Promise.all([
      db.getHomework(currentSchool.id),
      db.getClasses(currentSchool.id),
      db.getSubjects(currentSchool.id),
    ]);
    setHomeworkList(hList);
    setClasses(cList);
    setSubjects(sList);
    if (cList.length > 0) setFormData((prev) => ({ ...prev, class_id: cList[0].id }));
    if (sList.length > 0) setFormData((prev) => ({ ...prev, subject_id: sList[0].id }));
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    try {
      await db.createHomework({
        school_id: currentSchool.id,
        ...formData,
      });
      success('Homework assignment created');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Homework & Assignments</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish coursework, assignment prompts, problem sets, and submission deadlines
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-1" /> Create Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homeworkList.map((hw) => (
          <Card key={hw.id} className="hover:border-indigo-300 transition">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="primary">{hw.class_name}</Badge>
              <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Due: {hw.due_date}
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">{hw.title}</h3>
            <p className="text-xs text-indigo-600 font-semibold mb-2">{hw.subject_name}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">{hw.description}</p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              Assigned on: {hw.assigned_date}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Homework Assignment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Class *"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              required
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            <Select
              label="Subject *"
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              required
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Assignment Title *"
            placeholder="e.g. Chapter 4 Exercise Problems"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description & Tasks *</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Detail the homework instructions..."
              required
            />
          </div>

          <Input
            label="Submission Due Date *"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
