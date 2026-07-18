/* ============ learn: modules, lessons, quiz engine ============ */
'use strict';

function modProgress(m){
  const done = m.lessons.filter(l=>state.lessons[m.id+'.'+l.id]).length;
  return {done, total:m.lessons.length, pct:Math.round(done/m.lessons.length*100)};
}

views.learn = (v)=>{
  const cards = MODULES.map(m=>{
    const p = modProgress(m);
    const best = state.quizBest['quiz.'+m.id];
    return `<div class="card click mod-card" onclick="go('module','${m.id}')">
      <span class="mod-ico">${m.ico}</span>
      <h3>${esc(t(m.title))}</h3>
      <p>${esc(t(m.desc))}</p>
      <div class="pbar mb"><i style="width:${p.pct}%"></i></div>
      <div class="mod-foot">
        <span>${p.done}/${p.total} ${state.lang==='tr'?'ders':'lessons'}</span>
        <span>${best!=null ? `Quiz: ${best}%` : (state.lang==='tr'?'Quiz bekliyor':'Quiz pending')}</span>
      </div>
    </div>`;
  }).join('');
  v.innerHTML = `
    <h1 class="hero">${state.lang==='tr'?'Öğrenme <span class="g">Modülleri</span>':'Learning <span class="g">Modules</span>'}</h1>
    <p class="sub">${state.lang==='tr'
      ? 'Her modül: dersler → İngilizce "böyle söyle" kalıpları → quiz. Ders okumak +10 XP, quiz sorusu +5 XP.'
      : 'Each module: lessons → English "say it like this" phrases → quiz. Reading a lesson: +10 XP, each quiz question: +5 XP.'}</p>
    <div class="grid g2 mt stagger">${cards}</div>`;
};

views.module = (v, id)=>{
  const m = MODULES.find(x=>x.id===id); if(!m){ go('learn'); return; }
  const lessons = m.lessons.map(l=>{
    const key = m.id+'.'+l.id, done = !!state.lessons[key];
    return `<div class="lesson ${done?'done':''}" id="ls-${l.id}">
      <div class="l-head" onclick="toggleLesson('${l.id}')">
        <span class="l-ico">${l.ico}</span><span class="l-title">${esc(t(l.title))}</span>
      </div>
      <div class="l-body"><div class="l-inner">
        ${t(l.body)}
        ${l.say ? `<div class="say-en">${esc(l.say)}<button class="tts-btn" onclick="event.stopPropagation();TTS.speak(${JSON.stringify(l.say).replace(/"/g,'&quot;')})">▶ ${state.lang==='tr'?'Dinle':'Listen'}</button></div>` : ''}
        ${done ? '' : `<button class="btn sm mark-btn" onclick="markLesson('${m.id}','${l.id}')">✓ ${state.lang==='tr'?'Öğrendim (+10 XP)':'Got it (+10 XP)'}</button>`}
      </div></div>
    </div>`;
  }).join('');
  const p = modProgress(m);
  v.innerHTML = `
    <button class="btn ghost sm" onclick="go('learn')">← ${state.lang==='tr'?'Modüller':'Modules'}</button>
    <h1 class="hero mt">${m.ico} ${esc(t(m.title))}</h1>
    <p class="sub">${esc(t(m.desc))}</p>
    <div class="row mt mb"><div class="pbar" style="flex:1"><i style="width:${p.pct}%"></i></div><span class="muted">${p.done}/${p.total}</span></div>
    <div class="stagger">${lessons}</div>
    <div class="card center mt">
      <h3 class="mb">🎯 ${state.lang==='tr'?'Modül Quizi':'Module Quiz'} (${m.quiz.length} ${state.lang==='tr'?'soru':'questions'})</h3>
      <p class="sub center mb" style="margin:0 auto 14px">${state.lang==='tr'?'Her doğru +5 XP, tam puan +20 bonus.':'+5 XP per correct answer, +20 bonus for a perfect run.'}</p>
      <button class="btn" onclick="startQuiz('${m.id}')">▶ ${state.lang==='tr'?'Quizi Başlat':'Start Quiz'}</button>
      ${state.quizBest['quiz.'+m.id]!=null ? `<p class="muted mt">${state.lang==='tr'?'En iyi skorun':'Your best'}: ${state.quizBest['quiz.'+m.id]}%</p>` : ''}
    </div>`;
};

function toggleLesson(id){
  document.getElementById('ls-'+id)?.classList.toggle('open');
}
function markLesson(mid, lid){
  const key = mid+'.'+lid;
  if(state.lessons[key]) return;
  state.lessons[key] = true; save();
  addXP(10, state.lang==='tr'?'ders tamamlandı':'lesson complete');
  const elx = document.getElementById('ls-'+lid);
  if(elx){ elx.classList.add('done'); elx.querySelector('.mark-btn')?.remove(); }
  const m = MODULES.find(x=>x.id===mid);
  if(m && m.lessons.every(l=>state.lessons[mid+'.'+l.id])){ confetti.fire(60); toast(state.lang==='tr'?'🏆 Modülün tüm dersleri bitti — şimdi quiz!':'🏆 All lessons done — quiz time!'); }
}

/* ---- quiz engine ---- */
let QZ = null;
function startQuiz(mid){
  const m = MODULES.find(x=>x.id===mid);
  QZ = {mid, qs:shuffle(m.quiz), i:0, correct:0, streak:0, answered:false};
  renderQuiz();
}
function renderQuiz(){
  const v = document.getElementById('view');
  const q = QZ.qs[QZ.i];
  const opts = q.opts.map((o,idx)=>`<button class="q-opt" data-i="${idx}" onclick="answerQuiz(${idx})">${String.fromCharCode(65+idx)}. ${esc(t(o))}</button>`).join('');
  v.className = 'view-enter';
  v.innerHTML = `
    <div class="card" style="max-width:720px;margin:0 auto">
      <div class="q-top">
        <span class="badge vi">${state.lang==='tr'?'Soru':'Question'} ${QZ.i+1}/${QZ.qs.length}</span>
        <span class="streak">${QZ.streak>1 ? '🔥 x'+QZ.streak : ''}</span>
        <span class="badge cy">✔ ${QZ.correct}</span>
      </div>
      <div class="pbar thin mb"><i style="width:${Math.round(QZ.i/QZ.qs.length*100)}%"></i></div>
      <div class="q-question">${esc(t(q.q))}</div>
      ${opts}
      <div id="q-expl"></div>
      <div class="row spread mt">
        <button class="btn ghost sm" onclick="go('module','${QZ.mid}')">✕ ${state.lang==='tr'?'Çık':'Exit'}</button>
        <button class="btn sm" id="q-next" style="visibility:hidden" onclick="nextQuiz()">${state.lang==='tr'?'Devam':'Next'} →</button>
      </div>
    </div>`;
}
function answerQuiz(idx){
  if(QZ.answered) return; QZ.answered = true;
  const q = QZ.qs[QZ.i];
  document.querySelectorAll('.q-opt').forEach(b=>{
    b.disabled = true;
    const i = +b.dataset.i;
    if(i===q.a) b.classList.add('correct');
    else if(i===idx) b.classList.add('wrong');
  });
  if(idx===q.a){
    QZ.correct++; QZ.streak++;
    addXP(5 + (QZ.streak>=3?2:0), QZ.streak>=3 ? (state.lang==='tr'?'seri bonusu!':'streak bonus!') : '');
  } else {
    QZ.streak = 0;
  }
  document.getElementById('q-expl').innerHTML = `<div class="q-expl"><b>${idx===q.a ? '✔ '+(state.lang==='tr'?'Doğru!':'Correct!') : '✕ '+(state.lang==='tr'?'Yanlış':'Wrong')}</b> — ${esc(t(q.expl))}</div>`;
  document.getElementById('q-next').style.visibility = 'visible';
}
function nextQuiz(){
  QZ.i++; QZ.answered = false;
  if(QZ.i < QZ.qs.length){ renderQuiz(); return; }
  const pct = Math.round(QZ.correct/QZ.qs.length*100);
  const key = 'quiz.'+QZ.mid;
  const prev = state.quizBest[key] ?? -1;
  if(pct > prev){ state.quizBest[key] = pct; save(); }
  if(pct===100){ addXP(20, state.lang==='tr'?'kusursuz quiz!':'perfect quiz!'); confetti.fire(140); }
  else if(pct>=70) confetti.fire(60);
  const v = document.getElementById('view');
  v.innerHTML = `
    <div class="card result-panel" style="max-width:560px;margin:40px auto">
      <span class="r-emoji">${pct===100?'🏆':pct>=70?'🎉':pct>=50?'💪':'📚'}</span>
      <div class="score-big">${pct}%</div>
      <p class="sub center" style="margin:10px auto">${QZ.correct}/${QZ.qs.length} ${state.lang==='tr'?'doğru':'correct'}${pct>prev&&prev>=0 ? ' — '+(state.lang==='tr'?'yeni rekor!':'new best!') : ''}</p>
      <p class="sub center" style="margin:0 auto 18px">${pct===100
        ? (state.lang==='tr'?'Kusursuz! Bu modül mülakata hazır.':'Flawless! This module is interview-ready.')
        : pct>=70 ? (state.lang==='tr'?'İyi! Yanlışların açıklamalarını tekrar oku.':'Good! Re-read the explanations you missed.')
        : (state.lang==='tr'?'Dersleri tekrar gözden geçirip yeniden dene.':'Review the lessons and try again.')}</p>
      <div class="row" style="justify-content:center">
        <button class="btn ghost" onclick="startQuiz('${QZ.mid}')">↻ ${state.lang==='tr'?'Tekrar':'Retry'}</button>
        <button class="btn" onclick="go('module','${QZ.mid}')">${state.lang==='tr'?'Modüle Dön':'Back to Module'}</button>
      </div>
    </div>`;
}
