import React, { useState, useEffect } from 'react';
import {
  AniListMedia,
  searchAnime,
  searchManga,
  AniListPageInfo,
} from '../services/anilist';
import { AnimeCard } from '../components/AnimeCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorMessage } from '../components/ErrorMessage';

interface DiscoveryViewProps {
  onSelectMedia: (media: AniListMedia) => void;
  initialSearch?: string;
}

const GENRES = [
  'All',
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mahou Shoujo',
  'Mecha',
  'Music',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
];

const FORMATS = ['All', 'TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MANGA', 'NOVEL', 'ONE_SHOT'];

const STATUSES = ['All', 'RELEASING', 'FINISHED', 'NOT_YET_RELEASED', 'HIATUS'];

const SORTS = [
  { label: '🔥 Most Popular', value: 'POPULARITY_DESC' },
  { label: '⭐ Highest Rated', value: 'SCORE_DESC' },
  { label: '📈 Trending', value: 'TRENDING_DESC' },
  { label: '❤️ Most Favorited', value: 'FAVOURITES_DESC' },
  { label: '📅 Newest Release', value: 'START_DATE_DESC' },
];

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({ onSelectMedia, initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [mediaType, setMediaType] = useState<'ANIME' | 'MANGA'>('ANIME');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('POPULARITY_DESC');

  const [results, setResults] = useState<AniListMedia[]>([]);
  const [pageInfo, setPageInfo] = useState<AniListPageInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async (page = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    setError(null);

    const filters = {
      genre: selectedGenre,
      format: selectedFormat,
      status: selectedStatus,
      sort: selectedSort,
    };

    try {
      const res = mediaType === 'ANIME'
        ? await searchAnime(searchTerm, page, 18, filters)
        : await searchManga(searchTerm, page, 18, filters);

      if (append) {
        setResults((prev) => [...prev, ...res.media]);
      } else {
        setResults(res.media);
      }

      setPageInfo(res.pageInfo);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Discovery search error:', err);
      setError(err.message || 'Failed to retrieve titles from AniList.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchResults(1, false);
  }, [searchTerm, mediaType, selectedGenre, selectedFormat, selectedStatus, selectedSort]);

  const handleLoadMore = () => {
    if (pageInfo && pageInfo.hasNextPage) {
      fetchResults(currentPage + 1, true);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setSelectedFormat('All');
    setSelectedStatus('All');
    setSelectedSort('POPULARITY_DESC');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="border-b-2 border-[#23382C] pb-6 space-y-2">
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-white flex items-center gap-3">
          <span>🧭</span> AniList Discovery & Search Matrix
        </h1>
        <p className="text-sm text-[#A3C2AE]">
          Filter and search live titles across the official AniList database using GraphQL queries.
        </p>
      </div>

      {/* Control Panel / Filter Bar */}
      <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-5 shadow-lg">
        
        {/* Top Row: Search Input + Type Switch */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          <div className="md:col-span-8 relative">
            <span className="absolute left-3.5 top-3 text-lg text-[#A3C2AE]">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search anime or manga titles by English, Romaji, or Japanese name..."
              className="w-full pl-11 pr-4 py-3 bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-xl text-white placeholder-[#A3C2AE]/50 text-sm font-sans outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 px-2 py-1 bg-[#23382C] text-[#A3C2AE] hover:text-white text-xs font-bold rounded"
              >
                Clear
              </button>
            )}
          </div>

          <div className="md:col-span-4 flex rounded-xl overflow-hidden border border-[#23382C] bg-[#141C17]">
            <button
              onClick={() => {
                setMediaType('ANIME');
                setCurrentPage(1);
              }}
              className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                mediaType === 'ANIME'
                  ? 'bg-[#25663E] text-white'
                  : 'text-[#A3C2AE] hover:bg-[#0E1410]'
              }`}
            >
              📺 Anime
            </button>
            <button
              onClick={() => {
                setMediaType('MANGA');
                setCurrentPage(1);
              }}
              className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                mediaType === 'MANGA'
                  ? 'bg-[#25663E] text-white'
                  : 'text-[#A3C2AE] hover:bg-[#0E1410]'
              }`}
            >
              📖 Manga
            </button>
          </div>

        </div>

        {/* Bottom Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          
          <div>
            <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1.5">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white font-medium outline-none"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1.5">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white font-medium outline-none"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white font-medium outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1.5">
              Sort Order
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white font-medium outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter Summary & Reset */}
        <div className="flex items-center justify-between text-xs text-[#A3C2AE] pt-2 border-t border-[#23382C]">
          <div>
            Showing <span className="text-white font-bold">{results.length}</span> titles
            {pageInfo?.total ? ` of ${pageInfo.total.toLocaleString()} total` : ''}
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[#C5A059] hover:underline font-bold cursor-pointer"
          >
            Reset All Filters ↺
          </button>
        </div>

      </div>

      {/* Grid Display Area */}
      {loading ? (
        <LoadingSkeleton count={12} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchResults(1, false)} />
      ) : results.length === 0 ? (
        <div className="p-12 text-center bg-[#0E1410] border border-[#23382C] rounded-2xl space-y-4 max-w-xl mx-auto">
          <div className="text-4xl">🔍</div>
          <h3 className="font-serif font-bold text-xl text-white">No AniList Titles Found</h3>
          <p className="text-xs text-[#A3C2AE]">
            Try adjusting your search terms or relaxing genre and format filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-lg border border-[#389B5F]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {results.map((item, idx) => (
              <AnimeCard
                key={`disc_${item.id}_${idx}`}
                media={item}
                onClickMedia={onSelectMedia}
              />
            ))}
          </div>

          {/* Load More Button */}
          {pageInfo && pageInfo.hasNextPage && (
            <div className="text-center pt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-sm rounded-xl border border-[#389B5F] shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Fetching Page {currentPage + 1}...</span>
                  </>
                ) : (
                  <>
                    <span>⏬ Load More Titles (Page {currentPage + 1})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
