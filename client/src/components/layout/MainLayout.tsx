import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { MobileDrawer } from '../common/MobileDrawer';

export const MainLayout: React.FC = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('procurex_sidebar_state') === 'collapsed';
  });

  const handleToggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('procurex_sidebar_state', nextState ? 'collapsed' : 'expanded');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Header Navbar */}
      <Navbar onToggleSidebar={() => setIsMobileDrawerOpen(true)} />

      {/* Mobile Off-Canvas Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Content Container */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* Main Fluid Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full min-w-0 transition-all duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
