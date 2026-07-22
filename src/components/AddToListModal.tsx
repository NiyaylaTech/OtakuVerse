import React, { useState } from 'react';
import { AniListMedia } from '../services/anilist';

interface AddToListModalProps {
  media: AniListMedia;
  isOpen: boolean;
  onClose: () => void;
  onSave: (listEntry: any) => void;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({ media, isOpen, onClose, onSave }) => {
  const isAnime = media.type === 'ANIME';
  const defaultStatus = isAnime ? 'Watching' : 'Reading';
  
  const [status, setStatus] = useState(defaultStatus);
  const [score, setScore] = useState(9);
  const [progress, setProgress] = useState(1);
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = {
      id: media.id,
      mediaId: media.id,
      title: media.title.english || media.title.userPreferred || media.title.romaji,
      cover: media.coverImage?.large || media.coverImage?.extraLarge,
      type: media.type,
      status,
      score,
      progress,
      maxProgress: isAnime ? (media.episodes || '?') : (media.chapters || '?'),
      notes,
      updatedAt: new Date().toISOString(),
    };

    onSave(entry);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0E1410] border-2 border-[#389B5F] rounded-2xl shadow-[0_0_40px_rgba(56,155,95,0.3)] p-6 space-y-5 animate-fade-in">
        
        <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
          <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
            <span>📚</span> Add to My Anime List
          </h3>
          <button onClick={onClose} className="text-[#A3C2AE] hover:text-white font-bold text-sm">
            ✕
          </button>
        </div>

        {savedSuccess ? (
          <div className="p-6 bg-[#25663E]/40 border border-[#389B5F] rounded-xl text-center space-y-2">
            <div className="text-3xl">🎉</div>
            <h4 className="font-serif font-bold text-white text-base">Saved to Your OtakuVerse List!</h4>
            <p className="text-xs text-[#A3C2AE]">You can view and manage all entries in "My Lists".</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                List Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white font-medium outline-none"
              >
                <option value={isAnime ? 'Watching' : 'Reading'}>{isAnime ? '📺 Watching' : '📖 Reading'}</option>
                <option value="Completed">✅ Completed</option>
                <option value="Plan to Watch">📌 Plan to {isAnime ? 'Watch' : 'Read'}</option>
                <option value="On Hold">⏸ On Hold</option>
                <option value="Dropped">🚫 Dropped</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                  Your Rating (1-10)
                </label>
                <select
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white font-medium outline-none"
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((s) => (
                    <option key={s} value={s}>
                      ★ {s}/10
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                  {isAnime ? 'Episodes Watched' : 'Chapters Read'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={isAnime ? (media.episodes || 9999) : (media.chapters || 9999)}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                Personal Notes / Key Memories (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Favorite character arc, soundtrack thoughts, or memory..."
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
                Save Entry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
