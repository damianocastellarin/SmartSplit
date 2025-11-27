import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SettlementPlan({ settlements }) {
  if (settlements.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
        <p>Tutti i conti sono in pari!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {settlements.map((tx, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-slate-800 text-white rounded-xl shadow-md">
          <div className="flex items-center gap-3">
             <div className="font-medium">{tx.from}</div>
             <ArrowRight className="w-4 h-4 text-slate-400" />
             <div className="font-medium">{tx.to}</div>
          </div>
          <div className="font-bold text-lg text-emerald-400">
            {tx.amount.toFixed(2)} €
          </div>
        </div>
      ))}
    </div>
  );
}