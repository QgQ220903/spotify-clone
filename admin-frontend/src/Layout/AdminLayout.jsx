import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Admin/Sidebar';
import Navbar from '../components/Admin/Navbar';

const AdminLayout = () => {
  return (
    <div className="h-screen flex bg-gray-100 text-gray-800 overflow-hidden">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Khu vực chính bên phải */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar trên cùng */}
        <Navbar />

        {/* Nội dung chính */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;