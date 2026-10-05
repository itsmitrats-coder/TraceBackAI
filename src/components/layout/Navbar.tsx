import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DemoEngineStatusBadge } from '../common/DemoEngineStatusBadge';
import {
  MapPin, Search, Bell, ChevronDown, User as UserIcon,
  LogOut, Check, Sparkles, PlusCircle, Compass
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
    <nav className="sticky top-0 z-40 w-full border-b border-[#EAEAEA] bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-[#E53935] flex items-center justify-center text-white shadow-sm shadow-[#E53935]/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-[#171717]">
                  Trace<span className="text-[#E53935]">Back</span>
                </span>
              </div>
              <span className="hidden sm:block text-[11px] font-medium text-[#666666] -mt-1">
                Lost it? Trace it back.
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
                      ? 'bg-[#FFF0F0] text-[#E53935] font-bold'
                      : 'text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9]'
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
                className="relative p-2 rounded-xl border border-[#EAEAEA] bg-white text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9] transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E53935] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#EAEAEA] shadow-xl p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                      Notifications ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-[11px] text-[#E53935] font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#EAEAEA] my-2">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-[#666666] text-xs">
                        No active notifications.
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
                            n.is_read ? 'opacity-70 hover:bg-[#F9F9F9]' : 'bg-[#FFF7F7] hover:bg-[#FFF0F0]'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-xs text-[#171717] block mb-0.5">
                              {n.title}
                            </span>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-[#E53935] shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-[#666666] leading-snug">{n.message}</p>
                          <span className="text-[10px] text-[#666666] mt-1 block">
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
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-2xl border border-[#EAEAEA] bg-white hover:border-[#171717]/20 transition"
              >
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user?.name || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-[#EAEAEA]"
                />
                <div className="hidden sm:block text-left text-xs leading-none">
                  <span className="font-semibold text-[#171717] block mb-0.5 truncate max-w-[90px]">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-[#E53935] uppercase">
                    {role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#666666]" />
              </button>

              {/* Persona Switcher Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#EAEAEA] shadow-xl p-3 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-[#EAEAEA]">
                    <span className="text-xs font-bold text-[#171717] block">{user?.name}</span>
                    <span className="text-[11px] text-[#666666] block truncate">{user?.email}</span>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FFF0F0] text-[#E53935] border border-[#E53935]/20">
                      Role: {role}
                    </span>
                  </div>

                  {/* 1-Click Role Switcher for Hackathon Demonstrations */}
                  <div className="py-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#666666] px-3 block mb-1">
                      Switch Demo Role:
                    </span>
                    <button
                      onClick={() => {
                        switchUser('student');
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        role === 'student' ? 'bg-[#FFF0F0] text-[#E53935] font-bold' : 'text-[#171717] hover:bg-[#F9F9F9]'
                      }`}
                    >
                      <div>
                        <span className="block font-medium">Student: Alex Rivera</span>
                        <span className="text-[10px] text-[#666666]">Reports items & claims</span>
                      </div>
                      {role === 'student' && <Check className="w-3.5 h-3.5 text-[#E53935]" />}
                    </button>

                    <button
                      onClick={() => {
                        switchUser('staff');
                        setShowUserMenu(false);
                        onNavigate('staff-ops');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        role === 'staff' ? 'bg-[#FFF0F0] text-[#E53935] font-bold' : 'text-[#171717] hover:bg-[#F9F9F9]'
                      }`}
                    >
                      <div>
                        <span className="block font-medium">Staff: Marcus Vance</span>
                        <span className="text-[10px] text-[#666666]">Reviews & handovers</span>
                      </div>
                      {role === 'staff' && <Check className="w-3.5 h-3.5 text-[#E53935]" />}
                    </button>

                    <button
                      onClick={() => {
                        switchUser('admin');
                        setShowUserMenu(false);
                        onNavigate('analytics');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        role === 'admin' ? 'bg-[#FFF0F0] text-[#E53935] font-bold' : 'text-[#171717] hover:bg-[#F9F9F9]'
                      }`}
                    >
                      <div>
                        <span className="block font-medium">Admin: Dr. Sarah Chen</span>
                        <span className="text-[10px] text-[#666666]">Campus metrics & audit</span>
                      </div>
                      {role === 'admin' && <Check className="w-3.5 h-3.5 text-[#E53935]" />}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#EAEAEA]">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#171717] hover:bg-[#F9F9F9] flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#666666]" />
                      <span>User Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#E53935] hover:bg-[#FFF0F0] flex items-center gap-2 mt-1 font-semibold"
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
