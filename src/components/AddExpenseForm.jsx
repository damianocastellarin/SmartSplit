import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Euro, Users, User, Tag } from 'lucide-react';
import { cn } from '../utils/cn';

// Definizione estesa delle categorie
const CATEGORIES = [
  { id: 'food', label: 'Cibo & Drink', icon: '🍔' },
  { id: 'transport', label: 'Trasporti', icon: '✈️' },
  { id: 'housing', label: 'Casa & Bollette', icon: '🏠' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'health', label: 'Salute', icon: '💊' },
  { id: 'fun', label: 'Svago', icon: '🎉' },
  { id: 'travel', label: 'Viaggi', icon: '🌍' },
  { id: 'pets', label: 'Animali', icon: '🐾' },
  { id: 'gifts', label: 'Regali', icon: '🎁' },
  { id: 'other', label: 'Altro', icon: '🔹' }
];

export default function AddExpenseForm({ group, onSubmit, onCancel, initialData = null }) {
  const [description, setDescription] = useState('');
  // Inizializza a stringa vuota per mostrare "Seleziona Categoria"
  const [category, setCategory] = useState(''); 
  
  const [payerMode, setPayerMode] = useState('single'); 
  const [singlePayer, setSinglePayer] = useState(group.members[0]);
  const [singleAmount, setSingleAmount] = useState('');
  const [multiPayers, setMultiPayers] = useState({});
  const [involvedMembers, setInvolvedMembers] = useState(group.members);
  
  const [error, setError] = useState('');

  // Inizializzazione (Modifica Spesa)
  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      // Se c'è una categoria salvata usala, altrimenti prova a indovinare o metti 'other' per compatibilità
      setCategory(initialData.category || 'other'); 
      setInvolvedMembers(initialData.involvedMembers || group.members);

      if (Array.isArray(initialData.paidBy)) {
        setPayerMode('multiple');
        const payersMap = {};
        initialData.paidBy.forEach(p => {
          payersMap[p.member] = p.amount;
        });
        setMultiPayers(payersMap);
        setSingleAmount(initialData.amount.toString());
      } else {
        setPayerMode('single');
        setSinglePayer(initialData.paidBy);
        setSingleAmount(initialData.amount.toString());
      }
    }
  }, [initialData, group.members]);

  const handleMultiPayerChange = (member, value) => {
    const val = parseFloat(value) || 0;
    setMultiPayers(prev => ({ ...prev, [member]: val }));
  };

  const totalAmount = payerMode === 'single' 
    ? (parseFloat(singleAmount) || 0)
    : Object.values(multiPayers).reduce((sum, val) => sum + val, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validazione Categoria
    if (!category) {
      setError('Seleziona una categoria.');
      return;
    }

    if (!description.trim()) {
      setError('Inserisci una descrizione.');
      return;
    }

    if (totalAmount <= 0) {
      setError('L\'importo totale deve essere maggiore di zero.');
      return;
    }

    if (involvedMembers.length === 0) {
      setError('Seleziona almeno una persona coinvolta.');
      return;
    }

    let finalPaidBy;

    if (payerMode === 'single') {
      finalPaidBy = [{ member: singlePayer, amount: totalAmount }];
    } else {
      finalPaidBy = Object.entries(multiPayers)
        .filter(([_, amount]) => amount > 0)
        .map(([member, amount]) => ({ member, amount }));
      
      if (finalPaidBy.length === 0) {
        setError('In modalità multipla, qualcuno deve aver pagato.');
        return;
      }
    }

    const expenseData = {
      description,
      category, 
      amount: totalAmount,
      paidBy: finalPaidBy,
      involvedMembers
    };

    onSubmit(expenseData);
  };

  const toggleInvolved = (member) => {
    if (involvedMembers.includes(member)) {
      if (involvedMembers.length > 1) {
        setInvolvedMembers(prev => prev.filter(m => m !== member));
      }
    } else {
      setInvolvedMembers(prev => [...prev, member]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* 1. SELEZIONE CATEGORIA */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Categoria</label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            className={cn(
              "flex h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none",
              !category && "text-slate-400" // Colore grigio se è placeholder
            )}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" disabled>Seleziona Categoria</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id} className="text-slate-900">
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. DESCRIZIONE */}
      <Input
        label="Descrizione"
        placeholder={category === 'other' ? "Specifica (es. Spese Condominio)" : "Es. Cena da Mario"}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Switch Modalità Pagamento */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Chi ha anticipato i soldi?</label>
        
        <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
          <button
            type="button"
            onClick={() => setPayerMode('single')}
            className={cn(
              "flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
              payerMode === 'single' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            )}
          >
            <User className="w-4 h-4" /> Una persona
          </button>
          <button
            type="button"
            onClick={() => setPayerMode('multiple')}
            className={cn(
              "flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
              payerMode === 'multiple' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            )}
          >
            <Users className="w-4 h-4" /> Più persone
          </button>
        </div>

        {/* INPUT IMPORTI */}
        {payerMode === 'single' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex gap-2">
              <div className="w-1/3">
                 <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={singlePayer}
                  onChange={(e) => setSinglePayer(e.target.value)}
                >
                  {group.members.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="0.00"
                  value={singleAmount}
                  onChange={(e) => setSingleAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {payerMode === 'multiple' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200 bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-[150px] overflow-y-auto">
            {group.members.map(member => (
              <div key={member} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 w-24 truncate">{member}</span>
                <div className="relative flex-1">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="flex h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={multiPayers[member] || ''}
                    onChange={(e) => handleMultiPayerChange(member, e.target.value)}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 flex justify-between items-center border-t border-slate-200 mt-2">
              <span className="text-sm font-bold text-slate-700">Totale pagato:</span>
              <span className="text-sm font-bold text-primary">{totalAmount.toFixed(2)} €</span>
            </div>
          </div>
        )}
      </div>

      {/* SEZIONE: PER CHI È LA SPESA */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
        <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          Per chi è la spesa? (Divisione)
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
                onClick={() => toggleInvolved(member)}
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