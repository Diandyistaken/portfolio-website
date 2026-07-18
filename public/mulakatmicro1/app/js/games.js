/* ============ games: match pairs, ordering, rapid classify ============ */
'use strict';

const GAMES = [
{id:'ports', type:'match', ico:'🚪', title:{tr:'Port Avı', en:'Port Hunt'},
 desc:{tr:'Portu servisiyle eşleştir. Hepsini hatasız bitir: +25 XP.', en:'Match each port to its service. Flawless run: +25 XP.'},
 pairs:[['22','SSH'],['53','DNS'],['443','HTTPS'],['3389','RDP'],['445','SMB'],['25','SMTP'],['21','FTP'],['23','Telnet']]},
{id:'events', type:'match', ico:'🪟', title:{tr:'Event ID Radar', en:'Event ID Radar'},
 desc:{tr:'Windows Event ID\'yi anlamıyla eşleştir.', en:'Match each Windows Event ID with its meaning.'},
 pairs:[['4624',{tr:'Başarılı oturum',en:'Successful logon'}],['4625',{tr:'Başarısız oturum',en:'Failed logon'}],['4688',{tr:'Process oluşturma',en:'Process creation'}],['4672',{tr:'Özel yetkili oturum',en:'Privileged logon'}],['7045',{tr:'Yeni servis kuruldu',en:'New service installed'}],['1102',{tr:'Log silindi!',en:'Audit log cleared!'}]]},
{id:'vocab', type:'match', ico:'🇬🇧', title:{tr:'Terim Köprüsü', en:'Term Bridge'},
 desc:{tr:'İngilizce güvenlik terimini Türkçesiyle eşleştir.', en:'Match the English security term with its Turkish equivalent.'},
 pairs:[['breach','ihlal'],['threat','tehdit'],['vulnerability','zafiyet'],['containment','çevreleme'],['evidence','delil'],['encryption','şifreleme'],['assessment','değerlendirme'],['mitigation','hafifletme']]},
{id:'nist', type:'order', ico:'🔄', title:{tr:'NIST Zinciri', en:'NIST Chain'},
 desc:{tr:'IR yaşam döngüsü fazlarını doğru sıraya diz. Mülakatta ezbere sayman gerekiyor!', en:'Put the IR lifecycle phases in order. You must recite this cold in the interview!'},
 items:['Preparation','Detection & Analysis','Containment','Eradication','Recovery','Lessons Learned']},
{id:'ransom', type:'order', ico:'💀', title:{tr:'Ransomware Playbook', en:'Ransomware Playbook'},
 desc:{tr:'Ransomware müdahale adımlarını sırala.', en:'Order the ransomware response steps.'},
 items:[
   {tr:'Sunucuyu ağdan izole et (kapatma!)', en:'Isolate the server from the network (don\'t power off!)'},
   {tr:'Kapsamı çıkar — yayılıyor mu, yedekler etkilendi mi?', en:'Scope it — is it spreading, are backups hit?'},
   {tr:'IR ekibine ve yönetime eskale et', en:'Escalate to IR team and management'},
   {tr:'Delil topla: bellek + disk imajı, hash', en:'Preserve evidence: memory + disk image, hash'},
   {tr:'Türü ve giriş vektörünü tespit et', en:'Identify the strain and entry vector'},
   {tr:'Eradication: temizle, açığı kapat', en:'Eradicate: clean up, close the entry point'},
   {tr:'Temiz offline yedekten geri dön', en:'Restore from clean offline backups'},
   {tr:'Lessons learned raporu yaz', en:'Write the lessons-learned report'}]},
{id:'triage5', type:'order', ico:'🚨', title:{tr:'Alert Triyaj Zinciri', en:'Alert Triage Chain'},
 desc:{tr:'Alert geldiğinde ilk 5 adımı sırala — mülakatın en muhtemel sorusu.', en:'Order the first 5 steps when an alert fires — the most likely interview question.'},
 items:[
   {tr:'Ham loglarla alert\'i doğrula', en:'Validate the alert against raw logs'},
   {tr:'Kapsamı belirle: hangi host, hangi kullanıcı', en:'Scope: which host, which user'},
   {tr:'Bağlam ekle: kritiklik + threat intel', en:'Add context: criticality + threat intel'},
   {tr:'TP/FP sınıflandır, severity ata', en:'Classify TP/FP, assign severity'},
   {tr:'Playbook\'la aksiyon al ve belgele', en:'Act by playbook and document'}]},
{id:'iocioa', type:'classify', ico:'🧬', title:{tr:'IoC mu IoA mı?', en:'IoC or IoA?'},
 desc:{tr:'Hızlı karar: gösterge statik kanıt mı (IoC), davranış mı (IoA)? 10 soru, süre işliyor!', en:'Quick call: static artifact (IoC) or behavior (IoA)? 10 rounds, clock is ticking!'},
 a:{lbl:'IoC'}, b:{lbl:'IoA'},
 items:[
   {t:{tr:'Bilinen zararlı dosya hash\'i', en:'Known malicious file hash'}, k:'a'},
   {t:{tr:'Word\'ün powershell.exe başlatması', en:'Word spawning powershell.exe'}, k:'b'},
   {t:{tr:'C2 sunucusunun IP adresi', en:'C2 server IP address'}, k:'a'},
   {t:{tr:'Gece 3\'te toplu dosya erişimi', en:'Mass file access at 3 AM'}, k:'b'},
   {t:{tr:'Zararlı domain adı listesi', en:'Malicious domain list'}, k:'a'},
   {t:{tr:'Olağandışı hesapla lateral movement denemesi', en:'Lateral movement attempt with unusual account'}, k:'b'},
   {t:{tr:'Ransomware notunun dosya adı', en:'Ransom note file name'}, k:'a'},
   {t:{tr:'Kısa aralıklarla düzenli DNS sorguları (beaconing)', en:'Regular short-interval DNS queries (beaconing)'}, k:'b'},
   {t:{tr:'Zararlının kayıtlı dosya yolu', en:'Known malware file path'}, k:'a'},
   {t:{tr:'Yetki yükseltme sonrası log silme davranışı', en:'Log clearing right after privilege escalation'}, k:'b'}]},
{id:'fpfn', type:'classify', ico:'⚖️', title:{tr:'Gerçek mi Gürültü mü?', en:'Real or Noise?'},
 desc:{tr:'Analist kararı: bu alert büyük ihtimalle True Positive mi, False Positive mi?', en:'Analyst call: is this alert likely a True Positive or a False Positive?'},
 a:{lbl:'TP ⚠️'}, b:{lbl:'FP ✅'},
 items:[
   {t:{tr:'Vuln tarayıcı IP\'sinden port taraması (planlı tarama saatinde)', en:'Port scan from the vuln scanner IP (during scheduled scan window)'}, k:'b'},
   {t:{tr:'Muhasebe kullanıcısı gece 3\'te DC\'ye RDP açıyor', en:'Accounting user opens RDP to the DC at 3 AM'}, k:'a'},
   {t:{tr:'Yedekleme sunucusundan gece büyük veri transferi (her gece aynı)', en:'Large nightly transfer from the backup server (same every night)'}, k:'b'},
   {t:{tr:'Word → powershell.exe → dışarı bağlantı zinciri', en:'Word → powershell.exe → outbound connection chain'}, k:'a'},
   {t:{tr:'Tek IP\'den 40 farklı hesaba 2\'şer başarısız login', en:'One IP, 40 accounts, 2 failed logins each'}, k:'a'},
   {t:{tr:'Yeni işe giren kullanıcının ilk kez VPN kullanması', en:'A new hire using the VPN for the first time'}, k:'b'},
   {t:{tr:'1102 — audit log silindi', en:'1102 — audit log cleared'}, k:'a'},
   {t:{tr:'Pazartesi sabahı toplu 4624 artışı (mesai başlangıcı)', en:'Monday-morning spike in 4624s (start of shift)'}, k:'b'}]}
];

views.games = (v)=>{
  const cards = GAMES.map(g=>{
    const best = state.gameBest[g.id];
    return `<div class="card click mod-card" onclick="startGame('${g.id}')">
      <span class="mod-ico">${g.ico}</span>
      <h3>${esc(t(g.title))}</h3>
      <p>${esc(t(g.desc))}</p>
      <div class="mod-foot"><span class="badge ${best!=null?'gr':''}">${best!=null ? '★ '+best : (state.lang==='tr'?'Hiç oynanmadı':'Not played yet')}</span><span>▶</span></div>
    </div>`;
  }).join('');
  v.innerHTML = `
    <h1 class="hero">${state.lang==='tr'?'Beceri <span class="g">Oyunları</span>':'Skill <span class="g">Games</span>'}</h1>
    <p class="sub">${state.lang==='tr'?'Refleks haline gelene kadar oyna — mülakatta düşünmeden söyleyebilmelisin.':'Play until it becomes reflex — in the interview these must come out without thinking.'}</p>
    <div class="grid g2 mt stagger">${cards}</div>`;
};

let GM = null;
function startGame(id){
  const g = GAMES.find(x=>x.id===id);
  if(g.type==='match') startMatch(g);
  else if(g.type==='order') startOrder(g);
  else startClassify(g);
}
function gameShell(g, inner){
  const v = document.getElementById('view');
  v.className = 'view-enter';
  v.innerHTML = `
    <div style="max-width:760px;margin:0 auto">
      <div class="q-top">
        <span class="badge vi">${g.ico} ${esc(t(g.title))}</span>
        <span class="big-timer" id="gm-timer">00:00</span>
        <button class="btn ghost sm" onclick="stopGameTimer();go('games')">✕</button>
      </div>
      <div class="card" id="gm-area">${inner}</div>
    </div>`;
}
let gmTimerInt = null;
function startGameTimer(){
  GM.t0 = Date.now();
  stopGameTimer();
  gmTimerInt = setInterval(()=>{
    const s = Math.floor((Date.now()-GM.t0)/1000);
    const elx = document.getElementById('gm-timer');
    if(elx) elx.textContent = fmtTime(s); else stopGameTimer();
  }, 500);
}
function stopGameTimer(){ if(gmTimerInt){ clearInterval(gmTimerInt); gmTimerInt = null; } }

function gameEnd(g, score, detail){
  stopGameTimer();
  const prev = state.gameBest[g.id] ?? -1;
  if(score > prev){ state.gameBest[g.id] = score; save(); }
  const xp = Math.max(5, Math.round(score/5));
  addXP(xp, t(g.title));
  if(score>=90) confetti.fire(110);
  document.getElementById('gm-area').innerHTML = `
    <div class="result-panel">
      <span class="r-emoji">${score>=90?'🏆':score>=60?'🎉':'💪'}</span>
      <div class="score-big">${score}</div>
      <p class="sub center" style="margin:8px auto 16px">${esc(detail||'')}${score>prev&&prev>=0 ? ' — '+(state.lang==='tr'?'yeni rekor!':'new best!') : ''}</p>
      <div class="row" style="justify-content:center">
        <button class="btn ghost" onclick="startGame('${g.id}')">↻ ${state.lang==='tr'?'Tekrar':'Retry'}</button>
        <button class="btn" onclick="go('games')">${state.lang==='tr'?'Oyunlar':'Games'}</button>
      </div>
    </div>`;
}

/* ---- match pairs ---- */
function startMatch(g){
  const tiles = [];
  g.pairs.forEach((p,i)=>{
    tiles.push({txt:typeof p[0]==='object'?t(p[0]):p[0], pair:i});
    tiles.push({txt:typeof p[1]==='object'?t(p[1]):p[1], pair:i});
  });
  GM = {g, tiles:shuffle(tiles), sel:null, found:0, errors:0};
  gameShell(g, `<p class="sub mb">${esc(t(g.desc))}</p><div class="match-grid" id="mg"></div>`);
  const mg = document.getElementById('mg');
  GM.tiles.forEach((tl,idx)=>{
    const d = el(`<div class="match-tile" data-i="${idx}">${esc(tl.txt)}</div>`);
    d.onclick = ()=>pickTile(idx, d);
    mg.appendChild(d);
  });
  startGameTimer();
}
function pickTile(idx, dom){
  if(dom.classList.contains('ok')) return;
  if(GM.sel && GM.sel.idx===idx){ dom.classList.remove('sel'); GM.sel=null; return; }
  if(!GM.sel){ GM.sel = {idx, dom}; dom.classList.add('sel'); return; }
  const a = GM.tiles[GM.sel.idx], b = GM.tiles[idx];
  if(a.pair === b.pair){
    GM.sel.dom.classList.remove('sel');
    GM.sel.dom.classList.add('ok'); dom.classList.add('ok');
    GM.found++; GM.sel = null;
    if(GM.found === GM.g.pairs.length){
      const secs = Math.floor((Date.now()-GM.t0)/1000);
      const score = Math.max(20, 100 - GM.errors*10 - Math.max(0, secs-40));
      gameEnd(GM.g, score, (state.lang==='tr'?`${secs} sn, ${GM.errors} hata`:`${secs}s, ${GM.errors} mistakes`));
    }
  } else {
    GM.errors++;
    const s = GM.sel.dom; GM.sel = null;
    s.classList.remove('sel'); s.classList.add('bad'); dom.classList.add('bad');
    setTimeout(()=>{ s.classList.remove('bad'); dom.classList.remove('bad'); }, 420);
  }
}

/* ---- ordering ---- */
function startOrder(g){
  const items = g.items.map((it,i)=>({txt:typeof it==='object'?t(it):it, ord:i}));
  GM = {g, items:shuffle(items), next:0, errors:0};
  gameShell(g, `<p class="sub mb">${esc(t(g.desc))} — ${state.lang==='tr'?'sıradaki adıma tıkla':'click the next step in order'}</p><div id="og"></div>`);
  const og = document.getElementById('og');
  GM.items.forEach((it)=>{
    const d = el(`<div class="order-item"><span class="order-slot-num">?</span><span>${esc(it.txt)}</span></div>`);
    d.onclick = ()=>pickOrder(it, d);
    og.appendChild(d);
  });
  startGameTimer();
}
function pickOrder(it, dom){
  if(dom.classList.contains('placed')) return;
  if(it.ord === GM.next){
    dom.classList.add('placed');
    dom.querySelector('.order-slot-num').textContent = GM.next+1;
    GM.next++;
    if(GM.next === GM.items.length){
      const score = Math.max(20, 100 - GM.errors*12);
      gameEnd(GM.g, score, (state.lang==='tr'?`${GM.errors} hata`:`${GM.errors} mistakes`));
    }
  } else {
    GM.errors++;
    dom.classList.add('bad'); setTimeout(()=>dom.classList.remove('bad'), 420);
  }
}

/* ---- rapid classify ---- */
function startClassify(g){
  GM = {g, items:shuffle(g.items), i:0, correct:0};
  gameShell(g, `<p class="sub mb">${esc(t(g.desc))}</p>
    <div id="cl-item" class="classify-item"></div>
    <div class="classify-btns">
      <button class="btn" style="min-width:130px" onclick="pickClass('a')">${esc(g.a.lbl)}</button>
      <button class="btn ghost" style="min-width:130px" onclick="pickClass('b')">${esc(g.b.lbl)}</button>
    </div>
    <p class="center muted mt" id="cl-prog"></p>`);
  startGameTimer();
  renderClassify();
}
function renderClassify(){
  const it = GM.items[GM.i];
  const d = document.getElementById('cl-item');
  d.style.animation = 'none'; void d.offsetWidth; d.style.animation = '';
  d.textContent = t(it.t);
  document.getElementById('cl-prog').textContent = `${GM.i+1} / ${GM.items.length} · ✔ ${GM.correct}`;
}
function pickClass(k){
  const it = GM.items[GM.i];
  const d = document.getElementById('cl-item');
  if(it.k === k){ GM.correct++; d.style.borderColor = 'var(--green)'; }
  else { d.style.borderColor = 'var(--red)'; d.classList.add('bad'); setTimeout(()=>d.classList.remove('bad'),400); }
  setTimeout(()=>{
    d.style.borderColor = '';
    GM.i++;
    if(GM.i < GM.items.length) renderClassify();
    else {
      const secs = Math.floor((Date.now()-GM.t0)/1000);
      const score = Math.round(GM.correct/GM.items.length*100) - Math.max(0, Math.floor((secs-60)/10)*5);
      gameEnd(GM.g, Math.max(10,score), `${GM.correct}/${GM.items.length} — ${secs}s`);
    }
  }, 350);
}
