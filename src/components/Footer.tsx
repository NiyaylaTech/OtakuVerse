import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="mt-20 bg-[#060807] border-t-2 border-[#23382C] text-[#A3C2AE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25663E] border border-[#C5A059] flex items-center justify-center font-serif text-lg font-bold text-[#C5A059]">
              知
            </div>
            <span className="font-serif font-extrabold text-lg text-white">
              OTAKU<span className="text-[#C5A059]">VERSE</span>
            </span>
          </div>
          <p className="text-xs text-[#A3C2AE]/80 leading-relaxed font-sans">
            The premier discussion, review, and discovery hub powered directly by the official AniList GraphQL API.
          </p>
          <div className="text-[11px] font-mono text-[#389B5F]">
            API Status: <span className="text-emerald-400 font-bold">● Connected (graphql.anilist.co)</span>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div>
          <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase mb-3 text-[#C5A059]">
            Quick Explore
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="/" onClick={(e) => handleLinkClick('/', e)} className="hover:text-white transition-colors">
                🏠 Home Feed
              </a>
            </li>
            <li>
              <a href="/discovery" onClick={(e) => handleLinkClick('/discovery', e)} className="hover:text-white transition-colors">
                🧭 Discovery & Search
              </a>
            </li>
            <li>
              <a href="/rankings" onClick={(e) => handleLinkClick('/rankings', e)} className="hover:text-white transition-colors">
                🏆 Top Rankings
              </a>
            </li>
            <li>
              <a href="/lists" onClick={(e) => handleLinkClick('/lists', e)} className="hover:text-white transition-colors">
                📚 Member Anime Lists
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Community */}
        <div>
          <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase mb-3 text-[#C5A059]">
            Community
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="/reviews" onClick={(e) => handleLinkClick('/reviews', e)} className="hover:text-white transition-colors">
                ⭐ Community Reviews
              </a>
            </li>
            <li>
              <a href="/discussions" onClick={(e) => handleLinkClick('/discussions', e)} className="hover:text-white transition-colors">
                💬 Active Discussions
              </a>
            </li>
            <li>
              <a href="/programs" onClick={(e) => handleLinkClick('/programs', e)} className="hover:text-white transition-colors">
                🎌 Community Hub
              </a>
            </li>
            <li>
              <a href="/about" onClick={(e) => handleLinkClick('/about', e)} className="hover:text-white transition-colors">
                ℹ️ About OtakuVerse
              </a>
            </li>
            <li>
              <a href="/contact" onClick={(e) => handleLinkClick('/contact', e)} className="hover:text-white transition-colors">
                📬 Contact & Support
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Legal / Source */}
        <div>
          <h4 className="font-serif font-bold text-white text-sm tracking-wider uppercase mb-3 text-[#C5A059]">
            Data Source
          </h4>
          <p className="text-xs leading-relaxed text-[#A3C2AE]/80 mb-3">
            All anime and manga titles, images, descriptions, scores, and characters are sourced live from AniList GraphQL API.
          </p>
          <a
            href="https://anilist.co"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 py-1.5 bg-[#0E1410] border border-[#23382C] hover:border-[#389B5F] rounded text-xs text-[#389B5F] font-mono hover:text-white transition-colors"
          >
            Visit AniList.co ↗
          </a>
        </div>
      </div>

      <div className="border-t border-[#23382C] py-4 text-center text-xs text-[#A3C2AE]/60 font-mono">
        © 2026 OtakuVerse. Sumi-e Dark Anime Theme • Powered by AniList GraphQL
      </div>
    </footer>
  );
};
