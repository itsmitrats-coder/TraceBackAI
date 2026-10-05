import React, { useState } from 'react';
import { Search, Sparkles, X, ArrowRight, Tag, MapPin, Clock, Palette } from 'lucide-react';
import { api } from '../../services/api';
import { FoundItem, NaturalSearchResponse } from '../../types';

interface NaturalSearchBarProps {
  onResultsFound: (results: FoundItem[], understoodAs?: any) => void;
  className?: string;
}

export const NaturalSearchBar: React.FC<NaturalSearchBarProps> = ({
  onResultsFound,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [understood, setUnderstood] = useState<NaturalSearchResponse['understood_as'] | null>(null);

  const sampleQueries = [
    'black bottle found near library yesterday',
    'silver laptop left in academic block',
    'keys with blue fob dropped in parking area',
  ];

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.naturalSearch(searchQuery);
      setUnderstood(res.understood_as);
      onResultsFound(res.results, res.understood_as);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setUnderstood(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-4 text-blue-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Describe what you lost or found in natural English (e.g. 'black bottle found near library yesterday')..."
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xl transition"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1.5 text-slate-400 hover:text-white transition rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 disabled:opacity-50"
          >
            <span>Investigate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Queries */}
      {!understood && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Try Clues:
          </span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition text-[11px]"
            >
              "{sq}"
            </button>
          ))}
        </div>
      )}

      {/* AI Understanding Breakdown Banner */}
      {understood && (
        <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono font-bold uppercase tracking-wider text-blue-400 text-[10px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> TRACEBACK UNDERSTOOD YOUR SEARCH AS:
            </span>
            <button
              onClick={clearSearch}
              className="text-[11px] text-slate-400 hover:text-white transition"
            >
              Clear filter
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {understood.category && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-1.5 font-medium">
                <Tag className="w-3 h-3" /> Category: {understood.category}
              </span>
            )}
            {understood.color && (
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5 font-medium">
                <Palette className="w-3 h-3" /> Color: {understood.color}
              </span>
            )}
            {understood.location && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3 h-3" /> Sector: {understood.location}
              </span>
            )}
            {understood.time && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 font-medium">
                <Clock className="w-3 h-3" /> Time: {understood.time}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
