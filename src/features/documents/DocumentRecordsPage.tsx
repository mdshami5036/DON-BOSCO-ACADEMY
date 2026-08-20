import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { GeneratedDocument } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import {
  QrCode,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input } from '../../components/common/UI';

export const DocumentRecordsPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();

  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Revocation Modal
  const [revokingDoc, setRevokingDoc] = useState<GeneratedDocument | null>(null);
  const [revocationReason, setRevocationReason] = useState('Issued in error or replaced by revised marksheet');

  const loadDocs = async () => {
    if (!currentSchool) return;
    setIsLoading(true);
    try {
      const dList = await db.getGeneratedDocuments(currentSchool.id);
      setDocuments(dList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [currentSchool]);

  const handleToggleRevoke = async () => {
    if (!revokingDoc) return;
    try {
      const updated = await db.toggleDocumentRevocation(revokingDoc.id, revocationReason);
      if (updated) {
        success(`Document status updated to ${updated.status}`);
        setRevokingDoc(null);
        loadDocs();
      }
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.verification_code.toLowerCase().includes(search.toLowerCase()) ||
    d.certificate_no.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Generated Records & QR Revocation</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete audit trail of issued academic credentials with real-time public verification lookup and instant revocation controls
          </p>
        </div>

        <div className="w-72">
          <Input
            placeholder="Search by code, cert #, student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Document Title</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Certificate / Doc #</th>
                <th className="px-4 py-3.5">Verification Code</th>
                <th className="px-4 py-3.5">Issued At</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                    {d.title}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="primary">{d.doc_type}</Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono">
                    {d.certificate_no}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    {d.verification_code}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {formatDDMMYYYY(d.issued_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    {d.status === 'VALID' ? (
                      <Badge variant="success">VALID</Badge>
                    ) : (
                      <Badge variant="danger">REVOKED</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/verify/${d.verification_code}`}
                        target="_blank"
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition"
                        title="Verify Public QR Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      {d.status === 'VALID' ? (
                        <Button
                          size="sm"
                          variant="danger"
                          className="text-xs py-1"
                          onClick={() => setRevokingDoc(d)}
                        >
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="success"
                          className="text-xs py-1"
                          onClick={() => db.toggleDocumentRevocation(d.id).then(() => loadDocs())}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Revocation Confirmation Modal */}
      <Modal
        isOpen={!!revokingDoc}
        onClose={() => setRevokingDoc(null)}
        title="Revoke Academic Document"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to revoke <strong>"{revokingDoc?.title}"</strong>?
            Anyone scanning its QR code on the public verification page will immediately see that this document has been invalidated.
          </p>

          <Input
            label="Revocation Reason *"
            value={revocationReason}
            onChange={(e) => setRevocationReason(e.target.value)}
            required
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setRevokingDoc(null)}>
              Cancel
            </Button>
            <Button variant="danger" className="font-bold" onClick={handleToggleRevoke}>
              Confirm Revocation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
