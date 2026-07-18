/* ============ interview simulator question bank ============
   kw: keyword groups (any synonym counts as a hit) — technical coverage scoring
   fu: adaptive follow-ups {trig:[terms], q} — fired if the answer mentions a trigger
   model: strong sample answer shown in the report
================================================================ */
'use strict';

const ANALYST_IV = [
{id:'intro', cat:'INTRO', time:120,
q:`Tell me about yourself and your background in cybersecurity.`,
hint:{tr:'60-90 sn: kim olduğun → Cyber4 stajı (tehdit istihbaratı) → İŞKUR/Negzel operasyon deneyimi → neden bu rol. Sadece savunabileceğin teknolojileri an!', en:'60-90s: who you are → Cyber4 internship (threat intel) → İŞKUR/Negzel ops experience → why this role. Only mention tech you can defend!'},
kw:[['experience','internship','intern'],['threat intelligence','threat intel','cyber4'],['security','cybersecurity'],['monitor','analysis','analyz'],['motivat','passion','interested','excited']],
fu:[{trig:['cyber4','threat intel'], q:`You mentioned threat intelligence work. What did a typical day of that work look like, and what tools or sources did you use?`},
    {trig:['ai','llm','artificial intelligence'], q:`Interesting — how do you think AI changes the daily work of a security analyst?`}],
model:`I'm a cybersecurity analyst with hands-on experience from my internship at Cyber4 Intelligence, where I worked on the threat intelligence side — collecting indicators, researching threat actors and turning findings into actionable reports. Before that, I led a deployment of over 100 workstations for İŞKUR, which taught me operational discipline at scale, and I worked on enterprise system integration at Negzel, which gave me a solid understanding of how logs and data flow between systems. I use AI tools daily in my workflow, and this role at micro1 excites me because it combines classic security analysis with securing AI systems.`},

{id:'behav', cat:'BEHAVIORAL', time:150,
q:`Tell me about a challenging technical problem you faced and how you solved it. Walk me through your thinking.`,
hint:{tr:'CCAO: Bağlam (1 cümle) → Zorluk → Adım adım Aksiyon → Ölçülebilir Sonuç + ders. 2 dk geçme!', en:'CCAO: Context (1 line) → Constraint → step-by-step Action → measurable Outcome + lesson. Stay under 2 min!'},
kw:[['challeng','problem','issue','difficult'],['first','started','initial','step'],['because','so that','decided','reason'],['result','outcome','solved','fixed','completed'],['learned','lesson','next time','improve']],
fu:[{trig:['iskur','100','deployment','workstation'], q:`Deploying at that scale is interesting. How did you ensure consistency and security across all those machines?`}],
model:`During the İŞKUR project I had to deploy and configure over 100 workstations under a tight deadline. The challenge was consistency — manual setup would take weeks and produce configuration drift. I built a standard image, documented a checklist per machine covering updates, user rights and security baseline, and batched the rollout in groups so issues in one batch couldn't spread. As a result, we finished on schedule with a uniform, hardened setup, and I learned that repeatable process beats individual heroics — a lesson that maps directly to security playbooks.`},

{id:'triage', cat:'THREAT DETECTION', time:150,
q:`A SIEM alert fires for suspicious activity on a critical server. Walk me through your first steps as an analyst.`,
hint:{tr:'5 adım: doğrula (ham log) → kapsam → bağlam (kritiklik+intel) → TP/FP sınıflandır → aksiyon+belge. "Panikle kapatmam" de.', en:'5 steps: validate (raw logs) → scope → context (criticality+intel) → classify TP/FP → act+document. Say "I never power off in panic".'},
kw:[['validat','verify','confirm','raw log','false positive'],['scope','which host','which user','affected','spread'],['context','criticality','critical','threat intel','baseline'],['classif','severity','true positive','prioriti'],['document','ticket','escalat','playbook','record']],
fu:[{trig:['splunk','sentinel','qradar','wazuh','siem'], q:`Which SIEM have you worked with or studied, and how would you write a query to pull the related raw events?`},
    {trig:['escalat'], q:`At what exact point would you escalate this instead of handling it yourself?`}],
model:`First I validate the alert — I open the raw logs behind it to confirm it's not a rule misfire. Second, I scope it: which host, which accounts, what timeframe, and whether other systems show the same behavior. Third, I add context — how critical this server is, whether threat intelligence knows the IPs or hashes involved, and what normal activity looks like for it. Fourth, I classify it as a true or false positive and assign severity. Finally I act by playbook — if it's real, I move to containment and escalate per our thresholds — and I document every step in the ticket as I go. I never power off the machine in panic, because that destroys volatile evidence.`},

{id:'ioc', cat:'THREAT DETECTION', time:120,
q:`What is the difference between an Indicator of Compromise and an Indicator of Attack? Give me a concrete example of each.`,
hint:{tr:'IoC = statik artefakt (hash, C2 IP). IoA = davranış/niyet (Word→PowerShell). IoC reaktif, IoA proaktif.', en:'IoC = static artifact (hash, C2 IP). IoA = behavior/intent (Word→PowerShell). IoC reactive, IoA proactive.'},
kw:[['compromise','artifact','evidence'],['hash','ip','domain','file path'],['behavior','intent','action','attack in progress'],['powershell','macro','process','spawn'],['proactive','reactive','before','in progress','already happened']],
fu:[{trig:['powershell'], q:`Why is Microsoft Word spawning PowerShell such a strong signal? What attack chain does it usually indicate?`}],
model:`An IoC is a static artifact proving a system may already be compromised — for example a known malicious file hash or a C2 server IP found in our logs. An IoA is behavioral: it shows attacker intent while the attack may still be in progress — for example Microsoft Word spawning PowerShell, which is a classic sign of a malicious macro. The practical difference is that IoCs are reactive — the damage may be done — while IoAs let us catch and stop an attack mid-chain.`},

{id:'brute', cat:'THREAT DETECTION', time:150,
q:`How would you detect a brute-force attack against Windows systems using logs? What would you look for, and what would you do next?`,
hint:{tr:'4625 patlaması → 4624 takibi. Klasik vs password spraying ayrımı. Aksiyon: IP engelle, parola sıfırla, MFA.', en:'Burst of 4625 → then 4624. Classic vs password spraying. Action: block IP, reset password, MFA.'},
kw:[['4625','failed logon','failed login'],['4624','successful','success'],['source ip','same source','single ip','threshold'],['spray','many accounts','lockout'],['block','reset','mfa','disable','lock']],
fu:[{trig:['spray'], q:`Good — how would your detection logic differ for password spraying versus classic brute force?`}],
model:`I'd look for a burst of Event ID 4625 failed logons in a short window — for example more than twenty from one source IP within five minutes. If a 4624 successful logon follows from that same source, the account probably fell. I'd distinguish classic brute force — one account, many attempts — from password spraying, where one IP tries a few common passwords across many accounts to stay under lockout thresholds, so I group by source IP, not just by account. Then I block the source, reset any compromised credentials, kill active sessions, and check MFA coverage on the affected accounts.`},

{id:'fp', cat:'THREAT DETECTION', time:120,
q:`Your SOC is drowning in false positives. How do you reduce the false positive rate without missing real threats?`,
hint:{tr:'Tuning, baseline, allowlist, korelasyon, context zenginleştirme. FN riskini de an — dengeyi göster.', en:'Tuning, baselining, allowlists, correlation, context enrichment. Mention FN risk — show the balance.'},
kw:[['tun','threshold','adjust'],['baseline','normal behavior'],['allowlist','whitelist','known benign','exception'],['correlat','combine','multiple events'],['context','asset','criticality','enrich','intel'],['false negative','miss','careful','review']],
fu:[],
model:`I'd start by measuring which rules generate the most noise and tune their thresholds to our environment. Then I'd baseline normal behavior so we alert on deviation instead of raw events, allowlist known-benign sources like our vulnerability scanner, and prefer correlation rules over single-event alerts. Enriching alerts with asset criticality and threat intel also helps analysts dismiss noise faster. The key discipline is reviewing every change against the false-negative risk — I'd rather keep one noisy rule than silently blind the SOC to a real attack.`},

{id:'ids', cat:'NETWORK SECURITY', time:120,
q:`What is the difference between an IDS and an IPS, and where would you place each one in a network?`,
hint:{tr:'IDS = out-of-band izleme/alarm (SPAN/TAP). IPS = inline engelleme. Trade-off: IPS FP\'de meşru trafiği keser → önce detect modda test.', en:'IDS = out-of-band detect/alert (SPAN/TAP). IPS = inline blocking. Trade-off: IPS FP cuts real traffic → test in detect mode first.'},
kw:[['detect','alert','monitor'],['prevent','block','stop','inline'],['out of band','span','tap','mirror','passive'],['placement','perimeter','behind the firewall','critical segment'],['false positive','legitimate traffic','latency','trade']],
fu:[{trig:['snort','suricata'], q:`You mentioned a specific tool — what does a basic detection rule look like in it, conceptually?`}],
model:`An IDS monitors traffic out-of-band — usually from a SPAN or TAP port — and raises alerts but can't stop anything. An IPS sits inline in the traffic path and actively blocks what matches its rules. I'd place an IPS inline at the perimeter and in front of critical segments, and use IDS sensors for broad internal visibility where blocking is too risky. The trade-off to manage is that an IPS false positive blocks legitimate business traffic, so I'd run new rules in detection mode first and only then enable blocking.`},

{id:'outbound', cat:'NETWORK SECURITY', time:150,
q:`You notice unusual outbound traffic from an internal host to an unknown external IP. How do you investigate?`,
hint:{tr:'Hedefi araştır (reputation/whois) → hangi process → trafik deseni (beaconing? hacim?) → pcap → gerekiyorsa izole et. Exfil şüphesini söyle.', en:'Check destination (reputation/whois) → which process → traffic pattern (beaconing? volume?) → pcap → isolate if needed. Say exfiltration suspicion.'},
kw:[['reputation','whois','threat intel','known bad','lookup'],['process','which application','netstat','edr'],['beacon','regular interval','pattern','volume','how much data'],['pcap','wireshark','capture','netflow','dns'],['isolate','contain','block','escalat'],['exfil','data leaving','c2','command and control']],
fu:[{trig:['wireshark','pcap'], q:`Which Wireshark views or filters would you actually use on that capture, and what would you look for first?`},
    {trig:['dns'], q:`You mentioned DNS — what would DNS tunneling look like in that traffic?`}],
model:`First I'd check the destination — reputation services, whois, and our threat intel: is this IP known bad, newly registered, or in a strange country for our business? Then on the host I'd identify which process owns the connection, using EDR or netstat. I'd look at the traffic pattern: regular fixed intervals suggest C2 beaconing, large volumes suggest exfiltration. If it stays suspicious I'd capture packets and check flows in Wireshark — Conversations first, then follow the streams. Depending on what I find, I'd isolate the host, block the destination, and escalate — because outbound to unknown infrastructure is potential data theft in progress.`},

{id:'mitm', cat:'NETWORK SECURITY', time:120,
q:`Explain how a man-in-the-middle attack works and how you would defend a corporate network against it.`,
hint:{tr:'Araya girme: ARP spoofing, evil twin, DNS spoofing. Savunma: TLS+HSTS, cert pinning, DAI+DHCP snooping, VPN.', en:'Interception: ARP spoofing, evil twin, DNS spoofing. Defense: TLS+HSTS, cert pinning, DAI+DHCP snooping, VPN.'},
kw:[['intercept','between','middle','read','alter'],['arp','spoof'],['rogue','evil twin','fake wi','fake ap','dns spoof'],['tls','https','encrypt','certificate','hsts'],['arp inspection','dhcp snooping','vpn','pinning']],
fu:[],
model:`In a MITM attack the attacker inserts themselves between two parties and can read or modify the traffic. On a LAN the classic method is ARP spoofing — the attacker claims to be the gateway, so victim traffic flows through them. Other variants are evil-twin Wi-Fi access points and DNS spoofing. Defenses are layered: TLS everywhere with HSTS so intercepted traffic stays unreadable, certificate pinning for critical applications, dynamic ARP inspection and DHCP snooping on switches to kill ARP spoofing, and mandatory VPN on untrusted networks.`},

{id:'ransom', cat:'INCIDENT RESPONSE', time:180,
q:`Ransomware has been detected on one of your company's file servers. Walk me through your response, step by step.`,
hint:{tr:'İzole et (KAPATMA!) → kapsam → eskale/bildir → delil (imaj+hash) → tür & giriş vektörü → eradication → temiz yedekten dön → lessons learned. NIST\'i an.', en:'Isolate (do NOT power off!) → scope → escalate/notify → evidence (image+hash) → strain & entry vector → eradicate → restore clean backup → lessons learned. Mention NIST.'},
kw:[['isolate','disconnect','network'],['power off','keep it on','memory','ram','volatile'],['scope','spread','other systems','shares'],['escalat','notify','management','legal','team'],['evidence','image','hash','forensic','custody'],['entry','vector','how it got in','phishing','rdp'],['backup','restore','clean','offline'],['lessons','post','report','improve']],
fu:[{trig:['backup'], q:`What if you discover the backups were also encrypted? What's your move then?`},
    {trig:['pay','ransom'], q:`Who should make the decision about whether to pay, and what would you advise?`}],
model:`Following the NIST lifecycle: first, containment — I isolate the server from the network immediately, but I do not power it off, because encryption keys and evidence live in memory. Second, I scope: are other systems encrypting, are file shares and backups affected? Third, I escalate to the IR team and management right away — ransomware is never a solo ticket — and legal gets involved for regulatory notification. Fourth, evidence: memory and disk images, hashed, chain of custody started. Then I identify the strain from the ransom note and find the entry vector — commonly phishing or exposed RDP — eradicate the malware, close that vector, and restore from clean offline backups after verifying they're intact. We close with a lessons-learned report: what detection we lacked, and improvements like segmentation and MFA.`},

{id:'contain', cat:'INCIDENT RESPONSE', time:120,
q:`What is the difference between containment and eradication in incident response? Give an example of each.`,
hint:{tr:'Containment = yayılmayı sınırla (izole, hesap kilitle). Eradication = kök neden + zararlıyı kaldır (temizle, yamala). Sıra önemli.', en:'Containment = limit spread (isolate, lock account). Eradication = remove root cause + malware (clean, patch). Order matters.'},
kw:[['limit','spread','stop the bleeding','isolat'],['short term','long term'],['remove','clean','delete','malware'],['root cause','patch','vulnerabilit','close the'],['example','for instance']],
fu:[],
model:`Containment limits the damage while the incident is live — like isolating an infected host from the network or disabling a compromised account. It stops the bleeding but the threat still exists. Eradication removes the threat and its root cause — deleting the malware, patching the vulnerability that let it in, and closing attacker accounts. The order matters: contain first so it can't spread, then eradicate, and only then recover — otherwise you're cleaning one machine while the attacker encrypts the next one.`},

{id:'report', cat:'INCIDENT RESPONSE', time:120,
q:`After a security incident is resolved, what goes into your post-incident report, and why does it matter?`,
hint:{tr:'Özet, timeline, kök neden, etki, aksiyonlar, IoC listesi, sahipli/tarihli öneriler. Amaç: aynı olay bir daha aynı yoldan olmasın.', en:'Summary, timeline, root cause, impact, actions, IoC list, owned/dated recommendations. Goal: same incident can\'t recur the same way.'},
kw:[['summary','executive'],['timeline','chronolog'],['root cause','vector'],['impact','affected','business'],['actions','what we did','response steps'],['ioc','indicator','detection rule'],['recommend','lessons','improve','prevent']],
fu:[],
model:`My report starts with an executive summary in plain business language — what happened, the impact, and the current status. Then a detailed timeline from first detection to closure, the root cause and entry vector, an impact assessment covering systems, data and downtime, and every action we took from containment through recovery. I include the IoCs we extracted so they feed our detection rules, and I finish with recommendations that have owners and deadlines — because the real purpose of the report is making sure the same incident cannot happen the same way twice.`},

{id:'aisec', cat:'AI SECURITY', time:150,
q:`This role involves testing AI systems for security issues. What is prompt injection, and how would you approach testing an AI model for vulnerabilities?`,
hint:{tr:'Tanım: veriye gömülü talimat, direct vs indirect. Test: sistematik red-team — sınır senaryoları, injection payload\'ları, çıktı sızıntısı kontrolü, bulguları raporla. SOC disipliniyle köprü kur.', en:'Define: instructions hidden in data, direct vs indirect. Testing: systematic red-teaming — boundary cases, injection payloads, output leakage checks, document findings. Bridge to SOC discipline.'},
kw:[['instruction','override','hidden','embedded','malicious input'],['direct','indirect'],['jailbreak','bypass','guardrail','safety'],['test','red team','systematic','boundary','edge case'],['leak','sensitive','data','output'],['document','report','reproduc']],
fu:[{trig:['jailbreak'], q:`How is a jailbreak different from prompt injection?`},
    {trig:['indirect'], q:`Give me a realistic scenario where indirect prompt injection causes real damage in a company.`}],
model:`Prompt injection is when malicious instructions are hidden inside the data an AI model processes, trying to override its original instructions — directly by the user, or indirectly through content the model reads, like a web page or document, which is more dangerous because nobody typed the attack visibly. To test a model, I'd work like a red teamer with SOC discipline: build a systematic set of test cases — injection payloads, role-play jailbreaks, encoded requests, boundary scenarios — probe whether the model leaks sensitive data or performs unauthorized actions, and document every finding with reproduction steps and severity, exactly like writing up an incident. The goal is turning each successful attack into a new guardrail or detection rule.`},

{id:'python', cat:'EXERCISE', time:240,
q:`Practical exercise: You have a large SSH auth log file. Describe — or write in pseudocode — how you would find the top 10 attacking IP addresses using Python. Talk through your approach while you work.`,
hint:{tr:'Sesli anlat: dosyayı satır satır oku → "Failed password" satırlarını filtrele → regex ile IP çek → dict/Counter ile say → sırala, ilk 10. Kod yapısını söylemen yeterli.', en:'Think aloud: read line by line → filter "Failed password" lines → regex the IP → count with dict/Counter → sort, top 10. Describing the structure is enough.'},
kw:[['open','read','line by line','with open'],['failed','filter','if'],['regex','re\\.','pattern','extract','split'],['dict','counter','count'],['sort','top','most common','descend'],['memory','large file','efficient']],
fu:[{trig:['counter','most_common'], q:`Nice — why is reading line by line better than loading the whole file into memory here?`}],
model:`I'd read the file line by line with a context manager, so a large file never loads fully into memory. For each line containing "Failed password", I'd extract the IP with a regex like r"(\\d+\\.\\d+\\.\\d+\\.\\d+)". I'd count occurrences with collections.Counter, and finish with counter.most_common(10) to get the top 10 attacking IPs. In code: with open(path) as f, loop lines, if "Failed password" in line, match the regex, update the Counter — about ten lines total. As a bonus I'd cross-check the top IPs against threat intelligence before blocking them.`}
];

/* interview modes */
const IV_MODES = {
  full:  {n:13, label:{tr:'Tam simülasyon (~40-45 dk)', en:'Full simulation (~40-45 min)'}, total:45*60},
  quick: {n:6,  label:{tr:'Hızlı tur (~15-20 dk)',     en:'Quick round (~15-20 min)'},   total:20*60}
};

/* structure/communication signal word groups (EN) */
const IV_STRUCT = [
  {k:'direct',  words:['i would','my first','the difference','first of all','to answer','in short','it is ','there are '], lbl:{tr:'Direkt giriş', en:'Direct opening'}},
  {k:'sequence',words:['first','then','next','after that','second','finally','step'], lbl:{tr:'Sıralı anlatım', en:'Sequenced steps'}},
  {k:'reason',  words:['because','so that','the reason','in order to','which means','that way'], lbl:{tr:'Gerekçelendirme', en:'Reasoning'}},
  {k:'example', words:['for example','for instance','in my internship','in my experience','such as','like when','during my'], lbl:{tr:'Somut örnek', en:'Concrete example'}},
  {k:'outcome', words:['as a result','the outcome','this ensures','the goal','so we','which prevents','that is why','trade-off','tradeoff'], lbl:{tr:'Sonuç/trade-off', en:'Outcome/trade-off'}}
];
const IV_FILLERS = ['um','uh','umm','uhh','like,','you know','i mean','basically','actually','kind of','sort of'];
const IV_EXP_WORDS = ['internship','cyber4','iskur','işkur','negzel','my project','i built','i worked','i deployed','in my lab','hands-on','i led','my experience'];
