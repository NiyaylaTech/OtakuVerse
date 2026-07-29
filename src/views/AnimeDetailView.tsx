import React, { useState, useEffect } from 'react';
import {
  AniListMedia,
  getMediaById,
  cleanDescription,
  getFallbackCover,
  getFallbackBanner,
  clearAniListCache,
} from '../services/anilist';
import { AnimeCard } from '../components/AnimeCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorMessage } from '../components/ErrorMessage';
import { AddToListModal } from '../components/AddToListModal';
import { WriteReviewModal } from '../components/WriteReviewModal';
import { StartDiscussionModal } from '../components/StartDiscussionModal';

interface AnimeDetailViewProps {
  mediaId: string | number;
  onSelectMedia: (media: AniListMedia) => void;
  onNavigate: (path: string) => void;
}

export const AnimeDetailView: React.FC<AnimeDetailViewProps> = ({ mediaId, onSelectMedia, onNavigate }) => {
  const [media, setMedia] = useState<AniListMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal triggers
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [startDiscussionOpen, setStartDiscussionOpen] = useState(false);

  // Local state for user reviews and discussions added dynamically
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userDiscussions, setUserDiscussions] = useState<any[]>([]);

  useEffect(() => {
    const numId = Number(mediaId);

    // Validate ID before sending request
    if (
      !mediaId ||
      isNaN(numId) ||
      numId <= 0 ||
      !Number.isInteger(numId) ||
      String(mediaId) === 'undefined' ||
      String(mediaId) === 'null'
    ) {
      setError(`Invalid Anime ID: "${mediaId}". Please select a valid title.`);
      setLoading(false);
      setMedia(null);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      setMedia(null);

      try {
        const data = await getMediaById(numId, controller.signal);
        if (isMounted) {
          setMedia(data);
          setError(null);
          setLoading(false);
        }
      } catch (err: any) {
        if (controller.signal.aborted) {
          return;
        }
        if (isMounted) {
          console.error(`Failed to load media ID ${numId}:`, err);
          setError(err.message || 'Failed to fetch detailed information from AniList.');
          setMedia(null);
          setLoading(false);
        }
      }
    };

    fetchDetail();

    // Scroll back to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [mediaId]);

  const handleRetry = () => {
    const numId = Number(mediaId);
    if (isNaN(numId) || numId <= 0) return;

    clearAniListCache(numId);
    setLoading(true);
    setError(null);
    setMedia(null);

    getMediaById(numId)
      .then((data) => {
        setMedia(data);
        setError(null);
      })
      .catch((err) => {
        console.error(`Retry failed for media ID ${numId}:`, err);
        setError(err.message || 'Failed to fetch detailed information from AniList.');
        setMedia(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorMessage message={`Anime title with ID ${mediaId} was not found on AniList.`} onRetry={handleRetry} />
      </div>
    );
  }

  const titleEnglish = media.title?.english || media.title?.userPreferred || media.title?.romaji || 'Untitled Title';
  const titleRomaji = media.title?.romaji || '';
  const titleNative = media.title?.native || '';
  const coverUrl = media.coverImage?.extraLarge || media.coverImage?.large || getFallbackCover(titleEnglish);
  const bannerUrl = media.bannerImage || coverUrl || getFallbackBanner(titleEnglish);
  const score = typeof media.averageScore === 'number' && media.averageScore > 0 ? (media.averageScore / 10).toFixed(1) : 'N/A';
  const popularity = typeof media.popularity === 'number' && media.popularity > 0 ? media.popularity.toLocaleString() : 'N/A';
  const studios = media.studios?.nodes && media.studios.nodes.length > 0
    ? media.studios.nodes.map((s) => s.name).filter(Boolean).join(', ')
    : 'Unknown Studio';
  const seasonStr = media.season || '';
  const yearStr = media.seasonYear || media.startDate?.year || '';
  const seasonYear = [seasonStr, yearStr].filter(Boolean).join(' ') || 'Unknown Season';
  const isAnime = media.type === 'ANIME';

  // Streaming & external links
  const streamingEpisodes = media.streamingEpisodes || [];
  const externalLinks = media.externalLinks || [];

  return (
    <div className="min-h-screen pb-16 space-y-12">
      
      {/* 1. Hero Banner */}
      <div className="relative w-full h-[320px] sm:h-[420px] bg-[#0E1410] border-b-2 border-[#23382C] overflow-hidden">
        <img
          src={bannerUrl}
          alt={titleEnglish}
          onError={(e) => {
            (e.target as HTMLImageElement).src = coverUrl;
          }}
          className="w-full h-full object-cover opacity-40 blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060807] via-[#060807]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#060807] via-transparent to-transparent"></div>
        
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-black/80 hover:bg-[#25663E] text-white font-bold text-xs rounded-xl border border-[#389B5F] shadow-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>⬅ Back</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cover + Action Buttons + Key Specs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Cover Frame */}
          <div className="w-full max-w-xs mx-auto lg:max-w-none aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#C5A059] shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-[#0E1410]">
            <img
              src={coverUrl}
              alt={titleEnglish}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackCover(titleEnglish);
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setAddToListOpen(true)}
              className="w-full py-3.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-serif font-bold text-sm rounded-xl border-2 border-[#389B5F] shadow-[0_4px_20px_rgba(56,155,95,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📚 Add to Anime List</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWriteReviewOpen(true)}
                className="py-3 bg-[#141C17] hover:bg-[#23382C] text-[#C5A059] font-serif font-bold text-xs rounded-xl border border-[#C5A059]/40 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⭐ Write Review</span>
              </button>
              <button
                onClick={() => setStartDiscussionOpen(true)}
                className="py-3 bg-[#141C17] hover:bg-[#23382C] text-white font-serif font-bold text-xs rounded-xl border border-[#23382C] hover:border-[#389B5F] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>💬 Discussion</span>
              </button>
            </div>
          </div>

          {/* Key Quick Info Box */}
          <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-5 space-y-3 text-xs text-[#A3C2AE]">
            <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase border-b border-[#23382C] pb-2 text-[#C5A059]">
              AniList Specifications
            </h4>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Format</span>
                <span className="text-white font-bold">{media.format || media.type}</span>
              </div>
              <div>
                <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Status</span>
                <span className="text-emerald-400 font-bold">{media.status || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">
                  {isAnime ? 'Episodes' : 'Chapters'}
                </span>
                <span className="text-white font-bold">
                  {isAnime ? (media.episodes || 'Ongoing') : (media.chapters || 'Publishing')}
                </span>
              </div>
              <div>
                <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">
                  {isAnime ? 'Duration' : 'Volumes'}
                </span>
                <span className="text-white font-bold">
                  {isAnime ? (media.duration ? `${media.duration} mins` : 'N/A') : (media.volumes || 'N/A')}
                </span>
              </div>
              <div>
                <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Season / Year</span>
                <span className="text-white font-bold">{seasonYear}</span>
              </div>
              <div>
                <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Studio</span>
                <span className="text-white font-bold truncate block">{studios}</span>
              </div>
            </div>
          </div>

          {/* Official Streaming & External Links */}
          {(externalLinks.length > 0 || streamingEpisodes.length > 0) && (
            <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-5 space-y-3 text-xs">
              <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase border-b border-[#23382C] pb-2 text-[#C5A059]">
                Official Streaming & Links
              </h4>
              <div className="flex flex-wrap gap-2">
                {externalLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#141C17] hover:bg-[#25663E] border border-[#23382C] hover:border-[#389B5F] rounded-lg text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>📺</span>
                    <span>{link.site}</span>
                    <span className="text-[10px] opacity-60">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Title + Score + Description + Characters + Recommendations + Reviews */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Title Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#25663E] text-white font-extrabold text-xs uppercase tracking-wider rounded-md">
                ★ {score} / 10 Score
              </span>
              <span className="px-3 py-1 bg-[#141C17] text-[#C5A059] font-mono text-xs border border-[#23382C] rounded-md">
                🔥 #{popularity} Popularity
              </span>
              <span className="px-3 py-1 bg-[#141C17] text-[#A3C2AE] font-mono text-xs border border-[#23382C] rounded-md">
                {media.type}
              </span>
            </div>

            <h1 className="font-serif font-black text-3xl sm:text-4xl text-white tracking-tight">
              {titleEnglish}
            </h1>

            {titleRomaji && titleRomaji !== titleEnglish && (
              <p className="font-mono text-sm text-[#C5A059] italic">
                {titleRomaji} {titleNative ? `• ${titleNative}` : ''}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {media.genres?.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 bg-[#141C17] text-[#389B5F] border border-[#23382C] font-bold text-xs rounded-lg"
                >
                  #{g}
                </span>
              ))}
            </div>
          </div>

          {/* Description Block */}
          <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-3 shadow-md">
            <h3 className="font-serif font-bold text-lg text-white border-b border-[#23382C] pb-2 flex items-center gap-2">
              <span>📖</span> Synopsis & Overview
            </h3>
            <p className="text-sm text-[#A3C2AE] leading-relaxed whitespace-pre-line font-sans">
              {cleanDescription(media.description)}
            </p>
          </div>

          {/* Characters & Voice Actors */}
          {media.characters?.edges && media.characters.edges.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2 border-b-2 border-[#23382C] pb-3">
                <span>🎭</span> Key Characters & Voice Cast
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {media.characters.edges.map((edge, idx) => {
                  const charName = edge.node.name.full || edge.node.name.native || 'Unknown';
                  const charImg = edge.node.image?.large || edge.node.image?.medium || getFallbackCover(charName);
                  const va = edge.voiceActors?.[0];

                  return (
                    <div
                      key={`char_${edge.node.id}_${idx}`}
                      className="bg-[#0E1410] border border-[#23382C] rounded-xl p-3 flex items-center gap-3 overflow-hidden shadow-sm"
                    >
                      <img
                        src={charImg}
                        alt={charName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getFallbackCover(charName);
                        }}
                        className="w-12 h-14 object-cover rounded-lg bg-black flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-serif font-bold text-xs text-white truncate">
                          {charName}
                        </h5>
                        <p className="text-[10px] text-[#389B5F] uppercase font-mono tracking-wider">
                          {edge.role || 'Main'}
                        </p>
                        {va && (
                          <p className="text-[10px] text-[#A3C2AE]/70 truncate font-sans">
                            🎙 {va.name.full}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations / Similar Titles */}
          {media.recommendations?.nodes && media.recommendations.nodes.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2 border-b-2 border-[#23382C] pb-3">
                <span>💡</span> AniList Recommendations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {media.recommendations.nodes
                  .filter((n) => n.mediaRecommendation)
                  .slice(0, 4)
                  .map((rec) => {
                    const rMedia = rec.mediaRecommendation!;
                    return (
                      <AnimeCard
                        key={`rec_${rMedia.id}`}
                        media={rMedia}
                        onClickMedia={onSelectMedia}
                      />
                    );
                  })}
              </div>
            </div>
          )}

          {/* Member Reviews Section */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b-2 border-[#23382C] pb-3">
              <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2">
                <span>⭐</span> OtakuVerse Member Reviews
              </h3>
              <button
                onClick={() => setWriteReviewOpen(true)}
                className="px-4 py-2 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-lg border border-[#389B5F] cursor-pointer"
              >
                + Write Review
              </button>
            </div>

            {/* Display newly submitted user reviews + AniList API reviews */}
            <div className="space-y-4">
              {userReviews.map((rev) => (
                <div key={rev.id} className="bg-[#0E1410] border border-[#C5A059] rounded-xl p-5 space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-white">{rev.headline}</span>
                    <span className="px-2 py-0.5 rounded bg-[#25663E] text-[#C5A059] font-bold text-xs">
                      ★ {rev.rating}/10
                    </span>
                  </div>
                  <p className="text-xs text-[#A3C2AE] leading-relaxed">{rev.content}</p>
                  <div className="text-[10px] text-[#A3C2AE]/60 font-mono pt-1">
                    By {rev.author} • {rev.createdAt}
                  </div>
                </div>
              ))}

              {media.reviews?.nodes && media.reviews.nodes.length > 0 ? (
                media.reviews.nodes.map((rev) => (
                  <div key={rev.id} className="bg-[#0E1410] border border-[#23382C] rounded-xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs text-[#C5A059]">
                        Review by {rev.user?.name || 'AniList User'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#141C17] text-emerald-400 font-bold text-xs border border-[#23382C]">
                        ★ {(rev.rating || 90) / 10}/10
                      </span>
                    </div>
                    <p className="text-xs text-[#A3C2AE] leading-relaxed font-sans">
                      {cleanDescription(rev.summary)}
                    </p>
                  </div>
                ))
              ) : userReviews.length === 0 ? (
                <p className="text-xs text-[#A3C2AE] italic p-4 bg-[#0E1410] rounded-xl border border-[#23382C]">
                  No written reviews yet for this title. Be the first critic to publish a review!
                </p>
              ) : null}
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Modals */}
      <AddToListModal
        media={media}
        isOpen={addToListOpen}
        onClose={() => setAddToListOpen(false)}
        onSave={(entry) => {
          try {
            const existing = JSON.parse(localStorage.getItem('otakuverse_user_lists') || '[]');
            const updated = [entry, ...existing.filter((e: any) => e.mediaId !== media.id)];
            localStorage.setItem('otakuverse_user_lists', JSON.stringify(updated));
          } catch (e) {
            console.error('Failed saving to localStorage', e);
          }
        }}
      />

      <WriteReviewModal
        media={media}
        isOpen={writeReviewOpen}
        onClose={() => setWriteReviewOpen(false)}
        onSaveReview={(rev) => {
          setUserReviews((prev) => [rev, ...prev]);
        }}
      />

      <StartDiscussionModal
        media={media}
        isOpen={startDiscussionOpen}
        onClose={() => setStartDiscussionOpen(false)}
        onSaveDiscussion={(thread) => {
          setUserDiscussions((prev) => [thread, ...prev]);
          onNavigate('/discussions');
        }}
      />

    </div>
  );
};
