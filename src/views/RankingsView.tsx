import React, { useState, useEffect } from 'react';
import { AniListMedia, getPopularAnime, getPopularManga, getTrendingAnime } from '../services/anilist';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface RankingsViewProps {
  onSelectMedia: (media: AniListMedia) => void;
}

type RankingCategory =
  | 'ANIME'
  | 'MANGA'
  | 'TRENDING'
  | 'FAVORITES'
  | 'CHARACTERS'
  | 'VILLAINS'
  | 'STUDIOS'
  | 'OPENINGS';

export const RankingsView: React.FC<RankingsViewProps> = ({ onSelectMedia }) => {
  const [category, setCategory] = useState<RankingCategory>('ANIME');
  const [period, setPeriod] = useState<'ALL_TIME' | 'SEASON_2026' | 'MONTHLY' | 'WEEKLY'>('ALL_TIME');
  const [rankings, setRankings] = useState<AniListMedia[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data depending on active category
  useEffect(() => {
    setLoading(true);

    let fetcher = getPopularAnime(1, 20);
    if (category === 'MANGA') fetcher = getPopularManga(1, 20);
    else if (category === 'TRENDING') fetcher = getTrendingAnime(1, 20);

    fetcher
      .then((res) => {
        setRankings(res.media || []);
      })
      .catch((err) => console.error('Rankings load error:', err))
      .finally(() => setLoading(false));
  }, [category, period]);

  const top1 = rankings[0];
  const top2 = rankings[1];
  const top3 = rankings[2];
  const remainingList = rankings.slice(3);

  // Sample static data for character/studio/villains when selected
  const characterRankings = [
    { rank: 1, name: 'Levi Ackerman', series: 'Attack on Titan', score: '98.9', votes: '142,500', trend: '▲ 1', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80' },
    { rank: 2, name: 'Gojo Satoru', series: 'Jujutsu Kaisen', score: '98.2', votes: '138,200', trend: '—', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80' },
    { rank: 3, name: 'Sung Jinwoo', series: 'Solo Leveling', score: '97.6', votes: '129,400', trend: '▲ 3', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80' },
    { rank: 4, name: 'Frieren', series: 'Frieren: Beyond Journey\'s End', score: '97.1', votes: '115,000', trend: '▲ 2', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80' },
    { rank: 5, name: 'Roronoa Zoro', series: 'One Piece', score: '96.8', votes: '108,300', trend: '▼ 1', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* 1. LEADERBOARD HERO & PODIUM */}
      <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Accent */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23382C] pb-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059] text-[10px] font-mono font-bold tracking-wider uppercase">
              🏆 Official Community Leaderboards
            </span>
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-white flex items-center gap-3">
              OtakuVerse Hall of Fame
            </h1>
            <p className="text-xs sm:text-sm text-[#A3C2AE]">
              Statistical rankings, community voting power, and historical popularity metrics.
            </p>
          </div>

          {/* Time Period Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#141C17] border border-[#23382C] p-1.5 rounded-2xl text-xs font-mono">
            {[
              { id: 'ALL_TIME', label: 'All-Time Legends' },
              { id: 'SEASON_2026', label: '2026 Season' },
              { id: 'MONTHLY', label: 'Monthly' },
              { id: 'WEEKLY', label: 'Weekly' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-[#C5A059] text-black shadow-md'
                    : 'text-[#A3C2AE] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* TOP THREE PODIUM DISPLAY */}
        {!loading && top1 && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-widest text-center">
              ✦ Top 3 Champions Podium ✦
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">

              {/* SILVER MEDAL - RANK 2 (Left on Desktop) */}
              {top2 && (
                <div
                  onClick={() => onSelectMedia(top2)}
                  className="bg-[#141C17] border-2 border-slate-400/60 rounded-2xl p-5 text-center space-y-3 cursor-pointer hover:border-slate-300 transition-all transform hover:-translate-y-1 shadow-lg relative order-2 md:order-1"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-300 text-black font-black text-xs border border-white shadow">
                    🥈 SILVER #2
                  </div>
                  <img
                    src={top2.coverImage?.large || top2.coverImage?.medium || ''}
                    alt={top2.title.english || 'Cover'}
                    className="w-28 h-40 object-cover rounded-xl mx-auto shadow-md border border-slate-400/40 mt-2"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-white text-sm line-clamp-1">
                      {top2.title.english || top2.title.romaji}
                    </h4>
                    <p className="text-[11px] font-mono text-[#A3C2AE]">⭐ {((top2.averageScore || 85) / 10).toFixed(1)} / 10</p>
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono bg-slate-900/60 py-1 rounded-lg">
                    Popularity: {top2.popularity?.toLocaleString() || '120,400'}
                  </div>
                </div>
              )}

              {/* GOLD CROWN - RANK 1 (Center, Elevated) */}
              <div
                onClick={() => onSelectMedia(top1)}
                className="bg-gradient-to-b from-[#221A0C] to-[#0E1410] border-2 border-[#C5A059] rounded-3xl p-6 text-center space-y-4 cursor-pointer hover:border-[#D4AF37] transition-all transform hover:-translate-y-2 shadow-[0_0_30px_rgba(197,160,89,0.3)] relative order-1 md:order-2 md:-translate-y-3"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#C5A059] text-black font-black text-xs border border-[#D4AF37] shadow-xl flex items-center gap-1">
                  <span>👑</span> GOLD CHAMPION #1
                </div>

                <img
                  src={top1.coverImage?.extraLarge || top1.coverImage?.large || ''}
                  alt={top1.title.english || 'Cover'}
                  className="w-36 h-52 object-cover rounded-2xl mx-auto shadow-2xl border-2 border-[#C5A059] mt-2"
                />

                <div className="space-y-1">
                  <h3 className="font-serif font-black text-white text-lg line-clamp-1 text-[#C5A059]">
                    {top1.title.english || top1.title.romaji}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#A3C2AE]">
                    <span>⭐ {((top1.averageScore || 90) / 10).toFixed(1)}</span>
                    <span>•</span>
                    <span>Format: {top1.format || 'TV'}</span>
                  </div>
                </div>

                <button className="w-full py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs rounded-xl shadow cursor-pointer uppercase tracking-wider">
                  View Champion Details ➔
                </button>
              </div>

              {/* BRONZE MEDAL - RANK 3 (Right on Desktop) */}
              {top3 && (
                <div
                  onClick={() => onSelectMedia(top3)}
                  className="bg-[#141C17] border-2 border-amber-700/60 rounded-2xl p-5 text-center space-y-3 cursor-pointer hover:border-amber-600 transition-all transform hover:-translate-y-1 shadow-lg relative order-3"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-700 text-amber-100 font-black text-xs border border-amber-500 shadow">
                    🥉 BRONZE #3
                  </div>
                  <img
                    src={top3.coverImage?.large || top3.coverImage?.medium || ''}
                    alt={top3.title.english || 'Cover'}
                    className="w-28 h-40 object-cover rounded-xl mx-auto shadow-md border border-amber-700/40 mt-2"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-white text-sm line-clamp-1">
                      {top3.title.english || top3.title.romaji}
                    </h4>
                    <p className="text-[11px] font-mono text-[#A3C2AE]">⭐ {((top3.averageScore || 82) / 10).toFixed(1)} / 10</p>
                  </div>
                  <div className="text-[10px] text-amber-200 font-mono bg-amber-950/60 py-1 rounded-lg">
                    Popularity: {top3.popularity?.toLocaleString() || '98,200'}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* 2. MAIN TWO-COLUMN LEADERBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Categories & Filters (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Ranking Categories Panel */}
          <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-5 space-y-3 shadow-lg">
            <h3 className="font-serif font-bold text-base text-white border-b border-[#23382C] pb-3 flex items-center gap-2">
              <span>📊</span> Leaderboard Categories
            </h3>

            <nav className="space-y-1.5 font-sans text-xs">
              {[
                { id: 'ANIME', label: 'Top Anime Series', icon: '📺' },
                { id: 'MANGA', label: 'Top Manga & Manhwa', icon: '📖' },
                { id: 'TRENDING', label: 'Seasonal Trending', icon: '⚡' },
                { id: 'FAVORITES', label: 'Most Favorited Titles', icon: '❤️' },
                { id: 'CHARACTERS', label: 'Top Characters', icon: '🎭' },
                { id: 'VILLAINS', label: 'Best Anime Villains', icon: '💀' },
                { id: 'STUDIOS', label: 'Premier Animation Studios', icon: '🎨' },
                { id: 'OPENINGS', label: 'Best Openings & OSTs', icon: '🎶' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                    category === cat.id
                      ? 'bg-[#25663E] text-white font-bold border border-[#389B5F] shadow'
                      : 'text-[#A3C2AE] hover:bg-[#141C17] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span> {cat.label}
                  </span>
                  {category === cat.id && <span className="text-[#C5A059]">➔</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Ranking Insights Widget */}
          <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="font-serif font-bold text-base text-white border-b border-[#23382C] pb-3 flex items-center gap-2">
              <span>📈</span> Community Insights
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#141C17] border border-[#23382C] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[#389B5F] uppercase font-bold">🚀 Biggest Rank Jump</span>
                <p className="font-bold text-white">Solo Leveling Season 2 (+12 Ranks)</p>
                <p className="text-[10px] text-[#A3C2AE]">Surged following recent episode broadcast.</p>
              </div>

              <div className="p-3 bg-[#141C17] border border-[#23382C] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">⚡ Most Controversial</span>
                <p className="font-bold text-white">Chainsaw Man Movie Arc</p>
                <p className="text-[10px] text-[#A3C2AE]">Divided scores between 7.5 and 9.8 rating bands.</p>
              </div>

              <div className="p-3 bg-[#141C17] border border-[#23382C] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[#C5A059] uppercase font-bold">💎 Highest New Entry</span>
                <p className="font-bold text-white">Frieren Season 2 Debut (#4 Overall)</p>
                <p className="text-[10px] text-[#A3C2AE]">Overwhelming positive community reception.</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Vertical Leaderboard List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">

          <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
            <h2 className="font-serif font-bold text-xl text-white flex items-center gap-2">
              <span>🏆</span> Ranked Leaderboard ({category})
            </h2>
            <span className="text-xs font-mono text-[#A3C2AE]">Updated Daily via AniList Data</span>
          </div>

          {loading ? (
            <LoadingSkeleton count={8} />
          ) : (category === 'CHARACTERS' || category === 'VILLAINS') ? (
            /* Custom Character Leaderboard view */
            <div className="space-y-3">
              {characterRankings.map((char) => (
                <div
                  key={char.rank}
                  className="bg-[#0E1410] border border-[#23382C] hover:border-[#389B5F] rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-lg text-[#C5A059] w-8 text-center">
                      #{char.rank}
                    </span>
                    <img src={char.image} alt={char.name} className="w-12 h-12 object-cover rounded-full border border-[#389B5F]" />
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm">{char.name}</h4>
                      <p className="text-xs text-[#A3C2AE]">{char.series}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">{char.trend}</span>
                    <span className="text-white font-bold">⭐ {char.score}</span>
                    <span className="text-[#A3C2AE] hidden sm:inline">{char.votes} votes</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Main Anime/Manga Vertical Leaderboard List */
            <div className="space-y-3">
              {remainingList.map((media, idx) => {
                const rankNum = idx + 4; // Because top 3 are in podium
                const score = media.averageScore ? (media.averageScore / 10).toFixed(1) : '8.0';

                return (
                  <div
                    key={`rank_item_${media.id}`}
                    onClick={() => onSelectMedia(media)}
                    className="bg-[#0E1410] border border-[#23382C] hover:border-[#389B5F] rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-all hover:shadow-lg group"
                  >
                    {/* Left: Rank # + Cover + Title */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex flex-col items-center justify-center w-10 flex-shrink-0">
                        <span className="font-mono font-black text-base text-[#C5A059]">
                          #{rankNum}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400">
                          ▲ {Math.floor(Math.random() * 3) + 1}
                        </span>
                      </div>

                      <img
                        src={media.coverImage?.large || media.coverImage?.medium || ''}
                        alt={media.title.english || 'Cover'}
                        className="w-12 h-16 object-cover rounded-xl border border-[#23382C] flex-shrink-0 group-hover:scale-105 transition-transform"
                      />

                      <div className="min-w-0 space-y-1">
                        <h4 className="font-serif font-bold text-white text-sm sm:text-base line-clamp-1 group-hover:text-[#C5A059] transition-colors">
                          {media.title.english || media.title.romaji}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#A3C2AE] font-mono">
                          <span>{media.format || 'TV'}</span>
                          <span>•</span>
                          <span>{media.episodes ? `${media.episodes} eps` : 'Ongoing'}</span>
                          {media.genres && media.genres.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-[#389B5F]">{media.genres[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Score + Popularity + Action */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="font-mono font-bold text-white text-sm">⭐ {score} / 10</div>
                        <div className="text-[10px] text-[#A3C2AE] font-mono">
                          {media.popularity ? `${(media.popularity / 1000).toFixed(1)}k votes` : 'Popular'}
                        </div>
                      </div>

                      <button className="px-3.5 py-1.5 bg-[#141C17] hover:bg-[#25663E] text-[#A3C2AE] hover:text-white font-bold text-xs rounded-xl border border-[#23382C] hover:border-[#389B5F] transition-all flex items-center gap-1 cursor-pointer">
                        <span>Details</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
