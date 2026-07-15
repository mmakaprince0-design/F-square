/* =========================================================
   F-SQUARE — search bar
   - Live dropdown suggestions (name, fabric, category) as
     the user types, on every page that has the nav search bar
   - Debounced input, keyboard navigation, click-away to close
   - On the shop page, also filters the live grid in place
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('navSearchInput');
  const searchBtn = document.getElementById('navSearchBtn');
  if (!searchInput) return;

  const searchWrap = searchInput.closest('.nav__search');
  let resultsBox = null;
  let activeIndex = -1;
  let debounceTimer = null;

  function ensureResultsBox() {
    if (resultsBox) return resultsBox;
    resultsBox = document.createElement('div');
    resultsBox.className = 'nav__search-results';
    resultsBox.setAttribute('role', 'listbox');
    searchWrap.appendChild(resultsBox);
    return resultsBox;
  }

  function money(n) {
    return '₦' + n.toLocaleString();
  }

  function matchProducts(query) {
    if (typeof PRODUCTS === 'undefined') return [];
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 7);
  }

  function renderResults(query) {
    const box = ensureResultsBox();
    const matches = matchProducts(query);
    activeIndex = -1;

    if (!query.trim()) {
      box.classList.remove('is-open');
      box.innerHTML = '';
      return;
    }

    if (matches.length === 0) {
      box.innerHTML = `<div class="nav__search-empty">No styles or materials match "${query}". Try "Ankara", "Adire", or "fabric".</div>`;
      box.classList.add('is-open');
      return;
    }

    box.innerHTML = matches.map(p => `
      <a href="shop.html?search=${encodeURIComponent(p.name)}" data-id="${p.id}" data-name="${p.name}">
        <img src="${p.img}" alt="${p.name}">
        <span>
          <span class="result-name">${p.name}</span><br>
          <span class="result-price">${p.fabric} · ${money(p.price)}</span>
        </span>
      </a>
    `).join('');
    box.classList.add('is-open');
  }

  function closeResults() {
    if (resultsBox) resultsBox.classList.remove('is-open');
    activeIndex = -1;
  }

  function moveActive(delta) {
    if (!resultsBox) return;
    const links = Array.from(resultsBox.querySelectorAll('a'));
    if (!links.length) return;
    links[activeIndex]?.classList.remove('is-active-result');
    activeIndex = (activeIndex + delta + links.length) % links.length;
    links[activeIndex].classList.add('is-active-result');
    links[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  // 1. Live suggestions + live grid filtering as the user types
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderResults(query);
      if (window.location.pathname.includes('shop.html')) {
        document.dispatchEvent(new CustomEvent('fsquare:search', { detail: query }));
      }
    }, 150);
  });

  // 2. Keyboard navigation through the dropdown
  searchInput.addEventListener('keydown', (e) => {
    const isOpen = resultsBox && resultsBox.classList.contains('is-open');
    if (e.key === 'ArrowDown') {
      if (isOpen) { e.preventDefault(); moveActive(1); }
    } else if (e.key === 'ArrowUp') {
      if (isOpen) { e.preventDefault(); moveActive(-1); }
    } else if (e.key === 'Escape') {
      closeResults();
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0) {
        e.preventDefault();
        resultsBox.querySelectorAll('a')[activeIndex].click();
      } else {
        executeSearch();
      }
    }
  });

  // 3. Search button / redirect to shop with ?search=
  function executeSearch() {
    const query = searchInput.value.trim();
    if (query !== '') {
      window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
    }
  }
  if (searchBtn) searchBtn.addEventListener('click', executeSearch);

  // 4. Click away closes the dropdown
  document.addEventListener('click', (e) => {
    if (searchWrap && !searchWrap.contains(e.target)) closeResults();
  });

  // 5. Landing on shop.html from a search redirect (or footer/category link)
  if (window.location.pathname.includes('shop.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
      searchInput.value = searchQuery;
      // shop.js reads ?search= on its own initial render; this just keeps
      // the input in sync if search.js loads after shop.js.
      document.dispatchEvent(new CustomEvent('fsquare:search', { detail: searchQuery }));
    }
  }
});
