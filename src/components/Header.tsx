import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { label: '🏆 Rankings', path: '/rankings' },
    { label: '📚 My Lists', path: '/lists' },
    { label: '⭐ Reviews', path: '/reviews' },
    { label: '💬 Discussions', path: '/discussions' },
    { label: '👤 Profile', path: '/profile' },
  ];

  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
    setMobileMenuOpen(false);
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
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0E1410] hover:bg-[#141C17] border border-[#23382C] hover:border-[#389B5F] rounded-xl text-xs font-semibold text-[#A3C2AE] hover:text-white transition-all shadow-sm cursor-pointer"
            title="Search AniList (Cmd+K)"
          >
            <span className="text-base">🔍</span>
            <span className="hidden sm:inline font-sans">Search AniList...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#25663E]/40 border border-[#389B5F]/40 text-[#C5A059] rounded-md ml-1">
              ⌘K
            </kbd>
          </motion.button>

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

      {/* Mobile Drawer with smooth height & opacity slide transition */}
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
