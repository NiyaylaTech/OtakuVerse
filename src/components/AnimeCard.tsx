import React from 'react';
import { AniListMedia, cleanDescription, getFallbackCover } from '../services/anilist';

interface AnimeCardProps {
  media: AniListMedia;
  onClickMedia?: (media: AniListMedia) => void;
  badge?: string;
  rankNumber?: number;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ media, onClickMedia, badge, rankNumber }) => {
  const title = media.title.english || media.title.userPreferred || media.title.romaji || 'Untitled';
  const subTitle = media.title.romaji && media.title.romaji !== title ? media.title.romaji : '';
  const coverUrl = media.coverImage?.extraLarge || media.coverImage?.large || getFallbackCover(title);
  const score = media.averageScore ? (media.averageScore / 10).toFixed(1) : 'N/A';
  const format = media.format ? media.format.replace('_', ' ') : media.type;
  const status = media.status ? media.status.replace(/_/g, ' ') : '';
  const episodesOrChapters = media.type === 'ANIME' 
    ? (media.episodes ? `${media.episodes} eps` : 'Ongoing')
    : (media.chapters ? `${media.chapters} ch` : 'Publishing');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClickMedia) {
      onClickMedia(media);
    } else {
      window.history.pushState({}, '', `/anime/${media.id}`);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-[#0E1410] border border-[#23382C] hover:border-[#389B5F] rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(56,155,95,0.25)] cursor-pointer flex flex-col h-full"
    >
      {/* Rank Badge if specified */}
      {rankNumber && (
        <div className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-[#25663E] border border-[#C5A059] text-[#C5A059] font-bold text-sm flex items-center justify-center shadow-lg">
          #{rankNumber}
        </div>
      )}

      {/* Custom Badge if specified */}
      {badge && !rankNumber && (
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-[#25663E]/90 text-white font-bold text-xs uppercase tracking-wider border border-[#389B5F]">
          {badge}
        </div>
      )}

      {/* Score Badge */}
      <div className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#C5A059]/60 text-[#C5A059] font-extrabold text-xs flex items-center gap-1 shadow-md">
        <span>★</span>
        <span>{score}</span>
      </div>

      {/* Cover Image Container */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#141C17]">
        <img
          src={coverUrl}
          alt={title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackCover(title);
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1410] via-transparent to-black/20 opacity-80 group-hover:opacity-40 transition-opacity"></div>
        
        {/* Hover Overlay with genres & description excerpt */}
        <div className="absolute inset-0 bg-black/85 p-3 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end gap-2 backdrop-blur-xs">
          <p className="line-clamp-4 text-slate-200 leading-relaxed font-sans">
            {cleanDescription(media.description)}
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {media.genres?.slice(0, 3).map((g) => (
              <span key={g} className="px-1.5 py-0.5 rounded bg-[#25663E] text-[#A3C2AE] text-[10px] font-semibold">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2 border-t border-[#23382C]">
        <div>
          <h4 className="font-serif font-bold text-sm text-white line-clamp-1 group-hover:text-[#389B5F] transition-colors">
            {title}
          </h4>
          {subTitle && (
            <p className="text-[11px] text-[#A3C2AE]/70 line-clamp-1 font-mono mt-0.5">
              {subTitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-[#A3C2AE] font-mono pt-1 border-t border-[#23382C]/50">
          <span className="capitalize px-1.5 py-0.5 rounded bg-[#141C17] border border-[#23382C]">
            {format}
          </span>
          <span className="text-[11px]">
            {episodesOrChapters}
          </span>
        </div>
      </div>
    </div>
  );
};
