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
    'keys with lanyard dropped in parking lot',
    'blue hydroflask near sports complex',
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
      <div className="relative flex items-center shadow-sm rounded-2xl bg-white border border-[#EAEAEA] focus-within:border-[#E53935] focus-within:ring-2 focus-within:ring-[#FFF0F0] transition-all">
        <div className="absolute left-4 text-[#666666]">
          <Search className="w-5 h-5 text-[#E53935]" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for anything lost or found... e.g. blue bottle near library yesterday"
          className="w-full pl-12 pr-32 py-3.5 rounded-2xl bg-transparent text-[#171717] placeholder-[#666666] text-sm focus:outline-none"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1.5 text-[#666666] hover:text-[#171717] hover:bg-[#F9F9F9] transition rounded-lg"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm shadow-[#E53935]/20 disabled:opacity-50"
          >
            <span>{isLoading ? 'Searching...' : 'Search'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Queries */}
      {!understood && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#666666]">
          <span className="text-[11px] font-medium text-[#666666]">Try:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="px-3 py-1 rounded-full bg-white border border-[#EAEAEA] text-[#171717] hover:border-[#E53935] hover:text-[#E53935] transition text-xs shadow-2xs"
            >
              "{sq}"
            </button>
          ))}
        </div>
      )}

      {/* Understood Breakdown Banner */}
      {understood && (
        <div className="p-3.5 rounded-2xl bg-[#FFF7F7] border border-[#EAEAEA] text-xs animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[#171717] text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E53935]" />
              We searched for:
            </span>
            <button
              onClick={clearSearch}
              className="text-xs text-[#666666] hover:text-[#E53935] underline transition"
            >
              Reset filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {understood.category && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAEAEA] text-[#171717] flex items-center gap-1.5 font-medium shadow-2xs">
                <Tag className="w-3 h-3 text-[#E53935]" /> Category: {understood.category}
              </span>
            )}
            {understood.color && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAEAEA] text-[#171717] flex items-center gap-1.5 font-medium shadow-2xs">
                <Palette className="w-3 h-3 text-[#E53935]" /> Color: {understood.color}
              </span>
            )}
            {understood.location && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAEAEA] text-[#171717] flex items-center gap-1.5 font-medium shadow-2xs">
                <MapPin className="w-3 h-3 text-[#E53935]" /> Near: {understood.location}
              </span>
            )}
            {understood.time && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAEAEA] text-[#171717] flex items-center gap-1.5 font-medium shadow-2xs">
                <Clock className="w-3 h-3 text-[#E53935]" /> When: {understood.time}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
