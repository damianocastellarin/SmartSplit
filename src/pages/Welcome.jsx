import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, User, Loader2, AlertCircle, MailCheck } from 'lucide-react'; // Aggiungi MailCheck
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false); // Nuovo stato per messaggio successo
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const { login, signup, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        if (!name.trim()) throw new Error("Inserisci il tuo nome.");
        await signup(email, password, name);
        // Invece di navigare subito, mostriamo messaggio di verifica
        setVerificationSent(true);
        setIsLogin(true); // Switcha a login
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') setError('Email o password errati.');
      else if (err.code === 'auth/email-already-in-use') setError('Questa email è già usata.');
      else if (err.code === 'auth/weak-password') setError('Password troppo corta (min 6 caratteri).');
      else if (err.message) setError(err.message);
      else setError('Errore sconosciuto. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center space-y-2">
          <div className="bg-white p-4 rounded-2xl shadow-sm inline-flex mb-2">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SmartSplit</h1>
          <p className="text-slate-500">Gestisci le spese senza stress.</p>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setIsLogin(true); setError(''); setVerificationSent(false); }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${isLogin ? 'text-primary border-b-2 border-primary bg-slate-50/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Accedi
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setVerificationSent(false); }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${!isLogin ? 'text-primary border-b-2 border-primary bg-slate-50/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Registrati
            </button>
          </div>

          <CardContent className="p-6 space-y-6">
            
            {/* Messaggio Successo Registrazione */}
            {verificationSent && (
              <div className="bg-emerald-50 text-emerald-800 text-sm p-4 rounded-lg flex items-start gap-3 border border-emerald-100">
                <MailCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Controlla la tua email!</p>
                  <p>Ti abbiamo inviato un link di conferma. Cliccalo e poi accedi qui.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <div className="space-y-1 animate-in fade-in slide-in-from-left-2">
                  <Input 
                    placeholder="Il tuo Nome" 
                    icon={<User className="w-4 h-4" />}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}

              <Input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <Input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="bg-red-50 text-danger text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button className="w-full h-11 text-base shadow-lg shadow-primary/20" type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Entra' : 'Crea account')}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Oppure</span></div>
            </div>

            <Button variant="secondary" className="w-full h-11 border-slate-200 hover:bg-slate-50 text-slate-600" onClick={handleGuest}>
              <User className="w-4 h-4 mr-2" /> Continua senza account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}