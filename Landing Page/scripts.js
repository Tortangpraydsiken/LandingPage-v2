// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navMenu = document.querySelector(".pill-navbar .nav ul");

navToggle.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true" || false;
  navToggle.setAttribute("aria-expanded", !expanded);
  navMenu.classList.toggle("active");
});

// Smooth scroll
document.querySelectorAll(".pill-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: "smooth"
      });
    }
    // Close on mobile after click
    navMenu.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* =========================
   Utility helpers
   ========================= */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* quick safe getter */
function safeGet(id) { return document.getElementById(id) || document.querySelector(id); }

/* polite aria announcer */
const ariaStatus = safeGet('#ariaStatus');

/* small helper to set ARIA messages */
function announce(text) { if (ariaStatus) { ariaStatus.textContent = text; } }

/* =========================
   SPLASH / FIRST IMPRESSION
   subtle overlay + wave/fade remove
   ========================= */
(function splashReveal() {
  try {
    const splash = document.createElement('div');
    splash.id = 'splashReveal';
    splash.style.position = 'fixed';
    splash.style.inset = '0';
    splash.style.zIndex = '2500';
    splash.style.background = 'radial-gradient(circle at 20% 30%, rgba(6,120,160,0.20), rgba(4,40,60,0.96) 60%)';
    splash.style.display = 'grid';
    splash.style.placeItems = 'center';
    splash.style.backdropFilter = 'blur(6px)';
    splash.style.transition = 'opacity 900ms cubic-bezier(.2,.9,.2,1)';
    splash.innerHTML = `
      <div style="text-align:center;color:rgba(255,255,255,0.96);font-family:inherit">
        <div style="font-size:28px;font-weight:700;margin-bottom:8px">Explore Mabini</div>
        <div style="font-size:14px;opacity:.92">A coastal experience — preparing your view</div>
        <div style="margin-top:20px">
          <svg width="96" height="24" viewBox="0 0 120 24" aria-hidden="true">
            <g fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round">
              <path d="M3 12c18-14 36-14 54 0 18-14 36-14 54 0" stroke-opacity=".12"/>
              <path d="M3 12c18-10 36-10 54 0 18-10 36-10 54 0" stroke-opacity=".28"/>
              <path d="M3 12c18-6 36-6 54 0 18-6 36-6 54 0" stroke-opacity=".56"/>
            </g>
          </svg>
        </div>
      </div>
    `;
    document.documentElement.appendChild(splash);

    // Let main content load then fade splash.
    window.addEventListener('load', () => {
      // If reduced motion, skip the long animation
      const delay = isReducedMotion ? 250 : 900;
      setTimeout(() => {
        splash.style.opacity = 0;
        setTimeout(() => splash.remove(), 1000);
      }, delay);
    });
  } catch (err) {
    console.warn('splashReveal error', err);
  }
})();

/* =========================
   CUSTOM PIN CURSOR
   ========================= */
(function pinCursor() {
  const pin = safeGet('#cursorPin');
  if (!pin) return;

  // style the pin via JS to keep CSS minimal dependency
  Object.assign(pin.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: '38px',
    height: '48px',
    transform: 'translate3d(-50%,-50%,0) scale(1)',
    pointerEvents: 'none',
    zIndex: 2200,
    transition: 'transform 160ms ease, opacity 220ms ease, filter 220ms ease',
    backgroundImage: `url("data:image/svg+xml;utf8,
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 34'>
        <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0' stop-color='%23ff6b6b'/>
          <stop offset='1' stop-color='%23c80000'/>
        </linearGradient></defs>
        <path d='M12 0C7 0 3 4 3 8.5 3 15 12 34 12 34s9-19 9-25.5C21 4 17 0 12 0z' fill='url(%23g)' stroke='%230b2b2b' stroke-width='0.5'/>
        <circle cx='12' cy='8.5' r='3' fill='%23fff' fill-opacity='0.96'/>
      </svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    opacity: 0 // will fade in on first use
  });

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let x = mouseX, y = mouseY;

  // easing follow loop
  function loop() {
    x += (mouseX - x) * 0.16;
    y += (mouseY - y) * 0.16;
    pin.style.left = `${x}px`;
    pin.style.top = `${y}px`;
    requestAnimationFrame(loop);
  }
  loop();

  // track mouse; show pin when in document
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    pin.style.opacity = 1;
  });

  // hover states on interactive elements
  const hoverTargets = ['a', 'button', '.slide', '.carousel-nav', '.magnifier', '.btn'];
  const hoverEls = hoverTargets.map(sel => Array.from(document.querySelectorAll(sel))).flat();

  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      pin.style.transform = 'translate3d(-50%,-50%,0) scale(0.86) rotate(-7deg)';
      pin.style.filter = 'drop-shadow(0 8px 18px rgba(0,0,0,0.28))';
    });
    el.addEventListener('mouseleave', () => {
      pin.style.transform = 'translate3d(-50%,-50%,0) scale(1) rotate(0deg)';
      pin.style.filter = 'none';
    });
  });

  // hide on blur/leave window
  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) pin.style.opacity = 0;
  });
})();

/* =========================
   SCROLL REVEAL (IntersectionObserver)
   Add classes: reveal-visible
   Support data attributes: data-reveal="fade-up|fade-left|fade-right|zoom-in"
   ========================= */
(function scrollReveal() {
  const els = $$('[data-scroll], .slide-in, .headline, .plan-card, .plan-side, .section-head');
  if (!els.length) return;

  const options = {
    root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('reveal-visible');
        obs.unobserve(el);
      }
    });
  }, options);

  els.forEach(el => {
    // initial state: add appropriate class if not present
    const mode = el.dataset.scroll || el.getAttribute('data-reveal') || (el.classList.contains('slide-in') ? 'fade-up' : 'fade-up');
    if (!el.classList.contains('reveal-pre')) el.classList.add('reveal-pre', `reveal-${mode}`);
    io.observe(el);
  });
})();

/* =========================
   PARALLAX: decorative clouds & subtle hero base shift
   ========================= */
(function parallax() {
  const parClouds = $$('.par-cloud');
  const mapBase = safeGet('#mapBase');

  function onPointerMove(e) {
    const { innerWidth: W, innerHeight: H } = window;
    const x = (e.clientX / W) - 0.5;
    const y = (e.clientY / H) - 0.5;

    // base subtle shift
    if (mapBase) {
      mapBase.style.transform = `translate3d(${x * 8}px, ${y * 6}px, 0) scale(1.03)`;
    }

    // clouds parallax per index
    parClouds.forEach((c, i) => {
      const depth = 6 + i * 3;
      c.style.transform = `translate3d(${x * depth}px, ${y * (depth/2)}px, 0)`;
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (!isReducedMotion) onPointerMove(e);
  });
})();

/* =========================
   MAGNIFIER LENS LOGIC (update background position)
   draggable by pointer events + keyboard nudges + persistence
   ========================= */
(function magnifiers() {
  const mapBase = safeGet('#mapBase');
  if (!mapBase) return;

  const magnifiers = $$('.magnifier');
  if (!magnifiers.length) return;

  // initialize lens background to mapBase image if present
  const baseBg = getComputedStyle(mapBase).backgroundImage || '';
  $$('#lensA, #lensB, #lensC, #lensGuide').forEach(lens => {
    if (lens) lens.style.backgroundImage = baseBg;
    if (lens) lens.style.backgroundSize = '260% 260%';
    if (lens) lens.style.backgroundPosition = 'center';
  });

  // helper to update lens based on mag element center relative to mapBase
  function updateLensFor(mag, lens) {
    if (!mag || !lens) return;
    const rectMap = mapBase.getBoundingClientRect();
    const rectMag = mag.getBoundingClientRect();
    const cX = rectMag.left + rectMag.width / 2;
    const cY = rectMag.top + rectMag.height / 2;
    const px = ((cX - rectMap.left) / rectMap.width) * 100;
    const py = ((cY - rectMap.top) / rectMap.height) * 100;
    // invert for background pos to give "zoom" effect
    const bgX = 100 - px;
    const bgY = 100 - py;
    lens.style.backgroundPosition = `${bgX}% ${bgY}%`;
    // slight micro-drift for 3D effect
    lens.style.transform = `translate3d(${(px - 50)/40}px, ${(py - 50)/40}px, 0) scale(1)`;
  }

  // make a mag draggable with pointer events and store in localStorage
  function makeDraggable(mag, lens, key) {
    if (!mag) return;
    // load saved position
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved && saved.left && saved.top) {
        mag.style.left = saved.left;
        mag.style.top = saved.top;
      }
    } catch (err) { /* ignore */ }

    let dragging = false;
    let startX = 0, startY = 0, origLeft = 0, origTop = 0;

    function onPointerDown(e) {
      // allow only primary pointer
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      mag.classList.add('active');
      mag.setPointerCapture && mag.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      const r = mag.getBoundingClientRect();
      origLeft = r.left + window.scrollX;
      origTop = r.top + window.scrollY;
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newLeft = origLeft + dx;
      const newTop = origTop + dy;
      // clamp within viewport with margin
      const margin = 8;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const clampedX = Math.min(Math.max(newLeft, margin), w - mag.offsetWidth - margin);
      const clampedY = Math.min(Math.max(newTop, margin + 8), h - mag.offsetHeight - margin - 8);
      mag.style.left = `${clampedX}px`;
      mag.style.top = `${clampedY}px`;
      updateLensFor(mag, lens);
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      mag.classList.remove('active');
      // persist
      try {
        localStorage.setItem(key, JSON.stringify({ left: mag.style.left, top: mag.style.top }));
      } catch (err) { /* localStorage may be disabled */ }
    }

    // pointer events for mouse + touch
    mag.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // keyboard nudges
    mag.addEventListener('keydown', (ev) => {
      const step = ev.shiftKey ? 28 : 8;
      const rect = mag.getBoundingClientRect();
      if (ev.key === 'ArrowUp') { mag.style.top = rect.top - step + 'px'; ev.preventDefault(); }
      if (ev.key === 'ArrowDown') { mag.style.top = rect.top + step + 'px'; ev.preventDefault(); }
      if (ev.key === 'ArrowLeft') { mag.style.left = rect.left - step + 'px'; ev.preventDefault(); }
      if (ev.key === 'ArrowRight') { mag.style.left = rect.left + step + 'px'; ev.preventDefault(); }
      updateLensFor(mag, lens);
      try { localStorage.setItem(key, JSON.stringify({ left: mag.style.left, top: mag.style.top })); } catch (err) {}
    });

    // initial lens update
    setTimeout(() => updateLensFor(mag, lens), 80);

    // periodic refresh (in case page resizes)
    setInterval(() => { if (!dragging) updateLensFor(mag, lens); }, 400);
  }

  // attach to known elements (ids from HTML)
  const magA = $('#magA'), magB = $('#magB'), magC = $('#magC'), magGuide = $('#magGuide');
  makeDraggable(magA, $('#lensA'), 'pos_magA');
  makeDraggable(magB, $('#lensB'), 'pos_magB');
  makeDraggable(magC, $('#lensC'), 'pos_magC');

  // guide lens: non-draggable but update tie
  if (magGuide) setInterval(() => updateLensFor(magGuide, $('#lensGuide')), 360);
})();

/* =========================
   CAROUSEL (drag/swipe, buttons, autoplay, pause)
   Assumes:
   - .carousel-track exists and contains .slide elements
   - .carousel-nav.next / .carousel-nav.prev are present
   ========================= */
(function carousel() {
  const track = safeGet('#carouselTrack') || safeGet('#carousel .carousel-track') || safeGet('#carouselTrack');
  const prevBtn = document.querySelector('.carousel-nav.prev');
  const nextBtn = document.querySelector('.carousel-nav.next');
  const slides = track ? Array.from(track.children) : [];
  if (!track || !slides.length) return;

  // We'll implement a percent-based translateX system so track width responsive
  let index = 0;
  let autoTimer = null;
  let isDragging = false;
  let dragStartX = 0, dragCurrentX = 0, trackStartX = 0;
  const autoplayDelay = 4500;
  const transitionMs = 420;

  // set initial layout (make track a flex row)
  track.style.display = 'flex';
  track.style.gap = '1rem';
  track.style.transition = `transform ${transitionMs}ms cubic-bezier(.16,.84,.24,1)`;
  slides.forEach(s => { s.style.minWidth = '320px'; s.style.flex = '0 0 auto'; });

  // compute visible amount (we will use index and calculated offset)
  function update() {
    // compute the width of one slide incl gap
    const slideWidth = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
    const offset = index * slideWidth;
    track.style.transform = `translateX(-${offset}px)`;
    // aria
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== index));
  }

  // next/prev
  function next() { index = Math.min(index + 1, slides.length - 1); update(); }
  function prev() { index = Math.max(index - 1, 0); update(); }

  nextBtn && nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
  prevBtn && prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });

  // autoplay
  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(() => {
      index = (index + 1) % slides.length;
      update();
    }, autoplayDelay);
  }
  function stopAutoplay() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  function resetAutoplay() { stopAutoplay(); startAutoplay(); }

  // pause on hover/focus
  const carouselWrap = track.parentElement;
  carouselWrap.addEventListener('mouseenter', stopAutoplay);
  carouselWrap.addEventListener('mouseleave', startAutoplay);
  carouselWrap.addEventListener('focusin', stopAutoplay);
  carouselWrap.addEventListener('focusout', startAutoplay);

  // drag to swipe (pointer events)
  track.addEventListener('pointerdown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    trackStartX = parseFloat(track.style.transform.replace(/translateX\(-?([0-9.]+)px\)/, '$1')) || 0;
    track.style.transition = 'none';
    track.setPointerCapture && track.setPointerCapture(e.pointerId);
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    dragCurrentX = e.clientX;
    const dx = dragCurrentX - dragStartX;
    track.style.transform = `translateX(-${Math.max(0, trackStartX - dx)}px)`;
  });

  window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = `transform ${transitionMs}ms cubic-bezier(.16,.84,.24,1)`;
    // determine swipe direction
    const dx = (e.clientX || dragCurrentX) - dragStartX;
    const threshold = 60;
    if (dx < -threshold) {
      // swiped left (go next)
      index = Math.min(index + 1, slides.length - 1);
    } else if (dx > threshold) {
      index = Math.max(index - 1, 0);
    } else {
      // minor drag -> snap to nearest
      // compute current offset and snap
      const slideWidth = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
      const currentOffset = parseFloat(track.style.transform.replace(/translateX\(-?([0-9.]+)px\)/, '$1')) || 0;
      index = Math.round(currentOffset / slideWidth);
      index = Math.min(Math.max(index, 0), slides.length - 1);
    }
    update();
    resetAutoplay();
  });

  // responsive: recalc on resize
  window.addEventListener('resize', () => setTimeout(update, 120));

  // start
  update();
  startAutoplay();
})();

/* =========================
   MODAL (accessible) system
   - open when .btn[data-open] clicked
   - close on backdrop click, Esc
   - Prev/Next navigation via keyboard or modal button
   - focus trap
   ========================= */
(function modalSystem() {
  const modalBackdrop = safeGet('#modalBackdrop');
  if (!modalBackdrop) return;
  const modal = modalBackdrop.querySelector('.modal');
  const modalClose = modalBackdrop.querySelector('.modal-close');
  const modalTitle = modalBackdrop.querySelector('#modalTitle');
  const modalText = modalBackdrop.querySelector('#modalText');
  const modalSlide = modalBackdrop.querySelector('#modalSlide');
  const modalMap = modalBackdrop.querySelector('#modalMap');
  const modalNext = modalBackdrop.querySelector('#modalNext');

  const slides = Array.from(document.querySelectorAll('.slide'));
  let idx = 0;

  function openForSlideId(id) {
    const slide = document.querySelector(`.slide[data-id="${id}"]`);
    if (!slide) return;
    idx = slides.indexOf(slide);
    const img = slide.querySelector('img');
    const title = slide.querySelector('h3') ? slide.querySelector('h3').textContent : (slide.getAttribute('aria-label') || '');
    const desc = slide.querySelector('.desc') ? slide.querySelector('.desc').textContent : '';
    modalTitle.textContent = title;
    modalText.textContent = desc;
    modalSlide.innerHTML = img ? `<img src="${img.src}" alt="${img.alt || title}">` : '';

    // set map link if present inside slide's anchor
    const anchor = slide.querySelector('a[href^="https://www.google.com/maps"]');
    modalMap && (modalMap.href = anchor ? anchor.href : '#');

    modalBackdrop.setAttribute('aria-hidden', 'false');
    modalBackdrop.style.display = 'flex';
    modalBackdrop.classList.add('open');
    // trap focus
    const focusables = modalBackdrop.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    (focusables[0] || modalClose).focus();
    announce(`${title} opened`);
  }

  // bind opening buttons
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-open');
      openForSlideId(id);
    });
  });

  function close() {
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    modalBackdrop.style.display = 'none';
    announce('Modal closed');
  }

  modalClose && modalClose.addEventListener('click', close);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) close();
  });

  // keyboard nav
  document.addEventListener('keydown', (e) => {
    if (modalBackdrop.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') { navigate(1); }
      if (e.key === 'ArrowLeft') { navigate(-1); }
    }
  });

  modalNext && modalNext.addEventListener('click', () => navigate(1));

  function navigate(dir = 1) {
    idx = (idx + dir + slides.length) % slides.length;
    const slide = slides[idx];
    if (!slide) return;
    const img = slide.querySelector('img');
    const title = slide.querySelector('h3') ? slide.querySelector('h3').textContent : '';
    const desc = slide.querySelector('.desc') ? slide.querySelector('.desc').textContent : '';
    modalTitle.textContent = title;
    modalText.textContent = desc;
    modalSlide.innerHTML = img ? `<img src="${img.src}" alt="${img.alt || title}">` : '';
    const anchor = slide.querySelector('a[href^="https://www.google.com/maps"]');
    modalMap && (modalMap.href = anchor ? anchor.href : '#');
    announce(`${title} opened`);
  }
})();

/* =========================
   KEYBOARD SHORTCUTS
   - R: reset magnifiers to defaults
   - Esc: close modal (handled already)
   ========================= */
(function shortcuts() {
  window.addEventListener('keydown', (e) => {
    // ignore if typing in input
    const inField = /input|textarea|select/.test(document.activeElement.tagName.toLowerCase());
    if (inField) return;

    if (e.key.toLowerCase() === 'r') {
      // default positions
      const defaults = [
        { id: 'magA', left: '12%', top: '60vh' },
        { id: 'magB', left: '70%', top: '62vh' },
        { id: 'magC', left: '42%', top: '58vh' },
        { id: 'magGuide', left: '50%', top: '60vh' }
      ];
      defaults.forEach(d => {
        const el = document.getElementById(d.id);
        if (el) {
          el.style.left = d.left;
          el.style.top = d.top;
          try { localStorage.removeItem(`pos_${d.id}`); } catch (err) {}
        }
      });
      announce('Magnifiers reset');
    }
  });
})();

/* =========================
   Accessibility: focus outlines on keyboard use only
   ========================= */
(function focusOutline() {
  function handleFirstTab(e) {
    if (e.key === 'Tab') {
      document.documentElement.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);
})();

/* =========================
   Graceful fallbacks & finalization
   ========================= */
(function finalize() {
  // Hide custom pin if not supported or if small screens (mobile)
  const pin = safeGet('#cursorPin');
  if (pin && ('ontouchstart' in window || window.innerWidth < 720)) {
    pin.style.display = 'none';
  }

  // If reduced motion, simplify animations
  if (isReducedMotion) {
    // remove heavy transforms
    $$('.par-cloud, #mapBase').forEach(el => { if (el) el.style.transition = 'none'; });
  }

  // announce loaded
  window.addEventListener('load', () => {
    announce('Page content loaded');
  });
})();
