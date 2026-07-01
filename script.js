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

  // --- 2. Active Section Highlighting ---
  const sections = document.querySelectorAll('section');
  const scrollOptions = {
    root: null,
    threshold: 0.3, // Highlight when section occupies 30% of screen
    rootMargin: "-10% 0px -40% 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, scrollOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

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
});
