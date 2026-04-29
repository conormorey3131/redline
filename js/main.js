(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var mobileClose = mobileNav ? mobileNav.querySelector('.mobile-nav-close') : null;

  function openMenu() {
    if (!mobileNav) return;
    mobileNav.hidden = false;
    requestAnimationFrame(function () { mobileNav.setAttribute('aria-hidden', 'false'); });
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    if (mobileClose) mobileClose.focus();
  }
  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    setTimeout(function () { mobileNav.hidden = true; }, 250);
    if (toggle) toggle.focus();
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      if (mobileNav.getAttribute('aria-hidden') === 'false') closeMenu(); else openMenu();
    });
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.getAttribute('aria-hidden') === 'false') closeMenu();
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- gallery lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = lightbox ? lightbox.querySelector('img') : null;
  var lbCap = lightbox ? lightbox.querySelector('figcaption') : null;
  var lbClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  var lbPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  var lbNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;

  var galleryButtons = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var openItems = galleryButtons.filter(function (b) { return !b.classList.contains('placeholder'); });
  var currentIndex = -1;
  var lastFocus = null;

  function showAt(index) {
    if (!openItems.length || !lbImg) return;
    currentIndex = ((index % openItems.length) + openItems.length) % openItems.length;
    var btn = openItems[currentIndex];
    var src = btn.getAttribute('data-src');
    var caption = btn.getAttribute('data-caption') || '';
    var img = btn.querySelector('img');
    lbImg.src = src;
    lbImg.alt = (img && img.alt) || caption;
    if (lbCap) lbCap.textContent = caption;
  }

  function openLightbox(fromBtn) {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    var idx = openItems.indexOf(fromBtn);
    if (idx === -1) idx = 0;
    showAt(idx);
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.setAttribute('aria-hidden', 'false'); });
    document.body.classList.add('menu-open');
    if (lbClose) lbClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    setTimeout(function () {
      lightbox.hidden = true;
      if (lbImg) lbImg.src = '';
    }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  galleryButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.classList.contains('placeholder')) return;
      openLightbox(btn);
    });
  });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev) lbPrev.addEventListener('click', function () { showAt(currentIndex - 1); });
    if (lbNext) lbNext.addEventListener('click', function () { showAt(currentIndex + 1); });

    document.addEventListener('keydown', function (e) {
      if (lightbox.getAttribute('aria-hidden') !== 'false') return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft') { showAt(currentIndex - 1); }
      else if (e.key === 'ArrowRight') { showAt(currentIndex + 1); }
      else if (e.key === 'Tab') {
        // Trap focus inside the lightbox
        var focusables = lightbox.querySelectorAll('button');
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- contact form ---------- */
  // TODO: Wire this form to a real endpoint before going live.
  // Easiest option: sign up at https://formspree.io, get your form endpoint
  // (e.g. https://formspree.io/f/abc123), and in index.html replace
  // `action="/contact"` on the .contact-form with your Formspree URL.
  // Once the action is no longer "/contact", the browser will submit normally
  // and the early-return below is bypassed.
  // Alternatives: Netlify Forms (add `netlify` attribute to the <form>) or
  // any backend endpoint that accepts application/x-www-form-urlencoded.
  var form = document.querySelector('.contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    function showStatus(message, type) {
      if (!status) return;
      status.hidden = false;
      status.className = 'form-status is-' + type;
      status.textContent = message;
    }
    form.addEventListener('submit', function (e) {
      var action = form.getAttribute('action') || '';
      if (action === '/contact' || action === '') {
        e.preventDefault();
        if (!form.checkValidity()) {
          showStatus('Please fill in all required fields.', 'error');
          return;
        }
        showStatus("Thanks — we'll be in touch within one working day.", 'ok');
        form.reset();
      }
    });
  }
})();
