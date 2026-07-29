import React, { useState, useEffect } from 'react';
import { AniListMedia, getTrendingAnime } from '../services/anilist';
import { StartDiscussionModal } from '../components/StartDiscussionModal';
import { useAuth } from '../context/AuthContext';

interface DiscussionsViewProps {
  onSelectMedia: (media: AniListMedia) => void;
  onNavigate?: (path: string) => void;
}

interface DiscussionThread {
  id: string;
  author: string;
  authorAvatar?: string;
  authorLevel: string;
  title: string;
  preview: string;
  category: string;
  relatedAnime?: {
    id: number;
    title: string;
  };
  repliesCount: number;
  likesCount: number;
  timeAgo: string;
  isSpoiler?: boolean;
  participantAvatars: string[];
}

export const DiscussionsView: React.FC<DiscussionsViewProps> = ({ onSelectMedia, onNavigate }) => {
  const { user } = useAuth();
  const [activeMedia, setActiveMedia] = useState<AniListMedia[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Start discussion modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMediaForModal, setSelectedMediaForModal] = useState<AniListMedia | null>(null);

  // Dynamic threads list
  const [threads, setThreads] = useState<DiscussionThread[]>([
    {
      id: 'thread_1',
      author: 'Scholar_Kenji',
      authorAvatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=120&q=80',
      authorLevel: 'Level 42 Shadow Monarch',
      title: 'Power-Scaling Debate: Sung Jinwoo Shadow Monarch vs Gojo Satoru Infinity Domain',
      preview: 'Taking into account Jinwoo\'s dimensional army and infinite stamina vs Gojo\'s Limitless barrier and Six Eyes perception. How does Jinwoo overcome Infinity?',
      category: 'Power Scaling',
      relatedAnime: { id: 151807, title: 'Solo Leveling' },
      repliesCount: 342,
      likesCount: 189,
      timeAgo: '12m ago',
      isSpoiler: false,
      participantAvatars: ['S', 'E', 'C', 'M'],
    },
    {
      id: 'thread_2',
      author: 'Elven_Mage_99',
      authorAvatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&q=80',
      authorLevel: 'Level 35 Archmage',
      title: 'Frieren Season 2 Arc Breakdown: Adapting Macht of El Dorado & Golden Land',
      preview: 'The psychology of demons in Madhouse\'s upcoming adaptation is going to be legendary. Here is my deep dive on Macht\'s curse of turning everything to gold...',
      category: 'Theory & Spoilers',
      relatedAnime: { id: 154587, title: "Frieren: Beyond Journey's End" },
      repliesCount: 215,
      likesCount: 142,
      timeAgo: '45m ago',
      isSpoiler: true,
      participantAvatars: ['E', 'A', 'K'],
    },
    {
      id: 'thread_3',
      author: 'Calypse_Shield',
      authorAvatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=120&q=80',
      authorLevel: 'Level 28 Remnant Knight',
      title: 'Under the Oak Tree Chapter 110 Breakdown: Maxi and Riftan Reunion Analysis',
      preview: 'Maxi\'s magic progression at the World Tower is finally coming into play. Riftan\'s expression in the latest raw chapter says everything!',
      category: 'Manhwa Discussion',
      repliesCount: 168,
      likesCount: 95,
      timeAgo: '2h ago',
      isSpoiler: false,
      participantAvatars: ['C', 'R', 'L', 'M'],
    },
    {
      id: 'thread_4',
      author: 'Soundtrack_Geek',
      authorAvatar: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=120&q=80',
      authorLevel: 'Level 19 Composer',
      title: 'What is your absolute favorite anime orchestral composer of 2024-2026?',
      preview: 'Comparing Hiroyuki Sawano\'s battle beats vs Evan Call\'s emotional orchestral strings in Frieren vs Kevin Penkin\'s otherworldly soundscapes.',
      category: 'Music & Audio',
      repliesCount: 94,
      likesCount: 78,
      timeAgo: '4h ago',
      isSpoiler: false,
      participantAvatars: ['S', 'O', 'P'],
    },
    {
      id: 'thread_5',
      author: 'Otaku_Pioneer',
      authorAvatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80',
      authorLevel: 'Level 50 Guildmaster',
      title: 'Which Spring 2026 anime surprise hit surpassed all your expectations?',
      preview: 'I started watching with zero expectations and now it\'s my top contender for anime of the season. What hidden gem caught you off guard?',
      category: 'Recommendations',
      repliesCount: 128,
      likesCount: 110,
      timeAgo: '5h ago',
      isSpoiler: false,
      participantAvatars: ['O', 'T', 'A', 'K', 'U'],
    },
  ]);

  useEffect(() => {
    getTrendingAnime(1, 8).then((res) => setActiveMedia(res.media || []));
  }, []);

  const handleCreateNewThread = (newThreadObj: any) => {
    const formatted: DiscussionThread = {
      id: newThreadObj.id || `thread_${Date.now()}`,
      author: newThreadObj.author || user?.username || 'OtakuVerse Fan',
      authorAvatar: user?.avatarUrl || '',
      authorLevel: 'Level 1 Otaku Member',
      title: newThreadObj.topic || newThreadObj.title,
      preview: newThreadObj.body || 'New community discussion thread.',
      category: 'General Discussion',
      relatedAnime: selectedMediaForModal
        ? {
            id: selectedMediaForModal.id,
            title: selectedMediaForModal.title.english || selectedMediaForModal.title.romaji || 'Anime',
          }
        : undefined,
      repliesCount: 1,
      likesCount: 0,
      timeAgo: 'Just now',
      isSpoiler: false,
      participantAvatars: ['U'],
    };

    setThreads((prev) => [formatted, ...prev]);
  };

  const filteredThreads = threads.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || t.title.toLowerCase().includes(selectedTag.toLowerCase()) || t.category.toLowerCase().includes(selectedTag.toLowerCase());
    return matchesCat && matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* 1. COMMUNITY ACTIVITY HERO */}
      <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#23382C] pb-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25663E] text-white border border-[#389B5F] text-[10px] font-mono font-bold uppercase tracking-wider">
              <span>🟢</span> Live Community Hub
            </div>
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-white flex items-center gap-3">
              Join the Anime Conversation
            </h1>
            <p className="text-xs sm:text-sm text-[#A3C2AE]">
              Debate plot twists, power levels, character arcs, and episode theories with fellow otaku worldwide.
            </p>
          </div>

          {/* Action Button & Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <div className="bg-[#141C17] border border-[#23382C] px-4 py-2.5 rounded-2xl text-xs font-mono text-[#A3C2AE] space-y-0.5">
              <div className="text-white font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                1,842 Otakus Online
              </div>
              <div>412 Active Threads Today</div>
            </div>

            <button
              onClick={() => {
                if (activeMedia.length > 0) setSelectedMediaForModal(activeMedia[0]);
                setIsModalOpen(true);
              }}
              className="px-6 py-3.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-2xl border border-[#389B5F] shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>✍️</span> + Create Discussion
            </button>
          </div>
        </div>

        {/* Search Input & Trending Tags */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
          <div className="md:col-span-8 relative">
            <span className="absolute left-4 top-3.5 text-lg text-[#A3C2AE]">💬</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active discussions, theories, power-scaling debates..."
              className="w-full pl-12 pr-10 py-3 bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-2xl text-white placeholder-[#A3C2AE]/50 text-xs outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 px-2 py-1 bg-[#23382C] text-[#A3C2AE] hover:text-white text-[10px] font-bold rounded"
              >
                Clear
              </button>
            )}
          </div>

          <div className="md:col-span-4 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-mono text-[10px] text-[#A3C2AE] uppercase font-bold">Hot Tags:</span>
            {['PowerScaling', 'SoloLeveling', 'Frieren', 'Manhwa'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                  selectedTag === tag
                    ? 'bg-[#C5A059] text-black'
                    : 'bg-[#141C17] text-[#A3C2AE] border border-[#23382C] hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THREE-COLUMN COMMUNITY LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT SIDEBAR (3 cols) */}
        <div className="lg:col-span-3 space-y-6">

          {/* Discussion Categories */}
          <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-4 space-y-3 shadow-lg">
            <h3 className="font-serif font-bold text-sm text-white border-b border-[#23382C] pb-2.5 flex items-center gap-2">
              <span>🗂️</span> Discussion Topics
            </h3>

            <nav className="space-y-1 font-sans text-xs">
              {[
                { id: 'All', label: '🔥 All Active Threads' },
                { id: 'Power Scaling', label: '⚡ Power Scaling' },
                { id: 'Theory & Spoilers', label: '🔮 Theories & Spoilers' },
                { id: 'Manhwa Discussion', label: '📖 Manhwa & Webtoons' },
                { id: 'Music & Audio', label: '🎧 Music & OSTs' },
                { id: 'Recommendations', label: '❓ Recommendations' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#25663E] text-white font-bold border border-[#389B5F]'
                      : 'text-[#A3C2AE] hover:bg-[#141C17] hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Pick AniList Title for Thread */}
          <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-4 space-y-3 shadow-lg">
            <h3 className="font-serif font-bold text-sm text-white border-b border-[#23382C] pb-2.5 flex items-center gap-2">
              <span>📺</span> Discuss AniList Title
            </h3>
            <p className="text-[11px] text-[#A3C2AE]">
              Select a trending title below to launch a dedicated discussion thread:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {activeMedia.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMediaForModal(m);
                    setIsModalOpen(true);
                  }}
                  className="bg-[#141C17] border border-[#23382C] hover:border-[#C5A059] rounded-xl p-2 cursor-pointer text-center space-y-1 group transition-all"
                >
                  <img
                    src={m.coverImage?.medium || m.coverImage?.large || ''}
                    alt={m.title.english || 'Cover'}
                    className="w-full aspect-[2/3] object-cover rounded-lg"
                  />
                  <p className="font-serif font-bold text-[10px] text-white line-clamp-1 group-hover:text-[#C5A059]">
                    {m.title.english || m.title.romaji}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CENTER COLUMN: Discussion Feed (6 cols) */}
        <div className="lg:col-span-6 space-y-4">

          <div className="flex items-center justify-between border-b border-[#23382C] pb-3">
            <h2 className="font-serif font-bold text-xl text-white flex items-center gap-2">
              <span>🗣️</span> Community Feed ({filteredThreads.length})
            </h2>
            <span className="text-xs font-mono text-[#A3C2AE]">Sorted by Recent Activity</span>
          </div>

          {filteredThreads.length === 0 ? (
            <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-8 text-center space-y-3 text-xs text-[#A3C2AE]">
              <span className="text-3xl">💬</span>
              <p className="font-serif font-bold text-white text-base">No discussions found in this category.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setSelectedTag('');
                }}
                className="px-4 py-2 bg-[#25663E] text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-[#0E1410] border-2 border-[#23382C] hover:border-[#389B5F] rounded-2xl p-5 space-y-3 transition-all hover:shadow-xl group"
                >
                  {/* User Header */}
                  <div className="flex items-center justify-between text-xs text-[#A3C2AE]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#25663E] border border-[#389B5F] flex items-center justify-center font-bold text-white text-xs uppercase overflow-hidden">
                        {thread.authorAvatar ? (
                          <img src={thread.authorAvatar} alt={thread.author} className="w-full h-full object-cover" />
                        ) : (
                          thread.author.substring(0, 1)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{thread.author}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-[#141C17] text-[#C5A059] border border-[#23382C] font-mono">
                            {thread.authorLevel}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#A3C2AE]/70 font-mono">{thread.timeAgo}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded bg-[#25663E]/40 text-[#389B5F] border border-[#389B5F]/40 text-[10px] font-mono font-bold">
                      #{thread.category}
                    </span>
                  </div>

                  {/* Title & Preview */}
                  <div className="space-y-1.5">
                    {thread.isSpoiler && (
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold mr-2">
                        ⚠️ SPOILER THREAD
                      </span>
                    )}
                    <h3 className="font-serif font-bold text-base text-white group-hover:text-[#C5A059] transition-colors leading-snug">
                      {thread.title}
                    </h3>
                    <p className="text-xs text-[#A3C2AE] leading-relaxed line-clamp-2">
                      {thread.preview}
                    </p>
                  </div>

                  {/* Related Anime Chip */}
                  {thread.relatedAnime && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141C17] border border-[#23382C] text-[11px] font-mono text-[#A3C2AE]">
                      <span>📺 Linked Anime:</span>
                      <strong className="text-white">{thread.relatedAnime.title}</strong>
                    </div>
                  )}

                  {/* Footer Stats & Participant Stack */}
                  <div className="pt-3 border-t border-[#23382C] flex items-center justify-between text-xs font-mono text-[#A3C2AE]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 hover:text-white">
                        <span>💬</span> {thread.repliesCount} Replies
                      </span>
                      <span className="flex items-center gap-1 hover:text-amber-400">
                        <span>👍</span> {thread.likesCount}
                      </span>
                    </div>

                    {/* Participant Avatars Stack */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {thread.participantAvatars.map((initial, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full bg-[#25663E] border border-[#0E1410] text-[9px] font-bold text-white flex items-center justify-center uppercase"
                          >
                            {initial}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          if (thread.relatedAnime && onNavigate) {
                            onNavigate(`/anime/${thread.relatedAnime.id}`);
                          }
                        }}
                        className="px-3 py-1 bg-[#141C17] hover:bg-[#25663E] text-white font-bold text-[11px] rounded-lg border border-[#23382C] transition-colors cursor-pointer"
                      >
                        Join Debate ➔
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR (3 cols) */}
        <div className="lg:col-span-3 space-y-6">

          {/* Trending Debates Widget */}
          <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-4 space-y-3 shadow-lg">
            <h3 className="font-serif font-bold text-sm text-white border-b border-[#23382C] pb-2.5 flex items-center gap-2">
              <span>🔥</span> Trending Debates
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-[#141C17] border border-[#23382C] rounded-xl space-y-1 cursor-pointer hover:border-[#389B5F] transition-colors">
                <span className="text-[10px] text-[#C5A059] font-mono font-bold">142 Active Commenters</span>
                <p className="font-bold text-white line-clamp-1">Solo Leveling Shadow Monarch Powers</p>
              </div>

              <div className="p-2.5 bg-[#141C17] border border-[#23382C] rounded-xl space-y-1 cursor-pointer hover:border-[#389B5F] transition-colors">
                <span className="text-[10px] text-[#C5A059] font-mono font-bold">98 Active Commenters</span>
                <p className="font-bold text-white line-clamp-1">Frieren Golden Land Arc Animation</p>
              </div>

              <div className="p-2.5 bg-[#141C17] border border-[#23382C] rounded-xl space-y-1 cursor-pointer hover:border-[#389B5F] transition-colors">
                <span className="text-[10px] text-[#C5A059] font-mono font-bold">76 Active Commenters</span>
                <p className="font-bold text-white line-clamp-1">Demon Slayer Infinity Castle Movie Trilogy</p>
              </div>
            </div>
          </div>

          {/* Active Episode Discussions Quick Link */}
          <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-4 space-y-3 shadow-lg">
            <h3 className="font-serif font-bold text-sm text-white border-b border-[#23382C] pb-2.5 flex items-center gap-2">
              <span>📺</span> Episode Discussions
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div
                onClick={() => {
                  if (onNavigate) onNavigate('/anime/151807/season/1/episode/12/discussion');
                }}
                className="p-2.5 bg-[#141C17] border border-[#23382C] hover:border-[#389B5F] rounded-xl cursor-pointer text-white flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">Solo Leveling S1 E12</div>
                  <div className="text-[10px] text-[#A3C2AE]">Arise Command Debates</div>
                </div>
                <span className="text-[#389B5F]">➔</span>
              </div>

              <div
                onClick={() => {
                  if (onNavigate) onNavigate('/anime/154587/season/1/episode/28/discussion');
                }}
                className="p-2.5 bg-[#141C17] border border-[#23382C] hover:border-[#389B5F] rounded-xl cursor-pointer text-white flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">Frieren S1 E28</div>
                  <div className="text-[10px] text-[#A3C2AE]">First Class Mage Finale</div>
                </div>
                <span className="text-[#389B5F]">➔</span>
              </div>
            </div>
          </div>

          {/* Community Guidelines Banner */}
          <div className="p-4 bg-gradient-to-b from-[#25663E]/30 to-[#0E1410] border border-[#389B5F]/50 rounded-2xl space-y-2 text-xs">
            <h4 className="font-serif font-bold text-white flex items-center gap-1.5">
              <span>📜</span> Otaku Community Code
            </h4>
            <p className="text-[#A3C2AE] leading-relaxed text-[11px]">
              Keep debates respectful! Always tag spoilers for recent manga chapters or raw episodes.
            </p>
          </div>

        </div>

      </div>

      {/* Start Discussion Thread Modal */}
      {selectedMediaForModal && (
        <StartDiscussionModal
          media={selectedMediaForModal}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaveDiscussion={handleCreateNewThread}
          onNavigate={onNavigate}
        />
      )}

    </div>
  );
};
