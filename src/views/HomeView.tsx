import React, { useState, useEffect } from 'react';
import {
  AniListMedia,
  getTrendingAnime,
  getPopularAnime,
  getSeasonalAnime,
  getPopularManga,
  cleanDescription,
  getFallbackCover,
} from '../services/anilist';
import { AnimeCard } from '../components/AnimeCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorMessage } from '../components/ErrorMessage';

interface HomeViewProps {
  onSelectMedia: (media: AniListMedia) => void;
  onNavigate: (path: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectMedia, onNavigate }) => {
  const [heroIndex, setHeroIndex] = useState(0);

  // States for lists
  const [trending, setTrending] = useState<AniListMedia[]>([]);
  const [popular, setPopular] = useState<AniListMedia[]>([]);
  const [seasonal, setSeasonal] = useState<AniListMedia[]>([]);
  const [manga, setManga] = useState<AniListMedia[]>([]);

  // Page tracking for Load More
  const [trendingPage, setTrendingPage] = useState(1);
  const [hasMoreTrending, setHasMoreTrending] = useState(true);

  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendRes, popRes, seasonRes, mangaRes] = await Promise.all([
        getTrendingAnime(1, 12),
        getPopularAnime(1, 12),
        getSeasonalAnime(undefined, undefined, 1, 12),
        getPopularManga(1, 12),
      ]);

      setTrending(trendRes.media);
      setHasMoreTrending(trendRes.pageInfo.hasNextPage);
      setPopular(popRes.media);
      setSeasonal(seasonRes.media);
      setManga(mangaRes.media);
    } catch (err: any) {
      console.error('HomeView error fetching AniList:', err);
      setError(err.message || 'Failed to connect to AniList GraphQL API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto rotate hero banner every 8s
  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [trending]);

  const handleLoadMoreTrending = async () => {
    if (loadingMore || !hasMoreTrending) return;
    setLoadingMore(true);
    try {
      const nextPage = trendingPage + 1;
      const res = await getTrendingAnime(nextPage, 12);
      setTrending((prev) => [...prev, ...res.media]);
      setTrendingPage(nextPage);
      setHasMoreTrending(res.pageInfo.hasNextPage);
    } catch (err) {
      console.error('Failed to load more trending anime:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const heroMedia = trending[heroIndex] || popular[0];

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. Hero Showcase Section */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <LoadingSkeleton type="banner" />
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <ErrorMessage message={error} onRetry={loadInitialData} />
        </div>
      ) : heroMedia ? (
        <section className="relative w-full min-h-[500px] lg:min-h-[580px] bg-[#0E1410] border-b-2 border-[#23382C] overflow-hidden flex items-center">
          
          {/* Background Banner / Cover Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroMedia.bannerImage || heroMedia.coverImage?.extraLarge || getFallbackCover(heroMedia.title.english)}
              alt="Hero Banner"
              className="w-full h-full object-cover object-center opacity-30 blur-xs transition-all duration-1000 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060807] via-[#060807]/90 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#060807] via-transparent to-[#060807]/60"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#25663E] text-white font-extrabold text-xs tracking-wider uppercase border border-[#389B5F] shadow-lg">
                  🔥 #1 TRENDING ANILIST TITLE
                </span>
                <span className="px-3 py-1 rounded-full bg-black/80 text-[#C5A059] font-mono text-xs border border-[#C5A059]/40">
                  ★ {heroMedia.averageScore ? (heroMedia.averageScore / 10).toFixed(1) : '9.5'} / 10
                </span>
                <span className="px-3 py-1 rounded-full bg-[#141C17] text-[#A3C2AE] font-mono text-xs border border-[#23382C]">
                  {heroMedia.format || 'TV'} • {heroMedia.seasonYear || '2024'}
                </span>
              </div>

              <h1 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
                {heroMedia.title.english || heroMedia.title.userPreferred || heroMedia.title.romaji}
              </h1>

              {heroMedia.title.romaji && heroMedia.title.romaji !== heroMedia.title.english && (
                <p className="font-mono text-sm text-[#C5A059] italic -mt-2">
                  {heroMedia.title.romaji} • {heroMedia.title.native}
                </p>
              )}

              <p className="text-sm sm:text-base text-[#A3C2AE] line-clamp-3 leading-relaxed max-w-3xl">
                {cleanDescription(heroMedia.description)}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {heroMedia.genres?.map((g) => (
                  <span key={g} className="px-2.5 py-1 rounded-md bg-[#141C17] text-[#389B5F] font-bold text-xs border border-[#23382C]">
                    #{g}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  onClick={() => onSelectMedia(heroMedia)}
                  className="px-6 py-3 bg-[#25663E] hover:bg-[#389B5F] text-white font-serif font-bold text-sm rounded-xl border-2 border-[#389B5F] shadow-[0_4px_20px_rgba(56,155,95,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                >
                  <span>📖 View Detailed AniList Page</span>
                  <span>➔</span>
                </button>
                <button
                  onClick={() => onNavigate('/discovery')}
                  className="px-6 py-3 bg-[#0E1410] hover:bg-[#141C17] text-[#A3C2AE] hover:text-white font-serif font-bold text-sm rounded-xl border border-[#23382C] transition-all cursor-pointer"
                >
                  🧭 Explore All Titles
                </button>
              </div>
            </div>

            {/* Poster Thumbnail */}
            <div className="hidden lg:block lg:col-span-4 justify-self-center">
              <div
                onClick={() => onSelectMedia(heroMedia)}
                className="relative w-64 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#C5A059] shadow-[0_15px_35px_rgba(0,0,0,0.8)] cursor-pointer group transform hover:scale-105 transition-all duration-300"
              >
                <img
                  src={heroMedia.coverImage?.extraLarge || heroMedia.coverImage?.large}
                  alt={heroMedia.title.english || 'Poster'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-3 left-3 right-3 text-center bg-black/80 backdrop-blur-md py-1.5 px-3 rounded-lg border border-[#C5A059]/40 text-xs font-serif font-bold text-[#C5A059]">
                  Click to View Full Details
                </div>
              </div>
            </div>

          </div>

          {/* Carousel Dots */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center items-center gap-2">
            {trending.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  heroIndex === i ? 'w-8 bg-[#C5A059]' : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Show hero slide ${i + 1}`}
              ></button>
            ))}
          </div>

        </section>
      ) : null}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* 2. Trending Anime Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#23382C] pb-4">
            <div>
              <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2">
                <span>🔥</span> Trending Anime Right Now
              </h2>
              <p className="text-xs text-[#A3C2AE] font-mono mt-1">
                Live popularity rankings from AniList global community
              </p>
            </div>
            <button
              onClick={() => onNavigate('/discovery')}
              className="text-xs font-bold text-[#389B5F] hover:text-[#C5A059] flex items-center gap-1 transition-colors"
            >
              <span>See All</span>
              <span>➔</span>
            </button>
          </div>

          {loading ? (
            <LoadingSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
              {trending.map((anime, index) => (
                <AnimeCard
                  key={`trend_${anime.id}_${index}`}
                  media={anime}
                  onClickMedia={onSelectMedia}
                  rankNumber={index + 1}
                />
              ))}
            </div>
          )}

          {/* Load More Button for Trending */}
          {!loading && hasMoreTrending && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMoreTrending}
                disabled={loadingMore}
                className="px-8 py-3 bg-[#141C17] hover:bg-[#25663E] text-white font-bold text-sm rounded-xl border border-[#389B5F] shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading More AniList Titles...</span>
                  </>
                ) : (
                  <>
                    <span>⏬ Load More Trending Anime</span>
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* 3. Seasonal Anime Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#23382C] pb-4">
            <div>
              <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2">
                <span>🌸</span> Current Anime Season Hits
              </h2>
              <p className="text-xs text-[#A3C2AE] font-mono mt-1">
                Top broadcasting series this season on AniList
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
              {seasonal.slice(0, 6).map((anime) => (
                <AnimeCard
                  key={`season_${anime.id}`}
                  media={anime}
                  onClickMedia={onSelectMedia}
                  badge="SEASONAL"
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. Popular Manga & Webcomics Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#23382C] pb-4">
            <div>
              <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2">
                <span>📖</span> Popular Manga & Webcomics
              </h2>
              <p className="text-xs text-[#A3C2AE] font-mono mt-1">
                Top rated manga, manhwa, and light novels from AniList database
              </p>
            </div>
            <button
              onClick={() => onNavigate('/discovery')}
              className="text-xs font-bold text-[#389B5F] hover:text-[#C5A059] flex items-center gap-1 transition-colors"
            >
              <span>Browse Manga</span>
              <span>➔</span>
            </button>
          </div>

          {loading ? (
            <LoadingSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
              {manga.slice(0, 6).map((m) => (
                <AnimeCard
                  key={`manga_${m.id}`}
                  media={m}
                  onClickMedia={onSelectMedia}
                  badge="MANGA"
                />
              ))}
            </div>
          )}
        </section>

        {/* 5. OtakuVerse Community Activity Hub Banner */}
        <section className="bg-gradient-to-r from-[#0E1410] via-[#141C17] to-[#0E1410] border-2 border-[#C5A059] rounded-2xl p-8 shadow-[0_0_30px_rgba(197,160,89,0.15)] grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <span className="px-3 py-1 rounded-md bg-[#25663E] text-white font-bold text-xs uppercase tracking-wider">
              OtakuVerse Community Discussions
            </span>
            <h3 className="font-serif font-bold text-2xl text-white">
              Join Weekly Power-Scaling & Emotional Arc Debates
            </h3>
            <p className="text-xs text-[#A3C2AE] leading-relaxed">
              Connect with thousands of otaku scholars to debate episode climaxes, review AniList scores, organize read-alongs, and track your personal watchlists.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <button
              onClick={() => onNavigate('/discussions')}
              className="px-5 py-3 bg-[#25663E] hover:bg-[#389B5F] text-white font-serif font-bold text-xs rounded-xl border border-[#389B5F] shadow-md transition-colors text-center cursor-pointer"
            >
              💬 Join Active Discussions
            </button>
            <button
              onClick={() => onNavigate('/reviews')}
              className="px-5 py-3 bg-[#141C17] hover:bg-[#23382C] text-[#C5A059] font-serif font-bold text-xs rounded-xl border border-[#C5A059]/40 transition-colors text-center cursor-pointer"
            >
              ⭐ Read & Write Critic Reviews
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
