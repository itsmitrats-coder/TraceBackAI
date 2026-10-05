import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DemoEngineStatusBadge } from '../common/DemoEngineStatusBadge';
import {
  Search, Shield, Bell, CheckCircle, ChevronDown, User as UserIcon,
  Compass, MapPin, BarChart3, ShieldCheck, LogOut, Sparkles, Layers,
  X, Check, Flame
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, role, logout, switchUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', roles: ['student', 'staff', 'admin'] },
    { id: 'my-reports', label: 'My Reports', roles: ['student', 'staff', 'admin'] },
    { id: 'found-items', label: 'Found Registry', roles: ['student', 'staff', 'admin'] },
    { id: 'claims', label: 'Claims', roles: ['student', 'staff', 'admin'] },
    { id: 'heatmap', label: 'Campus Map', roles: ['student', 'staff', 'admin'] },
    { id: 'staff-ops', label: 'Staff Operations', roles: ['staff', 'admin'] },
    { id: 'analytics', label: 'Analytics', roles: ['admin', 'staff'] },
    { id: 'audit-trail', label: 'Audit Trail', roles: ['staff', 'admin'] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-cyan-400 font-black text-sm tracking-tighter">TB</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white font-mono">
                  TRACEBACK<span className="text-blue-500">.AI</span>
                </span>
              </div>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-400 font-mono -mt-1">
                Forensic Campus Recovery
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleNav.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center space-x-3">
            {/* System Status Indicator */}
            <div className="hidden lg:block">
              <DemoEngineStatusBadge />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
                      FORENSIC NOTIFICATIONS ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAll => markAllAsRead()}
                        className="text-[11px] text-blue-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 my-2">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No active notifications logged.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.is_read) markAsRead(n.id);
                            if (n.link) {
                              setShowNotifs(false);
                              if (n.link.startsWith('/matches')) onNavigate('my-reports');
                              else if (n.link.startsWith('/claims')) onNavigate('claims');
                              else if (n.link.startsWith('/staff')) onNavigate('staff-ops');
                              else onNavigate('dashboard');
                            }
                          }}
                          className={`p-3 rounded-xl cursor-pointer transition ${
                            n.is_read ? 'opacity-70 hover:bg-slate-800/40' : 'bg-blue-950/20 hover:bg-blue-950/40'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-xs text-white block mb-0.5">
                              {n.title}
                            </span>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Persona Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user?.name || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-blue-500/40"
                />
                <div className="hidden sm:block text-left text-xs leading-none">
                  <span className="font-semibold text-white block mb-0.5 truncate max-w-[90px]">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span className="text-[9px] uppercase font-mono text-blue-400 font-bold">
                    {role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Persona Switcher Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white block">{user?.name}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{user?.email}</span>
                    <span className="inline-block mt-1 text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-800">
                      Role: {role}
                    </span>
                  </div>

                  {/* 1-Click Role Switcher for Hackathon Demonstrations */}
                  <div className="py-2 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 px-3 block mb-1">
                      QUICK DEMO PERSONA:
                    </span>
                    <button
                      onClick={() => {
                        switchUser('student');
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        role === 'student' ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <span className="block">Student: Alex Rivera</span>
                        <span className="text-[10px] text-slate-400">Reports items & claims</span>
                      </div>
                      {role === 'student' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>

                    <button
                      onClick={() => {
                        switchUser('staff');
                        setShowUserMenu(false);
                        onNavigate('staff-ops');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        role === 'staff' ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <span className="block">Staff: Marcus Vance</span>
                        <span className="text-[10px] text-slate-400">Reviews & handovers</span>
                      </div>
                      {role === 'staff' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>

                    <button
                      onClick={() => {
                        switchUser('admin');
                        setShowUserMenu(false);
                        onNavigate('analytics');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        role === 'admin' ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <span className="block">Admin: Dr. Sarah Chen</span>
                        <span className="text-[10px] text-slate-400">Campus metrics & audit</span>
                      </div>
                      {role === 'admin' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>User Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
