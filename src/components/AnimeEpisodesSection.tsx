import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchJson } from '../lib/api';

interface AnimeEpisode {
  episodeNumber: number;
  seasonNumber: number;
  episodeInSeason: number;
  title: string | null;
  description: string | null;
  titleJapanese: string | null;
  titleRomanji: string | null;
  airedAt: string | null;
  runtime: string | number | null;
  isFiller: boolean;
  isRecap: boolean;
  source: 'jikan' | 'fallback';
  commentCount?: number;
  participantCount?: number;
  lastActivityAt?: Date | string | null;
}

interface SeasonInfo {
  seasonNumber: number;
  title: string;
  anilistId: number;
  idMal: number | null;
  episodesCount: number | null;
  format: string | null;
  isCurrent: boolean;
}

interface AnimeEpisodesSectionProps {
  anilistId: number;
  onNavigate: (path: string) => void;
}

const PAGE_SIZE = 25;

export const AnimeEpisodesSection: React.FC<AnimeEpisodesSectionProps> = ({
  anilistId,
  onNavigate,
}) => {
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination & Jump To
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('');

  // 1. Fetch available seasons
  useEffect(() => {
    let isMounted = true;

    async function loadSeasons() {
      try {
        const data = await fetchJson(`/api/anime/${anilistId}/seasons`);
        if (isMounted && data.seasons && data.seasons.length > 0) {
          setSeasons(data.seasons);
          setSelectedSeasonNumber(data.seasons[0].seasonNumber);
        }
      } catch (err) {
        console.warn('Load seasons error:', err);
      }
    }

    loadSeasons();

    return () => {
      isMounted = false;
    };
  }, [anilistId]);

  // 2. Fetch episodes for selected season
  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchJson(`/api/anime/${anilistId}/season/${selectedSeasonNumber}/episodes`);
      setEpisodes(data.episodes || []);
      if (data.seasons && data.seasons.length > 0) {
        setSeasons(data.seasons);
      }
      setCurrentPage(1);
      setSearchTerm('');
    } catch (err: any) {
      console.error('Fetch Season Episodes Error:', err);
      setError("We couldn't load the episodes right now.");
    } finally {
      setLoading(false);
    }
  }, [anilistId, selectedSeasonNumber]);

  useEffect(() => {
    let isMounted = true;
    fetchEpisodes();
    return () => {
      isMounted = false;
    };
  }, [fetchEpisodes]);

  // Filtered episodes based on search
  const filteredEpisodes = useMemo(() => {
    if (!searchTerm.trim()) return episodes;
    const term = searchTerm.toLowerCase();
    return episodes.filter((ep) => {
      const numStr = String(ep.episodeNumber);
      const titleStr = (ep.title || '').toLowerCase();
      const descStr = (ep.description || '').toLowerCase();
      return numStr.includes(term) || titleStr.includes(term) || descStr.includes(term);
    });
  }, [episodes, searchTerm]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredEpisodes.length / PAGE_SIZE));
  const paginatedEpisodes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEpisodes.slice(start, start + PAGE_SIZE);
  }, [filteredEpisodes, currentPage]);

  const handleJumpToEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    const epNum = Number(jumpInput.trim());
    if (!epNum || isNaN(epNum)) return;

    const foundIdx = filteredEpisodes.findIndex((ep) => ep.episodeNumber === epNum);
    if (foundIdx !== -1) {
      const pageForEp = Math.floor(foundIdx / PAGE_SIZE) + 1;
      setCurrentPage(pageForEp);
      setJumpInput('');
      
      // Navigate directly to the episode page
      onNavigate(`/anime/${anilistId}/season/${selectedSeasonNumber}/episode/${epNum}`);
    } else {
      alert(`Episode ${epNum} was not found in Season ${selectedSeasonNumber}.`);
    }
  };

  const formatActivityTime = (dateStr?: Date | string | null) => {
    if (!dateStr) return 'No recent activity';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Last activity just now';
    if (diffMins < 60) return `Last activity ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `Last activity ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return 'Last activity yesterday';
    return `Last activity ${diffDays} days ago`;
  };

  return (
    <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-4 sm:p-6 space-y-6 shadow-xl">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#23382C] pb-4">
        <div>
          <h3 className="font-serif font-black text-2xl text-white flex items-center gap-2">
            <span>📺</span> Episodes & Discussions
          </h3>
          <p className="text-xs text-[#A3C2AE]">
            Select an episode below to read discussions or share your reaction.
          </p>
        </div>

        <span className="text-xs font-mono text-[#C5A059] bg-[#141C17] px-3.5 py-1.5 rounded-full border border-[#23382C]">
          {episodes.length} Episodes Total
        </span>
      </div>

      {/* Season Selector Controls */}
      {seasons.length > 0 && (
        <div className="space-y-3">
          {/* Mobile Full-Width Dropdown */}
          <div className="sm:hidden">
            <label className="block text-[10px] font-mono text-[#C5A059] uppercase mb-1">
              Select Season
            </label>
            <select
              value={selectedSeasonNumber}
              onChange={(e) => setSelectedSeasonNumber(Number(e.target.value))}
              className="w-full bg-[#141C17] border-2 border-[#23382C] focus:border-[#389B5F] rounded-xl px-3 py-2.5 text-white font-bold text-xs outline-none cursor-pointer"
            >
              {seasons.map((s) => (
                <option key={s.seasonNumber} value={s.seasonNumber}>
                  {s.title} ({s.episodesCount || '?'} eps)
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Horizontal Tabs */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {seasons.map((s) => {
              const isActive = selectedSeasonNumber === s.seasonNumber;
              return (
                <button
                  key={s.seasonNumber}
                  onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs font-mono transition-all border whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#25663E] border-[#389B5F] text-white shadow-lg shadow-[#389B5F]/20'
                      : 'bg-[#141C17] hover:bg-[#1C2820] border-[#23382C] text-[#A3C2AE] hover:text-white'
                  }`}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Bar & Jump to Episode Bar for Long-Running Series */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#141C17] border border-[#23382C] rounded-xl p-3">
        {/* Search Input */}
        <div className="md:col-span-8 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search episode title, synopsis, or number..."
            className="w-full bg-[#0E1410] border border-[#23382C] focus:border-[#389B5F] rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#A3C2AE]/50 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-2 text-xs text-[#A3C2AE] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Jump To Episode Form */}
        <form onSubmit={handleJumpToEpisode} className="md:col-span-4 flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            placeholder="Ep #"
            className="w-20 bg-[#0E1410] border border-[#23382C] focus:border-[#389B5F] rounded-lg px-2.5 py-2 text-xs text-white placeholder-[#A3C2AE]/50 outline-none text-center"
          />
          <button
            type="submit"
            className="flex-1 py-2 px-3 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-lg border border-[#389B5F] transition-colors cursor-pointer"
          >
            Jump to Ep ➔
          </button>
        </form>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="bg-[#141C17] border border-[#23382C] rounded-xl p-4 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#141C17] border border-[#23382C] rounded-xl p-8 text-center space-y-3">
          <p className="text-2xl">📺</p>
          <h4 className="font-serif font-bold text-lg text-white">Episode list unavailable</h4>
          <p className="text-xs text-[#A3C2AE] max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchEpisodes()}
            className="px-4 py-2 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] cursor-pointer transition-colors inline-block"
          >
            Try Again
          </button>
        </div>
      ) : paginatedEpisodes.length === 0 ? (
        <div className="bg-[#141C17] border border-[#23382C] rounded-xl p-8 text-center space-y-2">
          <p className="text-sm text-[#A3C2AE]">No episodes matched your search query "{searchTerm}".</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-3 py-1.5 bg-[#25663E] text-white font-bold text-xs rounded-lg"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        /* Text-Only Crunchyroll-Inspired Episode Rows */
        <div className="space-y-3">
          {paginatedEpisodes.map((ep) => {
            const seasonNum = ep.seasonNumber || selectedSeasonNumber;
            const epNum = ep.episodeNumber;
            const epTitle = ep.title ? ep.title : 'Episode title unavailable';
            const epDesc = ep.description ? ep.description : 'Episode description unavailable.';
            const epPath = `/anime/${anilistId}/season/${seasonNum}/episode/${epNum}`;

            return (
              <div
                key={`ep_row_${seasonNum}_${epNum}`}
                onClick={() => onNavigate(epPath)}
                className="group cursor-pointer bg-[#141C17] hover:bg-[#18231C] border-2 border-[#23382C] hover:border-[#389B5F] rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-[#389B5F]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Side: Episode Info */}
                <div className="space-y-2 min-w-0 flex-1">
                  {/* Badge & Title Header */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#25663E]/40 text-[#389B5F] border border-[#389B5F]/40 text-xs font-mono font-extrabold group-hover:bg-[#25663E] group-hover:text-white transition-colors">
                      S{seasonNum} E{epNum}
                    </span>

                    <h4 className="font-serif font-extrabold text-base text-white group-hover:text-[#389B5F] transition-colors truncate">
                      {epTitle}
                    </h4>

                    {/* Filler / Recap Badges */}
                    {ep.isFiller && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold">
                        FILLER
                      </span>
                    )}
                    {ep.isRecap && (
                      <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
                        RECAP
                      </span>
                    )}
                  </div>

                  {/* Short Description Preview */}
                  <p className="text-xs text-[#A3C2AE] line-clamp-2 leading-relaxed">
                    {epDesc}
                  </p>

                  {/* Metadata Row: Aired, Runtime */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#A3C2AE]/70 pt-0.5">
                    {ep.airedAt && (
                      <span>📅 Aired {new Date(ep.airedAt).toLocaleDateString()}</span>
                    )}
                    {ep.runtime && <span>⏱ {ep.runtime}</span>}
                  </div>
                </div>

                {/* Right Side: Discussion Stats & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#23382C]/60 shrink-0">
                  <div className="text-right text-xs font-mono space-y-0.5">
                    <div className="font-bold text-[#C5A059] flex items-center gap-1 justify-end">
                      <span>💬</span>
                      <span>{ep.commentCount || 0} comments</span>
                    </div>
                    <div className="text-[10px] text-[#A3C2AE]">
                      {formatActivityTime(ep.lastActivityAt)}
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#389B5F] group-hover:text-[#C5A059] group-hover:translate-x-1 transition-all">
                    <span>View Episode Discussion</span>
                    <span>➔</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#23382C]">
          <span className="text-xs font-mono text-[#A3C2AE]">
            Page {currentPage} of {totalPages} ({filteredEpisodes.length} episodes)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-[#141C17] hover:bg-[#25663E] border border-[#23382C] rounded-lg text-xs font-bold text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              if (
                pNum === 1 ||
                pNum === totalPages ||
                Math.abs(pNum - currentPage) <= 1
              ) {
                return (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                      currentPage === pNum
                        ? 'bg-[#25663E] text-white border border-[#389B5F]'
                        : 'bg-[#141C17] text-[#A3C2AE] hover:text-white border border-[#23382C]'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              } else if (Math.abs(pNum - currentPage) === 2) {
                return <span key={pNum} className="text-xs text-[#A3C2AE]">..</span>;
              }
              return null;
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-[#141C17] hover:bg-[#25663E] border border-[#23382C] rounded-lg text-xs font-bold text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
