import React, { useState } from 'react';
import { AniListMedia } from '../services/anilist';

interface WriteReviewModalProps {
  media: AniListMedia;
  isOpen: boolean;
  onClose: () => void;
  onSaveReview: (review: any) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ media, isOpen, onClose, onSaveReview }) => {
  const [rating, setRating] = useState(9.5);
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !content.trim()) return;

    const review = {
      id: `review_${Date.now()}`,
      mediaId: media.id,
      mediaTitle: media.title.english || media.title.userPreferred || media.title.romaji,
      mediaCover: media.coverImage?.large,
      author: 'Grand_Otaku_Critic',
      avatar: 'https://picsum.photos/seed/otaku_user_avatar/100/100',
      rating,
      headline,
      content,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      likes: 1,
    };

    onSaveReview(review);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0E1410] border-2 border-[#C5A059] rounded-2xl shadow-[0_0_50px_rgba(197,160,89,0.3)] p-6 space-y-5 animate-fade-in">
        
        <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
          <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <span>⭐</span> Write Critic Review for {media.title.english || media.title.romaji}
          </h3>
          <button onClick={onClose} className="text-[#A3C2AE] hover:text-white font-bold text-sm">
            ✕
          </button>
        </div>

        {savedSuccess ? (
          <div className="p-6 bg-[#25663E]/40 border border-[#389B5F] rounded-xl text-center space-y-2">
            <div className="text-3xl">📜</div>
            <h4 className="font-serif font-bold text-white text-base">Review Published to OtakuVerse!</h4>
            <p className="text-xs text-[#A3C2AE]">Your critique is now live in Community Reviews.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-[#C5A059] font-bold uppercase tracking-wider mb-1">
                Critic Rating Score ({rating}/10)
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={0.1}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-[#C5A059] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#A3C2AE] font-mono mt-1">
                <span>1.0 (Poor)</span>
                <span className="font-bold text-[#C5A059] text-sm">★ {rating} / 10</span>
                <span>10.0 (Masterpiece)</span>
              </div>
            </div>

            <div>
              <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                Review Headline
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., A Timeless Masterpiece of Emotional Empathy and Sound Design..."
                className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#C5A059] rounded-lg p-2.5 text-white placeholder-[#A3C2AE]/50 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                Detailed Analysis / Review Content
              </label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Analyze character depth, animation quality, worldbuilding, audio score, pacing, and emotional impact..."
                className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#C5A059] rounded-lg p-2.5 text-white placeholder-[#A3C2AE]/50 outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#141C17] hover:bg-[#23382C] text-[#A3C2AE] font-bold rounded-lg border border-[#23382C] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold rounded-lg border border-[#389B5F] shadow-md transition-colors cursor-pointer"
              >
                Publish Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
