/* ============================================================
   York Develops — Main JS
   yorkdevelops.com
   ============================================================ */

(function () {
  'use strict';

  /* --- Theme Toggle --- */
  const THEME_KEY = 'yd-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* --- Mobile Nav --- */
  function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');

    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', function () {
      const isOpen = mobileNav.classList.contains('open');
      mobileNav.classList.toggle('open', !isOpen);
      hamburger.setAttribute('aria-expanded', !isOpen);
      hamburger.innerHTML = isOpen ? '&#9776;' : '&#10005;';
    });

    // Close mobile nav when a link is clicked
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = '&#9776;';
      });
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = '&#9776;';
      }
    });
  }

  /* --- Active Nav Link --- */
  function setActiveNavLink() {
    const path = window.location.pathname;

    // Normalize path — strip trailing slash, get first segment
    const normalized = path.replace(/\/$/, '') || '/';
    const segment = normalized.split('/').filter(Boolean)[0] || '';

    document.querySelectorAll('.nav__links a, .nav__mobile-links a').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;

      let isActive = false;

      if (href === '/' || href === '../' || href === '../../' || href === 'index.html') {
        isActive = segment === '';
      } else {
        const hrefSegment = href.replace(/^\//, '').replace(/\/$/, '').split('/')[0];
        isActive = segment === hrefSegment;
      }

      link.classList.toggle('active', isActive);
    });
  }

  /* --- Smooth Scroll for Anchor Links --- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;
          const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* --- Copy Code Buttons --- */
  function initCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const text = btn.getAttribute('data-copy');
        if (!text) return;
        navigator.clipboard.writeText(text).then(function () {
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = original; }, 1500);
        }).catch(function () {
          // Fallback for older browsers
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        });
      });
    });
  }

  /* --- Scroll-triggered fade-in (no library needed) --- */
  function initScrollReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 400ms ease, transform 400ms ease';
      observer.observe(el);
    });
  }

  /* --- Init --- */
  document.addEventListener('DOMContentLoaded', function () {
    // Apply theme before render to avoid flash
    applyTheme(getPreferredTheme());

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    initMobileNav();
    setActiveNavLink();
    initSmoothScroll();
    initCopyButtons();
    initScrollReveal();
  });

  // Apply theme immediately (before DOMContentLoaded) to avoid FOUC
  applyTheme(getPreferredTheme());
})();
