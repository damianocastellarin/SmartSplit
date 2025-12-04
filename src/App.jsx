import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';

import Welcome from './pages/Welcome';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import JoinGroup from './pages/JoinGroup'; // Assicurati di averlo creato

// Protezione Rotte
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Caricamento...</div>;
  if (!user) return <Welcome />;
  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={!user ? <Welcome /> : <Home />} />
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