import React, { useState, useEffect, useMemo } from 'react';
import { Anime, searchAnimeAdvanced } from '../services/anilist';
import { GENRES_CONFIG, MOOD_COLLECTIONS, GenreConfig, genreNameToSlug } from '../config/genres';
import { PinterestAnimeCard } from '../components/PinterestAnimeCard';

interface DiscoveryViewProps {
  onSelectMedia: (anime: Anime) => void;
  onNavigate?: (path: string) => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  onSelectMedia,
  onNavigate = (path) => { window.location.pathname = path; },
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Recently Visited Genres from localStorage
  const [recentGenres, setRecentGenres] = useState<GenreConfig[]>([]);
  // Followed Genres from localStorage
  const [followedGenres, setFollowedGenres] = useState<GenreConfig[]>([]);

  useEffect(() => {
    try {
      const rec = localStorage.getItem('otakuverse_recent_genres');
      if (rec) {
        const slugs: string[] = JSON.parse(rec);
        const configs = slugs
          .map((s) => GENRES_CONFIG.find((g) => g.slug === s))
          .filter((g): g is GenreConfig => Boolean(g));
        setRecentGenres(configs);
      }

      const fol = localStorage.getItem('otakuverse_followed_genres');
      if (fol) {
        const slugs: string[] = JSON.parse(fol);
        const configs = slugs
          .map((s) => GENRES_CONFIG.find((g) => g.slug === s))
          .filter((g): g is GenreConfig => Boolean(g));
        setFollowedGenres(configs);
      }
    } catch (e) {}
  }, []);

  // Filtered Genres List for Search Query
  const filteredGenres = useMemo(() => {
    if (!searchTerm.trim()) return GENRES_CONFIG;
    const term = searchTerm.toLowerCase();
    return GENRES_CONFIG.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term) ||
        g.japaneseName.includes(term) ||
        g.sampleTitles.some((t) => t.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  // Featured Genres (Top 4)
  const featuredGenres = useMemo(() => GENRES_CONFIG.filter((g) => g.featured).slice(0, 4), []);

  // Surprise Me Handler
  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * GENRES_CONFIG.length);
    const randomGenre = GENRES_CONFIG[randomIndex];
    onNavigate(`/discovery/genre/${randomGenre.slug}`);
  };

  // Mood Collection Anime Loading State
  const [moodAnime, setMoodAnime] = useState<Anime[]>([]);
  const [moodLoading, setMoodLoading] = useState(false);

  useEffect(() => {
    if (!selectedMood) return;
    const moodObj = MOOD_COLLECTIONS.find((m) => m.id === selectedMood);
    if (!moodObj) return;

    setMoodLoading(true);
    searchAnimeAdvanced({
      genreIn: moodObj.genres,
      sort: moodObj.queryOpts.sort,
      minimumScore: moodObj.queryOpts.minimumScore,
      genreNotIn: moodObj.queryOpts.excludedGenres,
      perPage: 12,
    })
      .then((res) => {
        setMoodAnime(res.media || []);
        setMoodLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setMoodLoading(false);
      });
  }, [selectedMood]);

  return (
    <div className="min-h-screen bg-[#060807] text-white pb-24 font-sans selection:bg-[#389B5F] selection:text-black">
      {/* Hero Header Banner */}
      <div className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#111C14] via-[#090D0A] to-[#060807] border-b border-[#1A261D]">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#389B5F]/15 border border-[#389B5F]/40 text-[#6CE097] text-xs font-mono">
            <span>アニメ発見</span>
            <span>•</span>
            <span className="text-[#C5A059]">GENRE EXPLORER</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-serif">
            Discover Your Next <span className="text-[#389B5F]">Anime</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A3C2AE] max-w-2xl mx-auto leading-relaxed">
            Browse anime by genre, mood, or curated collection. Click any genre card to dive into dedicated categories, hidden gems, and top-rated classics.
          </p>

          {/* Main Discovery Search Bar & Surprise Me */}
          <div className="max-w-3xl mx-auto pt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#A3C2AE]">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter genres or search by series title (e.g. Romance, Action, Solo Leveling)..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0E1410] border border-[#23382C] focus:border-[#389B5F] text-sm text-white placeholder-[#5A7363] outline-none shadow-2xl transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-[#A3C2AE] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={handleSurpriseMe}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#99793B] hover:from-[#D4B06A] hover:to-[#A88847] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl transition-all flex items-center justify-center space-x-2 shrink-0"
            >
              <span>🎲</span>
              <span>Surprise Me</span>
            </button>
          </div>

          {/* Quick Horizontal Genre Scroll Chips */}
          <div className="pt-4 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            {GENRES_CONFIG.map((g) => (
              <button
                key={g.slug}
                onClick={() => onNavigate(`/discovery/genre/${g.slug}`)}
                className="px-3.5 py-1.5 rounded-full bg-[#0E1410] hover:bg-[#389B5F]/20 border border-[#1A281E] hover:border-[#389B5F]/60 text-xs font-mono text-[#D1E0D7] hover:text-[#389B5F] transition-all whitespace-nowrap shrink-0"
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-16 pt-12">
        {/* Recently Explored & Followed Genres Bar */}
        {(followedGenres.length > 0 || recentGenres.length > 0) && !searchTerm && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#0E1410] border border-[#1A261D]">
            {/* Followed Genres */}
            {followedGenres.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-[#C5A059] uppercase tracking-wider flex items-center space-x-1">
                  <span>★</span>
                  <span>Followed Genres</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {followedGenres.map((g) => (
                    <button
                      key={g.slug}
                      onClick={() => onNavigate(`/discovery/genre/${g.slug}`)}
                      className="px-3 py-1.5 rounded-xl bg-[#389B5F]/20 border border-[#389B5F]/40 text-[#6CE097] text-xs font-semibold hover:bg-[#389B5F]/30 transition-all"
                    >
                      {g.name} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recently Visited */}
            {recentGenres.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-[#A3C2AE] uppercase tracking-wider flex items-center space-x-1">
                  <span>🕒</span>
                  <span>Recently Explored</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentGenres.map((g) => (
                    <button
                      key={g.slug}
                      onClick={() => onNavigate(`/discovery/genre/${g.slug}`)}
                      className="px-3 py-1.5 rounded-xl bg-[#060807] border border-[#1A281E] hover:border-[#389B5F]/50 text-[#D1E0D7] hover:text-[#389B5F] text-xs transition-all"
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Featured Genres Hero Cards (Only when not searching) */}
        {!searchTerm && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#1A261D] pb-3">
              <h2 className="text-2xl font-black text-white font-serif tracking-wide flex items-center space-x-2">
                <span>Featured Anime Genres</span>
              </h2>
              <span className="text-xs font-mono text-[#A3C2AE]">Curated Experience</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGenres.map((g) => (
                <div
                  key={g.slug}
                  onClick={() => onNavigate(`/discovery/genre/${g.slug}`)}
                  className={`group relative cursor-pointer rounded-2xl overflow-hidden p-6 bg-gradient-to-b ${g.bgGradient} border ${g.borderColor} hover:border-[#389B5F] transition-all duration-300 hover:shadow-2xl hover:shadow-[#389B5F]/20 hover:-translate-y-1.5 flex flex-col justify-between min-h-[260px]`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${g.badgeBg}`}>
                        {g.japaneseName}
                      </span>
                      <span className="text-xs font-mono text-[#C5A059]">{g.popularCount}</span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-white group-hover:text-[#389B5F] transition-colors font-serif">
                      {g.name}
                    </h3>

                    <p className="text-xs text-[#D1E0D7] line-clamp-3 leading-relaxed">
                      {g.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {g.sampleTitles.slice(0, 2).map((st) => (
                        <span key={st} className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-[#A3C2AE]">
                          {st}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-[#389B5F] group-hover:text-white transition-colors">
                      <span>Explore {g.name}</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mood-Based Quick Collections */}
        {!searchTerm && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#1A261D] pb-3">
              <div>
                <h2 className="text-2xl font-black text-white font-serif tracking-wide">
                  Explore by Mood
                </h2>
                <p className="text-xs text-[#A3C2AE]">Find anime matching your current emotional vibe</p>
              </div>

              {selectedMood && (
                <button
                  onClick={() => setSelectedMood(null)}
                  className="text-xs font-mono text-[#389B5F] hover:underline"
                >
                  Close Mood Stream ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {MOOD_COLLECTIONS.map((m) => {
                const isActive = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMood(isActive ? null : m.id)}
                    className={`p-4 rounded-2xl text-left border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                      isActive
                        ? 'bg-[#389B5F]/20 border-[#389B5F] shadow-lg shadow-[#389B5F]/10 scale-102'
                        : 'bg-[#0E1410] hover:bg-[#16211A] border-[#1A261D] hover:border-[#389B5F]/40'
                    }`}
                  >
                    <div className="text-3xl">{m.emoji}</div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">{m.title}</h4>
                      <p className="text-[11px] text-[#A3C2AE] line-clamp-2 mt-1">{m.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Render Selected Mood Stream */}
            {selectedMood && (
              <div className="p-6 rounded-2xl bg-[#0E1410] border border-[#389B5F]/40 space-y-6">
                <div className="flex items-center justify-between border-b border-[#1A261D] pb-3">
                  <h3 className="text-lg font-bold text-[#389B5F] flex items-center space-x-2">
                    <span>
                      {MOOD_COLLECTIONS.find((m) => m.id === selectedMood)?.emoji}{' '}
                      {MOOD_COLLECTIONS.find((m) => m.id === selectedMood)?.title} Selection
                    </span>
                  </h3>
                </div>

                {moodLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-60 rounded-xl bg-[#060807] animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-6 gap-4 space-y-4">
                    {moodAnime.map((anime) => (
                      <PinterestAnimeCard
                        key={`mood-${anime.id}`}
                        anime={anime}
                        onSelectMedia={onSelectMedia}
                        aspectVariant="compact"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* All Genres Pinterest Masonry Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1A261D] pb-3">
            <div>
              <h2 className="text-2xl font-black text-white font-serif tracking-wide">
                {searchTerm ? 'Matching Genres' : 'All Anime Genres'}
              </h2>
              <p className="text-xs text-[#A3C2AE]">
                Select any genre card to open its dedicated categories, recommendations & subgenres
              </p>
            </div>

            <span className="text-xs font-mono text-[#389B5F]">{filteredGenres.length} Genres</span>
          </div>

          {filteredGenres.length === 0 ? (
            <div className="p-12 text-center bg-[#0E1410] rounded-2xl border border-[#1A261D] space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="text-sm text-[#A3C2AE]">No genres matched "{searchTerm}".</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 rounded-xl bg-[#389B5F] text-black font-bold text-xs"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
              {filteredGenres.map((g) => (
                <div
                  key={g.slug}
                  onClick={() => onNavigate(`/discovery/genre/${g.slug}`)}
                  className={`group break-inside-avoid cursor-pointer rounded-2xl overflow-hidden p-5 bg-gradient-to-b ${g.bgGradient} border ${g.borderColor} hover:border-[#389B5F] transition-all duration-300 hover:shadow-2xl hover:shadow-[#389B5F]/15 hover:-translate-y-1 flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${g.badgeBg}`}>
                        {g.japaneseName}
                      </span>
                      <span className="text-[11px] font-mono text-[#C5A059]">{g.popularCount}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-[#389B5F] transition-colors font-serif">
                      {g.name}
                    </h3>

                    <p className="text-xs text-[#D1E0D7] leading-relaxed line-clamp-3">
                      {g.description}
                    </p>
                  </div>

                  {/* Sample Series Badges */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {g.sampleTitles.map((st) => (
                        <span key={st} className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-[#A3C2AE]">
                          {st}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-[#389B5F] group-hover:text-white transition-colors pt-1">
                      <span>Browse {g.name}</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
