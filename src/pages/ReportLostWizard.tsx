import React, { useState } from 'react';
import { api } from '../services/api';
import { LostItem, ItemFingerprint } from '../types';
import { FingerprintCard } from '../components/common/FingerprintCard';
import { PrivateClueBadge } from '../components/common/PrivateClueBadge';
import {
  Search, ArrowRight, ArrowLeft, Upload, Check, Lock, ShieldCheck,
  Sparkles, MapPin, Clock, Tag, CheckCircle2, Compass, AlertCircle
} from 'lucide-react';

interface ReportLostWizardProps {
  onCompleted: (lostItemId: string) => void;
  onCancel: () => void;
}

export const ReportLostWizard: React.FC<ReportLostWizardProps> = ({
  onCompleted,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bottles');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('Central Library');
  const [specificSpot, setSpecificSpot] = useState('2nd floor study tables');
  const [lostAt, setLostAt] = useState('Yesterday afternoon');
  const [privateClue, setPrivateClue] = useState('');

  // Processing state for Step 6
  const [processingStep, setProcessingStep] = useState(0);
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);
  const [generatedFingerprint, setGeneratedFingerprint] = useState<ItemFingerprint | null>(null);

  const categories = [
    'Bottles', 'Electronics', 'ID / Cards', 'Bags', 'Keys', 'Books', 'Clothing', 'Accessories', 'Other'
  ];

  const campusLocations = [
    'Central Library',
    'Main Academic Block',
    'Student Cafeteria',
    'Science & Computing Labs',
    'Sports Complex & Gym',
    'Student Hostels & Dorms',
    'University Auditorium',
    'Innovation & Maker Space',
    'Campus Green & Quad',
    'North Parking Area'
  ];

  const processingPhases = [
    'Looking across campus...',
    'Checking library & student center lost bins...',
    'Comparing descriptions & colors...',
    'Checking for matching stickers or logos...',
    'Ranking possible matches... 👀'
  ];

  const handleStartTracing = async () => {
    setCurrentStep(6);

    try {
      for (let i = 0; i < processingPhases.length; i++) {
        setProcessingStep(i);
        await new Promise((r) => setTimeout(r, 600));
      }

      const res = await api.createLostItem({
        title,
        category,
        description: specificSpot ? `${description} (Specific spot: ${specificSpot})` : description,
        location,
        lost_at: lostAt,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
        private_clue: privateClue,
      });

      setCreatedItemId(res.item.id);
      setGeneratedFingerprint(res.fingerprint);

      await new Promise((r) => setTimeout(r, 700));
      onCompleted(res.item.id);
    } catch (e) {
      console.error('Error submitting lost report', e);
      alert('Failed to submit report. Please retry.');
      setCurrentStep(5);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const res = await api.uploadFile(e.target.files[0]);
        setImageUrl(`http://127.0.0.1:8000${res.url}`);
      } catch (err) {
        setImageUrl(URL.createObjectURL(e.target.files[0]));
      }
    }
  };

  const stepsList = [
    { num: 1, label: 'WHAT' },
    { num: 2, label: 'WHERE' },
    { num: 3, label: 'WHEN' },
    { num: 4, label: 'CLUE' },
    { num: 5, label: 'REVIEW' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-4 animate-fade-in">
      {/* Header & Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-0.5">
              REPORT A LOST ITEM
            </span>
            <h2 className="text-2xl font-black text-[#171717]">Tell us what happened</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-[#666666] hover:text-[#171717] px-3.5 py-1.5 rounded-xl border border-[#EAEAEA] bg-white transition hover:bg-[#F9F9F9]"
          >
            Cancel
          </button>
        </div>

        {/* 5-Step Stepper Bar */}
        {currentStep <= 5 && (
          <div className="grid grid-cols-5 gap-2">
            {stepsList.map((st) => (
              <div key={st.num} className="text-center">
                <div
                  className={`h-1.5 rounded-full mb-1.5 transition-all duration-300 ${
                    currentStep >= st.num
                      ? 'bg-[#E53935]'
                      : 'bg-[#EAEAEA]'
                  }`}
                />
                <span
                  className={`text-[10px] font-bold tracking-wider ${
                    currentStep === st.num
                      ? 'text-[#E53935]'
                      : currentStep > st.num
                      ? 'text-[#171717]'
                      : 'text-[#666666]'
                  }`}
                >
                  0{st.num} {st.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Wizard Form Card */}
      <div className="rounded-3xl bg-white border border-[#EAEAEA] p-6 sm:p-8 shadow-xs">
        {/* STEP 1: WHAT */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-[#171717] mb-1">What did you lose?</h3>
              <p className="text-xs text-[#666666]">
                Give an approximate title and pick the category.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-2">
                Item Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hydro Flask Dark Green Bottle or Space Gray MacBook"
                className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] text-[#171717] text-sm focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-[#FFF0F0] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-2">
                Category *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium text-center border transition ${
                      category === cat
                        ? 'bg-[#FFF0F0] text-[#E53935] border-[#E53935] font-bold'
                        : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#171717]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-2">
                Description & Memories *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Tell us anything you remember — color, stickers, scratches, marks, stickers, dents..."
                className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] text-[#171717] text-sm focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-[#FFF0F0] resize-none transition"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-2">
                Photo (Optional)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 border-2 border-dashed border-[#EAEAEA] hover:border-[#E53935] rounded-2xl p-4 text-center cursor-pointer transition bg-[#FFF7F7]">
                  <Upload className="w-5 h-5 mx-auto mb-1.5 text-[#666666]" />
                  <span className="text-xs text-[#171717] block font-semibold">Upload a photo if you have one</span>
                  <span className="text-[11px] text-[#666666]">JPG, PNG</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {imageUrl && (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#EAEAEA] shrink-0">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={!title.trim() || !description.trim()}
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 transition shadow-xs"
              >
                <span>Continue to Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WHERE */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-[#171717] mb-1">Where did you lose it?</h3>
              <p className="text-xs text-[#666666]">
                Pick the campus location where you remember having it last.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {campusLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`p-3.5 rounded-xl text-left border transition flex items-center gap-2.5 ${
                    location === loc
                      ? 'bg-[#FFF0F0] text-[#E53935] border-[#E53935] font-bold'
                      : 'bg-white text-[#171717] border-[#EAEAEA] hover:border-[#171717]'
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${location === loc ? 'text-[#E53935]' : 'text-[#666666]'}`} />
                  <span className="text-xs">{loc}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-2">
                Specific Spot (Optional)
              </label>
              <input
                type="text"
                value={specificSpot}
                onChange={(e) => setSpecificSpot(e.target.value)}
                placeholder="e.g. 2nd floor silent study table, near the east window"
                className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] text-[#171717] text-xs focus:outline-none focus:border-[#E53935] transition"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#EAEAEA] text-[#666666] hover:text-[#171717] text-xs font-semibold hover:bg-[#F9F9F9] transition"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-xs"
              >
                <span>Continue to When</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: WHEN */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-[#171717] mb-1">When was it?</h3>
              <p className="text-xs text-[#666666]">
                Approximate day and time range.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                'Today, within the last 2 hours',
                'Today around lunch (12:00 - 2:00 PM)',
                'Yesterday afternoon',
                'Two days ago',
                'Earlier this week'
              ].map((timePreset) => (
                <button
                  key={timePreset}
                  type="button"
                  onClick={() => setLostAt(timePreset)}
                  className={`w-full p-3.5 rounded-xl text-left border transition flex items-center justify-between ${
                    lostAt === timePreset
                      ? 'bg-[#FFF0F0] text-[#E53935] border-[#E53935] font-bold'
                      : 'bg-white text-[#171717] border-[#EAEAEA] hover:border-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <Clock className="w-4 h-4 text-[#E53935]" />
                    <span>{timePreset}</span>
                  </div>
                  {lostAt === timePreset && <Check className="w-4 h-4 text-[#E53935]" />}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                Or specific custom date & time:
              </label>
              <input
                type="text"
                value={lostAt}
                onChange={(e) => setLostAt(e.target.value)}
                placeholder="e.g. Monday Oct 3, around 4:15 PM"
                className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] text-[#171717] text-xs focus:outline-none focus:border-[#E53935] transition"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#EAEAEA] text-[#666666] hover:text-[#171717] text-xs font-semibold hover:bg-[#F9F9F9] transition"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-xs"
              >
                <span>Continue to Private Clue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PRIVATE CLUE */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl bg-[#FFF0F0] border border-[#E53935]/20 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white text-[#E53935] shrink-0 shadow-2xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#171717] mb-1">
                  Add a secret detail only you know
                </h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  This helps prove it's yours later and will <strong>never be shown publicly</strong>. Only verified staff compare this when you claim your item.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-2">
                Secret ownership clue:
              </label>
              <textarea
                value={privateClue}
                onChange={(e) => setPrivateClue(e.target.value)}
                rows={3}
                placeholder="Examples: 'Small sticker under the bottle base' or 'My student ID number written on inside tag' or 'Scratch near power button'..."
                className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] text-[#171717] text-sm focus:outline-none focus:border-[#E53935] resize-none transition"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF7F7] border border-[#EAEAEA] text-xs text-[#666666] space-y-1">
              <span className="font-bold text-[#171717] block mb-1">Privacy guarantee:</span>
              <p>✓ Never shown on public campus feeds</p>
              <p>✓ Never visible to strangers or other claimants</p>
              <p>✓ Only used to verify ownership before physical handover</p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#EAEAEA] text-[#666666] hover:text-[#171717] text-xs font-semibold hover:bg-[#F9F9F9] transition"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-xs"
              >
                <span>Review & Trace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & TRACE */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-[#171717] mb-1">Ready to trace?</h3>
              <p className="text-xs text-[#666666]">
                Review your report before TraceBack searches for matches.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA] space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                <span className="text-[#666666] font-medium">ITEM:</span>
                <span className="text-[#171717] font-bold">{title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                <span className="text-[#666666] font-medium">CATEGORY:</span>
                <span className="text-[#171717] font-semibold">{category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                <span className="text-[#666666] font-medium">CAMPUS LOCATION:</span>
                <span className="text-[#171717] font-semibold">{location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                <span className="text-[#666666] font-medium">TIME:</span>
                <span className="text-[#171717] font-semibold">{lostAt}</span>
              </div>
              <div className="py-1">
                <span className="text-[#666666] font-medium block mb-1">DESCRIPTION:</span>
                <p className="text-[#171717] italic">"{description}"</p>
              </div>
            </div>

            {privateClue && (
              <PrivateClueBadge clue={privateClue} isOwner={true} />
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#EAEAEA] text-[#666666] hover:text-[#171717] text-xs font-semibold hover:bg-[#F9F9F9] transition"
              >
                Back
              </button>
              <button
                onClick={handleStartTracing}
                className="px-8 py-3.5 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md shadow-[#E53935]/20"
              >
                <Compass className="w-4 h-4" />
                <span>Trace It Back</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: TRACING ANIMATION */}
        {currentStep === 6 && (
          <div className="py-10 text-center space-y-6 animate-fade-in">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-[#FFF0F0] border-t-[#E53935] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[#E53935]">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-1">
                SEARCHING CAMPUS
              </span>
              <h3 className="text-xl font-bold text-[#171717]">
                Scanning Campus Registry...
              </h3>
            </div>

            {/* Step Checkmarks */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA] text-left text-xs space-y-2.5">
              {processingPhases.map((phase, idx) => {
                const isDone = processingStep > idx;
                const isCurrent = processingStep === idx;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 transition ${
                      isDone
                        ? 'text-emerald-700 font-semibold'
                        : isCurrent
                        ? 'text-[#E53935] font-bold animate-pulse'
                        : 'text-[#666666]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#E53935] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#EAEAEA] shrink-0" />
                    )}
                    <span>{phase}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
