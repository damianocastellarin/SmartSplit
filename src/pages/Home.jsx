import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useGroups } from '../context/GroupContext';
import { calculateGroupStats, calculateSettlements } from '../services/balanceService';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function Home() {
  const { groups } = useGroups();

  // --- LOGICA STATUS GRUPPO ---
  const getGroupStatus = (group) => {
    // 1. STATUS: NUOVO (Nessuna spesa)
    if (!group.expenses || group.expenses.length === 0) {
      return { status: 'empty', amount: 0 };
    }

    // 2. Calcola i saldi
    const balances = calculateGroupStats(group);
    const settlements = calculateSettlements(balances);
    const totalPending = settlements.reduce((sum, s) => sum + s.amount, 0);

    // 3. STATUS: SALDATO vs IN CORSO
    if (totalPending < 0.1) {
      return { status: 'settled', amount: 0 };
    } else {
      return { status: 'pending', amount: totalPending };
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">I tuoi Gruppi</h1>
          <p className="text-sm text-slate-500">Gestisci le spese condivise</p>
        </div>
      </div>

      {/* Lista Gruppi */}
      <div className="space-y-4">
        {groups.length === 0 ? (
          // --- EMPTY STATE ---
          <Card className="border-dashed border-2 bg-slate-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nessun gruppo attivo</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-[250px]">
                Inizia creando un gruppo per dividere le spese con i tuoi amici o coinquilini.
              </p>
              <Link to="/create-group">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Crea Nuovo Gruppo
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          // --- LISTA GRUPPI ---
          <>
            {groups.map((group) => {
              const { status, amount } = getGroupStatus(group);

              return (
                <Link to={`/group/${group.id}`} key={group.id} className="block group-card relative">
                  <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                          {group.name.substring(0, 2).toUpperCase()}
                        </div>
                        
                        {/* Info */}
                        <div className="overflow-hidden">
                          <h3 className="font-semibold text-slate-900 truncate pr-2">{group.name}</h3>
                          <div className="flex items-center text-sm text-slate-500">
                             <span>{group.members.length} membri</span>
                             {/* Badge conteggio spese solo se ce ne sono */}
                             {group.expenses.length > 0 && (
                               <span className="hidden sm:inline"> • {group.expenses.length} spese</span>
                             )}
                          </div>
                        </div>
                      </div>

                      {/* BADGE DI STATUS (LATO DESTRO) */}
                      <div className="flex items-center gap-3">
                        
                        {/* CASO 1: VUOTO (NUOVO) */}
                        {status === 'empty' && (
                          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-slate-200">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Nuovo</span>
                          </div>
                        )}

                        {/* CASO 2: SALDATO */}
                        {status === 'settled' && (
                          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Saldato</span>
                          </div>
                        )}

                        {/* CASO 3: IN CORSO (PENDING) */}
                        {status === 'pending' && (
                          <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-orange-200">
                            <Clock className="w-3.5 h-3.5" />
                            <span>-{amount.toFixed(0)}€</span>
                          </div>
                        )}

                        {/* Freccina decorativa */}
                        <ArrowRight className="w-5 h-5 text-slate-300 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            
            {/* FAB */}
            <div className="fixed bottom-6 right-6 md:absolute md:bottom-6 md:right-6">
              <Link to="/create-group">
                <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary-hover text-white">
                  <Plus className="w-6 h-6" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}