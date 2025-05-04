import { Routes, Route } from 'react-router-dom';
import AdminLayout from './Layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import AuthHandler from './pages/AuthHandler';
import Songs from './pages/Songs/List';
import UserList from './pages/Users/List';
import Albums from './pages/Albums/List';
import Artists from './pages/Artists/List';
import Login from './pages/Login'; // Import component Login

function App() {
  return (
    <Routes>
      {/* Route cho trang login (không sử dụng layout admin) */}
      <Route path="/login" element={<Login />} />

      {/* Route xử lý auth callback */}
      <Route path="/auth" element={<AuthHandler />} />

      {/* Các route sử dụng AdminLayout (yêu cầu đăng nhập) */}
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