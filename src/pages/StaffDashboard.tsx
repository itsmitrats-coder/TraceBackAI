import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Claim, FoundItem, AnalyticsData, LostItem } from '../types';
import { RecoveryCelebration } from '../components/common/RecoveryCelebration';
import {
  ShieldCheck, Check, X, Clock, AlertTriangle, Eye, Package,
  Search, CheckCircle2, ArrowRight, User, MapPin, Sparkles, RefreshCw
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'claims' | 'handover' | 'found'>('claims');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [reviewingClaim, setReviewingClaim] = useState<Claim | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewReason, setReviewReason] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Handover Celebration Modal
  const [celebrationData, setCelebrationData] = useState<{ title: string; recipient: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cData, fData, aData] = await Promise.all([
        api.getClaims(),
        api.getFoundItems(),
        api.getAnalytics(),
      ]);
      setClaims(cData);
      setFoundItems(fData);
      setAnalytics(aData);
    } catch (e) {
      console.error('Failed to load staff data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingClaim || !reviewReason.trim()) return;

    setIsSubmittingReview(true);
    try {
      await api.reviewClaim(reviewingClaim.id, reviewStatus, reviewReason);
      setReviewingClaim(null);
      setReviewReason('');
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to process review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleExecuteHandover = async (claim: Claim) => {
    try {
      const foundItem = foundItems.find((f) => f.id === claim.found_item_id);
      const title = foundItem?.title || 'Belonging';
      await api.handoverClaim(claim.id, `Handed over to ${claim.claimant_name}. Photo ID checked.`);
      setCelebrationData({
        title,
        recipient: claim.claimant_name,
      });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Handover execution failed');
    }
  };

  const pendingClaims = claims.filter((c) => c.status === 'claim_pending');
  const handoverQueue = claims.filter((c) => c.status === 'approved');

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Operations Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
            CAMPUS DISPATCH & CUSTODY DESK
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Staff Operations Console
          </h1>
          <p className="text-xs text-slate-400">
            Review forensic ownership claims, verify claimant evidence, and execute authenticated physical handovers
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Operational KPI Cards (Section 19) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Reports</span>
          <span className="text-2xl font-black font-mono text-white">
            {analytics?.kpis.total_reports || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Candidate Matches</span>
          <span className="text-2xl font-black font-mono text-blue-400">
            {analytics?.kpis.potential_matches || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30">
          <span className="text-[10px] uppercase font-mono text-amber-400 block mb-1">Pending Claims</span>
          <span className="text-2xl font-black font-mono text-amber-300">
            {pendingClaims.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30">
          <span className="text-[10px] uppercase font-mono text-emerald-400 block mb-1">Handover Queue</span>
          <span className="text-2xl font-black font-mono text-emerald-300">
            {handoverQueue.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Recovery Rate</span>
          <span className="text-2xl font-black font-mono text-cyan-400">
            {analytics?.kpis.recovery_rate || 0}%
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-4 text-xs font-bold font-mono transition border-b-2 flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>Pending Claims</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px]">
            {pendingClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('handover')}
          className={`pb-3 px-4 text-xs font-bold font-mono transition border-b-2 flex items-center gap-2 ${
            activeTab === 'handover'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>Handover Queue</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px]">
            {handoverQueue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 px-4 text-xs font-bold font-mono transition border-b-2 flex items-center gap-2 ${
            activeTab === 'found'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>Custody Inventory</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px]">
            {foundItems.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PENDING CLAIMS */}
      {activeTab === 'claims' && (
        <div className="space-y-4 animate-fade-in">
          {pendingClaims.length === 0 ? (
            <div className="p-12 text-center text-slate-400 rounded-3xl bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">All claim submissions reviewed!</p>
              <p className="text-xs text-slate-500 mt-1">Pending student claims will appear here instantly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingClaims.map((claim) => {
                const targetFound = foundItems.find((f) => f.id === claim.found_item_id);

                return (
                  <div
                    key={claim.id}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                          CLAIMANT: {claim.claimant_name} ({claim.claimant_email})
                        </span>
                        <h3 className="text-lg font-bold text-white">
                          Target Item: {targetFound?.title || 'Campus Belonging'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-500 block uppercase">
                            AI Confidence
                          </span>
                          <span className="text-xl font-black font-mono text-cyan-400">
                            {claim.verification_score}%
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setReviewingClaim(claim);
                            setReviewStatus('approved');
                            setReviewReason(
                              claim.verification_score >= 80
                                ? 'Claimant evidence corroborated protected markings and description.'
                                : 'Checked student enrollment credentials.'
                            );
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-blue-600/20"
                        >
                          Review & Decide
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                          CLAIMANT IDENTIFYING EVIDENCE:
                        </span>
                        <p className="text-slate-200 italic">"{claim.identifying_evidence}"</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                          AI FORENSIC REASONING:
                        </span>
                        <p className="text-slate-300 font-medium mb-1.5">{claim.verification_summary}</p>
                        <div className="text-[11px] text-emerald-400 font-mono">
                          {claim.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HANDOVER QUEUE (Section 21) */}
      {activeTab === 'handover' && (
        <div className="space-y-4 animate-fade-in">
          {handoverQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-400 rounded-3xl bg-slate-900 border border-slate-800">
              <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No items currently queued for physical collection.</p>
              <p className="text-xs text-slate-500 mt-1">Approved claims will appear here awaiting student pickup.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {handoverQueue.map((claim) => {
                const targetFound = foundItems.find((f) => f.id === claim.found_item_id);

                return (
                  <div
                    key={claim.id}
                    className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          READY FOR HANDOVER
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Approved by {claim.reviewer_name || 'Dispatch Officer'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">
                        {targetFound?.title || 'Campus Item'}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                        <span>Recipient: <strong className="text-white">{claim.claimant_name}</strong></span>
                        <span>Custody: <strong className="text-slate-200">{targetFound?.custody_location || 'Main Block'}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleExecuteHandover(claim)}
                      className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Handed Over</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FOUND INVENTORY TABLE */}
      {activeTab === 'found' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 font-mono uppercase text-slate-400">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Custody Bin</th>
                  <th className="p-4">Found Location</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {foundItems.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-white">{f.title}</td>
                    <td className="p-4">{f.category}</td>
                    <td className="p-4 font-mono text-slate-400">{f.custody_location || 'Locker 01'}</td>
                    <td className="p-4">{f.location}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-950 border border-slate-800">
                        {f.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLAIM REVIEW MODAL (Section 20) */}
      {reviewingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block mb-0.5">
                  CAMPUS OFFICER DECISION
                </span>
                <h3 className="text-xl font-black text-white">
                  Review Ownership Claim
                </h3>
              </div>
              <button
                onClick={() => setReviewingClaim(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Claimant:</span>
                <span className="text-white font-semibold">{reviewingClaim.claimant_name} ({reviewingClaim.claimant_email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Confidence:</span>
                <span className="text-cyan-400 font-bold font-mono">{reviewingClaim.verification_score}%</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Claimant Submitted Testimony:</span>
                <p className="text-slate-200 italic p-2.5 rounded-lg bg-slate-900">"{reviewingClaim.identifying_evidence}"</p>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Official Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('approved')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition ${
                      reviewStatus === 'approved'
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 font-black'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Approve Claim</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewStatus('rejected')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition ${
                      reviewStatus === 'rejected'
                        ? 'bg-red-600/30 text-red-300 border-red-500 font-black'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <X className="w-4 h-4 text-red-400" />
                    <span>Reject Claim</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Mandatory Review Reason / Forensic Note *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  placeholder="Record rationale for audit trail (e.g. 'Verified student enrollment card and unique sticker alignment')..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingClaim(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview || !reviewReason.trim()}
                  className={`px-6 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition ${
                    reviewStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {isSubmittingReview ? 'Recording Decision...' : 'Commit Audit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery Celebration Modal (Section 21 & 38) */}
      {celebrationData && (
        <RecoveryCelebration
          isOpen={!!celebrationData}
          onClose={() => setCelebrationData(null)}
          itemTitle={celebrationData.title}
          recipientName={celebrationData.recipient}
        />
      )}
    </div>
  );
};
