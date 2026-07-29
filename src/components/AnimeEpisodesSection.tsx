import React, { useState, useEffect } from 'react';

interface AnimeEpisode {
  episodeNumber: number;
  seasonNumber: number;
  episodeInSeason: number;
  title: string | null;
  titleJapanese: string | null;
  titleRomanji: string | null;
  airedAt: string | null;
  isFiller: boolean;
  isRecap: boolean;
  source: 'jikan' | 'fallback';
  commentCount?: number;
  participantCount?: number;
  lastActivityAt?: Date | string | null;
}

interface AnimeEpisodesSectionProps {
  anilistId: number;
  onNavigate: (path: string) => void;
}

export const AnimeEpisodesSection: React.FC<AnimeEpisodesSectionProps> = ({
  anilistId,
  onNavigate,
}) => {
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchEpisodes() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/anime/${anilistId}/episodes`);
        if (!res.ok) {
          throw new Error('Failed to load episode list');
        }

        const data = await res.json();
        if (isMounted) {
          setEpisodes(data.episodes || []);
          setSeasonNumber(data.seasonNumber || 1);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Fetch Episodes Section Error:', err);
          setError(err.message || 'Failed to fetch episodes.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchEpisodes();
  }, [anilistId]);

  if (loading) {
    return (
      <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
          <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2">
            <span>📺</span> Anime Episodes & Discussions
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-[#141C17] border border-[#23382C] rounded-xl p-4 h-28 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || episodes.length === 0) {
    return (
      <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-3 shadow-md">
        <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2 border-b border-[#23382C] pb-3">
          <span>📺</span> Anime Episodes & Discussions
        </h3>
        <p className="text-xs text-[#A3C2AE]">
          {error || 'No episode list available for this anime series.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#23382C] pb-3">
        <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2">
          <span>📺</span> Episodes & Episode Discussions ({episodes.length})
        </h3>
        <span className="text-xs font-mono text-[#C5A059] bg-[#141C17] px-3 py-1 rounded-full border border-[#23382C]">
          Season {seasonNumber}
        </span>
      </div>

      {/* Grid of Episode Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {episodes.map((ep) => {
          const epTitleFormatted = ep.title ? ep.title : 'Title Unavailable';
          const discussionPath = `/anime/${anilistId}/season/${ep.seasonNumber || seasonNumber}/episode/${ep.episodeNumber}/discussion`;

          return (
            <div
              key={`ep_${ep.episodeNumber}`}
              className="bg-[#141C17] border border-[#23382C] hover:border-[#389B5F] rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  {/* Compact Badge: S1 E5 */}
                  <span className="px-2.5 py-0.5 rounded bg-[#25663E]/40 text-[#389B5F] border border-[#389B5F]/40 text-[10px] font-mono font-bold">
                    S{ep.seasonNumber || seasonNumber} E{ep.episodeNumber}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {ep.isFiller && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-[9px] font-mono font-bold">
                        FILLER
                      </span>
                    )}
                    {ep.isRecap && (
                      <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 text-[9px] font-mono font-bold">
                        RECAP
                      </span>
                    )}
                  </div>
                </div>

                {/* Display format: Season {seasonNumber}, Episode {episodeNumber} — {episodeTitle} */}
                <h4 className="font-serif font-bold text-sm text-white line-clamp-2">
                  Season {ep.seasonNumber || seasonNumber}, Episode {ep.episodeNumber} — {epTitleFormatted}
                </h4>

                {ep.airedAt && (
                  <p className="text-[10px] text-[#A3C2AE]/70 font-mono">
                    📅 Air Date: {new Date(ep.airedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Discussion stats & Discuss Episode button */}
              <div className="pt-2 border-t border-[#23382C]/60 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[#A3C2AE]">
                  💬 {ep.commentCount || 0} comments • {ep.participantCount || 0} participants
                </span>

                <button
                  onClick={() => onNavigate(discussionPath)}
                  className="px-3 py-1.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-[11px] rounded-lg border border-[#389B5F] transition-colors cursor-pointer flex items-center gap-1 flex-shrink-0"
                >
                  <span>Discuss Episode</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
