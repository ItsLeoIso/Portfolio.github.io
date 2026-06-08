/* ═══════════════════════════════════════════════════════════
   ItsLeo.iso — script.js
   Handles: gallery render, category filtering,
   section navigation, lightbox, mobile menu
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   GALLERY DATA
   Add, remove, or reorder objects here to manage the portfolio.
   src: path to image file (place images in the same folder)
   Placeholder SVGs are rendered automatically for missing images.
───────────────────────────────────────────────────────────── */
const gallery = [
  {
    id: 1,
    cat: "Architecture",
    src: "arch1.jpg",
    title: "Structure & Line",
    intent: "Exploring raw brutalist geometry — shadow as the second architect."
  },
  {
    id: 2,
    cat: "Architecture",
    src: "arch2.jpg",
    title: "Glass Meridian",
    intent: "A curtain wall dissolving the boundary between inside and sky."
  },
  {
    id: 3,
    cat: "Architecture",
    src: "arch3.jpg",
    title: "Concrete Psalm",
    intent: "Repetition becomes rhythm when the eye learns to follow."
  },
  {
    id: 4,
    cat: "Architecture",
    src: "arch4.jpg",
    title: "Threshold",
    intent: "Every doorway is a decision, every arch a held breath."
  },
  {
    id: 5,
    cat: "Landscape",
    src: "Gatto_Nero.JPG",
    title: "Feline Shadows",
    intent: "The silence of a hunter. Captured in the low Swiss sun."
  },
  {
    id: 6,
    cat: "Landscape",
    src: "land2.jpg",
    title: "Alta Via",
    intent: "Above the treeline where the world becomes elemental."
  },
  {
    id: 7,
    cat: "Landscape",
    src: "land3.jpg",
    title: "First Light, Brienz",
    intent: "The lake held the mountains before the mountains woke."
  },
  {
    id: 8,
    cat: "Landscape",
    src: "land4.jpg",
    title: "Fog Season",
    intent: "November in the valley. The city disappears and only shapes remain."
  },
  {
    id: 9,
    cat: "Portraits",
    src: "portrait1.jpg",
    title: "Human Expression",
    intent: "Natural light portraiture — nothing hidden, nothing performed."
  },
  {
    id: 10,
    cat: "Portraits",
    src: "portrait2.jpg",
    title: "The Pause",
    intent: "Between speaking and knowing. A moment that belongs to no one."
  },
  {
    id: 11,
    cat: "Portraits",
    src: "portrait3.jpg",
    title: "Available Light",
    intent: "A single window. An honest face. That is enough."
  },
  {
    id: 12,
    cat: "Portraits",
    src: "portrait4.jpg",
    title: "Looking Back",
    intent: "The gaze that crosses time — not nostalgia, but recognition."
  }
];


/* ─────────────────────────────────────────────────────────────
   PLACEHOLDER COLORS per category
───────────────────────────────────────────────────────────── */
const placeholderThemes = {
  Architecture: { bg: "#D9D3C9", fg: "#9E9085", icon: "arch" },
  Landscape:    { bg: "#C9D3CC", fg: "#7A9180", icon: "land" },
  Portraits:    { bg: "#D3C9C5", fg: "#9E8580", icon: "port" }
};

function buildPlaceholderSVG(cat, title) {
  const theme = placeholderThemes[cat] || { bg: "#D9D3C9", fg: "#9E9085" };

  const icons = {
    arch: `<rect x="60" y="45" width="80" height="90" fill="none" stroke="${theme.fg}" stroke-width="2"/>
           <rect x="80" y="95" width="20" height="40" fill="${theme.fg}" opacity="0.5"/>
           <line x1="60" y1="45" x2="100" y2="20" stroke="${theme.fg}" stroke-width="2"/>
           <line x1="140" y1="45" x2="100" y2="20" stroke="${theme.fg}" stroke-width="2"/>`,
    land: `<path d="M20 130 Q60 70 100 90 Q130 60 180 130 Z" fill="${theme.fg}" opacity="0.4"/>
           <circle cx="150" cy="55" r="22" fill="${theme.fg}" opacity="0.25"/>
           <line x1="0" y1="130" x2="200" y2="130" stroke="${theme.fg}" stroke-width="1.5"/>`,
    port: `<circle cx="100" cy="75" r="35" fill="none" stroke="${theme.fg}" stroke-width="2"/>
           <ellipse cx="100" cy="170" rx="52" ry="38" fill="none" stroke="${theme.fg}" stroke-width="2"/>`
  };

  return `
    <svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="180" fill="${theme.bg}"/>
      <g opacity="0.7">${icons[theme.icon] || icons.arch}</g>
      <text x="100" y="168" text-anchor="middle"
            font-family="Jost,sans-serif" font-size="7" font-weight="400"
            letter-spacing="2" fill="${theme.fg}" opacity="0.8"
            text-transform="uppercase">${title.toUpperCase()}</text>
    </svg>`;
}


/* ─────────────────────────────────────────────────────────────
   GALLERY RENDER
───────────────────────────────────────────────────────────── */
const grid    = document.getElementById('galleryGrid');
const title   = document.getElementById('galleryTitle');
const counter = document.getElementById('galleryCount');

let currentFilter  = 'all';
let filteredItems  = [];
let lightboxIndex  = 0;

function renderGallery(filter) {
  currentFilter = filter;
  filteredItems = filter === 'all'
    ? [...gallery]
    : gallery.filter(item => item.cat === filter);

  title.textContent   = filter === 'all' ? 'All Work' : filter;
  counter.textContent = `${filteredItems.length} image${filteredItems.length !== 1 ? 's' : ''}`;

  // Clear + rebuild
  grid.innerHTML = '';

  if (filteredItems.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;padding:4rem 0;text-align:center;color:var(--light);">
        <p style="font-family:var(--font-display);font-size:1.4rem;font-style:italic;">
          No images in this collection yet.
        </p>
      </div>`;
    return;
  }

  filteredItems.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className  = 'gallery-item';
    el.dataset.id = item.id;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `View ${item.title}`);

    const imageEl = item.src
      ? `<img src="${item.src}"
              alt="${item.title}"
              loading="lazy"
              onerror="this.parentElement.querySelector('.img-placeholder').style.display='flex';this.style.display='none';"
         />
         <div class="img-placeholder" style="display:none;" aria-hidden="true">
           ${buildPlaceholderSVG(item.cat, item.title)}
         </div>`
      : `<div class="img-placeholder" aria-hidden="true">
           ${buildPlaceholderSVG(item.cat, item.title)}
         </div>`;

    el.innerHTML = `
      ${imageEl}
      <div class="gallery-item-overlay" aria-hidden="true">
        <p class="gallery-item-title">${item.title}</p>
        <p class="gallery-item-intent">${item.intent}</p>
      </div>
      <span class="gallery-item-cat" aria-hidden="true">${item.cat}</span>
    `;

    el.addEventListener('click',    () => openLightbox(idx));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(idx); });

    grid.appendChild(el);
  });
}


/* ─────────────────────────────────────────────────────────────
   SECTION NAVIGATION
───────────────────────────────────────────────────────────── */
const sections = {
  about:   document.getElementById('section-about'),
  gallery: document.getElementById('section-gallery'),
  contact: document.getElementById('section-contact')
};

const navLinks    = document.querySelectorAll('.nav-link');
const mainContent = document.getElementById('mainContent');

function showSection(sectionKey, filter) {
  // Hide all
  Object.values(sections).forEach(s => s.classList.remove('active'));

  if (sectionKey === 'about' || sectionKey === 'contact') {
    sections[sectionKey].classList.add('active');
    setActiveNav(sectionKey);
  } else {
    // Gallery view
    sections.gallery.classList.add('active');
    renderGallery(filter || sectionKey);
    setActiveNav(filter === 'all' ? null : sectionKey);
  }

  // Scroll main content to top
  mainContent.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile menu
  closeMobileMenu();
}

function setActiveNav(key) {
  navLinks.forEach(link => {
    const s = link.dataset.section;
    link.classList.toggle('active',
      s === key || (key === null && s === 'all')
    );
  });
}


/* ─────────────────────────────────────────────────────────────
   NAV CLICK HANDLERS
───────────────────────────────────────────────────────────── */
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sec = link.dataset.section;

    if (sec === 'about' || sec === 'contact') {
      showSection(sec);
    } else if (sec === 'all') {
      showSection('gallery', 'all');
    } else {
      // Category filter
      showSection(sec, sec);
    }
  });
});

// Logo click → reset to all
document.querySelectorAll('[data-section="all"]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('gallery', 'all');
  });
});


/* ─────────────────────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────────────────────── */
const lightbox        = document.getElementById('lightbox');
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxTitle   = document.getElementById('lightboxTitle');
const lightboxIntent  = document.getElementById('lightboxIntent');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');

function openLightbox(idx) {
  lightboxIndex = idx;
  loadLightboxItem(idx);
  lightbox.classList.add('open');
  lightboxOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function loadLightboxItem(idx) {
  const item = filteredItems[idx];
  if (!item) return;

  // Reset image
  lightboxImg.style.display = 'block';
  lightboxImg.src   = item.src || '';
  lightboxImg.alt   = item.title;
  lightboxTitle.textContent  = item.title;
  lightboxIntent.textContent = item.intent;

  lightboxImg.onerror = () => {
    lightboxImg.style.display = 'none';
  };

  // Arrow visibility
  lightboxPrev.style.opacity = idx === 0 ? '0.3' : '1';
  lightboxNext.style.opacity = idx === filteredItems.length - 1 ? '0.3' : '1';
}

function prevImage() {
  if (lightboxIndex > 0) {
    lightboxIndex--;
    loadLightboxItem(lightboxIndex);
  }
}

function nextImage() {
  if (lightboxIndex < filteredItems.length - 1) {
    lightboxIndex++;
    loadLightboxItem(lightboxIndex);
  }
}

lightboxClose.addEventListener('click',   closeLightbox);
lightboxOverlay.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click',    prevImage);
lightboxNext.addEventListener('click',    nextImage);

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   prevImage();
  if (e.key === 'ArrowRight')  nextImage();
});

// Touch swipe support
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(dx) > 40) dx < 0 ? nextImage() : prevImage();
}, { passive: true });


/* ─────────────────────────────────────────────────────────────
   MOBILE HAMBURGER MENU
───────────────────────────────────────────────────────────── */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar      = document.getElementById('sidebar');

hamburgerBtn.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('open');
  hamburgerBtn.classList.toggle('open', isOpen);
  hamburgerBtn.setAttribute('aria-expanded', isOpen);
});

function closeMobileMenu() {
  sidebar.classList.remove('open');
  hamburgerBtn.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
}

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (
    sidebar.classList.contains('open') &&
    !sidebar.contains(e.target) &&
    !hamburgerBtn.contains(e.target)
  ) {
    closeMobileMenu();
  }
});


/* ─────────────────────────────────────────────────────────────
   INIT — default: show all gallery images
───────────────────────────────────────────────────────────── */
(function init() {
  renderGallery('all');
  sections.gallery.classList.add('active');
})();
