import React, { useState } from 'react';
import { Anime, cleanDescription } from '../services/anilist';

interface PinterestAnimeCardProps {
  anime: Anime;
  onSelectMedia: (anime: Anime) => void;
  aspectVariant?: 'tall' | 'standard' | 'compact' | 'hero';
  showGenres?: boolean;
}

export const PinterestAnimeCard: React.FC<PinterestAnimeCardProps> = ({
  anime,
  onSelectMedia,
  aspectVariant = 'standard',
  showGenres = true,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(() => {
    try {
      const saved = localStorage.getItem('otakuverse_quick_bookmarks');
      if (saved) {
        const list: number[] = JSON.parse(saved);
        return list.includes(anime.id);
      }
    } catch (e) {}
    return false;
  });

  const [imageError, setImageError] = useState(false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('otakuverse_quick_bookmarks');
      let list: number[] = saved ? JSON.parse(saved) : [];
      if (list.includes(anime.id)) {
        list = list.filter((id) => id !== anime.id);
        setIsBookmarked(false);
      } else {
        list.push(anime.id);
        setIsBookmarked(true);
      }
      localStorage.setItem('otakuverse_quick_bookmarks', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update bookmark', e);
    }
  };

  const titleText = anime.title?.english || anime.title?.romaji || anime.title?.userPreferred || 'Untitled Anime';
  const coverUrl = imageError
    ? `https://placehold.co/400x600/0E1410/C5A059?text=${encodeURIComponent(titleText.slice(0, 15))}`
    : anime.coverImage?.extraLarge || anime.coverImage?.large || anime.coverImage?.medium || '';

  // Determine aspect ratio class for Pinterest masonry effect
  let aspectClass = 'aspect-[3/4]';
  if (aspectVariant === 'tall') aspectClass = 'aspect-[2/3]';
  else if (aspectVariant === 'compact') aspectClass = 'aspect-[4/3]';
  else if (aspectVariant === 'hero') aspectClass = 'aspect-[16/10]';

  const score = anime.averageScore || anime.meanScore;

  return (
    <div
      onClick={() => onSelectMedia(anime)}
      className="group relative cursor-pointer break-inside-avoid mb-5 rounded-2xl overflow-hidden bg-[#0E1410] border border-[#1A261D] hover:border-[#389B5F]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#389B5F]/10 hover:-translate-y-1 flex flex-col"
    >
      {/* Image Container */}
      <div className={`relative w-full overflow-hidden ${aspectClass} bg-[#080B09]`}>
        <img
          src={coverUrl}
          alt={titleText}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060807] via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          {score ? (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#060807]/80 backdrop-blur-md border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold shadow-lg">
              <span>★</span>
              <span>{(score / 10).toFixed(1)}</span>
            </div>
          ) : (
            <div />
          )}

          {anime.format && (
            <div className="px-2.5 py-1 rounded-full bg-[#0E1410]/80 backdrop-blur-md border border-[#389B5F]/40 text-[#A3C2AE] text-[10px] font-mono tracking-wide uppercase">
              {anime.format}
            </div>
          )}
        </div>

        {/* Floating Hover Action Buttons (Pinterest Pins Style) */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-20">
          <div className="flex justify-end">
            <button
              onClick={toggleBookmark}
              title={isBookmarked ? 'Saved to Bookmarks' : 'Quick Save'}
              className={`p-2.5 rounded-full transition-all duration-200 shadow-xl flex items-center space-x-1.5 ${
                isBookmarked
                  ? 'bg-[#389B5F] text-black font-bold scale-105'
                  : 'bg-[#0E1410]/90 text-white hover:bg-[#389B5F] hover:text-black border border-[#23382C]'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill={isBookmarked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs font-semibold">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-[#D1E0D7] line-clamp-3 leading-relaxed font-sans bg-[#080B09]/80 p-2.5 rounded-lg border border-[#1A281E]">
              {cleanDescription(anime.description || '').slice(0, 110)}...
            </p>
            <button className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#389B5F] to-[#25663E] hover:from-[#44B270] hover:to-[#2E7C4D] text-black font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center space-x-1">
              <span>View Anime Details</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 bg-[#0A0E0B]">
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#389B5F] transition-colors line-clamp-1 leading-snug">
            {titleText}
          </h3>
          {anime.title?.romaji && anime.title.romaji !== titleText && (
            <p className="text-[11px] text-[#A3C2AE]/70 line-clamp-1 font-mono italic">
              {anime.title.romaji}
            </p>
          )}
        </div>

        {/* Secondary Info Line */}
        <div className="flex items-center justify-between text-[11px] text-[#A3C2AE]/80 pt-1 border-t border-[#141F17]">
          <span className="font-mono">
            {anime.seasonYear ? anime.seasonYear : ''} {anime.status ? `• ${anime.status.replace(/_/g, ' ')}` : ''}
          </span>
          {anime.episodes ? (
            <span className="bg-[#142118] px-2 py-0.5 rounded text-[10px] text-[#389B5F] border border-[#233B2B]">
              {anime.episodes} eps
            </span>
          ) : null}
        </div>

        {/* Genre Badges */}
        {showGenres && anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {anime.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#111A13] text-[#A3C2AE] border border-[#1D2F22] group-hover:border-[#389B5F]/30 transition-colors"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
