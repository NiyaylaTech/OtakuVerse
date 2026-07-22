import React, { useState, useEffect } from 'react';
import { AniListMedia, getPopularAnime, getPopularManga, cleanDescription } from '../services/anilist';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface ReviewsViewProps {
  onSelectMedia: (media: AniListMedia) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ onSelectMedia }) => {
  const [featuredTitles, setFeaturedTitles] = useState<AniListMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPopularAnime(1, 8)
      .then((res) => {
        setFeaturedTitles(res.media);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="border-b-2 border-[#23382C] pb-6 space-y-2">
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-white flex items-center gap-3">
          <span>⭐</span> OtakuVerse Critic Publications & Reviews
        </h1>
        <p className="text-sm text-[#A3C2AE]">
          In-depth analysis, scoring breakdowns, and reviews for top AniList anime and manga titles.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredTitles.map((item) => {
            const title = item.title.english || item.title.userPreferred || item.title.romaji;
            const score = item.averageScore ? (item.averageScore / 10).toFixed(1) : '9.5';
            const cover = item.coverImage?.large;

            return (
              <div
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className="bg-[#0E1410] border-2 border-[#23382C] hover:border-[#C5A059] rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(197,160,89,0.2)] cursor-pointer flex flex-col sm:flex-row gap-5 group"
              >
                <img
                  src={cover}
                  alt={title}
                  className="w-full sm:w-32 h-44 object-cover rounded-xl border border-[#C5A059]/40 flex-shrink-0"
                />
                <div className="flex-1 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded bg-[#25663E] text-white text-xs font-bold">
                        ★ {score} / 10 Score
                      </span>
                      <span className="text-[11px] text-[#A3C2AE] font-mono">
                        AniList Critic
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#C5A059] transition-colors line-clamp-1">
                      {title}
                    </h3>
                    <p className="text-xs text-[#A3C2AE] line-clamp-3 leading-relaxed mt-2 font-sans">
                      {cleanDescription(item.description)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#23382C] text-xs font-serif font-bold text-[#389B5F]">
                    <span>Read Full Critique ➔</span>
                    <span className="text-[#A3C2AE] font-sans font-normal text-[11px]">
                      {item.format} • {item.episodes ? `${item.episodes} eps` : 'Ongoing'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
