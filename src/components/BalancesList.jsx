import React from 'react';
import { cn } from '../utils/cn';

export default function BalancesList({ balances }) {
  // Ordiniamo: prima chi deve ricevere (verdi), poi chi deve dare (rossi)
  const sortedMembers = Object.entries(balances).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-3">
      {sortedMembers.map(([member, amount]) => {
        const isPositive = amount > 0.01;
        const isNegative = amount < -0.01;
        const isNeutral = !isPositive && !isNegative;

        return (
          <div key={member} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
            <span className="font-medium text-slate-700">{member}</span>
            
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-bold min-w-[80px] text-center",
              isPositive && "bg-success/10 text-success",
              isNegative && "bg-danger/10 text-danger",
              isNeutral && "bg-slate-100 text-slate-500"
            )}>
              {isPositive ? '+' : ''}{amount.toFixed(2)} €
            </span>
          </div>
        );
      })}
    </div>
  );
}