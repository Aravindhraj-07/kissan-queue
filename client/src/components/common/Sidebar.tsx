import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Sparkles,
  Sprout,
  Landmark,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const { user } = useAuth();
  const role = user?.role || 'FARMER';

  const farmerNav = [
    { name: 'Dashboard Overview', path: '/farmer', icon: LayoutDashboard },
    { name: 'Book Procurement Slot', path: '/farmer/book', icon: CalendarPlus },
    { name: 'Live Digital Queue', path: '/farmer/live-queue', icon: Radio },
    { name: 'Tokens & Receipts', path: '/farmer/history', icon: FileText },
    { name: 'Farmer Profile & DBT', path: '/farmer/profile', icon: User },
  ];

  const storageNav = [
    { name: 'Mandi Operations', path: '/storage', icon: LayoutDashboard },
    { name: 'Live Queue Desk', path: '/storage/queue-desk', icon: Radio },
    { name: 'Weighbridge & Quality', path: '/storage/procurement', icon: Scale },
    { name: 'Slot Capacity Setup', path: '/storage/slots', icon: CalendarRange },
    { name: 'Outgoing Dispatches', path: '/logistics', icon: Truck },
  ];

  const logisticsNav = [
    { name: 'Transport Tasks Board', path: '/logistics', icon: Truck },
  ];

  const adminNav = [
    { name: 'Ecosystem Analytics', path: '/admin', icon: BarChart3 },
    { name: 'Procurement Centres', path: '/admin/centres', icon: Building2 },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'System Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
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
      className={`bg-white border-r border-slate-200 w-64 flex flex-col justify-between shrink-0 min-h-[calc(100vh-80px)] transition-all duration-200 ${
        isOpen ? 'block' : 'hidden lg:block'
      }`}
    >
      <div className="p-4 space-y-6">
        {/* Role Badge Indicator */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center space-x-3 transition-colors hover:bg-slate-100/70">
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
            <RoleIcon size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] uppercase font-extrabold text-[#4B5563] tracking-wider">Active Portal</p>
            <p className="text-xs font-black text-[#1F2937] truncate">
              {role.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#4B5563] px-3 mb-2">
            Main Navigation
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

      {/* Footer System Status Banner */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 bg-[#DCFCE7]/60 rounded-xl border border-[#86EFAC] flex items-center space-x-2.5 text-xs text-[#166534]">
          <div className="w-2 h-2 rounded-full bg-[#15803D] animate-ping shrink-0" />
          <div className="overflow-hidden">
            <span className="font-extrabold block text-xs">Direct MSP Payout</span>
            <span className="text-[10px] text-[#166534] block truncate">
              Aadhaar DBT Gateway Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
