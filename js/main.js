(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var mobileClose = mobileNav ? mobileNav.querySelector('.mobile-nav-close') : null;
  var mobileFirstLink = mobileNav ? mobileNav.querySelector('a') : null;
  var hideTimer = null;

  function isMenuOpen() {
    return mobileNav && mobileNav.getAttribute('aria-hidden') === 'false';
  }
  function openMenu() {
    if (!mobileNav || !toggle) return;
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    mobileNav.hidden = false;
    // Force reflow so the opacity transition runs from 0
    void mobileNav.offsetHeight;
    mobileNav.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open');
    if (mobileFirstLink) mobileFirstLink.focus();
  }
  function closeMenu() {
    if (!mobileNav || !toggle) return;
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    mobileNav.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
    hideTimer = setTimeout(function () {
      if (!isMenuOpen()) mobileNav.hidden = true;
      hideTimer = null;
    }, 260);
    toggle.focus();
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      if (isMenuOpen()) closeMenu(); else openMenu();
    });
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isMenuOpen()) closeMenu();
    });
  }

  /* ---------- header shadow on scroll ---------- */
  var siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    var setScrolled = function () {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  /* ---------- scroll spy: highlight active section in nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.primary-nav a[href^="#"]'));
  var spyTargets = navLinks.map(function (link) {
    var id = link.getAttribute('href').slice(1);
    return { link: link, el: document.getElementById(id) };
  }).filter(function (t) { return t.el; });

  if (spyTargets.length && 'IntersectionObserver' in window) {
    var clearActive = function () {
      navLinks.forEach(function (l) {
        l.classList.remove('is-active');
        l.removeAttribute('aria-current');
      });
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var match = spyTargets.find(function (t) { return t.el === entry.target; });
        if (!match) return;
        clearActive();
        match.link.classList.add('is-active');
        match.link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spyTargets.forEach(function (t) { spy.observe(t.el); });
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

  /* ---------- mailing list form ---------- */
  // TODO: Wire to a real list provider (Mailchimp, Buttondown, Formspree) before launch.
  // Replace action="/subscribe" on .mailing-form with the provider's endpoint and the
  // early-return below will be bypassed.
  var mailingForm = document.querySelector('.mailing-form');
  if (mailingForm) {
    var mailingStatus = mailingForm.querySelector('.form-status');
    function showMailingStatus(message, type) {
      if (!mailingStatus) return;
      mailingStatus.hidden = false;
      mailingStatus.className = 'form-status mailing-status is-' + type;
      mailingStatus.textContent = message;
    }
    mailingForm.addEventListener('submit', function (e) {
      var action = mailingForm.getAttribute('action') || '';
      if (action === '/subscribe' || action === '') {
        e.preventDefault();
        if (!mailingForm.checkValidity()) {
          showMailingStatus('Please enter a valid email address.', 'error');
          return;
        }
        showMailingStatus("Thanks — you're on the list.", 'ok');
        mailingForm.reset();
      }
    });
  }
})();
