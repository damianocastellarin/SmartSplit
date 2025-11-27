import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Receipt, PieChart, Wallet, BarChart3, Share2, Pencil, Trash2 } from 'lucide-react';
import { useGroups } from '../context/GroupContext';
import { calculateGroupStats, calculateSettlements } from '../services/balanceService';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { cn } from '../utils/cn';
import AddExpenseForm from '../components/AddExpenseForm';
import BalancesList from '../components/BalancesList';
import SettlementPlan from '../components/SettlementPlan';
import StatsDashboard from '../components/StatsDashboard';

export default function GroupDetail() {
  const { id } = useParams();
  const { getGroup, addExpense, deleteExpense, editExpense } = useGroups();
  
  // Stati UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null); // Se popolato, siamo in edit mode
  const [activeTab, setActiveTab] = useState('expenses');

  const group = getGroup(id);

  if (!group) return <div className="p-8 text-center">Gruppo non trovato</div>;

  // Calcoli
  const balances = calculateGroupStats(group);
  const settlements = calculateSettlements(balances);
  const totalSpent = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // --- HANDLERS ---

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleSave = (data) => {
    if (editingExpense) {
      editExpense(group.id, editingExpense.id, data);
    } else {
      addExpense(group.id, data);
    }
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = (expenseId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa spesa?')) {
      deleteExpense(group.id, expenseId);
    }
  };

  // Funzione Share WhatsApp
  const handleShare = async () => {
    if (settlements.length === 0) {
      alert("Nessun debito da saldare!");
      return;
    }

    let text = `📊 *Riepilogo: ${group.name}*\n\n`;
    text += `Totale speso: ${totalSpent.toFixed(2)}€\n\n`;
    text += `*COME PAREGGIARE I CONTI:*\n`;
    
    settlements.forEach(s => {
      text += `👉 ${s.from} deve ${s.amount.toFixed(2)}€ a ${s.to}\n`;
    });

    text += `\nGenerato con SmartSplit`;

    // Prova a usare la condivisione nativa (Mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Riepilogo ${group.name}`,
          text: text,
        });
      } catch (err) {
        console.log('Condivisione annullata');
      }
    } else {
      // Fallback Desktop: Copia negli appunti
      navigator.clipboard.writeText(text);
      alert('Riepilogo copiato negli appunti! Incollalo su WhatsApp.');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 -mx-4 -mt-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{group.name}</h1>
            <p className="text-xs text-slate-500">{group.members.length} membri</p>
          </div>
        </div>
        {/* Tasto Share (Visibile solo nel tab Saldi o Stats) */}
        {activeTab === 'balances' && (
          <Button variant="ghost" size="icon" onClick={handleShare} className="text-primary">
            <Share2 className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Banner Totale */}
      {activeTab !== 'stats' && (
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
          <p className="text-sm font-medium opacity-90 uppercase tracking-wider">Totale Gruppo</p>
          <p className="text-4xl font-bold mt-1">
            {totalSpent.toFixed(2)} €
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('expenses')}
          className={cn(
            "py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1",
            activeTab === 'expenses' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Receipt className="w-4 h-4" /> <span className="hidden sm:inline">Spese</span>
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={cn(
            "py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1",
            activeTab === 'balances' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Wallet className="w-4 h-4" /> <span className="hidden sm:inline">Saldi</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            "py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1",
            activeTab === 'stats' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <BarChart3 className="w-4 h-4" /> <span className="hidden sm:inline">Stats</span>
        </button>
      </div>

      {/* TAB SPESE (Con Azioni Edit/Delete) */}
      {activeTab === 'expenses' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Ultime Attività</h2>
          </div>

          {group.expenses.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
              <p>Nessuna spesa ancora.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {group.expenses.map((expense) => (
                <Card key={expense.id} className="border-none shadow-sm hover:shadow-md transition-shadow group relative">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-slate-900">{expense.description}</h3>
                      <div className="flex items-center text-xs text-slate-500 mt-1 gap-2">
                        <span className="font-medium text-primary">{expense.paidBy}</span>
                        <span>•</span>
                        <span>{new Date(expense.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span>
                        
                        {/* Indicatore se è una spesa divisa non equamente */}
                        {expense.involvedMembers && expense.involvedMembers.length < group.members.length && (
                          <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px]">
                            {expense.involvedMembers.length} persone
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="block font-bold text-slate-900">{expense.amount.toFixed(2)} €</span>
                      
                      {/* Azioni (Edit/Delete) - Visibili al click o hover */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleOpenEdit(expense)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-slate-400 hover:text-danger hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB SALDI (Con tasto Share in alto) */}
      {activeTab === 'balances' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Situazione Membri</h2>
            <BalancesList balances={balances} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-slate-400" />
              Piano di Rientro
            </h2>
            <SettlementPlan settlements={settlements} />
            
            {settlements.length > 0 && (
               <Button variant="secondary" className="w-full mt-4" onClick={handleShare}>
                 <Share2 className="w-4 h-4 mr-2" />
                 Condividi su WhatsApp
               </Button>
            )}
          </div>
        </div>
      )}

      {/* TAB STATS */}
      {activeTab === 'stats' && (
        <StatsDashboard group={group} />
      )}

      {/* FAB Button */}
      <div className="fixed bottom-6 right-6 z-20 md:absolute md:bottom-6 md:right-6">
        <Button 
          onClick={handleOpenAdd}
          className="h-14 px-6 rounded-full shadow-xl bg-primary hover:bg-primary-hover text-white flex items-center gap-2"
        >
          <Plus className="w-6 h-6" />
          <span className="font-medium">Spesa</span>
        </Button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingExpense ? "Modifica Spesa" : "Aggiungi Spesa"}
      >
        <AddExpenseForm 
          group={group} 
          onSubmit={handleSave} 
          onCancel={() => setIsModalOpen(false)} 
          initialData={editingExpense}
        />
      </Modal>
    </div>
  );
}