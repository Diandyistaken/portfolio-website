/* ============ story bank: behavioral answer builder + rehearsal ============ */
'use strict';

const STORY_TEMPLATES = [
{id:'self', ico:'👤', title:{tr:'Tell me about yourself', en:'Tell me about yourself'},
 why:{tr:'%100 gelecek. 60-90 saniye, ezbere değil ama iskeleti sağlam.', en:'Guaranteed question. 60-90 seconds, not memorized word-for-word but structurally solid.'},
 draft:`I'm a cybersecurity analyst with hands-on experience from my internship at Cyber4 Intelligence, where I worked on the threat intelligence side — collecting indicators, researching threats and turning findings into reports. Before that, I led the deployment of over 100 workstations for İŞKUR, which taught me operational discipline at scale, and I worked on enterprise system integration at Negzel, which showed me how logs and data flow between systems. I use AI tools daily in my own workflow, and this role excites me because it combines classic security analysis with securing AI systems.`},
{id:'cyber4', ico:'🕵️', title:{tr:'Cyber4 stajı — tehdit istihbaratı', en:'Cyber4 internship — threat intel'},
 why:{tr:'Mülakat odağıyla EN alakalı deneyimin. Her teknik soruyu buraya bağlamaya çalış.', en:'Your MOST relevant experience for this interview. Anchor technical answers here whenever possible.'},
 draft:`During my internship at Cyber4 Intelligence I worked on threat intelligence. [Context] My task was collecting and validating indicators of compromise from open and commercial sources. [Action] I researched threat actors, checked IoCs against multiple reputation sources to filter false positives, and wrote structured reports so the findings were actionable. [Outcome] This taught me how raw data becomes usable intelligence, and it's exactly the triage discipline I'd bring to monitoring AI systems at micro1.`},
{id:'iskur', ico:'🖥️', title:{tr:'İŞKUR — 100+ makine kurulumu', en:'İŞKUR — 100+ machine deployment'},
 why:{tr:'Ölçek + operasyonel disiplin hikayen. "Challenge" sorusunun cevabı.', en:'Your scale + operational discipline story. The answer to the "challenge" question.'},
 draft:`[Context] At İŞKUR I was responsible for deploying and configuring more than 100 workstations under a tight deadline. [Constraint] Manual setup would take weeks and cause configuration drift. [Action] I built a standard image, wrote a per-machine checklist covering updates, user rights and a security baseline, and rolled out in batches so problems couldn't spread. [Outcome] We finished on schedule with a uniform, hardened setup. It taught me that repeatable process beats individual heroics — the same philosophy behind security playbooks.`},
{id:'negzel', ico:'🔗', title:{tr:'Negzel — sistem entegrasyonu', en:'Negzel — system integration'},
 why:{tr:'Log/veri akışı anlayışını kanıtlayan hikaye. SIEM sorularına köprü.', en:'Proves your understanding of log/data flows. Bridge to SIEM questions.'},
 draft:`[Context] At Negzel I worked on enterprise system integration — connecting different business systems so data flowed reliably between them. [Action] I mapped how each system produced and consumed data, handled format differences, and verified every flow end to end. [Outcome] The integrations ran reliably, and I gained a practical understanding of how logs and events move through an organization — which is exactly what a SIEM does at the collection and normalization stage.`},
{id:'whycyber', ico:'🎯', title:{tr:'Why cybersecurity? / Why micro1?', en:'Why cybersecurity? / Why micro1?'},
 why:{tr:'Motivasyon sorusu. Samimi + spesifik ol; jenerik "passion" cümlelerinden kaçın.', en:'The motivation question. Be genuine + specific; avoid generic "passion" lines.'},
 draft:`What draws me to cybersecurity is that it's a field where curiosity has a direct defensive purpose — every log tells a story, and finding the anomaly in that story protects real people. My threat intelligence internship confirmed this is the work I want to do daily. micro1 specifically excites me because securing AI systems is the newest frontier of that same work: prompt injection attempts are the new alerts, and I already use AI tools every day, so I understand both sides.`}
];

views.stories = (v)=>{
  const cards = STORY_TEMPLATES.map(s=>{
    const saved = state.stories[s.id];
    const txt = saved != null ? saved : s.draft;
    const wc = txt.trim().split(/\s+/).filter(Boolean).length;
    const secs = Math.round(wc/2.3);
    return `<div class="card" id="st-${s.id}">
      <div class="row spread mb">
        <h3>${s.ico} ${esc(t(s.title))}</h3>
        <span class="badge ${secs>=50&&secs<=100?'gr':'am'}">${wc} ${state.lang==='tr'?'kelime':'words'} · ~${secs}s</span>
      </div>
      <p class="sub mb" style="font-size:13px">${esc(t(s.why))}</p>
      <textarea class="inp" id="st-txt-${s.id}" rows="6" oninput="storyCount('${s.id}')">${esc(txt)}</textarea>
      <div class="row mt">
        <button class="btn sm" onclick="storySave('${s.id}')">💾 ${state.lang==='tr'?'Kaydet':'Save'}</button>
        <button class="btn ghost sm" onclick="storyRehearse('${s.id}')">🎙 ${state.lang==='tr'?'Sesli Prova':'Rehearse Aloud'}</button>
        <button class="tts-btn" onclick="storyListen('${s.id}')">▶ ${state.lang==='tr'?'Dinle':'Listen'}</button>
        ${saved!=null?`<button class="btn ghost sm" onclick="storyReset('${s.id}')">↺ ${state.lang==='tr'?'Şablona Dön':'Reset'}</button>`:''}
      </div>
      <div id="st-res-${s.id}" class="mt"></div>
    </div>`;
  }).join('');
  v.innerHTML = `
    <h1 class="hero">${state.lang==='tr'?'Hikaye <span class="g">Bankan</span>':'Your Story <span class="g">Bank</span>'}</h1>
    <p class="sub">${state.lang==='tr'
      ? 'Zara CV\'ne göre soru üretir — bu 5 anlatıyı kendine göre düzenle, kaydet ve SESLİ prova et. Hedef: 60-90 saniye (≈130-200 kelime). Format: Context → Constraint → Action → Outcome.'
      : 'Zara generates questions from your CV — personalize these 5 narratives, save them and rehearse ALOUD. Target: 60-90 seconds (≈130-200 words). Format: Context → Constraint → Action → Outcome.'}</p>
    <div class="grid mt" style="grid-template-columns:1fr">${cards}</div>`;
};

function storyCount(id){
  const txt = document.getElementById('st-txt-'+id).value;
  const wc = txt.trim().split(/\s+/).filter(Boolean).length;
  const secs = Math.round(wc/2.3);
  const badge = document.querySelector('#st-'+id+' .badge');
  badge.textContent = `${wc} ${state.lang==='tr'?'kelime':'words'} · ~${secs}s`;
  badge.className = 'badge ' + (secs>=50&&secs<=100?'gr':'am');
}
function storySave(id){
  state.stories[id] = document.getElementById('st-txt-'+id).value; save();
  addXP(5, state.lang==='tr'?'hikaye güncellendi':'story updated');
}
function storyReset(id){
  delete state.stories[id]; save(); go('stories');
}
function storyListen(id){
  TTS.speak(document.getElementById('st-txt-'+id).value);
}

let REH = null;
function storyRehearse(id){
  if(REH && REH.on){ rehearseStop(); return; }
  const target = document.getElementById('st-txt-'+id).value;
  const res = document.getElementById('st-res-'+id);
  REH = {id, target, txt:'', on:true, t0:Date.now(), rec:null, int:null};
  res.innerHTML = `<div class="card" style="background:var(--bg2)">
    <div class="row spread mb"><span><span class="rec-dot"></span> ${state.lang==='tr'?'Kayıtta — hikayeni bakmadan anlat':'Recording — tell it without reading'}</span><span class="big-timer" id="reh-t">00:00</span></div>
    <div class="transcript-box" id="reh-tx"><span class="muted">...</span></div>
    <button class="btn sm mt" onclick="rehearseStop()">⏹ ${state.lang==='tr'?'Bitir & Değerlendir':'Finish & Evaluate'}</button>
  </div>`;
  REH.int = setInterval(()=>{
    const elx = document.getElementById('reh-t');
    if(elx) elx.textContent = fmtTime(Math.floor((Date.now()-REH.t0)/1000));
  },500);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(SR){
    const rec = new SR();
    rec.lang='en-US'; rec.continuous=true; rec.interimResults=true;
    rec.onresult=(e)=>{
      let interim='';
      for(let i=e.resultIndex;i<e.results.length;i++){
        if(e.results[i].isFinal) REH.txt += e.results[i][0].transcript+' ';
        else interim += e.results[i][0].transcript;
      }
      const d=document.getElementById('reh-tx');
      if(d) d.innerHTML = esc(REH.txt)+`<span class="interim">${esc(interim)}</span>`;
    };
    rec.onend=()=>{ if(REH && REH.on){ try{rec.start();}catch(e){} } };
    REH.rec=rec; try{rec.start();}catch(e){}
  } else {
    toast(state.lang==='tr'?'Konuşma tanıma yok — süre yine de ölçülüyor':'No speech recognition — timing still measured');
  }
}
function rehearseStop(){
  if(!REH) return;
  REH.on=false; clearInterval(REH.int);
  if(REH.rec){ try{REH.rec.stop();}catch(e){} }
  const secs = Math.max(1, Math.round((Date.now()-REH.t0)/1000));
  const cover = REH.txt ? wordSim(REH.target, REH.txt) : null;
  const durOk = secs>=50 && secs<=110;
  const res = document.getElementById('st-res-'+REH.id);
  if(res){
    res.innerHTML = `<div class="q-expl" style="text-align:left">
      <b>${state.lang==='tr'?'Prova sonucu':'Rehearsal result'}</b><br>
      ⏱ ${secs}s ${durOk?'✔':'⚠ '+(state.lang==='tr'?'hedef 60-90 sn':'target 60-90s')}
      ${cover!=null ? `· 🎯 ${state.lang==='tr'?'içerik örtüşmesi':'content coverage'}: ${cover}% ${cover>=55?'✔':'⚠ '+(state.lang==='tr'?'ana noktaları atlamışsın olabilir':'you may have skipped key points')}` : ''}
    </div>`;
  }
  if(REH.txt && cover>=40) addXP(10, state.lang==='tr'?'sesli prova':'rehearsal');
  REH=null;
}
