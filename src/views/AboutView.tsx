import React from 'react';

interface AboutViewProps {
  onNavigate: (path: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-block px-3 py-1 rounded-full bg-[#25663E] border border-[#389B5F] text-[#C5A059] text-xs font-mono font-bold tracking-widest uppercase">
          The Team & Mission
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-white tracking-wide uppercase">
          Who We Are at <span className="text-[#389B5F]">Otaku</span><span className="text-[#C5A059]">Verse</span>
        </h1>
        <p className="text-sm sm:text-base text-[#A3C2AE] font-medium leading-relaxed">
          OtakuVerse is a global collective of analytical readers, professional critics, and lore researchers celebrating the artistry of sequential manga and modern animations.
        </p>
      </div>

      {/* Grid of Mission & Vision */}
      <div className="bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3 p-4 bg-[#060807] border border-[#23382C] rounded-xl">
            <h3 className="font-serif font-bold text-lg text-[#389B5F] flex items-center gap-2">
              <span>🌸</span> Our Mission
            </h3>
            <p className="text-xs text-[#A3C2AE] leading-relaxed">
              Our mission is to foster a safe, welcoming, and high-quality discussion space where otakus can transition from passive watchers to active reviewers. We prioritize analytical storytelling critiques over generic internet flame-wars.
            </p>
          </div>

          <div className="space-y-3 p-4 bg-[#060807] border border-[#23382C] rounded-xl">
            <h3 className="font-serif font-bold text-lg text-[#C5A059] flex items-center gap-2">
              <span>🌟</span> Our Vision
            </h3>
            <p className="text-xs text-[#A3C2AE] leading-relaxed">
              We envision a structured community environment where storytelling, lore, translation nuances, and animation aesthetics are analyzed and celebrated with the care of true literary criticism.
            </p>
          </div>

          <div className="space-y-3 p-4 bg-[#060807] border border-[#23382C] rounded-xl">
            <h3 className="font-serif font-bold text-lg text-[#389B5F] flex items-center gap-2">
              <span>🛡️</span> Why Choose OtakuVerse?
            </h3>
            <p className="text-xs text-[#A3C2AE] leading-relaxed">
              Unlike massive, unmoderated social platforms, OtakuVerse combines structured weekly community book clubs, character debate systems, and peer-reviewed essay workshops led by experienced editors.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-6 text-center space-y-1">
          <div className="font-serif font-black text-3xl text-[#389B5F]">5,000+</div>
          <div className="text-[11px] font-mono text-[#A3C2AE] uppercase font-bold">Active Members</div>
        </div>
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-6 text-center space-y-1">
          <div className="font-serif font-black text-3xl text-[#C5A059]">120+</div>
          <div className="text-[11px] font-mono text-[#A3C2AE] uppercase font-bold">Weekly Debates</div>
        </div>
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-6 text-center space-y-1">
          <div className="font-serif font-black text-3xl text-[#389B5F]">300+</div>
          <div className="text-[11px] font-mono text-[#A3C2AE] uppercase font-bold">Published Essays</div>
        </div>
        <div className="bg-[#0E1410] border border-[#23382C] rounded-xl p-6 text-center space-y-1">
          <div className="font-serif font-black text-3xl text-[#C5A059]">15+</div>
          <div className="text-[11px] font-mono text-[#A3C2AE] uppercase font-bold">Expert Mentors</div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="bg-[#0E1410] border border-[#389B5F] rounded-2xl p-8 text-center space-y-4">
        <h2 className="font-serif font-bold text-xl text-white">Join Our Growing Anime Circle</h2>
        <p className="text-xs text-[#A3C2AE] max-w-xl mx-auto">
          Create an account to start publishing critiques, saving watchlists, and participating in seasonal discussions.
        </p>
        <button
          onClick={() => onNavigate('/sign-up')}
          className="px-6 py-3 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl shadow-lg border border-[#389B5F] transition-all cursor-pointer"
        >
          Create Free Account ➔
        </button>
      </div>
    </div>
  );
};
