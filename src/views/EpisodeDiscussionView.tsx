import React, { useState, useEffect } from 'react';
import { AniListMedia, getAnimeById } from '../services/anilist';
import { useAuth } from '../context/AuthContext';

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
  parentCommentId?: string | null;
  replyToUserId?: string | null;
  replyToAuthor?: string | null;
  body: string;
  isSpoiler: boolean;
  likeCount: number;
  likedBy: string[];
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
  commentCount: number;
  participantCount: number;
  viewCount: number;
  lastActivityAt: string;
}

export const EpisodeDiscussionView: React.FC<EpisodeDiscussionViewProps> = ({
  anilistId,
  seasonNumber,
  episodeNumber,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [anime, setAnime] = useState<AniListMedia | null>(null);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Comment Form
  const [commentBody, setCommentBody] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [authorName, setAuthorName] = useState(user?.username || 'OtakuVerse Member');
  const [submitting, setSubmitting] = useState(false);

  // Reply target
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');

  // Revealed spoilers tracking
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Anime Info from AniList
        const animeData = await getAnimeById(anilistId);
        if (isMounted) setAnime(animeData);

        // 2. Find or Create Discussion Thread
        const discRes = await fetch(
          `/api/anime/${anilistId}/season/${seasonNumber}/episode/${episodeNumber}/discussion`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              episodeInSeason: episodeNumber,
              episodeTitle: 'Episode Discussion',
              createdBy: user?.username || 'OtakuVerse Member',
            }),
          }
        );

        if (!discRes.ok) {
          throw new Error('Failed to load episode discussion thread');
        }

        const discData = await discRes.json();
        const activeDiscussion = discData.discussion;
        if (isMounted) setDiscussion(activeDiscussion);

        // 3. Fetch Comments for this Discussion
        if (activeDiscussion?._id || activeDiscussion?.id) {
          const discId = activeDiscussion._id || activeDiscussion.id;
          const commentsRes = await fetch(`/api/episode-discussions/${discId}/comments`);
          if (commentsRes.ok) {
            const commentsData = await commentsRes.json();
            if (isMounted) setComments(commentsData.comments || []);
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
  }, [anilistId, seasonNumber, episodeNumber, user]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || !discussion) return;

    setSubmitting(true);
    const discId = discussion._id || discussion.id;

    try {
      const payload = {
        userId: user?.id || null,
        author: authorName.trim() || user?.username || 'OtakuVerse Member',
        avatar: user?.avatarUrl || '',
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

        // Update discussion stats locally
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
  };

  const handleLikeComment = async (commentId: string) => {
    const userKey = user?.id || user?.username || 'guest';
    try {
      const res = await fetch(`/api/episode-comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', userId: userKey }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) => ((c._id || c.id) === commentId ? data.comment : c))
        );
      }
    } catch (err) {
      console.error('Like comment failed:', err);
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

  // Sort comments
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'likes') return b.likeCount - a.likeCount;
    if (sortBy === 'oldest')
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const animeTitle =
    anime?.title?.english || anime?.title?.romaji || anime?.title?.userPreferred || 'Anime Series';

  // Format requirement: Season {seasonNumber}, Episode {episodeNumber} — {episodeTitle}
  const epTitleFormatted = discussion?.episodeTitle
    ? discussion.episodeTitle
    : 'Title Unavailable';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#389B5F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-[#A3C2AE]">Loading Episode Discussion Thread...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-serif font-bold text-rose-400">Discussion Error</h2>
        <p className="text-xs text-[#A3C2AE] max-w-md mx-auto">{error}</p>
        <button
          onClick={() => onNavigate(`/anime/${anilistId}`)}
          className="px-4 py-2 bg-[#25663E] text-white font-bold text-xs rounded-xl"
        >
          ← Back to Anime Details
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Header */}
      <div>
        <button
          onClick={() => onNavigate(`/anime/${anilistId}`)}
          className="text-xs text-[#389B5F] hover:text-[#C5A059] font-bold flex items-center gap-1.5 transition-colors cursor-pointer mb-4"
        >
          <span>←</span> Back to {animeTitle}
        </button>

        {/* Page Headings */}
        <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 sm:p-8 space-y-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-[#25663E] text-[#C5A059] border border-[#389B5F] text-[11px] font-mono font-bold tracking-wider uppercase">
              Season {seasonNumber}, Episode {episodeNumber} Discussion
            </span>
            <span className="text-xs font-mono text-[#A3C2AE]">
              👁️ {discussion?.viewCount || 1} views
            </span>
          </div>

          <h1 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide">
            {epTitleFormatted}
          </h1>

          <p className="text-xs text-[#A3C2AE]">
            Anime: <span className="text-white font-bold">{animeTitle}</span> • Season {seasonNumber}, Episode {episodeNumber}
          </p>

          {/* Discussion Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A3C2AE] pt-3 border-t border-[#23382C]">
            <span>💬 {discussion?.commentCount || comments.length} Comments</span>
            <span>👥 {discussion?.participantCount || 1} Participants</span>
            <span>
              🕒 Active:{' '}
              {discussion?.lastActivityAt
                ? new Date(discussion.lastActivityAt).toLocaleDateString()
                : 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* Spoiler Banner Warning */}
      <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-200">
        <span className="text-lg">⚠️</span>
        <div>
          <strong className="font-bold block text-white mb-0.5">Spoiler Notice</strong>
          This thread contains discussion regarding events in <span className="font-semibold text-amber-100">Season {seasonNumber}, Episode {episodeNumber} ({epTitleFormatted})</span>. Please mark all future episode plot points with the spoiler toggle!
        </div>
      </div>

      {/* New Comment Form Section */}
      <div className="bg-[#0E1410] border border-[#23382C] rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
            <span>💬</span> Add to the Episode Discussion
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
            Replying to <strong className="text-white">@{replyTarget.author}</strong>: &quot;
            {replyTarget.body.substring(0, 80)}...&quot;
          </div>
        )}

        <form onSubmit={handlePostComment} className="space-y-4 text-xs font-sans">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1 text-[10px]">
                Your Display Name
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="OtakuVerse Member"
                className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white outline-none"
              />
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-xs text-[#A3C2AE] cursor-pointer selection:none">
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
              Comment Message
            </label>
            <textarea
              required
              rows={4}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder={`What did you think of Season ${seasonNumber}, Episode ${episodeNumber}? Share your reaction, character analysis, or animation highlights...`}
              className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-3 text-white placeholder-[#A3C2AE]/50 outline-none resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] shadow-lg transition-all cursor-pointer disabled:opacity-50 uppercase tracking-wider"
            >
              {submitting ? 'Posting...' : 'Post Episode Comment ➔'}
            </button>
          </div>
        </form>
      </div>

      {/* Comment List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
          <h2 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <span>🗣️</span> Community Comments ({comments.length})
          </h2>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 text-xs text-[#A3C2AE]">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#141C17] border border-[#23382C] rounded-lg px-2.5 py-1 text-white font-medium outline-none text-xs cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>

        {sortedComments.length === 0 ? (
          <div className="bg-[#0E1410] border border-[#23382C] rounded-2xl p-8 text-center space-y-2 text-xs text-[#A3C2AE]">
            <p className="text-lg">💭</p>
            <p className="font-bold text-white">Be the first to share your thoughts on Episode {episodeNumber}!</p>
            <p>Post a comment above to launch the episode conversation thread.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedComments.map((comment) => {
              const commentId = comment._id || comment.id || '';
              const isRevealed = revealedSpoilers[commentId];
              const isOwner = user && comment.userId === user.id;

              return (
                <div
                  key={commentId}
                  className={`bg-[#0E1410] border rounded-xl p-4 space-y-2 transition-all ${
                    comment.parentCommentId
                      ? 'ml-6 border-[#23382C] bg-[#0A0E0B]'
                      : 'border-[#23382C]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-[#A3C2AE]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#25663E] border border-[#389B5F] flex items-center justify-center font-bold text-white text-xs uppercase">
                        {comment.author.substring(0, 1)}
                      </div>
                      <span className="font-bold text-white">{comment.author}</span>
                      {comment.replyToAuthor && (
                        <span className="text-[11px] text-[#389B5F]">
                          replying to @{comment.replyToAuthor}
                        </span>
                      )}
                      <span className="text-[10px] text-[#A3C2AE]/70 font-mono">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {comment.isSpoiler && (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                          SPOILER
                        </span>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteComment(commentId)}
                          className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body with Spoiler handling */}
                  {comment.isSpoiler && !isRevealed ? (
                    <div
                      onClick={() => toggleSpoilerReveal(commentId)}
                      className="bg-[#141C17] border border-amber-800/40 rounded-lg p-3 text-center cursor-pointer hover:bg-amber-950/30 transition-colors"
                    >
                      <span className="text-amber-300 font-bold text-xs flex items-center justify-center gap-1">
                        🔒 Contains Spoilers for Episode {episodeNumber} — Click to Reveal
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                      {comment.body}
                    </p>
                  )}

                  {/* Comment Actions */}
                  <div className="flex items-center gap-4 text-xs font-mono pt-1 text-[#A3C2AE]">
                    <button
                      onClick={() => handleLikeComment(commentId)}
                      className="hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>👍</span> {comment.likeCount || 0}
                    </button>

                    <button
                      onClick={() => setReplyTarget(comment)}
                      className="hover:text-[#389B5F] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>💬</span> Reply
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
