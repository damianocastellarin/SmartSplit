import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, ArrowRight, Sparkles, Receipt, Search, Hash, Loader2 } from 'lucide-react';
import { useGroups } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function Home() {
  const { groups, loading } = useGroups(); // Prendi anche 'loading'
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ciao, {user?.name}</h1>
          <p className="text-sm text-slate-500">I tuoi gruppi</p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-xs text-slate-400">Esci</Button>
      </div>

      {/* Pulsanti Rapidi */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/create-group">
          <Button variant="secondary" className="w-full bg-white border border-slate-200 shadow-sm h-12">
            <Plus className="w-4 h-4 mr-2" /> Nuovo
          </Button>
        </Link>
        <Link to="/join-group">
          <Button variant="secondary" className="w-full bg-white border border-slate-200 shadow-sm h-12">
            <Search className="w-4 h-4 mr-2" /> Unisciti
          </Button>
        </Link>
      </div>

      {/* Lista Gruppi */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nessun gruppo</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-[250px]">
                Crea un nuovo gruppo o unisciti a uno esistente tramite codice.
              </p>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => {
            const totalGroupSpent = group.expenses?.reduce((sum, exp) => {
              if (exp.description === "Saldo Debiti") return sum;
              return sum + exp.amount;
            }, 0) || 0;
            const isEmpty = group.expenses?.length === 0;

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
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-sm text-slate-500">{group.members.length} membri</span>
                           <span className="text-slate-300 text-[10px]">•</span> 
                           <div className="flex items-center gap-1 text-xs text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded w-fit border border-slate-100">
                             <Hash className="w-3 h-3" />
                             {group.shareCode}
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isEmpty ? (
                        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-slate-200">
                          <Sparkles className="w-3.5 h-3.5" /> 
                          <span className="hidden sm:inline">Nuovo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-blue-100">
                          <Receipt className="w-3.5 h-3.5 opacity-70" /> 
                          <span>{totalGroupSpent.toFixed(2)} €</span>
                        </div>
                      )}
                      <ArrowRight className="w-5 h-5 text-slate-300 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}