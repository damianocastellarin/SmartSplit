import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { TrendingUp, PieChart as PieIcon, Award, Wallet } from 'lucide-react';

// --- CONFIGURAZIONE CATEGORIE ---
const CATEGORY_CONFIG = {
  food: { label: 'Cibo & Drink', color: '#EF4444' },
  transport: { label: 'Trasporti', color: '#3B82F6' },
  housing: { label: 'Casa & Bollette', color: '#10B981' },
  shopping: { label: 'Shopping', color: '#8B5CF6' },
  health: { label: 'Salute', color: '#EC4899' },
  fun: { label: 'Svago', color: '#F59E0B' },
  travel: { label: 'Viaggi', color: '#0EA5E9' },
  pets: { label: 'Animali', color: '#A855F7' },
  gifts: { label: 'Regali', color: '#F43F5E' },
  other: { label: 'Altro', color: '#64748B' } 
};

// Helper per capitalizzare la prima lettera
const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);

export default function StatsDashboard({ group }) {
  
  // --- ELABORAZIONE DATI ---
  const stats = useMemo(() => {
    const validExpenses = group.expenses.filter(e => e.description !== "Saldo Debiti");
    
    const total = validExpenses.reduce((sum, e) => sum + e.amount, 0);
    const average = total / (group.members.length || 1);

    // 1. Timeline
    const timelineMap = {};
    validExpenses.forEach(e => {
      const dateKey = new Date(e.date).toISOString().split('T')[0]; 
      timelineMap[dateKey] = (timelineMap[dateKey] || 0) + e.amount;
    });

    const timelineData = Object.entries(timelineMap)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, amount]) => ({
        displayDate: new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
        fullDate: date,
        amount
      }));

    // 2. Categorie
    const categoryMap = {};
    
    validExpenses.forEach(e => {
      let labelName;
      let color;
      
      const catKey = e.category || 'other'; 

      if (catKey === 'other') {
        // Usa la descrizione per creare una categoria ad-hoc
        labelName = `${capitalize(e.description)} (Altro)`;
        color = '#94A3B8'; 
      } else {
        const config = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.other;
        labelName = config.label;
        color = config.color;
      }

      if (!categoryMap[labelName]) {
        categoryMap[labelName] = { value: 0, color: color };
      }
      categoryMap[labelName].value += e.amount;
    });

    const categoryData = Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        value: data.value,
        color: data.color
      }))
      .sort((a, b) => b.value - a.value);

    // 3. Top Spenders
    const spenderMap = {};
    validExpenses.forEach(e => {
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

    return { total, average, timelineData, categoryData, topSpenders, count: validExpenses.length };
  }, [group]);

  if (stats.count === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <Wallet className="w-10 h-10 mb-2 opacity-50" />
        <p>Non ci sono ancora dati sufficienti.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Totale Speso</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Media / Persona</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.average.toFixed(2)} €</p>
          </CardContent>
        </Card>
      </div>

      {/* 1. Categorie Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-500">
            <PieIcon className="w-4 h-4" /> Categorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* GRAFICO */}
            <div className="h-[180px] w-[180px] relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value.toFixed(2)} €`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-400">TOTALE</span>
              </div>
            </div>

            {/* LEGENDA (Modificata con Grid per evitare tagli) */}
            <div className="w-full sm:w-auto max-h-[200px] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 sm:flex sm:flex-col gap-x-4 gap-y-2">
                {stats.categoryData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-xs gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-slate-600 font-medium truncate block" title={entry.name}>
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-slate-900 font-bold shrink-0">
                      {((entry.value / stats.total) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Andamento Temporale */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-500">
            <TrendingUp className="w-4 h-4" /> Andamento Temporale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="displayDate" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  cursor={{ stroke: '#3B82F6', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '8px 12px' }}
                  formatter={(value) => [`${value.toFixed(2)} €`, 'Speso']}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
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
        <CardContent className="space-y-4 pt-4">
          {stats.topSpenders.map((person, index) => (
            <div key={person.name} className="relative">
              <div className="flex items-center justify-between mb-1 z-10 relative">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm
                    ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-400' : 'bg-slate-200 text-slate-500'}
                  `}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-700">{person.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{person.amount.toFixed(2)} €</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${index === 0 ? 'bg-primary' : 'bg-slate-300'}`}
                  style={{ width: `${(person.amount / stats.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}