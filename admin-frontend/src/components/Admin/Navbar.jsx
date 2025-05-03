import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Menu, Button, Divider, Tooltip, Badge } from 'antd';
import {
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  const menu = (
    <Menu className="bg-white border border-gray-200 rounded-md shadow-lg w-56">
      {/* User Profile Section */}
      <Menu.Item disabled className="!px-4 !py-3 !h-auto hover:!bg-gray-50">
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="bg-green-500 text-white font-medium"
          >
            AU
          </Avatar>
          <div className="flex flex-col">
            <span className="text-gray-800 font-semibold">Admin User</span>
            <span className="text-gray-500 text-xs">admin@example.com</span>
          </div>
        </div>
      </Menu.Item>
      <Divider className="!my-2 !bg-gray-200" />

      {/* Menu Items */}
      <Menu.Item
        key="settings"
        className="!px-4 !py-2 !h-10 text-gray-700 hover:!bg-gray-50 hover:!text-green-500"
      >
        <div className="flex items-center gap-3">
          <SettingOutlined className="text-lg text-gray-500" />
          <span>Settings</span>
        </div>
      </Menu.Item>
      <Menu.Item
        key="help"
        className="!px-4 !py-2 !h-10 text-gray-700 hover:!bg-gray-50 hover:!text-green-500"
      >
        <div className="flex items-center gap-3">
          <QuestionCircleOutlined className="text-lg text-gray-500" />
          <span>Help</span>
        </div>
      </Menu.Item>
      <Divider className="!my-2 !bg-gray-200" />
      <Menu.Item
        key="logout"
        onClick={handleLogout}
        className="!px-4 !py-2 !h-10 text-gray-700 hover:!bg-gray-50 hover:!text-red-500"
      >
        <div className="flex items-center gap-3">
          <LogoutOutlined className="text-lg text-gray-500" />
          <span>Log out</span>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="w-full bg-white h-16 border-b border-gray-200 flex items-center justify-end px-6 sticky top-0 z-50 shadow-sm">
      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Help Button */}
        <Tooltip title="Help" placement="bottom">
          <Button
            type="text"
            icon={<QuestionCircleOutlined className="text-gray-500 text-lg" />}
            className="!w-10 !h-10 flex items-center justify-center hover:!bg-gray-100 hover:!text-green-500"
          />
        </Tooltip>

        {/* Notifications with badge */}
        <Tooltip title="Notifications" placement="bottom">
          <Badge count={5} color="#52c41a">
            <Button
              type="text"
              icon={<BellOutlined className="text-gray-500 text-lg" />}
              className="!w-10 !h-10 flex items-center justify-center hover:!bg-gray-100 hover:!text-green-500"
            />
          </Badge>
        </Tooltip>

        {/* User dropdown */}
        <Dropdown
          overlay={menu}
          trigger={['click']}
          placement="bottomRight"
          open={dropdownOpen}
          onOpenChange={(open) => setDropdownOpen(open)}
        >
          <Button
            type="text"
            className="!h-10 !px-2 !py-1 flex items-center gap-2 hover:!bg-gray-100"
          >
            <Avatar
              size={32}
              className="!bg-gray-300 !text-gray-800 font-medium"
            >
              AU
            </Avatar>
            <DownOutlined className={`text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar;