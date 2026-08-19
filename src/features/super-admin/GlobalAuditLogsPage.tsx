import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { AuditLog } from '../../types/database';
import { History, Shield, Calendar, Search } from 'lucide-react';
import { Card, Badge, Input } from '../../components/common/UI';

export const GlobalAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const lList = await db.getAuditLogs();
        setLogs(lList);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredLogs = logs.filter((l) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.user_email && l.user_email.toLowerCase().includes(search.toLowerCase())) ||
    l.resource_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Global Security Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">Immutable system event records, tenant administrative actions, and document generations</p>
        </div>

        <div className="w-72">
          <Input
            placeholder="Search action, email, resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Actor / User</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Resource</th>
                <th className="px-6 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-white">
                    {l.user_email}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="primary">{l.action}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {l.resource_type}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">
                    {JSON.stringify(l.details || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
