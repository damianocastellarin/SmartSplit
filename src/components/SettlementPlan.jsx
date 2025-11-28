import React from 'react';
import { ArrowRight, CheckCircle2, Check } from 'lucide-react';
import { Button } from './ui/Button';

export default function SettlementPlan({ settlements, onSettle }) {
  if (settlements.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 bg-emerald-50/50 rounded-xl border border-emerald-100">
        <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="font-medium text-emerald-900">Tutti i conti sono in pari!</p>
        <p className="text-xs text-emerald-600 mt-1">Nessuno deve soldi a nessuno.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {settlements.map((tx, index) => (
        <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm gap-4">
          
          {/* Dettaglio Transazione */}
          <div className="flex items-center gap-3 text-slate-700">
             <span className="font-semibold text-slate-900">{tx.from}</span>
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Deve dare</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
             </div>
             <span className="font-semibold text-slate-900">{tx.to}</span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
            {/* Importo */}
            <span className="font-bold text-lg text-slate-900">
              {tx.amount.toFixed(2)} €
            </span>

            {/* Bottone Azione */}
            <Button 
              size="sm" 
              onClick={() => onSettle(tx)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
            >
              <Check className="w-4 h-4 mr-1" /> Salda
            </Button>
          </div>
        </div>
      ))}
      
      <p className="text-xs text-center text-slate-400 mt-4">
        Cliccando "Salda" verrà registrato un rimborso nelle spese e il debito sarà cancellato.
      </p>
    </div>
  );
}