// =========================
// MOBILE NAVIGATION TOGGLE
// =========================
const navToggle = document.getElementById("navToggle");
const navMenu = document.querySelector(".pill-navbar .nav ul");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true" || false;
    navToggle.setAttribute("aria-expanded", !expanded);
    navMenu.classList.toggle("active");
  });
}

// =========================
// UTILITY FUNCTIONS
// =========================
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function safeGet(id) { 
  return document.getElementById(id) || document.querySelector(id); 
}

const ariaStatus = safeGet('#ariaStatus');

function announce(text) { 
  if (ariaStatus) { 
    ariaStatus.textContent = text; 
  } 
}

// =========================
// MAP LOCATION FUNCTIONALITY
// =========================
(function mapLocations() {
  // Exact coordinates for each tourist spot
  const spotCoordinates = {
    'Anilao': { 
      lat: 13.7226, 
      lng: 120.8994,
      description: 'Anilao is known for its clear waters and vibrant marine life, making it perfect for snorkeling and diving. It features beautiful coral reefs and diverse aquatic species.'
    },
    'Mt. Gulugod Baboy': { 
      lat: 13.6936, 
      lng: 120.9050,
      description: 'Mt. Gulugod Baboy offers a relatively easy hike with breathtaking panoramic views of islands and the sea. Perfect for sunrise viewing and photography.'
    },
    'Camp Netanya': { 
      lat: 13.7167, 
      lng: 120.8833,
      description: 'Camp Netanya is a beautiful resort with Greek-inspired architecture, offering stunning ocean views, comfortable accommodations, and various water activities.'
    },
    'Awari Bay': { 
      lat: 13.7081, 
      lng: 120.8917,
      description: 'Awari Bay is a calm and secluded bay ideal for relaxing day trips, kayaking, and marine life spotting. Perfect for those seeking tranquility.'
    }
  };

  const locationModal = safeGet('#locationModal');
  const locationTitle = safeGet('#locationTitle');
  const locationDescription = safeGet('#locationDescription');
  const locationMap = safeGet('#locationMap');
  const getDirectionsBtn = safeGet('#getDirections');
  const closeLocationBtn = safeGet('#closeLocation');
  const locationCloseBtn = $('.location-close');

  let currentLocation = '';

  // Function to open Google Maps with exact coordinates
  function openExactLocation(spotName) {
    const coords = spotCoordinates[spotName];
    
    if (coords) {
      // Open Google Maps with exact coordinates
      const url = `https://www.google.com/maps/@${coords.lat},${coords.lng},15z?entry=ttu`;
      window.open(url, '_blank', 'noopener,noreferrer');
      
      // Show notification
      showMapNotification(`Opening ${spotName} location in Google Maps`);
    } else {
      // Fallback to search if coordinates not found
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(spotName + ' Mabini Batangas')}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
  }

  // Function to show location in modal with embedded map
  function showLocationModal(spotName) {
    const coords = spotCoordinates[spotName];
    
    if (!coords) {
      openExactLocation(spotName);
      return;
    }

    currentLocation = spotName;
    locationTitle.textContent = spotName;
    locationDescription.textContent = coords.description;

    // Create embedded map without API key
    const mapUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;
    
    locationMap.innerHTML = `
      <iframe 
        src="${mapUrl}"
        width="100%" 
        height="100%" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade"
        title="${spotName} location map">
      </iframe>
    `;

    // Show modal
    locationModal.style.display = 'block';
    announce(`Showing ${spotName} location on map`);
  }

  // Get directions function
  function getDirections() {
    if (currentLocation && spotCoordinates[currentLocation]) {
      const coords = spotCoordinates[currentLocation];
      // Use the more reliable Google Maps directions URL
      const url = `https://www.google.com/maps/dir//${coords.lat},${coords.lng}/@${coords.lat},${coords.lng},15z`;
      window.open(url, '_blank', 'noopener,noreferrer');
      announce(`Getting directions to ${currentLocation}`);
    }
  }

  // Close modal function
  function closeLocationModal() {
    locationModal.style.display = 'none';
    announce('Location map closed');
  }

  // Event listeners for map buttons
  $$('.open-map-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const location = btn.getAttribute('data-location');
      showLocationModal(location);
    });
  });

  // Also add click handlers for the old anchor tags as fallback
  $$('a.btn.small[href*="google.com/maps"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Extract location name from the card
      const card = link.closest('.slide');
      const location = card ? card.getAttribute('data-location') : '';
      if (location) {
        showLocationModal(location);
      } else {
        // Fallback: open the original link
        window.open(link.href, '_blank', 'noopener,noreferrer');
      }
    });
  });

  // Event listeners for modal controls
  if (getDirectionsBtn) {
    getDirectionsBtn.addEventListener('click', getDirections);
  }

  if (closeLocationBtn) {
    closeLocationBtn.addEventListener('click', closeLocationModal);
  }

  if (locationCloseBtn) {
    locationCloseBtn.addEventListener('click', closeLocationModal);
  }

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === locationModal) {
      closeLocationModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && locationModal.style.display === 'block') {
      closeLocationModal();
    }
  });

  // Utility function to show notifications
  function showMapNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--primary);
      color: white;
      padding: 12px 20px;
      border-radius: var(--radius);
      box-shadow: var(--shadow-strong);
      z-index: 2002;
      font-size: 0.9rem;
      transform: translateX(120%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(120%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Make function available globally for fallback
  window.openExactLocation = openExactLocation;
})();

// =========================
// SPLASH SCREEN
// =========================
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

    window.addEventListener('load', () => {
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

// =========================
// CUSTOM CURSOR
// =========================
(function pinCursor() {
  const pin = safeGet('#cursorPin');
  if (!pin) return;

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
    opacity: 0
  });

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let x = mouseX, y = mouseY;

  function loop() {
    x += (mouseX - x) * 0.16;
    y += (mouseY - y) * 0.16;
    pin.style.left = `${x}px`;
    pin.style.top = `${y}px`;
    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    pin.style.opacity = 1;
  });

  const hoverTargets = ['a', 'button', '.slide', '.carousel-nav', '.magnifier', '.btn', '.auth-btn', '.sidebar-link', '.activity-card', '.accommodation-card', '.open-map-btn'];
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

  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) pin.style.opacity = 0;
  });

  if ('ontouchstart' in window || navigator.maxTouchPoints) {
    pin.style.display = 'none';
  }
})();

// =========================
// SCROLL REVEAL ANIMATIONS
// =========================
(function scrollReveal() {
  const els = $$('[data-scroll], .slide-in, .headline, .plan-card, .plan-side, .section-head, .reveal-pre');
  if (!els.length) return;

  const options = {
    root: null, 
    rootMargin: '0px 0px -10% 0px', 
    threshold: 0.12
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
    const mode = el.dataset.scroll || el.getAttribute('data-reveal') || (el.classList.contains('slide-in') ? 'fade-up' : 'fade-up');
    if (!el.classList.contains('reveal-pre')) {
      el.classList.add('reveal-pre', `reveal-${mode}`);
    }
    io.observe(el);
  });
})();

// =========================
// PARALLAX EFFECTS
// =========================
(function parallax() {
  const parClouds = $$('.par-cloud');
  const mapBase = safeGet('#mapBase');

  function onPointerMove(e) {
    if (isReducedMotion) return;
    
    const { innerWidth: W, innerHeight: H } = window;
    const x = (e.clientX / W) - 0.5;
    const y = (e.clientY / H) - 0.5;

    if (mapBase) {
      mapBase.style.transform = `translate3d(${x * 8}px, ${y * 6}px, 0) scale(1.03)`;
    }

    parClouds.forEach((c, i) => {
      const depth = 6 + i * 3;
      c.style.transform = `translate3d(${x * depth}px, ${y * (depth/2)}px, 0)`;
    });
  }

  window.addEventListener('mousemove', onPointerMove);
})();

// =========================
// MAGNIFIER FUNCTIONALITY
// =========================
(function magnifiers() {
  const mapBase = safeGet('#mapBase');
  if (!mapBase) return;

  const magnifiers = $$('.magnifier');
  if (!magnifiers.length) return;

  const baseBg = getComputedStyle(mapBase).backgroundImage || '';
  $$('#lensA, #lensB, #lensC, #lensGuide').forEach(lens => {
    if (lens) {
      lens.style.backgroundImage = baseBg;
      lens.style.backgroundSize = '260% 260%';
      lens.style.backgroundPosition = 'center';
    }
  });

  function updateLensFor(mag, lens) {
    if (!mag || !lens) return;
    const rectMap = mapBase.getBoundingClientRect();
    const rectMag = mag.getBoundingClientRect();
    const cX = rectMag.left + rectMag.width / 2;
    const cY = rectMag.top + rectMag.height / 2;
    const px = ((cX - rectMap.left) / rectMap.width) * 100;
    const py = ((cY - rectMap.top) / rectMap.height) * 100;
    const bgX = 100 - px;
    const bgY = 100 - py;
    lens.style.backgroundPosition = `${bgX}% ${bgY}%`;
    lens.style.transform = `translate3d(${(px - 50)/40}px, ${(py - 50)/40}px, 0) scale(1)`;
  }

  function makeDraggable(mag, lens, key) {
    if (!mag) return;

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
      try {
        localStorage.setItem(key, JSON.stringify({ left: mag.style.left, top: mag.style.top }));
      } catch (err) { /* ignore */ }
    }

    mag.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    mag.addEventListener('keydown', (ev) => {
      const step = ev.shiftKey ? 28 : 8;
      const rect = mag.getBoundingClientRect();
      if (ev.key === 'ArrowUp') { mag.style.top = rect.top - step + 'px'; ev.preventDefault(); }
      if (ev.key === 'ArrowDown') { mag.style.top = rect.top + step + 'px'; ev.preventDefault(); }
      if (ev.key === 'ArrowLeft') { mag.style.left = rect.left - step + 'px'; ev.preventDefault(); }
      if (ev.key === 'ArrowRight') { mag.style.left = rect.left + step + 'px'; ev.preventDefault(); }
      updateLensFor(mag, lens);
      try { 
        localStorage.setItem(key, JSON.stringify({ left: mag.style.left, top: mag.style.top })); 
      } catch (err) {}
    });

    setTimeout(() => updateLensFor(mag, lens), 80);
    setInterval(() => { if (!dragging) updateLensFor(mag, lens); }, 400);
  }

  const magA = $('#magA'), magB = $('#magB'), magC = $('#magC'), magGuide = $('#magGuide');
  makeDraggable(magA, $('#lensA'), 'pos_magA');
  makeDraggable(magB, $('#lensB'), 'pos_magB');
  makeDraggable(magC, $('#lensC'), 'pos_magC');

  if (magGuide) {
    setInterval(() => updateLensFor(magGuide, $('#lensGuide')), 360);
  }
})();

// =========================
// CAROUSEL FUNCTIONALITY
// =========================
(function carousel() {
  const track = safeGet('#carouselTrack');
  const prevBtn = document.querySelector('.carousel-nav.prev');
  const nextBtn = document.querySelector('.carousel-nav.next');
  const slides = track ? Array.from(track.children) : [];
  
  if (!track || !slides.length) return;

  let currentIndex = 0;
  let autoTimer = null;
  let isDragging = false;
  let dragStartX = 0, dragCurrentX = 0, trackStartX = 0;
  const autoplayDelay = 4500;
  const transitionMs = 420;

  track.style.display = 'flex';
  track.style.gap = '1rem';
  track.style.transition = `transform ${transitionMs}ms cubic-bezier(.16,.84,.24,1)`;
  slides.forEach(s => { 
    s.style.minWidth = '320px'; 
    s.style.flex = '0 0 auto'; 
  });

  function updateCarousel() {
    const slideWidth = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
    const offset = currentIndex * slideWidth;
    track.style.transform = `translateX(-${offset}px)`;
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== currentIndex));
  }

  function nextSlide() { 
    currentIndex = (currentIndex + 1) % slides.length; 
    updateCarousel(); 
  }

  function prevSlide() { 
    currentIndex = (currentIndex - 1 + slides.length) % slides.length; 
    updateCarousel(); 
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(() => {
      nextSlide();
    }, autoplayDelay);
  }

  function stopAutoplay() { 
    if (autoTimer) { 
      clearInterval(autoTimer); 
      autoTimer = null; 
    } 
  }

  function resetAutoplay() { 
    stopAutoplay(); 
    startAutoplay(); 
  }

  const carouselWrap = track.parentElement;
  if (carouselWrap) {
    carouselWrap.addEventListener('mouseenter', stopAutoplay);
    carouselWrap.addEventListener('mouseleave', startAutoplay);
    carouselWrap.addEventListener('focusin', stopAutoplay);
    carouselWrap.addEventListener('focusout', startAutoplay);
  }

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
    
    const dx = (e.clientX || dragCurrentX) - dragStartX;
    const threshold = 60;
    
    if (dx < -threshold) {
      nextSlide();
    } else if (dx > threshold) {
      prevSlide();
    } else {
      const slideWidth = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
      const currentOffset = parseFloat(track.style.transform.replace(/translateX\(-?([0-9.]+)px\)/, '$1')) || 0;
      currentIndex = Math.round(currentOffset / slideWidth);
      currentIndex = Math.min(Math.max(currentIndex, 0), slides.length - 1);
      updateCarousel();
    }
    resetAutoplay();
  });

  window.addEventListener('resize', () => setTimeout(updateCarousel, 120));

  updateCarousel();
  startAutoplay();
})();

// =========================
// SIDEBAR FUNCTIONALITY
// =========================
(function sidebar() {
  const sidebar = safeGet('#sidebar');
  const sidebarToggle = safeGet('#sidebarToggle');
  const sidebarClose = safeGet('#sidebarClose');

  if (!sidebar || !sidebarToggle) return;

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  if (sidebarClose) {
    sidebarClose.addEventListener('click', () => {
      sidebar.classList.remove('active');
    });
  }

  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
    }
  });

  $$('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      $$('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: 'smooth'
        });
      }
      
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
      }
    });
  });
})();

// =========================
// AUTHENTICATION SYSTEM
// =========================
(function authentication() {
  const loginModal = safeGet('loginModal');
  const signupModal = safeGet('signupModal');

  if (!loginModal || !signupModal) return;

  function openLogin() {
    loginModal.style.display = 'block';
    signupModal.style.display = 'none';
  }

  function openSignup() {
    signupModal.style.display = 'block';
    loginModal.style.display = 'none';
  }

  function closeAuthModal() {
    loginModal.style.display = 'none';
    signupModal.style.display = 'none';
  }

  function switchToSignup() {
    openSignup();
  }

  function switchToLogin() {
    openLogin();
  }

  window.openLogin = openLogin;
  window.openSignup = openSignup;
  window.closeAuthModal = closeAuthModal;
  window.switchToSignup = switchToSignup;
  window.switchToLogin = switchToLogin;

  window.addEventListener('click', (e) => {
    if (e.target === loginModal || e.target === signupModal) {
      closeAuthModal();
    }
  });

  $$('.auth-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (form.parentElement.id === 'loginModal') {
        const email = $('#loginEmail').value;
        const password = $('#loginPassword').value;
        
        if (email && password) {
          alert('Login successful! Redirecting to your dashboard...');
          closeAuthModal();
          window.open('user-dashboard.html', '_blank');
        } else {
          alert('Please fill in all fields.');
        }
      } else {
        const name = $('#signupName').value;
        const email = $('#signupEmail').value;
        const password = $('#signupPassword').value;
        const confirmPassword = $('#signupConfirm').value;
        
        if (!name || !email || !password || !confirmPassword) {
          alert('Please fill in all fields.');
          return;
        }
        
        if (password !== confirmPassword) {
          alert('Passwords do not match.');
          return;
        }
        
        if (password.length < 6) {
          alert('Password must be at least 6 characters long.');
          return;
        }
        
        alert('Account created successfully! Welcome to Explore Mabini.');
        closeAuthModal();
        window.open('welcome.html', '_blank');
      }
    });
  });
})();

// =========================
// PARTICLE EFFECTS
// =========================
(function particles() {
  const particlesContainer = safeGet('particles');
  if (!particlesContainer) return;

  function createParticles() {
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      
      const size = Math.random() * 6 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 5;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      
      particlesContainer.appendChild(particle);
    }
  }

  createParticles();
})();

// =========================
// MODAL SYSTEM
// =========================
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
  let currentModalIndex = 0;

  function openForSlideId(id) {
    const slide = document.querySelector(`.slide[data-id="${id}"]`);
    if (!slide) return;
    
    currentModalIndex = slides.indexOf(slide);
    const img = slide.querySelector('img');
    const title = slide.querySelector('h3') ? slide.querySelector('h3').textContent : (slide.getAttribute('aria-label') || '');
    const desc = slide.querySelector('.desc') ? slide.querySelector('.desc').textContent : '';
    
    modalTitle.textContent = title;
    modalText.textContent = desc;
    modalSlide.innerHTML = img ? `<img src="${img.src}" alt="${img.alt || title}">` : '';

    const anchor = slide.querySelector('a[href^="https://www.google.com/maps"]');
    if (modalMap) {
      modalMap.href = anchor ? anchor.href : '#';
    }

    modalBackdrop.setAttribute('aria-hidden', 'false');
    modalBackdrop.style.display = 'flex';
    modalBackdrop.classList.add('open');
    
    const focusables = modalBackdrop.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    (focusables[0] || modalClose).focus();
    announce(`${title} opened`);
  }

  $$('[data-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-open');
      openForSlideId(id);
    });
  });

  function closeModal() {
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    modalBackdrop.style.display = 'none';
    announce('Modal closed');
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  function navigateModal(dir = 1) {
    currentModalIndex = (currentModalIndex + dir + slides.length) % slides.length;
    const slide = slides[currentModalIndex];
    if (!slide) return;
    
    const img = slide.querySelector('img');
    const title = slide.querySelector('h3') ? slide.querySelector('h3').textContent : '';
    const desc = slide.querySelector('.desc') ? slide.querySelector('.desc').textContent : '';
    
    modalTitle.textContent = title;
    modalText.textContent = desc;
    modalSlide.innerHTML = img ? `<img src="${img.src}" alt="${img.alt || title}">` : '';
    
    const anchor = slide.querySelector('a[href^="https://www.google.com/maps"]');
    if (modalMap) {
      modalMap.href = anchor ? anchor.href : '#';
    }
    announce(`${title} opened`);
  }

  document.addEventListener('keydown', (e) => {
    if (modalBackdrop.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') navigateModal(1);
      if (e.key === 'ArrowLeft') navigateModal(-1);
    }
  });

  if (modalNext) {
    modalNext.addEventListener('click', () => navigateModal(1));
  }
})();

// =========================
// KEYBOARD SHORTCUTS
// =========================
(function shortcuts() {
  window.addEventListener('keydown', (e) => {
    const inField = /input|textarea|select/.test(document.activeElement.tagName.toLowerCase());
    if (inField) return;

    if (e.key.toLowerCase() === 'r') {
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
          try { 
            localStorage.removeItem(`pos_${d.id}`); 
          } catch (err) {}
        }
      });
      announce('Magnifiers reset');
    }
  });
})();

// =========================
// ACCESSIBILITY FEATURES
// =========================
(function accessibility() {
  function handleFirstTab(e) {
    if (e.key === 'Tab') {
      document.documentElement.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);

  if (isReducedMotion) {
    $$('.par-cloud, #mapBase').forEach(el => { 
      if (el) el.style.transition = 'none'; 
    });
  }
})();

// =========================
// SMOOTH SCROLL
// =========================
(function smoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth"
        });
      }
    });
  });
})();

// =========================
// INITIALIZATION
// =========================
window.addEventListener('load', () => {
  announce('Page content loaded');
  
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);
});

// =========================
// RESPONSIVE BEHAVIOR
// =========================
window.addEventListener('resize', () => {
  const sidebar = safeGet('#sidebar');
  if (window.innerWidth > 768 && sidebar) {
    sidebar.classList.remove('active');
  }
});