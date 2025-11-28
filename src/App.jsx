import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';

import Welcome from './pages/Welcome';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import GroupDetail from './pages/GroupDetail';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
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