/* =========================================================================
 * DİYALOG SİSTEMİ — NPC / robot sohbet kartı (DOM).
 * mode=admin (Maksut): motivasyon + data.js'ten GERÇEK istatistik.
 * mode=visitor (Misafir): binayı/konuyu tanıtan + "Maksut şu an ne yaptı".
 * Daktilo efekti, seçenek dalları, uzaklaşınca/ESC ile kapanma.
 * ========================================================================= */
(function () {
  const { ISLANDS } = window.GAME_DATA;
  const totalLearned = ISLANDS.reduce((a, x) => a + (x.learned ? x.learned.length : 0), 0);

  let root, elAvatar, elName, elText, elOpts, cur = null, typing = null;

  function ensureDom() {
    if (root) return;
    root = document.createElement("div");
    root.id = "npc-dialog";
    root.className = "npc-dialog";
    root.innerHTML = `
      <div class="nd-card" role="dialog" aria-live="polite">
        <button class="nd-close" aria-label="Kapat">✕</button>
        <div class="nd-head">
          <div class="nd-avatar"></div>
          <div class="nd-who"><span class="nd-name"></span><span class="nd-sub"></span></div>
        </div>
        <p class="nd-text"></p>
        <div class="nd-opts"></div>
      </div>`;
    document.body.appendChild(root);
    elAvatar = root.querySelector(".nd-avatar");
    elName = root.querySelector(".nd-name");
    elSub = root.querySelector(".nd-sub");
    elText = root.querySelector(".nd-text");
    elOpts = root.querySelector(".nd-opts");
    root.querySelector(".nd-close").onclick = close;
    root.addEventListener("pointerdown", (e) => e.stopPropagation());
    window.addEventListener("keydown", (e) => { if (e.key === "Escape" && cur) close(); });
  }
  let elSub;

  function typeText(str) {
    if (typing) clearInterval(typing);
    elText.textContent = "";
    let i = 0;
    typing = setInterval(() => {
      elText.textContent = str.slice(0, ++i);
      if (i >= str.length) { clearInterval(typing); typing = null; }
    }, 16);
  }

  function render(node) {
    typeText(node.text);
    elOpts.innerHTML = "";
    (node.options || []).forEach((o) => {
      const b = document.createElement("button");
      b.className = "nd-opt"; b.textContent = o.label;
      b.onmouseenter = () => window.Sound && Sound.sfx("hover");
      b.onclick = () => {
        window.Sound && Sound.sfx("click");
        if (o.to) render(cur.tree[o.to]);
        else if (o.action === "enter" && cur.island && window.__enterIsland) { close(); window.__enterIsland(cur.island); }
        else close();
      };
      elOpts.appendChild(b);
    });
    if (!node.options || !node.options.length) {
      const b = document.createElement("button");
      b.className = "nd-opt nd-opt-close"; b.textContent = "Görüşürüz 👋";
      b.onclick = close; elOpts.appendChild(b);
    }
  }

  function open(who, sub, avatarHtml, accent, tree, island) {
    ensureDom();
    cur = { tree, island };
    elName.textContent = who;
    elSub.textContent = sub || "";
    elAvatar.innerHTML = avatarHtml;
    root.style.setProperty("--nd-accent", accent || "#22d3ee");
    root.classList.add("open");
    window.Sound && Sound.sfx("open");
    render(tree.start);
  }
  function close() {
    if (!cur) return;
    cur = null;
    if (typing) { clearInterval(typing); typing = null; }
    root.classList.remove("open");
    window.Sound && Sound.sfx("close");
  }

  /* ---- NPC diyalog ağacı (moda göre) ---- */
  function npcTree(n) {
    const d = n.island, isVisitor = Engine.getMode() === "visitor";
    const learnedN = d.learned ? d.learned.length : 0;
    const c0 = d.concepts && d.concepts[0];
    const p0 = d.problems && d.problems[0];
    const tree = {};
    if (isVisitor) {
      tree.start = {
        text: `Merhaba! Ben ${n.name}, ${d.name} bölgesinin sorumlusuyum. Burada Maksut ${learnedN} konu öğrendi. Ne öğrenmek istersin?`,
        options: [
          { label: "Bu bina ne anlatıyor?", to: "about" },
          { label: "Maksut burada ne yaptı?", to: "maksut" },
          { label: c0 ? "Bir ipucu ver" : "Kapat", to: c0 ? "tip" : undefined },
        ],
      };
      tree.about = { text: d.tagline || d.overview || `${d.name} — ${trackLabel(d.track)} yolunun bir durağı.`,
        options: [{ label: "Maksut burada ne yaptı?", to: "maksut" }, { label: "İçeri göz atayım", action: "enter" }] };
      tree.maksut = { text: `Maksut bu bölgede ${learnedN} konuyu tamamladı${p0 ? `; en sık "${p0.p}" sorusuna çalıştı` : ""}. İçeri girip kendi notlarını görebilirsin.`,
        options: [{ label: "İçeri gir 🚪", action: "enter" }, { label: "Başka ipucu", to: c0 ? "tip" : "about" }] };
      tree.tip = { text: c0 ? `${c0.h}: ${c0.body}` : "Bugünlük bu kadar!",
        options: [{ label: "İçeri gir 🚪", action: "enter" }, { label: "Teşekkürler", to: undefined }] };
    } else {
      tree.start = {
        text: `Selam Maksut! ${d.name} bölgesindesin. Şu ana dek ${learnedN} konu bitirdin — toplamda ${totalLearned}. Aferin! Ne yapalım?`,
        options: [
          { label: "Beni motive et", to: "hype" },
          { label: p0 ? "Sık takıldığım şey" : "İçeri girelim", to: p0 ? "recall" : undefined, action: p0 ? undefined : "enter" },
          { label: "İçeri gir 🚪", action: "enter" },
        ],
      };
      tree.hype = { text: pick([
          `Red ve Blue ikisini birden kovalayan kaç kişi var sanıyorsun? Sen ${totalLearned} konuyla yoldasın.`,
          `Unutma: her "nerede bakarım" kartı bir gün seni bir incident'te kurtaracak.`,
          `${learnedN} konu az değil. Bir tur at, hepsi hâlâ orada.`]),
        options: [{ label: "İçeri gir 🚪", action: "enter" }, { label: "Bir daha söyle", to: "hype" }] };
      tree.recall = { text: p0 ? `Hani şu: "${p0.p}" — bakılacak yer: ${(p0.look || []).slice(0, 2).join(" · ")}` : "Her şey yolunda!",
        options: [{ label: "İçeri gir 🚪", action: "enter" }, { label: "Sağ ol", to: undefined }] };
    }
    return tree;
  }

  function openNpc(n) {
    if (cur) { close(); return; }
    const av = `<span class="nd-em" style="color:${n.color}">${n.island.icon}</span>`;
    open(n.name, `${n.island.name} · ${trackLabel(n.island.track)}`, av, n.color, npcTree(n), n.island);
    n.act = "wave"; n.actP = 0;
  }

  /* ---- robot diyalog ---- */
  function openRobot() {
    if (cur) { close(); return; }
    const isVisitor = Engine.getMode() === "visitor";
    const tree = { start: isVisitor ? {
        text: "bip-boop! Ben Maksut'un yardımcı dronuyum 🛸 Onu takip et, binalara girince ne öğrendiğini görürsün. Beni sürükleyip fırlatabilirsin de!",
        options: [{ label: "Maksut şu an nerede?", to: "where" }, { label: "Seninle oynayayım", to: "play" }],
      } : {
        text: "bip! Komutan Maksut 🫡 Bugün hangi bölgeye dalıyoruz? Ben arkanı kollarım.",
        options: [{ label: "İstatistik ver", to: "stat" }, { label: "Takla at", to: "play" }],
      },
      where: { text: (window.MaksutAI && MaksutAI.getStatus ? MaksutAI.getStatus().sentence : "Maksut şehirde bir yerlerde geziniyor."),
        options: [{ label: "Anladım 👍", to: undefined }] },
      stat: { text: `Toplam ${totalLearned} konu, ${ISLANDS.length} bölge. Fena değil komutan.`,
        options: [{ label: "Devam", to: undefined }] },
      play: { text: "yaşasııın! *takla* 🤸 (beni tekrar tıkla, yine atarım)", options: [{ label: "😄", to: undefined }] },
    };
    open("Dron", "yardımcı maskot", `<span class="nd-em nd-em-bot">🤖</span>`, "#22d3ee", tree, null);
  }

  function trackLabel(t) { return { red: "Kırmızı Takım", blue: "Mavi Takım", both: "Karma", foundation: "Temel" }[t] || t; }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }

  window.Dialog = { openNpc, openRobot, close, isOpen: () => !!cur };
})();
