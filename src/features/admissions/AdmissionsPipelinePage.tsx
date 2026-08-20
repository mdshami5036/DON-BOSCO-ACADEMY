import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { AdmissionApplication } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { Inbox, CheckCircle2, XCircle, Phone, Mail, UserPlus, User } from 'lucide-react';
import { Button, Badge, Card, Modal, Input } from '../../components/common/UI';

export const AdmissionsPipelinePage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!currentSchool) return;
    setIsLoading(true);
    try {
      const list = await db.getAdmissions(currentSchool.id);
      setAdmissions(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  const handleApprove = async (app: AdmissionApplication) => {
    try {
      // 1. Update admission status
      await db.updateAdmissionStatus(app.id, 'approved');

      // 2. Automatically enroll student into school roster
      const names = app.student_name.split(' ');
      await db.createStudent({
        school_id: currentSchool!.id,
        first_name: names[0] || 'Student',
        last_name: names.slice(1).join(' ') || 'Candidate',
        date_of_birth: app.dob,
        gender: app.gender as any,
        father_name: app.parent_name,
        parent_phone: app.parent_phone,
        parent_email: app.parent_email,
        address: app.address || '',
        current_class_id: app.applying_class_id,
      });

      success(`Application approved! ${app.student_name} enrolled as active student.`);
      loadData();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleReject = async (appId: string) => {
    try {
      await db.updateAdmissionStatus(appId, 'rejected');
      success('Application marked as rejected');
      loadData();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Online Admissions Pipeline</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review online student applications received from your public school portal, evaluate candidates, and 1-click onboard to classes
          </p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">App #</th>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Class Applying</th>
                <th className="px-4 py-3.5">Parent Contact</th>
                <th className="px-4 py-3.5">Previous School</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {admissions.length > 0 ? (
                admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {adm.application_no}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{adm.student_name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{adm.gender} &bull; DOB: {adm.dob}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="primary">{adm.class_name || 'Class 9'}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-900 dark:text-white font-medium">{adm.parent_name}</div>
                      <div className="text-slate-400 text-[11px]">{adm.parent_phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {adm.previous_school || 'None / First Admission'}
                    </td>
                    <td className="px-4 py-3.5">
                      {adm.status === 'pending' && <Badge variant="warning">Pending Review</Badge>}
                      {adm.status === 'approved' && <Badge variant="success">Approved & Enrolled</Badge>}
                      {adm.status === 'rejected' && <Badge variant="danger">Rejected</Badge>}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {adm.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            className="text-xs py-1"
                            onClick={() => handleApprove(adm)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="text-xs py-1"
                            onClick={() => handleReject(adm.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-slate-400">
                    No admission applications received yet. They will appear here when parents apply via your public page.
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
