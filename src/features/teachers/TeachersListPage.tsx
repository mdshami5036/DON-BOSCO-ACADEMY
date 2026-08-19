import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Teacher } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { GraduationCap, Plus, Phone, Mail, UserCheck, Shield } from 'lucide-react';
import { Button, Input, Modal, Card, Badge } from '../../components/common/UI';

export const TeachersListPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    employee_id: '',
    designation: 'Teacher',
    qualification: 'M.Sc., B.Ed.',
    phone: '',
    email: '',
    joining_date: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    if (!currentSchool) return;
    const list = await db.getTeachers(currentSchool.id);
    setTeachers(list);
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    try {
      await db.createTeacher({
        school_id: currentSchool.id,
        ...formData,
      });
      success(`Faculty member "${formData.first_name} ${formData.last_name}" added`);
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error adding teacher');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Teachers & Staff Faculty</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Academic instructors, staff designations, employee IDs, and subject allocations
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-1" /> Add Teacher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((t) => (
          <Card key={t.id} className="hover:border-indigo-300 dark:hover:border-indigo-800 transition">
            <div className="flex items-start gap-4">
              <img
                src={t.photo_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                alt={t.first_name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{t.employee_id}</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                  {t.first_name} {t.last_name}
                </h3>
                <p className="text-xs text-slate-500">{t.designation}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{t.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.phone}</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1">
                Joined: {t.joining_date} &bull; {t.qualification}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Teacher Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Faculty Member">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name *"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee ID *"
              placeholder="EMP-1005"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              required
            />
            <Input
              label="Designation *"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
            />
          </div>

          <Input
            label="Qualifications"
            placeholder="e.g. M.Sc. Physics, B.Ed."
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="teacher@school.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Add Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
