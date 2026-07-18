/* ============ intel: research findings + setup checklist (role-aware) ============
   INTEL and ROLE_META are provided per-role by roles.js.
   Checklist state is keyed per-role: state.checklist[role + ':' + i].
============================================================================ */
'use strict';

function ckKey(i){ return state.role + ':' + i; }

views.intel = (v)=>{
  const tr = state.lang==='tr';
  const list = INTEL.checklist;
  const doneCount = list.filter((_,i)=>state.checklist[ckKey(i)]).length;
  const focus = ROLE_META.focus[state.lang] || ROLE_META.focus.en;
  const dl = ROLE_META.deadline;
  const dlStr = dl.toLocaleString(tr?'tr-TR':'en-US',{dateStyle:'medium',timeStyle:'short'});
  v.innerHTML = `
    <h1 class="hero">🕵️ ${tr?'Saha <span class="g">İstihbaratı</span>':'Field <span class="g">Intelligence</span>'}</h1>
    <p class="sub">${tr
      ? `<b>${esc(t(ROLE_META.name))}</b> rolü için — gerçek aday deneyimlerinden, micro1\'in resmi dokümanlarından ve ilan metninden derlenen bulgular (18 Tem 2026). Söylenti olanlar açıkça işaretli.`
      : `For the <b>${esc(t(ROLE_META.name))}</b> role — findings from real candidate experiences, micro1\'s official docs and the job post (Jul 18, 2026). Rumors are marked as such.`}</p>
    <div class="card mt mb">
      <div class="row spread">
        <div><b>${ROLE_META.ico} ${esc(t(ROLE_META.name))}</b> <span class="muted">· ${esc(t(ROLE_META.duration))}</span></div>
        <span class="badge am">⏰ ${dlStr}</span>
      </div>
      <p class="sub mt" style="font-size:13px">${tr?'Odak alanları':'Focus areas'}: ${focus.map(f=>`<span class="badge cy" style="margin:2px">${esc(f)}</span>`).join('')}</p>
    </div>
    <h2 class="sect">📡 ${tr?'Bulgular':'Findings'}</h2>
    <div class="stagger">
      ${INTEL.facts.map(f=>`<div class="intel-item">${esc(t(f))}<br><span class="src">— ${esc(f.src)}</span></div>`).join('')}
    </div>
    <h2 class="sect">✅ ${tr?'Mülakat öncesi kontrol listesi':'Pre-interview checklist'} <span class="badge ${doneCount===list.length?'gr':'cy'}">${doneCount}/${list.length}</span></h2>
    <div id="ck-list">
      ${list.map((c,i)=>`
        <div class="check-item ${state.checklist[ckKey(i)]?'done':''}" onclick="toggleCheck(${i})">
          <span class="ck-box">${state.checklist[ckKey(i)]?'✔':''}</span>
          <span class="ck-txt">${esc(t(c))}</span>
        </div>`).join('')}
    </div>
    <div class="tip-card mt"><b>⚠️ ${tr?'Önemli':'Important'}:</b> ${tr
      ? `Gerçek mülakat linkine sadece hazır olduğunda tıkla — link tıklandığında süreç başlayabilir. Son gün: ${dlStr}. Son geceye bırakma, teknik aksaklık payı bırak.`
      : `Only click the real interview link when you are ready — clicking may start the process. Deadline: ${dlStr}. Don\'t leave it to the last night; keep a buffer for glitches.`}</div>`;
};
function toggleCheck(i){
  const k = ckKey(i);
  state.checklist[k] = !state.checklist[k]; save();
  if(state.checklist[k] && INTEL.checklist.every((_,x)=>state.checklist[ckKey(x)])){ confetti.fire(120); addXP(30, state.lang==='tr'?'kontrol listesi tamam!':'checklist complete!'); }
  go('intel');
}
