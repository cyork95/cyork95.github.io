/* ============================================================
   York Develops — Shared Site Chrome
   yorkdevelops.com
   Injects the site nav (#site-nav) and footer (#site-footer).

   ORDERING: load this script synchronously in <head> BEFORE
   /js/main.js. It registers its DOMContentLoaded listener first,
   so the injected elements always exist before main.js init runs
   (theme toggle, mobile nav, active-link highlighting).
   ============================================================ */

(function () {
  'use strict';

  var NAV_HTML =
    '<nav class="nav" aria-label="Main navigation">' +
    '<div class="nav__inner">' +
    '<a href="/" class="nav__logo">York<span>.</span>dev</a>' +
    '<ul class="nav__links" role="list">' +
    '<li><a href="/about/">About</a></li>' +
    '<li><a href="/work/">Work</a></li>' +
    '<li><a href="/projects/">Projects</a></li>' +
    '<li><a href="/creations/">Creations</a></li>' +
    '<li><a href="/blog/">Blog</a></li>' +
    '<li><a href="/contact/">Contact</a></li>' +
    '</ul>' +
    '<div class="nav__actions">' +
    '<button class="nav__theme-toggle" id="themeToggle" aria-label="Switch to light mode">&#9788;</button>' +
    '<button class="nav__hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav">&#9776;</button>' +
    '</div>' +
    '</div>' +
    '<!-- Mobile nav -->' +
    '<div class="nav__mobile" id="mobileNav" role="dialog" aria-label="Mobile navigation">' +
    '<ul class="nav__mobile-links" role="list">' +
    '<li><a href="/about/">About</a></li>' +
    '<li><a href="/work/">Work</a></li>' +
    '<li><a href="/projects/">Projects</a></li>' +
    '<li><a href="/creations/">Creations</a></li>' +
    '<li><a href="/blog/">Blog</a></li>' +
    '<li><a href="/contact/">Contact</a></li>' +
    '</ul>' +
    '</div>' +
    '</nav>';

  var FOOTER_HTML =
    '<footer class="footer" role="contentinfo">' +
    '<div class="footer__inner">' +
    '<div class="footer__left">' +
    '<p class="footer__brand">York<span>Develops</span>.com</p>' +
    '<p class="footer__privacy">No analytics &middot; No tracking &middot; No cookies</p>' +
    '</div>' +
    '<nav class="footer__links" aria-label="Footer navigation">' +
    '<a href="https://github.com/cyork95" target="_blank" rel="noopener">GitHub</a>' +
    '<a href="https://medium.com/@yorkc36" target="_blank" rel="noopener">Medium</a>' +
    '<a href="https://thepromptkitchen.fyi" target="_blank" rel="noopener" class="footer__pk-link">The Prompt Kitchen</a>' +
    '<a href="/blog/">Blog</a>' +
    '<a href="/my-sites/">My Sites</a>' +
    '<a href="/contact/">Contact</a>' +
    '</nav>' +
    '</div>' +
    '</footer>';

  function build(html, extraClass) {
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    var el = tpl.content.firstElementChild;
    if (extraClass && el) {
      extraClass.split(/\s+/).forEach(function (cls) {
        if (cls) el.classList.add(cls);
      });
    }
    return el;
  }

  function inject() {
    var navSlot = document.getElementById('site-nav');
    if (navSlot) {
      navSlot.replaceWith(build(NAV_HTML, navSlot.getAttribute('data-extra-class')));
    }
    var footerSlot = document.getElementById('site-footer');
    if (footerSlot) {
      footerSlot.replaceWith(build(FOOTER_HTML, footerSlot.getAttribute('data-extra-class')));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
