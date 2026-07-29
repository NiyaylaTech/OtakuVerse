import React from 'react';

interface ProgramsViewProps {
  onNavigate: (path: string) => void;
}

export const ProgramsView: React.FC<ProgramsViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Banner */}
      <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-8 sm:p-12 text-center space-y-4 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#25663E]/20 rounded-full blur-3xl pointer-events-none" />
        <span className="inline-block px-3 py-1 rounded-full bg-[#25663E] border border-[#389B5F] text-[#C5A059] text-xs font-mono font-bold tracking-widest uppercase">
          知恵 • ANIME COMMUNITY PLATFORM
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-white tracking-wide uppercase">
          Community <span className="text-[#389B5F]">Hub</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#A3C2AE] max-w-2xl mx-auto leading-relaxed">
          Connect with anime fans from around the world through discussions, reviews, community events, challenges, clubs, and rankings.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/discussions')}
            className="px-5 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] shadow-lg transition-all cursor-pointer"
          >
            💬 Explore Discussions
          </button>
          <button
            onClick={() => onNavigate('/reviews')}
            className="px-5 py-2.5 bg-[#0E1410] hover:bg-[#141C17] text-white font-bold text-xs rounded-xl border border-[#C5A059] transition-all cursor-pointer"
          >
            ⭐ Member Reviews
          </button>
        </div>
      </div>

      {/* Six Interactive Community Cards Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-serif font-bold text-2xl text-white">Participate & Discover</h2>
          <p className="text-xs text-[#A3C2AE]">Explore key interactive spaces across OtakuVerse.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0E1410] border border-[#23382C] hover:border-[#389B5F] rounded-2xl p-6 space-y-4 transition-all shadow-md">
            <span className="inline-block px-2.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 text-[10px] font-mono font-bold">
              WEEKLY
            </span>
            <h3 className="font-serif font-bold text-lg text-white">Weekly Anime Challenge</h3>
            <p className="text-xs text-[#A3C2AE] leading-relaxed">
              Participate in weekly anime discussions, review prompts, character debates, and recommendation contests. Earn XP recognition!
            </p>
            <button
              onClick={() => onNavigate('/discussions')}
              className="w-full py-2 bg-[#141C17] hover:bg-[#25663E] text-[#A3C2AE] hover:text-white font-bold text-xs rounded-lg border border-[#23382C] transition-colors cursor-pointer"
            >
              Join Challenge ➔
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0E1410] border border-[#23382C] hover:border-[#C5A059] rounded-2xl p-6 space-y-4 transition-all shadow-md">
            <span className="inline-block px-2.5 py-0.5 rounded bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 text-[10px] font-mono font-bold">
              FEATURED
            </span>
            <h3 className="font-serif font-bold text-lg text-white">Featured Anime Reviews</h3>
            <p className="text-xs text-[#A3C2AE] leading-relaxed">
              Discover highest-rated and most insightful reviews written by OtakuVerse members and verified critics.
            </p>
            <button
              onClick={() => onNavigate('/reviews')}
              className="w-full py-2 bg-[#141C17] hover:bg-[#25663E] text-[#A3C2AE] hover:text-white font-bold text-xs rounded-lg border border-[#23382C] transition-colors cursor-pointer"
            >
              View Reviews ➔
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0E1410] border border-[#23382C] hover:border-[#389B5F] rounded-2xl p-6 space-y-4 transition-all shadow-md">
            <span className="inline-block px-2.5 py-0.5 rounded bg-[#25663E]/40 text-[#389B5F] border border-[#389B5F]/40 text-[10px] font-mono font-bold">
              SEASONAL
            </span>
            <h3 className="font-serif font-bold text-lg text-white">Seasonal Anime Threads</h3>
            <p className="text-xs text-[#A3C2AE] leading-relaxed">
              Follow currently airing anime with dedicated episode discussions, predictions, reactions, and spoiler-friendly chats.
            </p>
            <button
              onClick={() => onNavigate('/discussions')}
              className="w-full py-2 bg-[#141C17] hover:bg-[#25663E] text-[#A3C2AE] hover:text-white font-bold text-xs rounded-lg border border-[#23382C] transition-colors cursor-pointer"
            >
              Join Discussions ➔
            </button>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0E1410] border border-[#23382C] hover:border-[#389B5F] rounded-2xl p-6 space-y-4 transition-all shadow-md">
            <span className="inline-block px-2.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[10px] font-mono font-bold">
              CLUBS
            </span>
            <h3 className="font-serif font-bold text-lg text-white">Anime Clubs & Circles</h3>
            <p className="text-xs text-[#A3C2AE] leading-relaxed">
              Join communities based on your favorite genres: Shonen, Romance, Dark Fantasy, Mecha, or Manga Readers.
            </p>
            <button
              onClick={() => onNavigate('/discussions')}
              className="w-full py-2 bg-[#141C17] hover:bg-[#25663E] text-[#A3C2AE] hover:text-white font-bold text-xs rounded-lg border border-[#23382C] transition-colors cursor-pointer"
            >
              Explore Circles ➔
            </button>
          </div>

          {/* Card 5 */}
          <div className="bg-[#0E1410] border border-[#23382C] hover:border-[#C5A059] rounded-2xl p-6 space-y-4 transition-all shadow-md">
            <span className="inline-block px-2.5 py-0.5 rounded bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 text-[10px] font-mono font-bold">
              MY LIST
            </span>
            <h3 className="font-serif font-bold text-lg text-white">Watchlists & Progress</h3>
            <p className="text-xs text-[#A3C2AE] leading-relaxed">
              Keep track of every anime you watch. Organize Watching, Completed, Plan to Watch, and personal favorite collections.
            </p>
            <button
              onClick={() => onNavigate('/lists')}
              className="w-full py-2 bg-[#141C17] hover:bg-[#25663E] text-[#A3C2AE] hover:text-white font-bold text-xs rounded-lg border border-[#23382C] transition-colors cursor-pointer"
            >
              Manage My List ➔
            </button>
          </div>

          {/* Card 6 */}
          <div className="bg-[#0E1410] border border-[#23382C] hover:border-[#389B5F] rounded-2xl p-6 space-y-4 transition-all shadow-md">
            <span className="inline-block px-2.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 text-[10px] font-mono font-bold">
              RANKINGS
            </span>
            <h3 className="font-serif font-bold text-lg text-white">Community Rankings</h3>
            <p className="text-xs text-[#A3C2AE] leading-relaxed">
              Explore real-time community leaderboards curated by OtakuVerse member activity and score averages.
            </p>
            <button
              onClick={() => onNavigate('/rankings')}
              className="w-full py-2 bg-[#141C17] hover:bg-[#25663E] text-[#A3C2AE] hover:text-white font-bold text-xs rounded-lg border border-[#23382C] transition-colors cursor-pointer"
            >
              View Rankings ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
