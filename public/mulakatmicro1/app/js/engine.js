/* ============ engine: state, i18n, router, ui helpers ============ */
'use strict';

const state = loadState();
function loadState(){
  try{
    const s = JSON.parse(localStorage.getItem('m1prep') || '{}');
    return Object.assign({lang:'tr', role:'analyst', xp:0, lessons:{}, quizBest:{}, gameBest:{}, engBest:{}, checklist:{}, stories:{}, interviews:[], qbank:{mastery:{},studied:{}}}, s);
  }catch(e){ return {lang:'tr', role:'analyst', xp:0, lessons:{}, quizBest:{}, gameBest:{}, engBest:{}, checklist:{}, stories:{}, interviews:[], qbank:{mastery:{},studied:{}}}; }
}
function save(){ localStorage.setItem('m1prep', JSON.stringify(state)); }

/* ---- i18n ---- */
const UI = {
  nav_home:{tr:'Ana Üs', en:'Home'},
  nav_learn:{tr:'Öğren', en:'Learn'},
  nav_games:{tr:'Oyunlar', en:'Games'},
  nav_english:{tr:'İngilizce', en:'English'},
  nav_qbank:{tr:'Soru Bankası', en:'Q&A Bank'},
  nav_stories:{tr:'Hikayelerim', en:'My Stories'},
  nav_interview:{tr:'Simülasyon', en:'Simulator'},
};
function t(o){ if(!o) return ''; return o[state.lang] || o.tr || o.en || ''; }
function applyLang(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.dataset.i18n; if(UI[k]) el.textContent = t(UI[k]);
  });
  document.getElementById('lang-toggle').textContent = state.lang.toUpperCase();
}

/* ---- xp / level ---- */
function addXP(n, reason){
  state.xp += n; save(); renderXP();
  toast(`⚡ +${n} XP${reason ? ' — ' + reason : ''}`, 'xp');
}
function level(){ return Math.floor(state.xp/150)+1; }
function renderXP(){
  document.getElementById('xp-val').textContent = state.xp;
  document.getElementById('lvl-val').textContent = level();
}

/* ---- toast ---- */
function toast(msg, cls){
  const w = document.getElementById('toast-wrap');
  const d = document.createElement('div');
  d.className = 'toast ' + (cls||''); d.innerHTML = msg;
  w.appendChild(d);
  setTimeout(()=>{ d.classList.add('out'); setTimeout(()=>d.remove(), 320); }, 2600);
}

/* ---- confetti ---- */
const confetti = (() => {
  const cv = document.getElementById('confetti');
  const cx = cv.getContext('2d');
  let parts = [], raf = null;
  function resize(){ cv.width = innerWidth; cv.height = innerHeight; }
  addEventListener('resize', resize); resize();
  function fire(n){
    n = n || 90;
    const colors = ['#22d3ee','#a78bfa','#f472b6','#34d399','#fbbf24'];
    for(let i=0;i<n;i++){
      parts.push({x:cv.width/2 + (Math.random()-0.5)*260, y:cv.height*0.35,
        vx:(Math.random()-0.5)*9, vy:-Math.random()*10-3,
        s:Math.random()*7+4, r:Math.random()*Math.PI, vr:(Math.random()-0.5)*0.3,
        c:colors[i%colors.length], life:1});
    }
    if(!raf) tick();
  }
  function tick(){
    cx.clearRect(0,0,cv.width,cv.height);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.25; p.r+=p.vr; p.life-=0.008;
      cx.save(); cx.translate(p.x,p.y); cx.rotate(p.r);
      cx.globalAlpha = Math.max(p.life,0);
      cx.fillStyle = p.c; cx.fillRect(-p.s/2,-p.s/2,p.s,p.s); cx.restore();
    });
    parts = parts.filter(p=>p.life>0 && p.y<cv.height+40);
    if(parts.length){ raf = requestAnimationFrame(tick); }
    else { raf=null; cx.clearRect(0,0,cv.width,cv.height); }
  }
  return {fire};
})();

/* ---- TTS ---- */
const TTS = {
  voice: null,
  init(){
    const pick = ()=>{
      const vs = speechSynthesis.getVoices().filter(v=>v.lang.startsWith('en'));
      this.voice = vs.find(v=>/natural|neural|aria|jenny|zira|google us/i.test(v.name)) || vs[0] || null;
    };
    pick(); speechSynthesis.onvoiceschanged = pick;
  },
  speak(text, onend){
    try{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if(this.voice) u.voice = this.voice;
      u.lang = 'en-US'; u.rate = 0.98; u.pitch = 1.05;
      if(onend) u.onend = onend;
      u.onerror = ()=>{ if(onend) onend(); };
      speechSynthesis.speak(u);
      return u;
    }catch(e){ if(onend) onend(); }
  },
  stop(){ try{ speechSynthesis.cancel(); }catch(e){} }
};

/* ---- router ---- */
const views = {};
let currentView = null;
function go(name, param){
  TTS.stop();
  if(window._ivGuard && name!=='interview'){
    if(!confirm(state.lang==='tr' ? 'Mülakat devam ediyor. Çıkmak istediğine emin misin?' : 'Interview in progress. Leave anyway?')) return;
    window._ivCleanup && window._ivCleanup();
  }
  currentView = name;
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===name));
  const v = document.getElementById('view');
  v.className = 'view-enter';
  v.innerHTML = '';
  (views[name] || views.home)(v, param);
  scrollTo({top:0});
}

/* ---- helpers ---- */
function el(html){
  const d = document.createElement('div'); d.innerHTML = html.trim();
  return d.firstElementChild;
}
function esc(s){ return String(s??'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function shuffle(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function fmtTime(s){ const m = Math.floor(s/60), ss = s%60; return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; }
