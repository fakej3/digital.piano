/* ===================================================
   InstrumentVerse — router.js
   Hash-based SPA router for GitHub Pages compatibility
   =================================================== */

const Router = (() => {
  const handlers = {};
  let current = null;
  const onChangeCallbacks = [];

  function navigate(page) {
    window.location.hash = '#' + page;
  }

  function getPage() {
    const hash = window.location.hash.slice(1);
    return hash || 'home';
  }

  function on(page, fn) { handlers[page] = fn; }

  function onChange(fn) { onChangeCallbacks.push(fn); }

  function show(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(el => {
      el.classList.remove('active');
    });

    // Show target
    const el = document.getElementById('page-' + page);
    if (!el) {
      show('home');
      return;
    }
    el.classList.add('active');
    current = page;

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.nav === page);
    });

    // Close mobile nav
    document.getElementById('navLinks')?.classList.remove('open');

    // Call handler
    if (handlers[page]) handlers[page](page);
    onChangeCallbacks.forEach(fn => fn(page));

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function init() {
    window.addEventListener('hashchange', () => show(getPage()));
    // Handle all [data-nav] clicks via delegation
    document.addEventListener('click', e => {
      const target = e.target.closest('[data-nav]');
      if (target) {
        e.preventDefault();
        navigate(target.dataset.nav);
      }
    });
    // Show initial page
    show(getPage());
  }

  function getCurrent() { return current; }

  return { navigate, on, onChange, init, getCurrent, getPage };
})();
