import React, { useState } from 'react';
import { AniListMedia } from '../services/anilist';
import { useAuth } from '../context/AuthContext';

interface StartDiscussionModalProps {
  media: AniListMedia;
  isOpen: boolean;
  onClose: () => void;
  onSaveDiscussion: (thread: any) => void;
  onNavigate?: (path: string) => void;
}

export const StartDiscussionModal: React.FC<StartDiscussionModalProps> = ({ media, isOpen, onClose, onSaveDiscussion, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [topic, setTopic] = useState('');
  const [body, setBody] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !body.trim()) return;

    const thread = {
      id: `thread_${Date.now()}`,
      mediaId: media.id,
      mediaTitle: media.title.english || media.title.userPreferred || media.title.romaji,
      topic,
      body,
      author: user?.displayName || user?.username || 'OtakuVerse Member',
      repliesCount: 1,
      createdAt: 'Just now',
    };

    onSaveDiscussion(thread);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0E1410] border-2 border-[#389B5F] rounded-2xl shadow-[0_0_50px_rgba(56,155,95,0.3)] p-6 space-y-5 animate-fade-in">
        
        <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
          <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <span>💬</span> Start Discussion Thread
          </h3>
          <button onClick={onClose} className="text-[#A3C2AE] hover:text-white font-bold text-sm cursor-pointer">
            ✕
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-6 bg-[#060807] border border-[#23382C] rounded-xl text-center space-y-4">
            <div className="text-4xl">🔒</div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-white text-base">Sign In Required</h4>
              <p className="text-xs text-[#A3C2AE]">
                You must be signed in to create discussion threads and debate with the community.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#141C17] hover:bg-[#23382C] text-[#A3C2AE] font-bold rounded-lg border border-[#23382C] transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigate) onNavigate('/sign-in');
                }}
                className="flex-1 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold rounded-lg border border-[#389B5F] shadow-md transition-colors cursor-pointer text-xs"
              >
                Sign In ➔
              </button>
            </div>
          </div>
        ) : savedSuccess ? (
          <div className="p-6 bg-[#25663E]/40 border border-[#389B5F] rounded-xl text-center space-y-2">
            <div className="text-3xl">💬</div>
            <h4 className="font-serif font-bold text-white text-base">Thread Live in Community Hub!</h4>
            <p className="text-xs text-[#A3C2AE]">Members can now join the debate.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                Discussion Title / Debate Prompt
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={`e.g., What is the most iconic episode in ${media.title.english || media.title.romaji}?`}
                className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white placeholder-[#A3C2AE]/50 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                Thread Description / Opening Argument
              </label>
              <textarea
                required
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your theories, power-scaling breakdown, character analysis, or question for fellow otaku..."
                className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white placeholder-[#A3C2AE]/50 outline-none resize-none"
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
                Post Thread
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
