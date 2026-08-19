import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { SubscriptionPlan } from '../../types/database';
import { CreditCard, Check, ShieldCheck, Users, HardDrive } from 'lucide-react';
import { Button, Badge, Card } from '../../components/common/UI';

export const SaaSSubscriptionPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const pList = await db.getPlans();
        setPlans(pList);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">SaaS Subscription Plans & Feature Tiers</h1>
        <p className="text-xs text-slate-400 mt-1">Configure student quotas, storage limits, and enterprise features per subscription level</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <Card key={p.id} className="bg-slate-900 border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={p.slug === 'growth' ? 'primary' : 'neutral'}>{p.slug.toUpperCase()}</Badge>
                {p.is_active && <span className="text-[11px] text-emerald-400 font-semibold">Active</span>}
              </div>
              <h3 className="text-xl font-bold text-white">{p.name}</h3>
              <div className="text-3xl font-extrabold text-white mt-4">
                ${p.price_monthly} <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">${p.price_yearly}/yr billed annually</p>

              <div className="mt-6 space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Max Students</span>
                  <strong className="text-white">{p.max_students}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Max Faculty</span>
                  <strong className="text-white">{p.max_teachers}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> Storage Quota</span>
                  <strong className="text-white">{p.max_storage_mb >= 1000 ? `${p.max_storage_mb / 1000} GB` : `${p.max_storage_mb} MB`}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> QR Verification</span>
                  <span className="text-emerald-400 font-bold">Included</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800">
              <Button variant="outline" className="w-full border-slate-700 text-xs">
                Edit Quotas & Rules
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
