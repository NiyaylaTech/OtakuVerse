import React, { useState, useEffect, useMemo } from 'react';
import {
  AnimeCharacter,
  AniListPageInfo,
  getAnimeCharacters,
  getFallbackCover,
  getFallbackAvatar,
} from '../services/anilist';

interface AnimeCharactersSectionProps {
  anilistId: number | string;
}

export const AnimeCharactersSection: React.FC<AnimeCharactersSectionProps> = ({ anilistId }) => {
  const [characters, setCharacters] = useState<AnimeCharacter[]>([]);
  const [pageInfo, setPageInfo] = useState<AniListPageInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDubs, setExpandedDubs] = useState<Record<number, boolean>>({});

  const fetchCharacters = async (pageToFetch: number, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const numericId = Number(anilistId);
      if (!numericId || isNaN(numericId)) {
        throw new Error('Invalid AniList ID for character fetch');
      }

      const res = await getAnimeCharacters(numericId, pageToFetch, 25);

      if (append) {
        setCharacters((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newChars = res.characters.filter((c) => !existingIds.has(c.id));
          return [...prev, ...newChars];
        });
      } else {
        setCharacters(res.characters);
      }

      setPageInfo(res.pageInfo);
    } catch (err: any) {
      console.error('Characters Section Error:', err);
      if (!append) {
        setError(err.message || 'We couldn’t load the cast information right now.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setCharacters([]);
    setPageInfo(null);
    setError(null);
    fetchCharacters(1, false);
  }, [anilistId]);

  const mainCharacters = useMemo(
    () => characters.filter((c) => c.role === 'MAIN'),
    [characters]
  );
  const supportingCharacters = useMemo(
    () => characters.filter((c) => c.role === 'SUPPORTING'),
    [characters]
  );
  const backgroundCharacters = useMemo(
    () =>
      characters.filter(
        (c) => c.role === 'BACKGROUND' || (c.role !== 'MAIN' && c.role !== 'SUPPORTING')
      ),
    [characters]
  );

  const renderCharacterCard = (char: AnimeCharacter) => {
    const charImg = char.imageUrl || getFallbackCover(char.name);
    const primaryVA = char.voiceActors && char.voiceActors.length > 0 ? char.voiceActors[0] : null;
    const secondaryVAs = char.voiceActors && char.voiceActors.length > 1 ? char.voiceActors.slice(1) : [];
    const isExpanded = !!expandedDubs[char.id];

    return (
      <div
        key={`char_card_${char.id}`}
        className="bg-[#0E1410] border border-[#23382C] hover:border-[#389B5F] rounded-2xl p-3.5 space-y-3 shadow-md flex flex-col justify-between transition-all group"
      >
        <div className="space-y-3">
          {/* Character Image & Badges */}
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black border border-[#23382C]">
            <img
              src={charImg}
              alt={char.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackCover(char.name);
              }}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {char.role && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#389B5F] border border-[#389B5F]/50 text-[10px] font-mono font-bold uppercase shadow">
                {char.role}
              </span>
            )}
            {char.favourites > 0 && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#C5A059] border border-[#C5A059]/40 text-[10px] font-mono font-bold flex items-center gap-1 shadow">
                ★ {char.favourites.toLocaleString()}
              </span>
            )}
          </div>

          {/* Character Name & Native */}
          <div>
            <h5 className="font-serif font-bold text-sm text-white group-hover:text-[#389B5F] transition-colors leading-snug">
              {char.name}
            </h5>
            {char.nativeName && (
              <p className="text-[11px] font-sans text-[#A3C2AE]/70 truncate">
                {char.nativeName}
              </p>
            )}
          </div>

          {/* Voice Actor Information */}
          <div className="pt-2.5 border-t border-[#23382C] space-y-2">
            {primaryVA ? (
              <div className="flex items-center gap-2.5 bg-[#141C17] border border-[#23382C] p-2 rounded-xl">
                <img
                  src={primaryVA.imageUrl || getFallbackAvatar(primaryVA.name)}
                  alt={primaryVA.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getFallbackAvatar(primaryVA.name);
                  }}
                  className="w-9 h-9 object-cover rounded-lg bg-black shrink-0 border border-[#23382C]"
                />
                <div className="min-w-0 flex-1">
                  <span className="block text-[9px] font-mono uppercase text-[#389B5F] font-bold truncate">
                    {primaryVA.language ? `${primaryVA.language} VA` : 'Voice Actor'}
                  </span>
                  <span className="font-bold text-xs text-white block truncate leading-tight">
                    {primaryVA.name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#141C17] border border-[#23382C] p-2.5 rounded-xl text-center">
                <span className="text-[10px] font-mono text-[#A3C2AE]/70 block italic">
                  Voice actor not currently available
                </span>
              </div>
            )}

            {/* Multiple Dub Voice Actors Expansion */}
            {secondaryVAs.length > 0 && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedDubs((prev) => ({ ...prev, [char.id]: !prev[char.id] }))
                  }
                  className="w-full text-[10px] font-mono font-bold text-[#C5A059] hover:text-white bg-[#141C17] hover:bg-[#25663E]/30 border border-[#23382C] py-1 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>{isExpanded ? 'Hide other dubs' : `View other dubs (${secondaryVAs.length})`}</span>
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="space-y-1.5 pt-1 pl-1">
                    {secondaryVAs.map((va) => (
                      <div
                        key={`sec_va_${char.id}_${va.id}`}
                        className="flex items-center gap-2 bg-[#18221C] border border-[#23382C] p-1.5 rounded-lg"
                      >
                        <img
                          src={va.imageUrl || getFallbackAvatar(va.name)}
                          alt={va.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getFallbackAvatar(va.name);
                          }}
                          className="w-7 h-7 object-cover rounded bg-black shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block text-[8px] font-mono uppercase text-[#A3C2AE]">
                            {va.language || 'Dub'}
                          </span>
                          <span className="font-bold text-[11px] text-white block truncate leading-none">
                            {va.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action link */}
        <div className="pt-2 border-t border-[#23382C]">
          <a
            href={char.siteUrl || `https://anilist.co/character/${char.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono font-bold text-[#A3C2AE] hover:text-[#389B5F] transition-colors flex items-center justify-between"
          >
            <span>View Character</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#23382C] pb-3 gap-2">
        <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2">
          <span>🎭</span> Full Character Cast & Voice Actors
        </h3>
        {!loading && !error && (
          <div className="text-xs font-mono text-[#C5A059] bg-[#141C17] border border-[#23382C] px-3 py-1 rounded-lg self-start sm:self-auto">
            {characters.length} Characters Loaded {pageInfo?.total ? `(of ${pageInfo.total})` : ''}
          </div>
        )}
      </div>

      {/* Initial Loading Skeleton */}
      {loading && characters.length === 0 && (
        <div className="space-y-4">
          <div className="text-center py-8 space-y-3">
            <div className="w-10 h-10 border-4 border-[#389B5F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-[#A3C2AE]">Fetching Character Cast & Voice Actors...</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, idx) => (
              <div
                key={`char_skel_${idx}`}
                className="bg-[#0E1410] border border-[#23382C] rounded-2xl p-3.5 space-y-3 animate-pulse"
              >
                <div className="aspect-[3/4] bg-[#141C17] rounded-xl" />
                <div className="h-4 bg-[#141C17] rounded w-3/4" />
                <div className="h-3 bg-[#141C17] rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && characters.length === 0 && (
        <div className="bg-[#0E1410] border-2 border-rose-900/40 rounded-2xl p-8 text-center space-y-4 my-6">
          <div className="text-3xl">⚠️</div>
          <h4 className="font-serif font-bold text-lg text-rose-400">Characters unavailable</h4>
          <p className="text-xs text-[#A3C2AE] max-w-md mx-auto">
            We couldn’t load the cast information right now. Please check your connection and try again.
          </p>
          <button
            onClick={() => fetchCharacters(1, false)}
            className="px-5 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && characters.length === 0 && (
        <div className="bg-[#0E1410] border border-[#23382C] rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm font-serif text-white font-bold">No Character Data Available</p>
          <p className="text-xs text-[#A3C2AE]">
            No character cast records were found for this anime on AniList.
          </p>
        </div>
      )}

      {/* Main Character Lists */}
      {!loading && characters.length > 0 && (
        <div className="space-y-8">
          {/* MAIN CHARACTERS */}
          {mainCharacters.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-lg text-emerald-400 flex items-center gap-2 border-b border-[#23382C] pb-2">
                <span>⭐</span> Main Characters ({mainCharacters.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mainCharacters.map(renderCharacterCard)}
              </div>
            </div>
          )}

          {/* SUPPORTING CHARACTERS */}
          {supportingCharacters.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-lg text-white flex items-center gap-2 border-b border-[#23382C] pb-2">
                <span>👥</span> Supporting Characters ({supportingCharacters.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {supportingCharacters.map(renderCharacterCard)}
              </div>
            </div>
          )}

          {/* BACKGROUND CHARACTERS */}
          {backgroundCharacters.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-lg text-[#A3C2AE] flex items-center gap-2 border-b border-[#23382C] pb-2">
                <span>🎭</span> Background Characters ({backgroundCharacters.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {backgroundCharacters.map(renderCharacterCard)}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {pageInfo?.hasNextPage && (
            <div className="text-center pt-6">
              <button
                type="button"
                onClick={() => fetchCharacters((pageInfo.currentPage || 1) + 1, true)}
                disabled={loadingMore}
                className="px-8 py-3 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading More Characters...</span>
                  </>
                ) : (
                  <span>Load More Characters ➔</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
