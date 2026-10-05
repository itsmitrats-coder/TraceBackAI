import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Claim, FoundItem, AnalyticsData } from '../types';
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
      await api.handoverClaim(claim.id, `Handed over to ${claim.claimant_name}. Student ID verified.`);
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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-1">
            STAFF DESK
          </span>
          <h1 className="text-3xl font-black text-[#171717] tracking-tight">
            Staff Operations Console
          </h1>
          <p className="text-xs text-[#666666]">
            Review student claims, verify proof details, and release items for pickup.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#EAEAEA] text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9] text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] shadow-2xs">
          <span className="text-xs text-[#666666] block mb-1">Total Reports</span>
          <span className="text-2xl font-bold text-[#171717]">
            {analytics?.kpis.total_reports || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] shadow-2xs">
          <span className="text-xs text-[#666666] block mb-1">Matches Found</span>
          <span className="text-2xl font-bold text-[#E53935]">
            {analytics?.kpis.potential_matches || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA] shadow-2xs">
          <span className="text-xs font-semibold text-[#E53935] block mb-1">Pending Claims</span>
          <span className="text-2xl font-bold text-[#E53935]">
            {pendingClaims.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-800 block mb-1">Ready for Pickup</span>
          <span className="text-2xl font-bold text-emerald-700">
            {handoverQueue.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] shadow-2xs">
          <span className="text-xs text-[#666666] block mb-1">Recovery Rate</span>
          <span className="text-2xl font-bold text-[#171717]">
            {analytics?.kpis.recovery_rate || 0}%
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#EAEAEA] gap-2">
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'border-[#E53935] text-[#E53935]'
              : 'border-transparent text-[#666666] hover:text-[#171717]'
          }`}
        >
          <span>Pending Claims</span>
          <span className="px-2 py-0.5 rounded-full bg-[#FFF0F0] text-[#E53935] text-[11px] font-bold">
            {pendingClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('handover')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'handover'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-[#666666] hover:text-[#171717]'
          }`}
        >
          <span>Ready for Handover</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            {handoverQueue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'found'
              ? 'border-[#171717] text-[#171717]'
              : 'border-transparent text-[#666666] hover:text-[#171717]'
          }`}
        >
          <span>Inventory Records</span>
          <span className="px-2 py-0.5 rounded-full bg-[#F9F9F9] text-[#666666] text-[11px] font-bold">
            {foundItems.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PENDING CLAIMS */}
      {activeTab === 'claims' && (
        <div className="space-y-4 animate-fade-in">
          {pendingClaims.length === 0 ? (
            <div className="p-12 text-center text-[#666666] rounded-3xl bg-white border border-[#EAEAEA]">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#171717]">All claims up to date!</p>
              <p className="text-xs text-[#666666] mt-1">New claims submitted by students will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingClaims.map((claim) => {
                const targetFound = foundItems.find((f) => f.id === claim.found_item_id);

                return (
                  <div
                    key={claim.id}
                    className="p-6 rounded-3xl bg-white border border-[#EAEAEA] hover:border-[#171717]/20 transition shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-[#666666] block mb-0.5">
                          Student: <strong className="text-[#171717]">{claim.claimant_name}</strong> ({claim.claimant_email})
                        </span>
                        <h3 className="text-lg font-bold text-[#171717]">
                          Claim for: {targetFound?.title || 'Campus Item'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-[#666666] block">
                            Confidence Score
                          </span>
                          <span className="text-2xl font-bold text-[#E53935]">
                            {claim.verification_score}%
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setReviewingClaim(claim);
                            setReviewStatus('approved');
                            setReviewReason(
                              claim.verification_score >= 80
                                ? 'Claimant proof matches reported stickers and private clue.'
                                : 'Verified student enrollment credentials.'
                            );
                          }}
                          className="px-4 py-2 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
                        >
                          Review & Decide
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-[#FFF7F7] border border-[#EAEAEA]">
                        <span className="text-xs font-bold text-[#666666] block mb-1">
                          STUDENT'S SUBMITTED PROOF:
                        </span>
                        <p className="text-[#171717] italic">"{claim.identifying_evidence}"</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA]">
                        <span className="text-xs font-bold text-[#666666] block mb-1">
                          MATCH REASONING:
                        </span>
                        <p className="text-[#171717] font-medium mb-1.5">{claim.verification_summary}</p>
                        <div className="text-xs text-emerald-700 font-semibold">
                          Recommendation: {claim.recommendation}
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

      {/* TAB 2: HANDOVER QUEUE */}
      {activeTab === 'handover' && (
        <div className="space-y-4 animate-fade-in">
          {handoverQueue.length === 0 ? (
            <div className="p-12 text-center text-[#666666] rounded-3xl bg-white border border-[#EAEAEA]">
              <Package className="w-10 h-10 text-[#666666] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#171717]">No items currently awaiting collection.</p>
              <p className="text-xs text-[#666666] mt-1">Approved claims will appear here until the student arrives.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {handoverQueue.map((claim) => {
                const targetFound = foundItems.find((f) => f.id === claim.found_item_id);

                return (
                  <div
                    key={claim.id}
                    className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xs flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Ready for Handover
                        </span>
                        <span className="text-xs text-[#666666]">
                          Approved by {claim.reviewer_name || 'Staff Officer'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#171717] mb-1">
                        {targetFound?.title || 'Campus Item'}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-xs text-[#666666]">
                        <span>Claimant: <strong className="text-[#171717]">{claim.claimant_name}</strong></span>
                        <span>Location: <strong className="text-[#171717]">{targetFound?.custody_location || 'Library Front Desk'}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleExecuteHandover(claim)}
                      className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Physical Handover</span>
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
        <div className="rounded-3xl bg-white border border-[#EAEAEA] overflow-hidden shadow-xs animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF7F7] border-b border-[#EAEAEA] uppercase text-[#666666] font-semibold">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Custody Bin</th>
                  <th className="p-4">Found Location</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] text-[#171717]">
                {foundItems.map((f) => (
                  <tr key={f.id} className="hover:bg-[#F9F9F9] transition">
                    <td className="p-4 font-bold">{f.title}</td>
                    <td className="p-4 text-[#666666]">{f.category}</td>
                    <td className="p-4 text-[#666666]">{f.custody_location || 'Bin 01'}</td>
                    <td className="p-4">{f.location}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF0F0] text-[#E53935] border border-[#E53935]/20">
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

      {/* CLAIM REVIEW MODAL */}
      {reviewingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-[#EAEAEA] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-0.5">
                  STAFF DECISION
                </span>
                <h3 className="text-xl font-bold text-[#171717]">
                  Review Student Claim
                </h3>
              </div>
              <button
                onClick={() => setReviewingClaim(null)}
                className="p-1.5 rounded-lg text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#666666]">Claimant:</span>
                <span className="text-[#171717] font-semibold">{reviewingClaim.claimant_name} ({reviewingClaim.claimant_email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Confidence Score:</span>
                <span className="text-[#E53935] font-bold">{reviewingClaim.verification_score}%</span>
              </div>
              <div>
                <span className="text-[#666666] block mb-1">Claimant's Proof:</span>
                <p className="text-[#171717] italic p-2.5 rounded-lg bg-white border border-[#EAEAEA]">"{reviewingClaim.identifying_evidence}"</p>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-2">
                  Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('approved')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition ${
                      reviewStatus === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                        : 'bg-white text-[#666666] border-[#EAEAEA]'
                    }`}
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Approve Claim</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewStatus('rejected')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition ${
                      reviewStatus === 'rejected'
                        ? 'bg-[#FFF0F0] text-[#E53935] border-[#E53935]'
                        : 'bg-white text-[#666666] border-[#EAEAEA]'
                    }`}
                  >
                    <X className="w-4 h-4 text-[#E53935]" />
                    <span>Reject Claim</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-2">
                  Review Rationale / Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  placeholder="Record rationale (e.g. 'Student ID matches enrollment card and sticker confirmed on bottle base')..."
                  className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] text-[#171717] text-xs focus:outline-none focus:border-[#E53935] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingClaim(null)}
                  className="px-4 py-2 rounded-xl border border-[#EAEAEA] text-[#666666] hover:text-[#171717] text-xs font-semibold hover:bg-[#F9F9F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview || !reviewReason.trim()}
                  className={`px-6 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition ${
                    reviewStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-[#E53935] hover:bg-[#C62828]'
                  }`}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Record Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery Celebration Modal */}
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
