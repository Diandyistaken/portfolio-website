/* =========================================================================
 * SES MOTORU — tamamen sentezlenmiş (Web Audio API), sıfır ses dosyası.
 * Offline çalışır, çift tıkla açılır. Tarayıcı autoplay politikası gereği
 * ilk kullanıcı hareketinde (Şehre Gir) AudioContext açılır/devam ettirilir.
 * ========================================================================= */
(function () {
  let ctx = null, master = null, ambientGain = null, jetGain = null, jetNode = null;
  let started = false, muted = false, volume = 0.6;
  let ambientOn = false, ambientNodes = [];
  let noiseBuf = null;

  // localStorage'dan tercihleri oku
  try {
    const s = JSON.parse(localStorage.getItem("maksut_sound") || "{}");
    if (typeof s.muted === "boolean") muted = s.muted;
    if (typeof s.volume === "number") volume = s.volume;
  } catch (e) {}
  function persist() {
    try { localStorage.setItem("maksut_sound", JSON.stringify({ muted, volume })); } catch (e) {}
  }

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : volume;
      master.connect(ctx.destination);
      // reusable beyaz gürültü tamponu
      const len = ctx.sampleRate * 2;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) { return false; }
  }

  function unlock() {
    if (!ensure()) return;
    if (ctx.state === "suspended") ctx.resume();
    started = true;
  }

  const now = () => (ctx ? ctx.currentTime : 0);

  /* --- temel yapı taşları --- */
  function tone(freq, t0, dur, type, gain, dst) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g); g.connect(dst || master);
    o.start(t0); o.stop(t0 + dur + 0.02);
    return o;
  }
  function slide(f1, f2, t0, dur, type, gain) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sawtooth";
    o.frequency.setValueAtTime(f1, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(t0, dur, gain, filterType, freq, q) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = filterType || "bandpass";
    f.frequency.value = freq || 1200; f.Q.value = q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur + 0.02);
    return f;
  }

  /* --- efekt kütüphanesi --- */
  const FX = {
    hover() { tone(920, now(), 0.045, "sine", 0.028); },
    click() { tone(480, now(), 0.06, "triangle", 0.07); tone(760, now() + 0.02, 0.07, "sine", 0.05); },
    open() { const t = now(); slide(300, 720, t, 0.22, "sine", 0.14); tone(900, t + 0.12, 0.18, "sine", 0.06); },
    close() { const t = now(); slide(680, 260, t, 0.2, "sine", 0.12); },
    door() { const t = now(); slide(200, 620, t, 0.28, "sawtooth", 0.12);
      tone(660, t + 0.16, 0.25, "sine", 0.1); tone(990, t + 0.22, 0.3, "sine", 0.06); },
    step() { noise(now(), 0.045, 0.038, "lowpass", 250 + Math.random() * 130, 1); },
    xp() { const t = now(); [660, 880].forEach((f, i) => tone(f, t + i * 0.05, 0.14, "sine", 0.1)); },
    coin() { const t = now(); tone(880, t, 0.07, "sine", 0.055); tone(1320, t + 0.06, 0.14, "sine", 0.045); },
    correct() { const t = now(); [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.09, 0.34, "sine", 0.12)); },
    wrong() { const t = now(); slide(280, 150, t, 0.28, "triangle", 0.1); slide(200, 110, t + 0.05, 0.3, "sine", 0.06); },
    master() { const t = now(); // zafer fanfarı
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.1, 0.5, "triangle", 0.13));
      noise(t + 0.5, 0.6, 0.06, "highpass", 2000, 0.7); // parıltı
      tone(1568, t + 0.5, 0.7, "sine", 0.08); },
    unlock() { const t = now(); [784, 988, 1319].forEach((f, i) => tone(f, t + i * 0.08, 0.4, "sine", 0.11)); },
    toast() { tone(740, now(), 0.12, "sine", 0.07); },
    jetburst() { noise(now(), 0.35, 0.12, "bandpass", 900, 0.6); slide(180, 520, now(), 0.3, "sawtooth", 0.06); },
    thunder() { const t = now(); noise(t, 1.4, 0.18, "lowpass", 220, 0.6);
      slide(90, 40, t + 0.1, 1.2, "sine", 0.08); },
  };

  let lastFx = {};
  function sfx(name) {
    if (muted || !ensure()) return;
    if (ctx.state === "suspended") ctx.resume();
    const t = performance.now();
    if (lastFx[name] && t - lastFx[name] < 40) return; // spam koruması
    lastFx[name] = t;
    try { FX[name] && FX[name](); } catch (e) {}
  }

  /* --- jetpack sürekli döngü (filtre LFO'suyla doğal "uğuldama") --- */
  let jetLfo = null;
  function setJet(on) {
    if (!ensure()) return;
    if (on && !jetNode) {
      const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 700; f.Q.value = 0.8;
      jetLfo = ctx.createOscillator(); jetLfo.frequency.value = 0.7;
      const lfoG = ctx.createGain(); lfoG.gain.value = 160;
      jetLfo.connect(lfoG); lfoG.connect(f.frequency); jetLfo.start();
      jetGain = ctx.createGain(); jetGain.gain.value = 0;
      src.connect(f); f.connect(jetGain); jetGain.connect(master);
      src.start(); jetNode = src;
      jetGain.gain.linearRampToValueAtTime(muted ? 0 : 0.07, now() + 0.15);
      FX.jetburst();
    } else if (!on && jetNode) {
      const node = jetNode, g = jetGain, l = jetLfo; jetNode = null; jetGain = null; jetLfo = null;
      try {
        g.gain.linearRampToValueAtTime(0, now() + 0.2); node.stop(now() + 0.25);
        if (l) l.stop(now() + 0.25);
      } catch (e) {}
    }
  }

  /* --- ortam sesi v2: yumuşak yağmur (cızırtısız) + derin şehir uğultusu ---
   * Eski ses tiz beyaz gürültüydü (statik cızırtı gibi). Yenisi:
   * bant-sınırlı gürültü (300-2100 Hz) + yavaş LFO dalgalanması ("nefes alan"
   * yağmur), stereo iki katman, sinüs tabanlı uğultu ve ara sıra damla plink'i.
   */
  let ambientTimer = null;
  function mkRainLayer(pan, hp, lp, g0) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const hpF = ctx.createBiquadFilter(); hpF.type = "highpass"; hpF.frequency.value = hp;
    const lpF = ctx.createBiquadFilter(); lpF.type = "lowpass"; lpF.frequency.value = lp; lpF.Q.value = 0.4;
    const g = ctx.createGain(); g.gain.value = g0;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + Math.random() * 0.06;
    const lfoG = ctx.createGain(); lfoG.gain.value = g0 * 0.35;
    lfo.connect(lfoG); lfoG.connect(g.gain);
    let out = g;
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; }
    src.connect(hpF); hpF.connect(lpF); lpF.connect(g); out.connect(ambientGain);
    src.start(); lfo.start();
    ambientNodes.push(src, lfo);
  }
  function drip() {
    const t = now(), f0 = 900 + Math.random() * 900;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * 1.9, t + 0.07); // su damlası "ploink" kıvrımı
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.02, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0006, t + 0.16);
    o.connect(g); g.connect(ambientGain || master);
    o.start(t); o.stop(t + 0.2);
  }
  function scheduleDrip() {
    if (!ambientOn) return;
    ambientTimer = setTimeout(() => {
      try { if (ambientOn && !muted && ctx && ctx.state === "running") drip(); } catch (e) {}
      scheduleDrip();
    }, 900 + Math.random() * 2600);
  }
  function startAmbient() {
    if (ambientOn || !ensure()) return;
    ambientOn = true;
    ambientNodes = [];
    ambientGain = ctx.createGain(); ambientGain.gain.value = 0;
    ambientGain.connect(master);
    ambientGain.gain.linearRampToValueAtTime(muted ? 0 : 0.5, now() + 3);
    // yağmur: iki stereo katman (uzak yumuşak + yakın hafif parlak)
    mkRainLayer(-0.4, 300, 1500, 0.030);
    mkRainLayer(0.4, 400, 2100, 0.024);
    // şehir uğultusu: sinüs çiftinin hafif vuruşu (sawtooth vızıltısı yok)
    const humA = ctx.createOscillator(); humA.type = "sine"; humA.frequency.value = 50;
    const humB = ctx.createOscillator(); humB.type = "sine"; humB.frequency.value = 75.2;
    const hg = ctx.createGain(); hg.gain.value = 0.035;
    const hLfo = ctx.createOscillator(); hLfo.frequency.value = 0.08;
    const hLfoG = ctx.createGain(); hLfoG.gain.value = 0.012;
    hLfo.connect(hLfoG); hLfoG.connect(hg.gain);
    humA.connect(hg); humB.connect(hg); hg.connect(ambientGain);
    humA.start(); humB.start(); hLfo.start();
    ambientNodes.push(humA, humB, hLfo);
    scheduleDrip();
  }
  function stopAmbient() {
    if (!ambientOn) return;
    ambientOn = false;
    if (ambientTimer) { clearTimeout(ambientTimer); ambientTimer = null; }
    try {
      ambientGain.gain.linearRampToValueAtTime(0, now() + 1);
      ambientNodes.forEach((n) => { try { n.stop(now() + 1.1); } catch (e) {} });
    } catch (e) {}
    ambientNodes = [];
  }

  function setMuted(m) {
    muted = m; persist();
    if (master) master.gain.linearRampToValueAtTime(m ? 0 : volume, now() + 0.1);
  }
  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v)); persist();
    if (master && !muted) master.gain.linearRampToValueAtTime(volume, now() + 0.08);
  }

  window.Sound = {
    unlock, sfx, setJet, startAmbient, stopAmbient, setMuted, setVolume,
    isMuted: () => muted, getVolume: () => volume, isAmbient: () => ambientOn,
  };
})();
