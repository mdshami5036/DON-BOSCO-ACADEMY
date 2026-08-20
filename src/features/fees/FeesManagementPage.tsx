import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { FeeStructure, FeePayment, Student, ClassRoom } from '../../types/database';
import { printDocumentHtml } from '../../lib/pdf-generator';
import { useToast } from '../../components/common/Toast';
import {
  CreditCard,
  Plus,
  Receipt,
  Download,
  DollarSign,
  Printer,
  CheckCircle2,
  Users,
  Search,
} from 'lucide-react';
import { Button, Input, Select, Modal, Badge, Card, StatCard } from '../../components/common/UI';

export const FeesManagementPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'structures'>('payments');
  const [isLoading, setIsLoading] = useState(true);

  // New Structure Modal
  const [isNewStructureOpen, setIsNewStructureOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState(1250);
  const [newDueDate, setNewDueDate] = useState('2025-06-30');
  const [newFrequency, setNewFrequency] = useState<'monthly' | 'quarterly' | 'annual' | 'one-time'>('quarterly');
  const [selectedClassId, setSelectedClassId] = useState('');

  // Collect Payment Modal
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [payStudentId, setPayStudentId] = useState('');
  const [payStructureId, setPayStructureId] = useState('');
  const [payAmount, setPayAmount] = useState(1250);
  const [payDiscount, setPayDiscount] = useState(0);
  const [payFine, setPayFine] = useState(0);
  const [payMethod, setPayMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Bank Transfer'>('Card');
  const [payRemarks, setPayRemarks] = useState('');

  const loadData = async () => {
    if (!currentSchool) return;
    setIsLoading(true);
    try {
      const [fList, pList, sList, cList] = await Promise.all([
        db.getFeeStructures(currentSchool.id),
        db.getFeePayments(currentSchool.id),
        db.getStudents(currentSchool.id),
        db.getClasses(currentSchool.id),
      ]);
      setFeeStructures(fList);
      setFeePayments(pList);
      setStudents(sList);
      setClasses(cList);
      if (sList.length > 0) setPayStudentId(sList[0].id);
      if (fList.length > 0) {
        setPayStructureId(fList[0].id);
        setPayAmount(fList[0].amount);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    try {
      await db.createFeeStructure({
        school_id: currentSchool.id,
        title: newTitle,
        amount: Number(newAmount),
        due_date: newDueDate,
        frequency: newFrequency,
        class_id: selectedClassId || undefined,
      });
      success(`Fee Structure "${newTitle}" created`);
      setIsNewStructureOpen(false);
      setNewTitle('');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error creating fee structure');
    }
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool || !payStudentId) return;
    try {
      const payment = await db.recordFeePayment({
        school_id: currentSchool.id,
        student_id: payStudentId,
        fee_structure_id: payStructureId || undefined,
        amount_paid: Number(payAmount),
        discount: Number(payDiscount),
        fine: Number(payFine),
        payment_method: payMethod as any,
        remarks: payRemarks,
        fee_title: feeStructures.find((f) => f.id === payStructureId)?.title || 'School Tuition',
      });
      success(`Recorded payment: Receipt #${payment.receipt_no}`);
      setIsCollectPaymentOpen(false);
      loadData();

      // Offer immediate receipt print
      printReceipt(payment);
    } catch (err: any) {
      toastError(err.message || 'Error collecting payment');
    }
  };

  const printReceipt = (payment: FeePayment) => {
    const student = payment.student || students.find((s) => s.id === payment.student_id);
    const receiptHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 20px auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 8px; color: #1e293b;">
        <div style="text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="margin: 0; font-size: 20px; color: #1e1b4b; text-transform: uppercase;">${currentSchool?.name}</h2>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">${currentSchool?.address} | Phone: ${currentSchool?.phone}</p>
          <div style="display: inline-block; background: #4f46e5; color: white; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-top: 6px;">
            OFFICIAL FEE RECEIPT
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 16px; background: #f8fafc; padding: 10px; border-radius: 6px;">
          <div>
            <div><strong>Receipt No:</strong> ${payment.receipt_no}</div>
            <div><strong>Date:</strong> ${formatDDMMYYYY(payment.payment_date)}</div>
            <div><strong>Payment Mode:</strong> ${payment.payment_method}</div>
          </div>
          <div>
            <div><strong>Student:</strong> ${student?.first_name} ${student?.last_name}</div>
            <div><strong>Admission No:</strong> ${student?.admission_number}</div>
            <div><strong>Class:</strong> ${student?.class_name || 'Class 10'}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
          <thead>
            <tr style="background: #e2e8f0;">
              <th style="padding: 6px 10px; text-align: left;">Description</th>
              <th style="padding: 6px 10px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${payment.fee_title}</td>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${payment.amount_paid.toFixed(2)}</td>
            </tr>
            ${payment.discount > 0 ? `<tr><td style="padding: 6px 10px; color: #16a34a;">Discount</td><td style="padding: 6px 10px; text-align: right; color: #16a34a;">-$${payment.discount}</td></tr>` : ''}
            ${payment.fine > 0 ? `<tr><td style="padding: 6px 10px; color: #dc2626;">Late Fee Fine</td><td style="padding: 6px 10px; text-align: right; color: #dc2626;">+$${payment.fine}</td></tr>` : ''}
            <tr style="font-weight: bold; background: #f1f5f9;">
              <td style="padding: 8px 10px;">Total Paid Amount</td>
              <td style="padding: 8px 10px; text-align: right; color: #4f46e5;">$${payment.amount_paid.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; font-size: 11px;">
          <div>
            <div><strong>Transaction Ref:</strong> ${payment.transaction_ref || 'N/A'}</div>
            <div style="color: #64748b;">Computer generated official receipt.</div>
          </div>
          <div style="text-align: center; border-top: 1px solid #94a3b8; padding-top: 4px; width: 140px;">
            Authorized Cashier
          </div>
        </div>
      </div>
    `;
    printDocumentHtml(receiptHtml, `Receipt-${payment.receipt_no}`);
  };

  const totalCollected = feePayments.reduce((acc, p) => acc + p.amount_paid, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Fee Management & Collection</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Class tuition structures, student collection ledger, fine calculation, and instant printable receipts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsNewStructureOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Fee Structure
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCollectPaymentOpen(true)} className="font-bold">
            <CreditCard className="w-4 h-4 mr-1" /> Collect Fee Payment
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Fees Collected"
          value={`$${totalCollected.toLocaleString()}`}
          icon={CreditCard}
          color="emerald"
          change="This session"
        />
        <StatCard
          title="Active Structures"
          value={feeStructures.length}
          icon={Receipt}
          color="indigo"
          change="Class assigned"
        />
        <StatCard
          title="Total Transactions"
          value={feePayments.length}
          icon={CheckCircle2}
          color="purple"
          change="Receipts issued"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'payments' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Payment Transactions Ledger ({feePayments.length})
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'structures' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Fee Structures & Schedules ({feeStructures.length})
        </button>
      </div>

      {activeTab === 'payments' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Receipt #</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Fee Title</th>
                  <th className="px-4 py-3.5">Mode</th>
                  <th className="px-4 py-3.5">Amount Paid</th>
                  <th className="px-6 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {feePayments.map((p) => {
                  const student = p.student || students.find((s) => s.id === p.student_id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {p.receipt_no}
                      </td>
                      <td className="px-4 py-3.5">{formatDDMMYYYY(p.payment_date)}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                        {student ? `${student.first_name} ${student.last_name}` : 'Student'}
                      </td>
                      <td className="px-4 py-3.5">{p.fee_title}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant="primary">{p.payment_method}</Badge>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                        ${p.amount_paid.toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs py-1"
                          onClick={() => printReceipt(p)}
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" /> Print
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feeStructures.map((f) => (
            <Card key={f.id} className="hover:border-indigo-300 transition">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="primary">{f.frequency.toUpperCase()}</Badge>
                <span className="text-xs text-slate-400">Due: {f.due_date}</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{f.title}</h3>
              <div className="text-2xl font-extrabold text-indigo-600 mt-2">
                ${f.amount.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Assigned to: {f.class_name || 'All Classes'}</p>
            </Card>
          ))}
        </div>
      )}

      {/* New Structure Modal */}
      <Modal isOpen={isNewStructureOpen} onClose={() => setIsNewStructureOpen(false)} title="Create Fee Structure">
        <form onSubmit={handleCreateStructure} className="space-y-4">
          <Input
            label="Fee Structure Title *"
            placeholder="e.g. Term 2 Tuition & Science Lab Fee"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount ($) *"
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(Number(e.target.value))}
              required
            />
            <Input
              label="Due Date *"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Billing Frequency"
              value={newFrequency}
              onChange={(e) => setNewFrequency(e.target.value as any)}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="one-time">One-Time</option>
            </Select>

            <Select
              label="Applicable Class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsNewStructureOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Create Fee Structure
            </Button>
          </div>
        </form>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal isOpen={isCollectPaymentOpen} onClose={() => setIsCollectPaymentOpen(false)} title="Collect Fee Payment">
        <form onSubmit={handleCollectPayment} className="space-y-4">
          <Select
            label="Select Student *"
            value={payStudentId}
            onChange={(e) => setPayStudentId(e.target.value)}
            required
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} ({s.admission_number}) - {s.class_name}
              </option>
            ))}
          </Select>

          <Select
            label="Fee Category / Structure *"
            value={payStructureId}
            onChange={(e) => {
              setPayStructureId(e.target.value);
              const found = feeStructures.find((f) => f.id === e.target.value);
              if (found) setPayAmount(found.amount);
            }}
          >
            {feeStructures.map((f) => (
              <option key={f.id} value={f.id}>{f.title} (${f.amount})</option>
            ))}
          </Select>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Amount Paid ($) *"
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              required
            />
            <Input
              label="Discount ($)"
              type="number"
              value={payDiscount}
              onChange={(e) => setPayDiscount(Number(e.target.value))}
            />
            <Input
              label="Late Fine ($)"
              type="number"
              value={payFine}
              onChange={(e) => setPayFine(Number(e.target.value))}
            />
          </div>

          <Select
            label="Payment Mode *"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value as any)}
          >
            <option value="Card">Credit / Debit Card</option>
            <option value="Cash">Cash at Counter</option>
            <option value="UPI">UPI / Digital Wallet</option>
            <option value="Bank Transfer">Bank Transfer (ACH/Wire)</option>
          </Select>

          <Input
            label="Remarks / Notes"
            placeholder="e.g. Paid in full for Q1"
            value={payRemarks}
            onChange={(e) => setPayRemarks(e.target.value)}
          />

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsCollectPaymentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Record & Print Receipt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
