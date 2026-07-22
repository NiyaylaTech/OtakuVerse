/**
 * OtakuVerse Interactivity Script
 * Provides clean, lightweight JS enhancements:
 * - Mobile hamburger navigation drawer
 * - Active section tracking on scroll
 * - Dynamic interactive modal for programs
 * - Seamless accessible form submit feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     REDESIGNED MAIN NAVIGATION INTERACTIVITY LOGIC
     ========================================================================== */

  // 1. Mobile Menu Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenuWrapper = document.getElementById('navMenuWrapper');
  if (mobileMenuBtn && navMenuWrapper) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = navMenuWrapper.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Helper function to close all dropdowns
  function closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown-container').forEach(c => c.classList.remove('active'));
  }

  // 2. Dropdowns Handling (Notifs, Create, User Menu)
  const notifBtn = document.getElementById('navNotifBtn');
  const notifContainer = notifBtn?.closest('.nav-dropdown-container');

  const createBtn = document.getElementById('navCreateBtn');
  const createContainer = createBtn?.closest('.nav-dropdown-container');

  const avatarBtn = document.getElementById('navAvatarBtn');
  const userContainer = avatarBtn?.closest('.nav-dropdown-container');

  if (notifBtn && notifContainer) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = notifContainer.classList.contains('active');
      closeAllDropdowns();
      if (!isActive) notifContainer.classList.add('active');
    });
  }

  if (createBtn && createContainer) {
    createBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = createContainer.classList.contains('active');
      closeAllDropdowns();
      if (!isActive) createContainer.classList.add('active');
    });
  }

  if (avatarBtn && userContainer) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = userContainer.classList.contains('active');
      closeAllDropdowns();
      if (!isActive) userContainer.classList.add('active');
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown-container')) {
      closeAllDropdowns();
    }
  });

  // 3. Mark Notifications as Read
  const btnMarkRead = document.getElementById('btnMarkAllNotifsRead');
  if (btnMarkRead) {
    btnMarkRead.addEventListener('click', () => {
      const badge = document.getElementById('notifBadgeCount');
      if (badge) badge.style.display = 'none';
      document.querySelectorAll('.notif-item.unread').forEach(item => item.classList.remove('unread'));
    });
  }

  // 4. Auth State Demo Switcher (Logged In / Logged Out)
  let isLoggedInState = true;
  const navAuthLoggedOut = document.getElementById('navAuthLoggedOut');
  const navAuthLoggedIn = document.getElementById('navAuthLoggedIn');
  const btnToggleAuth = document.getElementById('btnToggleAuthState');
  const btnLogoutNav = document.getElementById('btnLogoutNav');

  function updateAuthStateUI(loggedIn) {
    isLoggedInState = loggedIn;
    if (navAuthLoggedOut && navAuthLoggedIn) {
      if (loggedIn) {
        navAuthLoggedOut.style.display = 'none';
        navAuthLoggedIn.style.display = 'block';
      } else {
        navAuthLoggedOut.style.display = 'flex';
        navAuthLoggedIn.style.display = 'none';
      }
    }
  }

  if (btnToggleAuth) {
    btnToggleAuth.addEventListener('click', () => {
      updateAuthStateUI(!isLoggedInState);
      closeAllDropdowns();
    });
  }

  if (btnLogoutNav) {
    btnLogoutNav.addEventListener('click', () => {
      updateAuthStateUI(false);
      closeAllDropdowns();
    });
  }

  // 5. Smart Natural-Language Search Modal Logic
  const searchTriggerBtn = document.getElementById('navSearchTrigger');
  const searchModalOverlay = document.getElementById('searchModalOverlay');
  const btnCloseSearchModal = document.getElementById('btnCloseSearchModal');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const globalSearchInput = document.getElementById('globalSearchInput');
  const searchResultsContainer = document.getElementById('searchResultsContainer');

  const searchDatabase = [
    { type: 'Anime', title: 'Frieren: Beyond Journey\'s End', desc: '★ 9.8 • Dark Fantasy, Melancholic Magic', img: 'https://picsum.photos/seed/frieren_poster/100/150', link: 'reviews.html?anime=frieren' },
    { type: 'Anime', title: 'Solo Leveling: Arise', desc: '★ 9.4 • Power Fantasy, Shadow Monarch', img: 'https://picsum.photos/seed/solo_poster/100/150', link: 'reviews.html?anime=sololeveling' },
    { type: 'Anime', title: 'Attack on Titan: Final Season', desc: '★ 9.9 • Dark Political Thriller, Titans', img: 'https://picsum.photos/seed/aot_poster/100/150', link: 'reviews.html?anime=aot' },
    { type: 'Anime', title: 'Death Note', desc: '★ 9.6 • Psychological Cat & Mouse Mind Games', img: 'https://picsum.photos/seed/deathnote_poster/100/150', link: 'discovery.html' },
    { type: 'Anime', title: 'Bocchi the Rock!', desc: '★ 9.3 • Social Anxiety Comedy & Music', img: 'https://picsum.photos/seed/bocchi_poster/100/150', link: 'discovery.html' },
    { type: 'Anime', title: 'Violet Evergarden', desc: '★ 9.8 • Emotional Tearjerker, Kyoto Animation', img: 'https://picsum.photos/seed/violet_poster/100/150', link: 'discovery.html' },
    { type: 'Character', title: 'Frieren the Slayer', desc: 'Immortal elven mage learning human empathy', img: 'https://picsum.photos/seed/frieren_char/100/100', link: 'reviews.html' },
    { type: 'Character', title: 'Sung Jinwoo', desc: 'Shadow Monarch with absolute shadow army', img: 'https://picsum.photos/seed/jinwoo_char/100/100', link: 'reviews.html' },
    { type: 'Character', title: 'Levi Ackerman', desc: 'Humanity\'s strongest soldier, Captain of Scout Regiment', img: 'https://picsum.photos/seed/levi_char/100/100', link: 'reviews.html' },
    { type: 'Review', title: 'Frieren Masterpiece Critique by Kenji', desc: 'Rated 9.6/10 • Detailed analysis of time & loss', img: 'https://picsum.photos/seed/frieren_banner/100/100', link: 'reviews.html' },
    { type: 'Review', title: 'Solo Leveling Kinetic Power Fantasy Review', desc: 'Rated 9.2/10 • Sawano soundtrack breakdown', img: 'https://picsum.photos/seed/solo_banner/100/100', link: 'reviews.html' },
    { type: 'User', title: 'Kenji_Grand_Scholar', desc: '👑 Rank #4 Top Critic • 14,850 XP', img: 'https://picsum.photos/seed/otaku_user_avatar/100/100', link: 'profile.html' },
    { type: 'User', title: 'Ren_Anime_Scholar', desc: '⭐ Level 19 Lore Master', img: 'https://picsum.photos/seed/user_ren/100/100', link: 'profile.html' },
    { type: 'Discussion', title: 'Jinwoo vs. Saitama Power-Scaling Bracket', desc: '💬 142 Active Replies • Community Debate', img: 'https://picsum.photos/seed/solo_banner/100/100', link: 'discussions.html' },
    { type: 'Club', title: 'Dark Fantasy & Horror Society', desc: '🎌 1,840 Members • Weekly Read-Alongs', img: 'https://picsum.photos/seed/aot_banner/100/100', link: 'programs.html' }
  ];

  function openSearchModal() {
    if (searchModalOverlay) {
      searchModalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (globalSearchInput) {
        globalSearchInput.focus();
        renderSearchResults(globalSearchInput.value);
      }
    }
  }

  function closeSearchModal() {
    if (searchModalOverlay) {
      searchModalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (searchTriggerBtn) searchTriggerBtn.addEventListener('click', openSearchModal);
  if (btnCloseSearchModal) btnCloseSearchModal.addEventListener('click', closeSearchModal);

  if (searchModalOverlay) {
    searchModalOverlay.addEventListener('click', (e) => {
      if (e.target === searchModalOverlay) closeSearchModal();
    });
  }

  if (btnClearSearch && globalSearchInput) {
    btnClearSearch.addEventListener('click', () => {
      globalSearchInput.value = '';
      renderSearchResults('');
      globalSearchInput.focus();
    });
  }

  // Keyboard shortcut listener (Cmd+K or Ctrl+K or Esc)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearchModal();
    }
    if (e.key === 'Escape' && searchModalOverlay?.classList.contains('active')) {
      closeSearchModal();
    }
  });

  // Render Search Results
  function renderSearchResults(query) {
    if (!searchResultsContainer) return;
    const q = query.toLowerCase().trim();

    if (!q) {
      searchResultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <p style="font-size: 0.95rem; font-weight: 700;">Start typing or select a natural prompt above!</p>
          <small>Search across 10,000+ Anime, Characters, Critiques, Users & Discussions</small>
        </div>
      `;
      return;
    }

    let filtered = searchDatabase.filter(item => {
      if (item.title.toLowerCase().includes(q)) return true;
      if (item.desc.toLowerCase().includes(q)) return true;
      if (item.type.toLowerCase().includes(q)) return true;

      // Smart Natural Language Query Interpretation
      if (q.includes('death note') && (item.title.includes('Death Note') || item.title.includes('Monster') || item.type === 'Review')) return true;
      if (q.includes('romance') && (item.desc.includes('Romance') || item.title.includes('Violet'))) return true;
      if (q.includes('dark fantasy') && (item.desc.includes('Dark Fantasy') || item.title.includes('Frieren') || item.title.includes('Titan'))) return true;
      if (q.includes('12 episodes') && (item.title.includes('Solo Leveling') || item.title.includes('Bocchi'))) return true;
      if (q.includes('beginners') && (item.type === 'Anime' || item.type === 'Review')) return true;

      return false;
    });

    if (filtered.length === 0) {
      searchResultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🌌</div>
          <p style="font-size: 0.95rem; font-weight: 700; color: var(--text);">No exact results found for "${query}"</p>
          <p style="font-size: 0.85rem; margin-top: 0.5rem;">Try searching broader keywords like <em>"Action"</em>, <em>"Frieren"</em>, <em>"Jinwoo"</em>, or <em>"Dark Fantasy"</em></p>
        </div>
      `;
      return;
    }

    // Group results by type
    const groups = {};
    filtered.forEach(item => {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });

    let html = '';
    for (let cat in groups) {
      html += `
        <div class="search-result-category">
          <span class="search-category-title">${cat}s (${groups[cat].length})</span>
          ${groups[cat].map(item => `
            <a href="${item.link}" class="search-result-item" onclick="document.getElementById('searchModalOverlay').classList.remove('active'); document.body.style.overflow=''">
              <img src="${item.img}" alt="${item.title}" class="search-result-img" referrerPolicy="no-referrer">
              <div class="search-result-info">
                <strong>${item.title}</strong>
                <p>${item.desc}</p>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }

    searchResultsContainer.innerHTML = html;
  }

  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });
  }

  // Click handler for prompt chips
  document.querySelectorAll('.search-prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (globalSearchInput) {
        globalSearchInput.value = q;
        renderSearchResults(q);
      }
    });
  });

  // --- 1. Mobile Menu Toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      });
    });
  }

  // --- 2. Multi-page Navigation Active State ---
  // Page-specific active states are statically defined in each HTML page's nav menus.
  // This section remains for any generic route-based tracking if needed.

  // --- 3. Interactive Programs Modal ---
  // Define metadata for each program to populate the modal dynamically
  const programDetails = {
    1: {
      title: "Manga & Manhwa Book Clubs",
      description: "Our core reading groups feature a structured way to experience and break down continuous storytelling. Members vote on titles monthly, followed by a daily schedule of read-along chapters. Every Friday evening, we open live text debate panels where we discuss thematic changes, visual design evolution, scanlation accuracy, and character motivations.",
      benefits: [
        "Interactive reading schedule to help you keep pace.",
        "Weekly host-moderated live chat events.",
        "Exclusive access to spoiler-free thread archives."
      ]
    },
    2: {
      title: "Character Analysis & Debates",
      description: "Character development is the heart of great anime. In this club, we break down character arcs, personality types, and archetype tropes. We hold structured weekly debates on competitive topics like 'Who would win in a fair tactical engagement?' or 'Who is the most compellingly written antagonist?' All discussions are backed by official lore constraints and debate templates.",
      benefits: [
        "Constructive debate brackets with clear guidelines.",
        "A welcoming environment focused on friendly analytical defense.",
        "A platform to practice rhetoric and structured presentation."
      ]
    },
    3: {
      title: "Reviewer Mentorship Program",
      description: "Do you want to write professional-grade reviews of manga, manhwa, or anime? Our Reviewer Mentorship Program pairs seasoned community editors with aspiring writers. You will learn the art of narrative pacing analysis, visual cinematography breakdown (for anime), panel-flow reading mechanics (for manga), and hook writing.",
      benefits: [
        "One-on-one editorial feedback on your review drafts.",
        "Guaranteed homepage featured showcase for graduates.",
        "Direct track to join the OtakuVerse moderation and editorial team."
      ]
    }
  };

  const modalOverlay = document.getElementById('programModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const learnMoreBtns = document.querySelectorAll('.btn-learn');

  if (modalOverlay && modalClose && modalTitle && modalBody) {
    // Open Modal and load relevant content
    learnMoreBtns.forEach(button => {
      button.addEventListener('click', () => {
        const programId = button.getAttribute('data-id');
        const info = programDetails[programId];

        if (info) {
          modalTitle.textContent = info.title;
          
          // Generate detailed HTML
          let listHtml = info.benefits.map(b => `<li>✓ ${b}</li>`).join('');
          modalBody.innerHTML = `
            <p style="margin-bottom: 1.25rem;">${info.description}</p>
            <h4 style="color: var(--text); font-weight: 700; margin-bottom: 0.5rem;">Key Program Perks:</h4>
            <ul style="list-style: none; padding-left: 0; display: flex; flex-direction: column; gap: 0.5rem; color: var(--text-muted);">
              ${listHtml}
            </ul>
          `;

          modalOverlay.style.display = 'flex';
          document.body.style.overflow = 'hidden'; // Stop background scrolling
          modalClose.focus(); // Set focus to close button for accessibility
        }
      });
    });

    // Close Modal functions
    const closeModal = () => {
      modalOverlay.style.display = 'none';
      document.body.style.overflow = ''; // Restore scrolling
    };

    modalClose.addEventListener('click', closeModal);
    
    // Close on clicking overlay background
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    // Close on ESC key press for accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
        closeModal();
      }
    });
  }

  // --- 4. Interactive Contact Form Submission ---
  const contactForm = document.getElementById('contactForm');
  const successToast = document.getElementById('successToast');

  if (contactForm && successToast) {
    contactForm.addEventListener('submit', (e) => {
      // Since action="#" and method="post" are set, we want to intercept
      // to display a beautiful modern single-page success notification!
      e.preventDefault();

      // Simple animation/transition for the submit button
      const submitBtn = contactForm.querySelector('.btn-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending message...";
      submitBtn.disabled = true;

      setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Reset the form fields
        contactForm.reset();

        // Show success toast with smooth entry
        successToast.style.display = 'flex';

        // Automatically hide success notification after 5 seconds
        setTimeout(() => {
          successToast.style.display = 'none';
        }, 5000);
      }, 800);
    });
  }

  // --- 5. Video Playback Controls (Canva Embed Integration) ---
  const heroVideoIframe = document.getElementById('heroVideoIframe');
  const btnPlayVideo = document.getElementById('btnPlayVideo');
  const btnPauseVideo = document.getElementById('btnPauseVideo');
  const btnReplayVideo = document.getElementById('btnReplayVideo');

  const baseEmbedUrl = 'https://www.canva.com/design/DAHPNzT1ys4/kX5HV8YzDawyWiG59aNfiQ/watch?embed';

  if (heroVideoIframe && btnPlayVideo && btnPauseVideo && btnReplayVideo) {
    // Play button triggers autoplay mode
    btnPlayVideo.addEventListener('click', () => {
      heroVideoIframe.src = `${baseEmbedUrl}&autoplay=1`;
      btnPlayVideo.classList.add('active');
      btnPauseVideo.classList.remove('active');
    });

    // Pause button reloads the iframe without the autoplay parameter, pausing the player state
    btnPauseVideo.addEventListener('click', () => {
      heroVideoIframe.src = baseEmbedUrl;
      btnPauseVideo.classList.add('active');
      btnPlayVideo.classList.remove('active');
    });

    // Replay button appends a unique cache-buster timestamp parameter to force Canva to replay from frame 1
    btnReplayVideo.addEventListener('click', () => {
      const timestamp = Date.now();
      heroVideoIframe.src = `${baseEmbedUrl}&autoplay=1&t=${timestamp}`;
      btnPlayVideo.classList.remove('active');
      btnPauseVideo.classList.remove('active');
    });
  }

  // --- 6. Discussions Hub Interactivity ---
  const videoGrid = document.getElementById('videoGrid');
  const activeConsole = document.getElementById('activeConsole');

  if (videoGrid && activeConsole) {
    // Select HTML elements inside Active Console
    const consoleTopicBadge = document.getElementById('consoleTopicBadge');
    const consoleTopicTitle = document.getElementById('consoleTopicTitle');
    const consoleTopicDesc = document.getElementById('consoleTopicDesc');
    const commentsFeed = document.getElementById('commentsFeed');
    const commentsCount = document.getElementById('commentsCount');
    const commentForm = document.getElementById('discussionCommentForm');
    const commentAuthor = document.getElementById('commentAuthor');
    const commentGenre = document.getElementById('commentGenre');
    const commentText = document.getElementById('commentText');

    // Sentiment counters
    const reactionKeys = ['hyped', 'mindblown', 'thoughtful', 'emotional', 'unconvinced'];
    const countElements = {
      hyped: document.getElementById('count-hyped'),
      mindblown: document.getElementById('count-mindblown'),
      thoughtful: document.getElementById('count-thoughtful'),
      emotional: document.getElementById('count-emotional'),
      unconvinced: document.getElementById('count-unconvinced')
    };

    // State Variables
    let currentActiveVideoId = 'vid-1';
    let chosenFeelingEmoji = '🔥'; // Default emoji selection

    // Comprehensive Video Metadata Map
    const videosMetadata = {
      'vid-1': {
        title: "Sung Jinwoo vs. Saitama: Deep-Power-Scaling Debate",
        desc: "Is Saitama's gag-level invincibility absolute, or can Jinwoo's infinite celestial Monarch army find a tactical loophole? Our debaters are clashing live right now!",
        badgeText: "Now Critiquing",
        badgeStyle: "var(--warning)",
        genre: "shonen",
        defaultSentiments: { hyped: 142, mindblown: 88, thoughtful: 67, emotional: 12, unconvinced: 31 },
        defaultComments: [
          {
            id: 'c-1-1',
            author: 'Kenji S.',
            genre: 'Shonen',
            feeling: '🔥',
            text: 'If we go by the Webtoon EOS Jinwoo, he is basically a primordial deity. But Saitama is structurally a parody/gag character, so standard power scales break down. Spectacular panel breakdown!',
            likes: 42,
            timestamp: '15 mins ago'
          },
          {
            id: 'c-1-2',
            author: 'Sora99',
            genre: 'Shonen',
            feeling: '🤔',
            text: 'People forget Jinwoo can summon shadows from formless concepts. Saitama is physically peerless, but how does he punch a shadow realm? This is the core debate right here.',
            likes: 19,
            timestamp: '9 mins ago'
          }
        ]
      },
      'vid-2': {
        title: "The Philosophy of Struggle: Berserk vs. Vinland Saga",
        desc: "We contrast Kentaro Miura's absolute ink masterpiece detailing deterministic struggle against Makoto Yukimura's peaceful, pacifistic redemption arc.",
        badgeText: "Recorded Stream",
        badgeStyle: "var(--secondary)",
        genre: "seinen",
        defaultSentiments: { hyped: 41, mindblown: 154, thoughtful: 110, emotional: 95, unconvinced: 4 },
        defaultComments: [
          {
            id: 'c-2-1',
            author: 'Aria M.',
            genre: 'Seinen',
            feeling: '😢',
            text: 'The absolute contrast between Guts who fights determinism with raw rage and Thorfinn who walks away to build a land without swords is emotionally stunning. Tears every single time.',
            likes: 73,
            timestamp: '1 hour ago'
          },
          {
            id: 'c-2-2',
            author: 'VoidKnight',
            genre: 'Seinen',
            feeling: '🤯',
            text: 'Miura\'s ink pacing during the Golden Age arc remains unmatched. Pacing analysis regarding his panel framing was incredibly detailed, thanks to the hosts!',
            likes: 31,
            timestamp: '32 mins ago'
          }
        ]
      },
      'vid-3': {
        title: "Is Story Pacing in Re:Zero Superior to Most Isekai?",
        desc: "An intensive look at psychological consequence mechanics and time-loops inside Re:Zero Season 3 relative to standard overpowered protagonist tropes.",
        badgeText: "Now Critiquing",
        badgeStyle: "var(--warning)",
        genre: "isekai",
        defaultSentiments: { hyped: 115, mindblown: 76, thoughtful: 59, emotional: 44, unconvinced: 18 },
        defaultComments: [
          {
            id: 'c-3-1',
            author: 'Haruto K.',
            genre: 'Isekai',
            feeling: '🤯',
            text: 'Subaru is easily one of the most masterfully written characters in Isekai. The psychological toll of Return by Death feels heavy. It breaks typical light novel tropes completely.',
            likes: 29,
            timestamp: '45 mins ago'
          },
          {
            id: 'c-3-2',
            author: 'EmiliaSimp',
            genre: 'Isekai',
            feeling: '🔥',
            text: 'Season 3 adaption is exceeding all expectations. The debate on whether greed-factors are justified is so fascinating!',
            likes: 12,
            timestamp: '12 mins ago'
          }
        ]
      },
      'vid-4': {
        title: "Why Frieren's Silent Panel Transitions Convey True Time",
        desc: "We analyze Frieren: Beyond Journey's End and how Yamada Kanehito manages transitions of seasons and centuries within quiet single panels.",
        badgeText: "Recorded Stream",
        badgeStyle: "var(--secondary)",
        genre: "fantasy",
        defaultSentiments: { hyped: 24, mindblown: 92, thoughtful: 188, emotional: 145, unconvinced: 2 },
        defaultComments: [
          {
            id: 'c-4-1',
            author: 'ZenManga',
            genre: 'Slice of Life',
            feeling: '🤔',
            text: 'Frieren\'s silence speaks louder than any battle cry. Pacing simple passage of years inside quiet pages of skies and flowers is pure genius.',
            likes: 54,
            timestamp: '2 hours ago'
          },
          {
            id: 'c-4-2',
            author: 'Aria M.',
            genre: 'Fantasy',
            feeling: '😢',
            text: 'The monologue on Himmel\'s influence gets me every time. This anime/manga teaches us to cherish micro-interactions before time flies.',
            likes: 38,
            timestamp: '1 hour ago'
          }
        ]
      }
    };

    // --- Core Interaction: Load Discussion Topic ---
    function loadVideoDiscussion(videoId) {
      currentActiveVideoId = videoId;
      const metadata = videosMetadata[videoId];

      if (!metadata) return;

      // 1. Update active border on the source debate card
      document.querySelectorAll('.debate-card').forEach(card => {
        if (card.getAttribute('data-video-id') === videoId) {
          card.style.borderColor = 'var(--accent)';
          card.style.boxShadow = '0px 0px 15px var(--accent)';
        } else {
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }
      });

      // 2. Update Console Content
      consoleTopicBadge.textContent = metadata.badgeText;
      consoleTopicBadge.style.backgroundColor = metadata.badgeStyle;
      consoleTopicTitle.textContent = metadata.title;
      consoleTopicDesc.textContent = metadata.desc;

      // 3. Load & Render Sentiment Counters
      let storedSentiments = localStorage.getItem(`sentiments-${videoId}`);
      let sentiments = storedSentiments ? JSON.parse(storedSentiments) : { ...metadata.defaultSentiments };

      reactionKeys.forEach(key => {
        if (countElements[key]) {
          countElements[key].textContent = sentiments[key] || 0;
        }
      });

      // Save to keep in sync if first load
      if (!storedSentiments) {
        localStorage.setItem(`sentiments-${videoId}`, JSON.stringify(sentiments));
      }

      // 4. Load & Render Comments List
      renderCommentsList();
    }

    // --- Helper: Render Comments Feed ---
    function renderCommentsList() {
      const metadata = videosMetadata[currentActiveVideoId];
      if (!metadata) return;

      let storedComments = localStorage.getItem(`comments-${currentActiveVideoId}`);
      let comments = storedComments ? JSON.parse(storedComments) : [...metadata.defaultComments];

      commentsCount.textContent = comments.length;
      commentsFeed.innerHTML = '';

      if (comments.length === 0) {
        commentsFeed.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-weight: bold; border: 1px dashed var(--text);">
            No reviews left yet for this topic. Be the first to share your stance below! 🌸
          </div>
        `;
        return;
      }

      comments.forEach(comment => {
        const card = document.createElement('article');
        card.className = 'comment-bubble';
        card.id = `comment-${comment.id}`;
        card.innerHTML = `
          <header class="comment-header">
            <div>
              <span class="comment-author">${escapeHTML(comment.author)}</span>
              <span class="comment-genre-pill" style="margin-left: 0.5rem;">${comment.genre}</span>
            </div>
            <span class="comment-feeling">Feeling: ${comment.feeling}</span>
          </header>
          <p class="comment-text-content">${escapeHTML(comment.text)}</p>
          <footer class="comment-footer">
            <span class="comment-time">🕒 ${comment.timestamp || 'Just now'}</span>
            <div class="comment-actions">
              <button class="like-btn" data-comment-id="${comment.id}" aria-label="Like review">
                👍 <span>${comment.likes || 0}</span>
              </button>
              <button class="delete-btn" data-comment-id="${comment.id}" aria-label="Delete review">
                🗑️ Delete
              </button>
            </div>
          </footer>
        `;
        commentsFeed.appendChild(card);
      });

      // Save comments if first initialization
      if (!storedComments) {
        localStorage.setItem(`comments-${currentActiveVideoId}`, JSON.stringify(comments));
      }

      // Attach comment interactive actions (Likes & Deletions)
      attachCommentButtonListeners();
    }

    // --- Attach Comment Actions ---
    function attachCommentButtonListeners() {
      // 1. Liking
      commentsFeed.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const commentId = btn.getAttribute('data-comment-id');
          let storedComments = localStorage.getItem(`comments-${currentActiveVideoId}`);
          if (!storedComments) return;

          let comments = JSON.parse(storedComments);
          const idx = comments.findIndex(c => c.id === commentId);
          if (idx !== -1) {
            comments[idx].likes = (comments[idx].likes || 0) + 1;
            localStorage.setItem(`comments-${currentActiveVideoId}`, JSON.stringify(comments));
            renderCommentsList();
          }
        });
      });

      // 2. Deleting
      commentsFeed.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const commentId = btn.getAttribute('data-comment-id');
          if (confirm('Are you sure you want to delete this commentary review?')) {
            let storedComments = localStorage.getItem(`comments-${currentActiveVideoId}`);
            if (!storedComments) return;

            let comments = JSON.parse(storedComments);
            const filtered = comments.filter(c => c.id !== commentId);
            localStorage.setItem(`comments-${currentActiveVideoId}`, JSON.stringify(filtered));
            renderCommentsList();
          }
        });
      });
    }

    // --- HTML Escaper to prevent injection ---
    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, 
        tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag] || tag)
      );
    }

    // --- Click Event for Sentiment Buttons ---
    document.querySelectorAll('.sentiment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const reactionType = btn.getAttribute('data-reaction');
        let storedSentiments = localStorage.getItem(`sentiments-${currentActiveVideoId}`);
        if (!storedSentiments) return;

        let sentiments = JSON.parse(storedSentiments);
        sentiments[reactionType] = (sentiments[reactionType] || 0) + 1;
        localStorage.setItem(`sentiments-${currentActiveVideoId}`, JSON.stringify(sentiments));

        // Update UI instantly
        if (countElements[reactionType]) {
          countElements[reactionType].textContent = sentiments[reactionType];
        }

        // Mini playful effect
        btn.style.transform = 'scale(1.25)';
        setTimeout(() => { btn.style.transform = ''; }, 150);
      });
    });

    // --- Video Selector Click Handler ---
    document.querySelectorAll('.btn-join-debate').forEach(btn => {
      btn.addEventListener('click', () => {
        const videoId = btn.getAttribute('data-video-id');
        loadVideoDiscussion(videoId);

        // Scroll smoothly to active console for responsive user experience
        activeConsole.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    // --- Comment Form Submission ---
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameValue = commentAuthor.value.trim();
        const genreValue = commentGenre.value;
        const textValue = commentText.value.trim();

        if (!nameValue || !textValue) return;

        let storedComments = localStorage.getItem(`comments-${currentActiveVideoId}`);
        let comments = storedComments ? JSON.parse(storedComments) : [];

        const newComment = {
          id: 'c-user-' + Date.now(),
          author: nameValue,
          genre: genreValue,
          feeling: chosenFeelingEmoji,
          text: textValue,
          likes: 0,
          timestamp: 'Just now'
        };

        comments.push(newComment);
        localStorage.setItem(`comments-${currentActiveVideoId}`, JSON.stringify(comments));

        // Reset and Re-render
        commentText.value = '';
        renderCommentsList();

        // Display a brief submit focus ring on list
        commentsFeed.scrollTop = commentsFeed.scrollHeight;
      });
    }

    // --- Feeling Selector Option Clicks ---
    document.querySelectorAll('.feeling-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.feeling-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        chosenFeelingEmoji = opt.getAttribute('data-emoji');
      });
    });

    // --- Genre Filter Navigation ---
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const selectedGenre = btn.getAttribute('data-genre');
        document.querySelectorAll('.debate-card').forEach(card => {
          const cardGenre = card.getAttribute('data-genre');
          if (selectedGenre === 'all' || cardGenre === selectedGenre) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Initial load: prime first topic
    loadVideoDiscussion('vid-1');
  }

  // --- 7. Community Hub Interactive Engine ---
  const hubModal = document.getElementById('communityModal');
  const hubModalClose = document.getElementById('hubModalClose');
  const hubModalTitle = document.getElementById('hubModalTitle');
  const hubModalBody = document.getElementById('hubModalBody');
  const btnCreatePost = document.getElementById('btnCreatePost');

  // Open Hub Modal function
  const openHubModal = (title, htmlContent) => {
    if (hubModal && hubModalTitle && hubModalBody) {
      hubModalTitle.textContent = title;
      hubModalBody.innerHTML = htmlContent;
      hubModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (hubModalClose) hubModalClose.focus();
    }
  };

  const closeHubModal = () => {
    if (hubModal) {
      hubModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  if (hubModalClose) {
    hubModalClose.addEventListener('click', closeHubModal);
  }

  if (hubModal) {
    hubModal.addEventListener('click', (e) => {
      if (e.target === hubModal) closeHubModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hubModal && hubModal.style.display === 'flex') {
      closeHubModal();
    }
  });

  // Action Button Handler for Community Hub Cards & Features
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');

      if (action === 'challenge') {
        openHubModal("Weekly Anime Challenge #28", `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background-color: rgba(217, 38, 38, 0.15); border: 1px solid var(--secondary); padding: 1rem; border-radius: var(--radius-sm); color: #FFF;">
              <h4 style="color: #FF5555; margin-bottom: 0.35rem;">🔥 Current Prompt: "Most Compelling Antagonist Arc"</h4>
              <p style="font-size: 0.92rem; color: var(--text-muted);">Write a short 150-word critique or debate entry arguing why a specific anime villain has the best psychological writing.</p>
            </div>
            <form id="challengeSubmitForm" style="display: flex; flex-direction: column; gap: 0.85rem;">
              <input type="text" placeholder="Your Community Handle (e.g. Kenji_Reviews)" class="activity-input-field" required>
              <input type="text" placeholder="Anime Title & Villain Name" class="activity-input-field" required>
              <textarea placeholder="Write your challenge submission analysis..." class="activity-input-field" style="height: 110px; resize: vertical;" required></textarea>
              <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Entry & Earn Challenge Badge</button>
            </form>
          </div>
        `);

        setTimeout(() => {
          const form = document.getElementById('challengeSubmitForm');
          if (form) {
            form.addEventListener('submit', (e) => {
              e.preventDefault();
              alert("🎉 Challenge entry submitted successfully! You've been credited towards the Weekly Challenge Winner badge.");
              closeHubModal();
            });
          }
        }, 50);

      } else if (action === 'reviews') {
        openHubModal("Featured Community Reviews", `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <article style="background-color: var(--surface); border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-weight: 800; color: var(--accent);">Frieren: Beyond Journey's End</span>
                <span style="color: #FFD700; font-weight: 800;">★ 10/10</span>
              </div>
              <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem;">"Yamada Kanehito's subtle quietude captures time unlike any other fantasy work. A masterclass in narrative pacing."</p>
              <span style="font-size: 0.8rem; color: var(--primary-bright); font-weight: 700;">By Kenji_Reviews • 342 Likes</span>
            </article>

            <article style="background-color: var(--surface); border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-weight: 800; color: var(--accent);">Solo Leveling (Season 2)</span>
                <span style="color: #FFD700; font-weight: 800;">★ 9.5/10</span>
              </div>
              <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem;">"The shadow monarch awakening sequences match the webtoon's iconic high-contrast art style seamlessly."</p>
              <span style="font-size: 0.8rem; color: var(--primary-bright); font-weight: 700;">By Sora_Analyst • 218 Likes</span>
            </article>

            <a href="discussions.html" class="btn btn-primary" style="text-align: center;">View All Community Reviews</a>
          </div>
        `);

      } else if (action === 'seasonal') {
        openHubModal("Seasonal Anime Discussions", `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <p style="color: var(--text-muted); font-size: 0.95rem;">Join spoiler-protected episode threads for currently airing anime releases:</p>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <a href="discussions.html" style="background-color: var(--surface); border: 1px solid var(--border); padding: 0.85rem 1rem; border-radius: var(--radius-sm); text-decoration: none; color: #FFF; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 800;">Re:Zero Season 3 — Episode 8 Discussion</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">1,240 comments • Airing Sunday</div>
                </div>
                <span style="color: var(--primary-bright); font-weight: 800;">Join →</span>
              </a>

              <a href="discussions.html" style="background-color: var(--surface); border: 1px solid var(--border); padding: 0.85rem 1rem; border-radius: var(--radius-sm); text-decoration: none; color: #FFF; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 800;">Chainsaw Man Movie: Reze Arc Predictions</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">890 comments • Active Thread</div>
                </div>
                <span style="color: var(--primary-bright); font-weight: 800;">Join →</span>
              </a>
            </div>
          </div>
        `);

      } else if (action === 'clubs') {
        openHubModal("Explore Anime Clubs", `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <p style="color: var(--text-muted); font-size: 0.92rem;">Connect with specialized groups. Join to receive event notifications and group chat access!</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.85rem;" id="clubsModalList">
              <div style="background-color: var(--surface); border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius-sm); text-align: center;">
                <h4 style="color: var(--text); font-size: 0.98rem; margin-bottom: 0.25rem;">⚡ Shonen Club</h4>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem;">4,820 Members</p>
                <button class="btn btn-secondary club-join-btn" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; width: 100%;">Join Club</button>
              </div>

              <div style="background-color: var(--surface); border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius-sm); text-align: center;">
                <h4 style="color: var(--text); font-size: 0.98rem; margin-bottom: 0.25rem;">📖 Manga Readers</h4>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem;">3,910 Members</p>
                <button class="btn btn-secondary club-join-btn" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; width: 100%;">Join Club</button>
              </div>

              <div style="background-color: var(--surface); border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius-sm); text-align: center;">
                <h4 style="color: var(--text); font-size: 0.98rem; margin-bottom: 0.25rem;">🌸 Romance Club</h4>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem;">2,750 Members</p>
                <button class="btn btn-secondary club-join-btn" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; width: 100%;">Join Club</button>
              </div>

              <div style="background-color: var(--surface); border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius-sm); text-align: center;">
                <h4 style="color: var(--text); font-size: 0.98rem; margin-bottom: 0.25rem;">👁️ Horror Club</h4>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem;">1,840 Members</p>
                <button class="btn btn-secondary club-join-btn" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; width: 100%;">Join Club</button>
              </div>
            </div>
          </div>
        `);

        setTimeout(() => {
          document.querySelectorAll('.club-join-btn').forEach(jBtn => {
            jBtn.addEventListener('click', () => {
              jBtn.textContent = "✓ Joined";
              jBtn.style.backgroundColor = "var(--primary-bright)";
              jBtn.disabled = true;
            });
          });
        }, 50);

      } else if (action === 'mylist') {
        openHubModal("Anime Library Tracker", `
          <form id="animeLibraryForm" style="display: flex; flex-direction: column; gap: 1rem;">
            <p style="color: var(--text-muted); font-size: 0.92rem;">Add an anime to your personal library tracking list:</p>
            <input type="text" id="libAnimeName" placeholder="Anime Title (e.g. Frieren, Solo Leveling, Demon Slayer)" class="activity-input-field" required>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">List Status</label>
                <select id="libAnimeStatus" class="activity-input-field">
                  <option value="Watching">Watching</option>
                  <option value="Completed">Completed</option>
                  <option value="Plan to Watch">Plan to Watch</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Dropped">Dropped</option>
                  <option value="Favorites">Favorites</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">Score (1-10)</label>
                <input type="number" id="libAnimeScore" min="1" max="10" value="9" class="activity-input-field">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">Save to My List</button>
          </form>
        `);

        setTimeout(() => {
          const form = document.getElementById('animeLibraryForm');
          if (form) {
            form.addEventListener('submit', (e) => {
              e.preventDefault();
              const name = document.getElementById('libAnimeName').value;
              const status = document.getElementById('libAnimeStatus').value;
              alert(`✨ Added "${name}" as [${status}] in your OtakuVerse Anime Library!`);
              closeHubModal();
            });
          }
        }, 50);

      } else if (action === 'polls') {
        openHubModal("Community Poll: Best Opening of Summer 2026", `
          <form id="pollVoteForm" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background-color: var(--surface); border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius-sm);">
              <h4 style="color: var(--accent); margin-bottom: 0.75rem;">📊 Cast Your Vote</h4>
              
              <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                <label style="display: flex; align-items: center; gap: 0.65rem; color: #FFF; font-size: 0.92rem; cursor: pointer;">
                  <input type="radio" name="pollOption" value="Frieren OP2" checked> "Haru" - Yoasobi (Frieren OP2)
                </label>
                <label style="display: flex; align-items: center; gap: 0.65rem; color: #FFF; font-size: 0.92rem; cursor: pointer;">
                  <input type="radio" name="pollOption" value="Solo Leveling OP"> "Dark Aria" - Hiroyuki Sawano (Solo Leveling OP)
                </label>
                <label style="display: flex; align-items: center; gap: 0.65rem; color: #FFF; font-size: 0.92rem; cursor: pointer;">
                  <input type="radio" name="pollOption" value="Chainsaw Man OP"> "KICK BACK" - Kenshi Yonezu (Chainsaw Man)
                </label>
                <label style="display: flex; align-items: center; gap: 0.65rem; color: #FFF; font-size: 0.92rem; cursor: pointer;">
                  <input type="radio" name="pollOption" value="Jujutsu Kaisen OP"> "SPECIALZ" - King Gnu (Jujutsu Kaisen)
                </label>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Vote</button>
          </form>
        `);

        setTimeout(() => {
          const form = document.getElementById('pollVoteForm');
          if (form) {
            form.addEventListener('submit', (e) => {
              e.preventDefault();
              const selected = form.querySelector('input[name="pollOption"]:checked').value;
              alert(`🗳️ Vote recorded for "${selected}"! Thanks for participating in the Community Poll.`);
              closeHubModal();
            });
          }
        }, 50);

      } else if (action === 'guidelines') {
        openHubModal("OtakuVerse Community Guidelines", `
          <div style="display: flex; flex-direction: column; gap: 1rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.6;">
            <p>To keep OtakuVerse a welcoming, thoughtful, and analytical home for anime fans worldwide, all members agree to the following core tenets:</p>
            
            <ul style="padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; color: #FFF;">
              <li><strong>1. Respect Fellow Fans:</strong> Debate concepts, characters, and writing pacing constructively without personal attacks.</li>
              <li><strong>2. Spoilers Policy:</strong> Clearly tag spoilers in titles and content for anime aired within the last 14 days or untranslated manga chapters.</li>
              <li><strong>3. Encouraging Inclusivity:</strong> Welcome newcomers, casual viewers, and hardcore manga readers alike.</li>
              <li><strong>4. Quality Debates:</strong> Back power-scaling arguments with canon lore references and respectful reasoning.</li>
            </ul>

            <button class="btn btn-primary" onclick="alert('Thank you for upholding the OtakuVerse guidelines!'); document.getElementById('communityModal').style.display='none'; document.body.style.overflow='';" style="width: 100%; margin-top: 0.5rem;">I Pledge to Follow Guidelines</button>
          </div>
        `);
      }
    });
  });

  // Create Post Button Handler
  if (btnCreatePost) {
    btnCreatePost.addEventListener('click', () => {
      openHubModal("Create Community Post", `
        <form id="createCommunityPostForm" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">Post Category</label>
            <select id="postCategory" class="activity-input-field">
              <option value="Discussion">Anime Discussion</option>
              <option value="Review">Series Review</option>
              <option value="Recommendation">Recommendation List</option>
              <option value="Poll">Community Poll Proposal</option>
            </select>
          </div>
          <input type="text" id="postTitleInput" placeholder="Post Title or Discussion Topic" class="activity-input-field" required>
          <textarea id="postContentInput" placeholder="Write your post content, review breakdown, or debate prompt..." class="activity-input-field" style="height: 130px; resize: vertical;" required></textarea>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Publish to Community</button>
        </form>
      `);

      setTimeout(() => {
        const form = document.getElementById('createCommunityPostForm');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = document.getElementById('postCategory').value;
            const title = document.getElementById('postTitleInput').value;

            // Add to activity stream
            addActivityItem("YOU", `Created a new ${category}: "${title}"`, "Just now");
            alert(`🚀 Your post "${title}" has been published to OtakuVerse Community Hub!`);
            closeHubModal();
          });
        }
      }, 50);
    });
  }

  // --- 8. Community Rankings Leaderboard Switching ---
  const rankingsData = {
    'top-anime': [
      { rank: 1, title: 'Frieren: Beyond Journey\'s End', sub: 'Fantasy • Studio Madhouse', score: '9.38 ★' },
      { rank: 2, title: 'Fullmetal Alchemist: Brotherhood', sub: 'Shonen • Studio Bones', score: '9.10 ★' },
      { rank: 3, title: 'Steins;Gate', sub: 'Sci-Fi • White Fox', score: '9.08 ★' },
      { rank: 4, title: 'Hunter x Hunter (2011)', sub: 'Shonen • Madhouse', score: '9.04 ★' },
      { rank: 5, title: 'Attack on Titan (Season 3 P2)', sub: 'Action • Wit Studio', score: '9.01 ★' }
    ],
    'active-reviewers': [
      { rank: 1, title: 'Kenji_Reviews', sub: 'Master Reviewer • 142 Published Critiques', score: '1,420 Pts' },
      { rank: 2, title: 'Sora_Analyst', sub: 'Pacing & Cinematography Specialist', score: '1,180 Pts' },
      { rank: 3, title: 'ZenManga', sub: 'Manga & Scanlation Critic', score: '950 Pts' },
      { rank: 4, title: 'Aria_Anime', sub: 'Character Arc Analyst', score: '840 Pts' },
      { rank: 5, title: 'VoidKnight', sub: 'Seinen Lore Scholar', score: '720 Pts' }
    ],
    'trending-discussions': [
      { rank: 1, title: 'Sung Jinwoo vs Saitama Power Scaling Debate', sub: 'Shonen • 1,240 Replies', score: '🔥 High Heat' },
      { rank: 2, title: 'Re:Zero Season 3 Psychological Consequence Analysis', sub: 'Isekai • 890 Replies', score: '🔥 High Heat' },
      { rank: 3, title: 'Why Frieren\'s Panel Transitions Convey True Time', sub: 'Fantasy • 650 Replies', score: 'Trending' },
      { rank: 4, title: 'Berserk vs Vinland Saga: Philosophy of Struggle', sub: 'Seinen • 520 Replies', score: 'Trending' },
      { rank: 5, title: 'Chainsaw Man Movie: Reze Arc Pacing Expectations', sub: 'Action • 410 Replies', score: 'Active' }
    ],
    'helpful-members': [
      { rank: 1, title: 'Aria_M', sub: 'Founding Member • 340 Helpful Votes', score: '🏆 #1 Helper' },
      { rank: 2, title: 'Sora99', sub: 'Debate Moderator • 285 Helpful Votes', score: '🥈 #2 Helper' },
      { rank: 3, title: 'VoidKnight', sub: 'Lore Contributor • 210 Helpful Votes', score: '🥉 #3 Helper' },
      { rank: 4, title: 'EmiliaSimp', sub: 'Community Welcomer • 185 Helpful Votes', score: 'Helper' },
      { rank: 5, title: 'Haruto_K', sub: 'Library Curator • 160 Helpful Votes', score: 'Helper' }
    ],
    'popular-clubs': [
      { rank: 1, title: 'Shonen Club', sub: 'Weekly Episode Streams & Power Scaling Brackets', score: '4,820 Members' },
      { rank: 2, title: 'Manga Readers Community', sub: 'Daily Chapter Read-Alongs & Theories', score: '3,910 Members' },
      { rank: 3, title: 'Romance & Slice of Life Club', sub: 'Wholesome Discussions & Manga Reviews', score: '2,750 Members' },
      { rank: 4, title: 'Horror & Psychological Club', sub: 'Dark Fantasy & Thriller Critiques', score: '1,840 Members' },
      { rank: 5, title: 'Cosplay & Creative Studio', sub: 'Crafting Tips & Convention Guides', score: '1,520 Members' }
    ],
    'liked-reviews': [
      { rank: 1, title: 'Frieren\'s Panel Flow Mastery', sub: 'Reviewed by ZenManga', score: '342 Likes' },
      { rank: 2, title: 'Why Berserk\'s Golden Age Arc Remains Unmatched', sub: 'Reviewed by VoidKnight', score: '289 Likes' },
      { rank: 3, title: 'Solo Leveling Season 2 Webtoon Pacing Comparison', sub: 'Reviewed by Sora_Analyst', score: '218 Likes' },
      { rank: 4, title: 'Subaru\'s Character Arc in Re:Zero Season 3', sub: 'Reviewed by Kenji_Reviews', score: '195 Likes' },
      { rank: 5, title: 'Vinland Saga Pacifism Narrative Review', sub: 'Reviewed by Aria_Anime', score: '172 Likes' }
    ]
  };

  const rankingsContent = document.getElementById('rankingsContent');
  const rankTabBtns = document.querySelectorAll('.rank-tab-btn');

  function renderRankingsCategory(categoryKey) {
    if (!rankingsContent) return;

    const items = rankingsData[categoryKey] || rankingsData['top-anime'];
    rankingsContent.innerHTML = items.map(item => {
      let badgeClass = '';
      if (item.rank === 1) badgeClass = 'gold';
      else if (item.rank === 2) badgeClass = 'silver';
      else if (item.rank === 3) badgeClass = 'bronze';

      return `
        <div class="ranking-item">
          <div style="display: flex; align-items: center; flex-grow: 1;">
            <div class="rank-num-badge ${badgeClass}">${item.rank}</div>
            <div class="rank-item-info">
              <div class="rank-item-title">${escapeHTMLStr(item.title)}</div>
              <div class="rank-item-sub">${escapeHTMLStr(item.sub)}</div>
            </div>
          </div>
          <div class="rank-item-score">${item.score}</div>
        </div>
      `;
    }).join('');
  }

  function escapeHTMLStr(str) {
    return (str || '').replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
  }

  if (rankTabBtns.length > 0) {
    rankTabBtns.forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        rankTabBtns.forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        const key = tabBtn.getAttribute('data-rank-category');
        renderRankingsCategory(key);
      });
    });

    // Initial render
    renderRankingsCategory('top-anime');
  }

  // --- 9. Badges Interactive Detail Overlay ---
  const badgeCards = document.querySelectorAll('.badge-card');
  badgeCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('.badge-title').textContent;
      const desc = card.querySelector('p').textContent;
      const status = card.querySelector('.badge-status-tag').textContent;
      const icon = card.querySelector('.badge-icon-wrap').textContent;

      openHubModal(`Badge: ${title}`, `
        <div style="text-align: center; padding: 1rem;">
          <div style="font-size: 4rem; margin-bottom: 0.5rem;">${icon}</div>
          <h3 style="color: var(--text); font-family: var(--font-serif); margin-bottom: 0.5rem;">${title}</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.25rem;">${desc}</p>
          <div style="display: inline-block; padding: 0.5rem 1.25rem; border-radius: 20px; font-weight: 800; font-size: 0.9rem; background-color: rgba(56, 155, 95, 0.2); color: #4EFA8B; border: 1px solid var(--primary-bright);">
            Status: ${status}
          </div>
        </div>
      `);
    });
  });

  // --- 10. Live Community Activity Feed ---
  const activityStreamFeed = document.getElementById('activityStreamFeed');
  const quickActivityForm = document.getElementById('quickActivityForm');
  const quickActivityInput = document.getElementById('quickActivityInput');

  const initialActivities = [
    { author: 'Kenji_Reviews', text: 'published a new 10/10 review on Frieren: Beyond Journey\'s End!', time: '2 mins ago' },
    { author: 'Sora_Analyst', text: 'created a new discussion thread: "Will Jinwoo\'s Shadow Monarchs work in sci-fi worlds?"', time: '15 mins ago' },
    { author: 'Haruto_K', text: 'added Chainsaw Man Vol. 16 to Completed in Anime Library', time: '30 mins ago' },
    { author: 'ZenManga', text: 'won the Weekly Challenge #27: Best Panel Analysis!', time: '1 hour ago' },
    { author: 'Shonen Club', text: 'posted a new event: Jujutsu Kaisen Chapter Breakdown Livestream', time: '3 hours ago' }
  ];

  function renderActivityFeed() {
    if (!activityStreamFeed) return;

    let savedStream = localStorage.getItem('otakuverse-activity-feed');
    let items = savedStream ? JSON.parse(savedStream) : [...initialActivities];

    activityStreamFeed.innerHTML = items.map(item => `
      <div class="activity-item-card">
        <div class="activity-avatar">${(item.author || 'U').substring(0, 2).toUpperCase()}</div>
        <div class="activity-content">
          <div class="activity-meta"><span class="activity-user-name">${escapeHTMLStr(item.author)}</span></div>
          <div class="activity-text">${escapeHTMLStr(item.text)}</div>
          <div class="activity-time">🕒 ${escapeHTMLStr(item.time)}</div>
        </div>
      </div>
    `).join('');
  }

  function addActivityItem(author, text, time) {
    let savedStream = localStorage.getItem('otakuverse-activity-feed');
    let items = savedStream ? JSON.parse(savedStream) : [...initialActivities];
    items.unshift({ author, text, time });
    localStorage.setItem('otakuverse-activity-feed', JSON.stringify(items));
    renderActivityFeed();
  }

  if (quickActivityForm && quickActivityInput) {
    quickActivityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = quickActivityInput.value.trim();
      if (val) {
        addActivityItem("YOU", val, "Just now");
        quickActivityInput.value = '';
      }
    });
  }

  // Initial Activity render
  renderActivityFeed();

  // --- 11. Account Experience & Join Handlers ---
  const accountModal = document.getElementById('accountModal');
  const accModalClose = document.getElementById('accModalClose');
  const btnHeroSignup = document.getElementById('btnHeroSignup');
  const btnCtaSignup = document.getElementById('btnCtaSignup');
  const btnEditProfilePreview = document.getElementById('btnEditProfilePreview');
  const signupForm = document.getElementById('signupForm');

  const openAccountModal = () => {
    if (accountModal) {
      accountModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (accModalClose) accModalClose.focus();
    }
  };

  const closeAccountModal = () => {
    if (accountModal) {
      accountModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  if (accModalClose) accModalClose.addEventListener('click', closeAccountModal);
  if (btnHeroSignup) btnHeroSignup.addEventListener('click', openAccountModal);
  if (btnCtaSignup) btnCtaSignup.addEventListener('click', openAccountModal);
  if (btnEditProfilePreview) btnEditProfilePreview.addEventListener('click', openAccountModal);

  if (accountModal) {
    accountModal.addEventListener('click', (e) => {
      if (e.target === accountModal) closeAccountModal();
    });
  }

  // Load saved profile data if exists
  const savedProfile = localStorage.getItem('otakuverse-user-profile');
  if (savedProfile) {
    try {
      const data = JSON.parse(savedProfile);
      const displayUsernameText = document.getElementById('displayUsernameText');
      const profileAvatarText = document.getElementById('profileAvatarText');
      if (displayUsernameText && data.username) displayUsernameText.textContent = data.username;
      if (profileAvatarText && data.username) profileAvatarText.textContent = data.username.substring(0, 2).toUpperCase();
    } catch (e) {
      console.warn('Error loading saved profile:', e);
    }
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('signupUsername');
      const emailInput = document.getElementById('signupEmail');
      const genreInput = document.getElementById('signupGenre');

      const username = usernameInput ? usernameInput.value.trim() : 'Otaku_Member';
      const email = emailInput ? emailInput.value.trim() : '';
      const genre = genreInput ? genreInput.value : 'Shonen & Action';

      const profileData = {
        username,
        email,
        genre,
        joinedDate: 'Just now',
        level: 1,
        xp: 100
      };

      localStorage.setItem('otakuverse-user-profile', JSON.stringify(profileData));

      // Update UI elements
      const displayUsernameText = document.getElementById('displayUsernameText');
      const profileAvatarText = document.getElementById('profileAvatarText');
      if (displayUsernameText) displayUsernameText.textContent = username;
      if (profileAvatarText) profileAvatarText.textContent = username.substring(0, 2).toUpperCase();

      closeAccountModal();
      alert(`🎉 Welcome to OtakuVerse, ${username}! Your free account is created and your anime profile is now active.`);
    });
  }

  // Collection Category Tab Switcher
  const collectionData = {
    'watching': [
      { title: 'Solo Leveling (Season 2)', ep: 'Episode 4/12', rating: '★ 9.2', studio: 'A-1 Pictures' },
      { title: 'Re:Zero (Season 3)', ep: 'Episode 8/16', rating: '★ 9.0', studio: 'White Fox' },
      { title: 'Bleach: Thousand-Year Blood War', ep: 'Episode 22/26', rating: '★ 9.4', studio: 'Studio Pierrot' },
      { title: 'Chainsaw Man (Rewatch)', ep: 'Episode 6/12', rating: '★ 9.1', studio: 'MAPPA' },
      { title: 'Delicious in Dungeon', ep: 'Episode 18/24', rating: '★ 8.8', studio: 'Studio Trigger' },
      { title: 'Blue Lock (Season 2)', ep: 'Episode 5/14', rating: '★ 8.6', studio: '8bit' },
      { title: 'Shangri-La Frontier', ep: 'Episode 14/25', rating: '★ 8.7', studio: 'C2C' },
      { title: 'Wind Breaker', ep: 'Episode 10/12', rating: '★ 8.5', studio: 'CloverWorks' }
    ],
    'completed': [
      { title: 'Frieren: Beyond Journey\'s End', ep: '28 Episodes', rating: '★ 10/10', studio: 'Madhouse' },
      { title: 'Fullmetal Alchemist: Brotherhood', ep: '64 Episodes', rating: '★ 9.9/10', studio: 'Bones' },
      { title: 'Steins;Gate', ep: '24 Episodes', rating: '★ 9.8/10', studio: 'White Fox' },
      { title: 'Hunter x Hunter (2011)', ep: '148 Episodes', rating: '★ 9.7/10', studio: 'Madhouse' },
      { title: 'Attack on Titan (Final Season)', ep: '89 Episodes', rating: '★ 9.6/10', studio: 'MAPPA' },
      { title: 'Cyberpunk: Edgerunners', ep: '10 Episodes', rating: '★ 9.5/10', studio: 'Trigger' },
      { title: 'Jujutsu Kaisen (Season 2)', ep: '23 Episodes', rating: '★ 9.4/10', studio: 'MAPPA' },
      { title: 'Demon Slayer: Entertainment District', ep: '11 Episodes', rating: '★ 9.3/10', studio: 'Ufotable' }
    ],
    'plan': [
      { title: 'Monster', ep: '74 Episodes', rating: '★ 9.1', studio: 'Madhouse' },
      { title: 'Legend of the Galactic Heroes', ep: '110 Episodes', rating: '★ 9.0', studio: 'Artland' },
      { title: 'Code Geass: Lelouch of the Rebellion', ep: '50 Episodes', rating: '★ 8.9', studio: 'Sunrise' },
      { title: 'Mob Psycho 100 III', ep: '12 Episodes', rating: '★ 9.2', studio: 'Bones' },
      { title: 'Fate/Zero', ep: '25 Episodes', rating: '★ 8.8', studio: 'Ufotable' },
      { title: 'Neon Genesis Evangelion', ep: '26 Episodes', rating: '★ 8.9', studio: 'Gainax' }
    ],
    'onhold': [
      { title: 'One Piece', ep: 'Episode 1,020', rating: '★ 8.9', studio: 'Toei Animation' },
      { title: 'Detective Conan', ep: 'Episode 450', rating: '★ 8.2', studio: 'TMS Entertainment' }
    ],
    'dropped': [
      { title: 'Generic Isekai Title #42', ep: 'Episode 2/12', rating: '★ 4.0', studio: 'Various' }
    ],
    'favorites': [
      { title: 'Frieren: Beyond Journey\'s End', ep: 'Masterpiece', rating: '★ 10/10', studio: 'Madhouse' },
      { title: 'Fullmetal Alchemist: Brotherhood', ep: 'Masterpiece', rating: '★ 10/10', studio: 'Bones' },
      { title: 'Steins;Gate', ep: 'Masterpiece', rating: '★ 10/10', studio: 'White Fox' },
      { title: 'Hunter x Hunter', ep: 'Masterpiece', rating: '★ 9.9/10', studio: 'Madhouse' },
      { title: 'Attack on Titan', ep: 'Masterpiece', rating: '★ 9.8/10', studio: 'WIT / MAPPA' }
    ]
  };

  const collectionCategoryContent = document.getElementById('collectionCategoryContent');
  const collectionChips = document.querySelectorAll('.collection-chip');

  function renderCollectionCategory(catKey) {
    if (!collectionCategoryContent) return;
    const items = collectionData[catKey] || collectionData['watching'];

    collectionCategoryContent.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
        ${items.map(item => `
          <div style="background-color: rgba(0,0,0,0.35); border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 800; color: #FFF; font-size: 0.98rem; margin-bottom: 0.2rem;">${escapeHTMLStr(item.title)}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTMLStr(item.ep)} • ${escapeHTMLStr(item.studio)}</div>
            </div>
            <div style="color: var(--accent); font-weight: 800; font-family: var(--font-serif); font-size: 0.95rem;">${escapeHTMLStr(item.rating)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (collectionChips.length > 0) {
    collectionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        collectionChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.getAttribute('data-cat');
        renderCollectionCategory(cat);
      });
    });

    // Initial load
    renderCollectionCategory('watching');
  }
});

/* ==========================================================================
   OTAKUVERSE PREMIUM REVIEWS EXPERIENCE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reviewSelector = document.getElementById('reviewAnimeSelector');
  if (!reviewSelector) return; // Only execute if on reviews.html

  // Detailed Reviews Dataset
  const reviewsDatabase = {
    frieren: {
      title: "Frieren: Beyond Journey's End",
      japTitle: "葬送のフリーレン • Sōsō no Frieren",
      poster: "https://picsum.photos/seed/frieren_poster/400/600",
      banner: "https://picsum.photos/seed/frieren_banner/1600/800",
      genres: ["Dark Fantasy", "Adventure", "Drama", "Slice of Life", "Magic"],
      studio: "Madhouse",
      releaseYear: "2023 – 2024",
      episodes: "28 Episodes (Finished)",
      status: "Finished Airing",
      streaming: "Crunchyroll, Netflix, Prime",
      avgScore: "★ 9.8 / 10",
      totalReviews: "14,820 Reviews",
      favCount: "42,150 Users",
      criticVerdict: "Masterpiece of Temporal Fantasy",
      verdictScore: 9.6,
      recommendPct: "98% Recommend",
      story: "The grand demon king has already been vanquished. Himmel the Hero, Eisen the Dwarf, Heiter the Priest, and Frieren the Elven Mage return in triumph to the royal capital after a decade-long crusade. For Frieren, an immortal elf whose lifespan spans millennia, ten years felt like a fleeting blink in time. It is only when Himmel passes away from old age fifty years later that Frieren suffers a crushing epiphany: she spent ten years traveling with Himmel, yet knew virtually nothing about his human soul.",
      pros: [
        "✨ Cinematic Madhouse animation with extraordinary fluid particle effects",
        "🎼 Evan Call’s breathtaking orchestral soundtrack elevating every scene",
        "🧠 Masterful character development exploring grief, memory, and immortality",
        "📜 Subtle world building with rich historical continuity across centuries",
        "⚔️ Visually stunning fight choreography without reliance on fast cuts",
        "🌸 Cozy, contemplative pacing that lets quiet moments breathe"
      ],
      cons: [
        "⏳ Deliberate, slow-burn start might require patience for pure action fans",
        "❄️ Frieren’s early stoicism can initially feel detached before her emotions bloom",
        "⚡ First Class Mage Exam arc slightly slows down the intimate road-trip intimacy"
      ],
      favMomentTitle: "Frieren vs. Aura the Guillotine & The 'Obey Me' Spell",
      favMomentDesc: "A masterclass in quiet dominance where Frieren unleashes five hundred years of suppressed mana control.",
      favMomentSpoiler: "When Aura uses the Scales of Obedience believing her mana exceeds Frieren's, Frieren stops suppressing her aura. Frieren cold-headedly commands: 'Aura, kill yourself.' The chilling contrast between her gentle demeanor and her merciless title as 'Frieren the Slayer' is unforgettable!",
      favCharName: "Frieren the Slayer",
      favCharImg: "https://picsum.photos/seed/frieren_char/200/200",
      favCharReason: "Her journey is an elegant allegory for appreciating human relationships before time runs out. Her quirky obsession with useless magic spells adds warm comedy to her tragic depth.",
      quoteText: "\"The hero Himmel is dead, but his memory lives in every spell I cast and every human soul I seek to understand.\"",
      quoteAuthor: "— Frieren (Episode 12)",
      categoryScores: {
        Animation: 9.8, Story: 9.7, Characters: 9.9, WorldBuilding: 9.8, Music: 9.9,
        VoiceActing: 9.6, FightScenes: 9.5, Comedy: 8.8, Romance: 8.2, Villains: 9.1,
        EmotionalImpact: 10.0, Pacing: 9.4, Ending: 9.6, OpeningThemes: 9.8, EndingThemes: 9.9
      }
    },
    sololeveling: {
      title: "Solo Leveling: Arise from the Shadows",
      japTitle: "俺だけレベルアップな件 • Ore dake Level Up na Ken",
      poster: "https://picsum.photos/seed/solo_poster/400/600",
      banner: "https://picsum.photos/seed/solo_banner/1600/800",
      genres: ["Action", "Supernatural", "System", "Dark Fantasy", "Manhwa"],
      studio: "A-1 Pictures",
      releaseYear: "2024",
      episodes: "12 Episodes (Season 1)",
      status: "Season 2 Announced",
      streaming: "Crunchyroll",
      avgScore: "★ 9.4 / 10",
      totalReviews: "18,450 Reviews",
      favCount: "38,900 Users",
      criticVerdict: "Peak Power-Fantasy Kinetic Thrill",
      verdictScore: 9.2,
      recommendPct: "95% Recommend",
      story: "When mysterious gates opened connecting our world to dungeons filled with monsters, ordinary humans awakened powers to hunt them. Sung Jinwoo, known mocked as 'The Weakest Hunter of All Mankind', barely survives a horrific double dungeon raid in the Cartenon Temple. Upon waking in the hospital, he alone sees a glowing game system UI that makes him a 'Player' who can endlessly level up.",
      pros: [
        "🔥 Sawano Hiroyuki & TOMORROW X TOGETHER soundtrack with thunderous bass drops",
        "⚔️ Insanely satisfying power progression from zero to shadow monarch",
        "🎨 A-1 Pictures' incredible kinetic action direction and blue shadow flame effects",
        "👑 Iconic 'Arise' moment executed with bone-chilling goosebumps"
      ],
      cons: [
        "📉 Secondary side characters take a backseat to Jinwoo's solo spotlight",
        "🎯 Simple narrative structure focused heavily on combat over complex themes"
      ],
      favMomentTitle: "Sung Jinwoo Awakens Igris & Pronounces 'Arise'",
      favMomentDesc: "The climactic Red Gate boss battle where Jinwoo commands the blood-red knight commander's shadow soul.",
      favMomentSpoiler: "After failing twice to extract Igris's soul, Jinwoo delivers a speech appealing to Igris's warrior pride. The shadow erupts in dark purple flames as Igris kneels before his new monarch!",
      favCharName: "Sung Jinwoo (Shadow Monarch)",
      favCharImg: "https://picsum.photos/seed/jinwoo_char/200/200",
      favCharReason: "His cold determination to protect his sick mother and sister drives his transformation into the ultimate badass shadow commander.",
      quoteText: "\"If you are hunters... prepare to hunt. If you are prey... prepare to be consumed.\"",
      quoteAuthor: "— Sung Jinwoo (Episode 11)",
      categoryScores: {
        Animation: 9.6, Story: 8.8, Characters: 9.0, WorldBuilding: 8.9, Music: 9.8,
        VoiceActing: 9.5, FightScenes: 10.0, Comedy: 7.5, Romance: 6.8, Villains: 8.8,
        EmotionalImpact: 8.9, Pacing: 9.6, Ending: 9.2, OpeningThemes: 9.6, EndingThemes: 9.4
      }
    },
    aot: {
      title: "Attack on Titan: The Final Season",
      japTitle: "進撃の巨人 • Shingeki no Kyojin",
      poster: "https://picsum.photos/seed/aot_poster/400/600",
      banner: "https://picsum.photos/seed/aot_banner/1600/800",
      genres: ["Dark Fantasy", "Action", "Military", "Mystery", "Psychological"],
      studio: "MAPPA / WIT Studio",
      releaseYear: "2013 – 2023",
      episodes: "89 Episodes (Completed)",
      status: "Finished Airing",
      streaming: "Crunchyroll, Hulu",
      avgScore: "★ 9.9 / 10",
      totalReviews: "32,100 Reviews",
      favCount: "85,400 Users",
      criticVerdict: "A Generational Masterpiece of Moral Conflict",
      verdictScore: 9.8,
      recommendPct: "99% Recommend",
      story: "Humanity lived trapped behind three massive concentric walls to escape giant human-devouring Titans. When a Colossal Titan shatters Wall Maria, young Eren Yeager vows to eradicate every Titan from the earth. What begins as a survival thriller evolves into a complex global political drama questioning freedom, cycle of hatred, and moral ambiguity.",
      pros: [
        "🤯 Mind-blowing plot twists that reinterpret earlier seasons with terrifying brilliance",
        "🎵 Hiroyuki Sawano & Kohta Yamamoto's epic choral soundtrack",
        "⚔️ Unmatched aerial combat choreography using Omni-Directional Mobility Gear",
        "🎭 Profound exploration of propaganda, war, trauma, and freedom"
      ],
      cons: [
        "💔 Extremely intense emotional gut-punches and character deaths",
        "⌛ Divided release schedule for the Final Season confused some viewers"
      ],
      favMomentTitle: "Eren's Declaration of War in Liberio & The Rumbling Commencement",
      favMomentDesc: "Eren transforms directly under Willy Tybur's stage as the global alliance declares war.",
      favMomentSpoiler: "Eren manipulates past Titan memories through the Paths to force Grisha to execute the Reiss family, proving Eren was the architect of his own destiny all along!",
      favCharName: "Levi Ackerman",
      favCharImg: "https://picsum.photos/seed/levi_char/200/200",
      favCharReason: "Humanity's Strongest Soldier whose unwavering loyalty to Erwin and solemn burden of carrying fallen comrades makes him legendary.",
      quoteText: "\"If you win, you live. If you lose, you die. If you don't fight, you can't win!\"",
      quoteAuthor: "— Eren Yeager",
      categoryScores: {
        Animation: 9.7, Story: 10.0, Characters: 9.8, WorldBuilding: 10.0, Music: 10.0,
        VoiceActing: 9.9, FightScenes: 9.9, Comedy: 6.5, Romance: 7.2, Villains: 9.9,
        EmotionalImpact: 10.0, Pacing: 9.5, Ending: 9.3, OpeningThemes: 9.9, EndingThemes: 9.8
      }
    }
  };

  // Switch Active Review Function
  function loadReview(key) {
    const data = reviewsDatabase[key] || reviewsDatabase.frieren;

    // Update Banner & Poster
    const heroBg = document.getElementById('reviewHeroBg');
    if (heroBg) heroBg.style.backgroundImage = `linear-gradient(to bottom, rgba(6, 8, 7, 0.45) 0%, rgba(6, 8, 7, 0.95) 80%, rgba(6, 8, 7, 1) 100%), url('${data.banner}')`;

    const poster = document.getElementById('reviewPosterImg');
    if (poster) poster.src = data.poster;

    // Titles & Info
    document.getElementById('reviewMainTitle').textContent = data.title;
    document.getElementById('reviewJapTitle').textContent = data.japTitle;
    document.getElementById('reviewStudio').textContent = data.studio;
    document.getElementById('reviewReleaseYear').textContent = data.releaseYear;
    document.getElementById('reviewEpisodes').textContent = data.episodes;
    document.getElementById('reviewStatus').textContent = data.status;
    document.getElementById('reviewStreaming').textContent = data.streaming;

    // Stats
    document.getElementById('reviewAvgScore').textContent = data.avgScore;
    document.getElementById('reviewTotalCount').textContent = data.totalReviews;
    document.getElementById('reviewFavCount').textContent = data.favCount;
    document.getElementById('overallScoreNum').textContent = data.verdictScore.toFixed(1);

    // Story & Pros/Cons
    document.getElementById('reviewStoryText').textContent = data.story;

    const prosList = document.getElementById('reviewProsList');
    if (prosList) prosList.innerHTML = data.pros.map(p => `<li>${p}</li>`).join('');

    const consList = document.getElementById('reviewConsList');
    if (consList) consList.innerHTML = data.cons.map(c => `<li>${c}</li>`).join('');

    // Highlighted Moment & Character
    document.getElementById('favMomentTitle').textContent = data.favMomentTitle;
    document.getElementById('favCharName').textContent = data.favCharName;
    document.getElementById('favCharImg').src = data.favCharImg;
    document.getElementById('favCharReason').innerHTML = `<strong>Why Chosen:</strong> ${data.favCharReason}`;
    document.getElementById('favQuoteText').textContent = data.quoteText;
    document.getElementById('favQuoteAuthor').textContent = data.quoteAuthor;

    // Reset Sliders to default dataset scores
    const sliders = document.querySelectorAll('.category-slider');
    sliders.forEach(slider => {
      const cat = slider.getAttribute('data-cat');
      if (data.categoryScores[cat] !== undefined) {
        slider.value = data.categoryScores[cat];
        const valSpan = document.getElementById(`val${cat}`);
        if (valSpan) valSpan.textContent = data.categoryScores[cat].toFixed(1);
      }
    });

    updateCalculatedScore();
  }

  // Recalculate Weighted Category Score & Animate Ring
  function updateCalculatedScore() {
    const sliders = document.querySelectorAll('.category-slider');
    if (!sliders.length) return;

    let sum = 0;
    sliders.forEach(slider => {
      const cat = slider.getAttribute('data-cat');
      const val = parseFloat(slider.value);
      sum += val;
      const valSpan = document.getElementById(`val${cat}`);
      if (valSpan) valSpan.textContent = val.toFixed(1);
    });

    const avg = sum / sliders.length;
    const scoreNum = document.getElementById('overallScoreNum');
    if (scoreNum) scoreNum.textContent = avg.toFixed(1);

    // SVG Circumference for radius=52 is 2 * PI * 52 = 326.7
    const circleFill = document.getElementById('overallScoreCircleFill');
    if (circleFill) {
      const circumference = 326.7;
      const offset = circumference - (circumference * (avg / 10));
      circleFill.style.strokeDashoffset = offset;
    }
  }

  // Bind Slider Events
  const sliders = document.querySelectorAll('.category-slider');
  sliders.forEach(slider => {
    slider.addEventListener('input', updateCalculatedScore);
  });

  const resetBtn = document.getElementById('btnResetSliders');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (reviewSelector) loadReview(reviewSelector.value);
    });
  }

  if (reviewSelector) {
    reviewSelector.addEventListener('change', (e) => {
      loadReview(e.target.value);
    });
  }

  // Spoiler Reveal Logic
  const btnRevealFav = document.getElementById('btnRevealFavMoment');
  const favSpoilerContent = document.getElementById('favMomentSpoilerContent');
  if (btnRevealFav && favSpoilerContent) {
    btnRevealFav.addEventListener('click', () => {
      if (favSpoilerContent.style.display === 'none') {
        favSpoilerContent.style.display = 'block';
        btnRevealFav.textContent = '🙈 Hide Favorite Moment Spoiler';
      } else {
        favSpoilerContent.style.display = 'none';
        btnRevealFav.textContent = '👁️ Click to Reveal Favorite Moment Spoiler';
      }
    });
  }

  const btnToggleSpoilers = document.getElementById('btnToggleSpoilers');
  const spoilersDrawer = document.getElementById('spoilersDrawerContent');
  if (btnToggleSpoilers && spoilersDrawer) {
    btnToggleSpoilers.addEventListener('click', () => {
      if (spoilersDrawer.style.display === 'none') {
        spoilersDrawer.style.display = 'block';
        btnToggleSpoilers.textContent = 'Hide Spoilers 🙈';
      } else {
        spoilersDrawer.style.display = 'none';
        btnToggleSpoilers.textContent = 'Show Spoilers 👁️';
      }
    });
  }

  // Reaction Buttons Logic
  const reactionBtns = document.querySelectorAll('.reaction-btn');
  reactionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-reaction');
      const countSpan = btn.querySelector('.reaction-count');
      let count = parseInt(countSpan.textContent.replace(/,/g, ''), 10);

      if (btn.classList.contains('reacted')) {
        btn.classList.remove('reacted');
        count -= 1;
      } else {
        btn.classList.add('reacted');
        count += 1;
      }
      countSpan.textContent = count.toLocaleString();
    });
  });

  // Helpful Voting Buttons
  const btnHelpful = document.getElementById('btnVoteHelpful');
  const btnVeryHelpful = document.getElementById('btnVoteVeryHelpful');
  const btnNotHelpful = document.getElementById('btnVoteNotHelpful');

  if (btnHelpful) {
    btnHelpful.addEventListener('click', () => {
      const numSpan = document.getElementById('voteHelpfulNum');
      numSpan.textContent = parseInt(numSpan.textContent) + 1;
      showToastNotification("Thank you for voting this review as Helpful!");
    });
  }
  if (btnVeryHelpful) {
    btnVeryHelpful.addEventListener('click', () => {
      const numSpan = document.getElementById('voteVeryHelpfulNum');
      numSpan.textContent = parseInt(numSpan.textContent) + 1;
      showToastNotification("⭐ Thank you for rating this critique as Very Helpful!");
    });
  }
  if (btnNotHelpful) {
    btnNotHelpful.addEventListener('click', () => {
      const numSpan = document.getElementById('voteNotHelpfulNum');
      numSpan.textContent = parseInt(numSpan.textContent) + 1;
      showToastNotification("Feedback recorded. We'll refine featured critiques.");
    });
  }

  // Threaded Comments Initial Data
  const sampleComments = [
    {
      id: 1,
      author: "Ren_Anime_Scholar",
      level: "Level 19",
      badge: "👑 Top Critic",
      time: "2 hours ago",
      likes: 42,
      content: "The way Madhouse handles mana suppression in Frieren is genuinely sublime. It's rare for an anime to convey true power through quiet dignity rather than screaming explosions.",
      replies: [
        {
          author: "Aura_Fan_99",
          time: "1 hour ago",
          likes: 12,
          content: "Agreed! That scene with Aura gave me legitimate chills. Evan Call's soundtrack made the scales dropping feel ominous."
        }
      ]
    },
    {
      id: 2,
      author: "Manga_Reader_Sora",
      level: "Level 14",
      badge: "⭐ Lore Master",
      time: "5 hours ago",
      likes: 28,
      content: "10/10 review critique! I especially appreciate highlighting Flamme's historical impact. This anime completely redefined dark fantasy slice of life for me.",
      replies: []
    }
  ];

  function renderComments() {
    const container = document.getElementById('commentsThreadContainer');
    if (!container) return;

    container.innerHTML = sampleComments.map(comment => `
      <div class="comment-card-item">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <strong style="color: var(--text); font-size: 0.95rem;">${comment.author}</strong>
            <span style="font-size: 0.75rem; color: var(--accent); font-weight: 800;">${comment.level}</span>
            <span style="font-size: 0.75rem; background: rgba(197, 160, 89, 0.2); color: var(--accent); padding: 0.1rem 0.5rem; border-radius: 10px; border: 1px solid var(--accent);">${comment.badge}</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${comment.time}</span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.92rem; line-height: 1.6; margin-bottom: 0.75rem;">${comment.content}</p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <button class="btn-like-comment btn btn-secondary" style="padding: 0.25rem 0.65rem; font-size: 0.78rem;" data-id="${comment.id}">
            ❤️ Like (${comment.likes})
          </button>
          <button class="btn-reply-comment btn btn-secondary" style="padding: 0.25rem 0.65rem; font-size: 0.78rem;">
            💬 Reply
          </button>
        </div>

        ${comment.replies.map(reply => `
          <div class="nested-reply-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <strong style="color: var(--primary-bright); font-size: 0.88rem;">${reply.author}</strong>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${reply.time}</span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5;">${reply.content}</p>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  renderComments();

  // Handle Post Comment Form
  const commentForm = document.getElementById('reviewCommentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('commentInputText');
      if (!input.value.trim()) return;

      sampleComments.unshift({
        id: Date.now(),
        author: "Kenji_Master_Reviewer",
        level: "Level 24",
        badge: "👑 Grand Scholar",
        time: "Just now",
        likes: 1,
        content: input.value.trim(),
        replies: []
      });

      input.value = '';
      renderComments();
      const totalSpan = document.getElementById('totalCommentCount');
      if (totalSpan) totalSpan.textContent = parseInt(totalSpan.textContent) + 1;
      showToastNotification("🚀 Comment posted to Review Discussion thread!");
    });
  }

  // Sidebar Follow Reviewer
  const btnFollowReviewer = document.getElementById('btnFollowReviewerSidebar');
  if (btnFollowReviewer) {
    btnFollowReviewer.addEventListener('click', () => {
      const followersSpan = document.getElementById('reviewerFollowersSidebar');
      let count = parseInt(followersSpan.textContent.replace(/,/g, ''), 10);

      if (btnFollowReviewer.classList.contains('following')) {
        btnFollowReviewer.classList.remove('following');
        btnFollowReviewer.textContent = '+ Follow Reviewer';
        btnFollowReviewer.style.backgroundColor = 'var(--primary)';
        followersSpan.textContent = (count - 1).toLocaleString();
      } else {
        btnFollowReviewer.classList.add('following');
        btnFollowReviewer.textContent = '✓ Following Reviewer';
        btnFollowReviewer.style.backgroundColor = 'var(--accent)';
        btnFollowReviewer.style.color = '#000';
        followersSpan.textContent = (count + 1).toLocaleString();
        showToastNotification("You are now following Kenji_Master_Reviewer!");
      }
    });
  }

  // Toast Helper
  function showToastNotification(msg) {
    let toast = document.getElementById('otakuToastBox');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'otakuToastBox';
      toast.style.cssText = `
        position: fixed; bottom: 25px; right: 25px; z-index: 9999;
        background-color: var(--surface-card); border: 2px solid var(--accent);
        color: var(--text); padding: 1rem 1.5rem; border-radius: var(--radius-md);
        box-shadow: 0 10px 30px rgba(0,0,0,0.8); font-weight: 800; font-size: 0.95rem;
        transition: all 0.3s ease; transform: translateY(100px); opacity: 0;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 3200);
  }

  // Initial load
  loadReview('frieren');
});

/* ==========================================================================
   OTAKUVERSE ANIME DISCOVERY SYSTEM LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const discoveryContainer = document.getElementById('discoveryCardsContainer');
  if (!discoveryContainer) return; // Only execute if on discovery.html

  // Comprehensive Dataset
  const animeDiscoveryDataset = [
    {
      id: "frieren",
      title: "Frieren: Beyond Journey's End",
      poster: "https://picsum.photos/seed/frieren_poster/400/600",
      score: "★ 9.8",
      genres: ["Fantasy", "Adventure", "Drama", "Slice of Life"],
      moods: ["Emotional", "Relaxing", "Wholesome", "Epic"],
      episodes: "28 Episodes",
      epCategory: "13-24",
      studio: "Madhouse",
      decade: "2020s",
      streaming: "Crunchyroll",
      ratingNum: 9.8,
      hiddenGem: false,
      matchReason: "Matches 'Dark Fantasy' + High Emotional Impact + Masterpiece World Building",
      collection: ["trending", "soundtracks", "comfort", "community", "staff"]
    },
    {
      id: "sololeveling",
      title: "Solo Leveling: Arise",
      poster: "https://picsum.photos/seed/solo_poster/400/600",
      score: "★ 9.4",
      genres: ["Action", "Supernatural", "Fantasy"],
      moods: ["Epic", "Suspenseful", "Dark"],
      episodes: "12 Episodes",
      epCategory: "1-12",
      studio: "A-1 Pictures",
      decade: "2020s",
      streaming: "Crunchyroll",
      ratingNum: 9.4,
      hiddenGem: false,
      matchReason: "Matches 'Overpowered Lead' + Hype Sawano Soundtrack + Kinetic Battles",
      collection: ["trending", "action", "community"]
    },
    {
      id: "aot",
      title: "Attack on Titan",
      poster: "https://picsum.photos/seed/aot_poster/400/600",
      score: "★ 9.9",
      genres: ["Action", "Horror", "Mystery", "Psychological"],
      moods: ["Dark", "Suspenseful", "Epic", "Mind-Bending"],
      episodes: "89 Episodes",
      epCategory: "50+",
      studio: "MAPPA",
      decade: "2010s",
      streaming: "Crunchyroll",
      ratingNum: 9.9,
      hiddenGem: false,
      matchReason: "Matches 'Dark Fantasy' + Unpredictable Twists + High Stakes War",
      collection: ["trending", "action", "psychological", "community"]
    },
    {
      id: "deathnote",
      title: "Death Note",
      poster: "https://picsum.photos/seed/deathnote_poster/400/600",
      score: "★ 9.6",
      genres: ["Psychological", "Mystery", "Supernatural", "Thriller"],
      moods: ["Mind-Bending", "Suspenseful", "Dark"],
      episodes: "37 Episodes",
      epCategory: "25-50",
      studio: "Madhouse",
      decade: "2000s",
      streaming: "Netflix",
      ratingNum: 9.6,
      hiddenGem: false,
      matchReason: "Matches 'Cat & Mouse Mind Games' + High Intelligence Protagonist",
      collection: ["psychological", "community", "staff"]
    },
    {
      id: "bocchi",
      title: "Bocchi the Rock!",
      poster: "https://picsum.photos/seed/bocchi_poster/400/600",
      score: "★ 9.3",
      genres: ["Comedy", "Music", "Slice of Life"],
      moods: ["Funny", "Feel Good", "Relatable", "Wholesome"],
      episodes: "12 Episodes",
      epCategory: "1-12",
      studio: "CloverWorks",
      decade: "2020s",
      streaming: "Crunchyroll",
      ratingNum: 9.3,
      hiddenGem: true,
      matchReason: "Matches 'Social Anxiety Humor' + Creative Visual Direction + Fire Songs",
      collection: ["gems", "comfort", "soundtracks"]
    },
    {
      id: "oddtaxi",
      title: "Odd Taxi",
      poster: "https://picsum.photos/seed/oddtaxi_poster/400/600",
      score: "★ 9.2",
      genres: ["Mystery", "Drama", "Thriller"],
      moods: ["Mind-Bending", "Suspenseful", "Dark"],
      episodes: "13 Episodes",
      epCategory: "1-12",
      studio: "OLM",
      decade: "2020s",
      streaming: "Crunchyroll",
      ratingNum: 9.2,
      hiddenGem: true,
      matchReason: "Matches 'Masterclass Crime Noir' + Interconnected Dialogue Thriller",
      collection: ["gems", "psychological", "staff"]
    },
    {
      id: "violet",
      title: "Violet Evergarden",
      poster: "https://picsum.photos/seed/violet_poster/400/600",
      score: "★ 9.8",
      genres: ["Drama", "Fantasy", "Slice of Life"],
      moods: ["Emotional", "Heartbreaking", "Inspirational"],
      episodes: "13 Episodes",
      epCategory: "1-12",
      studio: "Kyoto Animation",
      decade: "2010s",
      streaming: "Netflix",
      ratingNum: 9.8,
      hiddenGem: false,
      matchReason: "Matches 'Emotional Tearjerker' + Visual KyoAni Masterpiece",
      collection: ["saddest", "soundtracks", "community"]
    },
    {
      id: "silentvoice",
      title: "A Silent Voice (Koe no Katachi)",
      poster: "https://picsum.photos/seed/silentvoice_poster/400/600",
      score: "★ 9.7",
      genres: ["Drama", "Romance", "Slice of Life"],
      moods: ["Emotional", "Heartbreaking", "Inspirational"],
      episodes: "Movie (2h 10m)",
      epCategory: "movie",
      studio: "Kyoto Animation",
      decade: "2010s",
      streaming: "Netflix",
      ratingNum: 9.7,
      hiddenGem: false,
      matchReason: "Matches 'Redemption Journey' + Powerful Mental Health Themes",
      collection: ["saddest", "movies", "romance"]
    },
    {
      id: "cyberpunk",
      title: "Cyberpunk: Edgerunners",
      poster: "https://picsum.photos/seed/cyberpunk_poster/400/600",
      score: "★ 9.5",
      genres: ["Sci-Fi", "Action", "Psychological"],
      moods: ["Dark", "Epic", "Heartbreaking"],
      episodes: "10 Episodes",
      epCategory: "1-12",
      studio: "Trigger",
      decade: "2020s",
      streaming: "Netflix",
      ratingNum: 9.5,
      hiddenGem: false,
      matchReason: "Matches 'Neon Sci-Fi Thrill' + High Intensity Trigger Style + Emotional Ending",
      collection: ["action", "saddest", "trending"]
    },
    {
      id: "jjk",
      title: "Jujutsu Kaisen",
      poster: "https://picsum.photos/seed/jjk_poster/400/600",
      score: "★ 9.6",
      genres: ["Action", "Supernatural", "Fantasy"],
      moods: ["Epic", "Dark", "Suspenseful"],
      episodes: "47 Episodes",
      epCategory: "25-50",
      studio: "MAPPA",
      decade: "2020s",
      streaming: "Crunchyroll",
      ratingNum: 9.6,
      hiddenGem: false,
      matchReason: "Matches 'High Octane Domain Expansions' + Iconic Characters",
      collection: ["action", "trending", "community"]
    },
    {
      id: "steinsgate",
      title: "Steins;Gate",
      poster: "https://picsum.photos/seed/steins_poster/400/600",
      score: "★ 9.7",
      genres: ["Sci-Fi", "Psychological", "Thriller"],
      moods: ["Mind-Bending", "Suspenseful", "Heartbreaking"],
      episodes: "24 Episodes",
      epCategory: "13-24",
      studio: "White Fox",
      decade: "2010s",
      streaming: "Hulu",
      ratingNum: 9.7,
      hiddenGem: false,
      matchReason: "Matches 'Time Travel Paradoxes' + Unforgettable Character Bonds",
      collection: ["psychological", "community", "staff"]
    },
    {
      id: "monster",
      title: "Monster",
      poster: "https://picsum.photos/seed/monster_poster/400/600",
      score: "★ 9.5",
      genres: ["Psychological", "Mystery", "Thriller", "Historical"],
      moods: ["Dark", "Mind-Bending", "Suspenseful"],
      episodes: "74 Episodes",
      epCategory: "50+",
      studio: "Madhouse",
      decade: "2000s",
      streaming: "Netflix",
      ratingNum: 9.5,
      hiddenGem: true,
      matchReason: "Matches 'Chilling Sociopathic Villain' + Gripping European Mystery",
      collection: ["psychological", "gems", "horror"]
    }
  ];

  let activeGenre = 'all';
  let activeMood = 'all';
  let activeCollection = 'trending';

  // Render Cards
  function renderDiscoveryCards(list) {
    if (!discoveryContainer) return;

    const countLabel = document.getElementById('matchedCountLabel');
    if (countLabel) countLabel.textContent = `Showing ${list.length} Matched Recommendations`;

    if (list.length === 0) {
      discoveryContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background-color: var(--surface-card); border-radius: var(--radius-lg); border: 1px dashed var(--border);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--text);">No exact anime matches found</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 500px; margin: 0.5rem auto 1.5rem;">
            Try relaxing your filter parameters or selecting a broader mood chip.
          </p>
          <button class="btn btn-primary" id="btnResetAllDiscoveryEmpty">Reset Filters & Show All</button>
        </div>
      `;

      const resetBtnEmpty = document.getElementById('btnResetAllDiscoveryEmpty');
      if (resetBtnEmpty) {
        resetBtnEmpty.addEventListener('click', resetAllFilters);
      }
      return;
    }

    discoveryContainer.innerHTML = list.map(item => `
      <div class="discovery-anime-card">
        <div style="position: relative; aspect-ratio: 2/3; overflow: hidden;">
          <img src="${item.poster}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" referrerPolicy="no-referrer">
          <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.85); color: var(--accent); padding: 0.25rem 0.6rem; border-radius: 12px; font-weight: 900; font-size: 0.82rem; border: 1px solid var(--accent);">
            ${item.score}
          </div>
          ${item.hiddenGem ? `<div style="position: absolute; top: 10px; left: 10px; background: rgba(37, 102, 62, 0.9); color: #FFF; padding: 0.2rem 0.55rem; border-radius: 12px; font-weight: 800; font-size: 0.72rem; border: 1px solid var(--primary-bright);">💎 Hidden Gem</div>` : ''}
        </div>

        <div style="padding: 1.25rem; display: flex; flex-direction: column; flex-grow: 1;">
          <div class="why-it-matches-badge">
            ${item.matchReason}
          </div>

          <h3 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 800; color: var(--text); margin-bottom: 0.4rem; line-height: 1.25;">
            ${item.title}
          </h3>

          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <span>📺 ${item.episodes}</span>
            <span>🏛️ ${item.studio}</span>
          </div>

          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
            ${item.genres.map(g => `<span class="review-genre-pill" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;">${g}</span>`).join('')}
          </div>

          <div style="margin-top: auto; display: flex; gap: 0.5rem;">
            <a href="reviews.html" class="btn btn-secondary" style="flex: 1; text-align: center; font-size: 0.78rem; padding: 0.45rem;">
              📖 Review
            </a>
            <button class="btn btn-primary btn-add-my-list" style="flex: 1; font-size: 0.78rem; padding: 0.45rem;" data-title="${item.title}">
              🔖 Add List
            </button>
            <button class="btn btn-secondary btn-watch-trailer" style="padding: 0.45rem 0.65rem; font-size: 0.78rem;" data-title="${item.title}">
              🎬 Trailer
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Bind Add to List and Trailer Buttons
    document.querySelectorAll('.btn-add-my-list').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-title');
        showDiscoveryToast(`Added "${title}" to your OtakuVerse Watching List!`);
      });
    });

    document.querySelectorAll('.btn-watch-trailer').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-title');
        openTrailerModal(title);
      });
    });
  }

  // Filter Algorithm
  function filterDataset() {
    const searchVal = (document.getElementById('discoverySearchInput')?.value || '').toLowerCase().trim();
    const selectEp = document.getElementById('selectEpisodes')?.value || 'all';
    const selectStudio = document.getElementById('selectStudio')?.value || 'all';
    const selectStreaming = document.getElementById('selectStreaming')?.value || 'all';
    const minRating = parseFloat(document.getElementById('selectRating')?.value || '0');
    const isHiddenGems = document.getElementById('toggleHiddenGems')?.checked || false;
    const isCommunityFavs = document.getElementById('toggleCommunityFavorites')?.checked || false;

    let filtered = animeDiscoveryDataset.filter(item => {
      // Natural Language Query Matching
      if (searchVal) {
        const matchTitle = item.title.toLowerCase().includes(searchVal);
        const matchGenre = item.genres.some(g => g.toLowerCase().includes(searchVal));
        const matchMood = item.moods.some(m => m.toLowerCase().includes(searchVal));
        const matchReason = item.matchReason.toLowerCase().includes(searchVal);
        
        // Smart natural query keywords
        let smartMatch = false;
        if (searchVal.includes('death note') && (item.id === 'deathnote' || item.id === 'monster' || item.id === 'aot')) smartMatch = true;
        if (searchVal.includes('under 12') && item.epCategory === '1-12') smartMatch = true;
        if (searchVal.includes('emotional') && item.moods.includes('Emotional')) smartMatch = true;
        if (searchVal.includes('dark fantasy') && item.genres.includes('Fantasy')) smartMatch = true;
        if (searchVal.includes('female lead') && (item.id === 'frieren' || item.id === 'bocchi' || item.id === 'violet')) smartMatch = true;

        if (!matchTitle && !matchGenre && !matchMood && !matchReason && !smartMatch) return false;
      }

      // Genre
      if (activeGenre !== 'all' && !item.genres.includes(activeGenre)) return false;

      // Mood
      if (activeMood !== 'all' && !item.moods.includes(activeMood)) return false;

      // Episodes
      if (selectEp !== 'all' && item.epCategory !== selectEp) return false;

      // Studio
      if (selectStudio !== 'all' && item.studio !== selectStudio) return false;

      // Streaming
      if (selectStreaming !== 'all' && item.streaming !== selectStreaming) return false;

      // Min Rating
      if (minRating > 0 && item.ratingNum < minRating) return false;

      // Hidden Gems
      if (isHiddenGems && !item.hiddenGem) return false;

      // Community Favorites
      if (isCommunityFavs && item.ratingNum < 9.5) return false;

      return true;
    });

    renderDiscoveryCards(filtered);
  }

  function resetAllFilters() {
    activeGenre = 'all';
    activeMood = 'all';
    const searchInput = document.getElementById('discoverySearchInput');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.filter-toggle-chip').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('[data-type="genre"][data-val="all"]').forEach(c => c.classList.add('active'));
    document.querySelectorAll('[data-type="mood"][data-val="all"]').forEach(c => c.classList.add('active'));

    document.getElementById('selectEpisodes').value = 'all';
    document.getElementById('selectStudio').value = 'all';
    document.getElementById('selectStreaming').value = 'all';
    document.getElementById('selectRating').value = '0';
    document.getElementById('toggleHiddenGems').checked = false;
    document.getElementById('toggleCommunityFavorites').checked = false;

    filterDataset();
  }

  // Genre & Mood Chips Toggle Handlers
  document.querySelectorAll('.filter-toggle-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.getAttribute('data-type');
      const val = chip.getAttribute('data-val');

      if (type === 'genre') {
        document.querySelectorAll('[data-type="genre"]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeGenre = val;
      } else if (type === 'mood') {
        document.querySelectorAll('[data-type="mood"]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeMood = val;
      }

      filterDataset();
    });
  });

  // Select Inputs & Checkbox Listeners
  ['selectEpisodes', 'selectStudio', 'selectStreaming', 'selectRating', 'toggleHiddenGems', 'toggleCommunityFavorites'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', filterDataset);
  });

  const searchBtn = document.getElementById('btnRunDiscoverySearch');
  if (searchBtn) searchBtn.addEventListener('click', filterDataset);

  const searchInput = document.getElementById('discoverySearchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') filterDataset();
    });
  }

  const resetBtn = document.getElementById('btnResetSmartFilters');
  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);

  // Prompt Pill Buttons
  document.querySelectorAll('.prompt-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const promptText = btn.getAttribute('data-prompt');
      if (searchInput) searchInput.value = promptText;
      filterDataset();
    });
  });

  // Collection Tabs Handler
  document.querySelectorAll('.collection-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.collection-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const coll = tab.getAttribute('data-coll');
      activeCollection = coll;

      const matched = animeDiscoveryDataset.filter(item => item.collection.includes(coll));
      renderDiscoveryCards(matched);
    });
  });

  // Trailer Modal
  function openTrailerModal(title) {
    const modal = document.getElementById('trailerModal');
    const modalTitle = document.getElementById('modalTrailerAnimeTitle');
    if (modalTitle) modalTitle.textContent = `${title} — Official PV Trailer`;
    if (modal) modal.classList.add('active');
  }

  const trailerClose = document.getElementById('trailerModalClose');
  if (trailerClose) {
    trailerClose.addEventListener('click', () => {
      const modal = document.getElementById('trailerModal');
      if (modal) modal.classList.remove('active');
    });
  }

  function showDiscoveryToast(msg) {
    let toast = document.getElementById('otakuToastBox');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'otakuToastBox';
      toast.style.cssText = `
        position: fixed; bottom: 25px; right: 25px; z-index: 9999;
        background-color: var(--surface-card); border: 2px solid var(--accent);
        color: var(--text); padding: 1rem 1.5rem; border-radius: var(--radius-md);
        box-shadow: 0 10px 30px rgba(0,0,0,0.8); font-weight: 800; font-size: 0.95rem;
        transition: all 0.3s ease; transform: translateY(100px); opacity: 0;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 3200);
  }

  // Initial Load
  filterDataset();
});




