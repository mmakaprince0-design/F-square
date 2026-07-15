/* =========================================================
   F-SQUARE — CART SYSTEM
   - Grid-based cart cards (responsive: desktop + Android)
   - Quantity calculator with live subtotal/total
   - Fashion "orbit" showcase on the cart page
========================================================= */

let cart = JSON.parse(localStorage.getItem('f-square-cart')) || [];

function init() {
  updateBadge();
  ensureDrawer();
  bindCartIcons();

  // Event delegation so "Add to Cart" works even on grids that get
  // re-rendered later (e.g. shop.js re-drawing after a filter change).
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-add-to-cart');
    if (!btn) return;
    const card = btn.closest('.product-card');
    if (!card) return;
    const product = {
      id: card.dataset.id,
      name: card.dataset.name,
      price: parseInt(card.dataset.price, 10),
      img: card.dataset.img,
      qty: 1
    };
    addToCart(product);
  });

  // If we're on the Cart page
  if (document.getElementById('cartLayout')) {
    renderCartPage();
    renderOrbit();
  }
}

/* ---------------------------------------------------------
   Cart icon → opens the quick-view drawer instead of
   navigating away (except when already on the cart page,
   where the link just acts as a normal "you are here" icon).
--------------------------------------------------------- */
function bindCartIcons() {
  const onCartPage = /cart\.html/.test(window.location.pathname);
  document.querySelectorAll('a[aria-label="Cart"]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (onCartPage) return; // let it behave as a normal link there
      e.preventDefault();
      openDrawer();
    });
  });
}

function addToCart(newProduct) {
  const existing = cart.find(item => item.id === newProduct.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push(newProduct);
  }
  saveAndRefresh();
  showToast(`${newProduct.name} added to cart`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveAndRefresh();
}

function updateQty(id, delta) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) return removeFromCart(id);
  }
  saveAndRefresh();
}

function setQty(id, value) {
  const item = cart.find(item => item.id === id);
  if (!item) return;
  const qty = Math.max(1, Math.min(99, parseInt(value, 10) || 1));
  item.qty = qty;
  saveAndRefresh();
}

function saveAndRefresh() {
  localStorage.setItem('f-square-cart', JSON.stringify(cart));
  updateBadge();
  renderDrawer();
  if (document.getElementById('cartLayout')) {
    renderCartPage();
    renderOrbit();
  }
}

function updateBadge() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('[data-cart-count]').forEach(badge => {
    badge.innerText = count;
    badge.classList.toggle('is-hidden', count === 0);
    badge.classList.remove('is-popping');
    void badge.offsetWidth;
    badge.classList.add('is-popping');
  });
}

/* ---------------------------------------------------------
   Toast feedback (replaces blocking alert())
--------------------------------------------------------- */
function showToast(message) {
  let wrap = document.getElementById('fsToast');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'fsToast';
    wrap.className = 'toast';
    document.body.appendChild(wrap);
  }
  wrap.textContent = message;
  wrap.classList.remove('is-visible');
  // restart animation
  void wrap.offsetWidth;
  wrap.classList.add('is-visible');
  clearTimeout(wrap._t);
  wrap._t = setTimeout(() => wrap.classList.remove('is-visible'), 2400);
}

/* ---------------------------------------------------------
   Cart page — grid of items + calculator
--------------------------------------------------------- */
function money(n) {
  return '₦' + n.toLocaleString();
}

function renderCartPage() {
  const container = document.getElementById('cartLayout');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Browse the collection and find something worth wearing forward.</p>
        <a href="shop.html" class="btn btn--dark">Continue shopping</a>
      </div>`;
    return;
  }

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? (subtotal >= 30000 ? 0 : 2500) : 0;
  const total = subtotal + shipping;

  const cardsHTML = cart.map(item => `
    <article class="cart-card" data-id="${item.id}">
      <button class="cart-card__remove" onclick="removeFromCart('${item.id}')" aria-label="Remove ${item.name}">✕</button>
      <div class="cart-card__img">
        <img src="${item.img}" alt="${item.name}">
      </div>
      <div class="cart-card__body">
        <h3 class="cart-card__name">${item.name}</h3>
        <p class="cart-card__price">${money(item.price)}</p>

        <div class="cart-calc">
          <button class="cart-calc__btn" onclick="updateQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
          <input class="cart-calc__input" type="number" min="1" max="99" value="${item.qty}"
                 onchange="setQty('${item.id}', this.value)" aria-label="Quantity for ${item.name}">
          <button class="cart-calc__btn" onclick="updateQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
        </div>

        <p class="cart-card__line-total">${money(item.price * item.qty)}</p>
      </div>
    </article>
  `).join('');

  container.innerHTML = `
    <div class="cart-grid">${cardsHTML}</div>
    <aside class="cart-summary">
      <h3>Order summary</h3>
      <div class="summary-row"><span>Items (${itemCount})</span><span>${money(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : money(shipping)}</span></div>
      ${shipping > 0 ? `<p class="cart-summary__note">Free shipping on orders over ${money(30000)}.</p>` : ''}
      <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
      <button class="btn btn--dark">Checkout now</button>
    </aside>
  `;
}

/* ---------------------------------------------------------
   Fashion orbit — rotating showcase on the cart page
--------------------------------------------------------- */
function renderOrbit() {
  const stage = document.getElementById('fashionOrbit');
  if (!stage || typeof PRODUCTS === 'undefined') return;

  const inCart = new Set(cart.map(i => i.id));
  let picks = PRODUCTS.filter(p => !inCart.has(p.id));
  if (picks.length < 6) picks = PRODUCTS.slice();
  picks = picks.slice(0, 8);

  const angleStep = 360 / picks.length;
  const itemsHTML = picks.map((p, i) => `
    <li class="orbit-item" style="--angle:${i * angleStep}deg;">
      <button class="orbit-card" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}" data-fabric-type="${p.fabric}">
        <img src="${p.img}" alt="${p.name}">
      </button>
    </li>
  `).join('');

  stage.innerHTML = `
    <div class="orbit-stage">
      <ul class="orbit-ring">${itemsHTML}</ul>
      <div class="orbit-center">
        <span class="eyebrow">Complete the look</span>
        <p>Tap a piece to add it</p>
      </div>
    </div>
  `;

  stage.querySelectorAll('.orbit-card').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseInt(btn.dataset.price, 10),
        img: btn.dataset.img,
        qty: 1
      });
    });
  });
}

/* ---------------------------------------------------------
   Quick-view cart drawer — built once, reused on every page
--------------------------------------------------------- */
function ensureDrawer() {
  if (document.getElementById('fsCartDrawer')) return;

  const overlay = document.createElement('div');
  overlay.id = 'fsCartDrawer';
  overlay.className = 'cart-drawer-overlay';
  overlay.innerHTML = `
    <aside class="cart-drawer" role="dialog" aria-label="Your cart">
      <div class="cart-drawer__head">
        <h3>Your cart</h3>
        <button class="cart-drawer__close" aria-label="Close cart">✕</button>
      </div>
      <div class="cart-drawer__body" id="fsCartDrawerBody"></div>
      <div class="cart-drawer__foot" id="fsCartDrawerFoot"></div>
    </aside>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDrawer();
  });
  overlay.querySelector('.cart-drawer__close').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  renderDrawer();
}

function openDrawer() {
  const overlay = document.getElementById('fsCartDrawer');
  if (!overlay) return;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  const overlay = document.getElementById('fsCartDrawer');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function renderDrawer() {
  const body = document.getElementById('fsCartDrawerBody');
  const foot = document.getElementById('fsCartDrawerFoot');
  if (!body || !foot) return;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-drawer__empty">
        <p>Your cart is empty.</p>
        <a href="shop.html" class="btn btn--dark">Start shopping</a>
      </div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-drawer__item" data-id="${item.id}">
      <img src="${item.img}" alt="${item.name}">
      <div>
        <p class="cart-drawer__item-name">${item.name}</p>
        <p class="cart-drawer__item-price">${money(item.price)} each</p>
        <div class="cart-calc">
          <button class="cart-calc__btn" onclick="updateQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
          <input class="cart-calc__input" type="number" min="1" max="99" value="${item.qty}"
                 onchange="setQty('${item.id}', this.value)" aria-label="Quantity for ${item.name}">
          <button class="cart-calc__btn" onclick="updateQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
        </div>
        <button class="cart-drawer__item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
      <p class="cart-drawer__item-total">${money(item.price * item.qty)}</p>
    </div>
  `).join('');

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 30000 ? 0 : 2500;
  const total = subtotal + shipping;

  foot.innerHTML = `
    <div class="summary-row"><span>Items (${itemCount})</span><span>${money(subtotal)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : money(shipping)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
    <div class="cart-drawer__foot-actions">
      <a href="cart.html" class="btn btn--dark">View cart & checkout</a>
      <a href="shop.html" class="btn btn--outline">Keep shopping</a>
    </div>
  `;
}

// Start the logic
document.addEventListener('DOMContentLoaded', init);
