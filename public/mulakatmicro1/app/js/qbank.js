/* ============ question bank: study mode + flashcard drill ============ */
'use strict';

/* QB_CATS is provided per-role by roles.js (let QB_CATS) */
function qbState(){
  if(!state.qbank) state.qbank = {mastery:{}, studied:{}};
  if(!state.qbank.mastery) state.qbank.mastery = {};
  if(!state.qbank.studied) state.qbank.studied = {};
  return state.qbank;
}
function qbMastery(id){ return qbState().mastery[id] || 0; }   /* 0 new · 1 shaky · 2 known · 3 solid */
function qbCatStats(cat){
  const qs = QBANK.filter(q=>q.cat===cat);
  if(!qs.length) return {n:0, pct:0, solid:0};
  const sum = qs.reduce((s,q)=>s+qbMastery(q.id),0);
  return {n:qs.length, pct:Math.round(sum/(qs.length*3)*100), solid:qs.filter(q=>qbMastery(q.id)>=2).length};
}

/* ---------- landing ---------- */
views.qbank = (v)=>{
  qbState();
  const tr = state.lang==='tr';
  const total = QBANK.length;
  const solid = QBANK.filter(q=>qbMastery(q.id)>=2).length;
  const catCards = Object.keys(QB_CATS).map(c=>{
    const s = qbCatStats(c);
    if(!s.n) return '';
    return `<div class="card click" onclick="qbStudy('${c}')">
      <div class="row spread"><h3 style="font-size:15px">${QB_CATS[c].ico} ${esc(t(QB_CATS[c].lbl))}</h3><span class="badge ${s.pct>=66?'gr':s.pct>=33?'am':''}">${s.solid}/${s.n}</span></div>
      <div class="pbar thin mt"><i style="width:${s.pct}%"></i></div>
    </div>`;
  }).join('');
  v.innerHTML = `
    <h1 class="hero">${tr?'Soru <span class="g">Bankası</span>':'Q&A <span class="g">Bank</span>'}</h1>
    <p class="sub">${tr
      ? `İnternetteki gerçek mülakat sorularından derlenen ${total} soru + örnek güçlü cevap. Önce <b>Ders</b> modunda oku, sonra <b>Pratik</b> modunda bilene kadar tekrar et — bilemediklerin otomatik geri gelir.`
      : `${total} questions + strong model answers compiled from real interviews online. Read in <b>Study</b> mode first, then loop <b>Drill</b> mode until mastered — misses come back automatically.`}</p>
    <div class="row mt" style="gap:12px">
      <div class="card" style="flex:1;min-width:220px">
        <h3>📗 ${tr?'Ders Modu':'Study Mode'}</h3>
        <p class="sub mt" style="font-size:13px">${tr?'Soru + örnek cevabı kategorilere göre oku. Her kartta TR ipucu ve sesli dinleme var.':'Read Q + model answer by category. TR hint and audio on every card.'}</p>
        <button class="btn mt" onclick="qbStudy()">${tr?'Derse Başla':'Start Studying'} →</button>
      </div>
      <div class="card" style="flex:1;min-width:220px">
        <h3>⚡ ${tr?'Pratik Modu':'Drill Mode'}</h3>
        <p class="sub mt" style="font-size:13px">${tr?'Flashcard turu: soruyu gör → sesli cevapla → aç → kendini puanla. Bilemediklerin destede kalır.':'Flashcard rounds: see it → answer aloud → reveal → rate yourself. Misses stay in the deck.'}</p>
        <button class="btn mt" onclick="qbDrillSetup()">${tr?'Pratiğe Başla':'Start Drilling'} →</button>
      </div>
    </div>
    <h2 class="sect">📊 ${tr?'Kategori hakimiyetin':'Category mastery'} <span class="badge cy">${solid}/${total} ${tr?'oturdu':'solid'}</span></h2>
    <div class="grid g3 stagger">${catCards}</div>`;
};

/* ---------- study mode ---------- */
views.qbstudy = (v, cat)=>{
  const tr = state.lang==='tr';
  qbState();
  const cats = Object.keys(QB_CATS).filter(c=>QBANK.some(q=>q.cat===c));
  cat = cat && cats.includes(cat) ? cat : cats[0];
  const qs = QBANK.filter(q=>q.cat===cat);
  const tabs = cats.map(c=>`<button class="tab ${c===cat?'active':''}" onclick="qbStudy('${c}')">${QB_CATS[c].ico} ${esc(t(QB_CATS[c].lbl))} <span class="muted">${QBANK.filter(q=>q.cat===c).length}</span></button>`).join('');
  const cards = qs.map((q,i)=>{
    const m = qbMastery(q.id);
    const mBadge = m>=3?'<span class="badge gr">★ solid</span>':m===2?'<span class="badge gr">✓</span>':m===1?'<span class="badge am">~</span>':'';
    return `<div class="lesson ${qbState().studied[q.id]?'done':''}" id="qb-${q.id}">
      <div class="l-head" onclick="qbToggle('${q.id}')">
        <span class="l-ico">${i+1}.</span><span class="l-title">${esc(q.q)}</span>${mBadge}
        ${q.diff==='hard'?'<span class="badge rd">hard</span>':q.diff==='easy'?'<span class="badge">easy</span>':''}
      </div>
      <div class="l-body"><div class="l-inner">
        <div class="say-en">${esc(q.a)}<button class="tts-btn" onclick="event.stopPropagation();TTS.speak(QBANK.find(x=>x.id==='${q.id}').a)">▶ ${tr?'Dinle':'Listen'}</button></div>
        ${q.tr?`<p class="mt" style="font-size:13px">💡 <b>${tr?'İpucu':'Hint'}:</b> ${esc(q.tr)}</p>`:''}
        ${q.src?`<p class="muted mt" style="font-size:11.5px">${tr?'Kaynak':'Source'}: ${esc(q.src)}</p>`:''}
      </div></div>
    </div>`;
  }).join('');
  v.innerHTML = `
    <button class="btn ghost sm" onclick="go('qbank')">← ${tr?'Soru Bankası':'Q&A Bank'}</button>
    <h1 class="hero mt" style="font-size:26px">📗 ${tr?'Ders Modu':'Study Mode'} — ${QB_CATS[cat].ico} ${esc(t(QB_CATS[cat].lbl))}</h1>
    <p class="sub mb">${tr?'Karta tıkla → cevabı oku → sesli dinle. Okuduğun kart "çalışıldı" sayılır. Sonra Pratik moduna geç.':'Click a card → read the answer → listen. Opened cards count as studied. Then switch to Drill mode.'}</p>
    <div class="tabs">${tabs}</div>
    <div>${cards}</div>
    <div class="card center mt">
      <button class="btn" onclick="qbDrillSetup('${cat}')">⚡ ${tr?'Bu kategoriyi pratik et':'Drill this category'} →</button>
    </div>`;
};
function qbStudy(cat){ go('qbstudy', cat); }
function qbToggle(id){
  const d = document.getElementById('qb-'+id);
  d.classList.toggle('open');
  const st = qbState();
  if(d.classList.contains('open') && !st.studied[id]){
    st.studied[id] = true; save();
    d.classList.add('done');
    const n = Object.keys(st.studied).length;
    if(n % 10 === 0){ addXP(10, state.lang==='tr'?n+' soru çalışıldı!':n+' questions studied!'); }
  }
}

/* ---------- drill mode ---------- */
let DR = null;
function qbDrillSetup(cat){
  const tr = state.lang==='tr';
  const v = document.getElementById('view');
  const cats = Object.keys(QB_CATS).filter(c=>QBANK.some(q=>q.cat===c));
  v.className = 'view-enter';
  v.innerHTML = `
    <button class="btn ghost sm" onclick="go('qbank')">← ${tr?'Soru Bankası':'Q&A Bank'}</button>
    <div class="card mt" style="max-width:640px;margin:16px auto">
      <h3 class="mb">⚡ ${tr?'Pratik turu kur':'Set up your drill'}</h3>
      <p class="sub mb" style="font-size:13px">${tr?'Kategoriler:':'Categories:'}</p>
      <div class="row mb" id="dr-cats">
        ${cats.map(c=>`<label class="check-item" style="padding:7px 12px"><input type="checkbox" value="${c}" ${!cat||cat===c?'checked':''}> ${QB_CATS[c].ico} ${esc(t(QB_CATS[c].lbl))}</label>`).join('')}
      </div>
      <p class="sub mb" style="font-size:13px">${tr?'Deste boyutu:':'Deck size:'}</p>
      <div class="row mb" id="dr-size">
        <label class="check-item" style="padding:7px 12px"><input type="radio" name="drsz" value="10" checked> 10</label>
        <label class="check-item" style="padding:7px 12px"><input type="radio" name="drsz" value="20"> 20</label>
        <label class="check-item" style="padding:7px 12px"><input type="radio" name="drsz" value="999"> ${tr?'Hepsi':'All'}</label>
      </div>
      <p class="sub mb" style="font-size:12.5px">${tr?'Sıralama: önce hiç görmediğin ve bilemediğin sorular gelir. "Bilemedim" dediklerin desteye geri döner.':'Ordering: unseen and shaky questions come first. "Missed" cards return to the deck.'}</p>
      <button class="btn" style="width:100%" onclick="qbDrillStart()">▶ ${tr?'Başlat':'Start'}</button>
    </div>`;
}
function qbDrillStart(){
  const cats = [...document.querySelectorAll('#dr-cats input:checked')].map(i=>i.value);
  const size = +document.querySelector('input[name="drsz"]:checked').value;
  let pool = QBANK.filter(q=>cats.includes(q.cat));
  if(!pool.length){ toast(state.lang==='tr'?'Kategori seç!':'Pick a category!','bad'); return; }
  /* weakest-first: mastery asc, then shuffle within tiers */
  pool = shuffle(pool).sort((a,b)=>qbMastery(a.id)-qbMastery(b.id)).slice(0, size);
  DR = {queue:pool.slice(), i:0, total:pool.length, firstTry:{}, done:0, revealed:false, t0:Date.now()};
  qbDrillCard();
}
function qbDrillCard(){
  const tr = state.lang==='tr';
  if(!DR.queue.length){ qbDrillEnd(); return; }
  const q = DR.queue[0];
  DR.revealed = false;
  const v = document.getElementById('view');
  const m = qbMastery(q.id);
  v.className = 'view-enter';
  v.innerHTML = `
    <div style="max-width:720px;margin:0 auto">
      <div class="q-top">
        <span class="badge vi">⚡ ${DR.done}/${DR.total} ${tr?'tamam':'done'} · ${DR.queue.length} ${tr?'destede':'in deck'}</span>
        <span class="badge">${QB_CATS[q.cat].ico} ${esc(t(QB_CATS[q.cat].lbl))}</span>
        <button class="btn ghost sm" onclick="go('qbank')">✕</button>
      </div>
      <div class="pbar thin mb"><i style="width:${Math.round(DR.done/DR.total*100)}%"></i></div>
      <div class="card">
        <div class="q-question">${esc(q.q)}</div>
        <p class="muted" style="font-size:12.5px">${m===0?(tr?'🆕 yeni soru':'🆕 new'):m===1?(tr?'🔁 tekrar':'🔁 review'):(tr?'✓ pekiştirme':'✓ reinforce')} · ${tr?'Önce SESLİ cevapla, sonra aç':'Answer ALOUD first, then reveal'}</p>
        <div class="row mt">
          <button class="tts-btn" onclick="TTS.speak(DR.queue[0].q)">🔊 ${tr?'Soruyu dinle':'Hear question'}</button>
        </div>
        <div id="dr-answer" class="mt" style="display:none">
          <div class="say-en">${esc(q.a)}<button class="tts-btn" onclick="TTS.speak(DR.queue[0].a)">▶</button></div>
          ${q.tr?`<p class="mt" style="font-size:13px;color:var(--dim)">💡 ${esc(q.tr)}</p>`:''}
        </div>
        <div class="iv-controls" id="dr-btns">
          <button class="btn" onclick="qbReveal()">👁 ${tr?'Cevabı Göster':'Reveal Answer'}</button>
        </div>
      </div>
    </div>`;
}
function qbReveal(){
  if(DR.revealed) return;
  DR.revealed = true;
  const tr = state.lang==='tr';
  document.getElementById('dr-answer').style.display = 'block';
  document.getElementById('dr-btns').innerHTML = `
    <button class="btn danger sm" onclick="qbRate(0)">❌ ${tr?'Bilemedim':'Missed it'}</button>
    <button class="btn ghost sm" onclick="qbRate(1)">🟡 ${tr?'Kısmen':'Partially'}</button>
    <button class="btn sm" onclick="qbRate(2)">✅ ${tr?'Bildim':'Got it'}</button>`;
}
function qbRate(r){
  const st = qbState();
  const q = DR.queue.shift();
  if(!(q.id in DR.firstTry)) DR.firstTry[q.id] = r;
  const cur = qbMastery(q.id);
  if(r===2){
    st.mastery[q.id] = Math.min(3, Math.max(2, cur+1));
    DR.done++;
    addXP(cur===0?4:2);
  } else if(r===1){
    st.mastery[q.id] = 1;
    DR.queue.splice(Math.min(3, DR.queue.length), 0, q);   /* comes back soon */
  } else {
    st.mastery[q.id] = 0;
    DR.queue.splice(Math.min(2, DR.queue.length), 0, q);   /* comes back sooner */
  }
  save();
  qbDrillCard();
}
function qbDrillEnd(){
  const tr = state.lang==='tr';
  const secs = Math.round((Date.now()-DR.t0)/1000);
  const first = Object.values(DR.firstTry);
  const acc = first.length ? Math.round(first.filter(x=>x===2).length/first.length*100) : 0;
  /* weakest cats in this session */
  const missCats = {};
  Object.entries(DR.firstTry).forEach(([id,r])=>{
    if(r<2){ const q = QBANK.find(x=>x.id===id); if(q) missCats[q.cat]=(missCats[q.cat]||0)+1; }
  });
  const weak = Object.entries(missCats).sort((a,b)=>b[1]-a[1]).slice(0,2)
    .map(([c,n])=>`${QB_CATS[c].ico} ${t(QB_CATS[c].lbl)} (${n})`).join(', ');
  if(acc>=80) confetti.fire(120);
  addXP(Math.max(5, Math.round(acc/5)), tr?'pratik turu bitti':'drill complete');
  const v = document.getElementById('view');
  v.innerHTML = `
    <div class="card result-panel" style="max-width:560px;margin:40px auto">
      <span class="r-emoji">${acc>=80?'🏆':acc>=50?'🎉':'🔁'}</span>
      <div class="score-big">${acc}%</div>
      <p class="sub center" style="margin:8px auto">${tr?'ilk denemede bilme oranı':'first-try accuracy'} · ${DR.total} ${tr?'kart':'cards'} · ${fmtTime(secs)}</p>
      ${weak?`<p class="sub center" style="margin:0 auto 8px">🎯 ${tr?'Zayıf alanların':'Weak spots'}: ${weak}</p>`:''}
      <p class="sub center" style="margin:0 auto 16px">${acc>=80
        ? (tr?'Bu deste oturdu. Yeni deste al veya simülatöre geç.':'This deck is solid. Grab a new deck or hit the simulator.')
        : (tr?'Aynı desteyi bir daha dön — bilemediklerin önce gelecek.':'Run the deck again — misses come first next time.')}</p>
      <div class="row" style="justify-content:center">
        <button class="btn ghost" onclick="qbDrillSetup()">↻ ${tr?'Yeni Tur':'New Round'}</button>
        <button class="btn" onclick="go('qbank')">${tr?'Soru Bankası':'Q&A Bank'}</button>
      </div>
    </div>`;
  DR = null;
}
