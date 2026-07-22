import React, { useState, useEffect } from 'react';
import { AniListMedia, getPopularAnime, getPopularManga } from '../services/anilist';
import { AnimeCard } from '../components/AnimeCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface RankingsViewProps {
  onSelectMedia: (media: AniListMedia) => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({ onSelectMedia }) => {
  const [tab, setTab] = useState<'ANIME' | 'MANGA'>('ANIME');
  const [rankings, setRankings] = useState<AniListMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = tab === 'ANIME' ? getPopularAnime(1, 18) : getPopularManga(1, 18);
    fetcher
      .then((res) => {
        setRankings(res.media);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b-2 border-[#23382C] pb-6 space-y-2">
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-white flex items-center gap-3">
          <span>🏆</span> Global AniList Hall of Fame & Leaderboards
        </h1>
        <p className="text-sm text-[#A3C2AE]">
          The highest rated and most celebrated anime and manga titles globally.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-2 border-[#23382C] rounded-2xl overflow-hidden bg-[#0E1410] max-w-md">
        <button
          onClick={() => setTab('ANIME')}
          className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
            tab === 'ANIME' ? 'bg-[#25663E] text-white' : 'text-[#A3C2AE] hover:bg-[#141C17]'
          }`}
        >
          📺 Top Anime Leaderboard
        </button>
        <button
          onClick={() => setTab('MANGA')}
          className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
            tab === 'MANGA' ? 'bg-[#25663E] text-white' : 'text-[#A3C2AE] hover:bg-[#141C17]'
          }`}
        >
          📖 Top Manga Leaderboard
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={12} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
          {rankings.map((media, idx) => (
            <AnimeCard
              key={`rank_${media.id}`}
              media={media}
              onClickMedia={onSelectMedia}
              rankNumber={idx + 1}
            />
          ))}
        </div>
      )}

    </div>
  );
};
