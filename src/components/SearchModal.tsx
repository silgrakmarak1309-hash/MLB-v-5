import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, Tag, ArrowRight } from 'lucide-react';
import { Listing, formatPrice, getListingPrimaryImage } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  listings,
  onSelectListing,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return listings
      .filter((l) => {
        const titleMatch = l.title.toLowerCase().includes(q);
        const descMatch = (l.description || '').toLowerCase().includes(q);
        const catMatch = (l.category || l.category_name || '').toLowerCase().includes(q);
        const distMatch = (l.district || '').toLowerCase().includes(q);
        const villageMatch = (l.village || '').toLowerCase().includes(q);
        return titleMatch || descMatch || catMatch || distMatch || villageMatch;
      })
      .slice(0, 8);
  }, [query, listings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="relative flex items-center border-b border-slate-200 pb-3">
          <Search className="w-5 h-5 text-slate-400 absolute left-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search items, electronics, vehicles, shops across Meghalaya..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 text-sm font-medium text-slate-900 bg-transparent focus:outline-none"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2">
          {query.trim() === '' ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Type keywords to search listings, sellers, and services
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching listings found for "{query}"
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200"
              >
                <img
                  src={getListingPrimaryImage(item)}
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-extrabold text-orange-600">₹{formatPrice(item.price || item.delivery_fee)}</span>
                    {item.category && <span>• {item.category}</span>}
                    {item.district && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.district}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
