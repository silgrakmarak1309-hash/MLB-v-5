import React, { useState, useEffect } from 'react';
import { BannerAd } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink } from 'lucide-react';

interface HeroBannerSectionProps {
  banners?: BannerAd[];
}

export const HeroBannerSection: React.FC<HeroBannerSectionProps> = ({ banners = [] }) => {
  const activeBanners = banners.filter((b) => b.is_active !== false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Meghalaya's Hyperlocal Trading Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Buy, Sell & Deliver Across Meghalaya
          </h1>
          <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed">
            Connect directly with verified local sellers in Tura, Shillong, Baghmara, Nongstoin, and Jowai. Fast doorstep delivery with zero hidden charges.
          </p>
        </div>
      </div>
    );
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl aspect-21/9 min-h-[160px] max-h-[300px]">
      {currentBanner.image_url ? (
        <img
          src={currentBanner.image_url}
          alt={currentBanner.title || 'Marketplace Banner'}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center p-6">
          <div className="max-w-xl">
            <h2 className="text-xl sm:text-2xl font-black">{currentBanner.title}</h2>
            {currentBanner.description && (
              <p className="text-xs text-white/90 mt-1">{currentBanner.description}</p>
            )}
          </div>
        </div>
      )}

      {currentBanner.link_url && (
        <a
          href={currentBanner.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 z-20 px-3.5 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
        >
          <span>Explore Now</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      {activeBanners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1))
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {activeBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
