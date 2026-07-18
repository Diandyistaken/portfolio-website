/* =========================================================================
 * NPC SİSTEMİ — her binanın önünde o temada bir kadın uzman + gezgin NPC'ler
 * Vektör stili motorla aynı dil; bol idle animasyon: saç salınımı, göz
 * kırpma, el sallama (oyuncu yaklaşınca), telefon, saç düzeltme, kahve,
 * aksesuara özgü mikro-animasyonlar (penguen, holo-laptop, fokurdayan tüp…).
 * E tuşu / tıklama → Dialog.openNpc(npc). Engine hook API'siyle bağlanır.
 * ========================================================================= */
(function () {
  const { ISLANDS } = window.GAME_DATA;

  /* ---- küçük yerel yardımcılar (motor iç yardımcıları dışa kapalı) ---- */
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
  function limb(g, x1, y1, x2, y2, c, w) {
    g.strokeStyle = c; g.lineWidth = w; g.lineCap = "round";
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---- temalı uzmanlar: çoğu kadın, aralarda birkaç erkek (m:true) ---- */
  const LOOKS = {
    setup:        { name: "Kosovalı Mihri",   hair: "long", acc: "tablet", skin: "#fdeee6", hairC: "#ffd21e", dye: false, glasses: true, blueEyes: true },
    linux:        { name: "Pengü Elif",       hair: "bob",  acc: "penguin" },
    networks:     { name: "Sinyal Sena",      hair: "long", acc: "tablet" },
    theory:       { name: "Bilge Nazlı",      hair: "bun",  acc: "book" },
    darkweb:      { name: "Gölge Derin",      hair: "long", acc: "cloak" },
    osint:        { name: "İzci Zeynep",      hair: "pony", acc: "magnifier" },
    wifi:         { name: "Anten Aslı",       hair: "bob",  acc: "antenna" },
    mitm:         { name: "Aracı Kerem",      hair: "quiff",acc: "twoPhones", m: true },
    crypto:       { name: "Şifreci Ece",      hair: "bun",  acc: "keyPendant" },
    exploitation: { name: "Surlu Kaya",       hair: "crop", acc: "armor",     m: true },
    backdoor:     { name: "Laborant Lale",    hair: "bun",  acc: "flask" },
    persistence:  { name: "Sabırlı Selin",    hair: "long", acc: "clock" },
    socialeng:    { name: "İknacı İpek",      hair: "curly",acc: "megaphone" },
    beef:         { name: "Tarayıcı Buse",    hair: "bob",  acc: "cowScarf" },
    shodan:       { name: "Gözcü Gamze",      hair: "pony", acc: "telescope" },
    webpentest:   { name: "Örümcek Melis",    hair: "long", acc: "webScarf" },
    sql:          { name: "Sorgu Sude",       hair: "bob",  acc: "dbBag" },
    tools:        { name: "Çantacı Cansu",    hair: "pony", acc: "vest" },
    ctf:          { name: "Bayraktar Bade",   hair: "long", acc: "flagCape" },
    aisec:        { name: "Andro-Ada",        hair: "bob",  acc: "android" },
  };
  const SKINS = ["#f0c49a", "#e2a878", "#c98a5e", "#8d5a3b", "#f4d3ae"];
  const HAIRC = ["#191722", "#2b1d12", "#3a2417", "#151a24", "#4a2c14"];

  const npcs = [], walkers = [];
  let inited = false;

  function init() {
    if (inited) return; inited = true;
    ISLANDS.forEach((d, i) => {
      const look = LOOKS[d.id] || { name: "Uzman", hair: "long", acc: "vest" };
      npcs.push({
        island: d, x: d._wx + (i % 2 === 0 ? 86 : -86), dir: i % 2 === 0 ? -1 : 1,
        name: look.name, hair: look.hair, acc: look.acc, m: !!look.m,
        skin: look.skin || SKINS[i % SKINS.length],
        hairC: look.hairC || (i % 3 === 0 ? d.color : HAIRC[i % HAIRC.length]),
        dye: look.dye != null ? look.dye : (i % 3 !== 0 && i % 2 === 0), // uçları bina renginde boyalı
        glasses: !!look.glasses, blueEyes: !!look.blueEyes,
        color: d.color, phase: (i * 1.7) % 6.28,
        blinkT: rnd(2, 5), blinkD: 0, act: "none", actT: rnd(4, 9), actP: 0,
        waveCd: 0,
      });
    });
    const view = Engine.getView();
    for (let i = 0; i < 7; i++) {
      const x = rnd(300, view.worldW - 300);
      walkers.push({
        x, tx: x + rnd(-400, 400), wait: 0, sp: rnd(36, 70), anim: rnd(0, 6),
        skin: SKINS[(i * 2) % SKINS.length], coat: ["#1a2233", "#26182e", "#14261f", "#2b1d22"][i % 4],
        umb: i % 2 === 0, umbC: ["#22d3ee", "#f472b6", "#a3e635", "#fb923c"][i % 4],
        fem: i % 2 === 1, dir: 1,
      });
    }
    Engine.addHook("update", update);
    Engine.addHook("worldBack", draw);
    Engine.addHook("action", onAction);
    Engine.addHook("pointer", onPointerHit);
  }

  function nearestNpc(wx, range) {
    let best = null, bd = range;
    for (const n of npcs) { const d = Math.abs(n.x - wx); if (d < bd) { bd = d; best = n; } }
    return best;
  }

  function onAction() {
    const p = Engine.getPlayerChar();
    const n = nearestNpc(p.wx, 70);
    if (n && window.Dialog) { Dialog.openNpc(n); return true; }
    return false;
  }
  function onPointerHit(pt) {
    const v = Engine.getView();
    const n = nearestNpc(pt.wx, 30);
    if (n && pt.wy > v.GROUND - 110 && pt.wy < v.GROUND + 10 && window.Dialog) { Dialog.openNpc(n); return true; }
    return false;
  }

  /* ---------------- update ---------------- */
  function update(dt) {
    const p = Engine.getPlayerChar();
    for (const n of npcs) {
      n.blinkT -= dt;
      if (n.blinkT <= 0) { n.blinkT = rnd(2.5, 6); n.blinkD = 0.13; }
      if (n.blinkD > 0) n.blinkD -= dt;
      n.waveCd -= dt;
      const near = Math.abs(p.wx - n.x) < 130;
      if (near) n.dir = p.wx > n.x ? 1 : -1; // oyuncuya dön
      if (n.act === "none") {
        if (near && n.waveCd <= 0) { n.act = "wave"; n.actP = 0; n.waveCd = 9; }
        else { n.actT -= dt; if (n.actT <= 0) { n.act = ["phone", "hairFix", "sip"][(Math.random() * 3) | 0]; n.actP = 0; } }
      } else {
        n.actP += dt;
        const dur = { wave: 1.7, phone: 4, hairFix: 1.6, sip: 2.2 }[n.act] || 2;
        if (n.actP >= dur) { n.act = "none"; n.actT = rnd(5, 10); }
      }
    }
    for (const w of walkers) {
      if (w.wait > 0) { w.wait -= dt; continue; }
      const d = w.tx - w.x;
      if (Math.abs(d) < 4) { w.wait = rnd(2, 6); w.tx = w.x + rnd(-500, 500); continue; }
      w.dir = Math.sign(d); w.x += w.dir * w.sp * dt; w.anim += dt * 9;
    }
  }

  /* ---------------- draw ---------------- */
  function draw(ctx) {
    const v = Engine.getView(), p = Engine.getPlayerChar();
    for (const w of walkers) {
      if (w.x - v.camX < -60 || w.x - v.camX > v.W + 60) continue;
      drawWalker(ctx, w, v);
    }
    for (const n of npcs) {
      if (n.x - v.camX < -80 || n.x - v.camX > v.W + 80) continue;
      drawWoman(ctx, n, v);
      if (Math.abs(p.wx - n.x) < 70) hint(ctx, n.x, v.GROUND - 96, n.color);
    }
  }
  function hint(ctx, x, y, color) {
    const b = Math.sin(Engine.getView().T * 3) * 2;
    ctx.fillStyle = "rgba(8,12,26,.9)"; rr(ctx, x - 21, y - 11 + b, 42, 20, 8); ctx.fill();
    ctx.strokeStyle = hexA(color, 0.6); ctx.lineWidth = 1.4; rr(ctx, x - 21, y - 11 + b, 42, 20, 8); ctx.stroke();
    ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#e8eefc"; ctx.fillText("💬 E", x, y + b);
  }

  /* ---- temalı kadın uzman ---- */
  function drawWoman(ctx, n, v) {
    const T = v.T, gy = v.GROUND, col = n.color, skin = n.skin;
    const sway = Math.sin(T * 1.5 + n.phase);
    const breathe = Math.sin(T * 1.9 + n.phase) * 0.7;
    /* gölge */
    ctx.fillStyle = "rgba(0,0,0,.32)";
    ctx.beginPath(); ctx.ellipse(n.x, gy + 3, 20, 6, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(n.x, gy - breathe); ctx.scale(n.dir, 1);

    if (n.acc === "cloak") drawCloakBack(ctx, col, T, n.phase);
    if (n.acc === "flagCape") drawCape(ctx, col, T);

    /* bacaklar + bot */
    limb(ctx, -3, -24, -4, 0, "#151a26", 5.5);
    limb(ctx, 3, -24, 4, 0, "#1a2030", 5.5);
    ctx.fillStyle = "#0e1320"; rr(ctx, -8, -4.6, 9.4, 5, 2); ctx.fill(); rr(ctx, 0.5, -4.6, 9.4, 5, 2); ctx.fill();
    ctx.fillStyle = hexA(col, 0.85); ctx.fillRect(-8, -1.4, 9.4, 1.4); ctx.fillRect(0.5, -1.4, 9.4, 1.4);

    /* etek/ceket gövde: koyu taban + tema rengi biye */
    const bg = ctx.createLinearGradient(0, -48, 0, -20);
    bg.addColorStop(0, "#1b2233"); bg.addColorStop(1, "#10141f");
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.moveTo(-9, -46); ctx.lineTo(9, -46); ctx.lineTo(11.5, -20); ctx.lineTo(-11.5, -20); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = hexA(col, 0.85); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-11.5, -20); ctx.lineTo(11.5, -20); ctx.stroke(); /* etek ucu neonu */
    ctx.strokeStyle = hexA(col, 0.5); ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(0, -22); ctx.stroke(); /* fermuar */
    ctx.fillStyle = hexA(col, 0.9); ctx.beginPath(); ctx.arc(-6, -42, 1.4, 0, 7); ctx.fill(); /* yaka rozeti */

    /* arka kol (aksesuar tutuşları drawAcc içinde önde çizilir) */
    limb(ctx, -4, -42, -7 - sway * 1.2, -28, "#161c2a", 4.6);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(-7 - sway * 1.2, -27, 2.2, 0, 7); ctx.fill();

    /* baş + yüz */
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(1, -55, 8.5, 0, 7); ctx.fill();
    /* saç (stil + salınım) */
    drawHair(ctx, n, sway);
    /* gözler + kirpik + dudak */
    if (n.blinkD > 0) {
      ctx.strokeStyle = "#5c4432"; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(3.4, -56); ctx.lineTo(6.2, -56); ctx.moveTo(-2.6, -56); ctx.lineTo(0.2, -56); ctx.stroke();
    } else if (n.blueEyes) {
      /* aşırı belli MAVİ gözler (ak + parlak mavi iris + bebek + parlama) */
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(5, -56, 2, 0, 7); ctx.arc(-1, -56, 1.9, 0, 7); ctx.fill();
      ctx.fillStyle = "#1e90ff"; ctx.beginPath(); ctx.arc(5.1, -56, 1.3, 0, 7); ctx.arc(-0.9, -56, 1.25, 0, 7); ctx.fill();
      ctx.fillStyle = "#0a1230"; ctx.beginPath(); ctx.arc(5.1, -56, 0.62, 0, 7); ctx.arc(-0.9, -56, 0.58, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(5.6, -56.5, 0.4, 0, 7); ctx.arc(-0.5, -56.5, 0.38, 0, 7); ctx.fill();
    } else {
      ctx.fillStyle = "#141a26";
      ctx.beginPath(); ctx.arc(5, -56, 1.25, 0, 7); ctx.arc(-1, -56, 1.25, 0, 7); ctx.fill();
      ctx.strokeStyle = "#141a26"; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(6, -57.6); ctx.lineTo(7.4, -58.2); ctx.moveTo(0, -57.6); ctx.lineTo(-1.4, -58.2); ctx.stroke();
    }
    if (n.m) {
      /* daha kalın kaş + jaw'da hafif sakal gölgesi + sade ağız (ruj yok) */
      ctx.strokeStyle = "#1c1109"; ctx.lineWidth = 1.7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(3.2, -58.3); ctx.lineTo(6.7, -58.7); ctx.moveTo(-2.4, -58.3); ctx.lineTo(0.7, -58.7); ctx.stroke();
      ctx.fillStyle = hexA(n.hairC, 0.42);
      ctx.beginPath(); ctx.arc(1, -52.4, 7.5, Math.PI * 0.12, Math.PI * 0.88); ctx.fill();
      ctx.strokeStyle = "rgba(70,48,42,.7)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(2.4, -50.6); ctx.lineTo(5.2, -50.7); ctx.stroke();
    } else {
      ctx.strokeStyle = "rgba(200,80,90,.75)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(2.2, -50.6); ctx.quadraticCurveTo(3.8, -49.9, 5.4, -50.7); ctx.stroke();
    }
    /* gözlük (Mihri) — gözlerin üstüne ince çerçeve */
    if (n.glasses) {
      ctx.strokeStyle = "rgba(20,30,45,.9)"; ctx.lineWidth = 1.2; ctx.lineCap = "round";
      rr(ctx, 2.5, -58.3, 5.2, 4.8, 1.8); ctx.stroke();
      rr(ctx, -3.9, -58.3, 5.2, 4.8, 1.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1.3, -55.9); ctx.lineTo(2.5, -55.9); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(6.6, -57.8); ctx.lineTo(5, -55.4); ctx.stroke();
    }
    if (n.acc === "android") drawAndroidFace(ctx, col, T);

    /* ön kol: aksiyona göre */
    frontArm(ctx, n, sway, skin, T);

    /* aksesuar (öndeki katman) */
    drawAcc(ctx, n, T, col, skin);

    ctx.restore();

    /* isim etiketi */
    ctx.font = "600 11.5px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(2,4,12,.75)";
    ctx.strokeText(n.name, n.x, gy - 78);
    ctx.fillStyle = hexA(n.color, 0.95); ctx.fillText(n.name, n.x, gy - 78);
  }

  function drawManHair(ctx, n) {
    const c = n.hairC;
    ctx.fillStyle = c;
    /* kısa kafa kalıbı */
    ctx.beginPath(); ctx.arc(1, -57, 8.4, Math.PI * 0.92, Math.PI * 2.16); ctx.fill();
    if (n.hair === "quiff") { /* yükseltilmiş ön tutam */
      ctx.beginPath(); ctx.moveTo(2, -62.6); ctx.quadraticCurveTo(8.8, -66.2, 9.4, -60.4);
      ctx.quadraticCurveTo(6.4, -62.2, 3.4, -61.6); ctx.closePath(); ctx.fill();
    } else { /* crop: kısa düz ön saç */
      ctx.beginPath(); ctx.moveTo(6.8, -60.6); ctx.quadraticCurveTo(9.2, -58.4, 7.7, -55.4);
      ctx.quadraticCurveTo(6.6, -58, 4.8, -59.6); ctx.closePath(); ctx.fill();
    }
    /* favoriler (ön + arka kulak) */
    ctx.fillRect(6.5, -58, 1.7, 5); ctx.fillRect(-8.2, -58, 1.8, 5);
  }

  function drawHair(ctx, n, sway) {
    if (n.m) { drawManHair(ctx, n); return; }
    const c = n.hairC, tip = n.dye ? n.color : c;
    ctx.fillStyle = c;
    if (n.hair === "long") {
      ctx.beginPath(); ctx.moveTo(-7.5, -60);
      ctx.quadraticCurveTo(-11 - sway * 1.6, -46, -9 - sway * 2.4, -30);
      ctx.lineTo(-4.5, -32); ctx.quadraticCurveTo(-7, -48, -5, -56); ctx.closePath(); ctx.fill();
      ctx.fillStyle = hexA(tip, 0.85);
      ctx.beginPath(); ctx.ellipse(-7 - sway * 2.4, -31, 3, 4.5, 0.3, 0, 7); ctx.fill();
      ctx.fillStyle = c;
    } else if (n.hair === "pony") {
      ctx.beginPath(); ctx.moveTo(-6, -60);
      ctx.quadraticCurveTo(-13 - sway * 2, -52, -11 - sway * 3, -38);
      ctx.quadraticCurveTo(-8, -40, -6.5, -50); ctx.closePath(); ctx.fill();
      ctx.fillStyle = hexA(tip, 0.9); ctx.beginPath(); ctx.arc(-10.4 - sway * 3, -38, 2.4, 0, 7); ctx.fill();
      ctx.fillStyle = c;
    } else if (n.hair === "bun") {
      ctx.beginPath(); ctx.arc(-4, -64.5, 4, 0, 7); ctx.fill();
      ctx.strokeStyle = hexA(tip, 0.9); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(-4, -64.5, 4.8, 0.4, 2.6); ctx.stroke();
    } else if (n.hair === "curly") {
      [[-6, -62, 3.6], [-2, -64.5, 3.8], [2.5, -64, 3.5], [6, -61.5, 3.2], [-8, -58, 3]].forEach(([hx, hy, hr]) => {
        ctx.beginPath(); ctx.arc(hx + sway * 0.4, hy, hr, 0, 7); ctx.fill();
      });
    }
    /* üst kafa + kâkül (tüm stiller) */
    ctx.beginPath(); ctx.arc(0.5, -59.5, 7.6, Math.PI * 0.95, Math.PI * 2.1); ctx.fill();
    ctx.beginPath(); ctx.moveTo(6.5, -60); ctx.quadraticCurveTo(8.6, -57, 7.4, -53.6);
    ctx.quadraticCurveTo(6.2, -56.5, 4.4, -58.8); ctx.closePath(); ctx.fill();
    if (n.hair === "bob") {
      ctx.beginPath(); ctx.moveTo(-7.4, -59);
      ctx.quadraticCurveTo(-9.6 - sway, -52, -7.6 - sway, -46);
      ctx.lineTo(-3.6, -48); ctx.quadraticCurveTo(-6, -54, -5, -58); ctx.closePath(); ctx.fill();
      ctx.fillStyle = hexA(n.dye ? n.color : n.hairC, 0.8);
      ctx.beginPath(); ctx.ellipse(-6.4 - sway, -46.6, 2.4, 2, 0.4, 0, 7); ctx.fill();
    }
  }

  function frontArm(ctx, n, sway, skin, T) {
    const a = n.act, p = n.actP;
    if (a === "wave") {
      const wig = Math.sin(p * 11) * 0.5;
      limb(ctx, 4, -42, 11, -56, "#1d2536", 4.6);
      limb(ctx, 11, -56, 13 + wig * 4, -64, "#1d2536", 4.2);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(13 + wig * 4, -65.5, 2.6, 0, 7); ctx.fill();
    } else if (a === "phone") {
      limb(ctx, 4, -42, 10, -35, "#1d2536", 4.6);
      limb(ctx, 10, -35, 9, -46, "#1d2536", 4.2);
      ctx.fillStyle = "#0d1220"; rr(ctx, 6.6, -53.6, 4.8, 8.4, 1.4); ctx.fill();
      ctx.fillStyle = hexA(n.color, 0.55 + Math.sin(T * 2.6) * 0.15); rr(ctx, 7.2, -52.8, 3.6, 6.8, 1); ctx.fill();
    } else if (a === "hairFix") {
      limb(ctx, 4, -42, 8, -52, "#1d2536", 4.6);
      limb(ctx, 8, -52, 4 + Math.sin(p * 6) * 1.5, -60, "#1d2536", 4.2);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(4 + Math.sin(p * 6) * 1.5, -61, 2.3, 0, 7); ctx.fill();
    } else if (a === "sip") {
      const up = Math.min(1, p * 2) * (p > 1.6 ? 0 : 1);
      limb(ctx, 4, -42, 9, -36 - up * 10, "#1d2536", 4.6);
      ctx.fillStyle = "#e8e2d6"; rr(ctx, 7.4, -42 - up * 10, 5, 6, 1.4); ctx.fill();
      ctx.fillStyle = hexA(n.color, 0.8); ctx.fillRect(7.4, -42 - up * 10, 5, 1.4);
      if (up > 0.6) { /* buhar */
        ctx.strokeStyle = "rgba(220,230,255,.35)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(9.5, -50 - up * 4); ctx.quadraticCurveTo(11, -54 - up * 4, 9.8, -57 - up * 4); ctx.stroke();
      }
    } else {
      limb(ctx, 4, -42, 7 + sway * 1.2, -28, "#1d2536", 4.6);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(7 + sway * 1.2, -27, 2.2, 0, 7); ctx.fill();
    }
  }

  /* ---- aksesuar ressamları (tema kimliği) ---- */
  function drawCloakBack(ctx, col, T, ph) {
    ctx.fillStyle = "rgba(10,8,20,.9)";
    ctx.beginPath(); ctx.moveTo(-8, -58);
    ctx.quadraticCurveTo(-16 - Math.sin(T + ph) * 2, -34, -12, -2);
    ctx.lineTo(8, -2); ctx.quadraticCurveTo(14, -34, 8, -58); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = hexA(col, 0.4); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-10, -10); ctx.quadraticCurveTo(0, -14, 10, -10); ctx.stroke();
  }
  function drawCape(ctx, col, T) {
    ctx.fillStyle = hexA(col, 0.8);
    ctx.beginPath(); ctx.moveTo(-6, -45);
    for (let i = 0; i <= 5; i++) ctx.lineTo(-8 - i * 2.4, -40 + i * 7 + Math.sin(T * 3 + i) * 2.2);
    ctx.lineTo(-6, -6); ctx.closePath(); ctx.fill();
  }
  function drawAndroidFace(ctx, col, T) {
    ctx.strokeStyle = hexA(col, 0.75); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(6.4, -52.4); ctx.lineTo(8, -51.4); ctx.lineTo(8, -49.6); ctx.stroke(); /* yanak devresi */
    ctx.beginPath(); ctx.moveTo(1, -63.4); ctx.lineTo(1, -68); ctx.stroke(); /* anten */
    ctx.fillStyle = hexA(col, 0.6 + Math.sin(T * 4) * 0.3); ctx.beginPath(); ctx.arc(1, -69, 1.5, 0, 7); ctx.fill();
  }
  function drawAcc(ctx, n, T, col, skin) {
    switch (n.acc) {
      case "penguin": { /* yerde sallanan mini penguen */
        ctx.save(); ctx.translate(15, -1); ctx.rotate(Math.sin(T * 2.6) * 0.12);
        ctx.fillStyle = "#12161f"; ctx.beginPath(); ctx.ellipse(0, -6.5, 5, 6.5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#e8ecf4"; ctx.beginPath(); ctx.ellipse(0.8, -5.4, 3, 4.6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.moveTo(3.4, -8.6); ctx.lineTo(6, -7.6); ctx.lineTo(3.4, -6.8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#12161f"; ctx.beginPath(); ctx.arc(2.4, -9.6, 0.9, 0, 7); ctx.fill();
        ctx.restore(); break;
      }
      case "toolbelt": case "vest": {
        ctx.fillStyle = "#3a2c17"; ctx.fillRect(-11, -23.4, 22, 3.4);
        ctx.fillStyle = hexA(col, 0.9); ctx.fillRect(-2, -23.8, 4, 4.2);
        ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-8, -21); ctx.lineTo(-8, -15.5); ctx.stroke(); /* sarkan anahtar */
        break;
      }
      case "tablet": {
        ctx.save(); ctx.translate(12, -34); ctx.rotate(-0.2);
        ctx.fillStyle = "#0c1322"; rr(ctx, -4.6, -6.4, 9.2, 12.8, 1.6); ctx.fill();
        ctx.strokeStyle = hexA(col, 0.85); ctx.lineWidth = 1; rr(ctx, -4.6, -6.4, 9.2, 12.8, 1.6); ctx.stroke();
        ctx.fillStyle = hexA(col, 0.8); /* topoloji noktaları */
        [[-2, -3], [2, -1], [-1, 2], [2.4, 3.6]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 1, 0, 7); ctx.fill(); });
        ctx.strokeStyle = hexA(col, 0.45);
        ctx.beginPath(); ctx.moveTo(-2, -3); ctx.lineTo(2, -1); ctx.lineTo(-1, 2); ctx.lineTo(2.4, 3.6); ctx.stroke();
        ctx.restore(); break;
      }
      case "book": {
        ctx.save(); ctx.translate(11, -32);
        ctx.fillStyle = "#e8dfc8"; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(0, -3.4, 6, 0); ctx.lineTo(6, 4); ctx.quadraticCurveTo(0, 1, -6, 4); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = hexA(col, 0.8); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -2.4); ctx.lineTo(0, 2); ctx.stroke();
        ctx.restore(); break;
      }
      case "magnifier": {
        ctx.save(); ctx.translate(13, -30); ctx.rotate(Math.sin(T * 1.8) * 0.15 + 0.5);
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, -4, 4.4, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(3, -1); ctx.lineTo(6.4, 3.4); ctx.stroke();
        ctx.fillStyle = hexA(col, 0.25); ctx.beginPath(); ctx.arc(0, -4, 4.4, 0, 7); ctx.fill();
        ctx.restore(); break;
      }
      case "antenna": {
        ctx.fillStyle = "#20283a"; rr(ctx, -14.5, -44, 6, 16, 2.4); ctx.fill(); /* sırt çantası */
        ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-11.5, -44); ctx.lineTo(-11.5, -56); ctx.stroke();
        ctx.strokeStyle = hexA(col, 0.4 + Math.abs(Math.sin(T * 3)) * 0.4); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(-11.5, -57, 3.4 + (T * 14 % 8), Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        break;
      }
      case "twoPhones": { /* arka elde ikinci telefon */
        ctx.fillStyle = "#0d1220"; rr(ctx, -10.4, -32, 4.4, 7.6, 1.2); ctx.fill();
        ctx.fillStyle = hexA("#f472b6", 0.5 + Math.sin(T * 3.2) * 0.2); rr(ctx, -9.8, -31.2, 3.2, 6, 0.8); ctx.fill();
        break;
      }
      case "keyPendant": {
        ctx.strokeStyle = hexA(col, 0.9); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-2, -46); ctx.lineTo(4, -46); ctx.stroke(); /* kolye ipi */
        ctx.save(); ctx.translate(1, -43.6); ctx.rotate(Math.sin(T * 2) * 0.15);
        ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 1.8); ctx.lineTo(0, 4.6); ctx.moveTo(0, 3.4); ctx.lineTo(1.4, 3.4); ctx.stroke();
        ctx.restore(); break;
      }
      case "armor": {
        ctx.fillStyle = "#2a3350"; ctx.beginPath(); ctx.ellipse(-7, -44.5, 4.6, 3, -0.3, 0, 7); ctx.fill();
        ctx.fillStyle = "#2a3350"; ctx.beginPath(); ctx.ellipse(7, -44.5, 4.6, 3, 0.3, 0, 7); ctx.fill();
        ctx.strokeStyle = hexA(col, 0.8); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(-7, -44.5, 4.6, 3, -0.3, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(7, -44.5, 4.6, 3, 0.3, 0, 7); ctx.stroke();
        break;
      }
      case "flask": {
        ctx.save(); ctx.translate(12, -28);
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-1.6, -6); ctx.lineTo(-1.6, -2); ctx.lineTo(-3.6, 3); ctx.lineTo(3.6, 3); ctx.lineTo(1.6, -2); ctx.lineTo(1.6, -6); ctx.stroke();
        ctx.fillStyle = hexA(col, 0.55);
        ctx.beginPath(); ctx.moveTo(-2.8, 1); ctx.lineTo(2.8, 1); ctx.lineTo(3.6, 3); ctx.lineTo(-3.6, 3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = hexA(col, 0.9);
        ctx.beginPath(); ctx.arc(Math.sin(T * 3) * 0.8, 0.4 - (T * 6 % 4), 0.7, 0, 7); ctx.fill(); /* baloncuk */
        ctx.restore(); break;
      }
      case "clock": {
        ctx.save(); ctx.translate(1, -44); ctx.rotate(Math.sin(T * 1.6) * 0.2);
        ctx.strokeStyle = "#d9c58a"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, 2.4); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 4.6, 2.4, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 4.6); ctx.lineTo(0, 3.2); ctx.moveTo(0, 4.6); ctx.lineTo(1.3, 4.6); ctx.stroke();
        ctx.restore(); break;
      }
      case "megaphone": {
        ctx.save(); ctx.translate(-11, -33); ctx.rotate(-0.5);
        ctx.fillStyle = "#20283a"; ctx.beginPath(); ctx.moveTo(0, -1.6); ctx.lineTo(7, -4.6); ctx.lineTo(7, 4.6); ctx.lineTo(0, 1.6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = hexA(col, 0.7); ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = hexA(col, 0.3 + Math.abs(Math.sin(T * 4)) * 0.4);
        ctx.beginPath(); ctx.arc(8.4, 0, 2.6 + (T * 10 % 5), -0.7, 0.7); ctx.stroke();
        ctx.restore(); break;
      }
      case "cowScarf": {
        ctx.fillStyle = "#e8ecf4";
        ctx.beginPath(); ctx.ellipse(1, -46.4, 7.4, 2.6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#12161f";
        [[-3, -46.8, 1.6], [2, -45.8, 1.3], [5.4, -46.9, 1.1]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, 7); ctx.fill(); });
        break;
      }
      case "telescope": { /* yanında tripodlu dürbün */
        ctx.save(); ctx.translate(16, 0);
        ctx.strokeStyle = "#3a465e"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-4, 0); ctx.moveTo(0, -12); ctx.lineTo(4, 0); ctx.moveTo(0, -12); ctx.lineTo(0, 0); ctx.stroke();
        ctx.save(); ctx.translate(0, -13); ctx.rotate(-0.5 + Math.sin(T * 0.7) * 0.1);
        ctx.fillStyle = "#26304a"; rr(ctx, -1.8, -1.8, 10, 3.6, 1.6); ctx.fill();
        ctx.fillStyle = hexA(col, 0.9); ctx.fillRect(7.4, -1.8, 1.2, 3.6);
        ctx.restore(); ctx.restore(); break;
      }
      case "webScarf": {
        ctx.strokeStyle = "rgba(220,230,250,.65)"; ctx.lineWidth = 0.9;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(1, -46, 2 + i * 2.2, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(-5.5, -44.5); ctx.lineTo(1, -40); ctx.moveTo(7.5, -44.5); ctx.lineTo(1, -40); ctx.stroke();
        break;
      }
      case "dbBag": { /* disk-silindir el çantası */
        ctx.save(); ctx.translate(-12.4, -18);
        ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, -6.4, 3, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = "#1b2438"; rr(ctx, -3.8, -6.4, 7.6, 9, 3); ctx.fill();
        ctx.strokeStyle = hexA(col, 0.8);
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, -4.4 + i * 3, 3.8, 1.2, 0, 0, 7); ctx.stroke(); }
        ctx.restore(); break;
      }
      case "flagCape": {
        ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(12, -2); ctx.lineTo(12, -34); ctx.stroke();
        ctx.fillStyle = hexA(col, 0.95);
        ctx.beginPath(); ctx.moveTo(12, -34);
        for (let i = 0; i <= 4; i++) ctx.lineTo(12 + i * 3.4, -34 + Math.sin(T * 4 + i) * 1.6 + (i === 4 ? 2.4 : 0));
        for (let i = 4; i >= 0; i--) ctx.lineTo(12 + i * 3.4, -27 + Math.sin(T * 4 + i) * 1.6);
        ctx.closePath(); ctx.fill();
        break;
      }
      case "android": break; /* yüz üzerinde çizildi */
      case "cloak": { /* kapüşon başa */
        ctx.fillStyle = "rgba(12,10,24,.92)";
        ctx.beginPath(); ctx.arc(0.5, -56, 10, Math.PI * 0.75, Math.PI * 2.25); ctx.fill();
        ctx.fillStyle = hexA(col, 0.75);
        ctx.beginPath(); ctx.arc(4.5, -56, 1.2, 0, 7); ctx.arc(-2, -56, 1.2, 0, 7); ctx.fill(); /* parlayan gözler */
        break;
      }
    }
  }

  /* ---- gezgin NPC (bazıları neon şemsiyeli) ---- */
  function drawWalker(ctx, w, v) {
    const T = v.T, gy = v.GROUND;
    const stepA = Math.sin(w.anim), moving = w.wait <= 0;
    const bob = moving ? Math.abs(stepA) * 1.8 : Math.sin(T * 1.9 + w.x) * 0.7;
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.beginPath(); ctx.ellipse(w.x, gy + 3, 16, 5, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(w.x, gy - bob); ctx.scale(w.dir, 1);
    /* bacaklar */
    limb(ctx, -2, -22, (moving ? stepA * 8 : -3), 0, "#131926", 4.6);
    limb(ctx, 2, -22, (moving ? -stepA * 8 : 3), 0, "#0f141f", 4.6);
    /* palto gövde */
    const cg = ctx.createLinearGradient(0, -44, 0, -18);
    cg.addColorStop(0, w.coat); cg.addColorStop(1, "#0b0f1a");
    ctx.fillStyle = cg; rr(ctx, -8.4, -44, 16.8, 24, 6); ctx.fill();
    /* baş */
    ctx.fillStyle = w.skin; ctx.beginPath(); ctx.arc(0.5, -50.5, 6.6, 0, 7); ctx.fill();
    ctx.fillStyle = "#151a24";
    if (w.fem) { /* uzun saç silueti */
      ctx.beginPath(); ctx.moveTo(-6, -54); ctx.quadraticCurveTo(-9, -42, -7, -34); ctx.lineTo(-3, -37);
      ctx.quadraticCurveTo(-5.4, -46, -4, -53); ctx.closePath(); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0.5, -53.5, 6.2, Math.PI * 0.95, Math.PI * 2.08); ctx.fill();
    if (w.umb) { /* neon şemsiye */
      limb(ctx, 6, -34, 10, -58, "#3a465e", 1.8);
      ctx.fillStyle = hexA(w.umbC, 0.85);
      ctx.beginPath(); ctx.arc(10, -58, 15, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = hexA(w.umbC, 0.5); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-5, -58); ctx.lineTo(25, -58); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.18)";
      ctx.beginPath(); ctx.arc(6, -60.5, 6.4, Math.PI * 1.1, Math.PI * 1.7); ctx.fill();
    } else { /* telefon ışığı yüzde */
      ctx.fillStyle = "#0d1220"; rr(ctx, 6.4, -38, 4, 7, 1.2); ctx.fill();
      ctx.fillStyle = hexA(w.umbC, 0.5); rr(ctx, 7, -37.2, 2.8, 5.4, 0.8); ctx.fill();
      limb(ctx, 3, -38, 7, -35, w.coat, 4);
    }
    ctx.restore();
  }

  window.NPC = { init, nearest: nearestNpc, list: () => npcs };
})();
