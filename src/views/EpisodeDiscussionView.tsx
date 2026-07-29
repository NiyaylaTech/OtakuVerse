import React, { useState, useEffect } from 'react';
import { AniListMedia, getAnimeById } from '../services/anilist';
import { useAuth } from '../context/AuthContext';
import { fetchJson } from '../lib/api';

interface EpisodeDiscussionViewProps {
  anilistId: number;
  seasonNumber: number;
  episodeNumber: number;
  onNavigate: (path: string) => void;
}

interface Comment {
  _id: string;
  id?: string;
  episodeDiscussionId: string;
  userId?: string;
  author: string;
  avatar?: string;
  animeLevel?: number;
  parentCommentId?: string | null;
  replyToUserId?: string | null;
  replyToAuthor?: string | null;
  body: string;
  isSpoiler: boolean;
  likeCount: number;
  likedBy: string[];
  reportCount?: number;
  reportedBy?: string[];
  isEdited: boolean;
  createdAt: string;
}

interface Discussion {
  _id: string;
  id?: string;
  anilistId: number;
  seasonNumber: number;
  episodeNumber: number;
  episodeInSeason: number;
  episodeTitle: string;
  episodeDescription?: string;
  episodeAirDate?: string;
  episodeRuntime?: string | number;
  commentCount: number;
  participantCount: number;
  viewCount: number;
  lastActivityAt: string;
}

interface EpisodeMeta {
  title: string;
  description: string;
  airedAt: string | null;
  runtime: string | number | null;
  isFiller: boolean;
  isRecap: boolean;
  totalEpisodesInSeason: number;
}

export const EpisodeDiscussionView: React.FC<EpisodeDiscussionViewProps> = ({
  anilistId,
  seasonNumber,
  episodeNumber,
  onNavigate,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [anime, setAnime] = useState<AniListMedia | null>(null);
  const [episodeMeta, setEpisodeMeta] = useState<EpisodeMeta | null>(null);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [commentBody, setCommentBody] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [authorName, setAuthorName] = useState(user?.displayName || user?.username || '');
  const [submitting, setSubmitting] = useState(false);

  // Reply state
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);

  // Editing state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState('');

  // Sorting: Top, Newest, Oldest, Most Liked
  const [sortBy, setSortBy] = useState<'top' | 'newest' | 'oldest' | 'likes'>('top');

  // Revealed Spoilers state
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  // Report Feedback
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  const currentPath = `/anime/${anilistId}/season/${seasonNumber}/episode/${episodeNumber}`;

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Anime Info from AniList
        const animeData = await getAnimeById(anilistId);
        if (isMounted) setAnime(animeData);

        // 2. Fetch Episode Metadata
        let metaData = null;
        try {
          metaData = await fetchJson(`/api/anime/${anilistId}/season/${seasonNumber}/episode/${episodeNumber}`);
          if (isMounted && metaData) {
            setEpisodeMeta({
              title: metaData.title || 'Episode title unavailable',
              description: metaData.description || 'Episode description unavailable.',
              airedAt: metaData.airedAt || null,
              runtime: metaData.runtime || '24 min',
              isFiller: Boolean(metaData.isFiller),
              isRecap: Boolean(metaData.isRecap),
              totalEpisodesInSeason: metaData.totalEpisodesInSeason || 12,
            });
          }
        } catch (metaErr) {
          console.warn('Metadata fetch warning:', metaErr);
          if (isMounted) {
            setEpisodeMeta({
              title: 'Episode title unavailable',
              description: 'Episode description unavailable.',
              airedAt: null,
              runtime: '24 min',
              isFiller: false,
              isRecap: false,
              totalEpisodesInSeason: 12,
            });
          }
        }

        // 3. Find or Create Discussion Thread
        const discData = await fetchJson(
          `/api/anime/${anilistId}/season/${seasonNumber}/episode/${episodeNumber}/discussion`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              episodeInSeason: episodeNumber,
              episodeTitle: metaData?.title || 'Episode title unavailable',
              episodeDescription: metaData?.description || 'Episode description unavailable.',
              episodeAirDate: metaData?.airedAt || null,
              episodeRuntime: metaData?.runtime || '24 min',
              createdBy: user?.username || 'OtakuVerse Member',
            }),
          }
        );

        const activeDiscussion = discData?.discussion;
        if (isMounted) setDiscussion(activeDiscussion);

        // 4. Fetch Comments for this Discussion
        if (activeDiscussion?._id || activeDiscussion?.id) {
          const discId = activeDiscussion._id || activeDiscussion.id;
          try {
            const commentsData = await fetchJson(`/api/episode-discussions/${discId}/comments`);
            if (isMounted) setComments(commentsData.comments || []);
          } catch (commErr) {
            console.warn('Comments fetch warning:', commErr);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Episode Discussion Load Error:', err);
          setError(err.message || 'Failed to load discussion thread.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [anilistId, seasonNumber, episodeNumber]);

  // Handle Auth Check for Actions
  const requireAuth = (actionCallback: () => void) => {
    if (!isAuthenticated) {
      onNavigate(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    actionCallback();
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || !discussion) return;

    requireAuth(async () => {
      setSubmitting(true);
      const discId = discussion._id || discussion.id;

      try {
        const payload = {
          userId: user?.id || null,
          author: authorName.trim() || user?.displayName || user?.username || 'OtakuVerse Member',
          avatar: user?.avatarUrl || '',
          animeLevel: user?.animeLevel || 1,
          parentCommentId: replyTarget ? (replyTarget._id || replyTarget.id) : null,
          replyToUserId: replyTarget?.userId || null,
          replyToAuthor: replyTarget?.author || null,
          body: commentBody.trim(),
          isSpoiler,
        };

        const res = await fetch(`/api/episode-discussions/${discId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error('Failed to submit comment.');
        }

        const data = await res.json();
        if (data.comment) {
          setComments((prev) => [...prev, data.comment]);
          setCommentBody('');
          setIsSpoiler(false);
          setReplyTarget(null);

          setDiscussion((prev) =>
            prev
              ? {
                  ...prev,
                  commentCount: prev.commentCount + 1,
                  participantCount: prev.participantCount + 1,
                }
              : null
          );
        }
      } catch (err: any) {
        alert(err.message || 'Failed to post comment.');
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleLikeComment = (commentId: string) => {
    requireAuth(async () => {
      const userKey = user?.id || user?.username || 'guest';
      const targetComment = comments.find((c) => (c._id || c.id) === commentId);
      const isLiked = targetComment?.likedBy.includes(userKey);

      try {
        const method = isLiked ? 'DELETE' : 'POST';
        const res = await fetch(`/api/episode-comments/${commentId}/like`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userKey }),
        });

        if (res.ok) {
          const data = await res.json();
          setComments((prev) =>
            prev.map((c) => ((c._id || c.id) === commentId ? data.comment : c))
          );
        }
      } catch (err) {
        console.error('Like comment error:', err);
      }
    });
  };

  const handleReportComment = (commentId: string) => {
    requireAuth(async () => {
      try {
        const res = await fetch(`/api/episode-comments/${commentId}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id || user?.username || 'guest', reason: 'Inappropriate content' }),
        });

        if (res.ok) {
          setReportFeedback('Thank you for your report. Our moderators have been notified.');
          setTimeout(() => setReportFeedback(null), 4000);
        }
      } catch (err) {
        console.error('Report comment error:', err);
      }
    });
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingBody.trim()) return;

    try {
      const res = await fetch(`/api/episode-comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editingBody.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) => ((c._id || c.id) === commentId ? data.comment : c))
        );
        setEditingCommentId(null);
        setEditingBody('');
      }
    } catch (err) {
      console.error('Edit comment error:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch(`/api/episode-comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => (c._id || c.id) !== commentId));
        setDiscussion((prev) =>
          prev ? { ...prev, commentCount: Math.max(0, prev.commentCount - 1) } : null
        );
      }
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const toggleSpoilerReveal = (commentId: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // Comment Sorting logic
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'top' || sortBy === 'likes') {
      return b.likeCount - a.likeCount;
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const animeTitle =
    anime?.title?.english || anime?.title?.romaji || anime?.title?.userPreferred || 'Anime Series';

  const epTitleFormatted = episodeMeta?.title || discussion?.episodeTitle || `Season ${seasonNumber}, Episode ${episodeNumber}`;
  const epDescriptionFormatted = episodeMeta?.description || discussion?.episodeDescription || 'An episode description is not currently available.';

  const totalEpsInSeason = episodeMeta?.totalEpisodesInSeason || 24;
  const hasPrevEpisode = episodeNumber > 1;
  const hasNextEpisode = episodeNumber < totalEpsInSeason;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#389B5F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-[#A3C2AE]">Loading Episode Page & Discussion...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-serif font-bold text-rose-400">Episode Load Error</h2>
        <p className="text-xs text-[#A3C2AE] max-w-md mx-auto">{error}</p>
        <button
          onClick={() => onNavigate(`/anime/${anilistId}`)}
          className="px-5 py-2.5 bg-[#25663E] text-white font-bold text-xs rounded-xl border border-[#389B5F]"
        >
          ← Back to Anime Details
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate(`/anime/${anilistId}`)}
          className="px-4 py-2 bg-[#0E1410] hover:bg-[#25663E] text-[#389B5F] hover:text-white font-bold text-xs rounded-xl border border-[#23382C] hover:border-[#389B5F] transition-all cursor-pointer flex items-center gap-2"
        >
          <span>← Back to {animeTitle}</span>
        </button>

        {/* Jump to Episode Dropdown */}
        <div className="flex items-center gap-2 text-xs text-[#A3C2AE]">
          <span className="font-mono">Jump to Episode:</span>
          <select
            value={episodeNumber}
            onChange={(e) => onNavigate(`/anime/${anilistId}/season/${seasonNumber}/episode/${e.target.value}`)}
            className="bg-[#0E1410] border border-[#23382C] focus:border-[#389B5F] rounded-lg px-3 py-1.5 text-white font-bold text-xs outline-none cursor-pointer"
          >
            {Array.from({ length: totalEpsInSeason }).map((_, idx) => {
              const epNum = idx + 1;
              return (
                <option key={epNum} value={epNum}>
                  Episode {epNum}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main Episode Banner & Title Section */}
      <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#25663E] text-[#C5A059] border border-[#389B5F] text-[11px] font-mono font-bold tracking-wider uppercase">
              Season {seasonNumber}, Episode {episodeNumber}
            </span>

            {episodeMeta?.isFiller && (
              <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold">
                FILLER
              </span>
            )}
            {episodeMeta?.isRecap && (
              <span className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
                RECAP
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-[#A3C2AE] flex items-center gap-3">
            {episodeMeta?.airedAt && (
              <span>📅 {new Date(episodeMeta.airedAt).toLocaleDateString()}</span>
            )}
            {episodeMeta?.runtime && <span>⏱ {episodeMeta.runtime}</span>}
          </div>
        </div>

        {/* Heading Hierarchy: Anime Title -> Season/Episode -> Episode Title */}
        <div className="space-y-1">
          <p className="text-xs font-mono text-[#C5A059] uppercase tracking-wider">
            {animeTitle}
          </p>
          <h2 className="text-sm font-bold text-[#A3C2AE]">
            Season {seasonNumber}, Episode {episodeNumber}
          </h2>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-white tracking-wide pt-1">
            {epTitleFormatted}
          </h1>
        </div>

        {/* Episode Description */}
        <div className="pt-3 border-t border-[#23382C] space-y-2">
          <h3 className="font-serif font-bold text-xs uppercase text-[#C5A059] tracking-wider">
            Episode Synopsis
          </h3>
          <p className="text-xs sm:text-sm text-[#A3C2AE] leading-relaxed font-sans">
            "{epDescriptionFormatted}"
          </p>
        </div>

        {/* Next / Previous Episode Controls */}
        <div className="pt-4 border-t border-[#23382C] flex items-center justify-between gap-3">
          <button
            disabled={!hasPrevEpisode}
            onClick={() => onNavigate(`/anime/${anilistId}/season/${seasonNumber}/episode/${episodeNumber - 1}`)}
            className="px-4 py-2 bg-[#141C17] hover:bg-[#25663E] border border-[#23382C] hover:border-[#389B5F] rounded-xl text-white font-bold text-xs disabled:opacity-30 disabled:hover:bg-[#141C17] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>← Previous Episode</span>
          </button>

          <span className="text-xs font-mono text-[#A3C2AE] hidden sm:inline">
            Episode {episodeNumber} of {totalEpsInSeason}
          </span>

          <button
            disabled={!hasNextEpisode}
            onClick={() => onNavigate(`/anime/${anilistId}/season/${seasonNumber}/episode/${episodeNumber + 1}`)}
            className="px-4 py-2 bg-[#25663E] hover:bg-[#389B5F] border border-[#389B5F] rounded-xl text-white font-bold text-xs disabled:opacity-30 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Next Episode →</span>
          </button>
        </div>
      </div>

      {/* Spoiler Warning Banner */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-200">
        <span className="text-lg shrink-0">⚠️</span>
        <div>
          <strong className="font-bold text-white block mb-0.5">Spoiler Notice</strong>
          This discussion may contain spoilers for Season {seasonNumber}, Episode {episodeNumber} ({epTitleFormatted}).
        </div>
      </div>

      {/* Toast Feedback for Reports */}
      {reportFeedback && (
        <div className="bg-[#25663E] text-white p-3 rounded-xl text-xs font-bold text-center animate-fade-in">
          {reportFeedback}
        </div>
      )}

      {/* Comment Composer */}
      <div className="bg-[#0E1410] border border-[#23382C] rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
            <span>💬</span> Episode Discussion
          </h3>

          {replyTarget && (
            <button
              onClick={() => setReplyTarget(null)}
              className="text-xs text-rose-400 hover:underline cursor-pointer"
            >
              Cancel Reply to @{replyTarget.author}
            </button>
          )}
        </div>

        {replyTarget && (
          <div className="bg-[#141C17] border-l-2 border-[#C5A059] p-3 rounded text-xs text-[#A3C2AE]">
            Replying to <strong className="text-white">@{replyTarget.author}</strong>: "{replyTarget.body.substring(0, 80)}..."
          </div>
        )}

        {/* Signed Out Banner overlay if user isn't logged in */}
        {!isAuthenticated && (
          <div className="bg-[#141C17] border border-[#23382C] rounded-xl p-4 text-center space-y-2 text-xs">
            <p className="text-white font-bold">Want to join the conversation?</p>
            <p className="text-[#A3C2AE]">You can read comments freely. Sign in to post, reply, or like comments.</p>
            <button
              onClick={() => onNavigate(`/sign-in?redirect=${encodeURIComponent(currentPath)}`)}
              className="px-5 py-2 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] transition-colors cursor-pointer"
            >
              Sign In to Comment
            </button>
          </div>
        )}

        {isAuthenticated && (
          <form onSubmit={handlePostComment} className="space-y-4 text-xs font-sans">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1 text-[10px]">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white outline-none"
                />
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-xs text-[#A3C2AE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpoiler}
                    onChange={(e) => setIsSpoiler(e.target.checked)}
                    className="w-4 h-4 accent-[#25663E] rounded cursor-pointer"
                  />
                  <span className="font-bold text-amber-300">⚠️ Contains Episode Spoilers</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1 text-[10px]">
                Comment Text
              </label>
              <textarea
                required
                rows={4}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={`What did you think of Season ${seasonNumber}, Episode ${episodeNumber}? Share your reaction, character analysis, or animation highlights...`}
                className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-3 text-white placeholder-[#A3C2AE]/50 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] shadow-lg transition-all cursor-pointer disabled:opacity-50 uppercase tracking-wider"
              >
                {submitting ? 'Posting...' : 'Post Comment ➔'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Comment List & Reddit-Inspired Tree */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
          <h2 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <span>🗣️</span> Community Comments ({comments.length})
          </h2>

          <div className="flex items-center gap-2 text-xs text-[#A3C2AE]">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#141C17] border border-[#23382C] rounded-lg px-2.5 py-1 text-white font-medium outline-none text-xs cursor-pointer"
            >
              <option value="top">Top (Most Liked)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>

        {sortedComments.length === 0 ? (
          <div className="bg-[#0E1410] border border-[#23382C] rounded-2xl p-8 text-center space-y-2 text-xs text-[#A3C2AE]">
            <p className="text-xl">💭</p>
            <p className="font-bold text-white">No comments yet for Episode {episodeNumber}.</p>
            <p>Be the first to leave a comment and start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedComments.map((comment) => {
              const commentId = comment._id || comment.id || '';
              const isRevealed = revealedSpoilers[commentId];
              const isOwner = user && comment.userId === user.id;
              const isEditing = editingCommentId === commentId;
              const isReply = Boolean(comment.parentCommentId);

              return (
                <div
                  key={commentId}
                  className={`bg-[#0E1410] border rounded-xl p-4 space-y-2 transition-all ${
                    isReply
                      ? 'ml-4 sm:ml-8 border-l-4 border-l-[#25663E] border-t-[#23382C] border-r-[#23382C] border-b-[#23382C] bg-[#0A0E0B]'
                      : 'border-[#23382C]'
                  }`}
                >
                  {/* Author Header */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-[#A3C2AE] gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#25663E] border border-[#389B5F] flex items-center justify-center font-bold text-white text-xs uppercase shrink-0">
                        {comment.author.substring(0, 1)}
                      </div>
                      
                      <span className="font-bold text-white">{comment.author}</span>
                      
                      <span className="px-2 py-0.5 rounded bg-[#141C17] border border-[#23382C] text-[#C5A059] text-[10px] font-mono font-bold">
                        Lvl {comment.animeLevel || 1}
                      </span>

                      {comment.replyToAuthor && (
                        <span className="text-[11px] text-[#389B5F]">
                          Replying to @{comment.replyToAuthor}
                        </span>
                      )}

                      <span className="text-[10px] text-[#A3C2AE]/70 font-mono">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>

                      {comment.isEdited && (
                        <span className="text-[10px] text-[#A3C2AE]/50 italic">(edited)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {comment.isSpoiler && (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                          SPOILER
                        </span>
                      )}

                      {isOwner && !isEditing && (
                        <div className="flex items-center gap-2 text-[11px]">
                          <button
                            onClick={() => {
                              setEditingCommentId(commentId);
                              setEditingBody(comment.body);
                            }}
                            className="text-[#389B5F] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(commentId)}
                            className="text-rose-400 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Editing Mode */}
                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={3}
                        value={editingBody}
                        onChange={(e) => setEditingBody(e.target.value)}
                        className="w-full bg-[#141C17] border border-[#389B5F] rounded-lg p-2.5 text-xs text-white outline-none"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1 bg-[#141C17] text-[#A3C2AE] rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditComment(commentId)}
                          className="px-3 py-1 bg-[#25663E] text-white font-bold rounded-lg text-xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : comment.isSpoiler && !isRevealed ? (
                    /* Spoiler Mask */
                    <div
                      onClick={() => toggleSpoilerReveal(commentId)}
                      className="bg-[#141C17] border border-amber-800/40 rounded-lg p-3 text-center cursor-pointer hover:bg-amber-950/30 transition-colors"
                    >
                      <span className="text-amber-300 font-bold text-xs flex items-center justify-center gap-1">
                        🔒 Contains Spoilers for Episode {episodeNumber} — Click to Reveal
                      </span>
                    </div>
                  ) : (
                    /* Standard Comment Body */
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap pt-1">
                      {comment.body}
                    </p>
                  )}

                  {/* Comment Actions: Like, Reply, Report */}
                  <div className="flex items-center gap-4 text-xs font-mono pt-2 text-[#A3C2AE] border-t border-[#23382C]/40">
                    <button
                      onClick={() => handleLikeComment(commentId)}
                      className="hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>👍</span> {comment.likeCount || 0}
                    </button>

                    <button
                      onClick={() => requireAuth(() => setReplyTarget(comment))}
                      className="hover:text-[#389B5F] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>💬</span> Reply
                    </button>

                    <button
                      onClick={() => handleReportComment(commentId)}
                      className="hover:text-rose-400 text-[10px] uppercase cursor-pointer transition-colors ml-auto"
                    >
                      Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Navigation Bar on Mobile for Previous / Next Episode */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#060807]/95 border-t border-[#23382C] p-3 backdrop-blur-md flex items-center justify-between z-30">
        <button
          disabled={!hasPrevEpisode}
          onClick={() => onNavigate(`/anime/${anilistId}/season/${seasonNumber}/episode/${episodeNumber - 1}`)}
          className="px-3.5 py-2 bg-[#141C17] border border-[#23382C] rounded-xl text-white font-bold text-xs disabled:opacity-30"
        >
          ← Prev Ep
        </button>

        <span className="text-xs font-mono text-[#C5A059] font-bold">
          S{seasonNumber} E{episodeNumber}
        </span>

        <button
          disabled={!hasNextEpisode}
          onClick={() => onNavigate(`/anime/${anilistId}/season/${seasonNumber}/episode/${episodeNumber + 1}`)}
          className="px-3.5 py-2 bg-[#25663E] border border-[#389B5F] rounded-xl text-white font-bold text-xs disabled:opacity-30"
        >
          Next Ep →
        </button>
      </div>
    </div>
  );
};
