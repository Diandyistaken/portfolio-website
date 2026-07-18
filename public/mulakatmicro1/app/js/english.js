/* ============ english practice: phrases, listening, speaking drill ============ */
'use strict';

const ENG_PHRASES = [
  {en:`Let me answer that directly, and then give a concrete example.`, tr:`Buna önce direkt cevap vereyim, sonra somut bir örnek vereceğim.`, tag:'opener'},
  {en:`My first step would be to validate the alert against the raw logs.`, tr:`İlk adımım, alert'i ham loglarla doğrulamak olur.`, tag:'threat'},
  {en:`The trade-off here is speed versus the risk of blocking legitimate traffic.`, tr:`Buradaki denge, hız ile meşru trafiği engelleme riski arasında.`, tag:'reasoning'},
  {en:`In my internship at Cyber4 Intelligence, I worked on the threat intelligence side.`, tr:`Cyber4 Intelligence stajımda tehdit istihbaratı tarafında çalıştım.`, tag:'story'},
  {en:`I would isolate the host from the network, but I would not power it off, to preserve volatile evidence.`, tr:`Makineyi ağdan izole ederim ama uçucu delilleri korumak için kapatmam.`, tag:'ir'},
  {en:`Could you please rephrase the question?`, tr:`Soruyu yeniden ifade edebilir misiniz? (Zara'ya bunu SORABİLİRSİN — doğrulanmış!)`, tag:'lifeline'},
  {en:`I'm currently thinking through two options: the first one is...`, tr:`Şu an iki seçeneği değerlendiriyorum: birincisi... (sessiz kalma, böyle doldur)`, tag:'lifeline'},
  {en:`As a result, we finished on schedule with a consistent, hardened setup.`, tr:`Sonuç olarak, tutarlı ve sıkılaştırılmış bir kurulumla zamanında bitirdik.`, tag:'outcome'},
  {en:`To summarize my approach: validate, scope, contain, and document everything.`, tr:`Yaklaşımımı özetlersem: doğrula, kapsa, çevrele ve her şeyi belgele.`, tag:'closer'},
  {en:`That's not a tool I've used hands-on yet, but the concept I'd apply is...`, tr:`O aracı henüz elle kullanmadım ama uygulayacağım kavram şu... (bilmediğinde dürüst köprü)`, tag:'lifeline'},
];

const ENG_LISTEN = [
  `A false positive wastes analyst time, but a false negative means a real breach goes unnoticed.`,
  `Containment limits the spread, while eradication removes the root cause.`,
  `I would check the source IP against threat intelligence before blocking it.`,
  `Ransomware often enters through phishing emails or exposed remote desktop services.`,
  `Segmentation limits lateral movement inside the network.`,
  `Prompt injection hides malicious instructions inside the data a model reads.`,
];

const ENG_SPEAK = [
  {q:`Introduce yourself in English as if Zara just asked "Tell me about yourself".`, tr:'60-90 saniye hedefle. Staj → operasyon → motivasyon.'},
  {q:`Explain the difference between an IDS and an IPS, out loud.`, tr:'Detect/alert vs inline/block + trade-off cümlesi.'},
  {q:`Describe your first three steps when a SIEM alert fires.`, tr:'Validate → scope → context. Sıralı bağlaçları kullan: first, then, finally.'},
  {q:`Walk through the ransomware response like you're briefing your manager.`, tr:'Isolate → scope → escalate → evidence → eradicate → restore → lessons.'},
];

views.english = (v, tab)=>{
  tab = tab || 'phrases';
  const tabs = [['phrases', state.lang==='tr'?'Kalıplar':'Phrases'], ['listen', state.lang==='tr'?'Dinleme':'Listening'], ['speak', state.lang==='tr'?'Konuşma':'Speaking']];
  v.innerHTML = `
    <h1 class="hero">${state.lang==='tr'?'İngilizce <span class="g">Antrenman</span>':'English <span class="g">Training</span>'}</h1>
    <p class="sub">${state.lang==='tr'
      ? 'Mülakat İngilizce. Mükemmel aksan değil, net ve yapılı anlatım puanlanıyor. Skorlama transkript üzerinden yapıldığı için anlaşılır konuşmak kritik.'
      : 'The interview is in English. Clear, structured delivery is what scores — not a perfect accent. Scoring runs on transcription, so clarity is critical.'}</p>
    <div class="tabs mt">${tabs.map(([id,lbl])=>`<button class="tab ${tab===id?'active':''}" onclick="go('english','${id}')">${lbl}</button>`).join('')}</div>
    <div id="eng-body"></div>`;
  const b = document.getElementById('eng-body');
  if(tab==='phrases') renderPhrases(b);
  else if(tab==='listen') renderListen(b);
  else renderSpeak(b);
};

function renderPhrases(b){
  b.innerHTML = `<p class="sub mb">${state.lang==='tr'
    ? '🎯 Bu 10 kalıbı ezberle — cevaplarının iskeleti bunlar. "Lifeline" etiketlileri zor anlar için: sessiz kalmak yerine bunları söyle.'
    : '🎯 Memorize these 10 phrases — they are the skeleton of your answers. The "lifeline" ones are for hard moments: say these instead of going silent.'}</p>
    <div class="grid g2 stagger">` +
    ENG_PHRASES.map((p,i)=>`
      <div class="card phrase-card">
        <span class="badge ${p.tag==='lifeline'?'am':'cy'}" style="margin-bottom:8px">${p.tag}</span>
        <div class="phrase-en">${esc(p.en)}</div>
        <div class="phrase-tr">${esc(p.tr)}</div>
        <div class="row mt">
          <button class="tts-btn" onclick='TTS.speak(${JSON.stringify(p.en)})'>▶ ${state.lang==='tr'?'Dinle':'Listen'}</button>
        </div>
      </div>`).join('') + `</div>`;
}

let LSN = null;
function renderListen(b){
  b.innerHTML = `<p class="sub mb">${state.lang==='tr'
    ? '🎧 Cümleyi dinle, duyduğunu yaz. Zara\'yı anlamak yarı savaştır. Benzerlik %80+ = doğru sayılır.'
    : '🎧 Listen to the sentence, type what you heard. Understanding Zara is half the battle. 80%+ similarity counts as correct.'}</p>
    <div class="card center">
      <button class="btn" onclick="listenPlay()">🔊 ${state.lang==='tr'?'Cümleyi Çal':'Play Sentence'}</button>
      <button class="btn ghost sm" onclick="listenPlay(0.8)" style="margin-left:8px">🐢 ${state.lang==='tr'?'Yavaş':'Slow'}</button>
      <textarea class="inp mt" id="lsn-inp" rows="2" placeholder="${state.lang==='tr'?'Duyduğunu buraya yaz...':'Type what you heard...'}"></textarea>
      <div class="row mt" style="justify-content:center">
        <button class="btn" onclick="listenCheck()">${state.lang==='tr'?'Kontrol Et':'Check'}</button>
        <button class="btn ghost" onclick="listenNext()">↻ ${state.lang==='tr'?'Yeni Cümle':'New Sentence'}</button>
      </div>
      <div id="lsn-res" class="mt"></div>
    </div>`;
  listenNext();
}
function listenNext(){
  LSN = ENG_LISTEN[Math.floor(Math.random()*ENG_LISTEN.length)];
  const i = document.getElementById('lsn-inp'); if(i){ i.value=''; }
  const r = document.getElementById('lsn-res'); if(r) r.innerHTML='';
  listenPlay();
}
function listenPlay(rate){
  if(!LSN) return;
  try{ speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(LSN);
    if(TTS.voice) u.voice = TTS.voice; u.lang='en-US'; u.rate = rate || 0.95;
    speechSynthesis.speak(u);
  }catch(e){}
}
function wordSim(a, b){
  const norm = s=>s.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(Boolean);
  const wa = norm(a), wb = norm(b);
  if(!wa.length) return 0;
  const setB = new Set(wb);
  const hit = wa.filter(w=>setB.has(w)).length;
  return Math.round(hit/Math.max(wa.length, wb.length)*100);
}
function listenCheck(){
  const typed = document.getElementById('lsn-inp').value.trim();
  if(!typed) return;
  const sim = wordSim(LSN, typed);
  const ok = sim>=80;
  if(ok){ addXP(8, state.lang==='tr'?'dinleme':'listening'); }
  const key = 'listen'; state.engBest[key] = Math.max(state.engBest[key]||0, sim); save();
  document.getElementById('lsn-res').innerHTML = `
    <div class="q-expl" style="text-align:left">
      <b>${ok?'✔':'✕'} ${state.lang==='tr'?'Benzerlik':'Similarity'}: ${sim}%</b><br>
      <span class="muted">${state.lang==='tr'?'Doğrusu':'Original'}:</span> ${esc(LSN)}
    </div>`;
}

let SPK = null;
function renderSpeak(b){
  const hasSR = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  b.innerHTML = `<p class="sub mb">${state.lang==='tr'
    ? '🎙 Soruyu gör, İngilizce SESLİ cevapla. Konuşman yazıya dökülür; hız (kelime/dk), dolgu kelimeler ve süre ölçülür. Hedef: 110-160 kelime/dk, 60-120 sn.'
    : '🎙 See the prompt, answer OUT LOUD in English. Your speech is transcribed; pace (wpm), filler words and duration are measured. Target: 110-160 wpm, 60-120s.'}</p>
    ${hasSR?'':`<div class="tip-card"><b>⚠</b> ${state.lang==='tr'?'Tarayıcın konuşma tanımayı desteklemiyor (Chrome/Edge kullan). Yine de kronometreyle sesli pratik yapabilirsin.':'Your browser lacks speech recognition (use Chrome/Edge). You can still practice aloud with the timer.'}</div>`}
    <div class="card">
      <div class="q-question" id="spk-q"></div>
      <p class="iv-hint" id="spk-hint"></p>
      <div class="card transcript-box mb" id="spk-tx" style="background:var(--bg2)"><span class="muted">${state.lang==='tr'?'Transkript burada belirecek...':'Transcript will appear here...'}</span></div>
      <div class="row">
        <button class="btn" id="spk-btn" onclick="speakToggle()">🎙 ${state.lang==='tr'?'Kaydı Başlat':'Start Recording'}</button>
        <button class="btn ghost" onclick="speakNext()">↻ ${state.lang==='tr'?'Yeni Soru':'New Prompt'}</button>
        <span class="big-timer" id="spk-timer">00:00</span>
      </div>
      <div id="spk-res" class="mt"></div>
    </div>`;
  speakNext();
}
function speakNext(){
  if(SPK && SPK.rec){ try{SPK.rec.stop();}catch(e){} }
  const p = ENG_SPEAK[Math.floor(Math.random()*ENG_SPEAK.length)];
  SPK = {p, txt:'', on:false, rec:null, t0:0, int:null};
  document.getElementById('spk-q').textContent = p.q;
  document.getElementById('spk-hint').textContent = state.lang==='tr' ? '💡 '+p.tr : '';
  document.getElementById('spk-res').innerHTML = '';
  document.getElementById('spk-tx').innerHTML = `<span class="muted">...</span>`;
  document.getElementById('spk-timer').textContent = '00:00';
}
function speakToggle(){
  if(!SPK) return;
  if(SPK.on){ speakStop(); return; }
  SPK.txt = ''; SPK.on = true; SPK.t0 = Date.now();
  const btn = document.getElementById('spk-btn');
  btn.innerHTML = `<span class="rec-dot"></span> ${state.lang==='tr'?'Durdur & Değerlendir':'Stop & Evaluate'}`;
  SPK.int = setInterval(()=>{
    const elx = document.getElementById('spk-timer');
    if(elx) elx.textContent = fmtTime(Math.floor((Date.now()-SPK.t0)/1000));
  }, 500);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(SR){
    const rec = new SR();
    rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e)=>{
      let interim = '';
      for(let i=e.resultIndex;i<e.results.length;i++){
        if(e.results[i].isFinal) SPK.txt += e.results[i][0].transcript + ' ';
        else interim += e.results[i][0].transcript;
      }
      const d = document.getElementById('spk-tx');
      if(d) d.innerHTML = esc(SPK.txt) + `<span class="interim">${esc(interim)}</span>`;
    };
    rec.onend = ()=>{ if(SPK && SPK.on){ try{rec.start();}catch(e){} } };
    rec.onerror = (e)=>{ if(e.error==='not-allowed') toast(state.lang==='tr'?'🎙 Mikrofon izni reddedildi':'🎙 Microphone permission denied','bad'); };
    SPK.rec = rec;
    try{ rec.start(); }catch(e){}
  }
}
function speakStop(){
  SPK.on = false;
  clearInterval(SPK.int);
  if(SPK.rec){ try{SPK.rec.stop();}catch(e){} }
  const btn = document.getElementById('spk-btn');
  btn.innerHTML = `🎙 ${state.lang==='tr'?'Kaydı Başlat':'Start Recording'}`;
  const secs = Math.max(1, Math.round((Date.now()-SPK.t0)/1000));
  const words = SPK.txt.trim().split(/\s+/).filter(Boolean);
  const wpm = Math.round(words.length/(secs/60));
  const fillers = IV_FILLERS.reduce((n,f)=> n + (SPK.txt.toLowerCase().split(f).length-1), 0);
  const durOk = secs>=45 && secs<=150, paceOk = wpm>=100 && wpm<=170;
  let score = 50;
  if(words.length>=40) score += 15;
  if(durOk) score += 15;
  if(paceOk) score += 15;
  score -= Math.min(20, fillers*4);
  score = Math.max(5, Math.min(100, score));
  if(words.length<5){
    document.getElementById('spk-res').innerHTML = `<div class="tip-card">${state.lang==='tr'?'Yeterli konuşma algılanmadı. Mikrofon izni verdiğinden ve Chrome kullandığından emin ol.':'Not enough speech captured. Check mic permission and use Chrome.'}</div>`;
    return;
  }
  addXP(Math.round(score/10), state.lang==='tr'?'konuşma pratiği':'speaking drill');
  state.engBest.speak = Math.max(state.engBest.speak||0, score); save();
  document.getElementById('spk-res').innerHTML = `
    <div class="q-expl" style="text-align:left">
      <b>${state.lang==='tr'?'Skor':'Score'}: ${score}/100</b><br>
      ⏱ ${secs}s ${durOk?'✔':'⚠ '+(state.lang==='tr'?'hedef 60-120 sn':'target 60-120s')} ·
      🗣 ${wpm} wpm ${paceOk?'✔':'⚠ '+(state.lang==='tr'?'hedef 110-160':'target 110-160')} ·
      💬 ${words.length} ${state.lang==='tr'?'kelime':'words'} ·
      ${fillers>0 ? `🚧 ${fillers} ${state.lang==='tr'?'dolgu kelime (um, like...)':'filler words'}` : '✨ '+(state.lang==='tr'?'dolgu kelime yok':'no fillers')}
    </div>`;
}
