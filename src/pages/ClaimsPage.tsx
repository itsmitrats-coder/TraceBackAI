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
        <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-1">
          CLAIMS STATUS
        </span>
        <h1 className="text-3xl font-black text-[#171717] tracking-tight mb-2">
          My Ownership Claims
        </h1>
        <p className="text-xs text-[#666666] max-w-xl">
          Track the status of your claims and staff verification updates.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFF0F0] border-t-[#E53935] animate-spin mx-auto" />
          <p className="text-xs text-[#666666]">Loading your claims...</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="py-16 text-center text-[#666666] p-8 rounded-3xl bg-white border border-[#EAEAEA]">
          <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-[#666666]" />
          <p className="text-base font-bold text-[#171717]">No active claims yet.</p>
          <p className="text-xs text-[#666666] mt-1">
            When you see a matching item in the Found Registry, click "This Is Mine" to file a claim.
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
                className="rounded-3xl bg-white border border-[#EAEAEA] p-6 space-y-4 shadow-xs hover:border-[#171717]/20 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EAEAEA]">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-[#171717] uppercase">
                      Claim #{claim.id.slice(-6)}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        claim.status === 'handed_over'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : isApproved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isRejected
                          ? 'bg-[#FFF0F0] text-[#E53935] border border-[#E53935]/20'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {claim.status === 'handed_over' ? 'Handed Over' : claim.status === 'claim_pending' ? 'Pending Review' : claim.status.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-xs text-[#666666]">
                    Submitted {new Date(claim.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Evidence Statement */}
                  <div className="md:col-span-2 space-y-2">
                    <span className="text-xs font-bold text-[#666666] block">
                      YOUR SUBMITTED PROOF:
                    </span>
                    <p className="text-xs text-[#171717] bg-[#FFF7F7] p-3 rounded-xl border border-[#EAEAEA] italic">
                      "{claim.identifying_evidence}"
                    </p>
                  </div>

                  {/* Verification Score */}
                  <div className="p-4 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA] text-center flex flex-col items-center justify-center">
                    <span className="text-[11px] font-bold text-[#666666] mb-1">
                      MATCH CONFIDENCE
                    </span>
                    <span className="text-3xl font-black text-[#E53935]">
                      {claim.verification_score}%
                    </span>
                    <span className="text-xs text-[#666666] mt-0.5">
                      Corroborated proof
                    </span>
                  </div>
                </div>

                {/* Reviewer note */}
                {claim.review_reason && (
                  <div className="p-3.5 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-xs">
                    <span className="font-bold text-[#171717] block mb-0.5">
                      Staff Note ({claim.reviewer_name || 'Campus Desk Staff'}):
                    </span>
                    <p className="text-[#666666]">{claim.review_reason}</p>
                  </div>
                )}

                {/* Handover Notice */}
                {isApproved && claim.status !== 'handed_over' && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">Ready for Pickup! Bring your student ID to the Central Library Front Desk.</span>
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
