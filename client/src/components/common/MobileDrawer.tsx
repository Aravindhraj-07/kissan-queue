import React, { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  X,
  Sprout,
  Landmark,
  LogOut,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role || 'FARMER';

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/', { replace: true });
  };

  // Automatically close drawer on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Body */}
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-fadeIn">
        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#15803D] text-white flex items-center justify-center font-black text-sm">
                PX
              </div>
              <span className="font-extrabold text-base text-[#1F2937]">ProcureX</span>
            </div>
            <button
              onClick={onClose}
              aria-label={t('nav.closeMenu')}
              className="p-1.5 rounded-xl text-[#4B5563] hover:text-[#1F2937] hover:bg-slate-100 transition active:scale-95 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Profile Tile */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center justify-center font-bold text-base shrink-0">
              <RoleIcon size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase font-extrabold text-[#4B5563] tracking-wider">
                {t('roles.' + role)}
              </p>
              <p className="text-xs font-black text-[#1F2937] truncate">
                {user?.name || role}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#4B5563] px-2 mb-2">
              Navigation
            </p>
            {currentNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={
                    item.path === '/farmer' ||
                    item.path === '/storage' ||
                    item.path === '/logistics' ||
                    item.path === '/admin'
                  }
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 active:scale-[0.98] ${
                      isActive
                        ? 'bg-[#15803D] text-white shadow-2xs'
                        : 'text-[#4B5563] hover:bg-slate-100 hover:text-[#1F2937]'
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer with LanguageSelector & Sign Out */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <LanguageSelector variant="drawer" />

          {user && (
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-95 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <LogOut size={16} />
              <span>{t('nav.logout')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
