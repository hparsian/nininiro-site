// نی نی نی رو — رفتارهای مشترک سایت
document.addEventListener('DOMContentLoaded', () => {

  // آکاردئون سوالات متداول
  document.querySelectorAll('.accordion-item > button').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      item.classList.toggle('open');
      btn.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    });
  });

  // انتخاب سایز
  document.querySelectorAll('.size-pills').forEach(group => {
    group.querySelectorAll('button').forEach(pill => {
      pill.addEventListener('click', () => {
        group.querySelectorAll('button').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });
  });

  // انتخاب رنگ
  document.querySelectorAll('.color-swatches').forEach(group => {
    group.querySelectorAll('button').forEach(sw => {
      sw.addEventListener('click', () => {
        group.querySelectorAll('button').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
      });
    });
  });

  // منوی موبایل
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open-mobile');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // فرم خبرنامه (نمایشی)
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const original = btn.textContent;
      btn.textContent = 'ثبت شد ✓';
      setTimeout(() => { btn.textContent = original; form.reset(); }, 2200);
    });
  });

  // بستن پنل موبایل با کلیک روی لینک
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav) mainNav.classList.remove('open-mobile');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    });
  });
});
