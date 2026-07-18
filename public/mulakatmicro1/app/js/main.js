/* ============ home view + boot ============ */
'use strict';

views.home = (v)=>{
  const tr = state.lang==='tr';
  const totalLessons = MODULES.reduce((s,m)=>s+m.lessons.length,0);
  const doneLessons = Object.keys(state.lessons).length;
  const bestIv = state.interviews.length ? Math.max(...state.interviews.map(i=>i.score)) : null;
  const quizAvg = (()=>{ const vals = Object.values(state.quizBest); return vals.length? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : null; })();
  const modCards = MODULES.map(m=>{
    const p = modProgress(m);
    return `<div class="card click mod-card" onclick="go('module','${m.id}')">
      <span class="mod-ico">${m.ico}</span>
      <h3>${esc(t(m.title))}</h3>
      <div class="pbar thin mt mb"><i style="width:${p.pct}%"></i></div>
      <div class="mod-foot"><span>${p.done}/${p.total}</span><span>→</span></div>
    </div>`;
  }).join('');
  v.innerHTML = `
    <div class="hero-wrap">
      <div class="hero-left">
        <span class="badge vi mb" style="display:inline-flex">${ROLE_META.ico} ${esc(t(ROLE_META.name))} ${tr?'hazırlığı':'prep'}</span>
        <h1 class="hero">${tr?'micro1 mülakatına':'Your micro1 interview,'}<br><span class="g">${tr?'oyunla hazırlan':'gamified'}</span> ${ROLE_META.ico}</h1>
        <p class="sub">${esc(t(ROLE_META.name))} · AI Interview + Exercise · ${esc(t(ROLE_META.duration))} · ${tr
          ? 'Zara seni bekliyor. Öğren → soru bankası → oyna → İngilizce → hikaye → simüle et.'
          : 'Zara awaits. Learn → Q&A bank → play → English → stories → simulate.'}</p>
        <div class="row mt" style="gap:6px">${(ROLE_META.focus[state.lang]||ROLE_META.focus.en).map(f=>`<span class="badge cy">${esc(f)}</span>`).join('')}</div>
        <div id="countdown">⏰ <span id="cd-txt">--</span></div>
      </div>
      <div class="grid g4" style="min-width:280px;flex:1">
        <div class="card stat-card"><div class="stat-num">${state.xp}</div><div class="stat-lbl">XP · Lv ${level()}</div></div>
        <div class="card stat-card"><div class="stat-num">${doneLessons}/${totalLessons}</div><div class="stat-lbl">${tr?'Ders':'Lessons'}</div></div>
        <div class="card stat-card"><div class="stat-num">${quizAvg!=null?quizAvg+'%':'—'}</div><div class="stat-lbl">${tr?'Quiz ort.':'Quiz avg'}</div></div>
        <div class="card stat-card"><div class="stat-num">${bestIv!=null?bestIv:'—'}</div><div class="stat-lbl">${tr?'En iyi mülakat':'Best interview'}</div></div>
      </div>
    </div>

    <h2 class="sect">🗺️ ${tr?'1 günlük savaş planın':'Your 1-day battle plan'}</h2>
    <div class="card">
      <div class="path-step"><span class="path-num">1</span><p><b>${tr?'Öğren (2-3 saat):':'Learn (2-3h):'}</b> ${tr?'4 modülü bitir, her quizde 70+ al. Öncelik: IR zinciri → alert triyajı → IDS/IPS → AI güvenliği.':'Finish 4 modules, 70+ on every quiz. Priority: IR chain → alert triage → IDS/IPS → AI security.'}</p></div>
      <div class="path-step"><span class="path-num">2</span><p><b>${tr?'Oyna (30 dk):':'Play (30min):'}</b> ${tr?'NIST Zinciri ve Alert Triyajı oyunlarını hatasız bitirene kadar tekrarla.':'Repeat NIST Chain and Alert Triage games until flawless.'}</p></div>
      <div class="path-step"><span class="path-num">3</span><p><b>${tr?'Soru Bankası (2 saat):':'Q&A Bank (2h):'}</b> ${tr?'Ders modunda soruları ve örnek cevapları oku, sonra Pratik modunda %80+ ilk-deneme doğruluğuna ulaşana kadar flashcard döngüsü yap.':'Read questions + model answers in Study mode, then loop flashcards in Drill mode until 80%+ first-try accuracy.'}</p></div>
      <div class="path-step"><span class="path-num">3b</span><p><b>${tr?'İngilizce + Hikayeler (1-2 saat):':'English + Stories (1-2h):'}</b> ${tr?'10 kalıbı ezberle, 5 hikayeni düzenle ve SESLİ prova et.':'Memorize the 10 phrases, personalize and rehearse your 5 stories ALOUD.'}</p></div>
      <div class="path-step"><span class="path-num">4</span><p><b>${tr?'Simüle et (45 dk x2):':'Simulate (45min x2):'}</b> ${tr?'Tam simülasyonda 70+ alana kadar tekrarla. Raporun söylediği zayıf alanlara geri dön.':'Full simulation until you score 70+. Loop back to whatever the report flags.'}</p></div>
      <div class="path-step"><span class="path-num">5</span><p><b>${tr?'Son kontrol:':'Final check:'}</b> ${tr?'Intel bölümündeki kontrol listesini tamamla, micro1\'in resmi prep aracını dene, SONRA gerçek linke tıkla.':'Complete the Intel checklist, try micro1\'s official prep tool, THEN click the real link.'}</p></div>
    </div>

    <h2 class="sect">📚 ${tr?'Modüller':'Modules'}</h2>
    <div class="grid g4 stagger">${modCards}</div>

    <div class="grid g3 mt stagger">
      <div class="card click center" onclick="go('qbank')"><span class="mod-ico">📖</span><h3>${tr?'Soru Bankası':'Q&A Bank'}</h3><p class="sub center" style="margin:6px auto 0;font-size:13px">${tr?'Gerçek mülakat soruları + örnek cevaplar, flashcard pratiği':'Real interview questions + model answers, flashcard drills'}</p></div>
      <div class="card click center" onclick="go('games')"><span class="mod-ico">🎮</span><h3>${tr?'Beceri Oyunları':'Skill Games'}</h3><p class="sub center" style="margin:6px auto 0;font-size:13px">${tr?'Port avı, NIST zinciri, IoC/IoA refleksi':'Port hunt, NIST chain, IoC/IoA reflex'}</p></div>
      <div class="card click center" onclick="go('interview')"><span class="mod-ico">🤖</span><h3>${tr?'45 dk Simülasyon':'45-min Simulation'}</h3><p class="sub center" style="margin:6px auto 0;font-size:13px">${tr?'Zara provası + 100 üzerinden puan + gelişim planı':'Zara rehearsal + /100 score + improvement plan'}</p></div>
      <div class="card click center" onclick="go('intel')"><span class="mod-ico">🕵️</span><h3>Intel</h3><p class="sub center" style="margin:6px auto 0;font-size:13px">${tr?'Gerçek aday deneyimleri + kontrol listesi':'Real candidate experiences + checklist'}</p></div>
    </div>`;
  updateCountdown();
};

let cdInt = null;
function updateCountdown(){
  clearInterval(cdInt);
  const tick = ()=>{
    const elx = document.getElementById('cd-txt');
    if(!elx){ clearInterval(cdInt); return; }
    const dl = ROLE_META.deadline;
    const dlStr = dl.toLocaleString(state.lang==='tr'?'tr-TR':'en-US',{dateStyle:'short',timeStyle:'short'});
    const ms = dl - new Date();
    if(ms<=0){ elx.textContent = state.lang==='tr'?'Son tarih geçti!':'Deadline passed!'; return; }
    const h = Math.floor(ms/3600000), m = Math.floor(ms%3600000/60000);
    elx.textContent = (state.lang==='tr'
      ? `Son tarihe ${h} sa ${m} dk (${dlStr})`
      : `${h}h ${m}m to deadline (${dlStr})`);
  };
  tick(); cdInt = setInterval(tick, 30000);
}

/* boot */
document.getElementById('lang-toggle').onclick = ()=>{
  state.lang = state.lang==='tr' ? 'en' : 'tr'; save();
  applyLang(); renderRoleBar(); go(currentView||'home');
};
document.querySelectorAll('.nav-btn').forEach(b=> b.onclick = ()=>go(b.dataset.view));
TTS.init();
applyRole();
renderRoleBar();
applyLang();
renderXP();
go('home');
