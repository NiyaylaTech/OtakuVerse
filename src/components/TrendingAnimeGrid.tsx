import React, { useState, useEffect } from 'react';
import { AniListMedia, getTrendingAnime } from '../services/anilist';
import { AnimeCard } from './AnimeCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorCard } from './ErrorCard';

interface TrendingAnimeGridProps {
  onSelectMedia?: (media: AniListMedia) => void;
  limit?: number;
  showLoadMore?: boolean;
}

export const TrendingAnimeGrid: React.FC<TrendingAnimeGridProps> = ({
  onSelectMedia,
  limit = 12,
  showLoadMore = true,
}) => {
  const [animeList, setAnimeList] = useState<AniListMedia[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = async (targetPage = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    setError(null);

    try {
      const res = await getTrendingAnime(targetPage, limit);
      const items = res.media || res;
      const pageInfo = res.pageInfo;

      if (append) {
        setAnimeList((prev) => [...prev, ...items]);
      } else {
        setAnimeList(items);
      }

      if (pageInfo) {
        setHasNextPage(pageInfo.hasNextPage);
      }
      setPage(targetPage);
    } catch (err: any) {
      console.error('TrendingAnimeGrid error:', err);
      setError(err.message || 'Failed to retrieve trending anime from AniList.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTrending(1, false);
  }, [limit]);

  const handleLoadMore = () => {
    if (loadingMore || !hasNextPage) return;
    fetchTrending(page + 1, true);
  };

  if (loading) {
    return <LoadingSkeleton count={limit} />;
  }

  if (error) {
    return <ErrorCard message={error} onRetry={() => fetchTrending(1, false)} />;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        {animeList.map((anime, index) => (
          <AnimeCard
            key={`trending_${anime.id}_${index}`}
            media={anime}
            onClickMedia={onSelectMedia}
            rankNumber={index + 1}
          />
        ))}
      </div>

      {showLoadMore && hasNextPage && (
        <div className="text-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3 bg-[#141C17] hover:bg-[#25663E] text-white font-bold text-sm rounded-xl border border-[#389B5F] shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading Page {page + 1}...</span>
              </>
            ) : (
              <>
                <span>⏬ Load More Trending Titles</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
