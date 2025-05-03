import { NavLink } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  AppstoreOutlined,
  HeartOutlined,
} from '@ant-design/icons';

const navItems = [
  { to: '/', icon: <HomeOutlined />, label: 'Home' },
  { to: '/users', icon: <UserOutlined />, label: 'Users' },
  { to: '/songs', icon: <CustomerServiceOutlined />, label: 'Songs' },
  { to: '/albums', icon: <AppstoreOutlined />, label: 'Albums' },
  { to: '/artists', icon: <HeartOutlined />, label: 'Artists' },
];

const Sidebar = () => {
  return (
    <div className="w-[240px] bg-black h-screen flex flex-col border-r border-[#282828]">
      {/* Logo Spotify thực tế */}
      <div className="p-6 pb-8">
        <div className="flex items-center">
          <img
            src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png"
            alt="Spotify Logo"
            className="h-10"
          />
          <span className="ml-2 text-white font-bold text-lg">Admin</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-md text-sm transition-all duration-200 ${isActive
                ? 'bg-[#282828] text-white font-semibold'
                : 'text-[#b3b3b3] hover:text-white hover:bg-[#282828]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-xl ${isActive ? 'text-[#1DB954]' : 'text-inherit'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-6 py-6 border-t border-[#282828] text-[#b3b3b3] text-xs">
        <div className="mb-1">Spotify Admin Panel</div>
        <div>© {new Date().getFullYear()} Spotify AB</div>
      </div>
    </div>
  );
};

export default Sidebar;