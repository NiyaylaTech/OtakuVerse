import React, { useState, useEffect } from 'react';
import { AniListMedia } from './services/anilist';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';

import { HomeView } from './views/HomeView';
import { DiscoveryView } from './views/DiscoveryView';
import { AnimeDetailView } from './views/AnimeDetailView';
import { ReviewsView } from './views/ReviewsView';
import { DiscussionsView } from './views/DiscussionsView';
import { ListsView } from './views/ListsView';
import { RankingsView } from './views/RankingsView';
import { ProfileView } from './views/ProfileView';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Sync route state with window.location.pathname and popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMedia = (media: AniListMedia) => {
    const detailPath = `/anime/${media.id}`;
    navigateTo(detailPath);
  };

  const handleSelectMediaId = (id: number) => {
    const detailPath = `/anime/${id}`;
    navigateTo(detailPath);
  };

  // Determine view to render
  const renderView = () => {
    // Check if route matches /anime/:id or /manga/:id
    const animeMatch = currentPath.match(/^\/(anime|manga)\/(\d+)/);
    if (animeMatch) {
      const mediaId = animeMatch[2];
      return (
        <AnimeDetailView
          mediaId={mediaId}
          onSelectMedia={handleSelectMedia}
          onNavigate={navigateTo}
        />
      );
    }

    switch (currentPath) {
      case '/discovery':
        return <DiscoveryView onSelectMedia={handleSelectMedia} />;
      case '/rankings':
        return <RankingsView onSelectMedia={handleSelectMedia} />;
      case '/lists':
        return <ListsView onSelectMediaId={handleSelectMediaId} />;
      case '/reviews':
        return <ReviewsView onSelectMedia={handleSelectMedia} />;
      case '/discussions':
        return <DiscussionsView onSelectMedia={handleSelectMedia} />;
      case '/profile':
        return <ProfileView onNavigate={navigateTo} />;
      case '/':
      default:
        return <HomeView onSelectMedia={handleSelectMedia} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060807] text-white flex flex-col font-sans selection:bg-[#25663E] selection:text-white">
      {/* Header */}
      <Header
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectMedia={handleSelectMedia}
      />
    </div>
  );
}
