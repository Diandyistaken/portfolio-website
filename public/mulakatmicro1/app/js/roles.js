/* ============ role registry: two tracks (analyst / pentester) ============ */
'use strict';

/* current-role pointers — reassigned by applyRole() */
let MODULES, IV_BANK, QBANK, INTEL, ROLE_META, QB_CATS;

/* ---- question-bank category maps per role ---- */
const ANALYST_QCATS = {
  threat:      {ico:'🔍', lbl:{tr:'Tehdit Tespiti', en:'Threat Detection'}},
  network:     {ico:'🌐', lbl:{tr:'Ağ Güvenliği', en:'Network Security'}},
  ir:          {ico:'🚒', lbl:{tr:'Olay Müdahalesi', en:'Incident Response'}},
  ai:          {ico:'🤖', lbl:{tr:'AI Güvenliği', en:'AI Security'}},
  fundamentals:{ico:'🧠', lbl:{tr:'Temeller', en:'Fundamentals'}},
  exercise:    {ico:'🧪', lbl:{tr:'Egzersiz / Pratik', en:'Exercise / Practical'}},
  behavioral:  {ico:'🎤', lbl:{tr:'Davranışsal', en:'Behavioral'}}
};
const PENTESTER_QCATS = {
  eh:          {ico:'🎯', lbl:{tr:'Etik Hackerlık / Metodoloji', en:'Ethical Hacking / Methodology'}},
  web:         {ico:'🕸️', lbl:{tr:'Web App Pentest', en:'Web App Pentest'}},
  netpt:       {ico:'🗺️', lbl:{tr:'Ağ / Altyapı Pentest', en:'Network / Infra Pentest'}},
  tools:       {ico:'🧪', lbl:{tr:'Zafiyet Araçları', en:'Vuln Assessment Tools'}},
  risk:        {ico:'📝', lbl:{tr:'Risk & Raporlama', en:'Risk & Reporting'}},
  fundamentals:{ico:'🧠', lbl:{tr:'Temeller', en:'Fundamentals'}},
  behavioral:  {ico:'🎤', lbl:{tr:'Davranışsal', en:'Behavioral'}}
};

/* ---- role metadata ---- */
const ANALYST_META = {
  id:'analyst', ico:'🛡️',
  name:{tr:'Cyber Security Analyst', en:'Cyber Security Analyst'},
  duration:{tr:'45 dakika', en:'45 minutes'},
  deadline:new Date('2026-07-20T00:33:00'),
  focus:{tr:['Tehdit Tespiti ve Analizi','Ağ Güvenliği','Olay Müdahalesi ve İhlal Yönetimi'],
         en:['Threat Detection & Analysis','Network Security','Incident Response & Breach Management']}
};
const PENTESTER_META = {
  id:'pentester', ico:'🗡️',
  name:{tr:'Penetration Tester', en:'Penetration Tester'},
  duration:{tr:'50 dakika', en:'50 minutes'},
  deadline:new Date('2026-07-20T12:35:00'),
  focus:{tr:['Etik Hackerlık','Güvenlik Protokolleri ve Prosedürleri','Zafiyet Değerlendirme Araçları','Risk Analizi ve Öneriler'],
         en:['Ethical Hacking','Security Protocols & Procedures','Vulnerability Assessment Tools','Security Risk Analysis & Recommendations']}
};

/* ---- intel (research findings + checklist) per role ---- */
const SHARED_FACTS = [
 {tr:'Zara asenkron bir AI video mülakatçısı — karşında insan yok, istediğin an başlatıyorsun. Sorular adaya özel üretiliyor ve CV\'ne/verdiğin cevaplara göre gerçek zamanlı uyarlanıyor.', en:'Zara is an asynchronous AI video interviewer — no human on the call; you start when ready. Questions are unique per candidate and adapt in real time to your CV and answers.', src:'micro1.ai + Medium'},
 {tr:'Söylediğin HER anahtar kelime sonraki derin sorunun tohumu olur: "Her cevabın, bir sonraki saldırı noktası." Bilmediğin aracı AĞZINA ALMA; iyi bildiklerini bilerek an — mülakatı sen yönlendir.', en:'EVERY keyword you say seeds the next deep-dive: "every answer becomes the next attack point." NEVER name-drop tools you can\'t defend; deliberately mention ones you know well — steer the interview.', src:'Medium — Faheem Dad'},
 {tr:'Ses+video+ekran kaydediliyor; resmi olarak "assessment & proctoring score" üretiliyor. Sekme değiştirme ve ekran dışına bakma işaretleniyor. "Ava"/%70 integrity eşiği tek kaynaklı SÖYLENTİ ama yönü doğru: göz önde, tek ekran, telefon uzakta.', en:'Audio+video+screen recorded; an official "assessment & proctoring score" exists. Tab switches and off-screen gazing get flagged. The "Ava"/70% threshold is single-source RUMOR — but directionally right: eyes forward, one screen, phone away.', src:'micro1 privacy notice'},
 {tr:'Önce kalıp, sonra hız: 2-2,5 dk\'yı aşan cevaplar dağılıyor ve kesiliyor. Başarılı formül: kısa yapılı cevap + basit dil + ölçülebilir örnek. Sessizlik de sorun — düşünürken bile konuş.', en:'Structure before speed: answers beyond 2-2.5 min drift and get cut. Winning formula: short structured answer + simple language + measurable example. Silence is a problem too — talk even while thinking.', src:'sidehustlepick + Glassdoor'},
 {tr:'Zara\'dan soruyu YENIDEN İFADE ETMESİNİ isteyebilirsin (doğrulandı). Sonuç hızlı geliyor; geçemezsen geri bildirim isteyebiliyor ve bir adaya göre 30 gün içinde TEKRAR hakkı var.', en:'You CAN ask Zara to rephrase (confirmed). Results come fast; you can request feedback if you fail, and one candidate reports a RETAKE within 30 days.', src:'Trustpilot + LinkedIn'},
 {tr:'Teknik aksaklıklar gerçek: bağlantı kopması, ses kesilmesi, kamera durması raporlanmış. Kablolu/en güçlü internet + son geceye bırakmamak şart.', en:'Technical glitches are real: dropped connections, audio cutting out, camera dying. Wired/strongest internet + don\'t leave it to the last night.', src:'Glassdoor + Trustpilot'},
];
const ANALYST_INTEL = {
 facts:[
  {tr:'Akış: ~20-25 dk sözlü Q&A → MOLASIZ, doğrudan süreli egzersize geçiş (~20-25 dk). Toplam ~45 dk. Süre dolunca sistem seni kelimenin ortasında keser.', en:'Flow: ~20-25 min verbal Q&A → straight into a timed exercise (~20-25 min), NO break. ~45 min total. Hard timer cuts you mid-sentence.', src:'Dataford, Glassdoor'},
  {tr:'Analist rolünde egzersiz büyük ihtimalle senaryo/karar bazlı (LeetCode değil) — ama Python\'la basit log analizi anlatabilmek güçlü koz. Kod editöründe kopyala/yapıştır kapalı.', en:'For analyst roles the exercise is likely scenario/judgment-based (not LeetCode) — but describing simple Python log analysis is a strong card. Copy/paste disabled in the editor.', src:'micro1 guide (çıkarım)'},
  {tr:'İlan yarı yarıya AI red-teaming: "AI sınırlarını yoklayan promptlar yazma, AI çıktılarını analiz etme" + klasik izleme/IR. AI Güvenliği modülünü çekirdek say. CISSP/CEH "tercih".', en:'The job is half AI red-teaming: "craft prompts to probe AI, analyze AI outputs" + classic monitoring/IR. Treat AI Security as core. CISSP/CEH preferred.', src:'İlan aynaları'},
  ...SHARED_FACTS
 ],
 checklist:[
  {tr:'micro1\'in resmi Interview Prep aracıyla en az 1 deneme yap', en:'Do at least 1 run with micro1\'s official Interview Prep tool'},
  {tr:'Bu simülatörde 70+ puan al (tam mod)', en:'Score 70+ in this simulator (full mode)'},
  {tr:'Soru Bankasında her kategoride %80+ ilk-deneme doğruluğuna ulaş', en:'Reach 80%+ first-try accuracy in every Q&A Bank category'},
  {tr:'5 hikayeyi sesli prova et (Hikayelerim)', en:'Rehearse all 5 stories aloud (My Stories)'},
  {tr:'NIST zincirini ve alert triyaj 5 adımını ezbere say', en:'Recite the NIST chain and 5 triage steps cold'},
  {tr:'Kablolu internet / en güçlü Wi-Fi noktasını test et', en:'Test wired internet / your strongest Wi-Fi spot'},
  {tr:'Kamera + mikrofonu gerçek mülakat tarayıcısında test et', en:'Test camera + mic in the actual interview browser'},
  {tr:'TÜM sekmeler/uygulamalar kapalı, bildirimler sessizde', en:'ALL tabs/apps closed, notifications muted'},
  {tr:'İkinci monitör fişten çekili, telefon başka odada', en:'Second monitor unplugged, phone in another room'},
  {tr:'Kameraya bak (ekrana değil), sesli düşün', en:'Look at the CAMERA (not the screen), think aloud'}
 ]
};
const PENTESTER_INTEL = {
 facts:[
  {tr:'Süre ~50 dk (analistten uzun). Odak alanları: Etik Hackerlık, Güvenlik Protokolleri/Prosedürleri, Zafiyet Değerlendirme Araçları, Risk Analizi ve Öneriler.', en:'Duration ~50 min (longer than analyst). Focus: Ethical Hacking, Security Protocols/Procedures, Vulnerability Assessment Tools, Security Risk Analysis & Recommendations.', src:'micro1 davet e-postası'},
  {tr:'Pentester rolünde egzersiz genelde uygulamalı/senaryo: bir zafiyeti tarif et, sömürü zincirini adım adım anlat, ya da canlı bir hedefte kısa bir görev. Sesli düşünmek şart — sessiz kalıp klavyeyle çözme.', en:'For pentester roles the exercise is usually practical/scenario: describe a vuln, walk an exploit chain step by step, or a short live task. Thinking aloud is essential — don\'t go silent and solve on the keyboard.', src:'aday raporları (çıkarım)'},
  {tr:'Metodoloji sorusu neredeyse kesin gelir ("bir pentest\'i baştan sona anlat"). Fazları YAZILI İZİN vurgusuyla ezbere say. Araç adı verince (nmap, Burp, sqlmap) hemen derin takip gelir — sadece gerçekten kullandıklarını an.', en:'A methodology question is near-certain ("walk me through a pentest"). Recite the phases cold, emphasizing WRITTEN AUTHORIZATION. Naming a tool (nmap, Burp, sqlmap) triggers a deep follow-up — only mention ones you actually use.', src:'Indeed/HTB rehberleri'},
  {tr:'Etik senaryolar sık: "kapsam dışına çıkarsan?", "kritik/yasa dışı bir şey bulursan?". Doğru cevap her zaman: dur, kapsama sadık kal, delili koru, acil kanaldan eskale et.', en:'Ethics scenarios are common: "what if you go out of scope?", "what if you find something critical/illegal?". The right answer is always: stop, stay in scope, preserve evidence, escalate via the emergency channel.', src:'RoE / etik rehberleri'},
  ...SHARED_FACTS
 ],
 checklist:[
  {tr:'micro1\'in resmi Interview Prep aracıyla en az 1 deneme yap', en:'Do at least 1 run with micro1\'s official Interview Prep tool'},
  {tr:'Bu simülatörde (Pentester modu) 70+ puan al', en:'Score 70+ in this simulator (Pentester mode)'},
  {tr:'Soru Bankasında her kategoride %80+ ilk-deneme doğruluğuna ulaş', en:'Reach 80%+ first-try accuracy in every Q&A Bank category'},
  {tr:'Pentest metodolojisini (6 faz) ve OWASP Top 10\'u ezbere say', en:'Recite the pentest methodology (6 phases) and OWASP Top 10 cold'},
  {tr:'Bir SQLi ve bir XSS\'i baştan sona (tespit→sömürü→fix) sesli anlat', en:'Walk one SQLi and one XSS end-to-end (detect→exploit→fix) aloud'},
  {tr:'nmap bayraklarını ve tipik tarama akışını ezberle', en:'Memorize nmap flags and a typical scan flow'},
  {tr:'"Neden offensive security?" ve bir engagement hikayeni hazırla', en:'Prep "why offensive security?" and one engagement story'},
  {tr:'Kablolu internet / en güçlü Wi-Fi noktasını test et', en:'Test wired internet / your strongest Wi-Fi spot'},
  {tr:'Kamera + mikrofonu gerçek mülakat tarayıcısında test et', en:'Test camera + mic in the actual interview browser'},
  {tr:'TÜM sekmeler/uygulamalar kapalı, ikinci monitör çekili, telefon başka odada', en:'ALL tabs/apps closed, second monitor unplugged, phone in another room'},
  {tr:'Kameraya bak, sesli düşün, kapsam/yetki vurgusunu unutma', en:'Look at the camera, think aloud, don\'t forget the scope/authorization emphasis'}
 ]
};

/* ---- registry (thunks defer const access until boot) ---- */
const ROLE_REGISTRY = {
  analyst:   ()=>({meta:ANALYST_META,   modules:ANALYST_MODULES,   iv:ANALYST_IV,   qbank:ANALYST_QBANK,   intel:ANALYST_INTEL,   qcats:ANALYST_QCATS}),
  pentester: ()=>({meta:PENTESTER_META, modules:PENTESTER_MODULES, iv:PENTESTER_IV, qbank:PENTESTER_QBANK, intel:PENTESTER_INTEL, qcats:PENTESTER_QCATS})
};
function applyRole(){
  if(!ROLE_REGISTRY[state.role]) state.role = 'analyst';
  const r = ROLE_REGISTRY[state.role]();
  MODULES = r.modules; IV_BANK = r.iv; QBANK = r.qbank; INTEL = r.intel; ROLE_META = r.meta; QB_CATS = r.qcats;
}
function setRole(id){
  if(state.role === id){ go('home'); return; }
  state.role = id; save(); applyRole(); renderRoleBar();
  toast((state.lang==='tr'?'Rol: ':'Role: ') + t(ROLE_META.name), 'xp');
  go('home');
}
function renderRoleBar(){
  const bar = document.getElementById('rolebar');
  if(!bar) return;
  bar.innerHTML = Object.keys(ROLE_REGISTRY).map(id=>{
    const m = ROLE_REGISTRY[id]().meta;
    const active = state.role===id;
    return `<button class="role-pill ${active?'active':''}" onclick="setRole('${id}')">
      <span class="rp-ico">${m.ico}</span>
      <span class="rp-txt"><b>${esc(t(m.name))}</b><small>${active?(state.lang==='tr'?'aktif hazırlık':'active prep'):(state.lang==='tr'?'geç':'switch')}</small></span>
    </button>`;
  }).join('');
}
