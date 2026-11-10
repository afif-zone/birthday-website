(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const COLORS = ['#C8B6E2', '#A3B18A', '#5B477A', '#DDE5D0'];
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* floating butterflies, particles, flowers */
  const butterfly = c => `<svg viewBox="0 0 34 28"><ellipse cx="9" cy="10" rx="9" ry="9" fill="${c}"/><ellipse cx="25" cy="10" rx="9" ry="9" fill="${c}"/><ellipse cx="11" cy="21" rx="6" ry="6" fill="${c}" opacity=".8"/><ellipse cx="23" cy="21" rx="6" ry="6" fill="${c}" opacity=".8"/><rect x="16" y="4" width="2" height="20" rx="1" fill="#5B477A"/></svg>`;
  function populate(box) {
    const small = innerWidth < 700;
    for (let i = 0; i < (small ? 5 : 8); i++) {
      const b = document.createElement('span');
      b.className = 'bf';
      b.style.cssText = `left:${rnd(2, 92)}%;top:${rnd(5, 85)}%;--d:${rnd(6, 12)}s;--dx:${rnd(-80, 80)}px;--dy:${rnd(-90, 40)}px`;
      b.innerHTML = butterfly(COLORS[i % 3]);
      box.append(b);
    }
    for (let i = 0; i < (small ? 14 : 24); i++) {
      const s = document.createElement('span');
      s.className = 'sp';
      s.style.cssText = `left:${rnd(0, 100)}%;--z:${rnd(4, 10)}px;--d:${rnd(7, 16)}s;animation-delay:-${rnd(0, 14)}s`;
      box.append(s);
    }
    for (let i = 0; i < 5; i++) {
      const f = document.createElement('span');
      f.className = 'fl';
      f.textContent = i % 2 ? '❀' : '✿';
      f.style.cssText = `left:${rnd(0, 92)}%;top:${rnd(0, 90)}%;font-size:${rnd(1.6, 3)}rem;--d:${rnd(8, 14)}s;--dx:${rnd(-30, 30)}px;--dy:${rnd(-40, 40)}px`;
      box.append(f);
    }
  }
  $$('[data-fx]').forEach(populate);

  /* title split: letters pop in once the surprise opens */
  let idx = 0;
  $$('[data-split]').forEach(el => {
    el.innerHTML = [...el.textContent].map(ch => ch === ' ' ? ' ' : `<span class="ch" style="--i:${idx++}">${ch}</span>`).join('');
    el.setAttribute('aria-hidden', 'true');
  });

  /* intro and replay */
  const intro = $('#intro');
  function openSurprise() {
    intro.classList.add('gone');
    body.classList.remove('locked');
    body.classList.add('started');
    window.scrollTo(0, 0);
    playMusic();
    setTimeout(() => confetti(90), 700);
  }
  function resetAll() {
    pauseMusic();
    $('#envelope').classList.remove('open');
    $('#envelope').setAttribute('aria-expanded', 'false');
    $('#paper').hidden = true;
    $$('.s').forEach(s => s.classList.remove('open'));
    body.classList.remove('started');
    body.classList.add('locked');
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = '';
    intro.classList.remove('gone');
  }
  $('#openBtn').addEventListener('click', openSurprise);
  $('#replayBtn').addEventListener('click', resetAll);

  /* nav */
  const nav = $('#nav'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }));

  /* confetti */
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  let bits = [], raf = 0;
  const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
  fit(); addEventListener('resize', fit);
  function confetti(n = 140) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) n = 30;
    const all = [...COLORS, '#F8F5EE', '#fff'];
    for (let i = 0; i < n; i++) bits.push({
      x: innerWidth / 2 + rnd(-60, 60), y: innerHeight * .55, vx: rnd(-7, 7), vy: rnd(-15, -4),
      s: rnd(6, 11), r: rnd(0, 6), vr: rnd(-.2, .2), c: all[i % all.length], life: rnd(90, 160)
    });
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    bits = bits.filter(b => b.life-- > 0 && b.y < cv.height + 20);
    for (const b of bits) {
      b.vy += .35; b.vx *= .99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
      ctx.fillStyle = b.c; ctx.globalAlpha = Math.min(1, b.life / 30);
      ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); ctx.restore();
    }
    if (bits.length) raf = requestAnimationFrame(tick);
    else { ctx.clearRect(0, 0, cv.width, cv.height); raf = 0; }
  }
  $('#confettiBtn').addEventListener('click', () => confetti());

  /* gallery lightbox */
  const lb = $('#lightbox');
  $$('.ph').forEach(btn => btn.addEventListener('click', () => {
    const img = $('img', btn);
    $('#lbImg').src = img.src; $('#lbImg').alt = img.alt;
    $('#lbCap').textContent = $('figcaption', btn.parentElement).textContent;
    lb.showModal();
  }));
  $('#lbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  /* envelope */
  const env = $('#envelope'), paper = $('#paper');
  env.addEventListener('click', () => {
    const open = env.classList.toggle('open');
    env.setAttribute('aria-expanded', open);
    env.setAttribute('aria-label', open ? 'Close the letter' : 'Open the letter');
    paper.hidden = !open;
    if (open) setTimeout(() => paper.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
  });

  /* hidden messages */
  $$('.s').forEach(s => s.addEventListener('click', () => {
    if (s.classList.toggle('open')) confetti(25);
  }));

  /* music: assets/audio/music.mp3 if present, otherwise a soft built-in melody */
  const bgm = $('#bgm'), mBtn = $('#musicBtn');
  let playing = false, synth = null;
  function startSynth() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    synth = synth || { ac: new AC(), t: 0 };
    synth.ac.resume();
    const notes = [392, 440, 523.25, 587.33, 659.25, 587.33, 523.25, 440, 392, 329.63, 392, 440, 523.25, 440, 392, 293.66];
    clearInterval(synth.timer);
    synth.timer = setInterval(() => {
      const o = synth.ac.createOscillator(), g = synth.ac.createGain(), n = synth.ac.currentTime;
      o.type = 'sine'; o.frequency.value = notes[synth.t++ % notes.length];
      g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(.09, n + .05); g.gain.exponentialRampToValueAtTime(.0005, n + 1.6);
      o.connect(g); g.connect(synth.ac.destination); o.start(n); o.stop(n + 1.7);
    }, 650);
  }
  function setUI(on) {
    playing = on;
    mBtn.setAttribute('aria-pressed', on);
    mBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    mBtn.textContent = on ? '❚❚' : '♪';
  }
  async function playMusic() {
    if (playing) return;
    setUI(true);
    try { await bgm.play(); } catch (e) { startSynth(); }
  }
  function pauseMusic() {
    bgm.pause();
    if (synth) clearInterval(synth.timer);
    setUI(false);
  }
  mBtn.addEventListener('click', () => (playing ? pauseMusic() : playMusic()));

   /* hug animation */
  const hugBox = $('#hugBox'), hugBtn = $('#hugBtn');
  hugBtn.addEventListener('click', () => {
    hugBox.classList.add('hug');
    hugBtn.disabled = true;
    confetti(30);
    setTimeout(() => { hugBox.classList.remove('hug'); hugBtn.disabled = false; }, 4000);
  });
})();
