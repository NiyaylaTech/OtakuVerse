import React from 'react';

interface ProfileViewProps {
  onNavigate: (path: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Card */}
      <div className="bg-[#0E1410] border-2 border-[#C5A059] rounded-2xl p-8 shadow-[0_0_40px_rgba(197,160,89,0.2)] flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <img
            src="https://picsum.photos/seed/otaku_user_avatar/200/200"
            alt="User Avatar"
            className="w-28 h-28 rounded-full border-2 border-[#C5A059] object-cover shadow-lg"
          />
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded bg-[#25663E] border border-[#389B5F] text-[#C5A059] text-[10px] font-bold font-mono">
            LVL 42
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="font-serif font-black text-2xl text-white">Grand_Otaku_Scholar</h2>
            <span className="px-2.5 py-0.5 rounded bg-[#25663E] text-white font-bold text-xs">
              👑 Rank #4 Senior Critic
            </span>
          </div>
          <p className="text-xs text-[#A3C2AE] font-mono">
            Anime Scholar • Manga Enthusiast • 14,850 XP
          </p>
          <p className="text-xs text-[#A3C2AE]/80 max-w-xl">
            Reviewing Dark Fantasy, Magic Systems, and Slice of Life anime. Synchronized with official AniList GraphQL database.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onNavigate('/lists')}
            className="px-5 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] transition-colors cursor-pointer"
          >
            📚 View My Lists
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-4 text-center space-y-1">
          <span className="block text-2xl font-serif font-bold text-[#C5A059]">142</span>
          <span className="text-[11px] text-[#A3C2AE] uppercase font-mono">Anime Completed</span>
        </div>
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-4 text-center space-y-1">
          <span className="block text-2xl font-serif font-bold text-[#389B5F]">89</span>
          <span className="text-[11px] text-[#A3C2AE] uppercase font-mono">Manga Read</span>
        </div>
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-4 text-center space-y-1">
          <span className="block text-2xl font-serif font-bold text-white">28</span>
          <span className="text-[11px] text-[#A3C2AE] uppercase font-mono">Reviews Written</span>
        </div>
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-4 text-center space-y-1">
          <span className="block text-2xl font-serif font-bold text-[#C5A059]">9.2</span>
          <span className="text-[11px] text-[#A3C2AE] uppercase font-mono">Mean Score</span>
        </div>
      </div>

    </div>
  );
};
