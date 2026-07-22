import React, { useState, useEffect } from 'react';

interface ListEntry {
  id: number;
  mediaId: number;
  title: string;
  cover: string;
  type: string;
  status: string;
  score: number;
  progress: number;
  maxProgress: string | number;
  notes?: string;
  updatedAt: string;
}

interface ListsViewProps {
  onSelectMediaId: (id: number) => void;
}

export const ListsView: React.FC<ListsViewProps> = ({ onSelectMediaId }) => {
  const [entries, setEntries] = useState<ListEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All');

  const loadLists = () => {
    try {
      const stored = localStorage.getItem('otakuverse_user_lists');
      if (stored) {
        setEntries(JSON.parse(stored));
      } else {
        // Initial sample entry if empty
        const initial = [
          {
            id: 151807,
            mediaId: 151807,
            title: "Frieren: Beyond Journey's End",
            cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-m1gX3iwfA5m2.png',
            type: 'ANIME',
            status: 'Watching',
            score: 10,
            progress: 28,
            maxProgress: 28,
            notes: 'Masterpiece anime with incredible soundtrack and emotional depth.',
            updatedAt: new Date().toISOString(),
          },
        ];
        setEntries(initial);
        localStorage.setItem('otakuverse_user_lists', JSON.stringify(initial));
      }
    } catch (e) {
      console.error('Error loading lists', e);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = entries.filter((item) => item.id !== id);
    setEntries(updated);
    localStorage.setItem('otakuverse_user_lists', JSON.stringify(updated));
  };

  const tabs = ['All', 'Watching', 'Reading', 'Completed', 'Plan to Watch', 'On Hold', 'Dropped'];

  const filtered = activeTab === 'All' ? entries : entries.filter((e) => e.status === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b-2 border-[#23382C] pb-6 space-y-2">
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-white flex items-center gap-3">
          <span>📚</span> My OtakuVerse Anime & Manga List
        </h1>
        <p className="text-sm text-[#A3C2AE]">
          Personal library synced with your active watch progress and custom critic scores.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#23382C] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-[#25663E] text-white border border-[#389B5F] shadow-md'
                : 'bg-[#0E1410] text-[#A3C2AE] hover:text-white border border-[#23382C]'
            }`}
          >
            {tab} ({tab === 'All' ? entries.length : entries.filter((e) => e.status === tab).length})
          </button>
        ))}
      </div>

      {/* List Table / Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#0E1410] border border-[#23382C] rounded-2xl space-y-3 max-w-md mx-auto">
          <div className="text-4xl">📂</div>
          <h3 className="font-serif font-bold text-lg text-white">No Titles in {activeTab}</h3>
          <p className="text-xs text-[#A3C2AE]">
            Browse anime or manga titles and click "Add to Anime List" to populate your library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectMediaId(item.mediaId)}
              className="bg-[#0E1410] border-2 border-[#23382C] hover:border-[#389B5F] rounded-2xl p-4 flex gap-4 cursor-pointer transition-all hover:shadow-lg group relative"
            >
              <img
                src={item.cover}
                alt={item.title}
                className="w-24 h-36 object-cover rounded-xl border border-[#23382C] flex-shrink-0"
              />
              <div className="flex-1 space-y-2 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="px-2 py-0.5 rounded bg-[#25663E] text-white text-[10px] font-bold uppercase">
                      {item.status}
                    </span>
                    <span className="text-[#C5A059] font-bold text-xs">
                      ★ {item.score}/10
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-white group-hover:text-[#389B5F] transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#A3C2AE] font-mono mt-1">
                    Progress: {item.progress} / {item.maxProgress}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-[#A3C2AE]/80 line-clamp-2 italic mt-1 font-sans">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#23382C] text-[10px] text-[#A3C2AE]/60 font-mono">
                  <span>View Details ➔</span>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
