import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Subject } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { BookMarked, Plus, Trash2, Edit2, BookOpen } from 'lucide-react';
import { Button, Input, Select, Modal, Badge, Card } from '../../components/common/UI';

export const SubjectsPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubType, setNewSubType] = useState<'theory' | 'practical' | 'both'>('theory');

  const loadData = async () => {
    if (!currentSchool) return;
    const list = await db.getSubjects(currentSchool.id);
    setSubjects(list);
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    try {
      await db.createSubject({
        school_id: currentSchool.id,
        name: newSubName,
        code: newSubCode || newSubName.slice(0, 3).toUpperCase() + '-101',
        type: newSubType,
      });
      success(`Subject "${newSubName}" created`);
      setIsAddOpen(false);
      setNewSubName('');
      setNewSubCode('');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error creating subject');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Academic Subjects</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Curriculum subjects, official course codes, theory and practical assessment modes
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-1" /> Add Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <Card key={sub.id} className="hover:border-indigo-300 dark:hover:border-indigo-800 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{sub.name}</h3>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{sub.code}</span>
                </div>
              </div>
              <Badge variant={sub.type === 'both' ? 'purple' : sub.type === 'practical' ? 'warning' : 'primary'}>
                {sub.type}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Subject">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Subject Name *"
            placeholder="e.g. Advanced Physics or World History"
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            required
          />
          <Input
            label="Subject Code"
            placeholder="e.g. PHY-201"
            value={newSubCode}
            onChange={(e) => setNewSubCode(e.target.value)}
          />
          <Select
            label="Assessment Mode *"
            value={newSubType}
            onChange={(e) => setNewSubType(e.target.value as any)}
          >
            <option value="theory">Theory Only</option>
            <option value="practical">Practical Only</option>
            <option value="both">Theory + Practical Combined</option>
          </Select>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Add Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
