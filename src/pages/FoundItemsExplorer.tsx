import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FoundItem, Claim } from '../types';
import { NaturalSearchBar } from '../components/investigation/NaturalSearchBar';
import { FingerprintCard } from '../components/common/FingerprintCard';
import {
  Package, Search, ShieldCheck, MapPin, Clock, Filter,
  Tag, X, CheckCircle2, AlertTriangle, ArrowRight, Upload
} from 'lucide-react';

interface FoundItemsExplorerProps {
  onClaimSuccess?: (claimId: string) => void;
}

export const FoundItemsExplorer: React.FC<FoundItemsExplorerProps> = ({ onClaimSuccess }) => {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [location, setLocation] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Claim Modal State
  const [claimingItem, setClaimingItem] = useState<FoundItem | null>(null);
  const [identifyingEvidence, setIdentifyingEvidence] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState<Claim | null>(null);

  const categories = ['all', 'Bottles', 'Electronics', 'ID / Cards', 'Bags', 'Keys', 'Books'];
  const locations = [
    'all', 'Central Library', 'Main Academic Block', 'Student Cafeteria',
    'Science & Computing Labs', 'Sports Complex & Gym', 'North Parking Area'
  ];

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFoundItems({
        category: category !== 'all' ? category : undefined,
        location: location !== 'all' ? location : undefined,
        status: status !== 'all' ? status : undefined,
      });
      setItems(data);
    } catch (e) {
      console.error('Failed to load found items', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, location, status]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingItem || !identifyingEvidence.trim()) return;

    setIsSubmittingClaim(true);
    try {
      const claim = await api.submitClaim({
        found_item_id: claimingItem.id,
        identifying_evidence: identifyingEvidence,
        proof_image_url: proofImage || undefined,
      });
      setSubmittedClaim(claim);
      if (onClaimSuccess) onClaimSuccess(claim.id);
    } catch (e) {
      console.error('Claim submission failed', e);
      alert('Failed to submit claim');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const closeClaimModal = () => {
    setClaimingItem(null);
    setIdentifyingEvidence('');
    setProofImage('');
    setSubmittedClaim(null);
    fetchItems();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
          CAMPUS VERIFIED INVENTORY
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          Found Belongings Registry
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl">
          Browse verified items recovered across campus grounds. If you spot your belonging, initiate a zero-knowledge claim.
        </p>
      </div>

      {/* Natural Language Intelligent Search */}
      <NaturalSearchBar
        onResultsFound={(results) => setItems(results)}
      />

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        <span className="flex items-center gap-1.5 font-mono text-slate-400 uppercase font-semibold text-[11px]">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* Category select */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>Category: {c === 'all' ? 'All' : c}</option>
          ))}
        </select>

        {/* Location select */}
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
        >
          {locations.map((l) => (
            <option key={l} value={l}>Location: {l === 'all' ? 'All Zones' : l}</option>
          ))}
        </select>

        {/* Status select */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
        >
          <option value="all">Status: All</option>
          <option value="open">Open for Claim</option>
          <option value="claim_pending">Claim Pending</option>
          <option value="verified">Verified</option>
          <option value="recovered">Recovered</option>
        </select>

        <span className="ml-auto text-slate-400 font-mono text-[11px]">
          Showing {items.length} items
        </span>
      </div>

      {/* Found Items Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading campus registry...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-slate-400 p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <Package className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold text-white">No items match your filter criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try relaxing your category or location filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                {/* Photo banner */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-400" /> {item.location}
                    </span>
                    <span>{item.found_at}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    "{item.description}"
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-slate-400 font-mono space-y-1">
                    <div>Custody Point: <strong className="text-slate-200">{item.custody_location || 'Campus Desk'}</strong></div>
                    {item.fingerprint?.distinctive_marks && item.fingerprint.distinctive_marks.length > 0 && (
                      <div>Distinctive: <span className="text-amber-400">{item.fingerprint.distinctive_marks.join(', ')}</span></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  disabled={item.status === 'recovered'}
                  onClick={() => setClaimingItem(item)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                    item.status === 'recovered'
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{item.status === 'recovered' ? 'Item Already Recovered' : 'Claim This Item'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zero-Knowledge Claim Modal (Section 18) */}
      {claimingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeClaimModal}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedClaim ? (
              /* Success / AI Verification Outcome */
              <div className="space-y-6 text-center animate-fade-in py-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                    CLAIM SUBMITTED SUCCESSFULLY
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    Under Forensic Staff Review
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    TraceBack has cross-examined your evidence statement against protected item records.
                  </p>
                </div>

                {/* AI Verification Score Box (Section 18) */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 text-left space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-mono text-xs font-bold text-slate-300 uppercase">
                      AI VERIFICATION CONFIDENCE:
                    </span>
                    <span className="text-base font-black font-mono text-emerald-400">
                      {submittedClaim.verification_score}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {submittedClaim.verification_summary}
                  </p>

                  <div className="space-y-1.5 pt-1 text-xs">
                    {submittedClaim.verification_alignments.map((al, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-emerald-300 text-[11px]">
                        <span className="font-bold">✓</span>
                        <span>{al}</span>
                      </div>
                    ))}
                    {submittedClaim.verification_concerns.map((co, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-amber-300 text-[11px]">
                        <span className="font-bold">!</span>
                        <span>{co}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                    Status: <strong className="text-amber-400 uppercase">PENDING STAFF REVIEW</strong>
                  </div>
                </div>

                <button
                  onClick={closeClaimModal}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  Return to Registry
                </button>
              </div>
            ) : (
              /* Claim Input Form */
              <form onSubmit={handleClaimSubmit} className="space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
                    SECURE ZERO-KNOWLEDGE CLAIM
                  </span>
                  <h3 className="text-xl font-black text-white">
                    Claim "{claimingItem.title}"
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Campus Lost & Found requires claimants to prove ownership without seeing confidential clues.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                  <span className="font-bold block mb-1">Ownership Question:</span>
                  “Tell us something about this item that isn't visible in the listing.”
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                    Your Identifying Ownership Evidence *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={identifyingEvidence}
                    onChange={(e) => setIdentifyingEvidence(e.target.value)}
                    placeholder="Describe specific unphotographed features: engravings, serial numbers, wallpaper, contents inside, internal stickers..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                    Supporting Proof Image / Receipt (Optional)
                  </label>
                  <input
                    type="text"
                    value={proofImage}
                    onChange={(e) => setProofImage(e.target.value)}
                    placeholder="Image URL or proof document link"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-500 space-y-1">
                  <p>• TraceBack AI scores your evidence against protected custody records.</p>
                  <p>• Authorized campus staff makes the final handover determination.</p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeClaimModal}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingClaim || !identifyingEvidence.trim()}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
                  >
                    {isSubmittingClaim ? 'Analyzing Claim...' : 'Submit Claim for Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
