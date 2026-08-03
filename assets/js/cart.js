// نی نی نیرو — اتصال سبد خرید به بک‌اند (nininiro-api)
//
// ⚠️ قبل از انتشار: این آدرس را با آدرس واقعی API که هاست کردی جایگزین کن.
const NNR_API_BASE = 'https://api.nininiro.ir/api';

const NNR = (() => {
  const TOKEN_KEY = 'nnr_cart_token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  }

  async function apiFetch(path, options = {}) {
    let res;
    try {
      res = await fetch(NNR_API_BASE + path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Cart-Token': getToken(),
          ...(options.headers || {}),
        },
      });
    } catch (networkError) {
      // یعنی اصلاً به سرور API وصل نشدیم (هنوز راه‌اندازی نشده یا قطعیه) —
      // به‌جای خطای فنی انگلیسی، یه پیام قابل‌فهم فارسی نشون بده
      throw new Error('فروشگاه هنوز آماده‌ی خرید آنلاین نیست، به‌زودی فعال می‌شود.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'خطایی رخ داد، لطفاً دوباره تلاش کنید');
    }
    return data;
  }

  async function addToCart(variantId, quantity = 1) {
    const data = await apiFetch('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId, quantity }),
    });
    setToken(data.cart_token);
    renderCart(data.items, data.total);
    openDrawer();
    return data;
  }

  async function updateItem(variantId, quantity) {
    const data = await apiFetch('/cart/update', {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId, quantity }),
    });
    renderCart(data.items, data.total);
    return data;
  }

  async function fetchCart() {
    if (!getToken()) {
      renderCart([], 0);
      return;
    }
    try {
      const data = await apiFetch('/cart', { method: 'GET' });
      setToken(data.cart_token);
      renderCart(data.items, data.total);
    } catch (e) {
      // توکن نامعتبر/منقضی — سبد را خالی نشان بده، مشکلی نیست
      renderCart([], 0);
    }
  }

  async function checkout(customer) {
    return apiFetch('/checkout', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  function formatToman(n) {
    return new Intl.NumberFormat('fa-IR').format(n) + ' تومان';
  }

  // ---------- رابط کاربری سبد خرید (drawer) ----------

  function buildDrawer() {
    if (document.getElementById('nnr-cart-drawer')) return;

    const overlay = document.createElement('div');
    overlay.className = 'nnr-cart-overlay';
    overlay.id = 'nnr-cart-overlay';

    const drawer = document.createElement('aside');
    drawer.className = 'nnr-cart-drawer';
    drawer.id = 'nnr-cart-drawer';
    drawer.innerHTML = `
      <div class="nnr-cart-head">
        <h3>سبد خرید</h3>
        <button class="nnr-cart-close" aria-label="بستن">✕</button>
      </div>
      <div class="nnr-cart-body" id="nnr-cart-body"></div>
      <div class="nnr-cart-foot">
        <div class="nnr-cart-total">
          <span>جمع کل</span>
          <strong id="nnr-cart-total">۰ تومان</strong>
        </div>
        <a href="checkout.html" class="btn btn-primary" style="width:100%;" id="nnr-cart-checkout-btn">ادامه‌ی خرید</a>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    overlay.addEventListener('click', closeDrawer);
    drawer.querySelector('.nnr-cart-close').addEventListener('click', closeDrawer);
  }

  function openDrawer() {
    buildDrawer();
    document.getElementById('nnr-cart-overlay').classList.add('open');
    document.getElementById('nnr-cart-drawer').classList.add('open');
  }

  function closeDrawer() {
    const overlay = document.getElementById('nnr-cart-overlay');
    const drawer = document.getElementById('nnr-cart-drawer');
    if (overlay) overlay.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
  }

  function renderCart(items, total) {
    buildDrawer();

    const body = document.getElementById('nnr-cart-body');
    const totalEl = document.getElementById('nnr-cart-total');
    const checkoutBtn = document.getElementById('nnr-cart-checkout-btn');

    updateBadge(items.reduce((sum, i) => sum + i.quantity, 0));

    if (!items.length) {
      body.innerHTML = `<p class="nnr-cart-empty">سبد خرید شما خالی است</p>`;
      totalEl.textContent = formatToman(0);
      checkoutBtn.classList.add('disabled');
      checkoutBtn.setAttribute('aria-disabled', 'true');
      return;
    }

    checkoutBtn.classList.remove('disabled');
    checkoutBtn.removeAttribute('aria-disabled');

    body.innerHTML = items.map(item => `
      <div class="nnr-cart-item" data-variant-id="${item.variant_id}">
        <div class="nnr-cart-item-info">
          <span class="nnr-cart-item-title">${item.title}</span>
          <span class="nnr-cart-item-variant">${[item.size, item.color].filter(Boolean).join('، ')}</span>
          <span class="nnr-cart-item-price">${formatToman(item.price)}</span>
        </div>
        <div class="nnr-cart-item-qty">
          <button class="nnr-qty-btn" data-action="dec">−</button>
          <span>${item.quantity}</span>
          <button class="nnr-qty-btn" data-action="inc">+</button>
        </div>
      </div>
    `).join('');

    totalEl.textContent = formatToman(total);

    body.querySelectorAll('.nnr-cart-item').forEach(row => {
      const variantId = Number(row.dataset.variantId);
      const qtyLabel = row.querySelector('.nnr-cart-item-qty span');
      row.querySelectorAll('.nnr-qty-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const current = Number(qtyLabel.textContent);
          const next = btn.dataset.action === 'inc' ? current + 1 : current - 1;
          btn.disabled = true;
          try {
            await updateItem(variantId, next);
          } catch (e) {
            alert(e.message);
          } finally {
            btn.disabled = false;
          }
        });
      });
    });
  }

  function updateBadge(count) {
    document.querySelectorAll('.nnr-cart-badge').forEach(el => {
      el.textContent = count > 0 ? count : '';
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function attachCartIconTriggers() {
    // آیکون 🛒 موجود در هدر همه‌ی صفحات را به drawer وصل می‌کند
    document.querySelectorAll('.icon-btn[aria-label="سبد خرید"]').forEach(btn => {
      btn.style.position = 'relative';
      const badge = document.createElement('span');
      badge.className = 'nnr-cart-badge';
      btn.appendChild(badge);
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer();
      });
    });
  }

  function init() {
    attachCartIconTriggers();
    fetchCart();
  }

  return { init, addToCart, updateItem, fetchCart, checkout, formatToman, openDrawer, closeDrawer };
})();

document.addEventListener('DOMContentLoaded', () => NNR.init());
