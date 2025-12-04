import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { Button } from './components/ui/Button';

import Welcome from './pages/Welcome';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import JoinGroup from './pages/JoinGroup';

// Componente per la schermata di verifica
const VerifyEmailScreen = () => {
  const { user, resendVerification, checkVerification, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheck = async () => {
    setChecking(true);
    const verified = await checkVerification();
    setChecking(false);
    if (verified) {
      // Se verificato, il componente ProtectedRoute renderizzerà automaticamente i children
    } else {
      setMessage('Email non ancora verificata. Hai cliccato sul link?');
    }
  };

  const handleResend = async () => {
    await resendVerification();
    setMessage('Link inviato nuovamente!');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Verifica la tua Email</h2>
        <p className="text-sm text-slate-500 mb-6">
          Abbiamo inviato un link di conferma a <br/><span className="font-medium text-slate-900">{user.email}</span>.
          <br/>Clicca sul link per attivare il tuo account.
        </p>

        <div className="space-y-3">
          <Button onClick={handleCheck} className="w-full" isLoading={checking}>
            <RefreshCw className="w-4 h-4 mr-2" /> Ho verificato
          </Button>
          
          <Button variant="secondary" onClick={handleResend} className="w-full">
            Invia di nuovo email
          </Button>
        </div>

        {message && <p className="text-xs text-primary mt-4 font-medium animate-pulse">{message}</p>}
      </div>
      
      <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-2">
        <LogOut className="w-4 h-4" /> Esci e usa un altro account
      </button>
    </div>
  );
};

// Componente Protezione
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Caricamento...</div>;
  
  // 1. Se non loggato -> Welcome
  if (!user) return <Welcome />; 
  
  // 2. Se loggato ma non ospite E non verificato -> Schermata Verifica
  if (!user.isGuest && !user.emailVerified) {
    return <VerifyEmailScreen />;
  }
  
  // 3. Tutto ok -> Mostra contenuto
  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        {/* La Home ora è protetta dalla verifica email */}
        <Route path="/" element={
          !user ? <Welcome /> : 
          (!user.isGuest && !user.emailVerified) ? <VerifyEmailScreen /> : 
          <Home />
        } />
        
        <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
        <Route path="/join-group" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
        <Route path="/group/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <GroupProvider>
        <AppContent />
      </GroupProvider>
    </AuthProvider>
  );
}

export default App;