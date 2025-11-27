import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/group/:id" element={<GroupDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;