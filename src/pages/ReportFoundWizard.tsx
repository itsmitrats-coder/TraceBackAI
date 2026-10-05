import React, { useState } from 'react';
import { api } from '../services/api';
import { FoundItem } from '../types';
import { Package, ArrowRight, Upload, MapPin, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ReportFoundWizardProps {
  onCompleted: (foundItemId: string) => void;
  onCancel: () => void;
}

export const ReportFoundWizard: React.FC<ReportFoundWizardProps> = ({
  onCompleted,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bottles');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Central Library');
  const [custodyLocation, setCustodyLocation] = useState('Central Library Information Desk (Bin A-14)');
  const [foundAt, setFoundAt] = useState('Today, 2:00 PM');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Bottles', 'Electronics', 'ID / Cards', 'Bags', 'Keys', 'Books', 'Clothing', 'Accessories', 'Other'
  ];

  const campusLocations = [
    'Central Library', 'Main Academic Block', 'Student Cafeteria',
    'Science & Computing Labs', 'Sports Complex & Gym', 'Student Hostels & Dorms',
    'University Auditorium', 'Innovation & Maker Space', 'Campus Green & Quad', 'North Parking Area'
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.createFoundItem({
        title,
        category,
        description,
        location,
        found_at: foundAt,
        custody_location: custodyLocation,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
      });
      onCompleted(res.item.id);
    } catch (err) {
      console.error(err);
      alert('Failed to log found item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-0.5">
            CAMPUS CUSTODY REGISTRATION
          </span>
          <h2 className="text-2xl font-black text-white">Log Found Belonging</h2>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl space-y-6">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Item Name / Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dark Green Metal Insulated Flask"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Category *</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2 px-3 rounded-xl text-xs font-medium text-center border transition ${
                  category === cat
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 font-bold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Description & Observed Features *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe visible condition, color, stickers, engravings, where precisely it was found..."
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Campus Zone Where Found</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {campusLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Current Custody Drop-off Point</label>
            <input
              type="text"
              value={custodyLocation}
              onChange={(e) => setCustodyLocation(e.target.value)}
              placeholder="e.g. Central Library Front Desk • Locker B"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Item Photograph</label>
          <div className="flex items-center gap-4">
            <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-950/40">
              <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              <span className="text-xs text-slate-300 block font-medium">Upload Found Item Photo</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            {imageUrl && (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-emerald-500/40 shrink-0">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-emerald-600/30 disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            <span>{isSubmitting ? 'Registering...' : 'Register Item & Generate Fingerprint'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
