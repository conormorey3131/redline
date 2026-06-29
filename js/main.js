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

  /* ---------- forms (Web3Forms) ---------- */
  //
  // ====================================================================
  //  PASTE YOUR WEB3FORMS ACCESS KEY BELOW (this is the only thing to set)
  //  Get it free at https://web3forms.com — enter cian@redlineevents.ie,
  //  and they email you an access key (a UUID). Submissions from BOTH the
  //  contact form then lands in that inbox.
  // ====================================================================
  var WEB3FORMS_ACCESS_KEY = '9a171388-73d1-47c0-9ca3-53ba08fcdbf5';

  function wireForm(selector, opts) {
    var form = document.querySelector(selector);
    if (!form) return;
    var status = form.querySelector('.form-status');

    // Inject the access key once so it only needs setting in one place.
    if (!form.querySelector('input[name="access_key"]')) {
      var keyInput = document.createElement('input');
      keyInput.type = 'hidden';
      keyInput.name = 'access_key';
      keyInput.value = WEB3FORMS_ACCESS_KEY;
      form.appendChild(keyInput);
    }

    function showStatus(message, type) {
      if (!status) return;
      status.hidden = false;
      status.className = opts.statusClass + ' is-' + type;
      status.textContent = message;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        showStatus(opts.invalidMsg, 'error');
        form.reportValidity();
        return;
      }

      if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
        showStatus('Form is not configured yet. Please email cian@redlineevents.ie directly.', 'error');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var btnLabel = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      showStatus('Sending…', 'pending');

      fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (r) {
          if (r.ok && r.data && r.data.success) {
            showStatus(opts.successMsg, 'ok');
            form.reset();
          } else {
            showStatus(opts.errorMsg, 'error');
          }
        })
        .catch(function () {
          showStatus(opts.errorMsg, 'error');
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
        });
    });
  }

  wireForm('.contact-form', {
    statusClass: 'form-status',
    invalidMsg: 'Please fill in all required fields.',
    successMsg: "Thanks — we'll be in touch within one working day.",
    errorMsg: 'Sorry, something went wrong. Please email cian@redlineevents.ie directly.'
  });
})();
