import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProfileViewProps {
  onNavigate: (path: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#25663E]/30 border-2 border-[#C5A059] flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(197,160,89,0.3)]">
            ⛩️
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-white">
              OtakuVerse Member Profile
            </h2>
            <p className="text-sm text-[#A3C2AE] max-w-md mx-auto">
              Sign in or create an account to view your personalized anime stats, level progress, reviews, and watchlists.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-xs mx-auto">
            <button
              onClick={() => onNavigate('/sign-in')}
              className="py-3 px-6 bg-[#0E1410] hover:bg-[#141C17] text-white font-bold text-sm rounded-xl border border-[#389B5F] transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('/sign-up')}
              className="py-3 px-6 bg-gradient-to-r from-[#25663E] to-[#389B5F] hover:from-[#2e7d4d] hover:to-[#41b06c] text-white font-bold text-sm rounded-xl shadow-lg border border-[#389B5F]/50 transition-all cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Member';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Card */}
      <div className="bg-[#0E1410] border-2 border-[#C5A059] rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(197,160,89,0.2)] flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt={user.username}
            className="w-28 h-28 rounded-full border-2 border-[#C5A059] object-cover shadow-lg bg-[#25663E]"
          />
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded bg-[#25663E] border border-[#389B5F] text-[#C5A059] text-[10px] font-bold font-mono">
            LVL {user.animeLevel || 1}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="font-serif font-black text-2xl text-white">{user.displayName}</h2>
            <span className="px-2.5 py-0.5 rounded bg-[#25663E] text-[#C5A059] border border-[#389B5F] font-bold text-xs">
              👑 Otaku Member
            </span>
          </div>
          <p className="text-xs text-[#A3C2AE] font-mono">
            @{user.username} • {user.email} • {user.experiencePoints || 100} XP
          </p>
          <p className="text-xs text-[#A3C2AE]/80 max-w-xl">
            {user.bio || 'Anime & Manga Enthusiast in OtakuVerse.'}
          </p>
          <p className="text-[11px] text-[#A3C2AE]/60 font-mono">
            Joined OtakuVerse: {joinDate}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onNavigate('/lists')}
            className="px-5 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] transition-colors cursor-pointer text-center"
          >
            📚 View My Lists
          </button>
          <button
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            className="px-5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-xl border border-rose-800/40 transition-colors cursor-pointer text-center"
          >
            🚪 Log Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-4 text-center space-y-1">
          <span className="block text-2xl font-serif font-bold text-[#C5A059]">Active</span>
          <span className="text-[11px] text-[#A3C2AE] uppercase font-mono">Account Status</span>
        </div>
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-4 text-center space-y-1">
          <span className="block text-2xl font-serif font-bold text-[#389B5F]">{user.experiencePoints || 100}</span>
          <span className="text-[11px] text-[#A3C2AE] uppercase font-mono">Total XP</span>
        </div>
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-4 text-center space-y-1">
          <span className="block text-2xl font-serif font-bold text-white">Level {user.animeLevel || 1}</span>
          <span className="text-[11px] text-[#A3C2AE] uppercase font-mono">Guild Rank</span>
        </div>
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-4 text-center space-y-1">
          <span className="block text-2xl font-serif font-bold text-[#C5A059]">Verified</span>
          <span className="text-[11px] text-[#A3C2AE] uppercase font-mono">AniList Sync</span>
        </div>
      </div>
    </div>
  );
};
