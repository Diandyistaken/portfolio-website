# FABLE HANDOFF — Portfolyo delight fikirleri (kalan liste)

Bu dosyayı yeni bir Fable oturumuna yapıştır. Amaç: aşağıdaki fikirleri
docs/delight-backlog.md sırasına göre 20'şerli partiler halinde siteye eklemek.

## PROJE
- Yol: C:/Users/mo_ma/OneDrive/Masaüstü/Projeler/Benim Web Sitem/portfolio
- Branch: redesign-quiet-machine (main'e merge edilir). Next.js 16 App Router,
  React 19, Tailwind 4, framer-motion (import { m } from "framer-motion"), TS strict.
- Tasarım "Quiet Machine": near-black zemin, TEK accent #5ec8ff = rgb(var(--accent-rgb)),
  mono/terminal estetiği. Yeni renk/font YOK, yeni npm bağımlılığı YOK.
- Site DİNAMİK render + nonce'lu CSP (src/proxy.ts) — SSG'ye döndürme.

## ZORUNLU KURALLAR (build gate reddeder)
1. Her animasyon: useReducedMotion() (framer) + usePerfLite() (from "./SectionBackdrop")
   ile korunur; ikisinde de statik fallback render et.
2. Strict react-hooks lint (react-compiler):
   - useEffect GÖVDESİNDE senkron setState YASAK (interval/timeout/event callback içinde serbest).
     İlk değer gerekiyorsa requestAnimationFrame(() => setX(...)) ile ver.
   - render'dan erişilebilir fonksiyonda Math.random() ve performance.now() YASAK
     (react-hooks/purity). Zamanlama döngüsünü EVENT HANDLER'IN İÇİNE kapat; rastgelelik
     yerine rotasyon ref sayacı veya Math.floor(performance.now()/47)%N kullan.
   - render sırasında ref.current OKUMA/YAZMA yasak → state yap.
   - JSX'te çıplak // yok; her listener/timer/observer cleanup'ta temizlenir.
3. Pointer-only oyuncaklar: effect içinde if (window.matchMedia("(hover: none)").matches) return;.
   Sürükleme: pointermove'da preventDefault + setPointerCapture.
4. Zamanlayıcılar zaman-bazlı (performance.now delta), tick-artışı değil.
5. Metin gerekiyorsa i18n tr/en/de + src/lib/i18n/types.ts. Terminal-artifact stamp'lar
   (ACCESS DENIED, GET /x 200 OK, 0x2A...) İngilizce SABİT kalır (site tarzı).
6. Mevcut davranışları BOZMA. Önce ilgili dosyayı tam oku, sonra cerrahi düzenle.
7. Global oyuncaklar ClientChrome.tsx'e next/dynamic {ssr:false} ile eklenir.
8. Proximity: herhangi bir öğeye data-prox data-prox-radius="N" koy → ProximityField
   o öğeye --prox (0..1) yazar; CSS'te var(--prox) ile tüket.

## AKIŞ (her parti)
1. Sıradaki ~20 [ ] fikri uygula (S önce, sonra M; farklı dosyalardan seç).
2. TEK SEFER en sonda: npx tsc --noEmit && npx eslint src --max-warnings=0 && npx vitest run && npm run build — hepsi yeşil.
3. backlog'da [x] yap; docs/delight-log.md'ye "Parti N" bölümü ekle.
4. Commit (conventional, co-author YOK) → push → main'e merge → main push → branch'e ff-only merge → git log ile doğrula.
5. npx vercel deploy --prod --yes + curl ile canlıda grep.

## MEVCUT ALTYAPI (yeniden yazma, kullan)
- ProximityField (--prox), Achievements (localStorage mm-achievements-v1, app:* CustomEvent),
  SysLog, RobotBuddy(+RobotChat), OverdriveHud, ClearanceHud, SonarReveal, CursorFx.
- CSS: .prox-chip .prox-icon .prox-link .prox-wake .prox-heat .prox-aura .prox-title
  .redact-near .target-frame .terminal-panel .divider-grid .footer-ecg .ops-cursor(blink).
- Event'ler: app:achievement-unlocked, app:email-copied, app:hack-egg, app:honeypot,
  app:robot-click/chat, app:terminal-extra, app:status-cycled.

## KALAN 65 FİKİR (sıra = backlog önceliği)

### 9. Pokeable Robot Head Physics
_(hook 9, M, global (robot buddy))_
Click-and-drag the robot's head: it follows the pointer on a stiff spring, and on release snaps back with overshoot while the eyes lag one beat behind on a softer secondary spring (jelly effect). A hard flick triggers one full dizzy wobble and a blink. Amplifies the existing buddy with pure physics charm.

### 10. Breach Meter (hold-to-charge CTA)
_(hook 9, M, hero CTA)_
Press-and-hold the hero Contact CTA to fill a thin ice-blue progress ring with a rising WebAudio synth pitch; release early and it decays with a spring wobble, hold to 100% and it 'breaches' — shockwave ring, 300ms text glitch nearby, then smooth-scroll to Contact. Normal tap still works, so the hold is a discoverable bonus with zero conversion friction.

### 33. Proximity Declassify Gallery
_(hook 8, M, showcase lab grid)_
Showcase thumbnails sit at 40% grayscale/dim; as the cursor approaches within ~200px (before hover) each image continuously interpolates toward full color, 1.04 scale, and an accent border glow proportional to distance (absorbs the dock-style magnify variant). The grid feels like a flashlight of clearance sweeping over classified material.

### 35. Cursor-Origin Forensic Zoom
_(hook 8, M, showcase lab lightbox)_
In the lightbox, the image zooms 2.5x anchored to the exact cursor point while a monospace HUD shows fake pixel coordinates and 'ANALYZING SECTOR [x,y]'; moving the mouse pans like an evidence viewer, ESC or click springs back (absorbs the rotary-crank zoom idea — cursor-anchored is more discoverable).

### 36. Throw-to-Dismiss Lightbox
_(hook 8, M, showcase lab)_
Lightbox images are draggable with full inertia: flick past a velocity threshold and the image sails off-screen with rotation proportional to throw angle, closing the lightbox (or advancing if thrown sideways); slow drags rubber-band back. The image scales down slightly while grabbed — tactile grow/shrink.

### 37. Wipe-Reveal Before/After Portrait
_(hook 8, M, hero photo)_
A second click-mode on the profile photo: a vertical accent line follows the cursor's x-position, revealing a duotone/wireframe rendition of the portrait on one side and the real photo on the other. Drag to scrub the split; release springs it back to 50/50.

### 39. Chain-Reaction Node Grid
_(hook 8, M, contact backdrop)_
A dormant grid of ~24 dim dots behind the contact heading: clicking any dot lights it and propagates to neighbors in an 80ms ripple with rising synth blips — one click cascades like a network worm, then the wave inverts and fades. Clicking mid-cascade spawns colliding waves.

### 41. Flick-Toss Skill Chips
_(hook 8, M, skills)_
Every skill chip is grabbable: flick one and it flies with real momentum, rubber-bands off the grid's invisible walls, then spring-snaps back into its slot with a damped wobble while neighbors shove aside on tiny repulsion springs. Reduced-motion: static chips with plain hover.

### 42. Slingshot Scroll Launcher
_(hook 8, M, global (scroll progress bar))_
The scroll progress bar gains a draggable thumb: pull it like a bowstring (the bar visibly stretches and bends with elastic tension), release, and the page launches into a momentum scroll matching pull distance, overshooting the target by a few pixels and springing back (absorbs the heading-tether grapple variant — same payoff, one clean control).

### 43. Scroll Payload Injector
_(hook 8, M, global (right edge rail))_
A thin fixed data-conduit line runs down the right edge; scrolling spawns hex-packet glyphs (0x5E, 0xC8...) that travel down at scroll velocity and burst in a tiny spark when they reach the section in view. Fast scrolling floods the conduit, idle drains it — the page feels like data being injected into each section.

### 44. Depth-Stacked Hero Parallax
_(hook 8, M, hero)_
The hero splits into 4 depth layers — background grid, photo, stats card, floating hex fragments — translating at different rates on scroll, with the photo growing ~4% toward the viewer while the grid recedes and blurs; mouse position adds a subtle secondary parallax on the photo layers (absorbs the mouse-driven portrait-slices pitch). Real depth on the very first scroll gesture.

### 45. De-Rez Hero Exit
_(hook 8, M, hero)_
Scrolling away from the hero dissolves the photo and stats card into horizontal scanline slices that stagger-slide apart and fade (clip-path strips, no canvas); scrolling back reassembles them in reverse (absorbs the clip-path-morph deconstruct variant). Continuous scrub, so visitors play it like a toy.

### 46. Hold-to-Declassify Words
_(hook 8, M, about + classified/NDA cards)_
Sensitive-looking words in the bio and NDA cards render as redaction bars; press-and-hold decrypts one character by character with a thin progress line, releasing early re-redacts with a scramble collapse. A full 700ms hold reveals the word permanently with a '[DECLASSIFIED]' micro-tag.

### 48. Recruiter Speedrun Timer
_(hook 8, M, terminal trigger + global HUD)_
Typing 'speedrun' in the About terminal starts a visible mm:ss.ms HUD timer; copying the email stops it and prints a rank card ('S-TIER: 00:41.2 — you skim like a senior recruiter'). Best time persists as a ghost target on retry. People screenshot rank cards.

### 51. Proximity Decrypt Labels
_(hook 8, M, classified/NDA cards)_
Card titles in the classified section sit as scrambled cipher text (█▓5f#) and resolve character-by-character as the cursor approaches — resolution percentage maps to distance, so backing away re-encrypts. Clearance-based declassification, scroll-into-view resolve on touch/reduced-motion.

### 52. Image Zoom Under Magnifier Scan
_(hook 8, M, showcase lab)_
Showcase images scale 0.92→1.0 tied to scroll centering, and cursor proximity adds a circular scan lens — a radial mask following the mouse showing the image slightly zoomed and sharpened with a faint grid overlay, fading in from 150px away (absorbs the standalone magnifier-dock pitch). Forensic photo analysis, no hover required.

### 53. Gyro Tilt World (Mobile)
_(hook 8, M, global (mobile))_
On mobile, device tilt drives spring-smoothed parallax: hero card, robot eyes, and spotlight highlights all lean with the phone at different spring stiffnesses so the scene feels suspended in fluid. Permission prompt styled as a terminal command; silent fallback on denial. Gives touch users their own version of the proximity magic.

### 54. KPI Odometer Scrub
_(hook 7, S, about (KPIs))_
About KPI numbers count with scroll position: entering the section, each figure rolls up odometer-style proportional to section progress, settling at the true value at full visibility; scrolling up rolls them back down. Pairs with the existing hover re-roll — scroll drives them, hover randomizes them.

### 62. Mass-Coupled Image Reveal
_(hook 7, S, showcase lab + projects)_
Showcase and project images scroll in like weights on springs: scale starts at 0.9 and overshoot past 1.0 is proportional to current scroll velocity — scroll slowly and they ease in politely, scroll fast and they visibly boing (absorbs the continuous velocity-breathing variant). Grow/shrink tied to felt momentum, not canned keyframes.

### 63. Robot Treat Toss
_(hook 9, L, global (robot extension))_
Click-and-drag on empty background spawns an ice-blue data-cube you can fling; it arcs with spring physics toward the robot, whose eyes visibly TRACK the flying cube before it catches it with a chomp, happy wiggle, and 'nom. 64 bytes.' bubble (absorbs the double-click fetch variant). Serves eye-tracking visibility and companion cuteness in one L-effort hit.

### 64. sudo Konami Root Shell
_(hook 9, L, global easter egg)_
Typing 'sudo' anywhere spawns a fake password prompt; two attempts print 'permission denied — nice try', the third 'succeeds' and drops a mini root shell with 3 joke commands (ls /secrets, cat resume.txt → downloads CV, exit) — with the Konami code as an alternate trigger that also skins kickers with sudo-prefixes for 20s (merged). Multi-step payoff people screenshot.

### 65. Recon Drone Companion
_(hook 9, L, global)_
The site's ONE auxiliary drone (merges the nav-escort and section-scan pitches): a palm-sized two-rotor drone docks on the robot, detaches when a nav link is clicked or a new section scrolls in, flies a curved path ahead of the scroll, hovers with a scanning light-cone over the section heading for 2s, then returns to dock. Clicking it mid-flight triggers a barrel roll; stays docked in perf-lite/reduced-motion.

### 66. Robot Rappel Descent
_(hook 9, L, global (robot extension))_
The robot grabs a dashed tether and rappels down the viewport edge as you scroll, position mapped to scroll progress with springy lag; fast scrolls swing it outward with wide eyes, and at the footer it lands, dusts off, and waves. Turns dead scroll distance into a companion journey — the single most character-rich L on the list.

### 67. Hidden Access Keys Hunt
_(hook 9, L, global, keys scattered)_
Five tiny key glyphs hidden across the site (divider chip, photo scanline, project row, footer ECG, skills chip); clicking one toasts 'KEY_03 ACQUIRED' and increments a HUD keyring, and all five unlock a hidden vault overlay with a personal note + resume download and a robot celebration. The strongest reason to explore every section.

### 68. Draggable ID Badge on a Lanyard
_(hook 9, L, hero)_
A clip-on 'SECURITY CLEARANCE' mini-badge hangs from a drawn SVG lanyard on the hero card: grab and fling it and it swings on a damped spring pendulum with the cord bending via path interpolation, scroll velocity kicks it like wind, and yanking hard widens the robot's eyes (merges the pendulum and hologram-flip pitches). Double-click flips it to a back face with fake barcode, mouse-angle hologram sheen, and 'ACCESS: GRANTED'.

### 69. Chat Demo CRT Boot-Up
_(hook 7, M, projects featured card)_
The featured chat-bot demo frame starts as a collapsed horizontal accent line (CRT off); entering the viewport it powers on — the line expands vertically with a flash, one scanline sweeps down, then the demo fades in. Scrolling far away powers it back down to the line.

### 70. Service Self-Test Boot
_(hook 7, M, services)_
Hovering a service card draws its border clockwise like a trace, then a one-line mini terminal at the card's foot types '$ ./pentest --status … [ACTIVE]' with an ice-blue OK stamp; each card has its own command so hovering all four feels like booting a system. On leave the trace retracts.

### 71. Services Card Deal-In
_(hook 7, M, services)_
Service cards enter with a scroll-scrubbed deal from a single deck point below the fold — each translating along its own arc into grid position like cards dealt onto a table, with reverse scroll sweeping them back into the deck. Continuous scrub, so users play it back and forth.

### 72. Section Boundary Scanline
_(hook 7, M, global (between sections))_
Crossing between major sections, a 1px full-width accent scanline sweeps the viewport exactly at the boundary's screen position (moving with scroll, not a timer), leaving a 300ms afterglow and stamping 'SECTOR 04 // PROJECTS'. Every boundary becomes a checkpoint.

### 73. Timeline Plunger Nodes
_(hook 7, M, experience timeline)_
Timeline dots become mechanical push-buttons: clicking depresses one with plunger travel and shadow, powering on that entry — text decrypt-scrambles in and a thin current line animates from dot to card. Clicking a lit node powers it down with a CRT-off collapse; lighting all triggers a full-timeline current sweep.

### 75. Timeline Exploit Chain
_(hook 7, M, experience)_
The timeline restyled as a kill-chain: numbered stages (RECON → FOOTHOLD → ESCALATION → PERSISTENCE for the current role) connected by a scroll-drawn line, each node popping with a lock-opening tick as the line reaches it. Hovering decrypts the stage label; scrolling up re-locks. Complements (or alternative-skins) the packet rider.

### 76. KPI Counter Slot-Machine Pull
_(hook 7, M, about KPIs)_
Pull any About KPI downward like a slot lever and release — all counters spin with motion blur, decelerate with spring overshoot, and land back on true values with a ka-chunk synth thud. A 1-in-8 chance they briefly land on '???' before correcting, with the robot commenting 'no, that one's real.'

### 77. Traceroute Contact Path
_(hook 7, M, contact)_
Clicking 'trace me' in contact animates a traceroute: hop lines type one by one (visitor.local → isp.gateway → edge.cdn → maksut.dev) with randomized fake latencies and a packet dot traveling a dotted SVG path between hops, ending on the email card with a pulse. Replays differently each run.

### 78. Packet Stream Divider
_(hook 7, M, dividers)_
The canonical divider-traffic idea (absorbs the signal-runner duplicate): mono glyph clusters ([SYN], [ACK], [DATA]) travel along a hairline at scroll-velocity-bound speed; packets within ~120px of the cursor get 'inspected' — pausing and expanding to show a fake hex payload tooltip before resuming. Proximity-driven, not hover.

### 79. Cursor Gravity Well Divider
_(hook 7, M, section dividers)_
Divider lines rendered as ~60 tiny ticks that bend vertically toward the cursor like iron filings within 200px, forming a smooth attraction curve traveling with the pointer. A two-second toy people drag back and forth repeatedly.

### 80. Coupled-Oscillator Divider Beads
_(hook 7, M, dividers)_
Divider chips ride a horizontal wire like beads connected by invisible springs: scroll velocity yanks the wire and beads swing and settle as coupled oscillators — middle first, neighbors following with propagating lag. Fast scroll-stops ripple visibly down the chain.

### 81. Man-in-the-Middle Tooltip
_(hook 7, M, projects (featured))_
Hovering the chat-bot demo shows an 'intercepted traffic' panel: fake request/response pairs scroll by in mono ('POST /api/chat → 200, 214ms') with one line comically redacted via the existing shimmer. Clicking a line decrypts it into a real one-sentence fact about how the project works — a tooltip that doubles as a mini case study.

### 82. Git-Diff Title Correction
_(hook 7, M, projects + experience titles)_
A section title entering the viewport first types a corrupted version ('PROJEKTZ'), then self-corrects diff-style: wrong chars strike through and slide out in dim gray, correct chars insert in accent with a '+' gutter flicker. Runs once per section per visit.

### 83. ASCII Light-Source Shadow
_(hook 7, M, hero)_
The hero name casts a shadow copy of itself at ~8% opacity whose offset direction and length respond to cursor position as if the cursor were a light source — move left, shadow stretches right; move close, it tightens. Subtle until noticed, then unforgettable.

### 86. Lightbox Chromatic Open
_(hook 7, M, showcase lightbox)_
Gallery images open via shared-layout expansion from their thumbnail while a one-frame RGB-split glitch (offset accent/white copies at low opacity) resolves into the sharp image, plus corner brackets flying in from the four screen corners to frame it.

### 88. WebAudio Sonar Ping Toggle
_(hook 7, M, global (navbar toggle))_
An 'AUDIO: OFF' toggle in the navbar HUD; enabled, key interactions emit whisper-quiet synthesized sonar blips — anchors ping low, easter eggs ping twice, the honeypot alarm gets a rising sweep. One AudioContext, localStorage persistence. Opt-in sound completes the terminal fantasy and amplifies every other toy on this list.

### 89. Proximity Lean Field
_(hook 7, M, skills + dividers)_
Skill and divider chips tilt and brighten toward accent as the cursor approaches (inverse-square falloff within ~140px), leaning away like grass in wind with per-chip springs so the field ripples with lag on a sweep. Physical lean variant of the proximity ask — pair with Torchlight or use standalone.

### 90. Pull-Back Goal Slingshots
_(hook 7, M, goals)_
Goal bars get a grabbable leading-edge handle: drag backward and the fill compresses with tension (edge glow brightening with stretch), release and it slingshots past its true value, wobbling like liquid before settling exactly right, the counter riding the overshoot.

### 95. Exit-Pixelate Gallery Images
_(hook 6, S, showcase lab)_
As a showcase image scrolls OUT of view it de-rezzes — a coarse CSS-gradient mosaic thickens with exit progress plus a brightness dip, like being buffered/encrypted away — and re-resolves crisply scrolling back in. Scrub-tied both directions.

### 96. Scroll-Scrub Image Mask Sweep
_(hook 6, S, showcase lab rows)_
Each showcase row image reveals via a diagonal mask sweeping open in sync with that row's scroll progress — a thin accent sliver at 0%, fully revealed with an edge shimmer at center. Scrolling back re-masks, like documents sealed and unsealed.

### 97. Lab Evidence Board
_(hook 6, S, showcase lab)_
Each image opened in the lightbox tags its thumbnail with a persistent 'ANALYZED' corner stamp; analyzing all flips the header to 'SHOWCASE // ALL EVIDENCE PROCESSED' with a decrypt-in and achievement toast. Turns the gallery into a checklist people finish.

### 98. Contact Uplink Handshake
_(hook 8, L, contact + robot)_
As contact approaches, a dashed SVG line scrubbed by scroll draws from the robot's corner to the email card, ending with 'HANDSHAKE ESTABLISHED — SYN/ACK' typing out; the robot's eyes track the line tip as it draws. Ties the mascot to the conversion moment.

### 99. Footer Gravity Well
_(hook 8, L, pre-footer + footer)_
The last 150vh acts as a gravity well: the ECG heartbeat quickens with proximity to page bottom, debris glyphs drift toward the footer at increasing parallax speed, and at bottom everything lands with the ECG settling into calm plus an 'END OF TRANSMISSION' stamp. Gives the page an actual ending instead of just stopping.

### 100. Projects Dossier Unstack
_(hook 8, L, projects)_
Project rows start stacked like classified folders (slight offsets, 1-2° rotation); scroll scrubs each folder out of the pile, straightening into row position as its redaction bar wipes away, and scrolling up restacks them. Reading projects = declassifying a dossier. (Alternative entrance to Port Scan Reveal — pick one per section.)

### 101. Scroll-Scrubbed Skill Compile
_(hook 8, L, skills)_
The skills grid pins for ~1.5 viewport heights; scrolling scrubs a fake compiler log ('compiling react.ts... [OK]') while chips light up in build order, each flashing as it links. Scrolling backward decompiles them in reverse. Skills become a build you perform.

### 102. Magnetic Grid Distortion Field
_(hook 8, L, global background (hero + about))_
A faint canvas dot-grid where dots within ~150px of the cursor repel outward and brighten to accent, spring-snapping back as it leaves — the hero/about background becomes a fluid the visitor stirs. Disabled in perf-lite.

### 103. Robot Trust Meter
_(hook 8, L, corner robot (extended))_
A hidden affinity score raised by petting the robot, consecutive-day visits, and easter eggs; at thresholds its behavior visibly upgrades — faster wider eye-tracking, waving when you return to the hero, and at max an occasional ice-blue heart-glyph blink. Never shown as a number; visitors discover the robot warming up to them.

### 104. Achievement Toast System
_(hook 8, L, global)_
One reusable bottom-center toast styled as a terminal log line — '[ACHIEVEMENT] first_contact — copied email' — firing for ~8 discoverable acts (email copy, chat demo finish, 3 lightbox opens, all chips hovered, hack egg...). The list is viewable via the HUD counter with locked ones shown as ██████. The backbone that makes the other gamification ideas cohere.

### 105. Ghost Trace Replay
_(hook 8, L, terminal command + overlay)_
The site samples the visitor's scroll depth (session only); typing 'trace' in the terminal renders their session as a vertical minimap with an animated dot replaying the journey and dwell-heat bands per section, ending 'deepest dwell: PROJECTS — good taste.' The site was profiling you back.

### 106. Recruiter Mode Switch
_(hook 8, L, global (navbar + sections))_
A labeled [RECRUITER MODE] toggle near the navbar: the robot salutes, then key hiring signals highlight in sequence — KPIs pulse and re-roll, the CV/contact CTA gains a persistent beacon, and a guided line auto-scrolls through experience → projects → contact with typed callouts. Toggle off restores normal state. Keep the auto-scroll skippable on any input.

### 107. Marquee Catch-and-Throw
_(hook 8, L, tech marquee / hero)_
Marquee logos are grabbable mid-scroll: snatch one out of the stream into a free physics chip you can toss around the hero with spring drag and edge bounces; flick it back and it merges into the flow with a stagger ripple. Left dropped, the robot stares at it until it auto-returns.

### 108. Tethered Drone Companion
_(hook 8, L, global (robot area))_
A tiny one-eyed drone floats near the robot on a thin elastic tether with real spring physics: it lags scroll with momentum, bobs on an idle sine, and grabbing and tossing it makes it boomerang around the robot before the tether reels it in — with the robot's eyes tracking it the whole time. (Overlaps Recon Drone; ship one drone, this is the physics-toy flavor.)

### 111. Marquee Payload Swap
_(hook 6, M, tech marquee)_
The marquee reacts to scroll depth: top of page shows tech names, but items glitch-swap one at a time into binary aliases (REACT → 0x52 45 41 43 54) as you descend, fully hex by the footer. The marquee visibly compiles down as you go deeper — subtle, but rewards the observant.

### 112. Skills Bingo Grid
_(hook 6, M, skills)_
Hovered/tapped chips get a faint persistent underline tick; completing a full row or column fires a line-sweep across it and logs 'SKILL VECTOR VERIFIED' via the achievement toast. Silently turns idle chip-hovering into a compulsive completion loop.

### 113. Section Boss Stamps
_(hook 6, M, experience timeline)_
Timeline entries get a small hollow hexagon that certifies when fully scrolled into view — stroke draws via pathLength and fills with a faint tint, persisted — with the header showing 'CERTIFIED 3/5'. Half-read visitors feel the pull to finish the career story.

### 114. Daily Cipher Chip
_(hook 6, M, dividers + about terminal)_
One divider chip per day shows a short date-seeded ROT13/hex word; typing the decoded word into the About terminal awards a CRYPTANALYST badge and the chip unlocks with a decrypt animation. A different cipher each day quietly rewards streaks with no streak UI.

### 115. Glyph Inspector Mode
_(hook 6, M, hero + section headings)_
Double-clicking a heading enters a 2-second inspector state: baseline grid and cap-height lines draw across the text and each letter gets a floating 9px accent-mono Unicode codepoint label ('U+004D') before fading out. A typographic x-ray for technical recruiters.

### 118. Packet Pong on the ECG Line
_(hook 7, L, footer)_
Clicking the footer heartbeat detaches a packet dot that bounces along the ECG trace with the cursor as a vertical paddle; each bounce speeds it up and increments a mono HITS counter, a miss plays the flatline gag before the heartbeat resumes. Auto-dismisses after 15s idle.

### 119. Idle Sentry Minigame
_(hook 7, L, robot buddy overlay)_
After 45s idle the robot deploys a one-button minigame: a radar sweep rotates past 3 blips — tap/space when the sweep crosses one to neutralize it; 3/3 awards a SENTRY badge and a robot high-five. Any other interaction dismisses it instantly; never auto-appears under reduced-motion.

### 120. Rubber-Band Project Deck
_(hook 6, L, projects)_
Featured projects as a horizontally flickable deck with real inertia, rubber-band resistance at the ends, and velocity-based card advance with overshoot-then-snap — the chat-bot demo card 'weighs more' via higher drag resistance as a subtle joke. Ranked last: it restructures an existing section's layout for moderate payoff; the ideas above enhance without rearchitecting.
