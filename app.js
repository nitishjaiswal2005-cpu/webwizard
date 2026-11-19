(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const IMG = 'https://www.technika2026.online/';
  const PATH_LABEL = { code: 'Code Mage', build: 'Artificer', design: 'Illusionist', brain: 'Seer' };

  let DATA = null;
  const state = { day: 'all', q: '', path: null, schedDay: '1' };

  /* ---------- load data: API first (backend), static JSON fallback ---------- */
  async function load() {
    try {
      const r = await fetch('/api/events');
      if (!r.ok) throw new Error('api');
      return await r.json();
    } catch (_) {
      const r = await fetch('events.json');
      return await r.json();
    }
  }

  /* ---------- nav ---------- */
  const burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

  /* ---------- countdown ---------- */
  function startCountdown(startISO) {
    const target = new Date(startISO).getTime();
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      let diff = target - Date.now();
      if (diff <= 0) {
        $('#cdLabel').textContent = 'The fest is live! ✨';
        ['d', 'h', 'm', 's'].forEach((k) => ($('#cd-' + k).textContent = '00'));
        return false;
      }
      const s = Math.floor(diff / 1000);
      $('#cd-d').textContent = pad(Math.floor(s / 86400));
      $('#cd-h').textContent = pad(Math.floor((s % 86400) / 3600));
      $('#cd-m').textContent = pad(Math.floor((s % 3600) / 60));
      $('#cd-s').textContent = pad(s % 60);
      return true;
    };
    if (tick()) { const t = setInterval(() => { if (!tick()) clearInterval(t); }, 1000); }
  }

  /* ---------- events ---------- */
  function renderEvents() {
    const q = state.q.trim().toLowerCase();
    const list = DATA.events.filter((e) => {
      const dayOk = state.day === 'all' || e.days.includes(Number(state.day));
      const qOk = !q || (e.name + ' ' + e.desc + ' ' + e.venue).toLowerCase().includes(q);
      return dayOk && qOk;
    });
    $('#count').textContent = `${list.length} of ${DATA.events.length} events`;
    $('#cards').innerHTML = list.length ? list.map((e, i) => {
      const hit = state.path && e.path.includes(state.path);
      const cls = 'card' + (state.path ? (hit ? ' glow' : ' dim') : '');
      const dayTxt = e.days.length > 1 ? 'Day 1 & 2' : 'Day ' + e.days[0];
      return `<article class="${cls}" style="animation-delay:${Math.min(i, 12) * 40}ms">
        <div class="thumb"><img loading="lazy" src="${IMG}${esc(e.id)}.webp" alt="${esc(e.name)}" onerror="this.remove()">✦</div>
        <div class="card-body">
          <h3>${esc(e.name)}</h3>
          <p>${esc(e.desc)}</p>
          <div class="tags"><span class="day">📅 ${dayTxt} · ${esc(e.time)}</span><span>📍 ${esc(e.venue)}</span></div>
        </div></article>`;
    }).join('') : '<p class="empty">No spell found. Try another word. 🔮</p>';
  }
  $('#search').addEventListener('input', (e) => { state.q = e.target.value; renderEvents(); });
  $('#dayChips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.day = b.dataset.day;
    document.querySelectorAll('#dayChips .chip').forEach((c) => c.classList.toggle('on', c === b));
    renderEvents();
  });

  /* ---------- pathfinder ---------- */
  $('#paths').addEventListener('click', (e) => {
    const b = e.target.closest('.path'); if (!b) return;
    const same = state.path === b.dataset.path;
    state.path = same ? null : b.dataset.path;
    document.querySelectorAll('.path').forEach((p) => p.classList.toggle('on', p === b && !same));
    renderEvents();
    const res = $('#pathResult');
    if (state.path) {
      const n = DATA.events.filter((ev) => ev.path.includes(state.path)).length;
      res.textContent = `You are a ${PATH_LABEL[state.path]}! ${n} events match your path.`;
      $('#events').scrollIntoView({ behavior: 'smooth' });
    } else res.textContent = '';
  });

  /* ---------- schedule ---------- */
  function renderSchedule() {
    $('#timeline').innerHTML = DATA.schedule[state.schedDay].map((s, i) =>
      `<li class="${s.key ? 'key' : ''}" style="animation-delay:${i * 60}ms"><time>${esc(s.time)}</time><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></li>`).join('');
  }
  document.querySelector('.tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab'); if (!b) return;
    state.schedDay = b.dataset.day;
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t === b));
    renderSchedule();
  });

  /* ---------- team / contact / gallery ---------- */
  const initials = (n) => n.replace(/^(Dr\.|Prof\.)\s*/, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  function renderStatic() {
    const f = DATA.fest;
    $('#heroDates').textContent = f.dates;
    $('#heroMap').href = f.mapUrl;
    ['navRegister', 'heroRegister'].forEach((id) => ($('#' + id).href = f.registerUrl));
    $('#heroBrochure').href = f.brochureUrl;
    $('#mailLink').href = 'mailto:' + f.email; $('#mailLink').textContent = f.email;

    $('#teamWrap').innerHTML = Object.entries(DATA.team).map(([g, ms]) =>
      `<div class="team-group"><h3>${esc(g)}</h3><div class="team-grid">${ms.map((m) =>
        `<div class="member"><div class="avatar">${esc(initials(m.name))}</div><div><b>${esc(m.name)}</b><small>${esc(m.role)}</small></div></div>`).join('')}</div></div>`).join('');

    $('#people').innerHTML = DATA.contacts.map((c) =>
      `<li><span><b>${esc(c.name)}</b><small>${esc(c.role)}</small></span><a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a></li>`).join('');
    $('#socials').innerHTML = DATA.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('');
    $('#strip').innerHTML = DATA.gallery.map((g) => `<img loading="lazy" src="${IMG}gallery/${esc(g)}.webp" alt="Past edition moment" onerror="this.remove()">`).join('');
  }

  /* ---------- enquiry form → /api/enquiry ---------- */
  const form = $('#form'), msg = $('#formMsg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(form));
    msg.className = 'form-msg';
    if (!fd.name.trim() || !/^\S+@\S+\.\S+$/.test(fd.email) || fd.message.trim().length < 5) {
      msg.classList.add('err'); msg.textContent = 'Please fill your name, a valid email and a message.'; return;
    }
    const btn = $('#send'); btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const r = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Failed');
      msg.classList.add('ok'); msg.textContent = 'Your owl has been sent! The team will reply soon. 🦉'; form.reset();
    } catch (err) {
      msg.classList.add('err');
      msg.innerHTML = 'Could not send right now. Please email <a href="mailto:' + esc(DATA.fest.email) + '">' + esc(DATA.fest.email) + '</a>.';
    } finally { btn.disabled = false; btn.textContent = 'Send enquiry'; }
  });

  /* ---------- wand sparkles ---------- */
  function sparkles() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = $('#sparkles'), x = c.getContext('2d'); let ps = [];
    const fit = () => { c.width = innerWidth; c.height = innerHeight; };
    fit(); addEventListener('resize', fit);
    addEventListener('pointermove', (e) => {
      for (let i = 0; i < 2; i++) ps.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 1.6, vy: Math.random() * 1.2 + .2, l: 1, s: Math.random() * 2.5 + 1 });
      if (ps.length > 120) ps.splice(0, ps.length - 120);
    }, { passive: true });
    (function loop() {
      x.clearRect(0, 0, c.width, c.height);
      ps = ps.filter((p) => p.l > 0);
      ps.forEach((p) => { p.x += p.vx; p.y += p.vy; p.l -= .025; x.globalAlpha = p.l; x.fillStyle = '#f2c14e'; x.beginPath(); x.arc(p.x, p.y, p.s, 0, 6.283); x.fill(); });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- boot ---------- */
  load().then((d) => {
    DATA = d; renderStatic(); renderEvents(); renderSchedule(); startCountdown(d.fest.start); sparkles();
  }).catch(() => {
    $('#cards').innerHTML = '<p class="empty">Could not load events. Please refresh.</p>';
  });
})();
