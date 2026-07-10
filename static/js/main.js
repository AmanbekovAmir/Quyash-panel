/* ═══════════════════════════════════════════════════════════════════
   ☀️  main.js  —  Күн Панельлери Сайты
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

// ── Globals ───────────────────────────────────────────────────────────────────
let productionChart = null;

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE LOADER
// ═══════════════════════════════════════════════════════════════════════════════
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }
  }, 900);
});

// ═══════════════════════════════════════════════════════════════════════════════
// NAV — scroll effect
// ═══════════════════════════════════════════════════════════════════════════════
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLES (hero background)
// ═══════════════════════════════════════════════════════════════════════════════
function initParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const x = Math.random() * 100;
    const delay = Math.random() * 8;
    const dur = 5 + Math.random() * 8;
    Object.assign(p.style, {
      left    : `${x}%`,
      bottom  : `${Math.random() * 30}%`,
      '--dur' : `${dur}s`,
      '--delay': `${delay}s`,
    });
    container.appendChild(p);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUN RAYS (hero illustration)
// ═══════════════════════════════════════════════════════════════════════════════
function buildSunRays() {
  const sun = document.querySelector('.sun-main');
  if (!sun) return;
  const count = 12;
  for (let i = 0; i < count; i++) {
    const ray = document.createElement('div');
    ray.className = 'sun-ray';
    const angle = (360 / count) * i;
    const dist  = 64; // px from center
    const rad   = (angle - 90) * (Math.PI / 180);
    const tx    = Math.cos(rad) * dist;
    const ty    = Math.sin(rad) * dist;
    Object.assign(ray.style, {
      transform: `translate(${tx}px, ${ty}px) rotate(${angle}deg)`,
      animationDelay: `${(i / count) * 3}s`,
    });
    sun.appendChild(ray);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENERGY BEAMS (panels → sun animation)
// ═══════════════════════════════════════════════════════════════════════════════
function buildBeams() {
  const panels = document.querySelectorAll('.panel-card.lit');
  panels.forEach((panel, i) => {
    const beam = document.createElement('div');
    beam.className = 'energy-beam';
    beam.style.animationDelay = `${i * 0.5}s`;
    beam.style.height = '60px';
    beam.style.top = '-60px';
    panel.appendChild(beam);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════════════════════════════════════
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, idx) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), idx * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTER ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════
function animateCounter(el, target, suffix = '') {
  const isFloat  = String(target).includes('.');
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const t   = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    const val  = isFloat
      ? (ease * target).toFixed(1)
      : Math.floor(ease * target);
    el.textContent = val + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el  = e.target;
        const raw = el.dataset.val || el.textContent;
        const num = parseFloat(raw.replace(/[^\d.]/g, ''));
        const suf = raw.replace(/[\d.]/g, '').replace('-', '–');
        if (!isNaN(num)) animateCounter(el, num, suf);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-value').forEach(el => {
    el.dataset.val = el.textContent.trim();
    io.observe(el);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATS — fetch from API
// ═══════════════════════════════════════════════════════════════════════════════
async function loadStats() {
  try {
    const res  = await fetch('/api/stats');
    const data = await res.json();
    const grid = document.getElementById('stats-grid');
    if (!grid) return;

    grid.innerHTML = data.map(s => `
      <div class="stat-card reveal">
        <div class="stat-icon">${s.icon}</div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-unit">${s.unit}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');

    initReveal();
    initCounters();
  } catch (err) {
    console.warn('Stats API:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FAQ — fetch from API & accordion
// ═══════════════════════════════════════════════════════════════════════════════
async function loadFAQ() {
  try {
    const res  = await fetch('/api/faq');
    const data = await res.json();
    const list = document.getElementById('faq-list');
    if (!list) return;

    list.innerHTML = data.map((item, i) => `
      <div class="faq-item reveal" id="faq-item-${i}">
        <div class="faq-q" onclick="toggleFAQ(${i})" id="faq-q-${i}"
             aria-expanded="false" aria-controls="faq-a-${i}">
          <span>${item.question}</span>
          <em class="faq-arrow">▾</em>
        </div>
        <div class="faq-a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}">
          <div class="faq-a-inner">${item.answer}</div>
        </div>
      </div>
    `).join('');

    initReveal();
  } catch (err) {
    console.warn('FAQ API:', err);
  }
}

function toggleFAQ(idx) {
  const item = document.getElementById(`faq-item-${idx}`);
  const ans  = document.getElementById(`faq-a-${idx}`);
  const q    = document.getElementById(`faq-q-${idx}`);
  const open = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-a').style.maxHeight = null;
    el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });

  if (!open) {
    item.classList.add('open');
    ans.style.maxHeight = ans.scrollHeight + 'px';
    q.setAttribute('aria-expanded', 'true');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEATHER CARDS — interactive
// ═══════════════════════════════════════════════════════════════════════════════
const weatherData = [
  {
    id: 'sunny', icon: '☀️', label: 'Ашық ҳәм күнли',
    pct: 100,
    detail: {
      title: '☀️ Ашық Күнде — Максимал Нәтийжелилик',
      text: 'Ашық, бұлтсыз ҳаўада күн панельлери 100% қуўатта жумыс ислейди. Орташа 1 кВт система күнине 5–6 кВт·сааттан энергия өндиреди. Бул ең жоқары нәтийжелилик режими болып табылады.',
    }
  },
  {
    id: 'cloudy', icon: '⛅', label: 'Бұлтлы',
    pct: 18,
    detail: {
      title: '⛅ Бұлтлы Күнде — Азайған Нәтийжелилик',
      text: 'Бұлт тоқ өндириўди азайтады, бирақ толық тоқтатпайды. Шашыранды ҳәм диффузиялық күн нурлары да фотоэлементлерди қыйнамайды. Нәтийжелилик 10–25% аралығында сақланады.',
    }
  },
  {
    id: 'rain', icon: '🌧️', label: 'Жаңбырлы',
    pct: 10,
    detail: {
      title: '🌧️ Жаңбырлы Ҳаўада — Тазалаў Эффекти',
      text: 'Жаңбыр панель бетиндеги шаң ҳәм кирлерди жуўады, бул узақ мүддетли нәтийжелиликке ижабий тәсир етеди. Тоқ өндириў 5–15% деңгейинде болады.',
    }
  },
  {
    id: 'snow', icon: '❄️', label: 'Қарлы қыс',
    pct: 3,
    detail: {
      title: '❄️ Қар ҳәм Аяз — Тоқтам Мүмкин',
      text: 'Қар панельди жаўып қалса тоқ өндириў тоқтайды. Бирақ қар ериген соң, суық ашық ҳаўада панельлер жоқары нәтийжелиликте жумыс ислейди — суық температура фотоэлементлерге пайдалы.',
    }
  },
  {
    id: 'winter', icon: '🌤️', label: 'Суық ашық',
    pct: 65,
    detail: {
      title: '🌤️ Суық ҳәм Ашық — Жоқары Нәтийжелилик!',
      text: 'Панельлер жылылықтан емес, жарықтан жумыс ислейди. Суық ашық қысқы күнлер шынында да жазғы ыссы күнлерден нәтийжелирек болыўы мүмкин. Себеби жоқары температура панель нәтийжелилигин 0.5%/°C азайтады.',
    }
  },
];

function initWeather() {
  const grid = document.getElementById('weather-grid');
  if (!grid) return;

  grid.innerHTML = weatherData.map((w, i) => `
    <div class="weather-card reveal" id="wcard-${w.id}" onclick="toggleWeather('${w.id}', ${i})">
      <div class="weather-icon">${w.icon}</div>
      <h3>${w.label}</h3>
      <div class="weather-bar-wrap">
        <div class="weather-bar-label">
          <span>Нәтийжелилик</span>
          <span>${w.pct}%</span>
        </div>
        <div class="weather-bar-track">
          <div class="weather-bar-fill" id="wbar-${w.id}" style="width:0"></div>
        </div>
      </div>
    </div>
  `).join('') + `<div class="weather-detail" id="weather-detail"></div>`;

  // Animate bars on scroll
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      weatherData.forEach(w => {
        setTimeout(() => {
          const bar = document.getElementById(`wbar-${w.id}`);
          if (bar) bar.style.width = w.pct + '%';
        }, 300);
      });
      io.disconnect();
    }
  }, { threshold: 0.3 });
  io.observe(grid);

  initReveal();
}

function toggleWeather(id, idx) {
  const detail = document.getElementById('weather-detail');
  const card   = document.getElementById(`wcard-${id}`);
  const w      = weatherData[idx];
  const isOpen = card.classList.contains('active');

  document.querySelectorAll('.weather-card').forEach(c => c.classList.remove('active'));
  detail.classList.remove('show');

  if (!isOpen) {
    card.classList.add('active');
    detail.innerHTML = `
      <h4>${w.detail.title}</h4>
      <p>${w.detail.text}</p>
    `;
    detail.classList.add('show');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════
const rangeEl = document.getElementById('panel-range');
const rangeVal = document.getElementById('panel-val');

if (rangeEl && rangeVal) {
  rangeEl.addEventListener('input', () => {
    rangeVal.textContent = rangeEl.value;
  });
}

async function runCalculator() {
  const btn = document.getElementById('calc-btn');
  btn.classList.add('loading');
  btn.innerHTML = '⏳ Есапланмоқда...';

  const payload = {
    panel_count  : parseInt(document.getElementById('panel-range')?.value || 8),
    panel_watt   : parseInt(document.getElementById('panel-watt')?.value || 400),
    tariff       : parseFloat(document.getElementById('tariff')?.value || 900),
    install_cost : parseFloat(document.getElementById('install-cost')?.value || 8_000_000),
    sun_hours    : parseFloat(document.getElementById('sun-hours')?.value || 5.5),
  };

  try {
    const res  = await fetch('/api/calculate', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });
    const data = await res.json();
    renderResults(data);
    showToast('✅ Есаплаў жуўмақланды!');
  } catch (err) {
    showToast('❌ Серверге байланыс жоқ. Python app.py ислетилсин.');
    console.error(err);
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = '⚡ Есаплаў';
  }
}

function renderResults(d) {
  const box = document.getElementById('results-box');
  const months = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

  box.innerHTML = `
    <div class="result-cards">
      <div class="result-card">
        <div class="r-label">Күнлик өндириў</div>
        <div class="r-val">${d.daily_kwh}</div>
        <div class="r-unit">кВт·сааттан</div>
      </div>
      <div class="result-card">
        <div class="r-label">Айлик өндириў</div>
        <div class="r-val">${d.monthly_kwh}</div>
        <div class="r-unit">кВт·сааттан</div>
      </div>
      <div class="result-card highlight">
        <div class="r-label">Айлик үнем</div>
        <div class="r-val">${formatNum(d.monthly_savings)}</div>
        <div class="r-unit">сум</div>
      </div>
      <div class="result-card highlight">
        <div class="r-label">Жыллик үнем</div>
        <div class="r-val">${formatNum(d.yearly_savings)}</div>
        <div class="r-unit">сум</div>
      </div>
      <div class="result-card">
        <div class="r-label">Өз-өзин ақлаў</div>
        <div class="r-val">${d.payback_years}</div>
        <div class="r-unit">жыл</div>
      </div>
      <div class="result-card">
        <div class="r-label">25 жылдан соңғы таза пайда</div>
        <div class="r-val">${formatNum(d.net_profit_25y)}</div>
        <div class="r-unit">сум</div>
      </div>
    </div>

    <div class="chart-box">
      <h4>📊 Айлар бойынша күн энергиясы өндириўи (кВт·сааттан)</h4>
      <canvas id="prod-chart" height="220"></canvas>
    </div>
  `;

  // Draw chart
  if (productionChart) productionChart.destroy();
  const ctx = document.getElementById('prod-chart').getContext('2d');
  productionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels  : months,
      datasets: [{
        label          : 'Өндириў (кВт·сааттан)',
        data           : d.monthly_production,
        backgroundColor: months.map((_, i) =>
          i >= 3 && i <= 8
            ? 'rgba(255,201,60,0.85)'
            : 'rgba(255,140,0,0.55)'
        ),
        borderColor    : 'rgba(255,201,60,0.3)',
        borderWidth    : 1,
        borderRadius   : 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#8892a4', font: { family: 'Outfit' } } },
        tooltip: { callbacks: {
          label: ctx => ` ${ctx.parsed.y} кВт·сааттан`,
        }},
      },
      scales: {
        x: { ticks: { color: '#8892a4' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#8892a4' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      },
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════════════════
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function formatNum(n) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n));
}

// ═══════════════════════════════════════════════════════════════════════════════
// SMOOTH SCROLL (nav links)
// ═══════════════════════════════════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  buildSunRays();
  buildBeams();
  initReveal();
  initWeather();
  loadStats();
  loadFAQ();
});
