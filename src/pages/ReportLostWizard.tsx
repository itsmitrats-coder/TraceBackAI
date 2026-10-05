import React, { useState } from 'react';
import { api } from '../services/api';
import { LostItem, ItemFingerprint } from '../types';
import { FingerprintCard } from '../components/common/FingerprintCard';
import { PrivateClueBadge } from '../components/common/PrivateClueBadge';
import {
  Search, ArrowRight, ArrowLeft, Upload, Check, Lock, Shield,
  Sparkles, MapPin, Clock, Tag, Cpu, CheckCircle2, AlertCircle, FileText
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
  const [lostAt, setLostAt] = useState('Yesterday, 3:30 PM');
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
    'Understanding natural language description...',
    'Forensic multimodal feature vector analysis...',
    'Synthesizing AI Item Fingerprint...',
    'Scanning campus found items registry...',
    'Evaluating 5-factor evidence matrix (V, S, F, L, T)...',
    'Ranking candidates and identifying ambiguity markers...'
  ];

  const handleStartTracing = async () => {
    setCurrentStep(6);

    try {
      // Simulate/Trigger progressive scanning animation
      for (let i = 0; i < processingPhases.length; i++) {
        setProcessingStep(i);
        await new Promise((r) => setTimeout(r, 650));
      }

      const res = await api.createLostItem({
        title,
        category,
        description,
        location,
        lost_at: lostAt,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
        private_clue: privateClue,
      });

      setCreatedItemId(res.item.id);
      setGeneratedFingerprint(res.fingerprint);

      await new Promise((r) => setTimeout(r, 800));
      onCompleted(res.item.id);
    } catch (e) {
      console.error('Error submitting lost report', e);
      alert('Failed to submit report. Please retry.');
      setCurrentStep(5);
    }
  };

  // Image upload handling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const res = await api.uploadFile(e.target.files[0]);
        setImageUrl(`http://127.0.0.1:8000${res.url}`);
      } catch (err) {
        // Fallback to local object URL
        setImageUrl(URL.createObjectURL(e.target.files[0]));
      }
    }
  };

  const stepsList = [
    { num: 1, label: 'WHAT' },
    { num: 2, label: 'WHERE' },
    { num: 3, label: 'WHEN' },
    { num: 4, label: 'IDENTIFY' },
    { num: 5, label: 'REVIEW' },
    { num: 6, label: 'TRACE' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 animate-fade-in">
      {/* Stepper Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block mb-0.5">
              FORENSIC INVESTIGATION WIZARD
            </span>
            <h2 className="text-2xl font-black text-white">Report Lost Belonging</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
          >
            Cancel
          </button>
        </div>

        {/* 6-Step Stepper Bar */}
        <div className="grid grid-cols-6 gap-2">
          {stepsList.map((st) => (
            <div key={st.num} className="text-center">
              <div
                className={`h-1.5 rounded-full mb-1.5 transition-all duration-300 ${
                  currentStep >= st.num
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                    : 'bg-slate-800'
                }`}
              />
              <span
                className={`text-[10px] font-mono font-bold tracking-wider ${
                  currentStep === st.num
                    ? 'text-cyan-400'
                    : currentStep > st.num
                    ? 'text-blue-300'
                    : 'text-slate-600'
                }`}
              >
                0{st.num} {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        {/* STEP 1: WHAT */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">What did you lose?</h3>
              <p className="text-xs text-slate-400">
                Give an approximate title and choose the closest category.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                Item Title / Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hydro Flask Dark Green Water Bottle or Space Gray MacBook Pro"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                Category Selection *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium text-center border transition ${
                      category === cat
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                Description & Memories *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe color, size, material, stickers, scratches, or any detail you recall..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Image upload / URL */}
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                Reference Photo (Optional but Recommended)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-950/40">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <span className="text-xs text-slate-300 block font-medium">Click or Drag Image Here</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WEBP</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {imageUrl && (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-blue-500/40 shrink-0">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={!title.trim() || !description.trim()}
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 transition"
              >
                <span>Continue: Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WHERE */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Where did you last see it?</h3>
              <p className="text-xs text-slate-400">
                Select the campus zone or general sector where you suspect it went missing.
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
                      ? 'bg-blue-600/30 text-blue-200 border-blue-500 font-bold'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${location === loc ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="text-xs">{loc}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
              >
                <span>Continue: Timing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: WHEN */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">When did you lose it?</h3>
              <p className="text-xs text-slate-400">
                Approximate date, time of day, or time range.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'Today, within the last 2 hours',
                'Today, around lunchtime (12:00 - 2:00 PM)',
                'Yesterday, afternoon (3:00 - 5:00 PM)',
                'Two days ago',
                'Earlier this week'
              ].map((timePreset) => (
                <button
                  key={timePreset}
                  type="button"
                  onClick={() => setLostAt(timePreset)}
                  className={`w-full p-3.5 rounded-xl text-left border transition flex items-center justify-between ${
                    lostAt === timePreset
                      ? 'bg-blue-600/30 text-blue-200 border-blue-500 font-bold'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{timePreset}</span>
                  </div>
                  {lostAt === timePreset && <Check className="w-4 h-4 text-blue-400" />}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Or Specify Custom Date / Window
              </label>
              <input
                type="text"
                value={lostAt}
                onChange={(e) => setLostAt(e.target.value)}
                placeholder="e.g. Wednesday Oct 2, around 4:15 PM"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
              >
                <span>Continue: Private Clue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PRIVATE CLUE (VERY IMPORTANT - SECTION 11) */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Private Ownership Clue (Shielded)
                </h4>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  This clue is <strong>never displayed publicly</strong> on found listings or candidate cards.
                  It is securely stored so TraceBack can assist staff in proving that a claimed item actually belongs to you!
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                Something only the true owner would know:
              </label>
              <textarea
                value={privateClue}
                onChange={(e) => setPrivateClue(e.target.value)}
                rows={3}
                placeholder="e.g. 'Inside flap has my name Alex written in blue pen' or 'Small circular NASA astronaut sticker under the base' or 'Lock screen has photo of golden retriever'..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-indigo-900/60 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block mb-1">TraceBack Security Guarantee:</span>
              <p>✓ Never shown in public listings</p>
              <p>✓ Never exposed in match explanations</p>
              <p>✓ Used strictly during AI claim verification</p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
              >
                <span>Continue: Review Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Review Report Dossier</h3>
              <p className="text-xs text-slate-400">
                Confirm your parameters before initializing TraceBack forensic investigation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">OBJECT / TITLE:</span>
                <span className="text-white font-bold">{title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">CATEGORY:</span>
                <span className="text-slate-200">{category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">LAST SEEN SECTOR:</span>
                <span className="text-slate-200">{location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">APPROXIMATE TIME:</span>
                <span className="text-slate-200">{lostAt}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 font-mono block mb-1">DESCRIPTION:</span>
                <p className="text-slate-300 italic">"{description}"</p>
              </div>
            </div>

            {privateClue && (
              <PrivateClueBadge clue={privateClue} isOwner={true} />
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Back
              </button>
              <button
                onClick={handleStartTracing}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-xl shadow-cyan-500/20 transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Initialize TraceBack Investigation</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: TRACE (ENGAGING AI PROCESSING SCANNER - SECTION 11) */}
        {currentStep === 6 && (
          <div className="py-10 text-center space-y-6 animate-fade-in">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20 animate-ping" />
              <div className="w-20 h-20 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 block mb-1">
                TRACEBACK INTELLIGENCE ENGINE
              </span>
              <h3 className="text-xl font-bold text-white">
                Forensic Analysis in Progress...
              </h3>
            </div>

            {/* Step Checkmarks */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2.5">
              {processingPhases.map((phase, idx) => {
                const isDone = processingStep > idx;
                const isCurrent = processingStep === idx;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 transition ${
                      isDone
                        ? 'text-emerald-400 font-medium'
                        : isCurrent
                        ? 'text-cyan-300 font-bold animate-pulse'
                        : 'text-slate-600'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
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
