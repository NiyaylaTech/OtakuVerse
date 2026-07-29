import React, { useState, useEffect } from 'react';
import { AniListMedia } from './services/anilist';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { useAuth } from './context/AuthContext';

import { HomeView } from './views/HomeView';
import { DiscoveryView } from './views/DiscoveryView';
import { AnimeDetailView } from './views/AnimeDetailView';
import { ReviewsView } from './views/ReviewsView';
import { DiscussionsView } from './views/DiscussionsView';
import { ListsView } from './views/ListsView';
import { RankingsView } from './views/RankingsView';
import { ProfileView } from './views/ProfileView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { ProgramsView } from './views/ProgramsView';
import { SignInView } from './views/SignInView';
import { SignUpView } from './views/SignUpView';
import { EpisodeDiscussionView } from './views/EpisodeDiscussionView';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string>('/profile');

  // Sync route state with window.location.pathname and popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string, options?: { preserveRedirect?: boolean }) => {
    window.history.pushState({}, '', path);
    if (!options?.preserveRedirect && path !== '/sign-in' && path !== '/sign-up') {
      setRedirectPath(path);
    }
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
    // Show smooth loading state during initial session restoration
    if (isLoading) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#389B5F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-[#A3C2AE]">Authenticating OtakuVerse Session...</p>
        </div>
      );
    }

    // Check if route matches /anime/:anilistId/season/:seasonNumber/episode/:episodeNumber/discussion
    const epDiscussionMatch = currentPath.match(/^\/anime\/([^/]+)\/season\/([^/]+)\/episode\/([^/]+)\/discussion/);
    if (epDiscussionMatch) {
      const anilistId = Number(epDiscussionMatch[1]);
      const seasonNumber = Number(epDiscussionMatch[2]) || 1;
      const episodeNumber = Number(epDiscussionMatch[3]);

      return (
        <EpisodeDiscussionView
          anilistId={anilistId}
          seasonNumber={seasonNumber}
          episodeNumber={episodeNumber}
          onNavigate={navigateTo}
        />
      );
    }

    // Check if route matches /anime/:id or /manga/:id
    const animeMatch = currentPath.match(/^\/(anime|manga)\/([^/]+)/);
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

    // Normalize legacy .html paths if accessed directly
    const cleanPath = currentPath.replace(/\.html$/, '');

    switch (cleanPath) {
      case '/sign-in':
      case '/account':
        return <SignInView onNavigate={navigateTo} redirectPath={redirectPath} />;
      case '/sign-up':
        return <SignUpView onNavigate={navigateTo} redirectPath={redirectPath} />;
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
      case '/programs':
      case '/community':
        return <ProgramsView onNavigate={navigateTo} />;
      case '/about':
        return <AboutView onNavigate={navigateTo} />;
      case '/contact':
        return <ContactView onNavigate={navigateTo} />;
      case '/profile':
        if (!isAuthenticated) {
          return <SignInView onNavigate={navigateTo} redirectPath="/profile" />;
        }
        return <ProfileView onNavigate={navigateTo} />;
      case '/':
      case '/index':
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
