import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarPlus,
  Radio,
  FileText,
  User,
  Users,
  Building2,
  CalendarRange,
  Scale,
  Truck,
  BarChart3,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Landmark,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role || 'FARMER';

  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('procurex_sidebar_state') === 'collapsed';
  });

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      const nextState = !internalCollapsed;
      setInternalCollapsed(nextState);
      localStorage.setItem('procurex_sidebar_state', nextState ? 'collapsed' : 'expanded');
    }
  };

  const farmerNav = [
    { name: t('nav.dashboard'), path: '/farmer', icon: LayoutDashboard },
    { name: t('nav.bookSlot'), path: '/farmer/book', icon: CalendarPlus },
    { name: t('nav.myBookings'), path: '/farmer/history', icon: FileText },
    { name: t('nav.myQueue'), path: '/farmer/live-queue', icon: Radio },
    { name: t('nav.profile'), path: '/farmer/profile', icon: User },
  ];

  const storageNav = [
    { name: t('nav.dashboard'), path: '/storage', icon: LayoutDashboard },
    { name: t('nav.liveQueue'), path: '/storage/queue-desk', icon: Radio },
    { name: t('nav.procurement'), path: '/storage/procurement', icon: Scale },
    { name: t('nav.todaysSchedule'), path: '/storage/slots', icon: CalendarRange },
    { name: t('nav.transportTasks'), path: '/logistics', icon: Truck },
  ];

  const logisticsNav = [
    { name: t('nav.dashboard'), path: '/logistics', icon: LayoutDashboard },
    { name: t('nav.transportTasks'), path: '/logistics', icon: Truck },
  ];

  const adminNav = [
    { name: t('nav.dashboard'), path: '/admin', icon: BarChart3 },
    { name: t('nav.centres'), path: '/admin/centres', icon: Building2 },
    { name: t('nav.users'), path: '/admin/users', icon: Users },
    { name: t('nav.auditLogs'), path: '/admin/audit-logs', icon: ScrollText },
  ];

  let currentNav = farmerNav;
  let RoleIcon = Sprout;
  if (role === 'STORAGE_AUTHORITY') {
    currentNav = storageNav;
    RoleIcon = Building2;
  } else if (role === 'LOGISTICS') {
    currentNav = logisticsNav;
    RoleIcon = Truck;
  } else if (role === 'ADMIN') {
    currentNav = adminNav;
    RoleIcon = Landmark;
  }

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-80px)] transition-all duration-200 ease-in-out relative z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-3.5 space-y-5">
        {/* Role Badge Indicator */}
        <div
          className={`p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center transition-all ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          }`}
          title={isCollapsed ? `${t(`roles.${role}`)} Portal` : undefined}
        >
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
            <RoleIcon size={18} />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase font-extrabold text-[#4B5563] tracking-wider">
                {t('roles.' + role)}
              </p>
              <p className="text-xs font-black text-[#1F2937] truncate">
                {user?.name || role.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {!isCollapsed && (
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#4B5563] px-3 mb-2">
              {t('common.details')}
            </p>
          )}

          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.path} className="relative group">
                <NavLink
                  to={item.path}
                  end={
                    item.path === '/farmer' ||
                    item.path === '/storage' ||
                    item.path === '/logistics' ||
                    item.path === '/admin'
                  }
                  className={({ isActive }) =>
                    `flex items-center rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 active:scale-[0.98] ${
                      isCollapsed
                        ? 'justify-center p-3 w-12 h-12 mx-auto'
                        : 'space-x-3 px-3.5 py-2.5 w-full'
                    } ${
                      isActive
                        ? 'bg-[#15803D] text-white shadow-2xs'
                        : 'text-[#4B5563] hover:bg-slate-100 hover:text-[#1F2937]'
                    }`
                  }
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </NavLink>

                {/* Floating Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {item.name}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Banner & Collapse Toggle Button */}
      <div className="p-3 border-t border-slate-100 space-y-3">
        {!isCollapsed && (
          <div className="p-3 bg-[#DCFCE7]/60 rounded-xl border border-[#86EFAC] flex items-center space-x-2.5 text-xs text-[#166534]">
            <div className="w-2 h-2 rounded-full bg-[#15803D] animate-ping shrink-0" />
            <div className="overflow-hidden">
              <span className="font-extrabold block text-xs">Direct MSP Payout</span>
              <span className="text-[10px] text-[#166534] block truncate">
                Aadhaar DBT Gateway Active
              </span>
            </div>
          </div>
        )}

        {/* Expand / Collapse Toggle Button */}
        <button
          onClick={handleToggle}
          aria-label={isCollapsed ? t('nav.expandNav') : t('nav.collapseNav')}
          aria-expanded={!isCollapsed}
          className={`w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-[#4B5563] hover:text-[#1F2937] text-xs font-bold flex items-center transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!isCollapsed && <span className="text-[11px]">{t('nav.collapseNav')}</span>}
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
