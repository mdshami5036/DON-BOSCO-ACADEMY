import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { Notice } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { Bell, Plus, Trash2, Calendar, Users, Pin } from 'lucide-react';
import { Button, Input, Select, Modal, Badge, Card } from '../../components/common/UI';

export const NoticesManagementPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_role: 'ALL' as 'ALL' | 'TEACHER' | 'STUDENT' | 'PARENT',
    is_pinned: false,
    publish_date: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    if (!currentSchool) return;
    const list = await db.getNotices(currentSchool.id);
    setNotices(list);
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    try {
      await db.createNotice({
        school_id: currentSchool.id,
        ...formData,
      });
      success('Notice published successfully');
      setIsModalOpen(false);
      setFormData({
        title: '',
        content: '',
        target_role: 'ALL',
        is_pinned: false,
        publish_date: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.deleteNotice(id);
      success('Notice removed');
      loadData();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notice Board & Announcements</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Broadcast targeted communications to faculty staff, enrolled students, parents, and public website visitors
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-1" /> Post Notice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.map((n) => (
          <Card key={n.id} className="flex flex-col justify-between hover:border-indigo-300 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="primary">{n.target_role}</Badge>
                <div className="flex items-center gap-2">
                  {n.is_pinned && <Badge variant="warning"><Pin className="w-3 h-3 mr-1" /> Pinned</Badge>}
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {n.publish_date}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{n.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{n.content}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button size="sm" variant="ghost" className="text-rose-600 text-xs py-1" onClick={() => handleDelete(n.id)}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Post Notice Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Broadcast School Notice">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Notice Title *"
            placeholder="e.g. Annual Sports Meet 2025 Schedule"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Target Audience *"
              value={formData.target_role}
              onChange={(e) => setFormData({ ...formData, target_role: e.target.value as any })}
            >
              <option value="ALL">All (Public, Faculty & Students)</option>
              <option value="TEACHER">Faculty & Teachers Only</option>
              <option value="STUDENT">Students Only</option>
              <option value="PARENT">Parents Only</option>
            </Select>

            <Input
              label="Publish Date"
              type="date"
              value={formData.publish_date}
              onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Content *</label>
            <textarea
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full text-xs p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your official announcement..."
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.is_pinned}
              onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="pinned" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Pin to Top of Dashboard & Notice Board
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
