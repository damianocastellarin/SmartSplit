import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Receipt, Wallet, BarChart3, Share2, Pencil, Trash2, Settings, Save, AlertTriangle, Users, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useGroups } from '../context/GroupContext';
import { calculateGroupStats, calculateSettlements } from '../services/balanceService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { cn } from '../utils/cn';
import AddExpenseForm from '../components/AddExpenseForm';
import BalancesList from '../components/BalancesList';
import SettlementPlan from '../components/SettlementPlan';
import StatsDashboard from '../components/StatsDashboard';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGroup, addExpense, deleteExpense, editExpense, deleteGroup, updateGroupFull } = useGroups();
  
  const group = getGroup(id);

  // Stati UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses');

  // Stati Gestione Settings
  const [editGroupName, setEditGroupName] = useState('');
  const [editMembers, setEditMembers] = useState([]);
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    if (group) {
      setEditGroupName(group.name);
      setEditMembers(group.members.map((m, i) => ({ id: i, oldName: m, newName: m, isNew: false })));
      setSettingsError(''); // Resetta errori all'apertura
    }
  }, [group, isSettingsOpen]);

  if (!group) return <div className="p-8 text-center">Gruppo non trovato</div>;

  const balances = calculateGroupStats(group);
  const settlements = calculateSettlements(balances);
  const totalSpent = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // --- CALCOLO STATISTICHE MEMBRI ---
  const memberStats = useMemo(() => {
    const stats = group.members.map(member => {
      const paid = group.expenses.reduce((sum, exp) => {
        if (Array.isArray(exp.paidBy)) {
          const payment = exp.paidBy.find(p => p.member === member);
          return sum + (payment ? payment.amount : 0);
        }
        return exp.paidBy === member ? sum + exp.amount : sum;
      }, 0);
      const balance = balances[member] || 0;
      return { name: member, paid, balance };
    });
    const maxPaid = Math.max(...stats.map(s => s.paid), 1); 
    return stats.sort((a, b) => b.paid - a.paid).map(s => ({
      ...s,
      percentage: (s.paid / maxPaid) * 100,
      isTopSpender: s.paid === maxPaid && s.paid > 0
    }));
  }, [group, balances]);

  // --- HELPERS ---
  const formatPayerName = (expense) => {
    if (Array.isArray(expense.paidBy)) {
      if (expense.paidBy.length === 1) return expense.paidBy[0].member;
      return `${expense.paidBy[0].member} + ${expense.paidBy.length - 1} altri`;
    }
    return expense.paidBy;
  };

  const handleSettleDebt = (settlement) => {
    const confirmMsg = `Confermi che ${settlement.from} ha restituito ${settlement.amount.toFixed(2)}€ a ${settlement.to}?`;
    if (window.confirm(confirmMsg)) {
      addExpense(group.id, {
        description: "Saldo Debiti",
        amount: settlement.amount,
        paidBy: [{ member: settlement.from, amount: settlement.amount }],
        involvedMembers: [settlement.to],
        date: new Date().toISOString()
      });
    }
  };

  // --- HANDLERS SETTINGS (CON FIX DUPLICATI) ---
  const handleMemberNameChange = (index, val) => {
    const newMembers = [...editMembers];
    newMembers[index].newName = val;
    setEditMembers(newMembers);
    setSettingsError(''); // Pulisci errore mentre scrive
  };

  const handleAddMemberSlot = () => setEditMembers([...editMembers, { id: Date.now(), oldName: null, newName: '', isNew: true }]);

  const handleRemoveMemberSlot = (index) => {
    const member = editMembers[index];
    if (!member.isNew) {
      const hasExpenses = group.expenses.some(e => {
        const payerCheck = Array.isArray(e.paidBy) ? e.paidBy.some(p => p.member === member.oldName) : e.paidBy === member.oldName;
        return payerCheck || e.involvedMembers.includes(member.oldName);
      });
      if (hasExpenses) { setSettingsError(`Impossibile eliminare ${member.oldName}: ha spese.`); return; }
    }
    setEditMembers(editMembers.filter((_, i) => i !== index));
  };

  const handleSaveSettings = () => {
    if (!editGroupName.trim()) return setSettingsError("Nome obbligatorio.");
    
    // Filtra e pulisce i nomi
    const validMembers = editMembers.filter(m => m.newName.trim());
    
    if (validMembers.length < 2) return setSettingsError("Minimo 2 membri.");

    // --- CONTROLLO DUPLICATI (FIX) ---
    const lowerCaseNames = validMembers.map(m => m.newName.trim().toLowerCase());
    const hasDuplicates = lowerCaseNames.some((name, index) => lowerCaseNames.indexOf(name) !== index);

    if (hasDuplicates) {
      return setSettingsError("Ci sono nomi duplicati tra i partecipanti.");
    }

    updateGroupFull(group.id, editGroupName, validMembers.map(m => ({ oldName: m.isNew ? null : m.oldName, newName: m.newName.trim() })));
    setIsSettingsOpen(false);
  };

  const handleDeleteGroup = () => { if (window.confirm('Eliminazione irreversibile. Confermi?')) { deleteGroup(group.id); navigate('/'); }};

  // --- ALTRI HANDLERS ---
  const handleOpenAdd = () => { setEditingExpense(null); setIsModalOpen(true); };
  const handleOpenEdit = (exp) => { setEditingExpense(exp); setIsModalOpen(true); };
  const handleSaveExpense = (data) => {
    if (editingExpense) editExpense(group.id, editingExpense.id, data); else addExpense(group.id, data);
    setIsModalOpen(false);
  };
  const handleDeleteExpense = (id) => { if (window.confirm('Eliminare spesa?')) deleteExpense(group.id, id); };
  const handleShare = async () => {
    let text = `📊 *${group.name}*\n\nTotale: ${totalSpent.toFixed(2)}€\n\n*SALDI:*\n`;
    settlements.forEach(s => text += `👉 ${s.from} -> ${s.to}: ${s.amount.toFixed(2)}€\n`);
    if (navigator.share) await navigator.share({ title: group.name, text }); else { navigator.clipboard.writeText(text); alert('Copiato!'); }
  };

  return (
    <div className="pb-24 flex flex-col min-h-screen">
      
      {/* --- INIZIO BLOCCO FISSO (STICKY) --- */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        
        {/* Header (Titolo e Bottoni) */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-6 h-6" /></Button></Link>
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-slate-900 leading-tight truncate max-w-[200px]">{group.name}</h1>
              <p className="text-xs text-slate-500">{group.members.length} membri</p>
            </div>
          </div>
          <div className="flex gap-1">
            {activeTab === 'balances' && settlements.length > 0 && <Button variant="ghost" size="icon" onClick={handleShare} className="text-primary"><Share2 className="w-5 h-5" /></Button>}
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}><Settings className="w-5 h-5 text-slate-600" /></Button>
          </div>
        </div>

        {/* Tabs di Navigazione (Spostate qui dentro per rimanere fisse) */}
        <div className="px-4 pb-2">
          <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-lg overflow-x-auto">
            {['expenses', 'members', 'balances', 'stats'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("py-2 px-1 text-xs sm:text-sm font-medium rounded-md transition-all capitalize whitespace-nowrap flex items-center justify-center gap-1", activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                {tab === 'expenses' && <><Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Spese</span></>}
                {tab === 'members' && <><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Membri</span></>}
                {tab === 'balances' && <><Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Saldi</span></>}
                {tab === 'stats' && <><BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Stats</span></>}
                <span className="sm:hidden">{tab === 'expenses' ? 'Spese' : tab === 'members' ? 'Membri' : tab === 'balances' ? 'Saldi' : 'Stats'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* --- FINE BLOCCO FISSO --- */}

      {/* CONTENUTO SCROLLABILE (Con padding laterale) */}
      <div className="px-4 mt-6 space-y-6">

        {/* Banner Totale (Scorre col contenuto) */}
        {activeTab !== 'stats' && activeTab !== 'members' && (
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
            <p className="text-sm font-medium opacity-90 uppercase tracking-wider">Totale Gruppo</p>
            <p className="text-4xl font-bold mt-1">{totalSpent.toFixed(2)} €</p>
          </div>
        )}

        {/* TAB SPESE */}
        {activeTab === 'expenses' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {group.expenses.length === 0 ? <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed"><p>Nessuna spesa.</p></div> : 
              group.expenses.map((expense) => (
                <Card key={expense.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-slate-900">{expense.description}</h3>
                      <div className="flex items-center text-xs text-slate-500 mt-1 gap-2">
                        <span className="font-medium text-primary">{formatPayerName(expense)}</span>
                        <span>•</span>
                        <span>{new Date(expense.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span>
                        {expense.description === "Saldo Debiti" && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">RIMBORSO</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn("block font-bold", expense.description === "Saldo Debiti" ? "text-emerald-600" : "text-slate-900")}>
                        {expense.amount.toFixed(2)} €
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleOpenEdit(expense)} className="p-2 text-slate-400 hover:text-blue-500 rounded-full"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-slate-400 hover:text-danger rounded-full"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </div>
        )}

        {/* TAB MEMBRI */}
        {activeTab === 'members' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 gap-3">
              {memberStats.map((member) => (
                <Card key={member.name} className="border border-slate-100 shadow-sm relative overflow-hidden">
                  {member.isTopSpender && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-white px-2 py-0.5 rounded-bl-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Trophy className="w-3 h-3" /> TOP
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm", member.isTopSpender ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-gradient-to-br from-blue-400 to-primary")}>
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                          <div className="flex items-center gap-2 text-xs">
                            {Math.abs(member.balance) < 0.01 ? (
                              <span className="text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"/> In pari</span>
                            ) : member.balance > 0 ? (
                              <span className="text-emerald-600 font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Riceve {member.balance.toFixed(2)}€</span>
                            ) : (
                              <span className="text-red-600 font-medium flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Deve {Math.abs(member.balance).toFixed(2)}€</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Contributo versato</span>
                        <span className="font-medium text-slate-700">{member.paid.toFixed(2)} €</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-500", member.isTopSpender ? "bg-yellow-400" : "bg-primary")} style={{ width: `${member.percentage}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB SALDI */}
        {activeTab === 'balances' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <BalancesList balances={balances} />
            <SettlementPlan settlements={settlements} onSettle={handleSettleDebt} />
          </div>
        )}

        {/* TAB STATS */}
        {activeTab === 'stats' && <StatsDashboard group={group} />}
      
      </div> 
      {/* Fine Contenuto Scrollabile */}

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-20 md:absolute md:bottom-6 md:right-6">
        <Button onClick={handleOpenAdd} className="h-14 px-6 rounded-full shadow-xl bg-primary hover:bg-primary-hover text-white flex items-center gap-2"><Plus className="w-6 h-6" /><span className="font-medium">Spesa</span></Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExpense ? "Modifica" : "Nuova Spesa"}>
        <AddExpenseForm group={group} onSubmit={handleSaveExpense} onCancel={() => setIsModalOpen(false)} initialData={editingExpense} />
      </Modal>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Impostazioni">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <Input label="Nome del Gruppo" value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} />
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Partecipanti</label>
            {editMembers.map((member, index) => (
              <div key={member.id} className="flex gap-2 items-center">
                <Input value={member.newName} onChange={(e) => handleMemberNameChange(index, e.target.value)} className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveMemberSlot(index)} disabled={editMembers.length <= 2} className="text-slate-400 hover:text-danger hover:bg-red-50"><Trash2 className="w-5 h-5" /></Button>
              </div>
            ))}
            <Button type="button" variant="ghost" onClick={handleAddMemberSlot} className="w-full border border-dashed border-slate-300 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5">
              <Plus className="w-4 h-4 mr-2" /> Aggiungi Persona
            </Button>
          </div>
          {settingsError && <div className="bg-red-50 text-danger p-3 rounded-lg text-sm flex gap-2"><AlertTriangle className="w-4 h-4" />{settingsError}</div>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsSettingsOpen(false)}>Annulla</Button>
            <Button className="flex-1" onClick={handleSaveSettings}><Save className="w-4 h-4 mr-2" /> Salva Modifiche</Button>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Zona Pericolosa</h4>
            <p className="text-xs text-slate-500 mb-4">L'eliminazione del gruppo è definitiva.</p>
            <Button variant="ghost" className="w-full border border-red-200 text-danger hover:bg-red-50 hover:text-red-700 transition-colors" onClick={handleDeleteGroup}>
              <Trash2 className="w-4 h-4 mr-2" /> Elimina Gruppo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}