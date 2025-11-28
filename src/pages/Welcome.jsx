import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, LogIn, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const [username, setUsername] = useState('');
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    login(username);
    navigate('/');
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SmartSplit</h1>
          <p className="text-slate-500">Gestisci le spese condivise.</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <LogIn className="w-5 h-5 text-primary" /> Accedi
              </h2>
              <form onSubmit={handleLogin} className="space-y-3">
                <Input placeholder="Il tuo nome" value={username} onChange={(e) => setUsername(e.target.value)} />
                <Button className="w-full" type="submit" disabled={!username.trim()}>Entra</Button>
              </form>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">Oppure</span></div>
            </div>
            <Button variant="secondary" className="w-full" onClick={handleGuest}>
              <User className="w-4 h-4 mr-2" /> Continua come Ospite
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}