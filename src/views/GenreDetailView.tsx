import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Anime, searchAnimeAdvanced, AniListPageInfo } from '../services/anilist';
import { getGenreBySlug, GENRES_CONFIG, GenreCategoryConfig, GenreConfig } from '../config/genres';
import { PinterestAnimeCard } from '../components/PinterestAnimeCard';

interface GenreDetailViewProps {
  genreSlug: string;
  onSelectMedia: (anime: Anime) => void;
  onNavigate: (path: string) => void;
}

export const GenreDetailView: React.FC<GenreDetailViewProps> = ({
  genreSlug,
  onSelectMedia,
  onNavigate,
}) => {
  const genreConfig = useMemo(() => getGenreBySlug(genreSlug), [genreSlug]);

  // Fallback config if unknown slug passed
  const activeGenre: GenreConfig = genreConfig || {
    slug: genreSlug,
    name: genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1).replace(/-/g, ' '),
    japaneseName: 'ジャンル',
    description: `Explore top rated, trending, and popular ${genreSlug} anime.`,
    sampleTitles: ['Popular Title 1', 'Popular Title 2'],
    bgGradient: 'from-[#389B5F]/30 via-[#0E1410] to-[#060807]',
    accentColor: '#389B5F',
    borderColor: 'border-[#389B5F]/40',
    badgeBg: 'bg-[#389B5F]/20 text-[#6CE097]',
    aspectRatio: 'tall',
    popularCount: '2,000+ Titles',
    relatedGenres: ['action', 'romance', 'fantasy', 'comedy'],
    categories: [
      {
        id: 'trending',
        title: `🔥 Trending ${genreSlug}`,
        description: 'Currently popular titles',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated',
        title: `👑 Highest Rated ${genreSlug}`,
        description: 'Critically acclaimed titles',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 80 },
      },
    ],
  };

  // Follow genre local state
  const [isFollowed, setIsFollowed] = useState(() => {
    try {
      const saved = localStorage.getItem('otakuverse_followed_genres');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        return list.includes(activeGenre.slug);
      }
    } catch (e) {}
    return false;
  });

  const toggleFollowGenre = () => {
    try {
      const saved = localStorage.getItem('otakuverse_followed_genres');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(activeGenre.slug)) {
        list = list.filter((s) => s !== activeGenre.slug);
        setIsFollowed(false);
      } else {
        list.push(activeGenre.slug);
        setIsFollowed(true);
      }
      localStorage.setItem('otakuverse_followed_genres', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  // Save recently visited genres
  useEffect(() => {
    try {
      const saved = localStorage.getItem('otakuverse_recent_genres');
      let list: string[] = saved ? JSON.parse(saved) : [];
      list = [activeGenre.slug, ...list.filter((s) => s !== activeGenre.slug)].slice(0, 6);
      localStorage.setItem('otakuverse_recent_genres', JSON.stringify(list));
    } catch (e) {}
  }, [activeGenre.slug]);

  // Genre-level Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<string>('POPULARITY_DESC');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [minScore, setMinScore] = useState<number>(0);
  const [epLength, setEpLength] = useState<string>('All');
  const [excludedGenres, setExcludedGenres] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Determine if active search/filter mode is on
  const isFiltering =
    searchQuery.trim().length > 0 ||
    selectedSort !== 'POPULARITY_DESC' ||
    selectedFormat !== 'All' ||
    selectedStatus !== 'All' ||
    minScore > 0 ||
    epLength !== 'All' ||
    excludedGenres.length > 0;

  // Search Results State for Filter Mode
  const [filterResults, setFilterResults] = useState<Anime[]>([]);
  const [filterPageInfo, setFilterPageInfo] = useState<AniListPageInfo | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [filterPage, setFilterPage] = useState(1);

  // Category data state when NOT filtering
  const [categoryData, setCategoryData] = useState<Record<string, { anime: Anime[]; loading: boolean; error: string | null }>>({});

  // Fetch Category Sections
  useEffect(() => {
    if (isFiltering) return;

    let isMounted = true;
    const abortController = new AbortController();

    activeGenre.categories.forEach(async (cat) => {
      setCategoryData((prev) => ({
        ...prev,
        [cat.id]: { anime: prev[cat.id]?.anime || [], loading: true, error: null },
      }));

      try {
        let epLesser: number | undefined;
        let epGreater: number | undefined;
        if (cat.queryParams.episodesLesser) epLesser = cat.queryParams.episodesLesser;
        if (cat.queryParams.episodesGreater) epGreater = cat.queryParams.episodesGreater;

        const res = await searchAnimeAdvanced(
          {
            genre: activeGenre.name,
            sort: cat.queryParams.sort,
            format: cat.queryParams.format,
            status: cat.queryParams.status,
            seasonYear: cat.queryParams.seasonYear,
            season: cat.queryParams.season,
            minimumScore: cat.queryParams.minimumScore,
            episodesLesser: epLesser,
            episodesGreater: epGreater,
            genreNotIn: cat.queryParams.excludedGenres,
            tagIn: cat.queryParams.tagIn,
            tagNotIn: cat.queryParams.tagNotIn,
            search: cat.queryParams.searchQuery,
            page: cat.queryParams.page,
            perPage: 8,
          },
          abortController.signal
        );

        if (isMounted) {
          setCategoryData((prev) => ({
            ...prev,
            [cat.id]: { anime: res.media || [], loading: false, error: null },
          }));
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (isMounted) {
          setCategoryData((prev) => ({
            ...prev,
            [cat.id]: { anime: [], loading: false, error: err.message || 'Failed to load category.' },
          }));
        }
      }
    });

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [activeGenre, isFiltering]);

  // Fetch Filter Results when filters change
  useEffect(() => {
    if (!isFiltering) return;

    let isMounted = true;
    const abortController = new AbortController();
    setFilterLoading(true);
    setFilterError(null);

    let epLesser: number | undefined;
    let epGreater: number | undefined;
    if (epLength === 'short') epLesser = 13;
    if (epLength === 'medium') { epGreater = 12; epLesser = 26; }
    if (epLength === 'long') epGreater = 25;

    searchAnimeAdvanced(
      {
        genre: activeGenre.name,
        search: searchQuery,
        sort: [selectedSort],
        format: selectedFormat !== 'All' ? selectedFormat : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        minimumScore: minScore > 0 ? minScore : undefined,
        episodesLesser: epLesser,
        episodesGreater: epGreater,
        genreNotIn: excludedGenres,
        page: filterPage,
        perPage: 18,
      },
      abortController.signal
    )
      .then((res) => {
        if (isMounted) {
          setFilterResults((prev) => (filterPage === 1 ? res.media : [...prev, ...res.media]));
          setFilterPageInfo(res.pageInfo);
          setFilterLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (isMounted) {
          setFilterError(err.message || 'Error fetching filtered anime');
          setFilterLoading(false);
        }
      });

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [
    isFiltering,
    activeGenre.name,
    searchQuery,
    selectedSort,
    selectedFormat,
    selectedStatus,
    minScore,
    epLength,
    excludedGenres,
    filterPage,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSort('POPULARITY_DESC');
    setSelectedFormat('All');
    setSelectedStatus('All');
    setMinScore(0);
    setEpLength('All');
    setExcludedGenres([]);
    setFilterPage(1);
  };

  const toggleExcludeGenre = (gName: string) => {
    setExcludedGenres((prev) =>
      prev.includes(gName) ? prev.filter((x) => x !== gName) : [...prev, gName]
    );
    setFilterPage(1);
  };

  return (
    <div className="min-h-screen bg-[#060807] text-white pb-20 font-sans">
      {/* Hero Header */}
      <div className={`relative pt-12 pb-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-b ${activeGenre.bgGradient} border-b border-[#1A261D]`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs font-mono text-[#A3C2AE]">
            <button
              onClick={() => onNavigate('/discovery')}
              className="hover:text-[#389B5F] transition-colors flex items-center space-x-1"
            >
              <span>← Back to Discovery</span>
            </button>
            <span>/</span>
            <span className="text-[#C5A059] font-bold">{activeGenre.name} Anime</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full bg-[#389B5F]/20 border border-[#389B5F]/40 text-[#6CE097] text-xs font-mono">
                  {activeGenre.japaneseName}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#E5C383] text-xs font-mono">
                  {activeGenre.popularCount}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-serif">
                {activeGenre.name} <span className="text-[#389B5F]">Anime</span>
              </h1>

              <p className="text-sm sm:text-base text-[#D1E0D7] leading-relaxed max-w-2xl font-sans">
                {activeGenre.description}
              </p>

              {/* Sample Titles Pills */}
              {activeGenre.sampleTitles && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#A3C2AE]">
                  <span className="font-semibold text-white/80">Popular Series:</span>
                  {activeGenre.sampleTitles.map((st) => (
                    <span key={st} className="px-2.5 py-0.5 rounded-full bg-[#0E1410] border border-[#1E2D22] text-[#D1E0D7]">
                      {st}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleFollowGenre}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center space-x-2 shadow-lg ${
                  isFollowed
                    ? 'bg-[#389B5F] text-black hover:bg-[#44B270] shadow-[#389B5F]/20'
                    : 'bg-[#0E1410] text-white hover:bg-[#1A261D] border border-[#2B3F31]'
                }`}
              >
                <span>{isFollowed ? '✓ Following Genre' : '+ Follow Genre'}</span>
              </button>

              <button
                onClick={() => onNavigate('/discovery')}
                className="px-4 py-2.5 rounded-xl bg-[#0E1410] hover:bg-[#1A261D] text-[#A3C2AE] hover:text-white border border-[#2B3F31] text-xs font-semibold transition-all"
              >
                All Genres
              </button>
            </div>
          </div>

          {/* Related Genres Chips */}
          {activeGenre.relatedGenres && activeGenre.relatedGenres.length > 0 && (
            <div className="pt-4 border-t border-[#1C2C20]/60 flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-mono text-[#A3C2AE] shrink-0">Related Genres:</span>
              <div className="flex items-center space-x-2 shrink-0">
                {activeGenre.relatedGenres.map((rel) => {
                  const relConfig = getGenreBySlug(rel);
                  const relName = relConfig?.name || rel.charAt(0).toUpperCase() + rel.slice(1);
                  const relSlug = relConfig?.slug || rel;
                  return (
                    <button
                      key={rel}
                      onClick={() => onNavigate(`/discovery/genre/${relSlug}`)}
                      className="px-3 py-1 rounded-lg bg-[#0E1410]/80 hover:bg-[#389B5F]/20 border border-[#1A281E] hover:border-[#389B5F]/50 text-xs text-[#D1E0D7] hover:text-[#389B5F] transition-all whitespace-nowrap"
                    >
                      {relName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Body Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8">
        {/* Search & Filter Controls Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-[#0E1410] border border-[#1A261D] space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search within Genre Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#A3C2AE]">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFilterPage(1);
                }}
                placeholder={`Search inside ${activeGenre.name} anime...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060807] border border-[#1E2D22] focus:border-[#389B5F] text-sm text-white placeholder-[#5A7363] outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-[#A3C2AE] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sort Selector */}
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  setFilterPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-[#060807] border border-[#1E2D22] text-xs text-[#D1E0D7] focus:border-[#389B5F] outline-none cursor-pointer"
              >
                <option value="POPULARITY_DESC">Most Popular</option>
                <option value="SCORE_DESC">Highest Rated</option>
                <option value="TRENDING_DESC">Trending Now</option>
                <option value="START_DATE_DESC">Newest First</option>
                <option value="TITLE_ROMAJI">Title A-Z</option>
              </select>

              {/* Format Selector */}
              <select
                value={selectedFormat}
                onChange={(e) => {
                  setSelectedFormat(e.target.value);
                  setFilterPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-[#060807] border border-[#1E2D22] text-xs text-[#D1E0D7] focus:border-[#389B5F] outline-none cursor-pointer"
              >
                <option value="All">All Formats</option>
                <option value="TV">TV Series</option>
                <option value="MOVIE">Movie</option>
                <option value="OVA">OVA / Special</option>
              </select>

              {/* Status Selector */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setFilterPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-[#060807] border border-[#1E2D22] text-xs text-[#D1E0D7] focus:border-[#389B5F] outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="FINISHED">Finished Airing</option>
                <option value="RELEASING">Currently Airing</option>
                <option value="NOT_YET_RELEASED">Upcoming</option>
              </select>

              {/* Reset Filters */}
              {isFiltering && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 rounded-xl bg-[#233327] hover:bg-[#389B5F] text-[#389B5F] hover:text-black font-bold text-xs transition-all border border-[#389B5F]/40"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Secondary Filter Tags / Exclusions */}
          <div className="pt-3 border-t border-[#18241B] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#A3C2AE] font-mono text-[11px]">Quick Exclude:</span>
            {['Ecchi', 'Horror', 'Ecchi', 'Harem', 'Psychological'].map((exG) => {
              const isExcluded = excludedGenres.includes(exG);
              return (
                <button
                  key={exG}
                  onClick={() => toggleExcludeGenre(exG)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                    isExcluded
                      ? 'bg-red-950/80 text-red-300 border border-red-600/50 line-through'
                      : 'bg-[#111A13] text-[#A3C2AE] border border-[#1D2E21] hover:border-[#389B5F]/50'
                  }`}
                >
                  {isExcluded ? `✕ No ${exG}` : `- ${exG}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* MODE 1: Active Filter Results Grid */}
        {isFiltering ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1A261D]">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Filter Results</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#389B5F]/20 text-[#389B5F] font-mono">
                  {filterResults.length} loaded
                </span>
              </h2>
            </div>

            {filterLoading && filterResults.length === 0 ? (
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="break-inside-avoid mb-4 h-64 rounded-2xl bg-[#0E1410] animate-pulse border border-[#1A261D]" />
                ))}
              </div>
            ) : filterError ? (
              <div className="p-8 text-center bg-[#0E1410] rounded-2xl border border-red-900/40 space-y-3">
                <p className="text-red-400 font-semibold">{filterError}</p>
                <button onClick={resetFilters} className="px-4 py-2 bg-[#389B5F] text-black font-bold text-xs rounded-xl">
                  Reset Search
                </button>
              </div>
            ) : filterResults.length === 0 ? (
              <div className="p-12 text-center bg-[#0E1410] rounded-2xl border border-[#1A261D] space-y-4">
                <div className="text-4xl">🍃</div>
                <h3 className="text-lg font-bold text-white">No Anime Found</h3>
                <p className="text-sm text-[#A3C2AE]">Try adjusting your search terms or filters for {activeGenre.name}.</p>
                <button onClick={resetFilters} className="px-5 py-2.5 bg-[#389B5F] text-black font-bold text-xs rounded-xl uppercase tracking-wider">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4">
                  {filterResults.map((anime, idx) => (
                    <PinterestAnimeCard
                      key={`${anime.id}-${idx}`}
                      anime={anime}
                      onSelectMedia={onSelectMedia}
                      aspectVariant={idx % 3 === 0 ? 'tall' : idx % 5 === 0 ? 'hero' : 'standard'}
                    />
                  ))}
                </div>

                {filterPageInfo?.hasNextPage && (
                  <div className="text-center pt-10">
                    <button
                      onClick={() => setFilterPage((p) => p + 1)}
                      disabled={filterLoading}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#389B5F] to-[#25663E] hover:from-[#44B270] hover:to-[#2E7C4D] text-black font-bold text-xs tracking-wider uppercase shadow-xl transition-all disabled:opacity-50"
                    >
                      {filterLoading ? 'Loading More Anime...' : 'Load More Results ↓'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* MODE 2: Category Sections Breakdown (Pinterest Inspired) */
          <div className="space-y-14">
            {activeGenre.categories.map((cat, catIdx) => {
              const state = categoryData[cat.id] || { anime: [], loading: true, error: null };

              return (
                <section key={cat.id} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#1A261D] pb-3 gap-2">
                    <div>
                      <h2 className="text-2xl font-extrabold text-white font-serif tracking-wide flex items-center space-x-2">
                        <span>{cat.title}</span>
                      </h2>
                      {cat.description && (
                        <p className="text-xs text-[#A3C2AE] mt-1 font-sans">{cat.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (cat.queryParams.sort?.[0]) setSelectedSort(cat.queryParams.sort[0]);
                        if (cat.queryParams.format) setSelectedFormat(cat.queryParams.format);
                        if (cat.queryParams.minimumScore) setMinScore(cat.queryParams.minimumScore);
                      }}
                      className="text-xs font-mono text-[#389B5F] hover:text-[#44B270] transition-colors flex items-center space-x-1"
                    >
                      <span>Explore Category</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Category Masonry Cards */}
                  {state.loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-72 rounded-2xl bg-[#0E1410] animate-pulse border border-[#1A261D]" />
                      ))}
                    </div>
                  ) : state.error ? (
                    <div className="p-4 rounded-xl bg-[#0E1410] border border-red-900/30 text-xs text-red-400">
                      Failed to load category: {state.error}
                    </div>
                  ) : state.anime.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#0E1410] border border-[#1A261D] text-xs text-[#A3C2AE]">
                      No anime available in this category right now.
                    </div>
                  ) : (
                    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-4 gap-4 space-y-4">
                      {state.anime.map((anime, idx) => (
                        <PinterestAnimeCard
                          key={`${cat.id}-${anime.id}-${idx}`}
                          anime={anime}
                          onSelectMedia={onSelectMedia}
                          aspectVariant={idx % 2 === 0 ? 'tall' : 'standard'}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
