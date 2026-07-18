/* ============ interview simulator ============ */
'use strict';

let IV = null;

views.interview = (v)=>{
  const hasSR = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const hist = state.interviews.filter(h=>(h.role||'analyst')===state.role).slice(-5).reverse().map(h=>
    `<div class="row spread" style="padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px">
      <span class="muted">${h.date}</span><span>${h.mode}</span>
      <b style="color:${h.score>=70?'var(--green)':h.score>=50?'var(--amber)':'var(--red)'}">${h.score}/100</b>
    </div>`).join('');
  v.innerHTML = `
    <h1 class="hero">${state.lang==='tr'?'Mülakat <span class="g">Simülatörü</span>':'Interview <span class="g">Simulator</span>'}</h1>
    <p class="sub">${state.lang==='tr'
      ? 'Gerçek formatın birebir provası: Zara sana İngilizce soru sorar, sesli (veya yazılı) cevap verirsin, cevabındaki anahtar kelimeler takip sorusu tetikler, sekme değiştirirsen integrity puanın düşer, süre dolunca söz kesilir. Sonunda 100 üzerinden puan + kırılan puanların analizi + gelişim planı.'
      : 'A faithful rehearsal of the real format: Zara asks in English, you answer aloud (or typed), keywords in your answer trigger follow-ups, tab-switching drops your integrity score, and time cuts you off. At the end: a /100 score + where you lost points + an improvement plan.'}</p>

    <div class="grid g2 mt">
      <div class="card">
        <h3 class="mb">⚙️ ${state.lang==='tr'?'Kurulum':'Setup'}</h3>
        <p class="sub mb" style="font-size:13px">${state.lang==='tr'?'Mod seç:':'Choose mode:'}</p>
        <div class="row mb">
          <label class="check-item" style="flex:1"><input type="radio" name="iv-mode" value="full" checked> <span>${esc(t(IV_MODES.full.label))}</span></label>
        </div>
        <div class="row mb">
          <label class="check-item" style="flex:1"><input type="radio" name="iv-mode" value="quick"> <span>${esc(t(IV_MODES.quick.label))}</span></label>
        </div>
        <p class="sub mb" style="font-size:13px">${state.lang==='tr'?'Cevap şekli:':'Answer input:'}</p>
        <div class="row mb">
          <label class="check-item" style="flex:1"><input type="radio" name="iv-input" value="voice" ${hasSR?'checked':'disabled'}> <span>🎙 ${state.lang==='tr'?'Sesli (gerçeğe en yakın)':'Voice (closest to real)'} ${hasSR?'':'— Chrome/Edge '+(state.lang==='tr'?'gerekli':'required')}</span></label>
        </div>
        <div class="row mb">
          <label class="check-item" style="flex:1"><input type="radio" name="iv-input" value="typed" ${hasSR?'':'checked'}> <span>⌨️ ${state.lang==='tr'?'Yazılı (yedek)':'Typed (fallback)'}</span></label>
        </div>
        <button class="btn" style="width:100%" onclick="startIv()">▶ ${state.lang==='tr'?'Mülakatı Başlat':'Start Interview'}</button>
      </div>
      <div>
        <div class="card mb">
          <h3 class="mb">📜 ${state.lang==='tr'?'Kurallar (gerçekteki gibi)':'Rules (like the real thing)'}</h3>
          <ul style="font-size:13.5px;color:var(--dim);line-height:1.8;padding-left:18px">
            <li>${state.lang==='tr'?'Sekme/pencere değiştirme = integrity düşer':'Tab/window switching = integrity drops'}</li>
            <li>${state.lang==='tr'?'20+ sn sessizlik = uyarı (sesli düşün!)':'20+s of silence = warning (think aloud!)'}</li>
            <li>${state.lang==='tr'?'Süre dolunca cevap otomatik kesilir':'Answers are hard-cut when time runs out'}</li>
            <li>${state.lang==='tr'?'Yapıştırma kapalı (gerçek editördeki gibi)':'Paste is disabled (like the real editor)'}</li>
            <li>${state.lang==='tr'?'"Rephrase" butonu var — gerçekte de Zara\'dan isteyebilirsin':'A "rephrase" button exists — you can ask the real Zara too'}</li>
          </ul>
        </div>
        ${hist ? `<div class="card"><h3 class="mb">📈 ${state.lang==='tr'?'Geçmiş denemeler':'Past attempts'}</h3>${hist}</div>` : ''}
      </div>
    </div>`;
};

function pickQuestions(mode){
  const intro = IV_BANK.find(q=>q.id==='intro') || IV_BANK[0];
  const closer = IV_BANK.find(q=>q.cat==='EXERCISE');   // ends on the practical exercise
  const rest = IV_BANK.filter(q=>q!==intro && q!==closer);
  const tail = closer ? [closer] : [];
  if(mode==='full') return [intro, ...shuffle(rest), ...tail];
  const tech = shuffle(rest).slice(0, Math.max(1, IV_MODES.quick.n - 1 - tail.length));
  return [intro, ...tech, ...tail];
}

function startIv(){
  const mode = document.querySelector('input[name="iv-mode"]:checked').value;
  const input = document.querySelector('input[name="iv-input"]:checked')?.value || 'typed';
  IV = {
    mode, input, qs:pickQuestions(mode), i:0,
    phase:'main',              // main | followup
    records:[], integrity:100, integrityEvents:[],
    startedAt:Date.now(), qT0:0, qTimer:null, silenceTimer:null,
    rec:null, recOn:false, txt:'', lastSpeech:0, hintUsed:false, fuUsed:null
  };
  window._ivGuard = true;
  window._ivCleanup = cleanupIv;
  addEventListener('blur', ivBlur);
  document.addEventListener('visibilitychange', ivVis);
  renderIvStage();
  askCurrent();
}
function cleanupIv(){
  if(!IV) return;
  clearInterval(IV.qTimer); clearInterval(IV.silenceTimer);
  stopIvRec(); TTS.stop();
  removeEventListener('blur', ivBlur);
  document.removeEventListener('visibilitychange', ivVis);
  window._ivGuard = false;
}
function ivBlur(){ integrityHit(15, state.lang==='tr'?'Pencere odağı kaybedildi':'Window lost focus'); }
function ivVis(){ if(document.hidden) integrityHit(15, state.lang==='tr'?'Sekme değiştirildi':'Tab switched'); }
function integrityHit(n, why){
  if(!IV || !window._ivGuard) return;
  IV.integrity = Math.max(0, IV.integrity - n);
  IV.integrityEvents.push(why);
  const chip = document.getElementById('hud-int');
  if(chip){
    chip.textContent = `👁 ${IV.integrity}%`;
    chip.classList.add('warn');
    setTimeout(()=>{ if(IV.integrity>=70) chip.classList.remove('warn'); }, 2000);
  }
  toast(`⚠ ${why} — Integrity ${IV.integrity}%`, 'bad');
}

function renderIvStage(){
  const v = document.getElementById('view');
  v.className = 'view-enter';
  v.innerHTML = `
    <div class="iv-stage">
      <div class="card zara-panel" id="zara">
        <div class="zara-avatar">🧑‍💼</div>
        <div class="zara-name">Zara <span class="muted" style="font-weight:400">· micro1 AI</span></div>
        <div class="zara-status" id="zara-status"></div>
        <div class="iv-hud">
          <span class="hud-chip" id="hud-total">⏳ --:--</span>
          <span class="hud-chip" id="hud-q">Q --:--</span>
          <span class="hud-chip" id="hud-int">👁 ${IV.integrity}%</span>
        </div>
        <div class="iv-hud"><span class="iv-progress" id="hud-prog"></span></div>
      </div>
      <div>
        <div id="iv-fu"></div>
        <div class="iv-question" id="iv-q"></div>
        <div class="iv-hint" id="iv-hint" style="display:none"></div>
        <div class="card">
          <div class="transcript-box" id="iv-tx"></div>
          <textarea class="inp mt" id="iv-typed" rows="5" style="display:none" placeholder="${state.lang==='tr'?'Cevabını İngilizce yaz... (yapıştırma kapalı)':'Type your answer in English... (paste disabled)'}"></textarea>
          <div class="iv-controls">
            <button class="btn" id="iv-done" onclick="submitIvAnswer()">✔ ${state.lang==='tr'?'Cevabım Bitti':'Done Answering'}</button>
            <button class="btn ghost sm" onclick="ivRephrase()">🔁 Rephrase</button>
            <button class="btn ghost sm" onclick="ivHint()">💡 ${state.lang==='tr'?'İpucu':'Hint'}</button>
            <button class="btn danger sm" onclick="endIv(true)" style="margin-left:auto">⏹ ${state.lang==='tr'?'Bitir':'End'}</button>
          </div>
        </div>
      </div>
    </div>`;
  const ta = document.getElementById('iv-typed');
  ta.addEventListener('paste', e=>{
    e.preventDefault();
    toast(state.lang==='tr'?'📋 Yapıştırma kapalı — gerçek mülakattaki gibi!':'📋 Paste disabled — just like the real interview!','bad');
  });
  if(IV.input==='typed'){ ta.style.display='block'; document.getElementById('iv-tx').style.display='none'; }
}

function currentQ(){ return IV.qs[IV.i]; }

function askCurrent(){
  const q = currentQ();
  IV.txt=''; IV.hintUsed=false; IV.fuUsed=null; IV.phase='main';
  IV.qT0 = Date.now(); IV.lastSpeech = Date.now();
  document.getElementById('iv-fu').innerHTML = '';
  document.getElementById('iv-hint').style.display='none';
  document.getElementById('iv-q').innerHTML = `<span class="q-cat">${q.cat}</span>${esc(q.q)}`;
  document.getElementById('hud-prog').textContent = `${state.lang==='tr'?'Soru':'Question'} ${IV.i+1}/${IV.qs.length}`;
  const ta = document.getElementById('iv-typed'); if(ta) ta.value='';
  const tx = document.getElementById('iv-tx'); if(tx) tx.innerHTML = `<span class="muted">${state.lang==='tr'?'Zara konuşuyor...':'Zara is speaking...'}</span>`;
  speakAsZara(q.q, ()=>{ startAnswering(q.time); });
  startIvClock();
}
function speakAsZara(text, onend){
  const zp = document.getElementById('zara');
  const st = document.getElementById('zara-status');
  if(zp) zp.classList.add('speaking');
  if(st) st.textContent = state.lang==='tr'?'konuşuyor...':'speaking...';
  TTS.speak(text, ()=>{
    if(zp) zp.classList.remove('speaking');
    if(st) st.textContent = state.lang==='tr'?'seni dinliyor 👂':'listening to you 👂';
    if(onend) onend();
  });
}
function startAnswering(limit){
  IV.qLimit = limit;
  if(IV.input==='voice'){ startIvRec(); }
  const tx = document.getElementById('iv-tx');
  if(tx && IV.input==='voice') tx.innerHTML = `<span class="muted">${state.lang==='tr'?'Konuş — transkript burada akar...':'Speak — your transcript flows here...'}</span>`;
}
function startIvClock(){
  clearInterval(IV.qTimer);
  IV.qTimer = setInterval(()=>{
    if(!window._ivGuard){ clearInterval(IV.qTimer); return; }
    const totalLeft = IV_MODES[IV.mode].total - Math.floor((Date.now()-IV.startedAt)/1000);
    const qElapsed = Math.floor((Date.now()-IV.qT0)/1000);
    const qLeft = (IV.qLimit||120) - qElapsed;
    const ht = document.getElementById('hud-total'), hq = document.getElementById('hud-q');
    if(ht) ht.textContent = `⏳ ${fmtTime(Math.max(0,totalLeft))}`;
    if(hq){
      hq.textContent = `Q ${fmtTime(Math.max(0,qLeft))}`;
      hq.classList.toggle('warn', qLeft<=20 && qLeft>0);
    }
    if(qLeft===15) toast(state.lang==='tr'?'⏰ 15 sn — toparla! ("To summarize...")':'⏰ 15s — wrap up! ("To summarize...")');
    if(qLeft<=0){
      toast(state.lang==='tr'?'⏱ Süre doldu — Zara sonraki soruya geçti (gerçekte de böyle)':'⏱ Time up — Zara moved on (the real one does too)','bad');
      submitIvAnswer(true);
    }
    if(totalLeft<=0){ endIv(true); }
    /* silence detection (voice mode) */
    if(IV.input==='voice' && IV.recOn && Date.now()-IV.lastSpeech > 20000){
      IV.lastSpeech = Date.now();
      integrityHit(5, state.lang==='tr'?'20 sn sessizlik — sesli düşün!':'20s of silence — think aloud!');
    }
  }, 1000);
}
function startIvRec(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) return;
  stopIvRec();
  const rec = new SR();
  rec.lang='en-US'; rec.continuous=true; rec.interimResults=true;
  rec.onresult=(e)=>{
    let interim='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(e.results[i].isFinal) IV.txt += e.results[i][0].transcript+' ';
      else interim += e.results[i][0].transcript;
    }
    IV.lastSpeech = Date.now();
    const d=document.getElementById('iv-tx');
    if(d) d.innerHTML = esc(IV.txt)+`<span class="interim">${esc(interim)}</span>`;
    d && (d.scrollTop = d.scrollHeight);
  };
  rec.onerror=(e)=>{
    if(e.error==='not-allowed'){
      toast(state.lang==='tr'?'🎙 Mikrofon izni yok — yazılı moda geç':'🎙 No mic permission — switch to typed','bad');
      IV.input='typed';
      const ta=document.getElementById('iv-typed'); if(ta) ta.style.display='block';
      const tx=document.getElementById('iv-tx'); if(tx) tx.style.display='none';
    }
  };
  rec.onend=()=>{ if(IV && IV.recOn && window._ivGuard){ try{rec.start();}catch(e){} } };
  IV.rec = rec; IV.recOn = true;
  try{ rec.start(); }catch(e){}
}
function stopIvRec(){
  if(IV && IV.rec){ IV.recOn=false; try{IV.rec.stop();}catch(e){} IV.rec=null; }
}
function ivHint(){
  IV.hintUsed = true;
  const h = document.getElementById('iv-hint');
  h.style.display='block';
  h.textContent = '💡 ' + t(currentQ().hint);
}
function ivRephrase(){
  const q = currentQ();
  speakAsZara(`Of course. Let me put it differently. ${q.q}`, null);
  toast(state.lang==='tr'?'ℹ Gerçek mülakatta da Zara\'dan rephrase isteyebilirsin — doğrulanmış.':'ℹ You can ask the real Zara to rephrase too — verified.');
}

function grabAnswer(){
  const typed = document.getElementById('iv-typed');
  let ans = IV.input==='typed' ? (typed?typed.value:'') : IV.txt;
  return (ans||'').trim();
}
function submitIvAnswer(auto){
  clearInterval(IV.qTimer);
  stopIvRec(); TTS.stop();
  const q = currentQ();
  const ans = grabAnswer();
  const secs = Math.round((Date.now()-IV.qT0)/1000);
  if(IV.phase==='main'){
    IV.currentRecord = {id:q.id, cat:q.cat, q:q.q, answer:ans, secs, hintUsed:IV.hintUsed, fuQ:null, fuAnswer:null, cut:!!auto};
    /* adaptive follow-up? */
    const low = ans.toLowerCase();
    const fu = (q.fu||[]).find(f=>f.trig.some(tg=>low.includes(tg)));
    if(fu && ans.length>30){
      IV.phase='followup'; IV.fuUsed=fu;
      IV.currentRecord.fuQ = fu.q;
      IV.txt=''; const ta=document.getElementById('iv-typed'); if(ta) ta.value='';
      document.getElementById('iv-fu').innerHTML = `<div class="followup-flash">⚡ ${state.lang==='tr'?'Adaptif takip sorusu — cevabındaki bir anahtar kelime bunu tetikledi (gerçekte de aynen böyle olur):':'Adaptive follow-up — a keyword in your answer triggered this (exactly like the real thing):'}</div>`;
      document.getElementById('iv-q').innerHTML = `<span class="q-cat">${q.cat} · FOLLOW-UP</span>${esc(fu.q)}`;
      IV.qT0 = Date.now(); IV.qLimit = 90; IV.lastSpeech = Date.now();
      const tx=document.getElementById('iv-tx'); if(tx) tx.innerHTML=`<span class="muted">...</span>`;
      speakAsZara(fu.q, ()=>{ if(IV.input==='voice') startIvRec(); });
      startIvClock();
      return;
    }
    IV.records.push(IV.currentRecord);
  } else {
    IV.currentRecord.fuAnswer = ans;
    IV.records.push(IV.currentRecord);
  }
  IV.i++;
  if(IV.i < IV.qs.length){ askCurrent(); }
  else endIv(false);
}

/* ---------- scoring ---------- */
function analyzeRecord(r){
  const bank = IV_BANK.find(q=>q.id===r.id);
  const full = ((r.answer||'') + ' ' + (r.fuAnswer||'')).toLowerCase();
  const words = full.split(/\s+/).filter(Boolean);
  const kwHits = bank.kw.map(group=>({group, hit:group.some(k=>full.includes(k))}));
  const tech = Math.round(kwHits.filter(k=>k.hit).length / bank.kw.length * 100);
  const structHits = IV_STRUCT.map(s=>({s, hit:s.words.some(w=>full.includes(w))}));
  const struct = Math.round(structHits.filter(x=>x.hit).length / IV_STRUCT.length * 100);
  const fillers = IV_FILLERS.reduce((n,f)=> n + (full.split(f).length-1), 0);
  const hasExample = IV_EXP_WORDS.some(w=>full.includes(w));
  let lenScore = 100;
  if(words.length < 25) lenScore = 25;
  else if(words.length < 50) lenScore = 60;
  else if(words.length > 300) lenScore = 60;
  return {tech, struct, kwHits, structHits, fillers, hasExample, wordCount:words.length, lenScore};
}
function endIv(early){
  cleanupIv();
  const answered = IV.records.filter(r=>(r.answer||'').length>0);
  if(!answered.length){
    toast(state.lang==='tr'?'Hiç cevap kaydedilmedi':'No answers recorded','bad');
    IV=null; go('interview'); return;
  }
  const analyses = IV.records.map(r=>({r, a:analyzeRecord(r)}));
  const avg = (arr)=> arr.length? Math.round(arr.reduce((s,x)=>s+x,0)/arr.length) : 0;
  const techAvg = avg(analyses.map(x=>x.a.tech));
  const structAvg = avg(analyses.map(x=>x.a.struct));
  const lenAvg = avg(analyses.map(x=>x.a.lenScore));
  const totalFillers = analyses.reduce((s,x)=>s+x.a.fillers,0);
  const fillerPen = Math.min(40, totalFillers*3);
  const commScore = Math.max(0, Math.round(lenAvg*0.7 + 30 - fillerPen));
  const exampleScore = Math.round(analyses.filter(x=>x.a.hasExample).length / analyses.length * 100);
  const integrity = IV.integrity;
  const unanswered = IV.qs.length - IV.records.length;
  const coveragePen = Math.round(unanswered / IV.qs.length * 30);
  const total = Math.max(0, Math.round(
    techAvg*0.45 + structAvg*0.20 + commScore*0.15 + exampleScore*0.10 + integrity*0.10
  ) - coveragePen);
  const result = {date:new Date().toLocaleString(state.lang==='tr'?'tr-TR':'en-US',{dateStyle:'short',timeStyle:'short'}),
    role:state.role, mode:IV.mode, score:total, tech:techAvg, struct:structAvg, comm:commScore, ex:exampleScore, integrity};
  state.interviews.push(result);
  if(state.interviews.length>10) state.interviews = state.interviews.slice(-10);
  save();
  addXP(Math.max(10, Math.round(total/4)), state.lang==='tr'?'mülakat tamamlandı':'interview complete');
  if(total>=70) confetti.fire(160);
  renderIvReport(total, {techAvg, structAvg, commScore, exampleScore, integrity, totalFillers, unanswered, early}, analyses);
  IV=null;
}

function catBar(lbl, val, color){
  return `<div class="score-cat">
    <span class="sc-lbl">${lbl}</span>
    <div class="pbar" style="flex:1"><i style="width:${val}%;${color?'background:'+color:''}"></i></div>
    <span class="sc-val">${val}</span>
  </div>`;
}
function renderIvReport(total, s, analyses){
  const v = document.getElementById('view');
  const tr = state.lang==='tr';
  /* improvement plan: weakest categories */
  const cats = [
    {k:'tech', v:s.techAvg, lbl:tr?'Teknik doğruluk':'Technical accuracy', w:'45%',
     tip:tr?'Cevaplarında beklenen anahtar kavramlar eksik kaldı. Aşağıdaki soru kartlarında "kaçırdıkların" kısmına bak, ilgili modülü tekrar et.':'Expected key concepts were missing. Check the "missed" chips in the question cards below and replay the related module.',
     act:{lbl:tr?'Modüllere git':'Go to modules', view:'learn'}},
    {k:'struct', v:s.structAvg, lbl:tr?'Yapı (5 sinyal)':'Structure (5 signals)', w:'20%',
     tip:tr?'Direkt giriş → sıralı adımlar (first/then/finally) → gerekçe (because) → örnek (for example) → sonuç/trade-off. Bu 5 sinyali her cevaba yerleştir — puanlama algoritması yapıyı doğruluktan çok ödüllendiriyor.':'Direct opening → sequenced steps (first/then/finally) → reasoning (because) → example (for example) → outcome/trade-off. Plant all 5 signals in every answer — the scoring rewards structure heavily.',
     act:{lbl:tr?'Kalıpları çalış':'Study phrases', view:'english'}},
    {k:'comm', v:s.commScore, lbl:tr?'İletişim':'Communication', w:'15%',
     tip:tr?`Hedef 50-250 kelime/cevap (1-2,5 dk). Dolgu kelime sayın: ${s.totalFillers}. Uzun cevap dağılır ve kesilir; kısa cevap yüzeysel kalır.`:`Target 50-250 words per answer (1-2.5 min). Your filler count: ${s.totalFillers}. Long answers drift and get cut; short ones feel shallow.`,
     act:{lbl:tr?'Konuşma pratiği':'Speaking drills', view:'english'}},
    {k:'ex', v:s.exampleScore, lbl:tr?'Somut örnekler':'Concrete examples', w:'10%',
     tip:tr?'Cevaplarını deneyimine bağla: "in my internship at Cyber4...", "when I deployed 100+ machines...". Örneksiz cevap ezber gibi durur.':'Anchor answers in your experience: "in my internship at Cyber4...", "when I deployed 100+ machines...". Answers without examples sound memorized.',
     act:{lbl:tr?'Hikaye bankası':'Story bank', view:'stories'}},
    {k:'int', v:s.integrity, lbl:'Integrity', w:'10%',
     tip:tr?'Sekme değiştirme / odak kaybı / uzun sessizlik yaşandı. Gerçekte %70 altı otomatik elenme söylentisi var — tüm bildirimleri kapat, tek ekran, telefon başka odada.':'Tab switches / focus loss / long silence occurred. Rumor says below 70% is an auto-fail in the real one — kill notifications, single screen, phone in another room.',
     act:{lbl:tr?'Kurulum listesi':'Setup checklist', view:'intel'}}
  ];
  const weakest = cats.filter(c=>c.v<75).sort((a,b)=>a.v-b.v).slice(0,3);
  const verdict = total>=80 ? (tr?'Hazırsın gibi görünüyor — bir tam prova daha yap ve gir.':'You look ready — one more full rehearsal, then go.')
    : total>=60 ? (tr?'İyi yoldasın. Aşağıdaki 2-3 zayıf alanı çalışıp yarın tekrar dene.':'On track. Work the 2-3 weak areas below and retry tomorrow.')
    : (tr?'Henüz riskli. Önce modülleri bitir, hikayeleri sesli prova et, sonra tekrar simüle et.':'Still risky. Finish the modules, rehearse your stories aloud, then simulate again.');

  const qCards = analyses.map(({r,a},i)=>{
    const kwHit = a.kwHits.filter(k=>k.hit).map(k=>`<span class="kw hit">${esc(k.group[0])}</span>`).join('');
    const kwMiss = a.kwHits.filter(k=>!k.hit).map(k=>`<span class="kw miss">${esc(k.group[0])}</span>`).join('');
    const structMiss = a.structHits.filter(x=>!x.hit).map(x=>t(x.s.lbl)).join(', ');
    const bank = IV_BANK.find(q=>q.id===r.id);
    return `<details class="report-q">
      <summary><span>${i+1}. [${r.cat}] ${esc(r.q.slice(0,70))}${r.q.length>70?'…':''}</span>
        <b style="color:${a.tech>=60?'var(--green)':a.tech>=35?'var(--amber)':'var(--red)'}">${a.tech}%</b></summary>
      <div class="rq-body">
        ${r.cut?`<p class="muted">⏱ ${tr?'Süre dolduğu için kesildi':'Cut off by the timer'}</p>`:''}
        ${r.hintUsed?`<p class="muted">💡 ${tr?'İpucu kullanıldı':'Hint used'}</p>`:''}
        <p><b>${tr?'Cevabın':'Your answer'}</b> (${a.wordCount} ${tr?'kelime':'words'}, ${r.secs}s): <i>${esc((r.answer||'—').slice(0,400))}${(r.answer||'').length>400?'…':''}</i></p>
        ${r.fuQ?`<p class="mt"><b>⚡ Follow-up:</b> ${esc(r.fuQ)}<br><i>${esc((r.fuAnswer||'—').slice(0,250))}</i></p>`:''}
        <p class="mt"><b>${tr?'Yakaladıkların':'You covered'}:</b> ${kwHit||'—'}</p>
        <p><b>${tr?'Kaçırdıkların':'You missed'}:</b> ${kwMiss||'✨ '+(tr?'hiçbir şey!':'nothing!')}</p>
        ${structMiss?`<p><b>${tr?'Eksik yapı sinyalleri':'Missing structure signals'}:</b> ${structMiss}</p>`:''}
        <div class="model-ans"><b>🏆 ${tr?'Örnek güçlü cevap':'Model strong answer'}:</b><br>${esc(bank.model)}</div>
      </div>
    </details>`;
  }).join('');

  v.className = 'view-enter';
  v.innerHTML = `
    <div class="card score-ring-wrap">
      <p class="muted">${tr?'MÜLAKAT SONUCU':'INTERVIEW RESULT'}${s.early?(tr?' (erken bitirildi)':' (ended early)'):''}</p>
      <div class="score-big">${total}<span style="font-size:24px;color:var(--faint)">/100</span></div>
      <p class="sub center mt" style="margin:10px auto">${verdict}</p>
      ${s.unanswered>0?`<p class="muted">${tr?'Cevaplanmayan soru':'Unanswered questions'}: ${s.unanswered} (−${Math.round(s.unanswered/(analyses.length+s.unanswered)*30)} ${tr?'puan':'pts'})</p>`:''}
    </div>
    <h2 class="sect">📊 ${tr?'Puan kırılımı':'Score breakdown'}</h2>
    <div class="card">
      ${cats.map(c=>catBar(`${c.lbl} <span class="muted">(${c.w})</span>`, c.v)).join('')}
    </div>
    <h2 class="sect">🛠 ${tr?'Gelişim planın':'Your improvement plan'}</h2>
    ${weakest.length? weakest.map(c=>`
      <div class="tip-card"><b>${c.lbl} — ${c.v}/100:</b> ${c.tip}
        <div class="mt"><button class="btn sm" onclick="go('${c.act.view}')">${c.act.lbl} →</button></div>
      </div>`).join('')
      : `<div class="tip-card"><b>💪</b> ${tr?'Tüm kategoriler 75+. Son dokunuş: gerçek mülakattan önce micro1\'in kendi Interview Prep aracını da dene.':'All categories 75+. Final touch: also try micro1\'s official Interview Prep tool before the real one.'}</div>`}
    <h2 class="sect">🔎 ${tr?'Soru soru analiz':'Question-by-question analysis'}</h2>
    ${qCards}
    <div class="row mt" style="justify-content:center">
      <button class="btn ghost" onclick="go('interview')">↻ ${tr?'Yeni Simülasyon':'New Simulation'}</button>
      <button class="btn" onclick="go('home')">${tr?'Ana Üs':'Home'}</button>
    </div>`;
  scrollTo({top:0});
}
