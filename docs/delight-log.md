# Delight Log — siteye eklenen her şeyin kaydı

> Kullanıcı talebi: "bunları şunları ekledim diye log sun." Her parti buraya
> işlenir; kaynak sıralama `delight-backlog.md`.

## Parti 11 — 2026-07-17 (Fable 5 · 20 fikir + #94 yumuşatma)

**Kullanıcı geri bildirimi:** #94 harf-aralığı "nefesi" mide bulandırıcıydı →
maks. 0.14em → 0.04em'e düşürüldü, eşik 2600→3400px/s, yay daha sönümlü.

Bölümler: **#70** hizmet kartı hover → SVG kenar izi çizilir + mini terminal
"$ ./pentest --status" yazar, [ACTIVE] damgası; **#71** hizmet kartları
scroll-scrub ile desteden dağıtılır (per-kart yay/rotasyon, geri sarılır);
**#73** timeline noktaları mekanik buton — tıkla → basılır, rol metni yeniden
decrypt olur + noktadan karta akım çizgisi; hepsine bas → omurga boyunca
parlama süpürmesi; **#82** Projeler + Deneyim başlıkları önce bozuk yazar,
sonra diff-stili düzeltir (yanlış harf üstü çizili kayar, doğrusu accent +
"+" gutter); **#76** KPI karosunu kol gibi aşağı çek-bırak → tüm sayaçlar
motion-blur ile döner, 8'de 1 "???" gösterip düzelir; **#77** Contact'ta
"$ traceroute maksut.dev" → hop hop sahte gecikmelerle rota + paket noktası,
sonunda e-posta kartı nabzı; **#90** hedef barına tutamaç — geri çek (kenar
parlaması artar), bırak → gerçek değeri aşıp sıvı gibi salınarak oturur.
Divider'lar: **#79** yan çizgiler ~14 minik tick — imleç 200px içinde demir
tozu gibi bükülür; **#80** "day" divider'ında 5 yaylı boncuk scroll hızıyla
ortadan dışa salınır; **#78** "sunset" divider'ında [SYN][ACK][DATA] paketleri
hairline üzerinde scroll-hızına bağlı akar, imleç 120px içinde "inspect"
(durur + hex payload tooltip).
Global: **#72** bölüm sınırında sayfaya çakılı 1px scanline + "SECTOR 04 //
PROJECTS" damgası (scroll durunca söner); **#88** navbar'da AUDIO OFF/ON —
açıkken anchor tık alçak blip, easter egg çift blip, honeypot yükselen süpürme
(tek AudioContext, localStorage); **#53** mobilde "$ enable --gyro-tilt"
terminal çipi → cihaz eğimi hero foto + stat kartını farklı derinliklerde
yatırır (iOS izni jest içinde, ret → sessiz statik); **#83** hero ismi %7
opaklıkta gölge kopyası — imleç ışık kaynağı gibi yönünü belirler.
Diğer: **#69** chat demo çerçevesi CRT gibi — görünüme girince yatay çizgiden
açılır (scanline flaşı), uzaklaşınca söner; **#81** demo hover → "INTERCEPTED
TRAFFIC" paneli, satıra tıkla → gerçek 1-cümle teknik detay; **#86** lightbox
açılışında 1-kare RGB-split + 4 köşeden uçan braketler; **#89** skill çipleri
+ divider pili imleçten rüzgârda çim gibi eğilir (ProximityField'e --prox-dx
yön kanalı eklendi); **#111** marquee scroll derinliğiyle tek tek hex alias'a
döner (REACT → 0x52 45 41 43 54), dipte tamamen hex; **#112** hover'lanan çip
kalıcı alt-çizgi tiki alır — bir kartın tüm çipleri → süpürme + "SKILL VECTOR
VERIFIED" satırı (localStorage).
Not: #75 exploit-chain atlandı (yayındaki #24 packet rider'ın alternatifi,
"birini seç"); #76'nın robot yorumu i18n eklememek için absorbe edildi.
Gate: tsc + eslint + vitest (34) + build yeşil.

## Parti 10 — 2026-07-17 (Fable 5 · 20 fikir + #10 doğrulama)

Vitrin (ShowcaseLab + Lightbox): **#33** thumbnail'lar gri/sönük durur, imleç
yaklaştıkça (--prox) renklenip parlar; **#52** imleci izleyen dairesel büyüteç
lens (radial mask + grid + %118 zoom); **#62** görseller scroll hızına göre
yay ile girer (hızlı scroll = "boing"); **#95** görünümden çıkarken kaba mozaik
+ karartma (scrub, geri dönüşlü); **#96** satır scroll'una bağlı diyagonal
maske süpürmesi; **#97** lightbox'ta açılan her görsele kalıcı "ANALYZED"
damgası, hepsi → "ALL EVIDENCE PROCESSED ✓"; **#35** lightbox'ta tıkla →
imleç noktasından 2.5x zoom + "ANALYZING SECTOR [x,y]" HUD, fare ile pan,
ESC/tık geri; **#36** lightbox görselini fırlat → yana atış ileri/geri geçer,
dikey atış kapatır, yavaş sürükleme lastikle geri yaslanır.
Hero: **#44** 4 katmanlı derinlik paralaksı (backdrop geri çekilip bulanır,
foto %4.5 büyür, stat kartı kendi hızında, hex parçaları en hızlı); **#45**
çıkışta foto+stat kartı scanline dilimlerine ayrılıp kayar (mask scrub, geri
scroll'da toplanır); **#37** portreye çift tık → wipe modu: dikey accent çizgi
imlecin x'ini izler, solda wireframe/duotone, sağda gerçek foto.
Robot: **#9** kafayı tut-sürükle (sert yay), bırakınca overshoot ile döner,
gözler jöle gibi bir tık gecikir; sert fiskede sersem sallanma + göz kısma.
Global: **#42** scroll bar'ına sürüklenebilir tutamaç — yay gibi çek-bırak →
sayfa momentum scroll ile fırlar, yay overshoot'uyla oturur (girdi iptal
eder); **#43** sağ kenar veri hattı — scroll hex-paket glyph'leri doğurur,
hız scroll hızına bağlı, dipte patlama; **#48** herhangi yere "speedrun" yaz →
mm:ss.ms HUD sayaç, e-posta kopyala → rank kartı (S/A/B/C-TIER) + localStorage
PB ghost.
Diğer: **#39** Contact başlığı arkasında 24 nokta — tıkla → 80ms Manhattan
dalgası komşulara yayılır, çakışan dalgalar toplanır; **#41** skill çipleri
fırlatılabilir (momentum + görünmez duvar + yaylı dönüş); **#46** NDA kartında
ikinci redaksiyon barı bas-tut → 700ms'de harf harf çözülür + "[DECLASSIFIED]",
erken bırak → geri şifrelenir; **#51** NDA kart başlıkları şifreli durur,
imleç mesafesiyle harf harf çözülür; **#54** About KPI'ları scroll konumuyla
odometre gibi iner-çıkar (hover re-roll üstte çalışır).
**#10 Breach Meter** Parti 8'de zaten eklenmişti — doğrulandı, backlog'da
işaretlendi. Tüm yeni metinler İngilizce terminal-artifact (i18n değişikliği yok).
Gate: tsc + eslint + vitest (34) + build yeşil.

## Parti 9 — 2026-07-17 (Fable 5 · 20 fikir)

Global imleç oyuncakları (CursorFx.tsx): **#59** combo sayacı (oyuncaklara hızlı
tık → x2/x3…, x10'da rozet), **#93** seçim hex okuması ("0x2A bytes"), **#117**
imleç durunca 3 takipçi paket treni.
Bölüm başlıkları (SectionHeading): **#92** scroll yönüne göre "▼ SCANNING/▲ REWIND",
**#84** başlık üzerinde imleç sallayınca aşırı-ısınma glitch, **#94** scroll hızıyla
harf aralığı nefesi.
Skills: **#85** herhangi bir yere tech adı yaz → eşleşen çip parlar + "grep: match"
toast, **#87** kart arkasında büyük x-ray ikon filigranı, **#116** çipler arasında
imleçten kaçan ateşböceği.
Diğer: **#91** tech marquee'de ara ara geçen minik robot; **#110** chat demo çerçevesi
imleç yaklaşınca ısınır; **#55** hero portresi imleçten hafif kaçar; **#60** About
terminali dönen ziyaretçiyi hatırlar ("streak: N"); **#74** deneyim timeline node'ları
imleç 120px içine girince dolup parlar; **#8** NDA redaksiyon barına bas-çek →
clip-path deliği açılır, "denied" ile kapanır; **#109** hero ikincil CTA'sında imleç
yaklaşınca çekim-ışını hâlesi; **#89/#110 yayılımı**: divider chip + showcase kartı +
services/education ikonları proximity parlaması aldı.

## Parti 8 — 2026-07-17 (Fable 5 · 10 fikir)

- **#10 Breach Meter:** hero birincil CTA'sını basılı tut → accent halka dolar,
  %100'de "breach" (şok dalgası + glitch) + iletişime yumuşak kaydırır; normal
  tık hâlâ çalışır.
- **#17 Robot scroll squint:** hızlı scroll'da robot gözlerini kısar.
- **#19 Robot footer selamı:** footer görünüme girince robot bir kez el sallar.
- **#47 About manifesto:** Hakkımda'da scroll'a göre yazılıp geri silinen bir
  cümle ("Anlamak için kırarım…").
- **#49 Sonar Reveal:** boş zemine çift tıkla → yayılan sonar halkası + 1.5sn
  tüm oyuncakların çerçevesi belirir (keşif meta-oyuncağı).
- **#50 Marquee wake:** tech marquee'de imlece yakın öğeler büyüyüp accent'e döner.
- **#56 Footer checksum:** footer'da görünüme girince sahte SHA "hesaplanır",
  "DOĞRULANDI ✓" damgası; tıkla → yeniden ("güven sorunları mı?").
- **#57 Uptime odometre:** hero stat kartında canlı sayan "UPTIME Xd HH:MM:SS".
- **#58 Status LED rack:** UPTIME/FOCUS/COFFEE/DEPLOY LED'leri kendi ritminde
  yanıp söner; hover'da ipucu, COFFEE'ye tık daha hızlı yanar.
- **#61 Threat-level nav underline:** navbar linklerinin alt çizgisi imleç
  yaklaştıkça (prox) dolar — hedef kilitleme hissi.

## Parti 7 — 2026-07-17 (Fable 5 · 10 fikir)

- **#7 Clearance Check Denied:** NDA kartına tıkla → tarama çizgisi süpürür,
  "YETKİ DOĞRULANIYOR" yazar, kart sarsılır, "[ ACCESS DENIED ]" damgası vurur;
  redaksiyon barında 400ms bir teasing kelime (fintech/gov/retail/ai) belirir;
  tekrar tıklamada giderek kuruyan ret cümleleri.
- **#12 Typable Ghost Prompt:** İletişim başlığının altında "$ say_hello ▊"
  satırı — tıklayınca gerçekten yazabilirsin, Enter → esprili cevap yazılır +
  e-posta kartı nabız atar.
- **#23 Clearance Scroll HUD:** sol üstte scroll derinliğine göre GUEST → USER
  → ANALYST → ROOT keycard-flip; ROOT'ta "tam erişim: beni işe al".
- **#27 Elastic Email:** e-postayı yatay sürükle → macun gibi uzar, eşiği
  geçince kopyalar + geri toplanır (normal tık hâlâ mailto).
- **#30 Goal Bar Overclock:** hedef kartına hızlı tıkla → bar +%2 dolar,
  basınç göstergesi gibi geri sızar; %100'de "PROGRAMIN ÖNÜNDE" etiketi.
- **#31 Goal Loader Bot:** her hedef barının ucunda küçük bir bot yürür/oturur.
- **#34 Project Peek-Zoom:** metin proje satırında gezerken imleci takip eden
  yüzen terminal kartı (başlık + etiket + "GET /id → 200 OK · build 47s").
- **#38 Hero Name Letter Drop:** isme tıkla → harfler fizikle düşüp zıplayıp
  yerine oturur (5sn bekleme).
- **#40 Firewall Brick-Break:** "day" divider'ında 8 FW-0x tuğlası — iki tıkta
  kırılıp parçalanır, hepsi kırılınca "güvenlik duvarı AŞILDI", 10sn sonra
  yeniden örülür.
- **#20 Robot Sentry:** 14sn boşta robot dönen radar konisi açar; fare gelince
  "hareket algılandı — sektör 7" der.

## Parti 6 — 2026-07-17 (loop iter 1 · 6 fikir)

- **#22 Velocity Overdrive HUD:** hızlı scroll'da sağ üstte px/s hız göstergesi
  belirir (kırmızı çizgiye dayanan bar), yavaşlayınca kaybolur.
- **#24 Packet Rider Timeline:** Deneyim çizgisi çizilirken üzerinde parlayan
  bir "paket" noktası aşağı doğru yol alır.
- **#25 Port Scan Reveal:** proje satırları görünüme girerken üzerinden tarama
  çizgisi geçer; hover'da satır numarası ":PORT open" olur.
- **#26 Data Uplink Beam:** iletişim e-postası kopyalanınca karttan yukarı bir
  ışın huzmesi fırlar.
- **#28 Session Receipt:** footer'a gelince "OTURUM FİŞİ" termal fiş açılır —
  gezilen bölüm, açılan rozet (n/8), sayfada geçen süre + teşekkür.
- **#29 Goal Progress Decryption Bars:** hedef yüzdeleri rakamları karıştırıp
  "şifre çözer" gibi gerçek değere oturur (karta tıklayınca yeniden).

## Parti 5 — 2026-07-17 (RobotChat + 8 backlog fikri)

- **ROBOTCHAT (özel istek):** robota tıklayınca açılan büyük hali — tam gövdeli
  (kafa+gövde+kollar+bacaklar+nabız çekirdeği) CSS-3D robot; gözleri panelde de
  imleci izler; ağzı konuşurken ses dalgası olur; **hafif sohbet zekâsı**
  (16 niyet × 3 dil, anahtar-kelime skorlaması): Maksut/yetenek/proje/deneyim/
  iletişim/CV/freelance sorularına cevap verir, şaka yapar, "hack" dersen
  matrix yağmurunu gerçekten tetikler; hızlı-cevap çipleri; yazma animasyonu;
  ESC/X ile kapanır. 5 mesaj = "Sohbet Kutusu" rozeti (8.)
- **#5 Decrypt-on-Approach Email:** iletişim e-postası şifreli karakterlerle
  durur, imleç karta yaklaştıkça karakter karakter çözülür; SİNYAL ▂▄▆█ + %
  göstergesi. mailto her zaman gerçek (SEO/a11y bozulmaz).
- **#6 Robot Section Moods:** göz bebekleri bölüme göre şekil değiştirir —
  Saha Kayıtları'nda `+` (crosshair), Hakkımda terminalinde `>`, Hedefler'de `▲`.
- **#13 NDA Clearance Level:** rozetler yetki sayar; 3+ rozette KAYIT-01
  kartında önceden onaylı bir ek cümle açılır (YETKİ SEVİYESİ: n/3 sayacı).
- **#15 Redacted-Until-Near Stats:** hero istatistik kartındaki sayılar
  bulanık (sansürlü) durur, imleç yaklaşınca netleşir.
- **#16 Brute-Force Skill Chips:** yetenek çipleri hover'da karakter karakter
  "kırılır" (şifre brute-force estetiği).
- **#18 Number Base Cycler:** KPI sayılarına tıkla → decimal → hex → binary
  döner (0x7EA, 0b11111101010…).
- **#21 Proximity Ignition Headlines:** tüm bölüm başlıkları imleç yaklaştıkça
  accent parlaması alır.
- **#32 Gallery Focal Zoom:** vitrin ekran görüntüleri hover-zoom'u imlecin
  olduğu noktadan büyütür (transform-origin = spotlight).

## Parti 4 — 2026-07-17 (görünür dörtlü)

- **#2 Honeypot Button:** footer'da `[ SAKIN TIKLAMA — YÖNETİCİ ]` → sahte
  sızma skiti: ekran-kenarı alarm çerçevesi, ziyaretçi profili (tarayıcı ·
  viewport · tık sayısı), "zararsız (muhtemelen işe alımcı) ✓" kararı; robot
  kızar; "Bal Küpü" rozeti; ikinci tıkta kuru cevap.
- **#11 Live Syslog Ticker:** footer üstünde canlı `tail -f` şeridi — bölüm
  geçişleri, robot tıkları, easter egg'ler, scroll patlamaları, 15sn sessizlik.
- **#3 Terminal Sentry:** Hakkımda terminali imleci fark eder — canlı px
  sayaçlı "yakınlık uyarısı", uzaklaşınca "hedef kayboldu_".
- Proximity sistemi güçlendirildi (yarıçap 240→300, parlama +%50).

## Parti 3 — 2026-07-17 (güvenlik + Lighthouse)

- securityheaders.com A→A+ paketi: nonce'lu CSP (`strict-dynamic`, proxy.ts),
  Permissions-Policy (hepsi kapalı), COOP; dinamik render'a geçiş.
- Lighthouse: yasaklı ARIA düzeltmeleri (sr-only), kontrast yükseltmeleri,
  scanline/id-scan/footer-ecg transform-only (compositor), AVIF, modern
  browserslist (eski JS -14KiB), hero görsel sizes/quality (mobil LCP),
  `public/llms.txt`.

## Parti 2 — 2026-07-16 gecesi (çekirdek sistemler)

- **ProximityField:** imleç yaklaştıkça renklenen site-geneli sistem (58 öğe:
  çipler, ikonlar, footer linkleri).
- **SectionRail:** sağ kenarda 11 bölüm noktası — aktif parlar, hover etiket,
  tık radar-ping.
- **Achievements:** localStorage rozet sistemi + sol alt toast (şimdi 8 rozet).
- **RobotBuddy v2:** giriş selamı + el sallayan kollar, target-lock gözler
  (mesafeyle büyür, <70px'te "!" ürkmesi), boşta göz devriyesi, scroll'da
  yaslanma, 3D zemin gölgesi.
- Hero paralaks çıkışı + Ken Burns portre; Deneyim çizgisi scroll-scrub +
  yanan düğümler; site-geneli büyüyerek-giriş; footer ok fırlatma.

## Parti 1 — 2026-07-16 (ilk 15 + bölüm)

- 15 mikro-etkileşim: nav scramble, bölüm HUD, radar ping, magnetic CTA,
  marquee hız eğilmesi, KPI re-roll, divider retype, hero rozet döngüsü,
  "hack"/"kahve" easter egg + konsol selamı, kicker decrypt, footer EKG,
  target-frame braketleri, redaksiyon parlaması, terminal bonus komutları,
  AboutTerminal (15sn video yerine).
- `[ 07 ] Saha Kayıtları` NDA bölümü (4 anonim iş kartı).
