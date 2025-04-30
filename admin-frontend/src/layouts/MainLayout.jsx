import { Outlet } from "react-router-dom";

import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "@/hooks/use-click-outside";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";

import { ConfigProvider, Modal, Button, Table, Space, Tag } from "antd";
import { theme as antdTheme } from 'antd';
import { useTheme } from "@/hooks/use-theme";
import { useLocation } from 'react-router-dom';

import { showToastMessage } from '@/utils/toast'

import { ToastContainer, toast } from 'react-toastify';

const MainLayout = () => {
  const { theme } = useTheme();

  const isDesktopDevice = useMediaQuery("(min-width: 768px)");
  const [collapsed, setCollapsed] = useState(!isDesktopDevice);

  const sidebarRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.toast) {
      const { message, type } = location.state.toast;
      showToastMessage(message, type);
    }
  }, []);

  useEffect(() => {
    setCollapsed(!isDesktopDevice);
  }, [isDesktopDevice]);

  useClickOutside([sidebarRef], () => {
    if (!isDesktopDevice && !collapsed) {
      setCollapsed(true);
    }
  });

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,  // Kích hoạt chế độ dark mode
        token: {
          colorBgBase: theme === 'dark' ? "#0f172a" : "#fff",
          colorBgContainer: theme === 'dark' ? "#0f172a" : "#fff",
          colorBgElevated: theme === 'dark' ? "#0f172a" : "#fff"
        },
        components: {
          Table: {
            headerBorderRadius: 5
          },
          Input: {
            borderRadius: 5,
            borderRadiusLG: 5,
            borderRadiusSM: 5
          },
          Card: {
            bodyPadding: 15
          },
          Tooltip: {
            colorBgSpotlight: theme === 'dark' ? "#0f172a" : "#fff",
            colorTextLightSolid: theme === 'dark' ? "#fff" : "0f172a",
          }
        }


      }}
    >
      <div className="min-h-screen bg-slate-100 transition-colors dark:bg-slate-950">
        <div
          className={cn(
            "pointer-events-none fixed inset-0 -z-10 bg-black opacity-0 transition-opacity",
            !collapsed && "max-md:pointer-events-auto max-md:z-50 max-md:opacity-30",
          )}
        />
        <Sidebar
          ref={sidebarRef}
          collapsed={collapsed}
        />
        <div className={cn("transition-[margin] duration-300", collapsed ? "md:ml-[70px]" : "md:ml-[240px]")}>
          {/* <Header
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          /> */}
          <div className="h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden p-6">


            <Outlet />


          </div>
          <Footer />
        </div>
      </div>
      <ToastContainer/>
      
    </ConfigProvider>
  );
}

export default MainLayout
