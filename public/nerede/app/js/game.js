/* =========================================================================
 * OYUN MANTIĞI — DOM arayüz, kayıt/yükleme, motor ile bağlama.
 * ========================================================================= */
(function () {
  const { META, ISLANDS, REFERENCES, CERT_PATHS, RANKS } = window.GAME_DATA;
  const LINKS = window.GAME_LINKS || { resolveResourceURL: () => "#", LEARN_HUB: [] };
  const KEY = "maksut_siber_v1";
  const sfx = (n) => window.Sound && Sound.sfx(n);

  /* ---- durum ---- */
  let state = load();
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) return { mastered: [], visited: [], xp: 0, streak: 0, lastPlay: "", ...s }; } catch (e) {}
    return { mastered: [], visited: [], xp: 0, streak: 0, lastPlay: "" };
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  const masteredSet = () => new Set(state.mastered);

  /* ---- günlük seri (retention) ---- */
  const todayStr = () => new Date().toISOString().slice(0, 10);
  function touchStreak() {
    const t = todayStr();
    if (state.lastPlay === t) return;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    state.streak = state.lastPlay === y ? (state.streak || 0) + 1 : 1;
    state.lastPlay = t; save();
  }
  function nextRankInfo(n) {
    let cur = RANKS[0], next = null;
    for (const x of RANKS) { if (n >= x.min) cur = x; else { next = x; break; } }
    if (!next) return { cur, next: null, pct: 100, need: 0 };
    const span = next.min - cur.min || 1;
    return { cur, next, pct: Math.round(((n - cur.min) / span) * 100), need: next.min - n };
  }

  /* ========================= UDEMY MÜFREDAT İLERLEMESİ ========================= */
  const CURR = window.CURRICULUM || { sections: [], watchedUpTo: 0, source: "" };
  const CURR_KEY = "maksut_curriculum_v1";
  const CURR_FLAT = [];   // {g,title,min,secIdx,bld}
  const CURR_SEC = [];    // {si,t,bld,start,end,count}
  (function buildCurr() {
    let g = 0;
    CURR.sections.forEach((s, si) => {
      const start = g + 1;
      s.items.forEach(([title, min]) => { g++; CURR_FLAT.push({ g, title, min, secIdx: si, bld: s.bld }); });
      CURR_SEC.push({ si, t: s.t, bld: s.bld, start, end: g, count: s.items.length });
    });
  })();
  const CURR_TOTAL_MIN = CURR_FLAT.reduce((a, x) => a + x.min, 0);

  let curr = loadCurr();
  function loadCurr() {
    try { const s = JSON.parse(localStorage.getItem(CURR_KEY)); if (s && Array.isArray(s.watched)) return s; } catch (e) {}
    const watched = [];
    for (let i = 1; i <= (CURR.watchedUpTo || 0); i++) watched.push(i);
    return { watched };
  }
  function saveCurr() { try { localStorage.setItem(CURR_KEY, JSON.stringify(curr)); } catch (e) {} }
  const currSet = () => new Set(curr.watched);
  function currStats(set) {
    set = set || currSet();
    let wmin = 0, wcount = 0;
    for (const l of CURR_FLAT) if (set.has(l.g)) { wmin += l.min; wcount++; }
    return {
      wcount, total: CURR_FLAT.length, wmin, totalMin: CURR_TOTAL_MIN,
      pct: CURR_TOTAL_MIN ? Math.round((wmin / CURR_TOTAL_MIN) * 100) : 0,
      pctCount: CURR_FLAT.length ? Math.round((wcount / CURR_FLAT.length) * 100) : 0,
    };
  }
  function currForBuilding(id, set) {
    set = set || currSet();
    const list = CURR_FLAT.filter((l) => l.bld === id);
    const done = list.filter((l) => set.has(l.g)).length;
    return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
  }
  function currSecStats(sec, set) {
    set = set || currSet();
    let done = 0; for (let g = sec.start; g <= sec.end; g++) if (set.has(g)) done++;
    return { done, total: sec.count, pct: sec.count ? Math.round((done / sec.count) * 100) : 0 };
  }

  /* ---- kısayollar ---- */
  const $ = (s) => document.querySelector(s);
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---- hesaplar ---- */
  function rankOf(n) { let r = RANKS[0]; for (const x of RANKS) if (n >= x.min) r = x; return r; }
  function trackProgress(kinds) {
    const set = masteredSet();
    const list = ISLANDS.filter((i) => kinds.includes(i.track));
    const done = list.filter((i) => set.has(i.id)).length;
    return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
  }

  /* ========================= HUD ========================= */
  function renderHUD() {
    const n = state.mastered.length, rk = rankOf(n);
    const overall = Math.round((n / ISLANDS.length) * 100);
    const red = trackProgress(["red", "both", "foundation"]);
    const blue = trackProgress(["blue", "both", "foundation"]);
    const xp = state.xp || 0, ri = nextRankInfo(n);
    const streak = state.streak || 0;
    const cs = currStats();
    const nextTxt = ri.next ? `sonraki: ${ri.next.icon} ${ri.next.title} · ${ri.need} ada` : "en yüksek rütbe 🐉";
    $("#hud").innerHTML = `
      <div class="rankbox">
        <div class="ico" title="${esc(rk.title)}">${rk.icon}</div>
        <div class="rk-info">
          <div class="t">Rütbe${streak > 1 ? ` · <span class="streak" title="Günlük seri">🔥 ${streak} gün</span>` : ""}</div>
          <div class="v">${rk.title}</div>
          <div class="xp-row">
            <span class="xp-val" title="Toplam deneyim puanı">⚡ ${xp} XP</span>
            <div class="xp-bar" title="${esc(nextTxt)}"><i style="width:${ri.pct}%"></i></div>
          </div>
          <div class="xp-next">${nextTxt}</div>
        </div>
      </div>
      <div class="meters">
        <div class="meter"><span class="lbl">🎯 Genel</span>
          <div class="bar all"><i style="width:${overall}%"></i></div><span class="pct">${overall}%</span></div>
        <div class="meter"><span class="lbl">🔴 Red</span>
          <div class="bar red"><i style="width:${red.pct}%"></i></div><span class="pct">${red.pct}%</span></div>
        <div class="meter"><span class="lbl">🔵 Blue</span>
          <div class="bar blue"><i style="width:${blue.pct}%"></i></div><span class="pct">${blue.pct}%</span></div>
        <button class="meter meter-btn" data-act="curriculum" title="Udemy müfredat ilerlemem — tıkla, dersleri işaretle">
          <span class="lbl">📚 Kurs</span>
          <div class="bar curr"><i style="width:${cs.pct}%"></i></div><span class="pct">${cs.pct}%</span></button>
      </div>
      <div class="hud-btns">
        <button class="hbtn hbtn-search" data-act="search" title="Ara (Ctrl+K) — konu, araç, sertifika"><span class="e">🔎</span><span class="txt">Ara</span></button>
        <button class="hbtn" data-act="refs"><span class="e">📖</span><span class="txt">Referanslar</span></button>
        <button class="hbtn" data-act="learn"><span class="e">🌐</span><span class="txt">Öğren</span></button>
        <button class="hbtn" data-act="cert"><span class="e">🎓</span><span class="txt">Kariyer</span></button>
        <button class="hbtn" data-act="staj"><span class="e">📄</span><span class="txt">Staj</span></button>
        <button class="hbtn" data-act="settings"><span class="e">⚙️</span><span class="txt">Ayarlar</span></button>
        <button class="hbtn" data-act="mute" title="Sesi aç/kapat"><span class="e">${window.Sound && Sound.isMuted() ? "🔇" : "🔊"}</span></button>
        <button class="hbtn" data-act="help"><span class="e">❓</span></button>
      </div>`;
    const acts = { search: openSearch, refs: openRefs, learn: openLearnHub, cert: openCert, staj: openStaj, settings: openSettings, help: openHelp, mute: toggleMute, curriculum: openCurriculum };
    $("#hud").querySelectorAll(".hbtn, .meter-btn").forEach((b) => {
      b.onmouseenter = () => sfx("hover");
      b.onclick = () => { sfx("click"); acts[b.dataset.act](); };
    });
  }
  function toggleMute() {
    if (!window.Sound) return;
    Sound.setMuted(!Sound.isMuted());
    renderHUD();
  }

  /* ========================= ADA PANELİ ========================= */
  const overlay = $("#overlay");
  let lastFocus = null; // dialog kapanınca odağı geri ver (erişilebilirlik)

  /* sol kanat: bina içi CSS sahnesi + hızlı istatistikler */
  function leftWing(is) {
    const set = masteredSet();
    const learnedN = is.learned ? is.learned.length : 0;
    const totalLearned = ISLANDS.reduce((a, x) => a + (x.learned ? x.learned.length : 0), 0);
    const probN = (is.problems || []).length, cmdN = (is.commands || []).length;
    const cb = currForBuilding(is.id);
    const short = (is.name || "").split(" ")[0].toUpperCase();
    return `
      <div class="bwing-card" style="color:${is.color}">
        <h4>🏢 Bina İçi</h4>
        <div class="room">
          <div class="rm-sign">${esc(short)}</div>
          <span class="rm-win" style="left:22%"></span>
          <span class="rm-win" style="left:50%"></span>
          <span class="rm-win" style="left:74%"></span>
          <div class="rm-mon l"></div><div class="rm-mon r"></div>
          <div class="rm-desk"></div>
          <div class="rm-char">${is.icon}</div>
          <div class="rm-floor"></div>
        </div>
      </div>
      <div class="bwing-card">
        <h4>📊 Bu Bölge</h4>
        <div class="bstat"><span class="k">Öğrenilen konu</span><span class="v" style="color:${is.color}">${learnedN}</span></div>
        <div class="bstat"><span class="k">Sorun kartı</span><span class="v">${probN}</span></div>
        <div class="bstat"><span class="k">Komut</span><span class="v">${cmdN}</span></div>
        <div class="bstat"><span class="k">Durum</span><span class="v">${set.has(is.id) ? "🏆 Usta" : "📚 Devam"}</span></div>
        ${cb.total ? `<div class="bstat"><span class="k">📺 İzlenen ders</span><span class="v" style="color:${cb.pct === 100 ? "var(--green)" : is.color}">${cb.done}/${cb.total} · ${cb.pct}%</span></div>` : ""}
        <div class="bstat"><span class="k">Şehir toplamı</span><span class="v">${totalLearned}</span></div>
      </div>`;
  }

  /* sağ kanat: kaynak kartları + sık komutlar mini terminali.
     İkonlar CSP-güvenli emoji (dış favicon isteği yok → offline + iframe uyumlu). */
  function resIcon(name, url) {
    const s = (name + " " + url).toLowerCase();
    const map = [
      ["tryhackme", "🎯"], ["hackthebox", "📦"], ["htb", "📦"], ["portswigger", "🕷️"], ["owasp", "🛡️"],
      ["hacktricks", "📚"], ["mitre", "🎛️"], ["att&ck", "🎛️"], ["kali", "🐉"], ["linux", "🐧"], ["gtfobins", "🐧"],
      ["wireshark", "🦈"], ["shodan", "🛰️"], ["nmap", "📡"], ["metasploit", "💥"], ["sqlmap", "💉"], ["sql", "💉"],
      ["hashcat", "🔓"], ["crackstation", "🔓"], ["john", "🔓"], ["dns", "🌐"], ["cloudflare", "☁️"], ["tor", "🧅"],
      ["osint", "🔎"], ["bellingcat", "🔎"], ["aircrack", "📶"], ["wifi", "📶"], ["burp", "🕷️"], ["ctf", "🚩"],
      ["github", "🐙"], ["sans", "🎓"], ["blue team", "🔵"], ["bettercap", "🎭"], ["beef", "🐮"],
    ];
    for (const [k, e] of map) if (s.includes(k)) return e;
    return "🔗";
  }
  function rightWing(is) {
    const res = (is.resources || []).slice(0, 6).map((t) => {
      const u = LINKS.resolveResourceURL(t.n);
      const icon = resIcon(t.n, u);
      return `<a class="reslink" href="${esc(u)}" target="_blank" rel="noopener noreferrer">
        <span class="rl-ic">${icon}</span>
        <span class="rl-tx"><b>${esc(t.n)}</b><span>${esc(t.d || "kaynak")}</span></span></a>`;
    }).join("");
    const cmds = (is.commands || []).slice(0, 5).map((c) => `<div class="mt-line">${esc(c.c)}</div>`).join("")
      || `<div class="mt-line">whoami</div><div class="mt-line">help</div>`;
    return `
      <div class="bwing-card">
        <h4>🔗 Kaynaklar</h4>
        ${res || '<div class="bstat"><span class="k">Bu bölge için kaynak yakında</span></div>'}
        <button class="reslink more" data-hub="1" style="width:100%;cursor:pointer;text-align:left">
          <span class="rl-ic">🌐</span><span class="rl-tx"><b>Öğrenme Merkezi</b><span>tüm platformlar tek yerde</span></span></button>
      </div>
      <div class="bwing-card">
        <h4>💻 Sık Komutlar</h4>
        <div class="cmd-warn">⚠️ Tüm komutlar yalnızca <b>yazılı izinli</b> sistemlerde veya kendi laboratuvarında çalıştırılır.</div>
        <div class="miniterm">${cmds}</div>
      </div>`;
  }

  /* ---- bina içi ortam: her bina için atmosferik arka plan sahnesi ----
     Arketip + binanın rengi ile "farklı bir ortama girdim" hissi. Panel bu
     sahnenin üstünde durur; sahne binanın kendi rengiyle boyanır. */
  const INTERIOR_ARCH = {
    setup: "lab", crypto: "lab", aisec: "lab", dfir: "lab",
    linux: "terminal", exploitation: "terminal", ctf: "terminal", tools: "terminal",
    sql: "terminal", webpentest: "terminal", webaccess: "terminal",
    networks: "network", theory: "network", shodan: "network", cloud: "network", mitm: "network",
    wifi: "wifi", darkweb: "vault",
    activedirectory: "server", soc: "server", persistence: "server", backdoor: "server",
    osint: "osint", socialeng: "osint", beef: "osint",
  };
  const interiorArch = (is) => INTERIOR_ARCH[is.id] || "terminal";
  function interiorSceneHTML(arch) {
    const rep = (cls, n) => Array.from({ length: n }, () => `<span class="${cls}"></span>`).join("");
    const scenes = {
      server: `<div class="iv-racks">${rep("iv-rack", 7)}</div>`,
      terminal: `<div class="iv-screen">${rep("iv-codeln", 6)}</div><div class="iv-desk"></div>`,
      lab: `<div class="iv-shelf a"></div><div class="iv-shelf b"></div><div class="iv-core"></div><div class="iv-bench"></div>`,
      network: `<div class="iv-globe"></div>${rep("iv-node", 6)}<div class="iv-ring"></div><div class="iv-ring two"></div>`,
      wifi: `<div class="iv-wave"></div><div class="iv-wave two"></div><div class="iv-wave three"></div><div class="iv-tower"></div>`,
      osint: `<div class="iv-wall">${rep("iv-mon", 12)}</div>`,
      vault: `<div class="iv-ring v"></div><div class="iv-ring v two"></div><div class="iv-ring v three"></div><div class="iv-lock">🧅</div>`,
    };
    // ortak oda katmanları: arka duvar + zemin + ızgara + hero prop + zemin ışığı + sıcak lamba + ön plan
    return `<div class="iv-wall-bg"></div><div class="iv-grid"></div>` +
      (scenes[arch] || scenes.terminal) +
      `<div class="iv-floor"></div><div class="iv-floorglow"></div>` +
      `<div class="iv-lamp a"></div><div class="iv-fg l"></div><div class="iv-fg r"></div>`;
  }

  function openIsland(is) {
    Engine.pause();
    sfx("open");
    if (!state.visited.includes(is.id)) { state.visited.push(is.id); addXP(10); sfx("xp"); save(); floatXP("+10 XP", is.color); renderHUD(); }
    const set = masteredSet(), done = set.has(is.id);
    const sec = (title, inner) => inner ? `<div class="sec"><h3>${title}</h3>${inner}</div>` : "";
    const chips = (arr, up) => arr.map((t) => `<span class="chip ${up ? "up" : ""}">${up ? "" : "✓ "}${esc(t)}</span>`).join("");
    const concepts = (is.concepts || []).map((c) =>
      `<div class="concept"><div class="ch">💡 ${esc(c.h)}</div><div class="cb">${esc(c.body)}</div></div>`).join("");
    const workflow = (is.workflow || []).length
      ? `<div class="flow">${is.workflow.map((s, i) => `<div class="fstep"><span class="fn">${i + 1}</span><span>${esc(s)}</span></div>`).join("")}</div>` : "";
    const probs = is.problems.map((pr, i) => `
      <div class="pcard" data-i="${i}">
        <div class="q"><span class="warn">⚠️</span><span>${esc(pr.p)}</span><span class="arrow">▶</span></div>
        <div class="ans"><div class="ans-in">
          ${pr.look.map((s, j) => `<div class="step"><span class="n">${j + 1}</span><span>${esc(s)}</span></div>`).join("")}
          <div class="toolrow">${pr.tools.map((t) => `<span class="tool">${esc(t)}</span>`).join("")}</div>
        </div></div>
      </div>`).join("");
    const defense = (is.defense || []).length
      ? `<ul class="deflist">${is.defense.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` : "";
    const commands = (is.commands || []).length
      ? `<div class="cmdlist">${is.commands.map((c) => `<div class="cmd"><code>${esc(c.c)}</code><span>${esc(c.d)}</span></div>`).join("")}</div>` : "";
    const glossary = (arr) => `<div class="tdefs">${arr.map((t) => `<div class="tdef"><b>${esc(t.n)}</b><span>${esc(t.d)}</span></div>`).join("")}</div>`;
    const resLinks = (arr) => `<div class="reslinks">${arr.map((t) => {
      const u = LINKS.resolveResourceURL(t.n);
      return `<a class="reslink" href="${esc(u)}" target="_blank" rel="noopener noreferrer">
        <span class="rn">🔗 ${esc(t.n)}</span><span class="rd">${esc(t.d)}</span><span class="rgo">↗</span></a>`;
    }).join("")}<button class="reslink more" data-hub="1"><span class="rn">🌐 Öğrenme Merkezi</span>
      <span class="rd">Tüm platformlar, laboratuvarlar ve referanslar tek yerde</span><span class="rgo">›</span></button></div>`;

    const isVisitor = window.Engine && Engine.getMode && Engine.getMode() === "visitor";

    /* İçerik artık dikey uzun bir sayfa değil; ekrana sığan sekmelere bölündü.
       Boş bölümler sekme üretmez. Kanatlar (Bina/Kaynaklar) geniş ekranda yan
       sütun olarak durur, dar ekranda kendi sekmelerine düşer (.tab-wing). */
    const tabs = [];
    const addTab = (id, label, html, wing) => { if (html && html.trim()) tabs.push({ id, label, html, wing: !!wing }); };

    addTab("genel", "📖 Genel",
      sec("📖 Genel Bakış", is.overview ? `<p class="overview">${esc(is.overview)}</p>` : "") +
      sec(`✅ Öğrendiklerim <span class="cnt">(${is.learned.length})</span>`, `<div class="chips">${chips(is.learned) || '<span class="chip up">—</span>'}</div>`) +
      (is.upcoming.length ? sec("⏳ Sıradaki (henüz izlenmedi)", `<div class="chips">${chips(is.upcoming, true)}</div>`) : ""));
    addTab("kavram", "🧠 Kavramlar",
      sec("🧠 Kavramlar — Derinlemesine", concepts) +
      ((is.tools || []).length ? sec("🧩 Araç Sözlüğü", glossary(is.tools)) : ""));
    addTab("yontem", "🧭 Yöntem",
      sec("🧭 Metodoloji — Adım Adım", workflow) + sec("🛡️ Savunma (Blue Team)", defense) +
      (commands ? sec("💻 Komutlar", `<div class="cmd-warn">⚠️ Tüm komutlar yalnızca <b>yazılı izinli</b> sistemlerde / kendi lab'ında çalıştırılır.</div>${commands}`) : ""));
    addTab("sorun", "🛠️ Sorun-Çözüm",
      sec("🛠️ Sorunla Karşılaşınca — Nereye Bak?", probs));
    addTab("bina", "🏢 Bina", leftWing(is), true);
    addTab("kaynak", "🔗 Kaynaklar", rightWing(is), true);
    if (done || (is.quiz && is.quiz.length)) tabs.push({ id: "gorev", label: "🎯 Görev", html: `<div id="quiz-slot"></div>`, wing: false });

    const tabBar = tabs.map((t, i) =>
      `<button class="btab${t.wing ? " tab-wing" : ""}${i === 0 ? " active" : ""}" data-tab="${t.id}">${t.label}</button>`).join("");
    const panes = tabs.map((t, i) =>
      `<section class="btab-pane${t.wing ? " wing-pane" : ""}${i === 0 ? " active" : ""}" data-tab="${t.id}">${t.html}</section>`).join("");

    const panel = el(`
      <div class="panel" style="--ic:${is.color}">
        <div class="panel-head">
          <button class="x-close" title="Kapat (Esc)">✕</button>
          <div class="row"><span class="icon">${is.icon}</span>
            <div><h2>${esc(is.name)}</h2><span class="track tr-${is.track}">${trackName(is.track)} · Seviye ${is.tier}</span></div></div>
          <p class="tagline">${esc(is.tagline || "")}</p>
          ${isVisitor ? `<div class="visitor-note">👁️ Ziyaretçi görünümü — Maksut'un bu bölgede öğrendikleri</div>` : ""}
        </div>
        <div class="bld-grid">
          <aside class="bwing bwing-left">${leftWing(is)}</aside>
          <div class="bld-main">
            <div class="btabs">${tabBar}</div>
            <div class="btab-panes">${panes}</div>
          </div>
          <aside class="bwing bwing-right">${rightWing(is)}</aside>
        </div>
      </div>`);
    const arch = interiorArch(is);
    const interior = el(`<div class="interior" data-arch="${arch}" style="--ic:${is.color}">${interiorSceneHTML(arch)}</div>`);
    overlay.innerHTML = ""; overlay.appendChild(interior); overlay.appendChild(panel);
    overlay.classList.add("open", "wide", "enter-anim");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", is.name);
    lastFocus = document.activeElement;
    setTimeout(() => overlay.classList.remove("enter-anim"), 550);
    setTimeout(() => { const c = panel.querySelector(".x-close"); if (c) c.focus(); }, 40);

    panel.querySelector(".x-close").onclick = closeOverlay;

    // sekme geçişi
    const tabBtns = panel.querySelectorAll(".btab");
    const tabPanes = panel.querySelectorAll(".btab-pane");
    const paneWrap = panel.querySelector(".btab-panes");
    tabBtns.forEach((b) => {
      b.onmouseenter = () => sfx("hover");
      b.onclick = () => {
        if (b.classList.contains("active")) return;
        tabBtns.forEach((x) => x.classList.remove("active"));
        tabPanes.forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        const pane = panel.querySelector(`.btab-pane[data-tab="${b.dataset.tab}"]`);
        if (pane) pane.classList.add("active");
        if (paneWrap) paneWrap.scrollTop = 0;
        sfx("click");
      };
    });

    panel.querySelectorAll(".pcard").forEach((c) => {
      const q = c.querySelector(".q");
      q.setAttribute("role", "button"); q.tabIndex = 0; q.setAttribute("aria-expanded", "false");
      const toggle = () => { const open = c.classList.toggle("open"); q.setAttribute("aria-expanded", open ? "true" : "false"); sfx(open ? "open" : "close"); };
      q.onclick = toggle;
      q.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } };
    });
    panel.querySelectorAll(".reslink").forEach((a) => {
      a.onmouseenter = () => sfx("hover");
      if (a.dataset.hub) a.onclick = () => { sfx("click"); openLearnHub(); };
      else a.addEventListener("click", () => sfx("click"));
    });
    renderQuiz(is, done);
  }

  /* havuzdan bir önceki soruyu tekrar etmeyecek şekilde rastgele soru seç */
  function pickQ(is, avoid) {
    const qs = is.quiz || []; if (!qs.length) return null;
    if (qs.length === 1) return qs[0];
    let q, guard = 0; do { q = qs[Math.floor(Math.random() * qs.length)]; } while (q === avoid && ++guard < 8);
    return q;
  }
  function renderQuiz(is, done) {
    const slot = $("#quiz-slot"); if (!slot) return;
    if (done) {
      slot.innerHTML = `<div class="done-badge">🏆 Bu bölgede ustalaştın! Kariyer yolunda sayılıyor.</div>`;
      if ((is.quiz || []).length) {
        const pb = el(`<button class="practice-btn">🔄 Pratik yap — yeni soru (+5 XP)</button>`);
        slot.appendChild(pb);
        pb.onmouseenter = () => sfx("hover");
        pb.onclick = () => { sfx("click"); renderQuestion(is, slot, true); };
      }
      return;
    }
    if (!(is.quiz || []).length) return;
    renderQuestion(is, slot, false);
  }
  function renderQuestion(is, slot, practice) {
    const q = pickQ(is, slot._lastQ); if (!q) return;
    slot._lastQ = q;
    const label = practice ? "🔄 Pratik Sorusu" : "🎯 Mini Görev";
    const box = el(`<div class="quiz"><div class="qq">${label}: ${esc(q.q)}</div>
      <div class="opts">${q.a.map((o, i) => `<button class="qopt" data-i="${i}">${esc(o)}</button>`).join("")}</div>
      <div class="result"></div></div>`);
    slot.innerHTML = ""; slot.appendChild(box);
    box.querySelectorAll(".qopt").forEach((btn) => {
      btn.onmouseenter = () => sfx("hover");
      btn.onclick = () => {
        const i = +btn.dataset.i, ok = i === q.c;
        box.querySelectorAll(".qopt").forEach((b) => b.style.pointerEvents = "none");
        btn.classList.add(ok ? "ok" : "no");
        if (!ok) box.querySelector(`[data-i="${q.c}"]`).classList.add("ok");
        const res = box.querySelector(".result");
        if (ok) {
          res.style.color = "var(--green)"; sfx("correct");
          if (practice) {
            res.textContent = "✔ Doğru! +5 XP"; addXP(5); save(); renderHUD(); floatXP("+5 XP", is.color);
            const nb = el(`<button class="practice-btn">🔄 Yeni soru (+5 XP)</button>`);
            box.appendChild(nb); nb.onclick = () => { sfx("click"); renderQuestion(is, slot, true); };
          } else { res.textContent = "✔ Doğru! Bölge ustalaşıldı."; masterIsland(is); }
        } else {
          res.textContent = "✖ Tekrar dene — ipuçları yukarıda."; res.style.color = "var(--red)"; sfx("wrong");
          setTimeout(() => renderQuestion(is, slot, practice), 1100);
        }
      };
    });
  }

  function masterIsland(is) {
    if (state.mastered.includes(is.id)) return;
    state.mastered.push(is.id); addXP(50); save(); renderHUD();
    Engine.splash(Engine.getPlayer().x, Engine.getPlayer().y, is.color);
    floatXP("+50 XP", is.color, true); shakeScreen();
    setTimeout(() => sfx("master"), 380);
    toast(`🏆 ${is.name} ustalaşıldı!  +50 XP`);
    if (mmRefresh) mmRefresh();
    checkCertUnlock();
  }
  function addXP(n) { state.xp = (state.xp || 0) + n; }

  function closeOverlay() { sfx("close"); overlay.classList.remove("open", "wide", "enter-anim"); overlay.removeAttribute("role"); overlay.removeAttribute("aria-modal"); Engine.resume(); if (lastFocus && lastFocus.focus) { lastFocus.focus(); lastFocus = null; } }
  overlay.onclick = (e) => { if (e.target === overlay) closeOverlay(); };

  function trackName(t) { return { red: "Red Team", blue: "Blue Team", both: "Red & Blue", foundation: "Temel" }[t] || t; }

  /* ========================= MODALLAR ========================= */
  const modal = $("#modal");
  function openModal(html) {
    sfx("open"); modal.querySelector(".box").innerHTML = html; modal.classList.add("open");
    modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
    lastFocus = document.activeElement; Engine.pause();
    setTimeout(() => { const c = modal.querySelector(".x-close"); if (c) c.focus(); }, 40);
  }
  function closeModal() {
    sfx("close"); modal.classList.remove("open");
    modal.removeAttribute("role"); modal.removeAttribute("aria-modal"); Engine.resume();
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); lastFocus = null; }
  }
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  function openRefs() {
    const cards = REFERENCES.map((r) => `
      <div class="ref-card" data-id="${r.id}"><div class="rt">${r.icon} ${esc(r.title)}</div><div class="rl">${esc(r.tagline)}</div></div>`).join("");
    openModal(`<button class="x-close" onclick="__closeModal()">✕</button>
      <h2>📖 Temel Bilgi Adaları</h2>
      <p class="sub">Bir kavramda takıldın mı? Hızlı referans kartları — DNS'ten MITRE ATT&CK'e.</p>
      <div class="ref-grid">${cards}</div>`);
    modal.querySelectorAll(".ref-card").forEach((c) => {
      c.onmouseenter = () => sfx("hover");
      c.onclick = () => { sfx("click"); openRefDetail(c.dataset.id); };
    });
  }
  function openRefDetail(id) {
    const r = REFERENCES.find((x) => x.id === id);
    const rows = r.body.map(([k, v]) => `<div class="kv"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("");
    openModal(`<button class="x-close" onclick="__closeModal()">✕</button>
      <button class="back-link" onclick="__openRefs()">◀ Tüm kartlar</button>
      <h2>${r.icon} ${esc(r.title)}</h2><p class="sub">${esc(r.tagline)}</p>
      <div class="ref-detail">${rows}</div>`);
  }

  function openCert() {
    const set = masteredSet();
    const paths = CERT_PATHS.map((p) => {
      const stages = p.stages.map((s) => {
        const done = s.requires.every((r) => set.has(r));
        const got = s.requires.filter((r) => set.has(r)).length;
        return `<div class="stage ${done ? "done" : ""}"><span class="node"></span>
          <div class="sn">${esc(s.name)}</div><div class="sc">🎓 ${esc(s.cert)}</div>
          <div class="sd">${esc(s.desc)}</div>
          <div class="prog">İlerleme: ${got}/${s.requires.length} ada — ${s.requires.map((r) => badge(r, set)).join(" ")}</div></div>`;
      }).join("");
      return `<div class="path" style="border-color:${p.color}55"><h3 style="color:${p.color}">${esc(p.title)}</h3>
        <div class="ps">${esc(p.subtitle)}</div>${stages}</div>`;
    }).join("");
    openModal(`<button class="x-close" onclick="__closeModal()">✕</button>
      <h2>🎓 Kariyer & Sertifika Yolu</h2>
      <p class="sub">Adaları "ustalaşarak" (mini görevleri geçerek) gerçek sertifika yollarını aç. Sertifika mı istiyorsun? Hangi adaları bitirmen gerektiği burada.</p>
      <div class="paths">${paths}</div>`);
  }
  function badge(id, set) {
    const is = ISLANDS.find((i) => i.id === id); if (!is) return "";
    return `<span title="${esc(is.name)}" style="opacity:${set.has(id) ? 1 : .35}">${is.icon}</span>`;
  }

  function openStaj() {
    const m = META.internship;
    openModal(`<button class="x-close" onclick="__closeModal()">✕</button>
      <h2>📄 Staj Raporu</h2>
      <div class="staj-hero"><div class="big">🎓</div>
        <div><div style="font-weight:800;font-size:18px">${esc(META.player)}</div>
        <div style="color:var(--muted);font-size:13px">${esc(META.school)}</div></div></div>
      <div class="staj-meta">
        <div><b>Kurum</b>${esc(m.company)}</div>
        <div><b>Konum</b>${esc(m.place)}</div>
        <div><b>Tarih</b>${esc(m.start)} – ${esc(m.end)}</div>
        <div><b>Kod</b>${esc(m.code)} · ${m.pages} sayfa</div>
      </div>
      <p class="sub">Cyber4 Intelligence'taki 1 aylık siber güvenlik stajının tam raporu. Bu oyun, o stajda ve Udemy müfredatında öğrendiklerinin canlı bir haritası.</p>
      <iframe class="pdf-frame" src="${m.pdf}"></iframe>`);
  }

  function openHelp() {
    openModal(`<button class="x-close" onclick="__closeModal()">✕</button>
      <h2>❓ Nasıl Oynanır</h2>
      <div class="ref-detail">
        <div class="kv"><b>Hareket</b><span><b>A / D</b> veya ◀ ▶ ile caddede koş · haritaya tıkla → oraya yürü</span></div>
        <div class="kv"><b>Uçuş ✈️</b><span><b>F</b> ile jetpack'i aç, sonra <b>W / S</b> ile yüksel/alçal (2× hız)</span></div>
        <div class="kv"><b>Binaya Gir</b><span>Bir binanın kapısına yaklaş → <b>E</b> veya <b>↵</b>. Panel ekranın <b>ortasında</b> açılır</span></div>
        <div class="kv"><b>Ustalaş 🏆</b><span>Binadaki mini görevi doğru cevapla → bina ✅, kariyer ilerler</span></div>
        <div class="kv"><b>🌐 Öğren</b><span>Konuyla ilgili gerçek platform/laboratuvar bağlantıları — üst bardan aç</span></div>
        <div class="kv"><b>⚙️ Ayarlar</b><span>Karakter rengi, şehir teması, ses düzeyi ve efektleri özelleştir</span></div>
        <div class="kv"><b>🔊 Ses</b><span>Üst bardaki hoparlör düğmesiyle sesi aç/kapat</span></div>
        <div class="kv"><b>Kayıt</b><span>İlerlemen ve ayarların tarayıcına otomatik kaydedilir</span></div>
      </div>`);
  }

  /* ========================= MÜFREDAT İLERLEMESİ (checklist) ========================= */
  function currHeadHTML(st) {
    return `<div class="cl-headline">
        <div class="cl-big"><b>${st.wcount}</b> / ${st.total} ders izlendi</div>
        <div class="cl-sub">${st.pct}% süre · ${st.wmin} / ${st.totalMin} dk</div>
      </div>
      <div class="cl-headbar"><i id="cl-head-bar" style="width:${st.pct}%"></i></div>`;
  }
  function openCurriculum() {
    const set = currSet();
    const st = currStats(set);
    // o an bulunulan bölümü açık getir
    let curSi = 0;
    for (const s of CURR_SEC) if (CURR.watchedUpTo >= s.start && CURR.watchedUpTo <= s.end) { curSi = s.si; break; }
    const secHtml = CURR_SEC.map((sec) => {
      const ss = currSecStats(sec, set);
      let rows = "";
      for (let g = sec.start; g <= sec.end; g++) {
        const l = CURR_FLAT[g - 1], on = set.has(g);
        rows += `<button class="cl-row${on ? " done" : ""}" data-g="${g}" role="checkbox" aria-checked="${on}">
          <span class="cl-box"></span><span class="cl-n">${g}</span>
          <span class="cl-t">${esc(l.title)}</span><span class="cl-m">${l.min}dk</span></button>`;
      }
      return `<details class="cl-sec" data-si="${sec.si}"${sec.si === curSi ? " open" : ""}>
        <summary>
          <span class="cl-caret">▸</span>
          <span class="cl-st">${sec.si + 1}. ${esc(sec.t)}</span>
          <span class="cl-sbar"><i style="width:${ss.pct}%"></i></span>
          <span class="cl-sp">${ss.done}/${ss.total}</span>
        </summary>
        <div class="cl-rows">${rows}</div></details>`;
    }).join("");
    openModal(`<button class="x-close" onclick="__closeModal()">✕</button>
      <h2>📚 Kurs İlerlemem</h2>
      <p class="sub">Udemy "Etik Hacker / Siber Güvenlik" müfredatım — ${CURR_FLAT.length} ders. İzlediğin dersi tıkla, ✓ olsun; yüzde anında ilerler ve tarayıcına kaydedilir. Şu an <b>Shodan</b> bölümündeyim.</p>
      <div class="cl-head">${currHeadHTML(st)}
        <div class="cl-actions">
          <button class="cl-act" data-cl="all">✓ Tümünü işaretle</button>
          <button class="cl-act" data-cl="clear">Temizle</button>
        </div>
      </div>
      <div class="cl-list">${secHtml}</div>`);
    wireCurriculum();
  }
  function wireCurriculum() {
    const refreshHead = () => {
      const st = currStats();
      const hb = modal.querySelector("#cl-head-bar"); if (hb) hb.style.width = st.pct + "%";
      const big = modal.querySelector(".cl-big"); if (big) big.innerHTML = `<b>${st.wcount}</b> / ${st.total} ders izlendi`;
      const sub = modal.querySelector(".cl-sub"); if (sub) sub.textContent = `${st.pct}% süre · ${st.wmin} / ${st.totalMin} dk`;
      renderHUD();
    };
    const refreshSec = (si) => {
      const sec = CURR_SEC[si]; const ss = currSecStats(sec);
      const d = modal.querySelector(`.cl-sec[data-si="${si}"]`); if (!d) return;
      const bar = d.querySelector(".cl-sbar i"); if (bar) bar.style.width = ss.pct + "%";
      const sp = d.querySelector(".cl-sp"); if (sp) sp.textContent = `${ss.done}/${ss.total}`;
    };
    modal.querySelectorAll(".cl-row").forEach((row) => {
      row.onclick = () => {
        const g = +row.dataset.g, s = currSet();
        if (s.has(g)) { curr.watched = curr.watched.filter((x) => x !== g); row.classList.remove("done"); row.setAttribute("aria-checked", "false"); sfx("close"); }
        else { curr.watched.push(g); row.classList.add("done"); row.setAttribute("aria-checked", "true"); sfx("correct"); }
        saveCurr();
        refreshSec(CURR_FLAT[g - 1].secIdx); refreshHead();
      };
    });
    modal.querySelectorAll(".cl-act").forEach((b) => {
      b.onmouseenter = () => sfx("hover");
      b.onclick = () => {
        if (b.dataset.cl === "all") curr.watched = CURR_FLAT.map((l) => l.g);
        else curr.watched = [];
        saveCurr(); sfx("click"); openCurriculum(); // tam yeniden çiz
      };
    });
  }

  /* ========================= ARAMA & İÇİNDEKİLER (komut paleti) ========================= */
  /* Bölgeler: 25 binayı 6 anlaşılır grupta topla (içerik silinmez, sadece
     gezinme netleşir). Her bina bir bölgeye ait. */
  const DISTRICTS = [
    { id: "temel", n: "🧱 Temeller", ids: ["setup", "linux", "networks", "theory", "darkweb"] },
    { id: "ag", n: "📡 Ağ & Kablosuz", ids: ["wifi", "mitm"] },
    { id: "sizma", n: "🎯 Sistem Sızma", ids: ["exploitation", "backdoor", "persistence", "crypto", "activedirectory"] },
    { id: "web", n: "🕸️ Web & Uygulama", ids: ["webpentest", "sql", "webaccess", "tools"] },
    { id: "istihbarat", n: "🧠 İstihbarat & Sosyal", ids: ["osint", "socialeng", "beef", "shodan"] },
    { id: "savunma", n: "🛡️ Savunma & İleri", ids: ["soc", "dfir", "cloud", "aisec"] },
    { id: "pratik", n: "🚩 Pratik", ids: ["ctf"] },
  ];
  const districtOf = (id) => (DISTRICTS.find((d) => d.ids.includes(id)) || {}).n || "";

  /* Anahtar kelime / sertifika / araç eş anlamları → bina id(leri). Kullanıcı
     tam yazmasa da doğru binaya ulaşsın. */
  const SEARCH_KEYWORDS = {
    // sertifikalar
    "oscp": ["exploitation", "activedirectory", "ctf", "webpentest"], "pnpt": ["activedirectory", "exploitation", "socialeng"],
    "ejpt": ["exploitation", "networks", "wifi"], "ceh": ["exploitation", "webpentest", "networks"], "crtp": ["activedirectory"],
    "comptia": ["theory", "networks", "setup"], "security+": ["theory", "networks"], "ewpt": ["webpentest", "webaccess", "sql"],
    "btl1": ["soc", "dfir", "mitm"], "cysa": ["soc", "osint"], "gcih": ["dfir", "persistence"], "oscp+": ["exploitation"],
    // araç / konu
    "mitre": ["theory", "soc"], "att&ck": ["theory", "soc"], "attack": ["theory", "soc"], "bloodhound": ["activedirectory"],
    "kerberoast": ["activedirectory"], "kerberos": ["activedirectory"], "pass the hash": ["activedirectory"], "ntlm": ["activedirectory", "crypto"],
    "wireshark": ["mitm", "soc"], "nmap": ["exploitation", "networks"], "burp": ["webpentest", "webaccess"], "metasploit": ["exploitation"],
    "msfvenom": ["backdoor"], "hashcat": ["crypto"], "john": ["crypto"], "hash": ["crypto"], "sqlmap": ["tools", "sql"],
    "sql injection": ["sql"], "sqli": ["sql"], "xss": ["webpentest"], "idor": ["webaccess"], "csrf": ["webaccess"],
    "ssrf": ["webaccess", "cloud"], "ssti": ["webaccess"], "broken access": ["webaccess"], "owasp": ["webpentest", "webaccess"],
    "splunk": ["soc"], "sigma": ["soc"], "siem": ["soc"], "elk": ["soc"], "log": ["soc"], "volatility": ["dfir"],
    "forensic": ["dfir"], "adli": ["dfir"], "incident": ["dfir"], "s3": ["cloud"], "kubernetes": ["cloud"], "k8s": ["cloud"],
    "iam": ["cloud"], "bulut": ["cloud"], "aws": ["cloud"], "deauth": ["wifi"], "handshake": ["wifi"], "wpa": ["wifi"],
    "wep": ["wifi"], "aircrack": ["wifi"], "phishing": ["socialeng"], "oltalama": ["socialeng"], "beef": ["beef"],
    "shodan": ["shodan"], "osint": ["osint"], "tor": ["darkweb"], "dark web": ["darkweb"], "vpn": ["networks"], "dns": ["networks"],
    "prompt injection": ["aisec"], "llm": ["aisec"], "yapay zeka": ["aisec"], "arp": ["mitm"], "mitm": ["mitm"], "backdoor": ["backdoor"],
    "privilege": ["exploitation"], "yetki yükseltme": ["exploitation"], "snapshot": ["setup"], "kali": ["setup", "linux"], "linux": ["linux"],
  };
  const KEYWORD_ENTRIES = Object.entries(SEARCH_KEYWORDS);

  const normTR = (s) => (s || "").toLocaleLowerCase("tr")
    .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/[^a-z0-9&+ ]+/g, " ").replace(/\s+/g, " ").trim();
  function lev(a, b) {
    if (a === b) return 0; const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  // her bina için aranabilir metin + token seti
  const SEARCH_INDEX = {};
  (function buildIndex() {
    for (const is of ISLANDS) {
      const parts = [is.name, is.tagline, is.overview,
        (is.concepts || []).map((c) => c.h).join(" "),
        (is.learned || []).join(" "), (is.upcoming || []).join(" "),
        (is.tools || []).map((t) => t.n).join(" "), (is.resources || []).map((r) => r.n).join(" "),
        (is.commands || []).map((c) => c.c + " " + c.d).join(" "),
        (is.quiz || []).map((q) => q.q).join(" ")];
      // müfredat ders başlıkları da bu binaya
      for (const l of CURR_FLAT) if (l.bld === is.id) parts.push(l.title);
      const blob = normTR(parts.join(" "));
      const tokens = blob.split(" ").filter((t) => t.length >= 2);
      SEARCH_INDEX[is.id] = { name: normTR(is.name), blob, tokenList: tokens, tokens: new Set(tokens) };
    }
  })();

  function searchBuildings(q) {
    const nq = normTR(q); if (!nq) return [];
    const qtokens = nq.split(" ").filter((t) => t.length >= 2);
    const out = [];
    for (const is of ISLANDS) {
      const idx = SEARCH_INDEX[is.id]; let score = 0; const reasons = [];
      for (const [kw, ids] of KEYWORD_ENTRIES) if (ids.includes(is.id) && nq.includes(normTR(kw))) { score += 50; reasons.push(kw); }
      if (idx.name === nq) score += 90; else if (idx.name.includes(nq)) score += 55;
      for (const t of qtokens) {
        if (idx.tokens.has(t)) { score += 20; continue; }
        let hit = false, best = 99;
        for (const it of idx.tokenList) {
          if (it.includes(t) || t.includes(it)) { score += 11; hit = true; break; }
          if (Math.abs(it.length - t.length) <= 2) { const d = lev(t, it); if (d < best) best = d; }
        }
        if (!hit && best <= Math.max(1, Math.floor(t.length / 4))) score += 7;
      }
      if (score > 0) out.push({ is, score, reasons: [...new Set(reasons)] });
    }
    out.sort((a, b) => b.score - a.score || a.is.tier - b.is.tier);
    return out.slice(0, 8);
  }

  function gotoBuilding(is) {
    if (modal.classList.contains("open")) closeModal();
    if (window.Engine && Engine.walkTo) Engine.walkTo(is.id);
    setTimeout(() => openIsland(is), 60);
  }

  function districtIndexHTML() {
    return DISTRICTS.map((d) => {
      const set = masteredSet();
      const chips = d.ids.map((id) => {
        const is = ISLANDS.find((x) => x.id === id); if (!is) return "";
        const cb = currForBuilding(id, currSet());
        return `<button class="sr-chip" data-go="${id}" style="--dc:${is.color}">
          <span class="sr-ic">${is.icon}</span><span class="sr-nm">${esc(is.name)}</span>
          ${set.has(id) ? '<span class="sr-badge">🏆</span>' : (cb.pct ? `<span class="sr-badge">${cb.pct}%</span>` : "")}</button>`;
      }).join("");
      return `<div class="sr-dist"><h3>${d.n} <span>${d.ids.length}</span></h3><div class="sr-chips">${chips}</div></div>`;
    }).join("");
  }
  function renderSearchResults(q) {
    const box = modal.querySelector("#sr-results"); if (!box) return;
    const nq = (q || "").trim();
    if (!nq) { box.innerHTML = districtIndexHTML(); wireSearchResults(); return; }
    const res = searchBuildings(nq);
    if (!res.length) { box.innerHTML = `<div class="sr-empty">Sonuç yok. Konu, araç veya sertifika dene: <b>mitre att&ck</b>, <b>oscp</b>, <b>sql injection</b>, <b>bloodhound</b>…</div>`; return; }
    box.innerHTML = res.map((r, i) => {
      const why = r.reasons.length ? `eşleşme: ${r.reasons.slice(0, 3).map(esc).join(", ")}` : districtOf(r.is.id);
      return `<button class="sr-row${i === 0 ? " sel" : ""}" data-go="${r.is.id}" style="--dc:${r.is.color}">
        <span class="sr-ic big">${r.is.icon}</span>
        <span class="sr-tx"><b>${esc(r.is.name)}</b><span>${esc(why)} · ${esc(districtOf(r.is.id))}</span></span>
        <span class="sr-go">Git →</span></button>`;
    }).join("");
    wireSearchResults();
  }
  function wireSearchResults() {
    modal.querySelectorAll("[data-go]").forEach((b) => {
      b.onmouseenter = () => sfx("hover");
      b.onclick = () => { const is = ISLANDS.find((x) => x.id === b.dataset.go); if (is) { sfx("click"); gotoBuilding(is); } };
    });
  }
  function openSearch() {
    openModal(`<button class="x-close" onclick="__closeModal()">✕</button>
      <h2>🔎 Ara & İçindekiler</h2>
      <p class="sub">Bir konu, araç ya da sertifika yaz — yanlış yazsan bile doğru binayı bulur (ör. <b>mitre att&ck</b>, <b>oscp</b>, <b>kerberoast</b>, <b>ssrf</b>). Boşken tüm binalar bölgelere göre listelenir.</p>
      <input id="sr-input" class="sr-input" type="text" placeholder="Ne öğrenmek istiyorsun? (konu / araç / sertifika)" autocomplete="off" spellcheck="false">
      <div id="sr-results" class="sr-results"></div>`);
    const input = modal.querySelector("#sr-input");
    renderSearchResults("");
    let idxSel = 0;
    input.oninput = () => { renderSearchResults(input.value); idxSel = 0; };
    input.onkeydown = (e) => {
      const rows = [...modal.querySelectorAll(".sr-row")];
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (!rows.length) return;
        rows[idxSel] && rows[idxSel].classList.remove("sel");
        idxSel = (idxSel + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length;
        rows[idxSel].classList.add("sel"); rows[idxSel].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        const sel = modal.querySelector(".sr-row.sel") || rows[0];
        if (sel) sel.click();
      }
    };
    setTimeout(() => input.focus(), 60);
  }

  /* ========================= ÖĞRENME MERKEZİ ========================= */
  function openLearnHub() {
    const cats = (LINKS.LEARN_HUB || []).map((cat) => `
      <div class="hub-cat">
        <h3 style="color:${cat.color}">${esc(cat.cat)}</h3>
        <div class="hub-links">${cat.links.map((l) => `
          <a class="hub-link" href="${esc(l.u)}" target="_blank" rel="noopener noreferrer" style="--hc:${cat.color}">
            <span class="hl-t">${esc(l.t)} <span class="hl-go">↗</span></span>
            <span class="hl-d">${esc(l.d)}</span>
          </a>`).join("")}</div>
      </div>`).join("");
    openModal(`<button class="x-close" onclick="__closeModal()">✕</button>
      <h2>🌐 Öğrenme Merkezi</h2>
      <p class="sub">İnternetten daha fazla öğrenmek için elle seçilmiş, güvenilir kaynaklar. Yasal pratik platformları, referanslar, Blue Team, sertifika yolları ve güncel haberler. Bağlantılar yeni sekmede açılır.</p>
      <div class="hub">${cats}</div>
      <p class="hub-note">🛡️ Hepsi eğitim/savunma odaklı ve yasal pratik ortamlarıdır. Öğrendiğini yalnızca izinli sistemlerde uygula.</p>`);
    modal.querySelectorAll(".hub-link").forEach((a) => a.onmouseenter = () => sfx("hover"));
  }

  /* ========================= AYARLAR / ÖZELLEŞTİRME ========================= */
  const CHAR_COLORS = ["#22c55e", "#22d3ee", "#a855f7", "#ef4444", "#fbbf24", "#f472b6", "#38bdf8", "#f97316"];
  const THEME_LIST = [
    { id: "neon", n: "Neon Mor", c: "#a855f7" }, { id: "sunset", n: "Gün Batımı", c: "#fb923c" },
    { id: "matrix", n: "Matrix Yeşil", c: "#22c55e" }, { id: "ice", n: "Buz Mavisi", c: "#38bdf8" },
  ];
  function openSettings() {
    const c = Engine.getCustom();
    const vol = window.Sound ? Math.round(Sound.getVolume() * 100) : 60;
    const swatches = CHAR_COLORS.map((col) =>
      `<button class="swatch ${col === c.charColor ? "on" : ""}" data-color="${col}" style="background:${col}"></button>`).join("");
    const themes = THEME_LIST.map((t) =>
      `<button class="theme-btn ${t.id === c.theme ? "on" : ""}" data-theme="${t.id}" style="--tc:${t.c}">
        <span class="tdot" style="background:${t.c}"></span>${t.n}</button>`).join("");
    const tog = (key, label, on) =>
      `<button class="toggle ${on ? "on" : ""}" data-toggle="${key}"><span class="tk">${label}</span><span class="tsw"></span></button>`;
    openModal(`<button class="x-close" onclick="__closeModal()">✕</button>
      <h2>⚙️ Özelleştir</h2>
      <p class="sub">Oyunu kendine göre ayarla — her şey anında uygulanır ve kaydedilir.</p>
      <div class="set-grid">
        <div class="set-block">
          <div class="set-lbl">🎨 Minik Maksut'un rengi</div>
          <div class="swatches">${swatches}</div>
        </div>
        <div class="set-block">
          <div class="set-lbl">🌆 Şehir teması</div>
          <div class="themes">${themes}</div>
        </div>
        <div class="set-block">
          <div class="set-lbl">🔊 Ses düzeyi</div>
          <div class="volrow"><input type="range" id="vol" min="0" max="100" value="${vol}">
            <span id="volv">${vol}%</span></div>
          ${tog("muted", "🔇 Sessiz", window.Sound && Sound.isMuted())}
          ${tog("ambient", "🌧️ Ortam sesi (yağmur + uğultu)", c.ambient)}
        </div>
        <div class="set-block">
          <div class="set-lbl">✨ Görsel efektler</div>
          ${tog("rain", "🌧️ Yağmur", c.rain)}
          ${tog("fog", "🌫️ Sis", c.fog)}
          ${tog("effects", "🌌 Aurora & kayan yıldız", c.effects)}
        </div>
      </div>
      <button class="reset-btn" id="reset">🗑️ İlerlemeyi sıfırla</button>`);
    wireSettings();
  }
  function wireSettings() {
    modal.querySelectorAll(".swatch").forEach((b) => {
      b.onmouseenter = () => sfx("hover");
      b.onclick = () => { sfx("click"); Engine.setCustom({ charColor: b.dataset.color });
        modal.querySelectorAll(".swatch").forEach((x) => x.classList.remove("on")); b.classList.add("on"); };
    });
    modal.querySelectorAll(".theme-btn").forEach((b) => {
      b.onmouseenter = () => sfx("hover");
      b.onclick = () => { sfx("click"); Engine.setCustom({ theme: b.dataset.theme });
        modal.querySelectorAll(".theme-btn").forEach((x) => x.classList.remove("on")); b.classList.add("on"); };
    });
    modal.querySelectorAll(".toggle").forEach((b) => b.onclick = () => {
      const on = !b.classList.contains("on"); b.classList.toggle("on", on);
      const k = b.dataset.toggle; sfx(on ? "open" : "close");
      if (k === "muted") { window.Sound && Sound.setMuted(on); renderHUD(); }
      else if (k === "ambient") Engine.setCustom({ ambient: on });
      else Engine.setCustom({ [k]: on });
    });
    const vol = modal.querySelector("#vol");
    if (vol) vol.oninput = () => {
      modal.querySelector("#volv").textContent = vol.value + "%";
      window.Sound && Sound.setVolume(+vol.value / 100);
    };
    const reset = modal.querySelector("#reset");
    if (reset) { reset.dataset.step = "0"; reset.onclick = () => {
      if (reset.dataset.step === "0") { reset.dataset.step = "1"; reset.textContent = "⚠️ Emin misin? Tekrar tıkla — tüm ilerleme silinir"; reset.classList.add("armed"); sfx("wrong"); return; }
      state = { mastered: [], visited: [], xp: 0 }; save(); lastUnlocked = new Set(); renderHUD();
      closeModal(); toast("🗑️ İlerleme sıfırlandı");
    }; }
  }

  /* global köprüler (modal içi butonlar) */
  window.__closeModal = closeModal; window.__openRefs = openRefs;

  /* ========================= TOAST ========================= */
  function toast(msg) {
    const t = el(`<div class="toast">${esc(msg)}</div>`);
    $("#toast-wrap").appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .4s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 400); }, 2400);
  }

  /* ---- juice: uçan +XP + ekran sarsıntısı ---- */
  function floatXP(text, color, big) {
    const f = el(`<div class="xp-float${big ? " big" : ""}">${esc(text)}</div>`);
    if (color) f.style.color = color;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1200);
  }
  function shakeScreen() {
    const g = $("#game"); if (!g) return;
    g.classList.remove("shake-fx"); void g.offsetWidth; g.classList.add("shake-fx");
    setTimeout(() => g.classList.remove("shake-fx"), 460);
  }
  let lastUnlocked = new Set();
  function checkCertUnlock() {
    const set = masteredSet();
    for (const p of CERT_PATHS) for (const s of p.stages) {
      const kk = p.id + s.name;
      if (s.requires.every((r) => set.has(r)) && !lastUnlocked.has(kk)) {
        lastUnlocked.add(kk); setTimeout(() => sfx("unlock"), 900); toast(`🎓 Yeni aşama açıldı: ${s.name} (${s.cert})`);
      }
    }
  }

  /* ========================= MOD (admin / ziyaretçi) ========================= */
  function detectMode() {
    try {
      const q = new URLSearchParams(location.search).get("mode");
      if (q === "admin" || q === "visitor") return q;
    } catch (e) {}
    return "admin"; // tek başına çift-tıkla açılınca: Maksut olarak oyna
  }
  const MODE = detectMode();

  // Dialog'un "İçeri gir" seçeneği buradan openIsland'ı çağırır
  window.__enterIsland = (is) => openIsland(is);
  window.__closeModal = closeModal;

  /* ========================= MİNİMAP ========================= */
  let mmRefresh = null; // ustalık değişince nokta durumlarını güncelle
  function mountMinimap() {
    if (!window.Engine || !Engine.getMapData) return;
    const data = Engine.getMapData();
    if (!data || !data.worldW || !data.buildings.length) return;
    const nameOf = (id) => { const is = ISLANDS.find((i) => i.id === id); return is ? is.name : id; };
    const wrap = el(`<div id="minimap" role="group" aria-label="Şehir haritası — bir binaya git">
      <span class="mm-cap">🗺️</span><div class="mm-track"><div class="mm-player" aria-hidden="true"></div></div></div>`);
    document.body.appendChild(wrap);
    const track = wrap.querySelector(".mm-track");
    const marker = wrap.querySelector(".mm-player");
    const dots = {};
    data.buildings.forEach((b) => {
      const left = Math.max(1, Math.min(99, (b.x / data.worldW) * 100));
      const dot = el(`<button class="mm-dot tr-${b.track}" style="left:${left}%;--dc:${b.color}"
        data-id="${b.id}" title="${esc(nameOf(b.id))} — buraya yürü" aria-label="${esc(nameOf(b.id))}"></button>`);
      track.appendChild(dot); dots[b.id] = dot;
      dot.onmouseenter = () => sfx("hover");
      dot.onclick = () => { sfx("click"); Engine.walkTo(b.id); if (overlay.classList.contains("open")) closeOverlay(); };
    });
    const paint = () => {
      const d = Engine.getMapData(); if (!d) return;
      marker.style.left = Math.max(0, Math.min(100, (d.playerX / d.worldW) * 100)) + "%";
      const set = masteredSet();
      for (const b of d.buildings) { const dot = dots[b.id]; if (dot) dot.classList.toggle("done", set.has(b.id)); }
    };
    mmRefresh = paint; paint();
    // hafif güncelleme: gizli sekmede dur (pil dostu)
    setInterval(() => { if (!document.hidden) paint(); }, 140);
  }

  /* ziyaretçi ilk girişte kendi misafir karakterini oluşturur (cinsiyet + isim) */
  function visitorSetup() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem("maksut_guest") || "null"); } catch (e) {}
    if (saved && saved.name) { Engine.setGuest(saved); return; }
    const box = el(`<div id="guest-setup"><div class="gs-card">
      <div class="gs-emoji">🌃</div>
      <h2>Şehre hoş geldin!</h2>
      <p>Kendi misafir karakterini oluştur — sonra Mihri'nin siber şehrini keşfet.</p>
      <div class="gs-lbl">Karakterin</div>
      <div class="gs-genders">
        <button class="gs-g" data-fem="0"><span>🧑</span>Erkek</button>
        <button class="gs-g on" data-fem="1"><span>👧</span>Kız</button>
      </div>
      <div class="gs-lbl">Adın</div>
      <input id="gs-name" maxlength="16" placeholder="ör. Elif" autocomplete="off" spellcheck="false">
      <button id="gs-start" class="gs-start">Şehre gir →</button>
      <div class="gs-note">Ziyaretçi karakterin küçük bir detay — dilediğin an gezmeye başlayabilirsin.</div>
    </div></div>`);
    document.body.appendChild(box);
    let fem = 1;
    box.querySelectorAll(".gs-g").forEach((b) => {
      b.onmouseenter = () => sfx("hover");
      b.onclick = () => { fem = +b.dataset.fem; box.querySelectorAll(".gs-g").forEach((x) => x.classList.remove("on")); b.classList.add("on"); sfx("click"); };
    });
    const nameI = box.querySelector("#gs-name");
    const go = () => {
      const name = nameI.value.trim() || "Misafir";
      const g = { fem: !!fem, name };
      try { localStorage.setItem("maksut_guest", JSON.stringify(g)); } catch (e) {}
      Engine.setGuest(g); window.Sound && Sound.unlock(); sfx("door");
      box.style.opacity = "0"; setTimeout(() => box.remove(), 320);
    };
    box.querySelector("#gs-start").onclick = go;
    nameI.onkeydown = (e) => { if (e.key === "Enter") go(); };
    setTimeout(() => nameI.focus(), 120);
  }

  /* ziyaretçi modunda üstte "Maksut şu an…" durum şeridi */
  function mountAiStatus() {
    const bar = el(`<div id="ai-status"><span class="ai-live"></span>
      <span class="ai-ic">🛰️</span><span class="ai-txt">Maksut yükleniyor…</span></div>`);
    document.body.appendChild(bar);
    const ic = bar.querySelector(".ai-ic"), tx = bar.querySelector(".ai-txt");
    const apply = (s) => { if (!s) return; ic.textContent = s.icon || "🛰️"; tx.textContent = s.sentence;
      bar.style.borderColor = s.color ? s.color + "88" : ""; bar.classList.add("show"); };
    window.addEventListener("maksut-status", (e) => apply(e.detail));
    if (window.MaksutAI) apply(MaksutAI.getStatus());
  }

  /* ========================= BOOT ========================= */
  function boot() {
    touchStreak();
    renderHUD();
    const set = masteredSet();
    for (const p of CERT_PATHS) for (const s of p.stages)
      if (s.requires.every((r) => set.has(r))) lastUnlocked.add(p.id + s.name);

    Engine.init($("#game"), {
      getMastered: masteredSet,
      isLocked: () => false,
      onEnter: (is) => openIsland(is),
      onProximity: () => {},
    });
    Engine.setMode(MODE);

    // eklentileri bağla (motor hazır olduktan sonra)
    window.NPC && NPC.init();
    window.Robot && Robot.init();
    if (MODE === "visitor" && window.MaksutAI) { MaksutAI.init(); mountAiStatus(); }
    if (MODE === "visitor") visitorSetup();
    window.TouchControls && TouchControls.init();
    mountMinimap();

    const playBtn = $("#btn-play");
    if (playBtn) {
      playBtn.onmouseenter = () => { window.Sound && Sound.unlock(); sfx("hover"); };
      playBtn.onclick = () => {
        window.Sound && Sound.unlock(); sfx("door");
        $("#boot").style.opacity = "0";
        setTimeout(() => $("#boot").classList.add("hidden"), 600);
        Engine.start();
      };
    }
    // iframe/otomatik başlatma: ?autostart=1 ise açılışı atla
    try {
      if (new URLSearchParams(location.search).get("autostart") === "1") {
        const b = $("#boot"); if (b) { b.style.opacity = "0"; setTimeout(() => b.classList.add("hidden"), 400); }
        Engine.start();
        // buton atlandığı için ses kilidi ilk jestte açılır (tarayıcı autoplay kuralı)
        const unlockOnce = () => { window.Sound && Sound.unlock(); };
        window.addEventListener("pointerdown", unlockOnce, { once: true });
        window.addEventListener("keydown", unlockOnce, { once: true });
      }
    } catch (e) {}

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (window.Dialog && Dialog.isOpen()) Dialog.close();
        else if (modal.classList.contains("open")) closeModal();
        else if (overlay.classList.contains("open")) closeOverlay();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (!modal.classList.contains("open")) openSearch();
      }
    });
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
