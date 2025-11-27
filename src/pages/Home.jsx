import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { useGroups } from '../context/GroupContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function Home() {
  const { groups } = useGroups();

  return (
    <div className="space-y-6">
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
          // --- EMPTY STATE (Nessun gruppo) ---
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
          // --- LISTA GRUPPI ESISTENTI ---
          <>
            {groups.map((group) => (
              <Link to={`/group/${group.id}`} key={group.id} className="block group-card">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {group.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{group.name}</h3>
                        <p className="text-sm text-slate-500">
                          {group.members.length} membri • {group.expenses.length} spese
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </CardContent>
                </Card>
              </Link>
            ))}
            
            {/* Bottone Flottante (FAB) per aggiungere altri gruppi */}
            <div className="fixed bottom-6 right-6 md:absolute md:bottom-6 md:right-6">
              <Link to="/create-group">
                <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
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