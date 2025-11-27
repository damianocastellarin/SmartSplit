import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Euro, Users } from 'lucide-react';
import { cn } from '../utils/cn';

// initialData serve quando stiamo modificando una spesa esistente
export default function AddExpenseForm({ group, onSubmit, onCancel, initialData = null }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(group.members[0]);
  
  // Gestione selezione multipla membri
  const [involvedMembers, setInvolvedMembers] = useState(group.members);
  
  const [error, setError] = useState('');

  // Se c'è initialData, pre-compila il form (Modalità Modifica)
  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setPaidBy(initialData.paidBy);
      // Se involvedMembers mancava nei vecchi dati, usa tutti i membri
      setInvolvedMembers(initialData.involvedMembers || group.members);
    }
  }, [initialData, group.members]);

  const toggleMember = (member) => {
    if (involvedMembers.includes(member)) {
      // Non permettere di rimuovere l'ultimo membro (almeno 1 deve pagare)
      if (involvedMembers.length > 1) {
        setInvolvedMembers(prev => prev.filter(m => m !== member));
      }
    } else {
      setInvolvedMembers(prev => [...prev, member]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!description.trim() || !amount) {
      setError('Compila descrizione e importo.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Inserisci un importo valido.');
      return;
    }

    if (involvedMembers.length === 0) {
      setError('Seleziona almeno una persona coinvolta.');
      return;
    }

    const expenseData = {
      description,
      amount: numericAmount,
      paidBy,
      involvedMembers // Array dei nomi ['Mario', 'Luigi']
    };

    onSubmit(expenseData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Descrizione */}
      <Input
        label="Descrizione"
        placeholder="Es. Cena pizzeria"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Importo */}
      <div className="relative">
        <label className="text-sm font-medium text-slate-700 mb-1 block">Importo</label>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="number"
            step="0.01"
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      {/* Chi ha pagato? */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-1 block">Chi ha anticipato i soldi?</label>
        <select
          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          {group.members.map((member) => (
            <option key={member} value={member}>
              {member}
            </option>
          ))}
        </select>
      </div>

      {/* SEZIONE DIVISIONE AVANZATA */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
        <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Per chi è la spesa?
          <span className="text-xs font-normal text-slate-500 ml-auto">
            {involvedMembers.length} selezionati
          </span>
        </label>
        
        <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto">
          {group.members.map(member => {
            const isSelected = involvedMembers.includes(member);
            return (
              <div 
                key={member}
                onClick={() => toggleMember(member)}
                className={cn(
                  "cursor-pointer text-sm p-2 rounded border transition-all flex items-center justify-between",
                  isSelected 
                    ? "bg-white border-primary text-primary font-medium shadow-sm" 
                    : "bg-slate-100 border-transparent text-slate-400"
                )}
              >
                {member}
                {isSelected && <div className="w-2 h-2 bg-primary rounded-full" />}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Clicca sui nomi per escluderli dalla divisione.
        </p>
      </div>

      {error && <p className="text-sm text-danger font-medium">{error}</p>}

      <div className="pt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? 'Aggiorna' : 'Salva'}
        </Button>
      </div>
    </form>
  );
}