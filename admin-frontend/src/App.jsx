// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './Layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import AuthHandler from './pages/AuthHandler';
import Songs from './pages/Songs/List';
import UserList from './pages/Users/List'; // <-- THÊM DÒNG NÀY
import Albums from './pages/Albums/List';
import Artists from './pages/Artists/List';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthHandler />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/songs" element={<Songs />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/albums" element={<Albums />} />
        <Route path="/artists" element={<Artists />} />
      </Route>
    </Routes>
  );
}

export default App;
