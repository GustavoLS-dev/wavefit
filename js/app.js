/* WaveFit Academia — Prévia de site */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== Dados (grade de aulas coletivas da WaveFit) ===== */
  const CATS = {
    lutas: { label: 'Lutas', color: 'var(--c-lutas)', icon: 'i-glove' },
    danca: { label: 'Dança', color: 'var(--c-danca)', icon: 'i-music' },
    cond: { label: 'Condicionamento', color: 'var(--c-cond)', icon: 'i-kettle' },
    mente: { label: 'Corpo e mente', color: 'var(--c-mente)', icon: 'i-leaf' },
  };
  const CAT_OF = {
    'Jiu-Jitsu': 'lutas', 'Jiu-Jitsu No-Gi': 'lutas', 'Judô': 'lutas', 'Muay Thai': 'lutas',
    'Fit Dance': 'danca', 'Zumba': 'danca', 'Axé': 'danca',
    'Funcional': 'cond', 'GAP': 'cond', 'Step': 'cond', 'Jump': 'cond',
    'Pilates': 'mente',
  };
  // [hora, aula, professor(a)] — 1 = segunda ... 6 = sábado
  const SCHEDULE = {
    manha: {
      1: [['08:00', 'Funcional', 'Katia']],
      2: [['07:00', 'Pilates', 'Mirian'], ['08:00', 'GAP', 'Mirian']],
      3: [],
      4: [],
      5: [['07:00', 'Pilates', 'Mirian']],
      6: [['08:00', 'GAP', 'Mirian'], ['09:00', 'Pilates', 'Mirian'], ['10:00', 'Step', 'Fernanda']],
    },
    noite: {
      1: [['17:00', 'Jiu-Jitsu', 'Rodrigo'], ['18:00', 'Judô', 'André'], ['20:00', 'Muay Thai', 'Cássia']],
      2: [['18:00', 'Jump', 'Fernanda'], ['19:15', 'Fit Dance', 'Felipe'], ['20:15', 'Funcional', 'Pedro'], ['21:15', 'Jiu-Jitsu', 'Rogerio']],
      3: [['17:00', 'Jiu-Jitsu No-Gi', 'Rodrigo'], ['18:00', 'Zumba', 'Katia'], ['19:00', 'Fit Dance', 'Lucas'], ['20:00', 'Muay Thai', 'Cássia']],
      4: [['19:15', 'Fit Dance', 'Felipe'], ['20:15', 'Funcional', 'Pedro'], ['21:15', 'Jiu-Jitsu No-Gi', 'Rogerio']],
      5: [['18:00', 'Pilates', 'Mirian'], ['19:00', 'Fit Dance', 'Lucas'], ['20:00', 'Axé', 'Erick'], ['21:00', 'Muay Thai', 'Cássia']],
      6: [],
    },
  };
  /* ===== Horário de funcionamento — PROVISÓRIO =====
     Troque pelos horários reais. Preenche a tabela "Funcionamento" e o selo
     "Aberto agora" ao lado do WhatsApp. 0 = domingo ... 6 = sábado; null = fechado. */
  const HOURS = {
    0: null,
    1: ['06:00', '23:00'], 2: ['06:00', '23:00'], 3: ['06:00', '23:00'],
    4: ['06:00', '23:00'], 5: ['06:00', '23:00'],
    6: ['08:00', '13:00'],
  };
  const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const DAY_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const svg = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const fmtH = (h) => h.replace(':00', 'h').replace(':', 'h');

  const today = () => {
    try { return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' }).format(new Date())); }
    catch (e) { return new Date().getDay(); }
  };

  /* ===== Aberto agora (fuso de São Paulo) ===== */
  const nowSP = () => {
    try {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
      return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: +p.hour * 60 + +p.minute };
    } catch (e) { const n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  };
  const toMin = (h) => { const [a, b] = h.split(':'); return +a * 60 + +b; };

  function hoursTable() {
    $$('[data-hours]').forEach((td) => {
      const h = HOURS[+td.dataset.hours.split('-')[0]];
      td.textContent = h ? `${fmtH(h[0])} – ${fmtH(h[1])}` : 'Fechado';
    });
  }

  function status() {
    const els = $$('[data-status]'); if (!els.length) return;
    const upd = () => {
      const { d, m } = nowSP();
      const h = HOURS[d];
      const open = !!h && m >= toMin(h[0]) && m < toMin(h[1]);
      let html;
      if (open) html = `Academia aberta agora <small>· até ${fmtH(h[1])}</small>`;
      else {
        // próxima abertura: ainda hoje ou nos próximos dias
        let txt = '';
        if (h && m < toMin(h[0])) txt = `abre hoje às ${fmtH(h[0])}`;
        else for (let i = 1; i <= 7; i++) {
          const nd = (d + i) % 7, nh = HOURS[nd];
          if (nh) { txt = `abre ${i === 1 ? 'amanhã' : DAY_LONG[nd].toLowerCase()} às ${fmtH(nh[0])}`; break; }
        }
        html = `Fechado agora <small>· ${txt}</small>`;
      }
      els.forEach((el) => {
        el.classList.toggle('is-open', open);
        const t = $('[data-status-text]', el); if (t) t.innerHTML = html;
        el.hidden = false;
      });
    };
    upd();
    setInterval(upd, 60000);
  }

  /* ===== Abertura: some sozinha (CSS) e pode ser pulada com um clique ===== */
  const INTRO_MS = 2200;
  const hasIntro = document.documentElement.classList.contains('has-intro');
  function intro() {
    const el = $('[data-intro]'); if (!el) return;
    if (!hasIntro) { el.remove(); return; }
    const end = () => { el.classList.add('is-skip'); setTimeout(() => el.remove(), 50); };
    el.addEventListener('click', () => { document.documentElement.style.setProperty('--intro', '0s'); end(); });
    setTimeout(end, INTRO_MS);
  }

  /* ===== Card "Próxima aula" no hero (a partir da grade real) ===== */
  function nextClass() {
    const box = $('[data-next]'); if (!box) return;
    const { d, m } = nowSP();
    const dayList = (day) => [...(SCHEDULE.manha[day] || []), ...(SCHEDULE.noite[day] || [])].sort((a, b) => toMin(a[0]) - toMin(b[0]));
    for (let i = 0; i < 7; i++) {
      const nd = (d + i) % 7;
      const list = dayList(nd).filter((c) => i > 0 || toMin(c[0]) > m);
      if (!list.length) continue;
      const [h, name, prof] = list[0];
      const cat = CATS[CAT_OF[name]];
      $('[data-next-when]', box).textContent = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : DAY_LONG[nd];
      $('[data-next-name]', box).textContent = name;
      $('[data-next-meta]', box).textContent = `${fmtH(h)} · com ${prof}`;
      const ico = $('[data-next-ico]', box);
      ico.style.setProperty('--c', cat.color);
      ico.innerHTML = svg(cat.icon);
      return;
    }
  }

  /* ===== Hero: água interativa com "WAVE!" meio submerso =====
     Superfície = cadeia de molas. Mouse/dedo empurra a água, clique faz splash,
     bolhas sobem. Acima da água a palavra é sólida; embaixo, só o contorno. */
  function water() {
    const cv = $('[data-water]'); const word = $('[data-word]'); const hero = $('.hero');
    if (!cv || !word || !hero || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    const N = 90, K = .022, DAMP = .03, SPREAD = .24;
    const ys = new Float32Array(N), vs = new Float32Array(N);
    let W = 0, H = 0, dpr = 1, level = 0, wordBox = null, font = '', bubbles = [];
    let running = false, raf = 0, t0 = performance.now();
    const introMs = hasIntro ? 1750 : 0;

    const measure = () => {
      const r = hero.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
      if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
      const wr = word.getBoundingClientRect(); const cs = getComputedStyle(word);
      const fs0 = parseFloat(cs.fontSize);
      // ajusta o tamanho para a palavra caber exatamente na caixa reservada no HTML
      ctx.font = `italic 900 ${fs0}px Montserrat, system-ui, sans-serif`;
      const target = wr.width - parseFloat(cs.paddingRight || 0) - fs0 * .04;
      const fs = fs0 * Math.min(1, target / ctx.measureText('WAVE!').width);
      font = `italic 900 ${fs}px Montserrat, system-ui, sans-serif`;
      ctx.font = font;
      const m = ctx.measureText('WAVE!');
      const asc = m.actualBoundingBoxAscent || fs * .7, desc = m.actualBoundingBoxDescent || 0;
      const top = wr.top - r.top;
      // centraliza a altura real das letras na caixa
      const base = top + (wr.height - (asc + desc)) / 2 + asc;
      wordBox = { x: wr.left - r.left + (m.actualBoundingBoxLeft || 0), base, fs };
      level = base - asc * (fs < 160 ? .3 : .42);   // linha d'água: 30–40% de baixo da palavra submerso
    };
    const idxAt = (x) => Math.max(0, Math.min(N - 1, Math.round((x / W) * (N - 1))));
    const push = (x, f, spread = 2) => {
      const i = idxAt(x);
      for (let k = -spread; k <= spread; k++) { const j = i + k; if (j >= 0 && j < N) vs[j] += f * (1 - Math.abs(k) / (spread + 1)); }
    };
    const bubble = (x, y, n = 1) => { for (let i = 0; i < n; i++) bubbles.push({ x: x + (Math.random() - .5) * 30, y: y + Math.random() * 20, r: 1.5 + Math.random() * 4, v: .4 + Math.random() * .9, w: Math.random() * 6.28 }); };

    // altura extra da água subindo no início (enche a tela)
    const fill = (now) => {
      const k = Math.min(1, Math.max(0, (now - t0 - introMs) / 1400));
      return (1 - (1 - Math.pow(1 - k, 3))) * (H - level + 60);
    };
    const surf = (i, now) => {
      const x = (i / (N - 1)) * W;
      const swell = reduce ? Math.sin(x * .006) * 6 : Math.sin(x * .007 + now * .0012) * 7 + Math.sin(x * .016 - now * .0019) * 3.5;
      // no celular a palavra é menor: as ondas encolhem junto
      const s = Math.min(1, Math.max(.35, wordBox.fs / 300));
      return level + fill(now) + (ys[i] + swell) * s;
    };

    const draw = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = font; ctx.textBaseline = 'alphabetic';
      // palavra sólida (aparece por cima da água só onde não está submersa)
      const alpha = Math.min(1, Math.max(0, (now - t0 - introMs + 300) / 700));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.fillText('WAVE!', wordBox.x, wordBox.base);
      ctx.globalAlpha = 1;
      // água
      const pts = []; for (let i = 0; i < N; i++) pts.push([(i / (N - 1)) * W, surf(i, now)]);
      const path = new Path2D();
      path.moveTo(0, H); path.lineTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < N; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2); }
      path.lineTo(W, pts[N - 1][1]); path.lineTo(W, H); path.closePath();
      const top = Math.min(level, H - 1);
      const g = ctx.createLinearGradient(0, top - 20, 0, H);
      g.addColorStop(0, '#36CFFF'); g.addColorStop(.25, '#1E8BFF'); g.addColorStop(.7, '#0B5ED7'); g.addColorStop(1, '#0A3C9E');
      ctx.fillStyle = g; ctx.fill(path);
      // dentro da água: contorno da palavra + bolhas
      ctx.save(); ctx.clip(path);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillText('WAVE!', wordBox.x, wordBox.base);
      ctx.lineWidth = Math.max(1.5, wordBox.fs / 110); ctx.strokeStyle = 'rgba(255,255,255,.85)';
      ctx.strokeText('WAVE!', wordBox.x, wordBox.base);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      bubbles.forEach((b) => { ctx.beginPath(); ctx.arc(b.x + Math.sin(b.w) * 3, b.y, b.r, 0, 6.283); ctx.fill(); });
      ctx.restore();
      // brilho na superfície
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < N; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2); }
      ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.stroke();
      return pts;
    };

    const step = () => {
      for (let i = 0; i < N; i++) { vs[i] += -K * ys[i] - DAMP * vs[i]; ys[i] += vs[i]; }
      for (let p = 0; p < 2; p++) for (let i = 0; i < N; i++) {
        if (i > 0) { const d = SPREAD * (ys[i] - ys[i - 1]); vs[i - 1] += d; }
        if (i < N - 1) { const d = SPREAD * (ys[i] - ys[i + 1]); vs[i + 1] += d; }
      }
      bubbles.forEach((b) => { b.y -= b.v; b.w += .08; });
    };

    let lastDrop = 0, settled = false, frame = 0;
    const loop = (now) => {
      if (++frame % 20 === 0) measure();   // acompanha mudanças de layout (fontes, chips, etc.)
      step();
      const pts = draw(now);
      bubbles = bubbles.filter((b) => b.y > pts[idxAt(b.x)][1] + 4);
      // quando a água termina de subir: um "tchibum"
      if (!settled && now - t0 > introMs + 1400) { settled = true; for (let i = 0; i < 6; i++) push(Math.random() * W, (Math.random() - .5) * 26, 4); }
      if (now - lastDrop > 2200) { lastDrop = now; push(Math.random() * W, 6 + Math.random() * 8, 3); if (Math.random() < .6) bubble(Math.random() * W, H - 20, 4); }
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    // interação
    let last = null;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      if (last) {
        const sy = level + ys[idxAt(x)];
        const dy = y - last.y, dx = x - last.x;
        if (Math.abs(y - sy) < 70) push(x, Math.max(-14, Math.min(14, dy * .6 + Math.abs(dx) * .08)), 2);
        if (y > sy && Math.random() < .25) bubble(x, y, 1);
      }
      last = { x, y };
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { last = null; });
    hero.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button')) return;
      const r = hero.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      push(x, 22, 3); bubble(x, Math.max(y, level + 10), 8);
    });

    const init = () => { measure(); if (reduce) draw(t0 + 1e6); };
    init();
    addEventListener('resize', () => { measure(); if (reduce) draw(t0 + 1e6); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
    if ('IntersectionObserver' in window) new IntersectionObserver((en) => (en[0].isIntersecting ? start() : stop())).observe(hero);
    else start();
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* ===== Modalidades (montadas a partir da grade) ===== */
  function modalities() {
    const box = $('[data-mods]'); if (!box) return;
    const map = {};
    Object.values(SCHEDULE).forEach((per) => Object.entries(per).forEach(([d, list]) => list.forEach(([h, name, prof]) => {
      map[name] = map[name] || { name, slots: [], profs: new Set() };
      map[name].slots.push(`${DAY_SHORT[d]} ${fmtH(h)}`);
      map[name].profs.add(prof);
    })));
    const order = ['lutas', 'danca', 'cond', 'mente'];
    const list = Object.values(map).sort((a, b) => order.indexOf(CAT_OF[a.name]) - order.indexOf(CAT_OF[b.name]) || a.name.localeCompare(b.name));

    const render = (filter) => {
      box.innerHTML = list.filter((m) => filter === 'all' || CAT_OF[m.name] === filter).map((m, i) => {
        const c = CATS[CAT_OF[m.name]];
        return `<article class="mod" style="--c:${c.color};--n:${i}">
          <span class="mod__ico">${svg(c.icon)}</span>
          <span class="mod__cat">${c.label}</span>
          <h3>${m.name}</h3>
          <div class="mod__when">
            <span>${svg('i-calendar')}${m.slots.join(' · ')}</span>
            <span>${svg('i-users')}${[...m.profs].join(' e ')}</span>
          </div>
        </article>`;
      }).join('');
    };
    $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      render(b.dataset.filter);
    }));
    render('all');
  }

  /* ===== Grade de aulas (Manhã / Tarde-Noite) ===== */
  function schedule() {
    const grid = $('[data-grid]'); const days = $('[data-days]'); if (!grid) return;
    const t = today();
    const sky = $('[data-sky]');
    // abre no período atual: manhã até 12h, depois tarde/noite
    let hour = 18;
    try { hour = +new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hourCycle: 'h23' }).format(new Date()); } catch (e) { hour = new Date().getHours(); }
    let period = hour < 12 ? 'manha' : 'noite';
    let active = t >= 1 && t <= 6 ? t : 1;

    const setSky = () => {
      if (!sky) return;
      sky.classList.toggle('is-day', period === 'manha');
      sky.classList.toggle('is-night', period === 'noite');
      $$('[data-period]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.period === period)));
    };

    const render = () => {
      setSky();
      const data = SCHEDULE[period];
      grid.innerHTML = [1, 2, 3, 4, 5, 6].map((d) => {
        const items = data[d] || [];
        const body = items.length
          ? items.map(([h, name, prof], i) => `<div class="klass" style="--c:${CATS[CAT_OF[name]].color};--n:${i}"><time>${h}</time><strong>${name}</strong><small>${prof}</small></div>`).join('')
          : '<div class="empty">Sem aulas neste período</div>';
        return `<div class="col${d === t ? ' is-today' : ''}${d === active ? ' is-active' : ''}"><div class="col__day">${DAY_LONG[d]}</div>${body}</div>`;
      }).join('');
      if (days) {
        days.innerHTML = [1, 2, 3, 4, 5, 6].map((d) => `<button type="button" data-day="${d}" aria-pressed="${d === active}">${DAY_SHORT[d]}</button>`).join('');
      }
    };
    $$('[data-period]').forEach((b) => b.addEventListener('click', () => {
      period = b.dataset.period;
      render();
    }));
    if (days) days.addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (b) { active = +b.dataset.day; render(); } });
    render();
  }

  /* ===== Header: vidro ao rolar, seção ativa e menu do celular ===== */
  function header() {
    const hd = $('[data-header]'); if (!hd) return;
    const links = $$('[data-spy]');
    const secs = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    let ticking = false;
    const upd = () => {
      hd.classList.toggle('is-scrolled', scrollY > 20);
      const line = 140; let cur = secs[0] && secs[0].id;
      secs.forEach((s) => { if (s.getBoundingClientRect().top <= line) cur = s.id; });
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${cur}`));
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(upd); ticking = true; } }, { passive: true });
    upd();

    const btn = $('[data-burger]'); const menu = $('[data-menu]');
    if (btn && menu) {
      const set = (open) => { btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); menu.hidden = !open; };
      btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
      $$('a', menu).forEach((a) => a.addEventListener('click', () => set(false)));
      addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
      matchMedia('(min-width: 1081px)').addEventListener('change', (m) => { if (m.matches) set(false); });
    }
  }

  /* ===== Números e entrada suave ===== */
  function counters() {
    const els = $$('[data-count]'); if (reduce || !('IntersectionObserver' in window)) return;
    const run = (el) => { const n = +el.dataset.count, t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
    // os números do hero só contam depois que a abertura termina
    const t0 = performance.now();
    const io = new IntersectionObserver((en) => en.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const wait = hasIntro ? Math.max(0, INTRO_MS - (performance.now() - t0)) : 0;
      setTimeout(() => run(e.target), wait);
    }), { threshold: .5 });
    els.forEach((e) => io.observe(e));
  }
  function reveal() {
    const els = $$('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    // irmãos aparecem em cascata (cards, planos, fotos)
    els.forEach((el) => {
      const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
      if (sibs.length > 1) el.style.setProperty('--d', sibs.indexOf(el));
    });
    // ao terminar, devolve as transições próprias do elemento (hover etc.)
    const done = (el) => { el.classList.remove('reveal', 'is-in'); el.style.removeProperty('--d'); };
    const io = new IntersectionObserver((en) => en.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in');
      io.unobserve(el);
      setTimeout(() => done(el), 1700 + (+el.style.getPropertyValue('--d') || 0) * 110);
    }), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
  }

  /* ===== Rolagem: barra de progresso + parallax do hero ===== */
  function scrollFx() {
    const hd = $('[data-header]'); const hero = $('.hero');
    let ticking = false;
    const upd = () => {
      const y = scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (hd) hd.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      if (hero && !reduce) {
        const h = hero.offsetHeight;
        if (y <= h) {
          hero.style.setProperty('--py', `${(y * .35).toFixed(1)}px`);
          hero.style.setProperty('--hy', `${(y * .18).toFixed(1)}px`);
          hero.style.setProperty('--ho', Math.max(0, 1 - y / (h * .75)).toFixed(3));
        }
      }
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(upd); ticking = true; } }, { passive: true });
    addEventListener('resize', upd);
    upd();
  }

  document.addEventListener('DOMContentLoaded', () => {
    [intro, hoursTable, status, nextClass, water, modalities, schedule, header, counters, reveal, scrollFx].forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    $$('[data-year]').forEach((e) => { e.textContent = new Date().getFullYear(); });
  });
})();
