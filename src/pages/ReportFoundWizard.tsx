import React, { useState } from 'react';
import { api } from '../services/api';
import { FoundItem } from '../types';
import { Package, ArrowRight, Upload, MapPin, Clock, CheckCircle2, HeartHandshake } from 'lucide-react';

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
  const [custodyLocation, setCustodyLocation] = useState('Central Library Front Desk (Bin A-14)');
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
    <div className="max-w-2xl mx-auto py-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] block mb-0.5">
            FOUND AN ITEM
          </span>
          <h2 className="text-2xl font-black text-[#171717]">Log a Found Item</h2>
          <p className="text-xs text-[#666666]">
            Help return it to the person who lost it on campus.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-[#666666] hover:text-[#171717] px-3.5 py-1.5 rounded-xl border border-[#EAEAEA] bg-white transition hover:bg-[#F9F9F9]"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-[#EAEAEA] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold text-[#171717] mb-2">Item Title / Name *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dark Green Insulated Flask or Blue Lanyard with Keys"
            className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] text-[#171717] text-sm focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-[#FFF0F0] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#171717] mb-2">Category *</label>
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
          <label className="block text-xs font-bold text-[#171717] mb-2">Description & Notable Features *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe visible condition, color, markings, stickers, engravings, where exactly on campus you saw it..."
            className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] text-[#171717] text-sm focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-[#FFF0F0] resize-none transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-2">Campus Zone Where Found</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] bg-white text-[#171717] text-xs focus:outline-none focus:border-[#E53935] transition"
            >
              {campusLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-2">Drop-off / Custody Location</label>
            <input
              type="text"
              value={custodyLocation}
              onChange={(e) => setCustodyLocation(e.target.value)}
              placeholder="e.g. Central Library Front Desk • Bin A-14"
              className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] text-[#171717] text-xs focus:outline-none focus:border-[#E53935] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#171717] mb-2">Photo of Item</label>
          <div className="flex items-center gap-4">
            <label className="flex-1 border-2 border-dashed border-[#EAEAEA] hover:border-[#E53935] rounded-2xl p-4 text-center cursor-pointer transition bg-[#FFF7F7]">
              <Upload className="w-5 h-5 mx-auto mb-1.5 text-[#666666]" />
              <span className="text-xs text-[#171717] block font-semibold">Upload photo of found item</span>
              <span className="text-[11px] text-[#666666]">Helps the owner recognize it</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            {imageUrl && (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#EAEAEA] shrink-0">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md shadow-[#E53935]/20 disabled:opacity-50"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Log Found Item'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
