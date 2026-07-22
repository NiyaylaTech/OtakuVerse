import React, { useState, useEffect } from 'react';
import { AniListMedia, searchAnime, searchManga, cleanDescription, getFallbackCover } from '../services/anilist';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: AniListMedia) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectMedia }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'ANIME' | 'MANGA'>('ANIME');
  const [results, setResults] = useState<AniListMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (!searchTerm.trim()) {
      // Default initial query when modal opens: fetch trending/popular items
      setLoading(true);
      const fetchInitial = searchType === 'ANIME' ? searchAnime('', 1, 6) : searchManga('', 1, 6);
      fetchInitial
        .then((res) => {
          setResults(res.media);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load AniList search recommendations.');
          setLoading(false);
        });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      const query = searchType === 'ANIME' 
        ? searchAnime(searchTerm, 1, 8) 
        : searchManga(searchTerm, 1, 8);

      query
        .then((res) => {
          setResults(res.media);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Search request failed.');
          setLoading(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, searchType, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 px-4 pb-8 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0E1410] border-2 border-[#389B5F] rounded-2xl shadow-[0_0_50px_rgba(56,155,95,0.3)] overflow-hidden flex flex-col">
        
        {/* Search Header */}
        <div className="p-4 bg-[#060807] border-b border-[#23382C] flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search AniList anime or manga by title..."
            className="flex-1 bg-transparent text-white placeholder-[#A3C2AE]/50 text-base font-sans font-medium outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[#A3C2AE] hover:text-white px-2 py-1 text-xs font-bold bg-[#141C17] rounded"
            >
              CLEAR
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#141C17] hover:bg-[#25663E] text-white rounded-lg text-xs font-bold border border-[#23382C] transition-colors cursor-pointer"
          >
            ESC ✕
          </button>
        </div>

        {/* Type Toggle Tabs */}
        <div className="flex border-b border-[#23382C] bg-[#0E1410]">
          <button
            onClick={() => setSearchType('ANIME')}
            className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              searchType === 'ANIME'
                ? 'bg-[#25663E] text-white border-b-2 border-[#C5A059]'
                : 'text-[#A3C2AE] hover:bg-[#141C17]'
            }`}
          >
            📺 Anime Results
          </button>
          <button
            onClick={() => setSearchType('MANGA')}
            className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              searchType === 'MANGA'
                ? 'bg-[#25663E] text-white border-b-2 border-[#C5A059]'
                : 'text-[#A3C2AE] hover:bg-[#141C17]'
            }`}
          >
            📖 Manga & Webcomics
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-[#389B5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-[#A3C2AE] font-mono">Searching AniList GraphQL database...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-400 text-xs bg-red-950/20 rounded-xl border border-red-900/40">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-[#A3C2AE] space-y-2">
              <p className="font-serif text-lg text-white">No titles found for "{searchTerm}"</p>
              <p className="text-xs">Try searching for popular titles like "Frieren", "Jujutsu Kaisen", or "Solo Leveling".</p>
            </div>
          ) : (
            results.map((item) => {
              const title = item.title.english || item.title.userPreferred || item.title.romaji || 'Untitled';
              const cover = item.coverImage?.large || item.coverImage?.medium || getFallbackCover(title);
              const score = item.averageScore ? (item.averageScore / 10).toFixed(1) : 'N/A';
              const format = item.format ? item.format.replace('_', ' ') : item.type;
              const episodesOrChapters = item.type === 'ANIME'
                ? (item.episodes ? `${item.episodes} episodes` : 'Ongoing')
                : (item.chapters ? `${item.chapters} chapters` : 'Publishing');

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectMedia(item);
                    onClose();
                  }}
                  className="flex items-center gap-4 p-3 bg-[#141C17] hover:bg-[#25663E]/40 border border-[#23382C] hover:border-[#389B5F] rounded-xl transition-all cursor-pointer group"
                >
                  <img
                    src={cover}
                    alt={title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackCover(title);
                    }}
                    className="w-12 h-16 object-cover rounded-lg bg-black flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif font-bold text-sm text-white group-hover:text-[#C5A059] transition-colors truncate">
                        {title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#25663E] text-white text-[10px] font-bold">
                        ★ {score}
                      </span>
                    </div>
                    <p className="text-xs text-[#A3C2AE] line-clamp-1 mb-1">
                      {cleanDescription(item.description)}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#A3C2AE]/70 font-mono">
                      <span>{format}</span>
                      <span>•</span>
                      <span>{episodesOrChapters}</span>
                      {item.genres && item.genres.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[#389B5F] truncate">{item.genres.slice(0, 2).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-[#389B5F] group-hover:translate-x-1 transition-transform font-bold text-lg">
                    ➔
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Search Footer */}
        <div className="p-3 bg-[#060807] border-t border-[#23382C] text-center text-[11px] text-[#A3C2AE]/60 font-mono">
          Powered live by AniList GraphQL (graphql.anilist.co)
        </div>
      </div>
    </div>
  );
};
