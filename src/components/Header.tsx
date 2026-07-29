import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Keyboard shortcut Cmd+K / Ctrl+K for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const navItems = [
    { label: '🏠 Home', path: '/' },
    { label: '🧭 Discovery', path: '/discovery' },
    { label: '🎌 Hub', path: '/programs' },
    { label: '🏆 Rankings', path: '/rankings' },
    { label: '📚 My Lists', path: '/lists' },
    { label: '⭐ Reviews', path: '/reviews' },
    { label: '💬 Discussions', path: '/discussions' },
    { label: 'ℹ️ About', path: '/about' },
    { label: '👤 Profile', path: '/profile' },
  ];

  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#060807]/95 backdrop-blur-md border-b-2 border-[#23382C] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between gap-4 lg:gap-8">
        
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => handleLinkClick('/', e)}
          className="flex items-center gap-3.5 group focus:outline-none flex-shrink-0"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#25663E] to-[#0E1410] border-2 border-[#C5A059] p-0.5 shadow-[0_0_15px_rgba(56,155,95,0.4)] group-hover:scale-105 transition-transform duration-300">
            <img
              src="/logo.jpg"
              alt="OtakuVerse Crane Emblem"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-extrabold text-lg sm:text-xl tracking-wider text-white">
              <span className="text-[#389B5F]">OTAKU</span>
              <span className="text-[#C5A059]">VERSE</span>
            </span>
            <span className="text-[10px] tracking-widest text-[#A3C2AE] uppercase font-mono">
              知恵 • ANILIST HUB
            </span>
          </div>
        </a>

        {/* Desktop Nav Links with layout animation indicator */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleLinkClick(item.path, e)}
                className="relative px-3.5 xl:px-4 py-2.5 rounded-xl text-xs xl:text-sm font-bold tracking-wide transition-colors duration-200 flex items-center gap-2 whitespace-nowrap group cursor-pointer"
              >
                {/* Active animated pill background */}
                {active && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-[#25663E] border border-[#389B5F] rounded-xl shadow-md shadow-emerald-950/50 z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Hover subtle background for non-active items */}
                {!active && (
                  <span className="absolute inset-0 rounded-xl bg-[#0E1410] border border-[#23382C] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0" />
                )}

                <span
                  className={`relative z-10 transition-colors duration-200 ${
                    active
                      ? 'text-white'
                      : 'text-[#A3C2AE] group-hover:text-white'
                  }`}
                >
                  {item.label}
                </span>
              </a>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          {/* Search Trigger Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 bg-[#0E1410] hover:bg-[#141C17] border border-[#23382C] hover:border-[#389B5F] rounded-xl text-xs font-semibold text-[#A3C2AE] hover:text-white transition-all shadow-sm cursor-pointer"
            title="Search AniList (Cmd+K)"
          >
            <span className="text-base">🔍</span>
            <span className="hidden sm:inline font-sans">Search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#25663E]/40 border border-[#389B5F]/40 text-[#C5A059] rounded-md ml-1">
              ⌘K
            </kbd>
          </motion.button>

          {/* User Auth Section (Desktop & Mobile header) */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-[#0E1410] hover:bg-[#141C17] border border-[#389B5F]/60 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-md"
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-7 h-7 rounded-full bg-[#25663E] object-cover border border-[#C5A059]"
                />
                <span className="hidden sm:inline font-semibold">{user.displayName || user.username}</span>
                <span className="text-[10px] bg-[#25663E] text-[#C5A059] px-1.5 py-0.5 rounded font-mono border border-[#389B5F]">
                  Lv.{user.animeLevel || 1}
                </span>
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-[#0E1410] border-2 border-[#23382C] rounded-2xl shadow-2xl py-2 z-50 divide-y divide-[#23382C]"
                  >
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                      <p className="text-[11px] text-[#A3C2AE] truncate">@{user.username}</p>
                    </div>

                    <div className="py-1">
                      <a
                        href="/profile"
                        onClick={(e) => handleLinkClick('/profile', e)}
                        className="block px-4 py-2 text-xs text-[#A3C2AE] hover:text-white hover:bg-[#25663E]/30 transition-colors cursor-pointer"
                      >
                        👤 View Profile
                      </a>
                      <a
                        href="/lists"
                        onClick={(e) => handleLinkClick('/lists', e)}
                        className="block px-4 py-2 text-xs text-[#A3C2AE] hover:text-white hover:bg-[#25663E]/30 transition-colors cursor-pointer"
                      >
                        📚 My Anime List
                      </a>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        🚪 Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={(e) => handleLinkClick('/sign-in', e)}
                className="px-3.5 py-2 text-xs font-bold text-[#A3C2AE] hover:text-white border border-[#23382C] hover:border-[#389B5F] rounded-xl transition-all cursor-pointer bg-[#0E1410]"
              >
                Sign In
              </button>
              <button
                onClick={(e) => handleLinkClick('/sign-up', e)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#25663E] to-[#389B5F] hover:from-[#2e7d4d] hover:to-[#41b06c] rounded-xl shadow-md transition-all cursor-pointer border border-[#389B5F]/50"
              >
                Create Account
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-[#0E1410] border border-[#23382C] text-[#A3C2AE] hover:text-white cursor-pointer transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <span className="text-xl inline-block transition-transform duration-200">
              {mobileMenuOpen ? '✕' : '☰'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="lg:hidden overflow-hidden bg-[#0E1410]/98 border-b-2 border-[#23382C] shadow-2xl"
          >
            <div className="px-6 py-6 space-y-2.5">
              {/* User badge in mobile menu if logged in */}
              {isAuthenticated && user && (
                <div className="p-3 mb-3 bg-[#060807] border border-[#23382C] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                      alt={user.username}
                      className="w-9 h-9 rounded-full bg-[#25663E] border border-[#C5A059]"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{user.displayName}</p>
                      <p className="text-[10px] text-[#A3C2AE]">@{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-2.5 py-1 text-xs font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-lg"
                  >
                    Log Out
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={(e) => handleLinkClick('/sign-in', e)}
                    className="py-2.5 text-center text-xs font-bold text-[#A3C2AE] bg-[#060807] border border-[#23382C] rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={(e) => handleLinkClick('/sign-up', e)}
                    className="py-2.5 text-center text-xs font-bold text-white bg-[#25663E] border border-[#389B5F] rounded-xl"
                  >
                    Create Account
                  </button>
                </div>
              )}

              {navItems.map((item, index) => {
                const active = isActive(item.path);
                return (
                  <motion.a
                    key={item.path}
                    href={item.path}
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.03 + 0.05 }}
                    onClick={(e) => handleLinkClick(item.path, e)}
                    className={`block px-5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center gap-3 ${
                      active
                        ? 'bg-[#25663E] text-white border border-[#389B5F] shadow-lg'
                        : 'text-[#A3C2AE] hover:text-white hover:bg-[#141C17] border border-transparent'
                    }`}
                  >
                    {item.label}
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
