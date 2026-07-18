/* =========================================================================
 * OYUN MOTORU v4 — RAFİNE NEON CYBERPUNK ŞEHİR
 * Performans: statik katmanlar + binalar offscreen önbellekte (her karede
 * yeniden çizilmez), shadowBlur yalnızca bake anında, parıltılar hazır
 * sprite'larla, FPS'e göre otomatik kalite (3 seviye).
 * Görsel: katmanlı gökyüzü + ufuk parıltısı, iki paralaks siluet, ıslak
 * caddede bina yansımaları, derinlikli yağmur + su sıçramaları,
 * "gerçek Maksut" karakteri (kıvırcık saç, gözlük, sakal, kulaklık).
 * Tamamen offline, harici bağımlılık yok.
 * ========================================================================= */
(function () {
  const { ISLANDS } = window.GAME_DATA;

  /* ---- şehir temaları ---- */
  const THEMES = {
    neon:   { sky: ["#05030f", "#0d0a2a", "#1d1348", "#3b1d63", "#0b1030"], accent: "#22d3ee", accent2: "#f472b6", aurora: ["#22d3ee", "#a855f7"], moon: "#f5e7cf", lamp: "#ffc478" },
    sunset: { sky: ["#0d0517", "#251038", "#4a1a52", "#8a2a5e", "#1c0f2e"], accent: "#fb923c", accent2: "#f43f5e", aurora: ["#fb923c", "#f43f5e"], moon: "#ffdcae", lamp: "#ffb066" },
    matrix: { sky: ["#010b06", "#03160d", "#07271a", "#0c3a26", "#02120a"], accent: "#22c55e", accent2: "#a3e635", aurora: ["#22c55e", "#a3e635"], moon: "#d9ffe0", lamp: "#b6ff9e" },
    ice:    { sky: ["#030b16", "#081c31", "#0e3050", "#174a6e", "#061424"], accent: "#38bdf8", accent2: "#a5b4fc", aurora: ["#67e8f9", "#a5b4fc"], moon: "#e8f4ff", lamp: "#cfe6ff" },
  };

  /* ---- kullanıcı özelleştirmesi ---- */
  const CUSTOM = { theme: "neon", charColor: "#22c55e", rain: true, fog: true, effects: true, ambient: true };
  try { Object.assign(CUSTOM, JSON.parse(localStorage.getItem("maksut_custom") || "{}")); } catch (e) {}
  const theme = () => THEMES[CUSTOM.theme] || THEMES.neon;

  /* UI aksanını seçilen şehir temasına bağla: DOM arayüzü (HUD/panel) sabit
     teal/cyan yerine motor temasının rengini kullansın. Yalnız dekoratif
     aksan token'larını değiştiririz; anlamsal renkler (red/blue/green) sabit. */
  function applyThemeVars() {
    const t = theme();
    const r = document.documentElement;
    if (!r) return;
    r.style.setProperty("--accent", t.accent);
    r.style.setProperty("--accent2", t.accent2);
    r.style.setProperty("--cyan", t.accent);
    r.style.setProperty("--violet", t.accent2);
  }

  /* ---- bina stilleri ---- */
  const STYLE_BY_ID = {
    setup: "server", linux: "server", networks: "satellite", theory: "dome",
    darkweb: "spire", osint: "satellite", wifi: "satellite", mitm: "antenna",
    crypto: "vault", exploitation: "fortress", backdoor: "lab", persistence: "spire",
    socialeng: "billboard", beef: "billboard", shodan: "satellite", webpentest: "billboard",
    sql: "vault", tools: "antenna", ctf: "flag", aisec: "hologram",
  };
  const WIN_BY_TRACK = { red: "dataStream", blue: "grid", foundation: "grid", both: "grid" };

  /* ---- yerleşim ---- */
  const GAP = 380, START_X = 560, DEPTH = 30, CAP_H = 34, PAD = 26, ROOF_CLEAR = 84;
  ISLANDS.forEach((d, i) => {
    d._wx = START_X + i * GAP;
    d._h = 300 + d.tier * 62 + ((i * 37) % 4) * 34;
    d._w = 210 + ((i * 53) % 3) * 26;
    d._seed = hash(d.id);
    d._roof = STYLE_BY_ID[d.id] || "antenna";
    d._win = WIN_BY_TRACK[d.track] || "grid";
    d._cache = null;
  });
  const WORLD_W = START_X + ISLANDS.length * GAP + 620;

  /* ---- çekirdek durum ---- */
  let canvas, ctx, W = 0, H = 0, dpr = 1, GROUND = 0;
  const cam = { x: 0 };
  const WALK = 480, FLY = 780;

  /* ---- karakterler: oyuncu + (ziyaretçi modunda) otonom Maksut ---- */
  /* konuşma havuzları: hero (Maksut) selam, yayalar gündelik muhabbet */
  const HERO_GREETS = ["Selam! 👋", "Kolay gelsin!", "Naber?", "Hadi çalışalım!", "Bugün hangi bina?",
    "Görüşürüz 👋", "İyi ki geldin!", "Bir kahve iyi giderdi ☕", "Devam ediyoruz 💪"];
  const CASUAL_CHAT = ["Günaydın", "Selam", "Nasılsın?", "Hava güzel bugün", "Kahve şart ☕", "Geç kaldım yine!",
    "İyi çalışmalar", "Çok yoğunum", "Hadi görüşürüz", "Acıktım 🍔", "Metro yine dolu", "Ne haber?",
    "Yağmur yağacak galiba", "Bu şehir hiç durmuyor", "İyi günler"];
  function mkChar(wx, ident) {
    return {
      wx, z: 0, dir: 1, flying: false, anim: 0, moveT: 0, stepSign: 0,
      hidden: false, emote: null, emoteP: 0,
      blinkT: 2 + Math.random() * 3, blinkD: 0,
      idleT: 4 + Math.random() * 5, idleAct: "none", idleP: 0,
      chat: ident.chat || null, chatT: 4 + Math.random() * 6,
      style: ident.style || "maksut", label: ident.label || "Maksut",
      fem: !!ident.fem, accent: ident.accent || null,
    };
  }
  let MODE = "admin"; // admin: Maksut oynanır · visitor: misafir oynanır, Maksut AI gezer
  const player = mkChar(START_X, { style: "maksut", label: "Maksut", chat: HERO_GREETS });
  let aiMaksut = null;
  const chars = [player];
  let peds = []; // arka planda gündelik gezinen yayalar
  const axis = { x: 0, z: 0 }; // dokunmatik joystick ekseni
  const input = {};
  /* ---- eklenti kancaları (npc.js / robot.js / ai.js buradan bağlanır) ---- */
  const hooks = { update: [], worldBack: [], worldFront: [], screen: [], pointer: [], pointerMove: [], pointerUp: [], action: [] };

  let target = null, particles = [], vehicles = [], drones = [], shooters = [], trail = [];
  let rainNear = [], rainFar = [], splashes = [];
  let cb = {}, nearest = null, running = false, paused = false, pausedDrawn = false, lastT = 0, T = 0;
  let curMastered = new Set();

  /* ---- otomatik kalite (FPS izleyici) ---- */
  const PERF = { level: 2, frames: 0, acc: 0, upCd: 0 };
  const DPR_CAP = [1, 1.3, 1.7];
  function perfSample(dt) {
    PERF.acc += dt; PERF.frames++;
    if (PERF.frames < 60) return;
    const avg = PERF.acc / PERF.frames;
    PERF.frames = 0; PERF.acc = 0;
    if (avg > 0.026 && PERF.level > 0) { PERF.level--; PERF.upCd = 6; applyQuality(); }
    else if (avg < 0.0155 && PERF.level < 2) {
      if (PERF.upCd > 0) PERF.upCd--;
      else { PERF.level++; applyQuality(); }
    }
  }
  function applyQuality() { resize(); seedRain(); }

  /* ================= kurulum ================= */
  function init(canvasEl, callbacks) {
    canvas = canvasEl; ctx = canvas.getContext("2d"); cb = callbacks || {};
    resize(); window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKey(true));
    window.addEventListener("keyup", onKey(false));
    canvas.addEventListener("pointerdown", onPointer);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("visibilitychange", onVisibility);
    applyThemeVars();
    cam.x = clampCam(player.wx - W / 2);
    seedWorld(); seedRain();
  }

  /* Gizli sekmede RAF + ortam sesi boşuna pil yakmasın: sekme arkadayken
     döngüyü durdur, sese sus; öne gelince kaldığı yerden devam et. */
  let bgHidden = false;
  function onVisibility() {
    if (document.hidden) {
      bgHidden = true;
      if (window.Sound) { Sound.stopAmbient(); if (player.flying) Sound.setJet(false); }
    } else if (bgHidden) {
      bgHidden = false;
      if (running) { lastT = performance.now(); requestAnimationFrame(loop); }
      if (window.Sound && CUSTOM.ambient && !paused) Sound.startAmbient();
    }
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP[PERF.level]);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    GROUND = Math.round(H * 0.82);
    buildStatic();
  }
  const clampCam = (x) => Math.max(0, Math.min(WORLD_W - W, x));

  const onKey = (down) => (e) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    input[k] = down;
    if (down && !paused) {
      if (k === "f") {
        player.flying = !player.flying;
        window.Sound && Sound.setJet(player.flying);
        if (player.flying) burst(px(), py(), theme().accent, 14);
      }
      if (k === "e" || k === "enter") {
        let used = false;
        for (const fn of hooks.action) if (fn()) { used = true; break; } // NPC/robot konuşması öncelikli
        if (!used && nearest && cb.onEnter) { window.Sound && Sound.sfx("door"); cb.onEnter(nearest); }
      }
    }
  };
  function evPos(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    return { sx, sy, wx: sx + cam.x, wy: sy };
  }
  function onPointer(e) {
    if (paused) return;
    const p = evPos(e);
    for (const fn of hooks.pointer) if (fn(p)) return; // robot/NPC tıklaması hareketi engeller
    target = { wx: p.wx, z: player.flying ? Math.max(0, GROUND - p.sy) : 0 };
  }
  function onPointerMove(e) { const p = evPos(e); for (const fn of hooks.pointerMove) fn(p); }
  function onPointerUp(e) { const p = evPos(e); for (const fn of hooks.pointerUp) fn(p); }

  function seedWorld() {
    particles = [];
    vehicles = [];
    for (let i = 0; i < 7; i++)
      vehicles.push({ x: Math.random() * WORLD_W, y: 60 + Math.random() * (H * 0.4 || 300),
        sp: (Math.random() * 40 + 25) * (Math.random() < .5 ? 1 : -1), c: Math.random() < .5 ? theme().accent2 : theme().accent });
    drones = [];
    for (let i = 0; i < 5; i++)
      drones.push({ x: Math.random() * WORLD_W, base: 90 + Math.random() * ((H || 600) * 0.4), phase: Math.random() * 7,
        sp: (Math.random() * 22 + 14) * (Math.random() < .5 ? 1 : -1), blink: Math.random() * 7 });
    shooters = []; trail = []; splashes = [];
  }
  function seedRain() {
    const nN = [10, 22, 34][PERF.level], nF = [16, 30, 50][PERF.level];
    rainNear = []; rainFar = [];
    for (let i = 0; i < nN; i++)
      rainNear.push({ x: Math.random() * (W + 240), y: Math.random() * H, l: 15 + Math.random() * 9, s: 620 + Math.random() * 200, hitY: 0 });
    for (let i = 0; i < nF; i++)
      rainFar.push({ x: Math.random() * (W + 240), y: Math.random() * H, l: 7 + Math.random() * 5, s: 380 + Math.random() * 120, hitY: 0 });
    [rainNear, rainFar].forEach((arr) => arr.forEach((r) => { r.hitY = GROUND + 4 + Math.random() * Math.max(10, H - GROUND - 12); }));
  }
  function px() { return player.wx - cam.x; }
  function py() { return GROUND - player.z; }
  function burst(x, y, color, n) {
    if (!CUSTOM.effects) n = Math.min(n, 4);
    for (let i = 0; i < (n || 10); i++) {
      const a = Math.random() * 7, s = Math.random() * 120 + 30;
      particles.push({ x: x + cam.x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: .7, color });
    }
  }
  function splash(_x, _y, color) { burst(px(), py(), color, 26); }

  /* ================= sprite & statik katman önbellekleri ================= */
  const glowCache = new Map();
  function glowSprite(color) {
    let c = glowCache.get(color);
    if (c) return c;
    c = document.createElement("canvas"); c.width = 64; c.height = 64;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, hexA(color, 0.55)); gr.addColorStop(0.45, hexA(color, 0.18)); gr.addColorStop(1, hexA(color, 0));
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    glowCache.set(color, c);
    return c;
  }
  function drawGlow(x, y, r, color, a) {
    ctx.globalAlpha = a; ctx.drawImage(glowSprite(color), x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1;
  }

  let skyC, starsA, starsB, moonC, sklFar, sklMid, fogC, vignC, streetC, reflFadeC;
  const TILE_W = 960;

  function mkC(w, h) { const c = document.createElement("canvas"); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; }

  function buildStatic() {
    if (!W || !H) return;
    const t = theme();
    /* gökyüzü + ufuk şehir parıltısı */
    skyC = mkC(W, H); {
      const g = skyC.getContext("2d");
      const gr = g.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, t.sky[0]); gr.addColorStop(0.35, t.sky[1]);
      gr.addColorStop(0.62, t.sky[2]); gr.addColorStop(0.82, t.sky[3]); gr.addColorStop(1, t.sky[4]);
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const hg = g.createRadialGradient(W / 2, GROUND, 10, W / 2, GROUND, H * 0.75);
      hg.addColorStop(0, hexA(t.accent, 0.10)); hg.addColorStop(0.5, hexA(t.accent2, 0.05)); hg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = hg; g.fillRect(0, 0, W, H);
    }
    /* iki yıldız katmanı (alfa salınımıyla ucuz parıldama) */
    starsA = mkC(W, H * 0.62); starsB = mkC(W, H * 0.62);
    [starsA, starsB].forEach((c) => {
      const g = c.getContext("2d"); g.fillStyle = "#dbeafe";
      for (let i = 0; i < 70; i++) {
        const r = Math.random() * 1.3 + 0.3;
        g.globalAlpha = 0.3 + Math.random() * 0.5;
        g.beginPath(); g.arc(Math.random() * W, Math.random() * c.height, r, 0, 7); g.fill();
      }
    });
    /* ay */
    moonC = mkC(240, 240); {
      const g = moonC.getContext("2d");
      const gl = g.createRadialGradient(120, 120, 20, 120, 120, 118);
      gl.addColorStop(0, hexA(t.moon, 0.45)); gl.addColorStop(1, hexA(t.moon, 0));
      g.fillStyle = gl; g.fillRect(0, 0, 240, 240);
      g.fillStyle = t.moon; g.beginPath(); g.arc(120, 120, 44, 0, 7); g.fill();
      g.fillStyle = "rgba(150,130,110,.22)";
      [[13, -9, 10], [-15, 7, 8], [5, 17, 6]].forEach(([a, b, r]) => { g.beginPath(); g.arc(120 + a, 120 + b, r, 0, 7); g.fill(); });
    }
    /* uzak & orta siluet şeritleri (dikişsiz tekrar) */
    sklFar = bakeSkyline(Math.round(H * 0.30), shade2(t.sky[1], 14), t.accent, 80, false);
    sklMid = bakeSkyline(Math.round(H * 0.44), shade2(t.sky[2], -10), t.accent, 120, true);
    /* sis şeridi */
    fogC = mkC(W, 200); {
      const g = fogC.getContext("2d");
      const gr = g.createLinearGradient(0, 0, 0, 200);
      gr.addColorStop(0, hexA(t.sky[3], 0)); gr.addColorStop(1, hexA(t.sky[3], 0.4));
      g.fillStyle = gr; g.fillRect(0, 0, W, 200);
    }
    /* vinyet */
    vignC = mkC(W, H); {
      const g = vignC.getContext("2d");
      const gr = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.9);
      gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.42)");
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    }
    /* cadde tabanı + yansıma karartıcı */
    const sh = Math.max(2, H - GROUND);
    streetC = mkC(W, sh); {
      const g = streetC.getContext("2d");
      const gr = g.createLinearGradient(0, 0, 0, sh);
      gr.addColorStop(0, "#0d1226"); gr.addColorStop(1, "#03050d");
      g.fillStyle = gr; g.fillRect(0, 0, W, sh);
    }
    reflFadeC = mkC(W, sh); {
      const g = reflFadeC.getContext("2d");
      const gr = g.createLinearGradient(0, 0, 0, sh);
      gr.addColorStop(0, "rgba(4,6,14,.30)"); gr.addColorStop(0.55, "rgba(4,6,14,.72)"); gr.addColorStop(1, "rgba(3,4,10,.96)");
      g.fillStyle = gr; g.fillRect(0, 0, W, sh);
    }
    ISLANDS.forEach((d) => { d._cache = null; }); // tema/dpr değişimi → bina önbelleği bayat
  }

  function bakeSkyline(tileH, color, accent, step, masts) {
    const c = mkC(TILE_W, tileH), g = c.getContext("2d");
    g.fillStyle = color;
    const cols = Math.floor(TILE_W / step);
    for (let i = 0; i < cols; i++) {
      const s = hash("skl" + i + color + step);
      const h = tileH * (0.35 + (s % 100) / 100 * 0.6);
      const w = step - 10 - (s % 3) * 5;
      const x = i * step + 4;
      g.fillStyle = color;
      g.fillRect(x, tileH - h, w, h);
      if (masts && s % 4 === 0) {
        g.fillRect(x + w / 2 - 1, tileH - h - 14, 2, 14);
        g.fillStyle = "#ff5a5a"; g.fillRect(x + w / 2 - 1.5, tileH - h - 17, 3, 3);
      }
      g.fillStyle = hexA(accent, 0.07);
      for (let wy = tileH - h + 10; wy < tileH - 8; wy += 18)
        if (hash(i + "w" + wy) % 4 === 0) g.fillRect(x + 6, wy, 5, 5);
    }
    return c;
  }

  /* ================= BİNA ÖNBELLEĞİ ================= */
  function getCache(d) {
    const mastered = curMastered.has(d.id);
    const c = d._cache;
    if (c && c.theme === CUSTOM.theme && c.mastered === mastered && c.dpr === dpr) return c;
    return bakeBuilding(d, mastered);
  }

  function bakeBuilding(d, mastered) {
    const w = d._w, h = d._h;
    const lw = PAD + w + DEPTH + PAD, lh = ROOF_CLEAR + h;
    const cv = mkC(Math.ceil(lw * dpr), Math.ceil(lh * dpr));
    const g = cv.getContext("2d"); g.scale(dpr, dpr);
    const L = PAD, Tp = ROOF_CLEAR, B = lh; // facade sol/üst, taban = canvas altı
    const col = d.color;

    /* 3B yan + üst yüz — koyu cam taban + renk tonu (parlak renkler cart görünmesin) */
    const sidePath = () => { g.beginPath(); g.moveTo(L + w, Tp); g.lineTo(L + w + DEPTH, Tp - DEPTH);
      g.lineTo(L + w + DEPTH, B - DEPTH); g.lineTo(L + w, B); g.closePath(); };
    sidePath(); g.fillStyle = "#0a0f22"; g.fill();
    sidePath(); g.fillStyle = hexA(col, 0.12); g.fill();
    g.fillStyle = "rgba(140,170,255,.05)";
    for (let sy = Tp + 20; sy < B - 30; sy += 30) g.fillRect(L + w + 6, sy, DEPTH - 12, 10);
    const topPath = () => { g.beginPath(); g.moveTo(L, Tp); g.lineTo(L + DEPTH, Tp - DEPTH);
      g.lineTo(L + w + DEPTH, Tp - DEPTH); g.lineTo(L + w, Tp); g.closePath(); };
    topPath(); g.fillStyle = "#0e1530"; g.fill();
    topPath(); g.fillStyle = hexA(col, 0.28); g.fill();

    /* ön yüz: koyu cam kule + yukarıdan renkli neon süzülmesi */
    g.fillStyle = "#0c1226"; g.fillRect(L, Tp, w, h);
    const fg = g.createLinearGradient(0, Tp, 0, B);
    fg.addColorStop(0, hexA(col, 0.32)); fg.addColorStop(0.5, hexA(col, 0.07)); fg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = fg; g.fillRect(L, Tp, w, h);
    /* tepe bölümü (cap) + taç ışığı */
    g.fillStyle = "rgba(4,8,18,.55)"; g.fillRect(L + 10, Tp, w - 20, CAP_H);
    g.save(); g.shadowColor = col; g.shadowBlur = 12;
    g.fillStyle = hexA(col, 0.85); g.fillRect(L + 10, Tp, w - 20, 3); g.restore();
    /* yan neon şeritler */
    g.save(); g.shadowColor = col; g.shadowBlur = 10;
    g.fillStyle = hexA(col, 0.5);
    g.fillRect(L + 2, Tp + CAP_H, 2, h - CAP_H - 18);
    g.fillRect(L + w - 4, Tp + CAP_H, 2, h - CAP_H - 18);
    g.restore();
    /* sol kenar rim ışığı */
    g.fillStyle = "rgba(255,255,255,.07)"; g.fillRect(L, Tp, 1.5, h);

    bakeWindows(d, g, L, Tp, w, h, mastered);
    bakeSign(d, g, L, Tp, w, mastered);
    bakeDoor(d, g, L, w, B);
    bakeRoofStatic(d, g, L, Tp, w);

    /* neon dış çizgi (parıltısıyla bake edilir — çalışma anında maliyeti yok) */
    g.save(); g.shadowColor = col; g.shadowBlur = 14;
    g.strokeStyle = hexA(col, 0.9); g.lineWidth = 2;
    g.strokeRect(L, Tp, w, h); g.restore();
    /* taban plinti */
    g.fillStyle = "#0a0f1e"; g.fillRect(L - 3, B - 10, w + DEPTH * 0.4 + 6, 10);

    d._cache = { canvas: cv, lw, lh, theme: CUSTOM.theme, mastered, dpr };
    return d._cache;
  }

  function bakeWindows(d, g, L, Tp, w, h, mastered) {
    const P = 26, cw = 16, chh = 12;
    const cols = Math.floor((w - 32) / P);
    const mx = (w - cols * P + (P - cw)) / 2;
    const y0 = CAP_H + 70, y1 = h - 96;
    const flick = [];
    for (let r = 0; y0 + r * P < y1; r++) for (let c = 0; c < cols; c++) {
      const x = L + mx + c * P, y = Tp + y0 + r * P;
      const s = hash(d.id + r + "." + c);
      if (d._win === "dataStream") { g.fillStyle = "rgba(150,180,255,.05)"; g.fillRect(x, y, cw, chh); continue; }
      const m = s % 20;
      if (m < 11) { g.fillStyle = "rgba(150,180,255,.05)"; g.fillRect(x, y, cw, chh); }
      else if (m < 15) { g.fillStyle = hexA("#ffd9a0", mastered ? 0.62 : 0.42); g.fillRect(x, y, cw, chh); }
      else if (m < 18) { g.fillStyle = hexA(d.color, mastered ? 0.6 : 0.4); g.fillRect(x, y, cw, chh); }
      if (m === 19 && flick.length < 8) flick.push({ x: mx + c * P, y: y0 + r * P, ph: s % 10 });
    }
    d._flick = flick;
    d._cols = cols; d._colMx = mx; d._winY0 = y0; d._winY1 = y1;
  }

  function bakeSign(d, g, L, Tp, w, mastered) {
    const by = Tp + CAP_H + 12, col = d.color;
    g.save(); g.shadowColor = col; g.shadowBlur = 16;
    g.fillStyle = "rgba(5,8,20,.92)"; roundRectOn(g, L + 8, by, w - 16, 44, 10); g.fill();
    g.restore();
    g.strokeStyle = hexA(col, 0.55); g.lineWidth = 1.5;
    roundRectOn(g, L + 8, by, w - 16, 44, 10); g.stroke();
    g.font = "24px 'Segoe UI Emoji',system-ui"; g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText(d.icon, L + 17, by + 23);
    g.font = "700 14px system-ui"; g.fillStyle = "#eef2fb";
    g.fillText(fitOn(g, d.name, w - 60), L + 49, by + 16);
    g.fillStyle = hexA(col, 0.8); g.fillRect(L + 49, by + 26, 30, 2);
    g.font = "600 10px system-ui"; g.fillStyle = hexA(col, 0.95);
    g.fillText(trackName(d.track).toUpperCase() + " · SV." + d.tier, L + 86, by + 28);
    if (mastered) {
      g.save(); g.shadowColor = "#fde047"; g.shadowBlur = 12;
      g.fillStyle = "rgba(250,204,21,.94)"; roundRectOn(g, L + w - 46, by - 9, 42, 20, 6); g.fill(); g.restore();
      g.fillStyle = "#3a2c00"; g.font = "700 11px system-ui"; g.textAlign = "center";
      g.fillText("✓ USTA", L + w - 25, by + 2);
    }
  }

  function bakeDoor(d, g, L, w, B) {
    const col = d.color, dw = 56, dh = 78, dx = L + w / 2 - dw / 2, dy = B - dh - 10;
    /* saçak */
    g.fillStyle = hexA(col, 0.3); g.fillRect(dx - 9, dy - 8, dw + 18, 5);
    /* cam kapı */
    const gg = g.createLinearGradient(0, dy, 0, dy + dh);
    gg.addColorStop(0, hexA(col, 0.28)); gg.addColorStop(1, "rgba(8,12,26,.9)");
    g.fillStyle = gg; roundRectTopOn(g, dx, dy, dw, dh, 20); g.fill();
    g.strokeStyle = hexA(col, 0.7); g.lineWidth = 2;
    roundRectTopOn(g, dx, dy, dw, dh, 20); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.14)"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(dx + dw / 2, dy + 14); g.lineTo(dx + dw / 2, dy + dh); g.stroke();
    /* yan ışık çubukları */
    g.save(); g.shadowColor = col; g.shadowBlur = 8;
    g.fillStyle = hexA(col, 0.65);
    g.fillRect(dx - 7, dy + 16, 3, 22); g.fillRect(dx + dw + 4, dy + 16, 3, 22);
    g.restore();
  }

  function bakeRoofStatic(d, g, L, Tp, w) {
    const cx = L + w / 2, col = d.color;
    g.strokeStyle = shade(col, -16); g.fillStyle = shade(col, -16); g.lineWidth = 3;
    switch (d._roof) {
      case "antenna":
        for (const ox of [-w * 0.26, 0, w * 0.26]) {
          g.beginPath(); g.moveTo(cx + ox, Tp); g.lineTo(cx + ox, Tp - 26 - Math.abs(ox) * 0.1); g.stroke();
        }
        break;
      case "satellite":
        g.beginPath(); g.moveTo(cx, Tp); g.lineTo(cx, Tp - 20); g.stroke();
        break;
      case "dome": {
        const gr = g.createLinearGradient(cx, Tp - 42, cx, Tp);
        gr.addColorStop(0, shade(col, 22)); gr.addColorStop(1, shade(col, -32));
        g.fillStyle = gr; g.beginPath(); g.arc(cx, Tp, w * 0.3, Math.PI, 0); g.fill();
        g.strokeStyle = hexA(col, 0.7); g.beginPath(); g.arc(cx, Tp, w * 0.3, Math.PI, 0); g.stroke();
        g.beginPath(); g.moveTo(cx, Tp - w * 0.3); g.lineTo(cx, Tp - w * 0.3 - 15); g.stroke();
        break;
      }
      case "spire":
        g.fillStyle = shade(col, -8);
        g.beginPath(); g.moveTo(cx - 15, Tp); g.lineTo(cx, Tp - 56); g.lineTo(cx + 15, Tp); g.closePath(); g.fill();
        g.strokeStyle = hexA(col, 0.8); g.stroke();
        break;
      case "fortress":
        g.fillStyle = shade(col, -14);
        for (let i = 0; i < 5; i++) g.fillRect(L + 8 + i * (w - 16) / 5, Tp - 15, (w - 16) / 5 - 6, 15);
        break;
      case "lab":
        for (const ox of [-w * 0.2, w * 0.2]) {
          g.strokeStyle = hexA(col, 0.8); g.lineWidth = 2;
          roundRectOn(g, cx + ox - 8, Tp - 34, 16, 34, 6); g.stroke();
        }
        break;
      case "billboard": {
        const bw = w * 0.68, bx = cx - bw / 2, byy = Tp - 50;
        g.strokeStyle = "#334155"; g.lineWidth = 3;
        g.beginPath(); g.moveTo(cx, Tp); g.lineTo(cx, byy + 40); g.stroke();
        g.save(); g.shadowColor = col; g.shadowBlur = 14;
        g.strokeStyle = hexA(col, 0.9); g.lineWidth = 1.5; roundRectOn(g, bx, byy, bw, 40, 6); g.stroke();
        g.restore();
        break;
      }
      case "flag":
        g.strokeStyle = "#94a3b8"; g.lineWidth = 3;
        g.beginPath(); g.moveTo(cx - w * 0.2, Tp); g.lineTo(cx - w * 0.2, Tp - 50); g.stroke();
        break;
      case "server":
        for (const ox of [-w * 0.22, 0, w * 0.22]) {
          g.fillStyle = shade(col, -26); g.fillRect(cx + ox - 6, Tp - 20, 12, 20);
        }
        break;
    }
  }

  /* ================= update ================= */
  /* genel karakter hareketi — oyuncu ve AI aynı fiziği kullanır */
  function moveChar(ch, dx, dz, dt, silent) {
    const sp = ch.flying ? FLY : WALK;
    ch.wx += dx * sp * dt;
    ch.wx = Math.max(60, Math.min(WORLD_W - 60, ch.wx));
    if (dx) ch.dir = dx > 0 ? 1 : -1;
    if (ch.flying) {
      ch.z += dz * sp * dt;
      ch.z = Math.max(0, Math.min(H * 0.62, ch.z));
      if (!ch.hidden && Math.random() < dt * 30) burst(ch.wx - cam.x, GROUND - ch.z + 14, "#67e8f9", 1);
    } else {
      ch.z += (0 - ch.z) * Math.min(1, dt * 10);
      if (ch.z < 1) ch.z = 0;
    }
    const moving = dx !== 0 || (ch.flying && dz !== 0);
    ch.anim += dt * (ch.flying ? 6 : 14) * (moving ? 1 : 0.15);
    ch.moveT = moving ? Math.min(1, ch.moveT + dt * 6) : Math.max(0, ch.moveT - dt * 6);
    if (!silent && !ch.flying && moving && window.Sound) {
      const s = Math.sin(ch.anim) >= 0 ? 1 : -1;
      if (s !== ch.stepSign) { ch.stepSign = s; Sound.sfx("step"); }
    }
    if ((moving || ch.flying) && !ch.hidden && CUSTOM.effects) {
      trail.push({ x: ch.wx - ch.dir * 14, y: GROUND - ch.z - 26, life: 0.45, color: ch.accent || CUSTOM.charColor });
      if (trail.length > 24) trail.shift();
    }
    return moving;
  }
  /* idle durum makinesi: göz kırpma + rastgele küçük hareketler */
  function updateIdle(ch, dt, moving) {
    ch.blinkT -= dt;
    if (ch.blinkT <= 0) { ch.blinkT = 2.5 + Math.random() * 3.5; ch.blinkD = 0.13; }
    if (ch.blinkD > 0) ch.blinkD -= dt;
    if (moving || ch.flying) { ch.idleAct = "none"; ch.idleP = 0; ch.idleT = 3 + Math.random() * 4; return; }
    if (ch.idleAct === "none") {
      ch.idleT -= dt;
      if (ch.idleT <= 0) {
        const acts = ["look", "phone", "stretch", "shift", "look"];
        ch.idleAct = acts[(Math.random() * acts.length) | 0];
        ch.idleP = 0;
      }
    } else {
      ch.idleP += dt;
      const dur = { look: 2.4, phone: 4.5, stretch: 1.8, shift: 3 }[ch.idleAct] || 2;
      if (ch.idleP >= dur) { ch.idleAct = "none"; ch.idleT = 4 + Math.random() * 6; }
    }
  }

  /* konuşma balonu: ara sıra kısa laf; yürürken biraz daha sık */
  function updateChat(ch, dt, moving) {
    if (!ch.chat || ch.hidden) return;
    if (ch.emoteP > 0) { ch.emoteP -= dt; if (ch.emoteP <= 0) ch.emote = null; return; }
    ch.chatT -= dt * (moving ? 1.35 : 1);
    if (ch.chatT <= 0) {
      ch.emote = ch.chat[(Math.random() * ch.chat.length) | 0];
      ch.emoteP = 2.6; ch.chatT = 6 + Math.random() * 9;
    }
  }

  /* ---- arka plan yayaları ---- */
  const PED_HOODIES = ["#3b4b66", "#5b3b5b", "#3b5b4b", "#66513b", "#4b4b66", "#663b3b", "#2f4f4f", "#556070"];
  const PED_HAIRS = ["#2a1a0e", "#14161c", "#6b4423", "#8a5a2b", "#c9a227", "#4a2f1a", "#1c1c22", "#7a3b1a"];
  const PED_SKINS = ["#e6b184", "#d9a06a", "#c88a58", "#f0c49a", "#b5794a"];
  function spawnPeds() {
    peds = [];
    const N = 6, span = WORLD_W - START_X * 2;
    for (let i = 0; i < N; i++) {
      const p = mkChar(START_X + span * ((i + 0.5) / N) + (Math.random() * 180 - 90),
        { style: "ped", chat: CASUAL_CHAT, fem: Math.random() < 0.5, label: "" });
      p.ped = true;
      p.dir = Math.random() < 0.5 ? 1 : -1;
      p.speed = 34 + Math.random() * 26;
      p.hoodie = PED_HOODIES[(Math.random() * PED_HOODIES.length) | 0];
      p.hairC = PED_HAIRS[(Math.random() * PED_HAIRS.length) | 0];
      p.skinC = PED_SKINS[(Math.random() * PED_SKINS.length) | 0];
      p.moveT = 1; p.anim = Math.random() * 6;
      peds.push(p);
    }
  }
  function updatePeds(dt) {
    const L = START_X - 60, R = WORLD_W - START_X + 60;
    for (const p of peds) {
      p.wx += p.dir * p.speed * dt;
      p.anim += dt * (p.speed / 20);
      if (p.wx < L) { p.wx = L; p.dir = 1; }
      else if (p.wx > R) { p.wx = R; p.dir = -1; }
      p.blinkT -= dt; if (p.blinkT <= 0) { p.blinkT = 2.5 + Math.random() * 3.5; p.blinkD = 0.13; }
      if (p.blinkD > 0) p.blinkD -= dt;
      updateChat(p, dt, true);
    }
  }

  /* değişken genişlikli konuşma balonu (emoji + metin) */
  function drawEmote(ch, x, topY, acc) {
    if (!ch.emote) return;
    ctx.font = "600 12px system-ui, 'Segoe UI Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const tw = Math.max(26, ctx.measureText(ch.emote).width + 18), h = 22;
    const by = topY + Math.sin(T * 2.2) * 2;
    ctx.fillStyle = "rgba(8,12,26,.92)"; roundRect(x - tw / 2, by - h / 2, tw, h, 9); ctx.fill();
    ctx.strokeStyle = hexA(acc, 0.5); ctx.lineWidth = 1.5; roundRect(x - tw / 2, by - h / 2, tw, h, 9); ctx.stroke();
    ctx.fillStyle = "rgba(8,12,26,.92)";
    ctx.beginPath(); ctx.moveTo(x - 4, by + h / 2 - 1); ctx.lineTo(x, by + h / 2 + 6); ctx.lineTo(x + 4, by + h / 2 - 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#dff4ff"; ctx.fillText(ch.emote, x, by + 0.5);
  }

  /* basit arka plan yayası (hero'dan küçük, az detay) */
  function drawPed(ch) {
    const x = ch.wx - cam.x, y = GROUND, d = ch.dir, run = ch.moveT;
    if (x < -60 || x > W + 60) return;
    const stepA = Math.sin(ch.anim) * run, stepB = Math.sin(ch.anim + Math.PI) * run;
    ctx.fillStyle = "rgba(0,0,0,.3)";
    ctx.beginPath(); ctx.ellipse(x, y + 3, 14, 4.5, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(x, y - Math.abs(stepA) * 1.4); ctx.scale(d, 1);
    ctx.strokeStyle = "#232c3f"; ctx.lineWidth = 4.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-2, -18); ctx.lineTo(-2 + stepB * 7, -1); ctx.moveTo(2, -18); ctx.lineTo(2 + stepA * 7, -1); ctx.stroke();
    const hoodie = ch.hoodie || "#3b4b66";
    ctx.strokeStyle = shade2(hoodie, -14); ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(2, -34); ctx.lineTo(2 + stepB * 6, -20); ctx.stroke();
    ctx.fillStyle = hoodie; roundRect(-8, -38, 16, 22, 7); ctx.fill();
    ctx.fillStyle = ch.skinC || "#e6b184"; ctx.beginPath(); ctx.arc(1, -45, 7.5, 0, 7); ctx.fill();
    ctx.fillStyle = ch.hairC || "#2a1a0e";
    if (ch.fem) {
      ctx.beginPath(); ctx.moveTo(-8, -46); ctx.quadraticCurveTo(-8, -54, 1, -54.5);
      ctx.quadraticCurveTo(10, -54, 10, -46); ctx.lineTo(10, -40); ctx.quadraticCurveTo(9, -42, 6, -41);
      ctx.lineTo(4.5, -44); ctx.lineTo(-5, -44); ctx.quadraticCurveTo(-8, -42, -8, -40); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-8, -41, 2.4, 5.5, 0.35, 0, 7); ctx.fill(); // at kuyruğu
    } else {
      ctx.beginPath(); ctx.arc(1, -47, 8, Math.PI * 1.02, Math.PI * 2.02); ctx.fill();
    }
    if (ch.blinkD <= 0) { ctx.fillStyle = "#1a2333"; ctx.beginPath(); ctx.arc(4.2, -45, 1, 0, 7); ctx.fill(); }
    ctx.restore();
    drawEmote(ch, x, y - 68, "#9fb8ff");
  }

  function update(dt) {
    T += dt;
    if (!paused) {
      let dx = 0, dz = 0;
      if (input["arrowleft"] || input["a"]) dx -= 1;
      if (input["arrowright"] || input["d"]) dx += 1;
      if (player.flying) { if (input["arrowup"] || input["w"]) dz += 1; if (input["arrowdown"] || input["s"]) dz -= 1; }
      dx += axis.x; if (player.flying) dz += axis.z;
      dx = Math.max(-1, Math.min(1, dx)); dz = Math.max(-1, Math.min(1, dz));
      if (dx || dz) target = null;
      else if (target) {
        const tx = target.wx - player.wx;
        if (Math.abs(tx) > 8) dx = Math.sign(tx);
        const tz = target.z - player.z;
        if (player.flying && Math.abs(tz) > 8) dz = Math.sign(tz);
        if (Math.abs(tx) <= 8 && (!player.flying || Math.abs(tz) <= 8)) target = null;
      }
      const moving = moveChar(player, dx, dz, dt, false);
      updateIdle(player, dt, moving); updateChat(player, dt, moving);
      for (const fn of hooks.update) fn(dt);                       // AI / NPC / robot
      for (const ch of chars) if (ch !== player) { updateIdle(ch, dt, ch.moveT > 0.2); updateChat(ch, dt, ch.moveT > 0.2); }
      updatePeds(dt);

      cam.x += (clampCam(player.wx - W / 2) - cam.x) * Math.min(1, dt * 6);

      let best = null, bd = 1e9;
      for (const d of ISLANDS) {
        const dist = Math.abs(d._wx - player.wx);
        if (dist < d._w / 2 + 150 && dist < bd) { bd = dist; best = d; }
      }
      if (best !== nearest) {
        nearest = best;
        if (nearest && window.Sound) Sound.sfx("coin");
        cb.onProximity && cb.onProximity(nearest);
      }
      if (CUSTOM.effects && PERF.level > 0 && Math.random() < dt * 0.22)
        shooters.push({ x: Math.random() * W, y: Math.random() * H * 0.3, life: 1, vx: -(Math.random() * 300 + 300), vy: Math.random() * 120 + 60 });
    }

    for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 200 * dt; p.life -= dt; }
    particles = particles.filter((p) => p.life > 0);
    for (const tr of trail) tr.life -= dt;
    trail = trail.filter((tr) => tr.life > 0);
    for (const v of vehicles) { v.x += v.sp * dt; if (v.x > WORLD_W + 60) v.x = -60; if (v.x < -60) v.x = WORLD_W + 60; }
    for (const d of drones) { d.x += d.sp * dt; d.blink += dt; if (d.x > WORLD_W + 80) d.x = -80; if (d.x < -80) d.x = WORLD_W + 80; }
    if (CUSTOM.rain) updateRain(dt);
    for (const s of shooters) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * 1.1; }
    shooters = shooters.filter((s) => s.life > 0);
  }

  function updateRain(dt) {
    const step = (arr, slant) => {
      for (const r of arr) {
        r.y += r.s * dt; r.x -= r.s * dt * slant;
        if (r.y > r.hitY) {
          if (arr === rainNear && PERF.level > 0 && splashes.length < 14 && Math.random() < 0.6)
            splashes.push({ x: r.x, y: r.hitY, life: 0.32 });
          r.y = -20; r.x = Math.random() * (W + 240);
          r.hitY = GROUND + 4 + Math.random() * Math.max(10, H - GROUND - 12);
        }
      }
    };
    step(rainNear, 0.30); step(rainFar, 0.18);
    for (const s of splashes) s.life -= dt;
    splashes = splashes.filter((s) => s.life > 0);
  }

  /* ================= draw ================= */
  function draw() {
    if (!skyC) { resize(); if (!skyC) return; } // boyut henüz 0 ise güvenli çık
    curMastered = cb.getMastered ? cb.getMastered() : curMastered;
    ctx.drawImage(skyC, 0, 0, W, H);
    drawStars();
    if (CUSTOM.effects && PERF.level > 0) drawAurora();
    ctx.drawImage(moonC, W * 0.78 - cam.x * 0.04 - 90, H * 0.1, 180, 180);
    drawSkylineLayer(sklFar, 0.16, 0.85);
    drawSkylineLayer(sklMid, 0.32, 1);
    drawShooters();
    drawDrones();
    drawVehicles();
    if (CUSTOM.fog) { ctx.globalAlpha = 0.9; ctx.drawImage(fogC, 0, GROUND - 190, W, 200); ctx.globalAlpha = 1; }

    ctx.save(); ctx.translate(-cam.x, 0);
    for (const d of ISLANDS) drawBuilding(d);
    ctx.restore();

    drawStreet();
    if (CUSTOM.fog && PERF.level === 2) { ctx.globalAlpha = 0.35; ctx.drawImage(fogC, 0, GROUND - 80, W, 110); ctx.globalAlpha = 1; }
    ctx.save(); ctx.translate(-cam.x, 0);
    for (const fn of hooks.worldBack) fn(ctx);            // NPC'ler (karakterlerin arkasında)
    ctx.restore();
    drawTrail();
    for (const p of peds) drawPed(p);
    for (const ch of chars) if (!ch.hidden && ch !== player) drawChar(ch);
    if (!player.hidden) drawChar(player);
    ctx.save(); ctx.translate(-cam.x, 0);
    for (const fn of hooks.worldFront) fn(ctx);           // robot maskot (önde)
    ctx.restore();
    drawSparks();
    if (CUSTOM.rain) drawRain();
    ctx.drawImage(vignC, 0, 0, W, H);
    for (const fn of hooks.screen) fn(ctx);               // dokunmatik/HUD katmanları
    drawPrompt();
  }

  function drawStars() {
    const off = -((cam.x * 0.12) % W);
    ctx.globalAlpha = 0.45 + Math.sin(T * 0.9) * 0.3;
    ctx.drawImage(starsA, off, 0); ctx.drawImage(starsA, off + W, 0);
    ctx.globalAlpha = 0.45 + Math.cos(T * 1.1) * 0.3;
    ctx.drawImage(starsB, off, 0); ctx.drawImage(starsB, off + W, 0);
    ctx.globalAlpha = 1;
  }
  function drawAurora() {
    const cols = theme().aurora, bands = PERF.level === 2 ? 2 : 1;
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 0.09;
    for (let b = 0; b < bands; b++) {
      ctx.beginPath();
      const yBase = H * (0.15 + b * 0.1);
      for (let x = 0; x <= W; x += 48) {
        const y = yBase + Math.sin(x * 0.005 + T * 0.3 + b) * 26 + Math.sin(x * 0.013 - T * 0.5) * 12;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.4);
      g.addColorStop(0, hexA(cols[b % cols.length], 0.5)); g.addColorStop(1, hexA(cols[b % cols.length], 0));
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.restore();
  }
  function drawSkylineLayer(tile, par, alpha) {
    const y = GROUND + 10 - tile.height;
    const off = -((cam.x * par) % TILE_W);
    ctx.globalAlpha = alpha;
    for (let x = off; x < W; x += TILE_W) ctx.drawImage(tile, x, y);
    ctx.globalAlpha = 1;
  }
  function drawShooters() {
    ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,.8)";
    for (const s of shooters) {
      ctx.globalAlpha = Math.max(0, s.life) * 0.8;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 0.05, s.y - s.vy * 0.05); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function drawDrones() {
    for (const d of drones) {
      const x = d.x - cam.x * 0.75;
      if (x < -40 || x > W + 40) continue;
      const y = d.base + Math.sin(T + d.phase) * 16;
      ctx.fillStyle = "#1e293b"; roundRect(x - 7, y - 3, 14, 6, 2); ctx.fill();
      ctx.strokeStyle = "rgba(148,163,184,.5)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 10, y - 3); ctx.lineTo(x - 4, y - 3); ctx.moveTo(x + 4, y - 3); ctx.lineTo(x + 10, y - 3); ctx.stroke();
      const on = Math.sin(d.blink * 6) > 0, c = on ? "#ef4444" : theme().accent;
      drawGlow(x, y + 2, 22, c, 0.8);
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y + 3, 2, 0, 7); ctx.fill();
      ctx.fillStyle = hexA(c, 0.05);
      ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x - 14, y + 60); ctx.lineTo(x + 14, y + 60); ctx.closePath(); ctx.fill();
    }
  }
  function drawVehicles() {
    for (const v of vehicles) {
      const x = v.x - cam.x * 0.6;
      if (x < -60 || x > W + 60) continue;
      drawGlow(x, v.y, 24, v.c, 0.75);
      ctx.fillStyle = v.c; ctx.beginPath(); ctx.ellipse(x, v.y, 7, 2.4, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = hexA(v.c, 0.18); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, v.y); ctx.lineTo(x - Math.sign(v.sp) * 44, v.y); ctx.stroke();
    }
  }

  /* ---- bina: önbellek + canlı animasyon katmanı ---- */
  function drawBuilding(d) {
    const sx = d._wx, w = d._w, h = d._h, left = sx - w / 2, top = GROUND - h;
    if (sx - cam.x < -(w + 260) || sx - cam.x > W + w + 260) return;
    const c = getCache(d);
    ctx.drawImage(c.canvas, left - PAD, GROUND - c.lh, c.lw, c.lh);
    liveWindows(d, left, top, h);
    liveRoof(d, left, top, w);
    liveDoor(d, sx, GROUND, d === nearest);
    if (d === nearest) {
      ctx.strokeStyle = hexA("#ffffff", 0.35 + Math.abs(Math.sin(T * 4)) * 0.3);
      ctx.lineWidth = 2.5; ctx.strokeRect(left, top, w, h);
    }
  }

  function liveWindows(d, left, top, h) {
    const P = 26;
    if (d._win === "dataStream") {
      for (let cI = 0; cI < d._cols; cI++) {
        const speed = 26 + (d._seed + cI * 7) % 34;
        const span = d._winY1 - d._winY0;
        if (span <= 0) continue;
        const headY = d._winY0 + ((T * speed + (d._seed * (cI + 1)) % 300) % span);
        for (let k = 0; k < 4; k++) {
          const y = headY - k * P;
          if (y < d._winY0) break;
          ctx.fillStyle = hexA(d.color, (0.5 - k * 0.12));
          ctx.fillRect(left + d._colMx + cI * P, top + y, 16, 12);
        }
      }
      return;
    }
    for (const f of d._flick || []) {
      ctx.fillStyle = hexA(d.color, 0.15 + Math.abs(Math.sin(T * 1.8 + f.ph)) * 0.35);
      ctx.fillRect(left + f.x, top + f.y, 16, 12);
    }
  }

  function liveRoof(d, left, top, w) {
    const cx = left + w / 2, col = d.color;
    switch (d._roof) {
      case "antenna":
        blinkLight(cx, top - 30, d._seed); break;
      case "satellite": {
        ctx.save(); ctx.translate(cx, top - 22); ctx.rotate(Math.sin(T * 0.6) * 0.5 - 0.4);
        ctx.strokeStyle = shade(col, 10); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 14, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(6, -12); ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = hexA(col, 0.35 + Math.abs(Math.sin(T * 3)) * 0.35); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx + 8, top - 30, 10 + (T * 20 % 20), Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
        break;
      }
      case "dome": blinkLight(cx, top - w * 0.3 - 17, d._seed); break;
      case "spire":
        blinkLight(cx, top - 58, d._seed);
        drawGlow(cx, top - 58, 16, col, 0.3 + Math.abs(Math.sin(T * 2 + d._seed)) * 0.3);
        break;
      case "vault": {
        ctx.save(); ctx.translate(cx, top - 20);
        ctx.strokeStyle = hexA(col, 0.9); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.stroke();
        ctx.rotate(T * 1.2);
        for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(i) * 13, Math.sin(i) * 13); ctx.stroke(); }
        ctx.restore();
        break;
      }
      case "fortress": blinkLight(cx, top - 21, d._seed); break;
      case "lab":
        for (const ox of [-w * 0.2, w * 0.2]) {
          const lvl = 18 + Math.sin(T * 2 + ox) * 6;
          ctx.fillStyle = hexA(col, 0.3);
          roundRect(cx + ox - 7, top - lvl, 14, lvl, 4); ctx.fill();
          ctx.fillStyle = hexA(col, 0.7);
          ctx.beginPath(); ctx.arc(cx + ox, top - 8 - ((T * 30 + ox * 10) % 22), 2, 0, 7); ctx.fill();
        }
        break;
      case "billboard": {
        const bw = w * 0.68, bx = cx - bw / 2, byy = top - 50;
        ctx.fillStyle = hexA(col, 0.2 + Math.abs(Math.sin(T * 1.4 + d._seed)) * 0.2);
        roundRect(bx + 2, byy + 2, bw - 4, 36, 5); ctx.fill();
        ctx.font = "18px 'Segoe UI Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(d.icon, cx, byy + 20);
        break;
      }
      case "flag": {
        const fx0 = cx - w * 0.2;
        ctx.fillStyle = col; ctx.beginPath();
        ctx.moveTo(fx0, top - 50);
        for (let i = 0; i <= 6; i++) ctx.lineTo(fx0 + i * 7, top - 50 + Math.sin(T * 4 + i) * 3 + (i === 6 ? 6 : 0));
        for (let i = 6; i >= 0; i--) ctx.lineTo(fx0 + i * 7, top - 36 + Math.sin(T * 4 + i) * 3);
        ctx.closePath(); ctx.fill();
        ctx.font = "12px 'Segoe UI Emoji'"; ctx.textAlign = "center";
        ctx.fillText("🚩", fx0 + 20, top - 43);
        break;
      }
      case "hologram": {
        const hy = top - 42 + Math.sin(T * 1.5) * 6;
        drawGlow(cx, hy, 30, col, 0.6);
        ctx.strokeStyle = hexA(col, 0.5); ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(cx, hy, 18 - i * 3, 6, T + i, 0, 7); ctx.stroke(); }
        ctx.globalAlpha = 0.85 + Math.sin(T * 3) * 0.15;
        ctx.font = "26px 'Segoe UI Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(d.icon, cx, hy); ctx.globalAlpha = 1;
        ctx.fillStyle = hexA(col, 0.12); ctx.fillRect(cx - 13, hy + 6, 26, top - hy - 6);
        ctx.fillStyle = hexA(col, 0.06); ctx.fillRect(cx - 18, hy + 6, 36, top - hy - 6);
        break;
      }
      case "server":
        for (const ox of [-w * 0.22, 0, w * 0.22]) {
          ctx.fillStyle = hexA(col, 0.5 + Math.abs(Math.sin(T * 3 + ox)) * 0.4);
          ctx.fillRect(cx + ox - 6, top - 22, 12, 3);
        }
        break;
    }
  }
  function blinkLight(x, y, seed) {
    ctx.fillStyle = Math.sin(T * 4 + seed) > 0 ? "#ff5a5a" : "#5a1d1d";
    ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill();
  }
  function liveDoor(d, sx, gy, near) {
    const pulse = near ? 0.45 + Math.abs(Math.sin(T * 5)) * 0.35 : 0.18;
    drawGlow(sx, gy - 45, 52, d.color, pulse);
    ctx.font = "20px 'Segoe UI Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.globalAlpha = 0.92; ctx.fillText(d.icon, sx, gy - 40); ctx.globalAlpha = 1;
  }

  /* ---- cadde: taban + ıslak yansımalar + lambalar ---- */
  function drawStreet() {
    ctx.drawImage(streetC, 0, GROUND, W, H - GROUND);
    /* bina yansımaları (ters çevrilmiş önbellek görüntüleri) */
    if (PERF.level > 0) {
      ctx.save();
      ctx.translate(-cam.x, GROUND); ctx.scale(1, -0.45);
      ctx.globalAlpha = 0.16;
      for (const d of ISLANDS) {
        const sx = d._wx;
        if (sx - cam.x < -(d._w + 260) || sx - cam.x > W + d._w + 260) continue;
        const c = getCache(d);
        ctx.drawImage(c.canvas, sx - d._w / 2 - PAD, -c.lh, c.lw, c.lh);
      }
      ctx.restore();
    }
    ctx.drawImage(reflFadeC, 0, GROUND, W, H - GROUND);
    /* neon kaldırım çizgisi */
    ctx.strokeStyle = hexA(theme().accent, 0.14); ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, GROUND + 2); ctx.lineTo(W, GROUND + 2); ctx.stroke();
    ctx.strokeStyle = hexA(theme().accent, 0.65); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND + 2); ctx.lineTo(W, GROUND + 2); ctx.stroke();
    /* şerit çizgileri */
    ctx.strokeStyle = "rgba(148,163,184,.16)"; ctx.lineWidth = 3; ctx.setLineDash([34, 30]);
    ctx.lineDashOffset = -cam.x % 64;
    const midY = GROUND + (H - GROUND) * 0.55;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke(); ctx.setLineDash([]);
    /* sokak lambaları */
    const lampC = theme().lamp;
    for (let i = -1; i < Math.ceil(W / 360) + 1; i++) {
      const lx = i * 360 - (cam.x % 360) + 100;
      if (lx < -50 || lx > W + 50) continue;
      ctx.strokeStyle = "#26314a"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(lx, GROUND); ctx.lineTo(lx, GROUND - 48); ctx.stroke();
      ctx.strokeStyle = "#26314a"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lx, GROUND - 48); ctx.lineTo(lx + 14, GROUND - 52); ctx.stroke();
      drawGlow(lx + 16, GROUND - 52, 30, lampC, 0.8);
      ctx.fillStyle = lampC; ctx.beginPath(); ctx.arc(lx + 16, GROUND - 52, 2.5, 0, 7); ctx.fill();
      ctx.fillStyle = hexA(lampC, 0.06);
      ctx.beginPath(); ctx.ellipse(lx + 16, GROUND + 12, 46, 8, 0, 0, 7); ctx.fill();
    }
  }

  function drawTrail() {
    const cc = CUSTOM.charColor || "#22c55e";
    for (const tr of trail) {
      const a = tr.life / 0.45;
      ctx.globalAlpha = a * 0.35;
      ctx.fillStyle = tr.color || cc;
      ctx.beginPath(); ctx.arc(tr.x - cam.x, tr.y, 2 + a * 3, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ================= KARAKTERLER ================= */
  /* style "maksut": kıvırcık siyah saç + gözlük + hafif sakal + kulaklık +
     siyah hoodie (kapüşon arkada). style "guest": kapüşon KAFADA, anonim
     parlayan gözlü misafir. İkisi de idle animasyonlu (göz kırpma, telefon,
     gerinme, bakınma, ağırlık aktarma) + emote balonu destekli. */
  const SKIN = "#e6b184", HAIR = "#14161c", HOODIE = "#161b26", HOODIE_L = "#242c3c", PANTS = "#232c3f";
  /* Kosovalı Mihri paleti: bembeyaz ten, aşırı belli sarı saç, aşırı belli mavi göz */
  const MIHRI_SKIN = "#fdeee6", MIHRI_HAIR = "#ffd21e", MIHRI_HAIR_D = "#e8b400", MIHRI_EYE = "#1e90ff";
  function drawChar(ch) {
    if (ch.ped) return drawPed(ch);
    const x = ch.wx - cam.x, y = GROUND - ch.z, d = ch.dir, fly = ch.flying;
    if (x < -80 || x > W + 80) return;
    const run = ch.moveT, acc = ch.accent || CUSTOM.charColor || "#22c55e";
    const guest = ch.style === "guest", mihri = ch.style === "mihri";
    const skin = mihri ? MIHRI_SKIN : SKIN;
    const stepA = Math.sin(ch.anim), stepB = Math.sin(ch.anim + Math.PI);
    const liftA = Math.max(0, -Math.cos(ch.anim)) * 6 * run;
    const liftB = Math.max(0, Math.cos(ch.anim)) * 6 * run;
    const idle = ch.idleAct, idP = ch.idleP;
    const breathe = run < 0.1 && !fly ? Math.sin(T * 1.8) * 0.8 : 0;
    const bob = fly ? Math.sin(T * 3) * 3 : Math.abs(stepA) * 2.2 * run + breathe;
    const hipX = idle === "shift" ? Math.sin(idP * 2.1) * 1.6 : 0;

    /* gölge */
    const shScale = Math.max(0.15, 1 - ch.z / (H * 0.5));
    ctx.fillStyle = `rgba(0,0,0,${0.35 * shScale})`;
    ctx.beginPath(); ctx.ellipse(x, GROUND + 3, 24 * shScale, 7 * shScale, 0, 0, 7); ctx.fill();

    ctx.save();
    ctx.translate(x + hipX, y - bob);
    ctx.rotate((fly ? 0.2 : run * 0.06) * d);
    ctx.scale(d, 1);

    /* jetpack (uçarken) */
    if (fly) {
      ctx.fillStyle = "#39414f"; roundRect(-17, -50, 9, 24, 4); ctx.fill();
      ctx.fillStyle = acc; ctx.fillRect(-15.5, -46, 6, 2.5);
      ctx.fillStyle = "#2a303c"; roundRect(-16, -27, 7, 5, 2); ctx.fill();
      const fl = 10 + Math.random() * 9;
      drawGlow(-12, -18, 18, "#fb923c", 0.7);
      const fgr = ctx.createLinearGradient(0, -24, 0, -24 + fl + 8);
      fgr.addColorStop(0, "#fde047"); fgr.addColorStop(.5, "#fb923c"); fgr.addColorStop(1, "rgba(239,68,68,0)");
      ctx.fillStyle = fgr;
      ctx.beginPath(); ctx.moveTo(-16, -23); ctx.lineTo(-12, -23 + fl + 8); ctx.lineTo(-8, -23); ctx.closePath(); ctx.fill();
    }

    /* arka kol: gerinmede yukarı, normalde sallanır */
    if (idle === "stretch") limb(-3, -46, -8, -63 - Math.sin(idP * 3) * 2, shade2(HOODIE, -14), 5.5);
    else limb(-3, -46, -3 - stepA * 8 * run - (fly ? 7 : 0), -30 + (fly ? -4 : 0), shade2(HOODIE, -14), 5.5);
    /* arka bacak */
    leg(-3, -26, stepB * 10 * run - 3, -liftB, shade2(PANTS, -18), true, acc);

    /* kapüşon arkada (misafirde kapüşon kafada olduğundan atlanır) */
    if (!guest) {
      ctx.fillStyle = shade2(HOODIE, -8);
      ctx.beginPath(); ctx.ellipse(-8, -51, 7, 5.5, -0.4, 0, 7); ctx.fill();
    }

    /* gövde: siyah hoodie */
    const bg = ctx.createLinearGradient(-11, -54, 11, -24);
    bg.addColorStop(0, HOODIE_L); bg.addColorStop(.5, HOODIE); bg.addColorStop(1, "#0d1119");
    ctx.fillStyle = bg; roundRect(-11, -54, 22, 30, 9); ctx.fill();
    /* fermuar (neon) */
    ctx.strokeStyle = hexA(acc, 0.9); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(2, -50); ctx.lineTo(2, -27); ctx.stroke();
    /* kapüşon ipleri */
    ctx.strokeStyle = hexA(acc, 0.8); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-1, -50); ctx.lineTo(-2, -43); ctx.moveTo(5, -50); ctx.lineTo(6, -43); ctx.stroke();
    /* cep çizgisi + sol rim ışığı */
    ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-8, -30); ctx.quadraticCurveTo(0, -27, 8, -30); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.2)";
    ctx.beginPath(); ctx.moveTo(-10.5, -50); ctx.quadraticCurveTo(-11.5, -38, -9, -26); ctx.stroke();
    /* göğüste mini kalkan rozeti */
    ctx.fillStyle = hexA(acc, 0.9);
    ctx.beginPath(); ctx.moveTo(7, -47); ctx.lineTo(9.5, -46); ctx.lineTo(9.5, -43.5);
    ctx.quadraticCurveTo(9.5, -41.5, 7, -40.8); ctx.quadraticCurveTo(4.5, -41.5, 4.5, -43.5);
    ctx.lineTo(4.5, -46); ctx.closePath(); ctx.fill();

    /* ön bacak */
    leg(3, -26, stepA * 10 * run + 3, -liftA, PANTS, false, acc);

    /* boyunda kulaklık (yalnız Maksut) */
    if (!guest && !mihri) {
      ctx.strokeStyle = "#0c1018"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0.5, -53, 8.5, Math.PI * 0.12, Math.PI * 0.88); ctx.stroke();
      ctx.fillStyle = "#1b202c";
      roundRect(-10.5, -56, 5, 7.5, 2.5); ctx.fill();
      roundRect(6, -56, 5, 7.5, 2.5); ctx.fill();
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.arc(8.5, -52.5, 1, 0, 7); ctx.fill();
    }

    /* baş */
    const lookX = idle === "look" ? Math.sin(idP * 1.6) * 1.5 : 0;
    const eyeDown = idle === "phone" ? 1 : 0;
    if (guest) {
      /* misafir: kapüşon kafada, karanlık yüz + parlayan gözler.
         Kız seçilirse kapüşon arkasından at kuyruğu çıkar (cinsiyet ipucu). */
      if (ch.fem) {
        ctx.fillStyle = "#4a5468";
        ctx.beginPath(); ctx.ellipse(-10, -58, 3.2, 8.5, 0.5, 0, 7); ctx.fill();
        ctx.strokeStyle = hexA(acc, 0.5); ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.fillStyle = HOODIE_L;
      ctx.beginPath(); ctx.arc(1, -64, 11.5, 0, 7); ctx.fill();
      ctx.fillStyle = shade2(HOODIE, -6);
      ctx.beginPath(); ctx.arc(1, -63.5, 10.2, Math.PI * 0.82, Math.PI * 2.18); ctx.fill();
      ctx.fillStyle = "#080c16"; /* kapüşon içi gölge yüz */
      ctx.beginPath(); ctx.ellipse(2.5, -63, 7.6, 8.2, 0, 0, 7); ctx.fill();
      if (ch.blinkD > 0) {
        ctx.strokeStyle = acc; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(4.4 + lookX, -64.6 + eyeDown); ctx.lineTo(7.4 + lookX, -64.6 + eyeDown);
        ctx.moveTo(-2.4 + lookX, -64.6 + eyeDown); ctx.lineTo(0.6 + lookX, -64.6 + eyeDown); ctx.stroke();
      } else {
        ctx.fillStyle = acc;
        ctx.beginPath(); ctx.arc(6 + lookX, -64.5 + eyeDown, 1.5, 0, 7); ctx.arc(-1 + lookX, -64.5 + eyeDown, 1.5, 0, 7); ctx.fill();
      }
      ctx.strokeStyle = hexA(acc, 0.8); ctx.lineWidth = 1.2; /* kapüşon ipleri */
      ctx.beginPath(); ctx.moveTo(-2, -52); ctx.lineTo(-3, -45); ctx.moveTo(4, -52); ctx.lineTo(5, -45); ctx.stroke();
    } else if (mihri) {
      /* Kosovalı Mihri: uzun SARI saç + bembeyaz yüz + AŞIRI belli MAVİ göz + gözlük */
      // arka saç kütlesi + omuza dökülen tutamlar
      ctx.fillStyle = MIHRI_HAIR_D;
      ctx.beginPath(); ctx.ellipse(0, -61, 12.5, 15, 0, 0, 7); ctx.fill();
      ctx.fillStyle = MIHRI_HAIR;
      ctx.beginPath(); ctx.moveTo(-10, -72); ctx.quadraticCurveTo(-15.5, -54, -10.5, -40);
      ctx.quadraticCurveTo(-8, -45, -6.5, -55); ctx.quadraticCurveTo(-8, -66, -7, -72); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(10, -72); ctx.quadraticCurveTo(15.5, -54, 10.5, -40);
      ctx.quadraticCurveTo(8, -45, 6.5, -55); ctx.quadraticCurveTo(8, -66, 7, -72); ctx.closePath(); ctx.fill();
      // yüz (bembeyaz ten)
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(1, -64, 10, 0, 7); ctx.fill();
      // yanak allığı + dudak
      ctx.fillStyle = "rgba(255,150,175,.45)";
      ctx.beginPath(); ctx.arc(6, -60, 2.1, 0, 7); ctx.arc(-3, -60, 1.9, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(219,88,120,.85)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(2.6, -58.4); ctx.quadraticCurveTo(4.6, -57.2, 6.6, -58.6); ctx.stroke();
      // AŞIRI belli mavi gözler (büyük)
      if (ch.blinkD > 0) {
        ctx.strokeStyle = "#c9a"; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(4.4 + lookX, -65 + eyeDown); ctx.lineTo(8.7 + lookX, -65 + eyeDown);
        ctx.moveTo(-4.3 + lookX, -65 + eyeDown); ctx.lineTo(-0.1 + lookX, -65 + eyeDown); ctx.stroke();
      } else {
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.ellipse(6.6 + lookX, -65 + eyeDown, 2.7, 3.1, 0, 0, 7);
        ctx.ellipse(-2.2 + lookX, -65 + eyeDown, 2.5, 3, 0, 0, 7); ctx.fill();
        ctx.fillStyle = MIHRI_EYE;
        ctx.beginPath(); ctx.arc(6.8 + lookX, -64.6 + eyeDown, 2, 0, 7); ctx.arc(-2 + lookX, -64.6 + eyeDown, 1.9, 0, 7); ctx.fill();
        ctx.fillStyle = "#0a1230";
        ctx.beginPath(); ctx.arc(6.8 + lookX, -64.6 + eyeDown, 0.95, 0, 7); ctx.arc(-2 + lookX, -64.6 + eyeDown, 0.9, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(7.5 + lookX, -65.5 + eyeDown, 0.7, 0, 7); ctx.arc(-1.4 + lookX, -65.5 + eyeDown, 0.65, 0, 7); ctx.fill();
        ctx.strokeStyle = MIHRI_HAIR_D; ctx.lineWidth = 1.3; // kaş/kirpik
        ctx.beginPath(); ctx.moveTo(3.9 + lookX, -68.6); ctx.lineTo(9 + lookX, -68.9);
        ctx.moveTo(-4.5 + lookX, -68.6); ctx.lineTo(-0.2 + lookX, -68.9); ctx.stroke();
      }
      // gözlük (ince açık çerçeve + cam parlaması)
      ctx.strokeStyle = "rgba(20,30,45,.85)"; ctx.lineWidth = 1.4;
      roundRect(3.4, -68, 6.9, 6.2, 2.6); ctx.stroke();
      roundRect(-5.7, -68, 6.9, 6.2, 2.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1.2, -65); ctx.lineTo(3.4, -65); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(9, -67); ctx.lineTo(6.6, -63); ctx.stroke();
      // üst saç kubbesi + kâkül (sarı çok belirgin)
      ctx.fillStyle = MIHRI_HAIR;
      ctx.beginPath(); ctx.moveTo(-11, -66);
      ctx.quadraticCurveTo(-12.5, -80, 1, -80.5); ctx.quadraticCurveTo(13.5, -80, 12, -66);
      ctx.quadraticCurveTo(9, -70, 6, -69.5); ctx.quadraticCurveTo(3.5, -72, 1, -71.5);
      ctx.quadraticCurveTo(-2, -72, -5, -69.5); ctx.quadraticCurveTo(-8, -70, -11, -66); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(-2, -74, 4.5, 3.7, 5.5); ctx.stroke();
    } else {
      /* Maksut: yüz + sakal + gözlük + kıvırcık saç */
      ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(1, -64, 10, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(38,30,26,.5)"; /* hafif sakal (çene hattı) */
      ctx.beginPath(); ctx.arc(1.5, -62.5, 9.4, Math.PI * 0.12, Math.PI * 0.88); ctx.fill();
      ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(1.5, -63.8, 7.2, Math.PI * 0.15, Math.PI * 0.85); ctx.fill();
      ctx.strokeStyle = "rgba(40,30,25,.55)"; ctx.lineWidth = 1.2; /* ağız */
      ctx.beginPath(); ctx.moveTo(3, -59.5); ctx.quadraticCurveTo(5, -58.8, 6.8, -59.6); ctx.stroke();
      /* gözlük */
      ctx.fillStyle = "rgba(130,220,255,.16)";
      roundRect(3.2, -68.5, 7.4, 6.4, 2.4); ctx.fill();
      roundRect(-6.4, -68.5, 7.4, 6.4, 2.4); ctx.fill();
      ctx.strokeStyle = "#0b1220"; ctx.lineWidth = 1.5;
      roundRect(3.2, -68.5, 7.4, 6.4, 2.4); ctx.stroke();
      roundRect(-6.4, -68.5, 7.4, 6.4, 2.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1, -65.6); ctx.lineTo(3.2, -65.6); ctx.stroke();
      if (ch.blinkD > 0) { /* göz kırpma: kapalı kapaklar */
        ctx.strokeStyle = "#8a6b4f"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(5.6, -65.2 + eyeDown); ctx.lineTo(8.4, -65.2 + eyeDown);
        ctx.moveTo(-4, -65.2 + eyeDown); ctx.lineTo(-1.2, -65.2 + eyeDown); ctx.stroke();
      } else {
        ctx.fillStyle = "#1a2333";
        ctx.beginPath(); ctx.arc(7 + lookX, -65.2 + eyeDown, 1.3, 0, 7); ctx.arc(-2.6 + lookX, -65.2 + eyeDown, 1.3, 0, 7); ctx.fill();
      }
      ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1; /* cam parlaması */
      ctx.beginPath(); ctx.moveTo(8.6, -67.6); ctx.lineTo(6.2, -63.4); ctx.stroke();
      /* kıvırcık siyah saç */
      ctx.fillStyle = HAIR;
      [[-6, -71, 5.2], [-1, -74.5, 5.4], [4.5, -73.5, 5], [8.5, -70, 4.2], [-9, -67, 4], [-3.5, -76.5, 4]].forEach(([hx, hy, hr]) => {
        ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.fill();
      });
      ctx.strokeStyle = "rgba(90,100,120,.35)"; ctx.lineWidth = 1; /* bukle parlaması */
      ctx.beginPath(); ctx.arc(-2, -74, 3, 0.5, 2.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(5, -72.5, 2.6, 0.3, 2); ctx.stroke();
    }

    /* ön kol: telefon bakışı / gerinme / normal salınım */
    if (idle === "phone") {
      limb(3, -45, 10, -38, HOODIE_L, 5.5);
      limb(10, -38, 9, -50, HOODIE_L, 5);
      ctx.save(); ctx.translate(9, -54); ctx.rotate(-0.15);
      ctx.fillStyle = "#0d1220"; roundRect(-2.6, -4.5, 5.2, 9, 1.6); ctx.fill();
      ctx.fillStyle = hexA(acc, 0.6 + Math.sin(T * 2.4) * 0.15); roundRect(-1.9, -3.6, 3.8, 7.2, 1.2); ctx.fill();
      ctx.restore();
    } else if (idle === "stretch") {
      limb(3, -45, 8, -63 - Math.sin(idP * 3) * 2, HOODIE_L, 5.5);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(8, -64 - Math.sin(idP * 3) * 2, 2.6, 0, 7); ctx.fill();
    } else {
      limb(3, -45, 3 + stepB * 8 * run + (fly ? -8 : 0), -31 + (fly ? -5 : 0), HOODIE_L, 5.5);
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.arc(3 + stepB * 8 * run + (fly ? -8 : 0), -30 + (fly ? -5 : 0), 2.6, 0, 7); ctx.fill();
    }

    ctx.restore();

    /* isim etiketi + emote balonu */
    ctx.font = "700 13px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    const label = ch.label + (fly ? " ✈️" : "");
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(2,4,12,.8)";
    ctx.strokeText(label, x, y - bob - 84);
    ctx.fillStyle = guest ? hexA(acc, 0.95) : "#a7f3d0";
    ctx.fillText(label, x, y - bob - 84);
    drawEmote(ch, x, y - bob - 112, acc);
  }
  function limb(x1, y1, x2, y2, color, w) {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  /* bacak: kalça→diz→ayak (dizden kırılan doğal yürüyüş) + sneaker */
  function leg(hx, hy, fx, fy, color, back, acc) {
    const kx = (hx + fx) / 2 + 3.5, ky = (hy + fy) / 2 + 1;
    ctx.strokeStyle = color; ctx.lineWidth = 6.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(kx, ky, fx, fy); ctx.stroke();
    /* sneaker */
    ctx.fillStyle = back ? "#b9c2d4" : "#e2e8f0";
    roundRect(fx - 3.5, fy - 4.5, 11, 5, 2.4); ctx.fill();
    ctx.fillStyle = hexA(acc, back ? 0.5 : 0.9);
    ctx.fillRect(fx - 3.5, fy - 0.5, 11, 1.6);
  }

  function drawSparks() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x - cam.x, p.y, 3, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---- yağmur: iki derinlik katmanı (tek path'te toplu çizim) + sıçrama ---- */
  function drawRain() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(150,190,255,.10)";
    ctx.beginPath();
    for (const r of rainFar) { ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - r.l * 0.18, r.y + r.l); }
    ctx.stroke();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "rgba(170,205,255,.20)";
    ctx.beginPath();
    for (const r of rainNear) { ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - r.l * 0.3, r.y + r.l); }
    ctx.stroke();
    for (const s of splashes) {
      const t01 = 1 - s.life / 0.32;
      ctx.globalAlpha = s.life * 1.1;
      ctx.strokeStyle = "rgba(170,205,255,.5)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(s.x, s.y, 2 + t01 * 8, 1 + t01 * 2.4, 0, 0, 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawPrompt() {
    if (!nearest || paused) return;
    const txt = `"${nearest.name}" binasına gir`;
    ctx.font = "600 15px system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const tw = ctx.measureText(txt).width;
    const w = tw + 78, bx = W / 2 - w / 2, by = H - 80;
    ctx.fillStyle = "rgba(6,10,24,.92)"; roundRect(bx, by, w, 44, 12); ctx.fill();
    ctx.strokeStyle = hexA(nearest.color, 0.25); ctx.lineWidth = 5; roundRect(bx, by, w, 44, 12); ctx.stroke();
    ctx.strokeStyle = nearest.color; ctx.lineWidth = 1.5; roundRect(bx, by, w, 44, 12); ctx.stroke();
    /* E tuş kapağı */
    ctx.fillStyle = "#e2e8f0"; roundRect(bx + 14, by + 10, 24, 24, 6); ctx.fill();
    ctx.fillStyle = "#0f172a"; ctx.font = "800 14px system-ui"; ctx.textAlign = "center";
    ctx.fillText("E", bx + 26, by + 23);
    ctx.fillStyle = "#f1f5f9"; ctx.font = "600 15px system-ui"; ctx.textAlign = "left";
    ctx.fillText(txt, bx + 48, by + 23);
  }

  /* ---- yardımcılar ---- */
  function trackName(t) { return { red: "Kırmızı", blue: "Mavi", both: "Karma", foundation: "Temel" }[t] || t; }
  function fitOn(g, s, max) {
    g.font = "700 14px system-ui";
    if (g.measureText(s).width <= max) return s;
    while (s.length > 3 && g.measureText(s + "…").width > max) s = s.slice(0, -1);
    return s + "…";
  }
  function roundRect(x, y, w, h, r) { roundRectOn(ctx, x, y, w, h, r); }
  function roundRectOn(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function roundRectTopOn(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + r);
    g.arcTo(x, y, x + r, y, r); g.lineTo(x + w - r, y);
    g.arcTo(x + w, y, x + w, y + r, r); g.lineTo(x + w, y + h); g.closePath();
  }
  function hexA(hex, a) {
    if (hex[0] !== "#") return hex;
    const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = clampC(((n >> 16) & 255) + amt), g = clampC(((n >> 8) & 255) + amt), b = clampC((n & 255) + amt);
    return `rgb(${r},${g},${b})`;
  }
  /* shade ama rgb()/hex ikisini de kabul eder */
  function shade2(c, amt) {
    if (c[0] === "#") return shade(c, amt);
    const m = c.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return c;
    return `rgb(${clampC(+m[1] + amt)},${clampC(+m[2] + amt)},${clampC(+m[3] + amt)})`;
  }
  const clampC = (v) => Math.max(0, Math.min(255, v));
  function hash(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff; return h; }

  function loop(ts) {
    if (!running || bgHidden) return;
    const dt = Math.min(0.05, (ts - lastT) / 1000 || 0); lastT = ts;
    // Panel/modal açıkken (paused) şehir tam ekran bir overlay + backdrop-filter
    // blur ardında kalır. O sırada her karede tüm sahneyi yeniden çizmek,
    // tarayıcıyı her karede blur'u yeniden hesaplamaya zorlar → binaya girince
    // hissedilen kasma. Duraklamışken bir kez daha çizip sonra çizimi bırakıyoruz;
    // son kare donuk kalır (blur'un altında görünmez) ve GPU rahatlar.
    perfSample(dt);
    update(dt);
    if (!paused) { draw(); pausedDrawn = false; }
    else if (!pausedDrawn) { draw(); pausedDrawn = true; }
    requestAnimationFrame(loop);
  }

  window.Engine = {
    init,
    start() {
      if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(loop); }
      if (window.Sound && CUSTOM.ambient) Sound.startAmbient();
    },
    pause() {
      paused = true;
      ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].forEach((k) => input[k] = false);
      target = null;
      if (player.flying) { player.flying = false; window.Sound && Sound.setJet(false); }
    },
    resume() { paused = false; },
    teleportTo(id) { const d = ISLANDS.find((i) => i.id === id); if (d) { player.wx = d._wx; player.z = 0; cam.x = clampCam(player.wx - W / 2); } },
    setCustom(obj) {
      const themeChanged = obj && obj.theme && obj.theme !== CUSTOM.theme;
      Object.assign(CUSTOM, obj || {});
      try { localStorage.setItem("maksut_custom", JSON.stringify(CUSTOM)); } catch (e) {}
      if (themeChanged) { buildStatic(); applyThemeVars(); }
      if (window.Sound) { if (CUSTOM.ambient) Sound.startAmbient(); else Sound.stopAmbient(); }
    },
    getCustom: () => ({ ...CUSTOM }),
    getPerf: () => ({ level: PERF.level, dpr }),
    debugFrame(dt) { update(dt || 0.016); draw(); }, // sandbox/test: RAF olmadan tek kare
    /* ---- çoklu karakter / eklenti API'si (npc.js, robot.js, ai.js, touch.js) ---- */
    setMode(m) {
      MODE = m === "visitor" ? "visitor" : "admin";
      if (MODE === "visitor") {
        player.style = "guest"; player.label = "Misafir"; player.chat = null;
        if (!aiMaksut) { aiMaksut = mkChar(START_X + GAP * 2, { style: "maksut", label: "Maksut", chat: HERO_GREETS }); chars.push(aiMaksut); }
      } else {
        player.style = "maksut"; player.label = "Maksut"; player.chat = HERO_GREETS;
        if (aiMaksut) { chars.splice(chars.indexOf(aiMaksut), 1); aiMaksut = null; }
      }
      if (!peds.length) spawnPeds();
    },
    /* ziyaretçi kendi misafir karakterini kişiselleştirir (cinsiyet + isim) */
    setGuest(opt) {
      if (!opt) return;
      if (typeof opt.name === "string" && opt.name.trim()) player.label = opt.name.trim().slice(0, 16);
      player.fem = !!opt.fem;
    },
    getMode: () => MODE,
    getAiChar: () => aiMaksut,
    getPlayerChar: () => player,
    addHook(type, fn) { if (hooks[type]) hooks[type].push(fn); },
    setAxis(x, z) { axis.x = x || 0; axis.z = z || 0; },
    moveChar,
    getView: () => ({ W, H, GROUND, camX: cam.x, T, worldW: WORLD_W }),
    glow: (x, y, r, c, a) => drawGlow(x, y, r, c, a),
    splash, getPlayer: () => ({ x: px(), y: py() }), getNearest: () => nearest,
    getTheme: () => ({ ...theme() }),
    /* minimap için: dünya genişliği + her binanın dünya-x'i + oyuncu x'i */
    getMapData: () => ({
      worldW: WORLD_W,
      playerX: player.wx,
      buildings: ISLANDS.map((i) => ({ id: i.id, x: i._wx, color: i.color, track: i.track })),
    }),
    walkTo: (id) => { const d = ISLANDS.find((i) => i.id === id); if (d) target = { wx: d._wx, z: 0 }; },
  };
})();
