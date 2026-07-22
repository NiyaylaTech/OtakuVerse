import React, { useState, useEffect } from 'react';
import { AniListMedia, getTrendingAnime } from '../services/anilist';

interface DiscussionsViewProps {
  onSelectMedia: (media: AniListMedia) => void;
}

export const DiscussionsView: React.FC<DiscussionsViewProps> = ({ onSelectMedia }) => {
  const [activeMedia, setActiveMedia] = useState<AniListMedia[]>([]);

  useEffect(() => {
    getTrendingAnime(1, 6).then((res) => setActiveMedia(res.media));
  }, []);

  const sampleThreads = [
    {
      title: 'Power-Scaling Debate: Sung Jinwoo Shadow Monarch vs Gojo Satoru Infinity',
      category: 'Power Scaling',
      replies: 284,
      author: 'Scholar_Kenji',
      time: '12m ago',
    },
    {
      title: 'Frieren Season 2 Expectations: Adapting El Dorado & Macht Arc',
      category: 'Theory & Spoilers',
      replies: 192,
      author: 'Elven_Mage_99',
      time: '45m ago',
    },
    {
      title: 'Under the Oak Tree Chapter 110 Breakdown: Maxi and Riftan Reunion Analysis',
      category: 'Manhwa Discussion',
      replies: 145,
      author: 'Calypse_Shield',
      time: '2h ago',
    },
    {
      title: 'What is your favorite anime original soundtrack composer of 2024-2026?',
      category: 'Music & Audio',
      replies: 88,
      author: 'Soundtrack_Geek',
      time: '4h ago',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="border-b-2 border-[#23382C] pb-6 space-y-2">
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-white flex items-center gap-3">
          <span>💬</span> OtakuVerse Active Community Discussions
        </h1>
        <p className="text-sm text-[#A3C2AE]">
          Debate plot twists, power levels, and character arcs connected directly with live AniList media.
        </p>
      </div>

      {/* Featured Anime Threads Grid */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-xl text-white">Hot Topics Linked to AniList Titles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleThreads.map((thread, i) => (
            <div
              key={i}
              className="bg-[#0E1410] border-2 border-[#23382C] hover:border-[#389B5F] rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-[#25663E] text-white text-[11px] font-bold">
                  #{thread.category}
                </span>
                <span className="text-xs text-[#A3C2AE] font-mono">
                  💬 {thread.replies} Replies
                </span>
              </div>
              <h4 className="font-serif font-bold text-base text-white hover:text-[#C5A059] transition-colors">
                {thread.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-[#A3C2AE]/70 font-mono pt-2 border-t border-[#23382C]">
                <span>Started by {thread.author}</span>
                <span>{thread.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active AniList Titles to Discuss */}
      {activeMedia.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="font-serif font-bold text-xl text-white">Pick a Title to Start a Discussion Thread</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {activeMedia.map((m) => (
              <div
                key={m.id}
                onClick={() => onSelectMedia(m)}
                className="bg-[#0E1410] border border-[#23382C] hover:border-[#C5A059] rounded-xl p-3 cursor-pointer text-center space-y-2 group transition-all"
              >
                <img
                  src={m.coverImage?.large}
                  alt={m.title.english || 'Cover'}
                  className="w-full aspect-[2/3] object-cover rounded-lg"
                />
                <h5 className="font-serif font-bold text-xs text-white line-clamp-1 group-hover:text-[#C5A059]">
                  {m.title.english || m.title.romaji}
                </h5>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
