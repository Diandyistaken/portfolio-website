/* =========================================================================
 * ROBOT MASKOT — sitedeki RobotBuddy'nin oyun içi ikizi.
 * Tek büyük gözlü, pervaneli mini dron-robot: oyuncuyu yaylı takip eder,
 * mouse/parmakla TUTULUP SÜRÜKLENEBİLİR (bırakınca fırlar + yayla döner),
 * tıklanınca takla atar ve sohbet açar. Idle: süzülme, göz kırpma, tarama
 * ışını, devriye, uyuklama (Zzz), ara sıra emoji balonu.
 * ========================================================================= */
(function () {
  const ACC = "#22d3ee", BODY = "#10141f", EDGE = "#2dd4bf";
  function hexA(hex, a) {
    if (hex[0] !== "#") return hex;
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  const bot = {
    x: 0, y: 0, vx: 0, vy: 0, inited: false,
    mode: "follow", // follow | patrol | sleep | drag | toss | roll
    blinkT: 3, blinkD: 0, scanT: 10, scanP: -1,
    idleSince: 0, patrolTx: 0, rollP: -1, rollKey: 0,
    drag: null, lastP: null, quipT: 5, quip: null, quipP: 0,
    zz: [], emT: 25, emote: null, emP: 0,
    eyeX: 0, eyeY: 0, mood: "normal", // normal | happy | squint
  };

  function init() {
    const v = Engine.getView();
    const p = Engine.getPlayerChar();
    bot.x = p.wx - 70; bot.y = v.GROUND - 130; bot.inited = true;
    Engine.addHook("update", update);
    Engine.addHook("worldFront", draw);
    Engine.addHook("pointer", onDown);
    Engine.addHook("pointerMove", onMove);
    Engine.addHook("pointerUp", onUp);
  }

  const hit = (pt) => {
    const v = Engine.getView();
    const sx = bot.x - v.camX;
    return Math.hypot(pt.sx - sx, pt.sy - bot.y) < 26;
  };
  function onDown(pt) {
    if (!hit(pt)) return false;
    bot.drag = { sx: pt.sx, sy: pt.sy, moved: 0 };
    bot.lastP = { sx: pt.sx, sy: pt.sy, t: performance.now() };
    bot.mode = "drag"; bot.mood = "squint"; wake();
    return true; // yürüme hedefini engelle
  }
  function onMove(pt) {
    if (bot.mode !== "drag" || !bot.drag) return;
    const v = Engine.getView();
    bot.drag.moved += Math.hypot(pt.sx - (bot.lastP ? bot.lastP.sx : pt.sx), pt.sy - (bot.lastP ? bot.lastP.sy : pt.sy));
    const now = performance.now(), dtms = Math.max(8, now - (bot.lastP ? bot.lastP.t : now));
    bot.vx = ((pt.sx - (bot.lastP ? bot.lastP.sx : pt.sx)) / dtms) * 1000;
    bot.vy = ((pt.sy - (bot.lastP ? bot.lastP.sy : pt.sy)) / dtms) * 1000;
    bot.lastP = { sx: pt.sx, sy: pt.sy, t: now };
    bot.x = pt.sx + v.camX; bot.y = pt.sy;
  }
  function onUp() {
    if (bot.mode !== "drag" || !bot.drag) return;
    const clicked = bot.drag.moved < 8;
    bot.drag = null; bot.mood = "normal";
    if (clicked) {
      bot.mode = "roll"; bot.rollP = 0; bot.rollKey++;
      window.Sound && Sound.sfx("coin");
      if (window.Dialog) Dialog.openRobot();
    } else {
      bot.mode = "toss"; // hız zaten ölçüldü — fırlat, sürtünmeyle yavaşla
      window.Sound && Sound.sfx("xp");
    }
  }
  function wake() { bot.idleSince = 0; if (bot.mode === "sleep" || bot.mode === "patrol") bot.mode = "follow"; bot.zz = []; }

  function update(dt) {
    if (!bot.inited) return;
    const v = Engine.getView(), p = Engine.getPlayerChar();
    const T = v.T;
    /* göz kırpma */
    bot.blinkT -= dt;
    if (bot.blinkT <= 0) { bot.blinkT = 2.2 + Math.random() * 3.4; bot.blinkD = 0.12; }
    if (bot.blinkD > 0) bot.blinkD -= dt;
    /* oyuncu hareketsizliği → devriye → uyku */
    bot.idleSince += dt;
    if (p.moveT > 0.2) wake();
    if (bot.mode === "follow" && bot.idleSince > 14) { bot.mode = "patrol"; bot.patrolTx = bot.x + (Math.random() < 0.5 ? -1 : 1) * 160; }
    if (bot.mode === "patrol" && bot.idleSince > 30) bot.mode = "sleep";

    const hover = Math.sin(T * 2.1) * 5;
    if (bot.mode === "follow" || bot.mode === "roll") {
      const tx = p.wx - p.dir * 52, ty = v.GROUND - 128 + hover;
      spring(tx, ty, dt, 5.2, 4.2);
      if (bot.mode === "roll") { bot.rollP += dt; if (bot.rollP > 0.6) { bot.mode = "follow"; bot.rollP = -1; } }
      /* tarama ışını arada bir */
      bot.scanT -= dt;
      if (bot.scanT <= 0 && bot.scanP < 0) { bot.scanP = 0; bot.scanT = 12 + Math.random() * 10; }
      if (bot.scanP >= 0) { bot.scanP += dt; if (bot.scanP > 2.6) bot.scanP = -1; }
    } else if (bot.mode === "patrol") {
      spring(bot.patrolTx, v.GROUND - 138 + hover, dt, 2.6, 3.4);
      if (Math.abs(bot.x - bot.patrolTx) < 14) bot.patrolTx = bot.x + (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 160);
    } else if (bot.mode === "sleep") {
      spring(bot.x, v.GROUND - 108 + Math.sin(T * 1.1) * 3, dt, 2, 3);
      if (Math.random() < dt * 0.7) bot.zz.push({ x: bot.x + 10, y: bot.y - 14, life: 2.2, dx: 8 + Math.random() * 6 });
    } else if (bot.mode === "toss") {
      bot.x += bot.vx * dt; bot.y += bot.vy * dt;
      bot.vy += 420 * dt; bot.vx *= 1 - Math.min(1, dt * 1.6);
      if (bot.y > v.GROUND - 26) { bot.y = v.GROUND - 26; bot.vy *= -0.45; window.Sound && Sound.sfx("click"); }
      if (Math.hypot(bot.vx, bot.vy) < 60) { bot.mode = "follow"; }
    }
    bot.x = Math.max(60, Math.min(v.worldW - 60, bot.x));
    bot.y = Math.max(50, Math.min(v.GROUND - 20, bot.y));

    for (const z of bot.zz) { z.y -= dt * 14; z.x += dt * z.dx; z.life -= dt; }
    bot.zz = bot.zz.filter((z) => z.life > 0);

    /* ara sıra kısa laf + emoji */
    bot.quipT -= dt;
    if (bot.quipT <= 0 && bot.mode === "follow") {
      const QUIPS = Engine.getMode() === "visitor"
        ? ["bip! hoş geldin 👋", "Maksut'u mu arıyorsun?", "binalara E ile gir!", "beni sürükleyebilirsin 🛸",
           "yağmuru severim bzzt", "🔎 ile aramayı dene!", "şu neon manzaraya bak", "ben rehberinim, korkma",
           "kaybolursan Ctrl+K", "1. binada Mihri'ye uğra 👋", "hangi konu? sor bana"]
        : ["bip bip, patron! 🤖", "emrin nedir patron?", "bugün hangi bina patron?", "patron, kahve molası? ☕",
           "patron sen bir efsanesin 😎", "kotayı ben hallederim, şaka 😏", "beni fırlat patron… ya da fırlatma",
           "jetpack'i özledim ✈️ patron", "patron, %74'teyiz, gaza bas!", "vidayı sıktım patron, hazırız 🔧",
           "patron bugün de yakışıklısın… yani ben", "Mihri'ye selam söyle patron 💛", "bir CTF daha patron?",
           "patron, Shodan'da kaldık, devam!", "bipbip… yani 'harika iş' patron", "sen çalış patron, ben izlerim 😴",
           "patron, deploy edelim mi? 🚀", "hata yok patron, ben kontrol ettim (etmedim)", "ustalaşınca +50 XP patron!",
           "patron molada mısın? ben de 🛸"];
      bot.quip = QUIPS[(Math.random() * QUIPS.length) | 0];
      bot.quipP = 3.4; bot.quipT = 10 + Math.random() * 9;
    }
    if (bot.quipP > 0) { bot.quipP -= dt; if (bot.quipP <= 0) bot.quip = null; }
  }
  function spring(tx, ty, dt, k, d) {
    bot.vx += (tx - bot.x) * k * dt * 10 - bot.vx * Math.min(1, d * dt);
    bot.vy += (ty - bot.y) * k * dt * 10 - bot.vy * Math.min(1, d * dt);
    bot.x += bot.vx * dt; bot.y += bot.vy * dt;
  }

  function draw(ctx) {
    if (!bot.inited) return;
    const v = Engine.getView(), T = v.T;
    const x = bot.x, y = bot.y;
    if (x - v.camX < -60 || x - v.camX > v.W + 60) return;
    const sleeping = bot.mode === "sleep";
    const dragging = bot.mode === "drag";
    const rollA = bot.rollP >= 0 ? (bot.rollP / 0.6) * Math.PI * 2 : 0;
    const tilt = Math.max(-0.4, Math.min(0.4, bot.vx * 0.0012));

    /* zemine yumuşak gölge */
    const shA = Math.max(0, 1 - (v.GROUND - y) / 300);
    ctx.fillStyle = `rgba(0,0,0,${0.25 * (0.4 + shA * 0.6)})`;
    ctx.beginPath(); ctx.ellipse(x, v.GROUND + 2, 14, 4.4, 0, 0, 7); ctx.fill();

    /* tarama ışını */
    if (bot.scanP >= 0 && !sleeping && !dragging) {
      const swing = Math.sin(bot.scanP * 2.4) * 30;
      const g = ctx.createLinearGradient(x, y + 10, x + swing, v.GROUND);
      g.addColorStop(0, hexA(ACC, 0.35)); g.addColorStop(1, hexA(ACC, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - 3, y + 10); ctx.lineTo(x + 3, y + 10);
      ctx.lineTo(x + swing + 16, v.GROUND); ctx.lineTo(x + swing - 16, v.GROUND); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = hexA(ACC, 0.5);
      ctx.beginPath(); ctx.ellipse(x + swing, v.GROUND, 16, 3.4, 0, 0, 7); ctx.stroke();
    }

    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt + rollA);

    /* pervaneler */
    const rSpd = dragging || bot.mode === "toss" ? 40 : sleeping ? 4 : 16;
    ctx.strokeStyle = hexA(EDGE, 0.55); ctx.lineWidth = 1.6; ctx.lineCap = "round";
    const rw = 8 * Math.abs(Math.sin(T * rSpd));
    ctx.beginPath(); ctx.moveTo(-8 - rw / 2, -15); ctx.lineTo(-8 + rw / 2, -15);
    ctx.moveTo(8 - rw / 2, -15); ctx.lineTo(8 + rw / 2, -15); ctx.stroke();
    ctx.strokeStyle = "#3a465e";
    ctx.beginPath(); ctx.moveTo(-8, -13); ctx.lineTo(-8, -10); ctx.moveTo(8, -13); ctx.lineTo(8, -10); ctx.stroke();

    /* gövde + kenar ışığı */
    Engine.glow(0, 0, 30, ACC, sleeping ? 0.15 : 0.4);
    ctx.fillStyle = BODY; rr(ctx, -13, -10, 26, 20, 7); ctx.fill();
    ctx.strokeStyle = hexA(EDGE, 0.8); ctx.lineWidth = 1.6; rr(ctx, -13, -10, 26, 20, 7); ctx.stroke();
    /* anten */
    ctx.strokeStyle = "#3a465e"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -16); ctx.stroke();
    ctx.fillStyle = hexA("#f472b6", 0.6 + Math.abs(Math.sin(T * 3)) * 0.4);
    ctx.beginPath(); ctx.arc(0, -17.4, 1.8, 0, 7); ctx.fill();

    /* mini kollar (sürüklenirken çırpınır) */
    const flail = dragging ? Math.sin(T * 26) * 4 : Math.sin(T * 2.2) * 1.4;
    ctx.strokeStyle = "#3a465e"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(-13, 2); ctx.lineTo(-18, 5 - flail); ctx.moveTo(13, 2); ctx.lineTo(18, 5 + flail); ctx.stroke();
    ctx.fillStyle = hexA(ACC, 0.8);
    ctx.beginPath(); ctx.arc(-18.6, 5 - flail, 1.6, 0, 7); ctx.arc(18.6, 5 + flail, 1.6, 0, 7); ctx.fill();

    /* TEK BÜYÜK GÖZ */
    const eyeR = 6.4;
    ctx.fillStyle = "#060a12"; ctx.beginPath(); ctx.arc(0, 0, eyeR + 2, 0, 7); ctx.fill();
    ctx.strokeStyle = hexA(EDGE, 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, eyeR + 2, 0, 7); ctx.stroke();
    if (sleeping || bot.blinkD > 0 || bot.mood === "squint") {
      ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-4.4, 0.4); ctx.lineTo(4.4, 0.4); ctx.stroke();
    } else {
      const p = Engine.getPlayerChar();
      const lx = Math.max(-2.4, Math.min(2.4, (p.wx - bot.x) * 0.02));
      Engine.glow(lx, 0, 9, ACC, 0.8);
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(lx, 0, 3.4, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.beginPath(); ctx.arc(lx + 1.1, -1.1, 1.1, 0, 7); ctx.fill();
    }
    ctx.restore();

    /* Zzz + laf balonu */
    ctx.font = "700 12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const z of bot.zz) {
      ctx.globalAlpha = Math.min(1, z.life);
      ctx.fillStyle = "#9db4d8"; ctx.fillText("z", z.x, z.y);
      ctx.globalAlpha = 1;
    }
    if (bot.quip) {
      ctx.font = "600 11.5px system-ui";
      const tw = ctx.measureText(bot.quip).width + 20;
      const bx = x, by = y - 36 + Math.sin(T * 2.4) * 2;
      ctx.globalAlpha = Math.min(1, bot.quipP);
      ctx.fillStyle = "rgba(8,12,26,.93)"; rr(ctx, bx - tw / 2, by - 12, tw, 24, 9); ctx.fill();
      ctx.strokeStyle = hexA(ACC, 0.55); ctx.lineWidth = 1.3; rr(ctx, bx - tw / 2, by - 12, tw, 24, 9); ctx.stroke();
      ctx.fillStyle = "#dff4ff"; ctx.fillText(bot.quip, bx, by + 0.5);
      ctx.globalAlpha = 1;
    }
  }

  window.Robot = { init, poke: wake, get: () => bot };
})();
