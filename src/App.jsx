import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';

import Welcome from './pages/Welcome';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
// Se hai creato JoinGroup, importalo:
// import JoinGroup from './pages/JoinGroup';

// Componente per proteggere le rotte
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Caricamento...</div>;
  
  if (!user) return <Welcome />; // Se non loggato, mostra Welcome
  
  return children;
};

// Contenuto dell'App separato per usare i Context
function AppContent() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        {/* Se l'utente non c'è, la root mostra Welcome, altrimenti Home */}
        <Route path="/" element={!user ? <Welcome /> : <Home />} />
        
        {/* Rotte che richiedono login */}
        <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
        <Route path="/group/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
        
        {/* Fallback per rotte sconosciute */}
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