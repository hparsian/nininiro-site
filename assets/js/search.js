// نی نی نیرو — جستجوی زنده‌ی محصولات (متصل به nininiro-api)
// از همان NNR_API_BASE تعریف‌شده در cart.js استفاده می‌کند.

const NNR_SEARCH = (() => {
  let panel, input, resultsEl, debounceTimer;

  function buildPanel() {
    if (document.getElementById('nnr-search-panel')) return;

    panel = document.createElement('div');
    panel.className = 'nnr-search-panel';
    panel.id = 'nnr-search-panel';
    panel.innerHTML = `
      <div class="nnr-search-inner container">
        <div class="nnr-search-row">
          <input type="text" id="nnr-search-input" placeholder="دنبال چی می‌گردید؟ مثلاً «بادی»..." autocomplete="off">
          <button class="icon-btn" id="nnr-search-close" aria-label="بستن جستجو">✕</button>
        </div>
        <div class="nnr-search-results" id="nnr-search-results"></div>
      </div>
    `;
    document.body.prepend(panel);

    input = document.getElementById('nnr-search-input');
    resultsEl = document.getElementById('nnr-search-results');

    document.getElementById('nnr-search-close').addEventListener('click', closePanel);
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => runSearch(input.value), 300);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    });
  }

  async function runSearch(query) {
    query = query.trim();
    if (query.length < 2) {
      resultsEl.innerHTML = query.length === 0
        ? ''
        : '<p class="nnr-search-hint">حداقل ۲ حرف وارد کنید</p>';
      return;
    }

    resultsEl.innerHTML = '<p class="nnr-search-hint">در حال جستجو...</p>';

    try {
      const res = await fetch(`${NNR_API_BASE}/products/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results = data.results || [];

      if (!results.length) {
        resultsEl.innerHTML = '<p class="nnr-search-hint">محصولی با این عنوان پیدا نشد</p>';
        return;
      }

      resultsEl.innerHTML = results.map(p => `
        <a href="product.html" class="nnr-search-result">
          <span>${p.title}</span>
          <span class="nnr-search-result-price">${NNR.formatToman(p.price)}</span>
        </a>
      `).join('');
    } catch (e) {
      resultsEl.innerHTML = '<p class="nnr-search-hint">خطا در جستجو، دوباره تلاش کنید</p>';
    }
  }

  function openPanel() {
    buildPanel();
    panel.classList.add('open');
    setTimeout(() => input.focus(), 50);
  }

  function closePanel() {
    if (panel) panel.classList.remove('open');
  }

  function attachTriggers() {
    document.querySelectorAll('.icon-btn[aria-label="جستجو"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openPanel();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', attachTriggers);

  return { openPanel, closePanel };
})();
