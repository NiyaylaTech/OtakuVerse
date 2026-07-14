/**
 * OtakuVerse Interactivity Script
 * Provides clean, lightweight JS enhancements:
 * - Mobile hamburger navigation drawer
 * - Active section tracking on scroll
 * - Dynamic interactive modal for programs
 * - Seamless accessible form submit feedback
 */

document.addEventListener('DOMContentLoaded', () => {
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
});

