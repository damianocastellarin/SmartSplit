import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useGroups } from '../context/GroupContext';

export default function JoinGroup() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { joinGroup } = useGroups();

  const handleJoin = () => {
    if (!code.trim()) return;
    const success = joinGroup(code.trim().toUpperCase());
    if (success) navigate('/');
    else setError('Codice gruppo non valido.');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-6 h-6" /></Button>
        <h1 className="text-2xl font-bold text-slate-900">Unisciti</h1>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="text-center mb-4">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"><Hash className="w-6 h-6 text-primary" /></div>
            <p className="text-sm text-slate-500">Inserisci il codice invito del gruppo.</p>
          </div>
          <div className="space-y-2">
            <Input 
              placeholder="Codice (es. AB12CD)" 
              value={code} 
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              className="text-center font-mono text-lg uppercase tracking-widest"
              maxLength={6}
            />
            {error && <p className="text-xs text-danger text-center font-medium">{error}</p>}
          </div>
          <Button className="w-full" onClick={handleJoin} disabled={code.length < 3}><Search className="w-4 h-4 mr-2" /> Unisciti</Button>
        </CardContent>
      </Card>
    </div>
  );
}