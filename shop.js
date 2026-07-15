/* =========================================================
   F-SQUARE — shop page
   Renders the product grid from PRODUCTS (products.js),
   wires up category/fabric filters, sorting, and reads the
   ?category= / ?search= URL params set by the nav search bar
   and footer links.
========================================================= */

(function () {
  const grid = document.getElementById('productGrid');
  const countEl = document.getElementById('shopCount');
  const sortEl = document.getElementById('shopSort');
  const categoryInputs = document.querySelectorAll('#categoryFilters input[name="category"]');
  const fabricWrap = document.getElementById('fabricFilters');
  if (!grid || typeof PRODUCTS === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  let state = {
    category: params.get('category') || 'all',
    fabrics: new Set(),
    search: (params.get('search') || '').toLowerCase(),
    sort: 'default'
  };

  // Build the fabric checkbox list from whatever materials exist in the catalog
  const allFabrics = [...new Set(PRODUCTS.map(p => p.fabric))].sort();
  fabricWrap.innerHTML = allFabrics.map(f => `
    <label class="filter-option">
      <input type="checkbox" name="fabric" value="${f}"> ${f}
    </label>
  `).join('');

  categoryInputs.forEach(input => {
    if (input.value === state.category) input.checked = true;
    input.addEventListener('change', () => {
      state.category = input.value;
      render();
    });
  });

  fabricWrap.addEventListener('change', (e) => {
    if (e.target.name !== 'fabric') return;
    if (e.target.checked) state.fabrics.add(e.target.value);
    else state.fabrics.delete(e.target.value);
    render();
  });

  sortEl.addEventListener('change', () => {
    state.sort = sortEl.value;
    render();
  });

  function money(n) {
    return '₦' + n.toLocaleString();
  }

  function getFiltered() {
    let list = PRODUCTS.filter(p => {
      const matchesCategory = state.category === 'all' || p.category === state.category;
      const matchesFabric = state.fabrics.size === 0 || state.fabrics.has(p.fabric);
      const matchesSearch = !state.search ||
        p.name.toLowerCase().includes(state.search) ||
        p.fabric.toLowerCase().includes(state.search) ||
        p.category.toLowerCase().includes(state.search);
      return matchesCategory && matchesFabric && matchesSearch;
    });

    if (state.sort === 'price-asc') list = list.slice().sort((a, b) => a.price - b.price);
    if (state.sort === 'price-desc') list = list.slice().sort((a, b) => b.price - a.price);
    if (state.sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }

  function cardHTML(p) {
    return `
      <article class="product-card" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-fabric-type="${p.fabric}" data-img="${p.img}">
        <div class="product-card__img">
          <img src="${p.img}" alt="${p.name}" loading="lazy">
          <span class="product-card__badge">${p.fabric}</span>
        </div>
        <div class="product-card__body">
          <span class="product-card__fabric">${p.category}</span>
          <h3 class="product-card__name product-name">${p.name}</h3>
          <p class="product-card__price product-price">${money(p.price)}</p>
          <button class="product-card__cta btn btn--dark js-add-to-cart">Add to cart</button>
        </div>
      </article>
    `;
  }

  function render() {
    const list = getFiltered();
    grid.innerHTML = list.length
      ? list.map(cardHTML).join('')
      : `<p class="shop-empty">No styles match your filters. Try clearing a filter or searching a different material.</p>`;
    countEl.textContent = `${list.length} style${list.length === 1 ? '' : 's'}`;
    // cart.js listens for this to (re)bind Add to Cart buttons on the new cards
    document.dispatchEvent(new CustomEvent('fsquare:grid-rendered'));
  }

  // React to the search bar redirecting here with ?search=
  document.addEventListener('fsquare:search', (e) => {
    state.search = (e.detail || '').toLowerCase();
    render();
  });

  render();
})();
