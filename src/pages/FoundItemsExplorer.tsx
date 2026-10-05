import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FoundItem, Claim } from '../types';
import { NaturalSearchBar } from '../components/investigation/NaturalSearchBar';
import {
  Package, Search, ShieldCheck, MapPin, Clock, Filter,
  Tag, X, CheckCircle2, AlertTriangle, ArrowRight, Upload, Lock
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
        <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-1">
          CAMPUS REGISTRY
        </span>
        <h1 className="text-3xl font-black text-[#171717] tracking-tight mb-2">
          Found Belongings on Campus
        </h1>
        <p className="text-xs text-[#666666] max-w-2xl">
          Browse items turned in across campus buildings. If you spot your item, tap "This Is Mine" to submit a private claim.
        </p>
      </div>

      {/* Natural Language Search */}
      <NaturalSearchBar
        onResultsFound={(results) => setItems(results)}
      />

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA] text-xs">
        <span className="flex items-center gap-1.5 font-bold text-[#171717]">
          <Filter className="w-3.5 h-3.5 text-[#E53935]" /> Filter by:
        </span>

        {/* Category select */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#EAEAEA] text-[#171717] text-xs focus:outline-none focus:border-[#E53935]"
        >
          {categories.map((c) => (
            <option key={c} value={c}>Category: {c === 'all' ? 'All' : c}</option>
          ))}
        </select>

        {/* Location select */}
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#EAEAEA] text-[#171717] text-xs focus:outline-none focus:border-[#E53935]"
        >
          {locations.map((l) => (
            <option key={l} value={l}>Location: {l === 'all' ? 'All Zones' : l}</option>
          ))}
        </select>

        {/* Status select */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#EAEAEA] text-[#171717] text-xs focus:outline-none focus:border-[#E53935]"
        >
          <option value="all">Status: All</option>
          <option value="open">Available to Claim</option>
          <option value="claim_pending">Claim Pending</option>
          <option value="verified">Verified</option>
          <option value="recovered">Recovered</option>
        </select>

        <span className="ml-auto text-[#666666] text-xs">
          Showing {items.length} items
        </span>
      </div>

      {/* Found Items Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFF0F0] border-t-[#E53935] animate-spin mx-auto" />
          <p className="text-xs text-[#666666]">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-[#666666] p-8 rounded-3xl bg-white border border-[#EAEAEA]">
          <Package className="w-10 h-10 mx-auto mb-2 text-[#666666]" />
          <p className="text-sm font-bold text-[#171717]">No items found matching your filters.</p>
          <p className="text-xs text-[#666666] mt-1">Try resetting the category or location filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white border border-[#EAEAEA] overflow-hidden shadow-xs hover:border-[#E53935] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo banner */}
                <div className="relative h-48 bg-[#F9F9F9] overflow-hidden border-b border-[#EAEAEA]">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#666666]">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#171717] border border-[#EAEAEA] shadow-2xs backdrop-blur-xs">
                      {item.status === 'open' ? 'Available' : item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#171717] bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#EAEAEA] shadow-2xs">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#E53935]" /> {item.location}
                    </span>
                    <span className="text-[#666666]">{item.found_at}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#E53935] tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-[#171717] leading-tight group-hover:text-[#E53935] transition">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#666666] line-clamp-3 leading-relaxed">
                    "{item.description}"
                  </p>

                  <div className="p-3 rounded-xl bg-[#FFF7F7] border border-[#EAEAEA] text-xs text-[#666666] space-y-1">
                    <div>Held at: <strong className="text-[#171717]">{item.custody_location || 'Campus Front Desk'}</strong></div>
                    {item.fingerprint?.distinctive_marks && item.fingerprint.distinctive_marks.length > 0 && (
                      <div>Key marks: <span className="text-[#171717] font-medium">{item.fingerprint.distinctive_marks.join(', ')}</span></div>
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
                      ? 'bg-[#F9F9F9] text-[#666666] border border-[#EAEAEA] cursor-not-allowed'
                      : 'bg-[#E53935] hover:bg-[#C62828] text-white shadow-xs'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{item.status === 'recovered' ? 'Item Returned' : 'This Is Mine'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prove It's Yours Claim Modal */}
      {claimingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-[#EAEAEA] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeClaimModal}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9] transition"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedClaim ? (
              /* Success Confirmation */
              <div className="space-y-6 text-center animate-fade-in py-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    CLAIM SUBMITTED!
                  </span>
                  <h3 className="text-2xl font-bold text-[#171717]">
                    Staff will review your proof
                  </h3>
                  <p className="text-xs text-[#666666] max-w-md mx-auto mt-1">
                    You'll receive a notification when your item is confirmed and ready for pickup at the campus desk.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA] text-left space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA]">
                    <span className="text-xs font-bold text-[#171717]">
                      Match Confidence:
                    </span>
                    <span className="text-base font-bold text-[#E53935]">
                      {submittedClaim.verification_score}%
                    </span>
                  </div>

                  <p className="text-xs text-[#666666] leading-relaxed">
                    {submittedClaim.verification_summary}
                  </p>

                  <div className="space-y-1 pt-1 text-xs">
                    {submittedClaim.verification_alignments.map((al, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-emerald-700 text-xs">
                        <span className="font-bold">✓</span>
                        <span>{al}</span>
                      </div>
                    ))}
                    {submittedClaim.verification_concerns.map((co, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-amber-700 text-xs">
                        <span className="font-bold">!</span>
                        <span>{co}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#EAEAEA] text-xs text-[#666666]">
                    Status: <strong className="text-[#E53935] uppercase font-bold">Pending Staff Review</strong>
                  </div>
                </div>

                <button
                  onClick={closeClaimModal}
                  className="w-full py-3 rounded-2xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
                >
                  Return to Found Registry
                </button>
              </div>
            ) : (
              /* Claim Input Form: Prove It's Yours */
              <form onSubmit={handleClaimSubmit} className="space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-1">
                    PROVE IT'S YOURS
                  </span>
                  <h3 className="text-xl font-bold text-[#171717]">
                    Claim "{claimingItem.title}"
                  </h3>
                  <p className="text-xs text-[#666666] mt-1">
                    Describe a private detail so staff can confirm it belongs to you.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF0F0] border border-[#E53935]/20 text-xs text-[#171717] flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white text-[#E53935] shrink-0 shadow-2xs">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block mb-0.5">Tell us something only the owner would know:</span>
                    <p className="text-[#666666] text-[11px]">
                      Examples: What sticker is on the back? What's the wallpaper or passcode? Any secret engraving or inside contents?
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-2">
                    Your Private Proof *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={identifyingEvidence}
                    onChange={(e) => setIdentifyingEvidence(e.target.value)}
                    placeholder="Describe specific features only you know about this item..."
                    className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] text-[#171717] text-sm focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-[#FFF0F0] resize-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-2">
                    Proof photo or purchase receipt link (Optional)
                  </label>
                  <input
                    type="text"
                    value={proofImage}
                    onChange={(e) => setProofImage(e.target.value)}
                    placeholder="Photo link or document URL"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAEAEA] text-[#171717] text-xs focus:outline-none focus:border-[#E53935] transition"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#FFF7F7] border border-[#EAEAEA] text-xs text-[#666666] space-y-1">
                  <p>• Your private proof is never shown to other students.</p>
                  <p>• Campus staff at the desk will verify this before handing the item over.</p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeClaimModal}
                    className="px-4 py-2.5 rounded-xl border border-[#EAEAEA] bg-white text-[#666666] hover:text-[#171717] text-xs font-semibold hover:bg-[#F9F9F9] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingClaim || !identifyingEvidence.trim()}
                    className="px-6 py-2.5 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs disabled:opacity-50"
                  >
                    {isSubmittingClaim ? 'Submitting Claim...' : 'Submit Claim'}
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
