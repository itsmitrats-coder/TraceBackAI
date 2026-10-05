import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Mail, Building, Award, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in pb-16 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-1">
          CAMPUS PROFILE
        </span>
        <h1 className="text-3xl font-black text-[#171717] tracking-tight">
          Student Profile
        </h1>
      </div>

      <div className="rounded-3xl bg-white border border-[#EAEAEA] p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-[#EAEAEA]">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={user?.name || 'User'}
            className="w-20 h-20 rounded-2xl object-cover border border-[#EAEAEA] shadow-xs"
          />
          <div>
            <h3 className="text-2xl font-bold text-[#171717]">{user?.name}</h3>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase bg-[#FFF0F0] text-[#E53935] border border-[#E53935]/20">
              {role.toUpperCase()} ACCOUNT
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA]">
            <span className="text-[#666666] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#E53935]" /> Email Address
            </span>
            <span className="text-[#171717] font-semibold">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA]">
            <span className="text-[#666666] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#E53935]" /> Campus Department
            </span>
            <span className="text-[#171717] font-semibold">{user?.department || 'Undergraduate Studies'}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA]">
            <span className="text-[#666666] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Account Authorization
            </span>
            <span className="text-emerald-700 font-bold">
              {role === 'admin' ? 'Campus Admin' : role === 'staff' ? 'Staff Desk Operations' : 'Student'}
            </span>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="pt-4 border-t border-[#EAEAEA] grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA]">
            <span className="text-xs text-[#666666] block">Reports Filed</span>
            <span className="text-xl font-bold text-[#171717]">4</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs text-emerald-800 block">Items Returned</span>
            <span className="text-xl font-bold text-emerald-700">2</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#FFF0F0] border border-[#E53935]/20">
            <span className="text-xs text-[#E53935] block">Trust Score</span>
            <span className="text-xl font-bold text-[#E53935]">98%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
