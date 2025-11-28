import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { TrendingUp, PieChart as PieIcon, Award } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function StatsDashboard({ group }) {
  
  const stats = useMemo(() => {
    // FIX: Filtriamo le spese per escludere i rimborsi
    const expenses = group.expenses.filter(e => e.description !== "Saldo Debiti");
    
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const average = total / (group.members.length || 1);

    // 1. Dati per Timeline (Bar Chart)
    const timelineMap = {};
    expenses.forEach(e => {
      const date = new Date(e.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
      timelineMap[date] = (timelineMap[date] || 0) + e.amount;
    });
    const timelineData = Object.entries(timelineMap).map(([date, amount]) => ({
      date, amount
    })).reverse(); 

    // 2. Dati per Categorie (Pie Chart)
    const categoryMap = {};
    expenses.forEach(e => {
      let cat = 'Altro';
      const desc = e.description.toLowerCase();
      if (desc.match(/pizza|cena|pranzo|sushi|spesa|bar|birra|acqua/)) cat = 'Cibo & Drink';
      else if (desc.match(/benzina|treno|aereo|uber|taxi|metro|biglietto/)) cat = 'Trasporti';
      else if (desc.match(/hotel|bnb|alloggio|casa|affitto|bolletta/)) cat = 'Casa & Alloggio';
      else if (desc.match(/cinema|museo|svago|gioco|regalo/)) cat = 'Svago';

      categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // 3. Top Spenders
    const spenderMap = {};
    expenses.forEach(e => {
      // Per i grafici, consideriamo solo chi ha PAGATO, ignorando i rimborsi
      const payer = Array.isArray(e.paidBy) ? e.paidBy[0].member : e.paidBy; // Semplificazione per visualizzazione
      
      // Se è pagamento multiplo, dovremmo iterare, ma per semplicità grafica prendiamo il principale o sommiamo
      if (Array.isArray(e.paidBy)) {
         e.paidBy.forEach(p => {
            spenderMap[p.member] = (spenderMap[p.member] || 0) + p.amount;
         });
      } else {
         spenderMap[e.paidBy] = (spenderMap[e.paidBy] || 0) + e.amount;
      }
    });
    
    const topSpenders = Object.entries(spenderMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, amount]) => ({ name, amount }));

    return { total, average, timelineData, categoryData, topSpenders };
  }, [group]);

  if (group.expenses.filter(e => e.description !== "Saldo Debiti").length === 0) {
    return <div className="text-center text-slate-500 py-10">Nessun dato per le statistiche.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase font-bold">Totale Speso</p>
            <p className="text-2xl font-bold text-primary">{stats.total.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase font-bold">Media / Persona</p>
            <p className="text-2xl font-bold text-slate-700">{stats.average.toFixed(2)} €</p>
          </CardContent>
        </Card>
      </div>

      {/* 1. Timeline Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-500">
            <TrendingUp className="w-4 h-4" /> Andamento Spese
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value.toFixed(2)} €`, 'Spesa']}
                />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Categorie Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-500">
            <PieIcon className="w-4 h-4" /> Categorie (Stimate)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {stats.categoryData.map((entry, index) => (
              <div key={index} className="flex items-center text-xs text-slate-600">
                <div 
                  className="w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                {entry.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Top Spenders List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-500">
            <Award className="w-4 h-4" /> Top Spenders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {stats.topSpenders.map((person, index) => (
            <div key={person.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                  ${index === 0 ? 'bg-yellow-500' : 'bg-slate-300'}
                `}>
                  {index + 1}
                </div>
                <span className="font-medium text-slate-700">{person.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(person.amount / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{person.amount.toFixed(0)} €</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}