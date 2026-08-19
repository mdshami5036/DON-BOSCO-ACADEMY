import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { School, SubscriptionPlan, DocumentTemplate, DocType } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
  UserPlus,
} from 'lucide-react';
import { Button, Badge, Modal, Input, Select, Card } from '../../components/common/UI';

export const SchoolApprovalsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'suspended' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Direct Add School Modal State
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [newSchoolForm, setNewSchoolForm] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    principal_name: '',
    admin_password: 'Password@123',
    subscription_plan_id: 'plan-growth',
    logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
  });

  // Approval Modal State
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [assignedTemplates, setAssignedTemplates] = useState<Record<DocType, string>>({
    MARKSHEET: 'tmpl-marksheet-modern',
    CERTIFICATE: 'tmpl-cert-gold',
    ID_CARD: 'tmpl-id-card-portrait',
    ADMIT_CARD: 'tmpl-admit-card-standard',
    TRANSFER_CERTIFICATE: '',
    BONAFIDE_CERTIFICATE: '',
    CHARACTER_CERTIFICATE: '',
    ACHIEVEMENT_CERTIFICATE: '',
    FEE_RECEIPT: '',
    CUSTOM_DOCUMENT: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sList, pList, tList] = await Promise.all([
        db.getSchools(),
        db.getPlans(),
        db.getMasterTemplates(),
      ]);
      setSchools(sList);
      setPlans(pList);
      setTemplates(tList);
      if (pList.length > 0) setSelectedPlanId(pList[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDirectSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await db.createSchool({
        name: newSchoolForm.name,
        slug: newSchoolForm.slug || newSchoolForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        email: newSchoolForm.email,
        phone: newSchoolForm.phone,
        address: newSchoolForm.address,
        city: newSchoolForm.city,
        state: newSchoolForm.state,
        country: newSchoolForm.country,
        principal_name: newSchoolForm.principal_name,
        logo_url: newSchoolForm.logo_url,
        subscription_plan_id: newSchoolForm.subscription_plan_id,
        status: 'active',
      });

      // Auto-assign default master templates
      const defaultTmpls: Record<DocType, string> = {
        MARKSHEET: templates.find((t) => t.category === 'MARKSHEET')?.id || 'tmpl-marksheet-modern',
        CERTIFICATE: templates.find((t) => t.category === 'CERTIFICATE')?.id || 'tmpl-cert-gold',
        ID_CARD: templates.find((t) => t.category === 'ID_CARD')?.id || 'tmpl-id-card-portrait',
        ADMIT_CARD: templates.find((t) => t.category === 'ADMIT_CARD')?.id || 'tmpl-admit-card-standard',
        TRANSFER_CERTIFICATE: '',
        BONAFIDE_CERTIFICATE: '',
        CHARACTER_CERTIFICATE: '',
        ACHIEVEMENT_CERTIFICATE: '',
        FEE_RECEIPT: '',
        CUSTOM_DOCUMENT: '',
      };

      await db.approveSchool(created.id, newSchoolForm.subscription_plan_id, defaultTmpls);

      success(`School "${created.name}" provisioned and activated successfully!`);
      setIsAddSchoolOpen(false);
      setNewSchoolForm({
        name: '',
        slug: '',
        email: '',
        phone: '',
        address: '',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        principal_name: '',
        admin_password: 'Password@123',
        subscription_plan_id: 'plan-growth',
        logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
      });
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error provisioning school');
    }
  };

  const handleOpenApproveModal = (school: School) => {
    setSelectedSchool(school);
    setSelectedPlanId(school.subscription_plan_id || 'plan-growth');
    setIsApproveModalOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedSchool) return;
    try {
      await db.approveSchool(selectedSchool.id, selectedPlanId, assignedTemplates);
      success(`Approved "${selectedSchool.name}" successfully`);
      setIsApproveModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error approving school');
    }
  };

  const handleStatusChange = async (schoolId: string, status: 'active' | 'suspended' | 'rejected') => {
    try {
      await db.updateSchool(schoolId, { status });
      success(`School status updated to ${status}`);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
    }
  };

  const filteredSchools = schools.filter((s) => statusFilter === 'all' || s.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">School Registry & Tenant Approvals</h1>
          <p className="text-xs text-slate-400 mt-1">Review registrations, activate tenant accounts, and bind master document templates</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={() => setIsAddSchoolOpen(true)} className="font-bold">
            <Plus className="w-4 h-4 mr-1.5" /> Add & Provision School
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['all', 'pending', 'active', 'suspended', 'rejected'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            {st} ({schools.filter((s) => st === 'all' || s.status === st).length})
          </button>
        ))}
      </div>

      {/* Schools List */}
      <div className="space-y-4">
        {filteredSchools.map((school) => {
          const currentPlan = plans.find((p) => p.id === school.subscription_plan_id);
          return (
            <div
              key={school.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={school.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150'}
                  alt={school.name}
                  className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-700 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-base text-white">{school.name}</h3>
                    {school.status === 'pending' && <Badge variant="warning">Pending Approval</Badge>}
                    {school.status === 'active' && <Badge variant="success">Active Tenant</Badge>}
                    {school.status === 'suspended' && <Badge variant="danger">Suspended</Badge>}
                    {school.status === 'rejected' && <Badge variant="neutral">Rejected</Badge>}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                    <span>Slug: <strong className="text-slate-300">/school/{school.slug}</strong></span>
                    <span>Principal: <strong className="text-slate-300">{school.principal_name || 'N/A'}</strong></span>
                    <span>Plan: <strong className="text-indigo-400">{currentPlan?.name || 'Standard'}</strong></span>
                    <span>Email: <strong className="text-slate-300">{school.email}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <a
                  href={`/school/${school.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="View Public Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {school.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenApproveModal(school)}
                    className="font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Review & Approve
                  </Button>
                )}

                {school.status === 'active' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleStatusChange(school.id, 'suspended')}
                    className="text-xs"
                  >
                    Suspend
                  </Button>
                )}

                {school.status === 'suspended' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleStatusChange(school.id, 'active')}
                    className="text-xs"
                  >
                    Reactivate
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Direct School Modal */}
      <Modal
        isOpen={isAddSchoolOpen}
        onClose={() => setIsAddSchoolOpen(false)}
        title="Provision & Activate New School Tenant"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateDirectSchool} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="School Name *"
              placeholder="e.g. Oakridge International Academy"
              value={newSchoolForm.name}
              onChange={(e) => {
                const name = e.target.value;
                setNewSchoolForm({
                  ...newSchoolForm,
                  name,
                  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                });
              }}
              required
            />
            <Input
              label="Slug Identifier *"
              value={newSchoolForm.slug}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, slug: e.target.value })}
              helperText="URL: /school/[slug]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Contact Email *"
              type="email"
              placeholder="admin@oakridge.edu"
              value={newSchoolForm.email}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number *"
              placeholder="+1 (555) 000-0000"
              value={newSchoolForm.phone}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, phone: e.target.value })}
              required
            />
          </div>

          <Input
            label="Campus Address *"
            placeholder="123 Education Boulevard"
            value={newSchoolForm.address}
            onChange={(e) => setNewSchoolForm({ ...newSchoolForm, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Head of School / Principal Name *"
              placeholder="Dr. Margaret Vance"
              value={newSchoolForm.principal_name}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, principal_name: e.target.value })}
              required
            />
            <Select
              label="SaaS Subscription Tier *"
              value={newSchoolForm.subscription_plan_id}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, subscription_plan_id: e.target.value })}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (${p.price_monthly}/mo - max {p.max_students} students)</option>
              ))}
            </Select>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsAddSchoolOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Provision & Activate Tenant
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approval & Template Binding Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title={`Approve & Provision: ${selectedSchool?.name}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Select the SaaS subscription tier and assign the master HTML/CSS document templates to bind for this institution.
          </p>

          <Select
            label="Subscription Plan Tier *"
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (${p.price_monthly}/mo)</option>
            ))}
          </Select>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Default Master Templates:</div>
            {(['MARKSHEET', 'CERTIFICATE', 'ADMIT_CARD', 'ID_CARD'] as const).map((cat) => {
              const catTemplates = templates.filter((t) => t.category === cat);
              return (
                <div key={cat} className="grid grid-cols-3 gap-2 items-center text-xs">
                  <span className="font-semibold text-slate-300">{cat.replace('_', ' ')}:</span>
                  <div className="col-span-2">
                    <select
                      value={assignedTemplates[cat]}
                      onChange={(e) => setAssignedTemplates({ ...assignedTemplates, [cat]: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      {catTemplates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="font-bold" onClick={handleConfirmApproval}>
              Confirm & Activate School
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
