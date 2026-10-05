import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Mail, Building, Award, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in pb-16 space-y-6">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
          CAMPUS IDENTITY CARD
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight">
          User Profile
        </h1>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-800">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={user?.name || 'User'}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-blue-500/40 shadow-xl"
          />
          <div>
            <h3 className="text-2xl font-black text-white">{user?.name}</h3>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800">
              {role.toUpperCase()} PERSONA
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" /> Email Address
            </span>
            <span className="text-white font-mono font-semibold">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" /> Academic Department
            </span>
            <span className="text-white font-semibold">{user?.department || 'Undergraduate Studies'}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> System Authorization
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              {role === 'admin' ? 'FULL CAMPUS OPERATOR' : role === 'staff' ? 'DISPATCH & CUSTODY' : 'STUDENT APPLICANT'}
            </span>
          </div>
        </div>

        {/* Reputation Stats */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Reports Filed</span>
            <span className="text-xl font-bold font-mono text-white">4</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Recovered</span>
            <span className="text-xl font-bold font-mono text-emerald-400">2</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Trust Score</span>
            <span className="text-xl font-bold font-mono text-cyan-400">98%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
