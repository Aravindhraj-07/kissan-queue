import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationsApi } from '../../services/api';
import { INotification } from '../../types';
import {
  Bell,
  LogOut,
  Smartphone,
  CheckCheck,
  Radio,
  Clock,
  Menu,
} from 'lucide-react';
import { SmsUssdSimulatorModal } from '../simulator/SmsUssdSimulatorModal';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isConnected, latestNotification } = useSocket();

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.getMyNotifications();
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Update notifications when socket receives new notification
  useEffect(() => {
    if (latestNotification) {
      setNotifications((prev) => [latestNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    }
  }, [latestNotification]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {}
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        {/* Top Government Strip */}
        <div className="bg-[#14532D] text-white text-[11px] px-4 sm:px-8 py-1.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-wide">भारत सरकार | Government of India</span>
            <span className="text-emerald-400">•</span>
            <span className="text-emerald-100 hidden sm:inline">
              Ministry of Agriculture & Farmers Welfare
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 font-mono text-[11px] text-emerald-100">
              <Clock size={12} className="text-[#FDE047]" />
              <span>IST {currentTime}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-[#166534] px-2 py-0.5 rounded-full border border-emerald-600/50">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isConnected ? 'bg-[#4ADE80] animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="text-[10px] uppercase font-extrabold text-emerald-100">
                {isConnected ? 'Socket Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="px-4 sm:px-8 py-3 flex items-center justify-between">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-1.5 rounded-xl text-[#1F2937] hover:bg-slate-100 transition cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu size={22} />
              </button>
            )}

            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#15803D] group-hover:bg-[#166534] text-white flex items-center justify-center font-black text-xl shadow-xs border border-emerald-600 transition">
                PX
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black text-[#1F2937] tracking-tight leading-none">
                    Procure<span className="text-[#15803D]">X</span>
                  </h1>
                  <span className="bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                    e-Mandi
                  </span>
                </div>
                <p className="text-[11px] text-[#4B5563] font-semibold mt-0.5">
                  Smart Mandi Queue & Digital Procurement
                </p>
              </div>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Feature Phone 2G Simulator (SMS / USSD) */}
            <button
              onClick={() => setShowSimulator(true)}
              className="px-3 py-2 bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#854D0E] border border-[#FDE047] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
              title="Test SMS & USSD Booking without 4G Internet"
            >
              <Smartphone size={15} />
              <span className="hidden sm:inline">Offline (SMS/USSD) Channel</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-[#4B5563] hover:text-[#1F2937] hover:bg-slate-100 transition cursor-pointer"
                aria-label="Open notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fadeIn">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Radio size={15} className="text-[#15803D] animate-pulse" />
                      <span className="font-extrabold text-xs text-[#1F2937]">System Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-[10px] px-2 py-0.2 rounded-full font-bold">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#15803D] hover:underline font-bold flex items-center space-x-0.5 cursor-pointer"
                      >
                        <CheckCheck size={14} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs font-semibold text-[#4B5563]">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-4 hover:bg-slate-50 transition text-xs ${
                            !n.read ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-[#1F2937] leading-snug">{n.title}</h4>
                            <span className="text-[10px] text-[#4B5563] ml-2 whitespace-nowrap font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[#4B5563] mt-1 leading-relaxed text-[11px]">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile info */}
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-extrabold text-[#1F2937] leading-tight">{user.name}</p>
                  <p className="text-[10px] text-[#15803D] font-extrabold uppercase tracking-wide">
                    {user.role.replace(/_/g, ' ')}
                  </p>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-[#4B5563] hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={19} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-4 py-2 bg-white hover:bg-slate-50 text-[#166534] rounded-xl text-xs font-bold transition border border-[#15803D]/40"
                >
                  Farmer Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SMS / USSD Simulator Modal */}
      <SmsUssdSimulatorModal isOpen={showSimulator} onClose={() => setShowSimulator(false)} />
    </>
  );
};
