import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Claim } from '../types';
import { ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle, MapPin, Sparkles } from 'lucide-react';

export const ClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = await api.getClaims();
        setClaims(data);
      } catch (e) {
        console.error('Failed to load claims', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
          OWNERSHIP CLAIMS REGISTRY
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          My Ownership Claims
        </h1>
        <p className="text-xs text-slate-400 max-w-xl">
          Track the status of your claims and AI verification confidence scores.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading claims...</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="py-16 text-center text-slate-400 p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-slate-600" />
          <p className="text-base font-bold text-white">No active claims initiated yet.</p>
          <p className="text-xs text-slate-500 mt-1">
            When you spot a matching found belonging, click "Claim This Item" to submit proof.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            const isApproved = claim.status === 'approved' || claim.status === 'handed_over';
            const isRejected = claim.status === 'rejected';

            return (
              <div
                key={claim.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                      CLAIM ID: {claim.id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        claim.status === 'handed_over'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : isApproved
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isRejected
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(claim.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Evidence Statement */}
                  <div className="md:col-span-2 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      YOUR SUBMITTED IDENTIFYING EVIDENCE:
                    </span>
                    <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 italic">
                      "{claim.identifying_evidence}"
                    </p>
                  </div>

                  {/* AI Verification Score */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono uppercase text-slate-500 mb-1">
                      AI FORENSIC CONFIDENCE
                    </span>
                    <span className="text-3xl font-black font-mono text-cyan-400">
                      {claim.verification_score}%
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">
                      Corroborated by TraceBack
                    </span>
                  </div>
                </div>

                {/* Reviewer decision box */}
                {claim.review_reason && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="font-mono text-slate-400 block mb-0.5">
                      STAFF REVIEW NOTE (by {claim.reviewer_name || 'Dispatch Officer'}):
                    </span>
                    <p className="text-slate-200">{claim.review_reason}</p>
                  </div>
                )}

                {/* Handover Notice */}
                {isApproved && claim.status !== 'handed_over' && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Ready for Handover! Present your student ID at Campus Dispatch Desk.</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
