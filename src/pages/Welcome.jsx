import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, AlertCircle, MailCheck, Eye, EyeOff, Lock, Mail, Info, Wallet } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // Stato per gestire l'errore di caricamento dell'immagine del logo
  const [logoError, setLogoError] = useState(false);

  const { login, signup, continueAsGuest, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        if (!name.trim()) throw new Error("Inserisci il tuo nome.");
        if (password !== confirmPassword) throw new Error("Le password non coincidono.");
        if (password.length < 6) throw new Error("La password deve essere di almeno 6 caratteri.");

        await signup(email, password, name);
        setVerificationSent(true);
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') setError('Email o password errati.');
      else if (err.code === 'auth/email-already-in-use') setError('Questa email è già usata.');
      else if (err.code === 'auth/weak-password') setError('Password troppo debole.');
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

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Inserisci la tua email nel campo sopra per recuperare la password.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setVerificationSent(false); 
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') setError('Nessun account trovato con questa email.');
      else if (err.code === 'auth/invalid-email') setError('Formato email non valido.');
      else setError('Impossibile inviare email di recupero.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      
      {/* Sfondo decorativo (Gradient Blobs) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER & LOGO PROFESSIONALE */}
        <div className="text-center flex flex-col items-center">
          {/* Contenitore Icona con effetto "Glow" */}
          <div className="relative mb-6 group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl p-3 shadow-md ring-1 ring-slate-100 flex items-center justify-center w-20 h-20">
              {!logoError ? (
                <img 
                  src="/logo.png" 
                  alt="SmartSplit Logo" 
                  className="w-full h-full object-contain" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Wallet className="w-10 h-10 text-primary" strokeWidth={1.5} />
              )}
            </div>
          </div>

          {/* Typography Logo */}
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900">
              Smart<span className="text-primary">Split</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm tracking-wide uppercase">
              Money Management
            </p>
          </div>
        </div>

        {/* CARD DI LOGIN/REGISTRAZIONE */}
        <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm ring-1 ring-slate-100">
          
          {/* TABS DI NAVIGAZIONE */}
          <div className="flex p-1 bg-slate-100/50 m-2 rounded-xl">
            <button
              onClick={() => { setIsLogin(true); setError(''); setVerificationSent(false); setResetSent(false); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isLogin 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Accedi
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setVerificationSent(false); setResetSent(false); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                !isLogin 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Registrati
            </button>
          </div>

          <CardContent className="p-6 pt-4 space-y-6">
            
            {/* MESSAGGI DI STATO */}
            {verificationSent && (
              <div className="bg-emerald-50 text-emerald-800 text-sm p-4 rounded-xl flex flex-col gap-2 border border-emerald-100 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-emerald-100 rounded-full"><MailCheck className="w-4 h-4 text-emerald-600" /></div>
                  <div>
                    <p className="font-bold">Controlla la tua email!</p>
                    <p className="text-emerald-700">Link di conferma inviato.</p>
                  </div>
                </div>
              </div>
            )}

            {resetSent && (
              <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl flex flex-col gap-2 border border-blue-100 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded-full"><Mail className="w-4 h-4 text-blue-600" /></div>
                  <div>
                    <p className="font-bold">Email inviata!</p>
                    <p className="text-blue-700">Controlla la posta per il reset.</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                  <Input 
                    placeholder="Il tuo Nome" 
                    icon={<User className="w-4 h-4" />}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
              )}

              <Input 
                type="email" 
                placeholder="Email" 
                icon={<Mail className="w-4 h-4" />} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
              
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                icon={<Lock className="w-4 h-4" />}
                endIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                onEndIconClick={() => setShowPassword(!showPassword)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />

              {!isLogin && (
                <div className="animate-in fade-in slide-in-from-left-2">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Conferma Password" 
                    icon={<Lock className="w-4 h-4" />}
                    endIcon={showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4 pt-2">
                <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all rounded-xl" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Accedi' : 'Crea Account')}
                </Button>

                {isLogin && (
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-slate-500 hover:text-primary transition-colors w-full text-center font-medium"
                  >
                    Hai dimenticato la password?
                  </button>
                )}
              </div>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-white px-2 text-slate-400 font-semibold">Oppure</span></div>
            </div>

            <Button variant="secondary" className="w-full h-12 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl" onClick={handleGuest}>
              <User className="w-4 h-4 mr-2" /> Continua come Ospite
            </Button>
          </CardContent>
        </Card>
        
        {/* FOOTER */}
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SmartSplit. All rights reserved.
        </p>

      </div>
    </div>
  );
}