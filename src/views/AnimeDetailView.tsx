import React, { useState, useEffect, useMemo } from 'react';
import { AniListMedia, getAnimeById, cleanDescription, getFallbackCover } from '../services/anilist';
import { AddToListModal } from '../components/AddToListModal';
import { WriteReviewModal } from '../components/WriteReviewModal';
import { StartDiscussionModal } from '../components/StartDiscussionModal';
import { AnimeCard } from '../components/AnimeCard';
import { AnimeEpisodesSection } from '../components/AnimeEpisodesSection';
import { AnimeCharactersSection } from '../components/AnimeCharactersSection';
import { useAuth } from '../context/AuthContext';

interface AnimeDetailViewProps {
  mediaId: string | number;
  currentPath?: string;
  onSelectMedia: (media: AniListMedia) => void;
  onNavigate: (path: string) => void;
}

export const AnimeDetailView: React.FC<AnimeDetailViewProps> = ({
  mediaId,
  currentPath = '',
  onSelectMedia,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [media, setMedia] = useState<AniListMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [startDiscussionOpen, setStartDiscussionOpen] = useState(false);

  // User-submitted local state
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userDiscussions, setUserDiscussions] = useState<any[]>([
    {
      id: 'disc_1',
      author: 'ApothecaryFan',
      avatar: '',
      title: 'What are your theories on the royal palace mysteries in Episode 12?',
      body: 'The political tensions are escalating so rapidly! Let us break down the clues hidden in the medicine preparations...',
      likes: 34,
      commentsCount: 19,
      category: 'THEORY',
      createdAt: '2 hours ago',
    },
    {
      id: 'disc_2',
      author: 'OtakuMaster99',
      avatar: '',
      title: 'Anime Adaptation vs Light Novel: Character Arc Comparisons',
      body: 'Having read the original light novels, the studio did an unbelievable job capturing the subtle facial expressions and comedic timing.',
      likes: 52,
      commentsCount: 28,
      category: 'GENERAL',
      createdAt: '5 hours ago',
    },
  ]);

  // Discussion Filter & New Post Form state
  const [discussionFilter, setDiscussionFilter] = useState<'hot' | 'new' | 'top' | 'unanswered'>('hot');
  const [discussionCategory, setDiscussionCategory] = useState<string>('all');
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionBody, setNewDiscussionBody] = useState('');
  const [newDiscussionTag, setNewDiscussionTag] = useState('GENERAL');
  const [isPostingDiscussion, setIsPostingDiscussion] = useState(false);

  // Determine Active Tab from Route
  const activeTab = useMemo(() => {
    const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '');
    if (path.endsWith('/episodes')) return 'episodes';
    if (path.endsWith('/reviews')) return 'reviews';
    if (path.endsWith('/discussions')) return 'discussions';
    if (path.endsWith('/characters')) return 'characters';
    if (path.endsWith('/recommendations')) return 'recommendations';
    return 'overview';
  }, [currentPath]);

  useEffect(() => {
    let isMounted = true;

    async function fetchMediaData() {
      setLoading(true);
      setError(null);

      try {
        const idNum = Number(mediaId);
        if (!idNum || isNaN(idNum)) {
          throw new Error('Invalid Anime ID parameter');
        }

        const data = await getAnimeById(idNum);
        if (isMounted) {
          if (data) {
            setMedia(data);
          } else {
            setError('Anime media details could not be loaded.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Fetch Media Error:', err);
          setError(err.message || 'Failed to fetch anime details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMediaData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mediaId]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#389B5F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-[#A3C2AE]">Fetching Anime Hub Details...</p>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-serif font-bold text-rose-400">Unable to Load Anime</h2>
        <p className="text-xs text-[#A3C2AE] max-w-md mx-auto">{error || 'Media not found'}</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-[#25663E] text-white font-bold text-xs rounded-xl border border-[#389B5F] cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  const titleEnglish = media.title?.english || media.title?.userPreferred || media.title?.romaji || 'Anime Series';
  const titleRomaji = media.title?.romaji || '';
  const titleNative = media.title?.native || '';
  const coverUrl = media.coverImage?.large || media.coverImage?.medium || getFallbackCover(titleEnglish);
  const bannerUrl = media.bannerImage || coverUrl;

  const score = media.averageScore ? (media.averageScore / 10).toFixed(1) : 'N/A';
  const popularity = media.popularity ? media.popularity.toLocaleString() : 'N/A';
  const isAnime = media.type === 'ANIME';

  const seasonStr = media.season ? media.season.toUpperCase() : '';
  const yearStr = media.seasonYear || media.startDate?.year || '';
  const seasonYear = [seasonStr, yearStr].filter(Boolean).join(' ') || 'Unknown Season';

  const studioObj = media.studios?.nodes?.[0];
  const studioName = studioObj?.name || 'Studio Unknown';

  const handleTabChange = (tabName: string) => {
    const basePath = `/anime/${media.id}`;
    const targetPath = tabName === 'overview' ? basePath : `${basePath}/${tabName}`;
    onNavigate(targetPath);
  };

  const handleAddDiscussionPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim() || !newDiscussionBody.trim()) return;

    const newThread = {
      id: `disc_${Date.now()}`,
      author: user?.displayName || user?.username || 'OtakuVerse Fan',
      avatar: user?.avatarUrl || '',
      title: newDiscussionTitle.trim(),
      body: newDiscussionBody.trim(),
      likes: 1,
      commentsCount: 0,
      category: newDiscussionTag,
      createdAt: 'Just now',
    };

    setUserDiscussions((prev) => [newThread, ...prev]);
    setNewDiscussionTitle('');
    setNewDiscussionBody('');
    setIsPostingDiscussion(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 min-h-screen pb-24">
      
      {/* 1. WIDE CINEMATIC BANNER HEADER */}
      <div className="relative w-full rounded-3xl overflow-hidden border-2 border-[#23382C] bg-[#0A0E0B] shadow-2xl">
        {/* Banner Image / Gradient Background */}
        <div className="relative h-[220px] sm:h-[300px] md:h-[360px] w-full overflow-hidden">
          <img
            src={bannerUrl}
            alt={titleEnglish}
            onError={(e) => {
              (e.target as HTMLImageElement).src = coverUrl;
            }}
            className="w-full h-full object-cover opacity-35 blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E0B] via-[#0A0E0B]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E0B] via-[#0A0E0B]/50 to-transparent" />

          {/* Quick Back Nav */}
          <button
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 z-20 px-3.5 py-1.5 bg-black/70 hover:bg-[#25663E] text-white font-bold text-xs rounded-xl border border-[#389B5F]/60 backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>← Back</span>
          </button>
        </div>

        {/* Compact Hero Identity Overlay Area */}
        <div className="relative z-10 px-6 sm:px-8 pb-8 -mt-24 sm:-mt-28 md:-mt-32 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          
          {/* Compact Cover Image (Approx 180–230px Wide on Desktop) */}
          <div className="w-[180px] sm:w-[210px] aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#C5A059] shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-[#0E1410] shrink-0">
            <img
              src={coverUrl}
              alt={titleEnglish}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackCover(titleEnglish);
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Anime Identity & Specs */}
          <div className="space-y-3 min-w-0 flex-1">
            {/* Stat Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-[#25663E] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg border border-[#389B5F]">
                ★ {score} / 10 Score
              </span>
              <span className="px-3 py-1 bg-[#141C17] text-[#C5A059] font-mono text-xs border border-[#23382C] rounded-lg">
                🔥 #{popularity} Popularity
              </span>
              <span className="px-3 py-1 bg-[#141C17] text-emerald-400 font-mono text-xs border border-[#23382C] rounded-lg font-bold">
                {media.status || 'RELEASING'}
              </span>
              <span className="px-3 py-1 bg-[#141C17] text-[#A3C2AE] font-mono text-xs border border-[#23382C] rounded-lg">
                {media.format || 'TV'} {media.episodes ? `• ${media.episodes} Eps` : ''}
              </span>
            </div>

            {/* Titles */}
            <div className="space-y-1">
              <h1 className="font-serif font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                {titleEnglish}
              </h1>
              {titleRomaji && titleRomaji !== titleEnglish && (
                <p className="font-mono text-xs sm:text-sm text-[#C5A059] italic">
                  {titleRomaji} {titleNative ? `• ${titleNative}` : ''}
                </p>
              )}
            </div>

            {/* Genre Pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-0.5">
              {media.genres?.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 bg-[#141C17] text-[#389B5F] border border-[#23382C] font-mono font-bold text-[11px] rounded-md"
                >
                  #{g}
                </span>
              ))}
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={() => setAddToListOpen(true)}
                className="px-5 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <span>➕ Save to List</span>
              </button>

              <button
                onClick={() => setWriteReviewOpen(true)}
                className="px-4 py-2.5 bg-[#141C17] hover:bg-[#23382C] text-[#C5A059] font-bold text-xs rounded-xl border border-[#C5A059]/40 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>⭐ Write Review</span>
              </button>

              <button
                onClick={() => handleTabChange('discussions')}
                className="px-4 py-2.5 bg-[#141C17] hover:bg-[#23382C] text-white font-bold text-xs rounded-xl border border-[#23382C] hover:border-[#389B5F] transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>💬 Join Community</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PAGE NAVIGATION TABS */}
      <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-2 sticky top-4 z-20 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: '📖' },
            { id: 'episodes', label: 'Episodes', icon: '📺' },
            { id: 'reviews', label: 'Reviews', icon: '⭐' },
            { id: 'discussions', label: 'Discussions', icon: '💬' },
            { id: 'characters', label: 'Characters', icon: '🎭' },
            { id: 'recommendations', label: 'Recommendations', icon: '💡' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold text-xs font-mono transition-all border whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-[#25663E] text-white border-[#389B5F] shadow-lg shadow-[#389B5F]/20'
                    : 'bg-[#141C17] hover:bg-[#1C2820] text-[#A3C2AE] hover:text-white border-[#23382C]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB-SPECIFIC CONTENT LAYOUTS */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Left Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Synopsis Box */}
            <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-3 shadow-md">
              <h3 className="font-serif font-bold text-lg text-white border-b border-[#23382C] pb-2 flex items-center gap-2">
                <span>📖</span> Synopsis
              </h3>
              <p className="text-xs sm:text-sm text-[#A3C2AE] leading-relaxed whitespace-pre-line font-sans">
                {cleanDescription(media.description)}
              </p>
            </div>

            {/* Main Characters Preview */}
            {media.characters?.edges && media.characters.edges.length > 0 && (
              <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
                  <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                    <span>🎭</span> Main Characters
                  </h3>
                  <button
                    onClick={() => handleTabChange('characters')}
                    className="text-xs font-mono text-[#389B5F] hover:text-[#C5A059] font-bold cursor-pointer"
                  >
                    View All Characters →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {media.characters.edges.slice(0, 6).map((edge, idx) => {
                    const charName = edge.node.name.full || edge.node.name.native || 'Unknown';
                    const charImg = edge.node.image?.large || edge.node.image?.medium || getFallbackCover(charName);
                    const va = edge.voiceActors?.[0];

                    return (
                      <div
                        key={`char_preview_${edge.node.id}_${idx}`}
                        className="bg-[#141C17] border border-[#23382C] rounded-xl p-2.5 flex items-center gap-2.5 overflow-hidden"
                      >
                        <img
                          src={charImg}
                          alt={charName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getFallbackCover(charName);
                          }}
                          className="w-10 h-12 object-cover rounded-lg bg-black shrink-0"
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

            {/* Franchise & Related Anime */}
            {media.relations?.edges && media.relations.edges.length > 0 && (
              <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-4 shadow-md">
                <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2 border-b border-[#23382C] pb-3">
                  <span>🔗</span> Franchise & Related Series
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {media.relations.edges.slice(0, 4).map((edge, idx) => {
                    const node = edge.node;
                    const relTitle = node.title?.english || node.title?.userPreferred || 'Related Title';
                    const relCover = node.coverImage?.medium || getFallbackCover(relTitle);

                    return (
                      <div
                        key={`rel_${node.id}_${idx}`}
                        onClick={() => onSelectMedia(node)}
                        className="bg-[#141C17] hover:bg-[#1C2820] border border-[#23382C] hover:border-[#389B5F] rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <img
                          src={relCover}
                          alt={relTitle}
                          className="w-12 h-16 object-cover rounded-lg bg-black shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="px-2 py-0.5 rounded bg-[#25663E]/40 text-[#389B5F] text-[10px] font-mono font-bold uppercase">
                            {edge.relationType || 'RELATED'}
                          </span>
                          <h5 className="font-serif font-bold text-xs text-white truncate mt-1">
                            {relTitle}
                          </h5>
                          <p className="text-[10px] text-[#A3C2AE]/70 font-mono">
                            {node.format || 'TV'} {node.episodes ? `• ${node.episodes} Eps` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Community Activity Preview */}
            <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
                <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                  <span>💬</span> Community Discussions
                </h3>
                <button
                  onClick={() => handleTabChange('discussions')}
                  className="text-xs font-mono text-[#389B5F] hover:text-[#C5A059] font-bold cursor-pointer"
                >
                  Join Community →
                </button>
              </div>

              <div className="space-y-3">
                {userDiscussions.slice(0, 2).map((disc) => (
                  <div
                    key={disc.id}
                    onClick={() => handleTabChange('discussions')}
                    className="bg-[#141C17] hover:bg-[#1C2820] border border-[#23382C] hover:border-[#389B5F] rounded-xl p-4 space-y-1.5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#A3C2AE]">
                      <span className="px-2 py-0.5 rounded bg-[#25663E] text-white text-[10px] font-bold">
                        {disc.category}
                      </span>
                      <span>{disc.createdAt}</span>
                    </div>
                    <h5 className="font-serif font-bold text-sm text-white">
                      {disc.title}
                    </h5>
                    <p className="text-xs text-[#A3C2AE] line-clamp-2">
                      {disc.body}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#C5A059] font-mono pt-1">
                      <span>👍 {disc.likes} upvotes</span>
                      <span>💬 {disc.commentsCount} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Member Reviews Preview (Only Small Preview + Link) */}
            <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
                <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                  <span>⭐</span> Member Reviews
                </h3>
                <button
                  onClick={() => handleTabChange('reviews')}
                  className="text-xs font-mono text-[#389B5F] hover:text-[#C5A059] font-bold cursor-pointer"
                >
                  View All Reviews →
                </button>
              </div>

              {media.reviews?.nodes && media.reviews.nodes.length > 0 ? (
                <div className="bg-[#141C17] border border-[#23382C] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-xs text-[#C5A059]">
                      Featured Review by {media.reviews.nodes[0].user?.name || 'AniList User'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#25663E] text-white font-bold text-xs">
                      ★ {(media.reviews.nodes[0].rating || 90) / 10}/10
                    </span>
                  </div>
                  <p className="text-xs text-[#A3C2AE] line-clamp-3 font-sans leading-relaxed">
                    "{cleanDescription(media.reviews.nodes[0].summary)}"
                  </p>
                  <button
                    onClick={() => handleTabChange('reviews')}
                    className="text-xs text-[#389B5F] font-bold hover:underline pt-1 inline-block cursor-pointer"
                  >
                    Read full review and write your own →
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-[#A3C2AE]">
                  No reviews posted yet. Be the first to share your thoughts!
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Right Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Anime Specifications Card */}
            <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-5 space-y-4 shadow-md">
              <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase border-b border-[#23382C] pb-2 text-[#C5A059]">
                Anime Information
              </h4>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Format</span>
                  <span className="text-white font-bold">{media.format || media.type}</span>
                </div>

                <div>
                  <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Status</span>
                  <span className="text-emerald-400 font-bold">{media.status || 'N/A'}</span>
                </div>

                <div>
                  <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Total Episodes</span>
                  <span className="text-white font-bold">{media.episodes || 'Ongoing'}</span>
                </div>

                <div>
                  <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Episode Duration</span>
                  <span className="text-white font-bold">
                    {media.duration ? `${media.duration} mins` : '24 mins'}
                  </span>
                </div>

                <div>
                  <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Season / Year</span>
                  <span className="text-white font-bold">{seasonYear}</span>
                </div>

                <div>
                  <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Studio</span>
                  <span className="text-white font-bold">{studioName}</span>
                </div>

                <div>
                  <span className="block text-[#A3C2AE]/60 uppercase text-[10px]">Source Material</span>
                  <span className="text-white font-bold">{media.source || 'Light Novel / Manga'}</span>
                </div>
              </div>
            </div>

            {/* Official External Links */}
            {media.externalLinks && media.externalLinks.length > 0 && (
              <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-5 space-y-3">
                <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase border-b border-[#23382C] pb-2 text-[#C5A059]">
                  Official Streaming
                </h4>
                <div className="flex flex-wrap gap-2">
                  {media.externalLinks.map((link) => (
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

        </div>
      )}

      {/* EPISODES TAB */}
      {activeTab === 'episodes' && (
        <AnimeEpisodesSection
          anilistId={media.id}
          onNavigate={onNavigate}
        />
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-8">
          
          {/* Review Summary Score Header */}
          <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Score Display */}
              <div className="flex items-center gap-6 text-center sm:text-left">
                <div className="w-24 h-24 rounded-2xl bg-[#25663E] border-2 border-[#389B5F] flex flex-col items-center justify-center shadow-lg">
                  <span className="font-serif font-black text-3xl text-white">★ {score}</span>
                  <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider">OUT OF 10</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-2xl text-white">
                    Overall Community Score
                  </h3>
                  <p className="text-xs text-[#A3C2AE]">
                    Based on verified OtakuVerse & AniList community ratings.
                  </p>
                </div>
              </div>

              {/* Write Review CTA */}
              <button
                onClick={() => setWriteReviewOpen(true)}
                className="px-6 py-3 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <span>⭐ Write Member Review</span>
              </button>
            </div>

            {/* Rating Distribution Bar */}
            <div className="pt-4 border-t border-[#23382C] space-y-2">
              <h4 className="font-mono text-xs text-[#C5A059] uppercase">Rating Breakdown</h4>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 text-center text-xs font-mono">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((ratingNum) => (
                  <div key={ratingNum} className="bg-[#141C17] border border-[#23382C] rounded-lg p-2 space-y-1">
                    <span className="block font-bold text-white">{ratingNum}★</span>
                    <div className="w-full bg-[#0E1410] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#389B5F] h-full"
                        style={{ width: `${Math.max(10, Math.min(100, (ratingNum * 10)))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Member Reviews List */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2 border-b-2 border-[#23382C] pb-3">
              <span>🗣️</span> Member Reviews
            </h3>

            {/* User Submitted Local Reviews */}
            {userReviews.map((rev) => (
              <div key={rev.id} className="bg-[#0E1410] border-2 border-[#C5A059] rounded-2xl p-6 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#25663E] border border-[#389B5F] flex items-center justify-center font-bold text-white text-xs">
                      {rev.author.substring(0, 1)}
                    </div>
                    <div>
                      <span className="font-serif font-bold text-sm text-white block">{rev.headline}</span>
                      <span className="text-[10px] text-[#A3C2AE] font-mono">By {rev.author} • {rev.createdAt}</span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-lg bg-[#25663E] text-[#C5A059] font-bold text-xs border border-[#389B5F]">
                    ★ {rev.rating} / 10
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#A3C2AE] leading-relaxed whitespace-pre-line font-sans">
                  {rev.content}
                </p>

                <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#A3C2AE]">
                  <button className="hover:text-emerald-400 cursor-pointer">👍 Helpful (12)</button>
                  <button className="hover:text-rose-400 cursor-pointer">💬 Reply</button>
                </div>
              </div>
            ))}

            {/* AniList API Reviews */}
            {media.reviews?.nodes && media.reviews.nodes.length > 0 ? (
              media.reviews.nodes.map((rev) => (
                <div key={rev.id} className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#141C17] border border-[#23382C] flex items-center justify-center font-bold text-[#C5A059] text-xs">
                        {(rev.user?.name || 'A').substring(0, 1)}
                      </div>
                      <div>
                        <span className="font-serif font-bold text-sm text-white block">
                          Review by {rev.user?.name || 'AniList Member'}
                        </span>
                        <span className="text-[10px] text-[#A3C2AE] font-mono">Verified Critic</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-lg bg-[#141C17] text-emerald-400 font-bold text-xs border border-[#23382C]">
                      ★ {(rev.rating || 90) / 10} / 10
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#A3C2AE] leading-relaxed font-sans whitespace-pre-line">
                    {cleanDescription(rev.summary)}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#A3C2AE]">
                    <button className="hover:text-emerald-400 cursor-pointer">👍 Helpful (28)</button>
                  </div>
                </div>
              ))
            ) : userReviews.length === 0 ? (
              <div className="bg-[#0E1410] border border-[#23382C] rounded-2xl p-8 text-center space-y-2 text-xs text-[#A3C2AE]">
                <p className="text-xl">⭐</p>
                <p className="font-bold text-white">No member reviews written yet for {titleEnglish}.</p>
                <button
                  onClick={() => setWriteReviewOpen(true)}
                  className="px-4 py-2 bg-[#25663E] text-white font-bold text-xs rounded-xl"
                >
                  Write First Review
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* DISCUSSIONS TAB */}
      {activeTab === 'discussions' && (
        <div className="space-y-6">
          
          {/* Header & New Thread Creator Controls */}
          <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#23382C] pb-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2">
                  <span>💬</span> Community Discussion Forum
                </h3>
                <p className="text-xs text-[#A3C2AE]">
                  Share theories, episode breakdowns, fan polls, or ask questions with fellow fans.
                </p>
              </div>

              <button
                onClick={() => setIsPostingDiscussion(!isPostingDiscussion)}
                className="px-5 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <span>✏️ {isPostingDiscussion ? 'Cancel Post' : 'Create Discussion'}</span>
              </button>
            </div>

            {/* Collapsible New Post Form */}
            {isPostingDiscussion && (
              <form onSubmit={handleAddDiscussionPost} className="space-y-3 bg-[#141C17] border border-[#23382C] rounded-xl p-4 text-xs font-sans">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[#A3C2AE] font-bold uppercase mb-1 text-[10px]">Title</label>
                    <input
                      type="text"
                      required
                      value={newDiscussionTitle}
                      onChange={(e) => setNewDiscussionTitle(e.target.value)}
                      placeholder="e.g. Episode 12 Climax & Character Motivation Theory..."
                      className="w-full bg-[#0E1410] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A3C2AE] font-bold uppercase mb-1 text-[10px]">Category</label>
                    <select
                      value={newDiscussionTag}
                      onChange={(e) => setNewDiscussionTag(e.target.value)}
                      className="w-full bg-[#0E1410] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white outline-none cursor-pointer"
                    >
                      <option value="GENERAL">General</option>
                      <option value="THEORY">Theory</option>
                      <option value="EPISODE">Episode Discussion</option>
                      <option value="POLL">Poll</option>
                      <option value="RECOMMENDATION">Recommendation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#A3C2AE] font-bold uppercase mb-1 text-[10px]">Post Body</label>
                  <textarea
                    required
                    rows={3}
                    value={newDiscussionBody}
                    onChange={(e) => setNewDiscussionBody(e.target.value)}
                    placeholder="Describe your ideas, observations, or questions in detail..."
                    className="w-full bg-[#0E1410] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#25663E] text-white font-bold text-xs rounded-xl border border-[#389B5F]"
                  >
                    Publish Post ➔
                  </button>
                </div>
              </form>
            )}

            {/* Filter Tabs: Hot, New, Top, Unanswered */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {(['hot', 'new', 'top', 'unanswered'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDiscussionFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg border font-bold uppercase cursor-pointer ${
                      discussionFilter === filter
                        ? 'bg-[#25663E] text-white border-[#389B5F]'
                        : 'bg-[#141C17] text-[#A3C2AE] border-[#23382C] hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="text-xs font-mono text-[#A3C2AE]">
                Showing {userDiscussions.length} threads
              </div>
            </div>
          </div>

          {/* Reddit-Inspired Posts Feed */}
          <div className="space-y-4">
            {userDiscussions.map((thread) => (
              <div
                key={thread.id}
                className="bg-[#0E1410] border-2 border-[#23382C] hover:border-[#389B5F] rounded-2xl p-5 space-y-3 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#25663E] text-white text-[10px] font-bold">
                      {thread.category}
                    </span>
                    <span className="text-white font-bold">@{thread.author}</span>
                    <span className="text-[#A3C2AE]/60">• {thread.createdAt}</span>
                  </div>
                </div>

                <h4 className="font-serif font-bold text-base text-white group-hover:text-[#389B5F] transition-colors cursor-pointer">
                  {thread.title}
                </h4>

                <p className="text-xs text-[#A3C2AE] leading-relaxed font-sans line-clamp-3">
                  {thread.body}
                </p>

                <div className="pt-2 border-t border-[#23382C] flex items-center gap-4 text-xs font-mono text-[#C5A059]">
                  <button className="hover:text-amber-300 flex items-center gap-1 cursor-pointer">
                    <span>👍</span> {thread.likes} Upvotes
                  </button>
                  <button className="hover:text-emerald-400 flex items-center gap-1 cursor-pointer">
                    <span>💬</span> {thread.commentsCount} Comments
                  </button>
                  <button className="hover:text-white text-[#A3C2AE] text-[10px] ml-auto cursor-pointer">
                    Share ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHARACTERS TAB */}
      {activeTab === 'characters' && (
        <AnimeCharactersSection anilistId={media.id} />
      )}

      {/* RECOMMENDATIONS TAB */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#23382C] pb-3">
            <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2">
              <span>💡</span> Recommended Series If You Like {titleEnglish}
            </h3>
          </div>

          {media.recommendations?.nodes && media.recommendations.nodes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.recommendations.nodes
                .filter((n) => n.mediaRecommendation)
                .map((rec) => {
                  const rMedia = rec.mediaRecommendation!;
                  return (
                    <AnimeCard
                      key={`rec_tab_${rMedia.id}`}
                      media={rMedia}
                      onClickMedia={onSelectMedia}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="bg-[#0E1410] border border-[#23382C] rounded-2xl p-8 text-center text-xs text-[#A3C2AE]">
              No recommendations available for this title at this time.
            </div>
          )}
        </div>
      )}

      {/* INTERACTIVE MODALS */}
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
          handleTabChange('discussions');
        }}
      />

    </div>
  );
};
