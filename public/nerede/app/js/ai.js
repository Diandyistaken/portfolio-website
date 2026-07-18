/* =========================================================================
 * MAKSUT AI — ziyaretçi modunda otonom gezinen "Maksut".
 * Saat-tohumlu DETERMİNİSTİK program: aynı saatte ana sayfadaki önizleme
 * ile oyun aynı bölgeyi gösterir (backend yok). Davranış döngüsü:
 *   walkTo(bina) → enter (kapı efekti + karakter gizlenir) → study (gerçek
 *   müfredat bilgisi) → exit → wander (aylak idle) → sonraki bina.
 * Durum API: MaksutAI.getStatus() → { islandId, name, phase, sentence }.
 * Üst pencereye postMessage ile bildirir (ana sayfa önizlemesi dinler).
 * ========================================================================= */
(function () {
  const { ISLANDS } = window.GAME_DATA;

  /* saat-tohumlu sıra: her ~7 dk'da bir bölge, gün içinde dolaşır */
  function seededOrder() {
    const order = ISLANDS.map((d, i) => ({ d, k: (hash(d.id) ^ 0x9e37) % 997 }));
    order.sort((a, b) => a.k - b.k);
    return order.map((o) => o.d);
  }
  const ORDER = seededOrder();
  const SLOT_MS = 7 * 60 * 1000;
  function currentIndex() {
    const now = Date.now();
    return Math.floor(now / SLOT_MS) % ORDER.length;
  }
  function targetIsland() { return ORDER[currentIndex()]; }

  const ai = {
    phase: "walk", // walk | enter | study | exit | wander
    tPhase: 0, island: null, wanderX: 0, ch: null, lastSlot: -1,
  };
  let inited = false;

  function init() {
    if (inited) return; inited = true;
    Engine.setMode("visitor");
    ai.ch = Engine.getAiChar();
    ai.island = targetIsland();
    ai.ch.wx = ai.island._wx - 260;
    ai.lastSlot = currentIndex();
    Engine.addHook("update", update);
    postStatus();
  }

  function update(dt) {
    const ch = ai.ch; if (!ch) return;
    ai.tPhase += dt;

    /* slot değiştiyse yeni hedefe yönel */
    const slot = currentIndex();
    if (slot !== ai.lastSlot && (ai.phase === "wander" || ai.phase === "walk")) {
      ai.lastSlot = slot; ai.island = ORDER[slot]; ai.phase = "walk"; ai.tPhase = 0; ch.hidden = false;
    }

    switch (ai.phase) {
      case "walk": {
        const doorX = ai.island._wx - 10;
        const dx = doorX - ch.wx;
        if (Math.abs(dx) > 14) { Engine.moveChar(ch, Math.sign(dx), 0, dt, true); }
        else { ai.phase = "enter"; ai.tPhase = 0; ch.moveT = 0; window.Sound && Sound.sfx("door"); postStatus(); }
        break;
      }
      case "enter": {
        ch.dir = 1;
        if (ai.tPhase > 0.5) { ch.hidden = true; ai.phase = "study"; ai.tPhase = 0; postStatus(); }
        break;
      }
      case "study": {
        // binada 20-40 sn "çalışır" (görünmez); ekranda durum şeridi gösterir
        if (ai.tPhase > 22 + (hash(ai.island.id) % 18)) { ch.hidden = false; ai.phase = "exit"; ai.tPhase = 0; ch.wx = ai.island._wx - 10; window.Sound && Sound.sfx("close"); postStatus(); }
        break;
      }
      case "exit": {
        ai.wanderX = ai.island._wx + (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 160);
        ai.phase = "wander"; ai.tPhase = 0; postStatus();
        break;
      }
      case "wander": {
        const dx = ai.wanderX - ch.wx;
        if (Math.abs(dx) > 10) Engine.moveChar(ch, Math.sign(dx), 0, dt, true);
        else {
          ch.moveT = 0;
          if (ai.tPhase > 4 + Math.random() * 5) { ai.wanderX = ch.wx + (Math.random() < 0.5 ? -1 : 1) * (100 + Math.random() * 180); ai.tPhase = 0; }
        }
        // emote artık motorun konuşma sistemi tarafından yönetilir (Mihri selamları)
        // bir sonraki slota kadar aylak gezer (slot değişimi yukarıda yakalanır)
        break;
      }
    }
  }

  function sentence() {
    const d = ai.island, n = d.learned ? d.learned.length : 0;
    switch (ai.phase) {
      case "walk": return `Maksut şu an "${d.name}" bölgesine yürüyor.`;
      case "enter": return `Maksut "${d.name}" binasına giriyor…`;
      case "study": {
        const topic = d.learned && d.learned.length ? d.learned[(Math.floor(Date.now() / 9000)) % d.learned.length] : null;
        return topic
          ? `Maksut şu an "${d.name}" içinde: "${topic}" konusunu tekrar ediyor (${n} konudan biri).`
          : `Maksut "${d.name}" bölgesinde çalışıyor (${n} konu).`;
      }
      case "exit": return `Maksut "${d.name}" binasından çıkıyor.`;
      default: return `Maksut "${d.name}" civarında dolaşıyor — sonraki durağı bekliyor.`;
    }
  }

  function getStatus() {
    return { islandId: ai.island ? ai.island.id : null, name: ai.island ? ai.island.name : "",
      phase: ai.phase, sentence: sentence(), icon: ai.island ? ai.island.icon : "🛰️", color: ai.island ? ai.island.color : "#22d3ee" };
  }
  let lastSent = "";
  function postStatus() {
    const s = getStatus();
    if (s.sentence === lastSent) return; lastSent = s.sentence;
    try { window.parent && window.parent.postMessage({ type: "maksut-status", status: s }, "*"); } catch (e) {}
    window.dispatchEvent(new CustomEvent("maksut-status", { detail: s }));
  }

  function pickEmote() { const e = ["💡", "☕", "🎧", "🛡️", "✨", "🤔"]; return e[(Math.random() * e.length) | 0]; }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function hash(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff; return h; }

  // durum cümlesi study fazında periyodik güncellensin (konu döner)
  setInterval(() => { if (inited && ai.phase === "study") postStatus(); }, 9000);

  window.MaksutAI = { init, getStatus, targetIsland, seededOrder };
})();
