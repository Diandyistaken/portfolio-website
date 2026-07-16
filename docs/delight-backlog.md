# Delight Backlog — 160 fikirden süzülmüş sıralı liste (120 hayatta)

> 2026-07-16 gecesi 10 merceğe fan-out edilmiş çok-ajanlı üretimden (160 ham fikir)
> dedupe+hook-skorlamayla süzüldü. Sıra = hook/emek oranı. `[x]` = yayında,
> `[ ]` = bekliyor. Loop bu listeyi YUKARIDAN AŞAĞI tüketir.
>
> Uygulama kuralları: tek accent (#5ec8ff), Quiet Machine estetiği, yeni npm
> bağımlılığı yok, perf-lite + prefers-reduced-motion korumalı, i18n tr/en/de
> (types.ts dahil), strict react-hooks lint (setState-in-effect yasak,
> render'da ref okuma yasak), her partide: tsc+eslint+vitest+build yeşil.

- [x] **1. Target-Lock Robot Eyes** (hook 10, S, global (robot buddy))
  Merge of the two robot-eye upgrades: pupils get 2x travel with parallax between eye-white and pupil layers, tracking gain and pupil size scale with cursor distance (lazy glance far away, wide-eyed at <250px, spring flinch with a '!' bubble at <60px), and hovering any interactive element snaps the eyes to it with tiny corner brackets flashing on the pupils. Locking onto the CTA triggers one excited blink. Directly answers the 'more noticeable eye-tracking' ask by extending existing math, not rebuilding.
  _tech: extend existing tracking math with distance-scaled gain, framer springs, pointerover delegation_

- [x] **2. Honeypot Button** (hook 10, M, footer / global overlay)
  A bracketed 'DO NOT CLICK — ADMIN ONLY' button near the footer. Clicking triggers an 'INTRUSION DETECTED' skit: scanning border sweep on screen edges, the robot wakes and glares at the cursor, a mono toast logs the visitor's fake attacker profile (browser, viewport, click count), then stands down with 'threat assessed: harmless recruiter'. Second click gets a drier log line — highly screenshot-shareable.
  _tech: framer overlay + existing robot API hook, navigator data_

- [x] **3. Terminal Sentry Prompt** (hook 9, M, about terminal)
  The About terminal's cursor block blinks faster as the pointer approaches, and at <150px a ghost line types 'proximity alert: visitor detected [distance: 142px]' with the live px number counting down in real time. Backing away types 'target lost'. Absurdly on-brand screenshot bait that makes the terminal feel sentient.
  _tech: distance readout piped into existing typed-terminal component, throttled updates_

- [x] **4. Proximity Threat-Level Glow** (hook 9, M, global (cards, chips, headings))
  THE unified site-wide proximity system (merges five duplicate card-glow pitches): one rAF loop measures cursor distance to registered elements (cards, chips, kickers, buttons) and writes a --threat CSS var 0→1 within ~220px, driving border alpha, accent glow intensity, and a tiny corner label ticking IDLE → TRACKING → LOCKED on cards. The whole page lights up around the cursor like a torch in a dark server room; disables cleanly in perf-lite.
  _tech: single rAF distance loop writing CSS vars, pure CSS transitions as consumers_

- [x] **5. Decrypt-on-Approach Email** (hook 9, M, contact)
  The contact email displays as shifting hex/cipher garbage; each character resolves based on cursor distance, with ASCII signal bars ▂▄▆█ and a 'SIGNAL: 43%…97%' readout filling alongside (merged from Signal-Strength Contact Card). Walk away and it re-encrypts; click still copies instantly, confirmed by a 3-line SYN → SYN-ACK → COPIED handshake typing in. Keyboard focus and touch resolve instantly for accessibility.
  _tech: per-char distance interpolation + charset scramble, framer for handshake typing_

- [x] **6. Robot Section Moods** (hook 9, M, global (corner robot))
  The robot's eye shape morphs per section: crosshair pupils in classified/NDA, '>' prompt eyes at the About terminal, upward-arrow eyes at goals, one heart-blink at the showcase gallery. Each mood is a 300ms morph driven by the existing navbar section-HUD state, so the eyes visibly react to where you are.
  _tech: framer animate between SVG path/clip variants driven by existing section HUD state_

- [ ] **7. Clearance Check Denied** (hook 9, M, classified/NDA cards)
  The consolidated NDA click interaction (merges interrogation + firewall gate): approaching a card raises a faint hairline firewall grid with an 'access attempts' counter; clicking runs a mock auth — scan bar sweep, 'VERIFYING CLEARANCE…' types, then a bracketed ACCESS DENIED stamp slams in with a 4px shake while one redaction bar flickers to reveal a single teasing word ('fintech', 'gov') for 400ms. Repeat clicks pull escalating deadpan denials, ending with the robot's bubble: 'I've said too much.'
  _tech: pointer-distance CSS var + framer animate() timeline, clip-path reveal, click counter state_

- [ ] **8. NDA Card Redaction Peel** (hook 9, M, classified/NDA cards)
  Press-and-HOLD on a redaction bar slowly peels a circular clip-path hole around the cursor, revealing blueprint-style wireframe underneath — but at ~70% radius a 'CLEARANCE DENIED' stamp slams in and the hole snaps shut with an elastic slap (merged with the drag-peel sticker variant). Teases without ever showing anything, which IS the joke.
  _tech: pointerdown timer driving clip-path circle radius, high-stiffness spring release, framer stamp_

- [ ] **9. Pokeable Robot Head Physics** (hook 9, M, global (robot buddy))
  Click-and-drag the robot's head: it follows the pointer on a stiff spring, and on release snaps back with overshoot while the eyes lag one beat behind on a softer secondary spring (jelly effect). A hard flick triggers one full dizzy wobble and a blink. Amplifies the existing buddy with pure physics charm.
  _tech: framer useSpring chain (head spring → eye spring), pointer velocity on release_

- [ ] **10. Breach Meter (hold-to-charge CTA)** (hook 9, M, hero CTA)
  Press-and-hold the hero Contact CTA to fill a thin ice-blue progress ring with a rising WebAudio synth pitch; release early and it decays with a spring wobble, hold to 100% and it 'breaches' — shockwave ring, 300ms text glitch nearby, then smooth-scroll to Contact. Normal tap still works, so the hold is a discoverable bonus with zero conversion friction.
  _tech: framer useMotionValue ring, pointerdown/up timers, WebAudio oscillator_

- [x] **11. Live Syslog Ticker** (hook 9, M, footer / global)
  A one-line monospace log stream pinned above the footer typing real visitor events in syslog format: '14:02:11 [nav] user hovered SERVICES', '[idle] 12s — robot yawns', '[scroll] velocity 2400px/s'. Old lines scroll up and fade like tail -f. Makes the site feel alive and watching — exactly the robot's spirit, and recruiters screenshot this.
  _tech: event bus + typed-line queue component, CSS translate stack_

- [ ] **12. Typable Ghost Prompt** (hook 9, M, contact)
  The contact heading is a live prompt ('$ say_hello _') with a blinking block caret that actually accepts keystrokes when clicked; whatever the visitor types renders in real time, and Enter triggers a cheeky typed response ('message queued... just kidding, use the email button →') plus a pulse on the email card. A static heading becomes a toy people show friends.
  _tech: hidden input capture + typed-text render, framer caret blink_

- [x] **13. NDA Clearance Level** (hook 9, M, classified/NDA section)
  The classified section shows 'CLEARANCE: LEVEL 0' for new visitors; achievements earned elsewhere raise the level, and at LEVEL 3 one NDA card's redaction bars animate open to reveal one extra real, pre-approved sentence of detail. Converts play into actual recruiter-relevant content — the strongest possible reward loop on the site.
  _tech: achievement count from localStorage + framer clip-path reveal_

- [x] **14. Torchlight Skill Chips** (hook 8, S, skills grid)
  Skill chips idle at 35% opacity in dim gray-blue; a ~200px cursor radius lights them to full accent and lifts them 2px, with half-lit chips at the falloff edge making the gradient itself the visual (absorbs the signal-scanner variant — nearest chips can show a tiny 4-bar signal indicator). Sweeping the mouse across the grid feels like a flashlight over a wall of tools.
  _tech: per-chip --d CSS variable set in one rAF loop, CSS radial falloff_

- [x] **15. Redacted-Until-Near Stats** (hook 8, S, hero stats card)
  Hero stat card numbers display as ▮▮▮ redaction blocks that flicker-decode into real digits when the cursor comes within ~180px, then re-redact after 2s of absence. Forces a delightful double-take in the very first viewport; decoded-by-default on touch and reduced-motion.
  _tech: distance gate + existing decrypt-text pattern reuse_

- [x] **16. Brute-Force Skill Chips** (hook 8, S, skills)
  Clicking any skill chip runs a 300ms cracking animation — the label cycles random chars with a small [▓▓▓░░] bar inside the chip, then resolves to 'ACCESS GRANTED: <skill> — 4 yrs' revealing a hidden proficiency detail (absorbs the squish/overload variant). Cracked chips keep a subtle unlocked-padlock glyph, rewarding visitors who click everything.
  _tech: char scramble interval + framer, local state_

- [ ] **17. Robot Copies Your Scroll Speed** (hook 8, S, global (corner robot))
  The robot's body language maps to scroll velocity: fast scrolling makes it lean hard into the direction with wind-line dashes and squinted eyes, slow scrolling gets a relaxed sway, and a sudden stop makes it wobble forward once like braking. Reuses the velocity value already computed for the marquee skew — one new consumer, big personality gain.
  _tech: framer useVelocity mapped to rotate/skew springs on robot root_

- [x] **18. Number Base Cycler** (hook 8, S, hero stats + about KPIs + goals)
  Every stat number becomes clickable: each click cycles dec → hex (0x1C) → binary → back with a vertical odometer flip per digit and a tiny 'BIN' base label fading in beside it. A zero-cost engineer flex that makes people click every number on the page.
  _tech: shared StatValue component, framer digit flip, toString(radix)_

- [ ] **19. Robot Waves Hello/Goodbye** (hook 8, M, global (corner robot))
  The robot raises a tiny articulated arm and waves on first arrival (after the intro loader) and again at the footer; near the contact section it points upward at the email card. The arm is two SVG segments on spring rotations, staying within the robot's existing silhouette language.
  _tech: framer spring rotations on SVG arm groups + IntersectionObserver triggers_

- [ ] **20. Robot Sentry Mode** (hook 8, M, global (robot buddy))
  After 20s idle the robot deploys a rotating radar cone — a soft accent gradient wedge sweeping from its head (absorbs the separate idle-patrol pitch). When the mouse re-enters, the cone snaps to the cursor, eyes go wide, and a bubble logs 'movement detected, sector 7'. Ties the eye-tracking to a visible beam so the tracking finally reads as deliberate surveillance.
  _tech: idle timer + framer rotate, conic-gradient wedge_

- [x] **21. Proximity Ignition Headlines** (hook 8, M, global (headings + hero name))
  Section headings (and the hero name — merged from the hero-only variant) respond per-letter to cursor approach within ~120px: each glyph independently ramps weight and blends from dim gray toward #5ec8ff with distance falloff, so a hot zone of ignited letters follows the cursor across the text, springing back with slight overshoot. The typographic answer to 'color shifts as the mouse approaches'.
  _tech: framer motion values + single mousemove listener, per-char spans, color/weight interpolation_

- [ ] **22. Velocity Overdrive HUD** (hook 8, M, global corner HUD)
  Scroll past a velocity threshold and a tiny corner HUD appears: 'SCROLL VELOCITY: 4,213 px/s ⚠ THROTTLING', with the cursor ring briefly stretching into a motion-blur ellipse; the session's fastest speed is kept as a mini high-score. Turns raw scrolling into a toy people deliberately flick to max out.
  _tech: framer useVelocity + spring, sessionStorage high score_

- [ ] **23. Clearance-Level Scroll HUD** (hook 8, M, global (fixed HUD))
  A fixed mono badge upgrades your access level as you scroll deeper — GUEST → USER → ANALYST → ROOT — each transition flashing 'privilege escalation granted' with a keycard-flip animation (absorbs the sectors-cleared counter: cleared sections tick alongside, persisted in localStorage). Reaching the footer at ROOT prints a one-time 'full access: hire me'.
  _tech: scroll progress thresholds + IntersectionObserver + framer, localStorage_

- [ ] **24. Packet Rider Timeline** (hook 8, M, experience)
  The canonical timeline companion (merges three near-identical pitches): a glowing packet blip with a dashed tail rides the experience timeline spine, position bound to scroll progress; reaching a node makes it flare, emit one ping ring, and re-type its date stamp with a traceroute-style 'hop 3: [OK]' flavor. Scrolling up sends the packet back, so visitors scrub it like a toy.
  _tech: framer useScroll → motion value along SVG spine, ping rings, decrypt reuse_

- [ ] **25. Port Scan Reveal** (hook 8, M, projects)
  As the projects section scrolls in, a fast nmap-style line rakes down the list — each row flashes 'PORT 3000/tcp ... OPEN' in mono before real content decrypts in, staggered top-to-bottom and tied to scroll progress so scrubbing back re-closes ports. Full sweep once per visit, subtle one-row re-ping afterwards.
  _tech: framer useScroll/useInView + staggered variants, text swap_

- [ ] **26. Data Uplink Beam** (hook 8, M, contact)
  When the email is copied, a dashed beam of ascending packet dots streams from the contact card up to the corner robot, whose antenna LED blinks in 'receiving' mode before it gives a thumbs-up eye animation and a bubble: 'transmission received.' Turns the site's single most important action into its best micro-moment.
  _tech: framer staggered dot ascent between two DOM rects + robot state hook_

- [ ] **27. Elastic Email Stretch-Snap** (hook 8, M, contact)
  Press-and-drag the email pill and it stretches like taffy (scaleX with a resistance curve) with the accent border tightening; pull past the threshold and it SNAPS — copies the email, recoils with a jelly wobble, and fires a short WebAudio plink. Plain click still copies normally, so this is a bonus, not friction (superseded the two-stage detonator idea for exactly that reason).
  _tech: framer drag with diminishing-returns transform, spring recoil, WebAudio blip_

- [ ] **28. Session Receipt Shutdown** (hook 8, M, footer)
  At the true bottom of the footer, a mini terminal types a personalized session receipt: real uptime ('session: 4m 12s'), sections visited, easter eggs found — ending with 'connection persisted. see you soon.' Stats come from an in-memory tracker, no storage needed.
  _tech: IntersectionObserver at page end + runtime counters + existing typer_

- [ ] **29. Goal Progress Decryption Bars** (hook 8, M, goals)
  The canonical goals treatment (merges three scroll-fill pitches): bars render as terminal gauges [███████░░░] whose fill is scroll-linked, and the covered portion shows scrambled glyphs that resolve into readable label text exactly at the fill edge — watching the bar fill literally decrypts the goal. Completed goals stamp a 'CRACKED' tag; in-progress ones end with a blinking cursor; scrolling back re-encrypts.
  _tech: useScroll progress → char count + per-char resolve keyed to fill %_

- [ ] **30. Goal Bar Overclock** (hook 8, M, goals)
  Rapid-clicking a goal bar nudges it +2% per click with a satisfying tick, but it constantly leaks back toward its true value like a pressure gauge (absorbs the +1% co-op button). Pushing to 100% 'overclocks' it — flash, spark burst, temporary 'AHEAD OF SCHEDULE' tag, comedic drain-back hiss, and the robot side-eyes you for spamming.
  _tech: framer motion value + rAF decay loop, click accumulator_

- [ ] **31. Goal Progress Loader Bot** (hook 8, M, goals)
  A micro-bot walks along each goals bar pushing the fill forward as it animates into view, wiping sweat-drop dashes at 25/50/75% milestones; bars at 100% show it sitting on the end cap with slow-blinking 'done' eyes. Reduced motion: bars just fill normally.
  _tech: framer timeline synced to bar width, SVG micro-bot with 2 walk frames_

- [x] **32. Gallery Focal Zoom** (hook 8, M, showcase lab)
  The showcase image nearest viewport center scales to 1.06 at full brightness while neighbors shrink to 0.94 and dim to 60%, continuously interpolated from scroll position like a camera racking focus through the gallery (merged duplicate from two lenses). Clicking the focused image opens the existing lightbox via shared-layout zoom. Directly answers 'images that grow/shrink'.
  _tech: useScroll element offsets → useTransform scale/filter, framer layoutId zoom_

- [ ] **33. Proximity Declassify Gallery** (hook 8, M, showcase lab grid)
  Showcase thumbnails sit at 40% grayscale/dim; as the cursor approaches within ~200px (before hover) each image continuously interpolates toward full color, 1.04 scale, and an accent border glow proportional to distance (absorbs the dock-style magnify variant). The grid feels like a flashlight of clearance sweeping over classified material.
  _tech: single mousemove + per-tile distance calc setting CSS vars (filter/scale/border-alpha)_

- [ ] **34. Thumbnail Peek-Zoom on Project Rows** (hook 8, M, projects rows)
  Moving along a text-first project row summons a floating thumbnail preview that follows the cursor, scaling from 0 with a spring and rotating subtly toward movement direction; a right-aligned status line types 'GET /project → 200 OK · build 47s' (merged from the deploy-log variant). Leaving the row collapses it into the row's accent dot.
  _tech: framer follow-cursor motion value + velocity rotate, portal-positioned img, typer reuse_

- [ ] **35. Cursor-Origin Forensic Zoom** (hook 8, M, showcase lab lightbox)
  In the lightbox, the image zooms 2.5x anchored to the exact cursor point while a monospace HUD shows fake pixel coordinates and 'ANALYZING SECTOR [x,y]'; moving the mouse pans like an evidence viewer, ESC or click springs back (absorbs the rotary-crank zoom idea — cursor-anchored is more discoverable).
  _tech: framer motion + pointer events, transform-origin from mousemove_

- [ ] **36. Throw-to-Dismiss Lightbox** (hook 8, M, showcase lab)
  Lightbox images are draggable with full inertia: flick past a velocity threshold and the image sails off-screen with rotation proportional to throw angle, closing the lightbox (or advancing if thrown sideways); slow drags rubber-band back. The image scales down slightly while grabbed — tactile grow/shrink.
  _tech: framer drag + dragMomentum + velocity threshold on dragEnd_

- [ ] **37. Wipe-Reveal Before/After Portrait** (hook 8, M, hero photo)
  A second click-mode on the profile photo: a vertical accent line follows the cursor's x-position, revealing a duotone/wireframe rendition of the portrait on one side and the real photo on the other. Drag to scrub the split; release springs it back to 50/50.
  _tech: two stacked layers + clip-path inset from pointermove, framer spring on release_

- [ ] **38. Hero Name Letter Drop** (hook 8, M, hero)
  Clicking the big hero name detonates it: each letter becomes a physics body that drops, bounces once on an invisible floor, scatters with slight rotation, then flies back and snaps into place with a magnetic spring and an accent flash on landing. One-per-5s cooldown keeps it special.
  _tech: framer per-letter springs on staggered spans, no canvas_

- [ ] **39. Chain-Reaction Node Grid** (hook 8, M, contact backdrop)
  A dormant grid of ~24 dim dots behind the contact heading: clicking any dot lights it and propagates to neighbors in an 80ms ripple with rising synth blips — one click cascades like a network worm, then the wave inverts and fades. Clicking mid-cascade spawns colliding waves.
  _tech: BFS timing over grid state, framer scale/glow, WebAudio blips_

- [ ] **40. Firewall Brick-Break Divider** (hook 8, M, divider before projects/NDA)
  One divider renders as a row of ascii 'FIREWALL' bricks: first click cracks a brick with fissure lines, second shatters it into falling particles. Break them all and the divider retypes as 'FIREWALL BYPASSED — welcome in', then rebuilds brick-by-brick after 10s so the toy is replayable.
  _tech: framer exit particles, state array, CSS clip-path cracks_

- [ ] **41. Flick-Toss Skill Chips** (hook 8, M, skills)
  Every skill chip is grabbable: flick one and it flies with real momentum, rubber-bands off the grid's invisible walls, then spring-snaps back into its slot with a damped wobble while neighbors shove aside on tiny repulsion springs. Reduced-motion: static chips with plain hover.
  _tech: framer drag + dragElastic + useVelocity + layout spring return_

- [ ] **42. Slingshot Scroll Launcher** (hook 8, M, global (scroll progress bar))
  The scroll progress bar gains a draggable thumb: pull it like a bowstring (the bar visibly stretches and bends with elastic tension), release, and the page launches into a momentum scroll matching pull distance, overshooting the target by a few pixels and springing back (absorbs the heading-tether grapple variant — same payoff, one clean control).
  _tech: framer drag + custom rAF momentum scroll with spring settle, SVG bar bend_

- [ ] **43. Scroll Payload Injector** (hook 8, M, global (right edge rail))
  A thin fixed data-conduit line runs down the right edge; scrolling spawns hex-packet glyphs (0x5E, 0xC8...) that travel down at scroll velocity and burst in a tiny spark when they reach the section in view. Fast scrolling floods the conduit, idle drains it — the page feels like data being injected into each section.
  _tech: framer useScroll velocity + mapped glyphs, IntersectionObserver for burst target_

- [ ] **44. Depth-Stacked Hero Parallax** (hook 8, M, hero)
  The hero splits into 4 depth layers — background grid, photo, stats card, floating hex fragments — translating at different rates on scroll, with the photo growing ~4% toward the viewer while the grid recedes and blurs; mouse position adds a subtle secondary parallax on the photo layers (absorbs the mouse-driven portrait-slices pitch). Real depth on the very first scroll gesture.
  _tech: framer useScroll + useTransform per layer, mouse motion values, CSS blur_

- [ ] **45. De-Rez Hero Exit** (hook 8, M, hero)
  Scrolling away from the hero dissolves the photo and stats card into horizontal scanline slices that stagger-slide apart and fade (clip-path strips, no canvas); scrolling back reassembles them in reverse (absorbs the clip-path-morph deconstruct variant). Continuous scrub, so visitors play it like a toy.
  _tech: useScroll progress → staggered clip-path/translate on 8 slice divs_

- [ ] **46. Hold-to-Declassify Words** (hook 8, M, about + classified/NDA cards)
  Sensitive-looking words in the bio and NDA cards render as redaction bars; press-and-hold decrypts one character by character with a thin progress line, releasing early re-redacts with a scramble collapse. A full 700ms hold reveals the word permanently with a '[DECLASSIFIED]' micro-tag.
  _tech: pointerdown/up timers + per-char scramble reveal, framer progress line_

- [ ] **47. Scroll-Scrub Typewriter Line** (hook 8, M, about)
  One manifesto sentence in About ('I break things to understand them.') is typed and UN-typed strictly by scroll position — scroll down and it types, scroll up and the caret eats characters. Being scrubbed rather than autoplayed makes visitors bounce the scroll just to play with it.
  _tech: useScroll progress mapped to substring length, sticky container_

- [ ] **48. Recruiter Speedrun Timer** (hook 8, M, terminal trigger + global HUD)
  Typing 'speedrun' in the About terminal starts a visible mm:ss.ms HUD timer; copying the email stops it and prints a rank card ('S-TIER: 00:41.2 — you skim like a senior recruiter'). Best time persists as a ghost target on retry. People screenshot rank cards.
  _tech: rAF timer + scroll detection + localStorage_

- [ ] **49. Sonar Reveal Double-Click** (hook 8, M, global)
  Double-clicking empty background emits an expanding sonar ring plus a brief blueprint-grid flash; every clickable toy on screen blinks with a corner-bracket highlight for 1.5s. A discoverability meta-toy that makes visitors find all the other toys — increasingly valuable as this list ships.
  _tech: document dblclick + framer ring, data-toy attribute registry_

- [ ] **50. Proximity Wake on Marquee** (hook 8, M, tech marquee)
  Marquee items nearest the cursor slow down, enlarge slightly and brighten to accent, creating a readable wake in the stream that re-accelerates as the cursor leaves (absorbs the per-char iron-filings variant — item-level is cheaper and more readable). Lets visitors actually read the fast stack by pointing at it.
  _tech: per-item distance→scale/opacity, marquee speed lerp near cursor_

- [ ] **51. Proximity Decrypt Labels** (hook 8, M, classified/NDA cards)
  Card titles in the classified section sit as scrambled cipher text (█▓5f#) and resolve character-by-character as the cursor approaches — resolution percentage maps to distance, so backing away re-encrypts. Clearance-based declassification, scroll-into-view resolve on touch/reduced-motion.
  _tech: distance→progress mapping, per-char scramble in a rAF hook_

- [ ] **52. Image Zoom Under Magnifier Scan** (hook 8, M, showcase lab)
  Showcase images scale 0.92→1.0 tied to scroll centering, and cursor proximity adds a circular scan lens — a radial mask following the mouse showing the image slightly zoomed and sharpened with a faint grid overlay, fading in from 150px away (absorbs the standalone magnifier-dock pitch). Forensic photo analysis, no hover required.
  _tech: useScroll scale + CSS mask-image radial at pointer var, background-position magnify_

- [ ] **53. Gyro Tilt World (Mobile)** (hook 8, M, global (mobile))
  On mobile, device tilt drives spring-smoothed parallax: hero card, robot eyes, and spotlight highlights all lean with the phone at different spring stiffnesses so the scene feels suspended in fluid. Permission prompt styled as a terminal command; silent fallback on denial. Gives touch users their own version of the proximity magic.
  _tech: DeviceOrientationEvent + framer useSpring per layer, iOS permission gate_

- [ ] **54. KPI Odometer Scrub** (hook 7, S, about (KPIs))
  About KPI numbers count with scroll position: entering the section, each figure rolls up odometer-style proportional to section progress, settling at the true value at full visibility; scrolling up rolls them back down. Pairs with the existing hover re-roll — scroll drives them, hover randomizes them.
  _tech: useScroll element progress → useTransform counter_

- [ ] **55. Photo Escape Reflex** (hook 7, S, hero profile photo)
  Within 200px of the profile photo, the ID-scan brackets slide outward and rotate to track the cursor's angle like a camera gimbal, while the photo does a 1-2px parallax lean AWAY from the cursor — alive and slightly wary, matching the robot's personality.
  _tech: cursor angle→bracket transform + inverse translate, framer springs_

- [ ] **56. Checksum Footer Stamp** (hook 7, S, footer)
  A footer line reads 'page integrity: verifying…' and visibly computes on scroll-into-view: hex pairs stream, then settle into a stable fake SHA-256 with a 'VERIFIED ✓ no tampering detected' stamp slamming in on a spring. Clicking re-runs it and appends 'verified 2x — trust issues?'.
  _tech: char cycle interval + framer spring stamp_

- [ ] **57. Uptime Odometer** (hook 7, S, hero stats card)
  A stats-card line reading 'UPTIME 23y 11m 04d 07:32:18' where seconds tick live with a rolling odometer digit animation computed from birthdate/career-start. Makes the whole card feel like a running machine.
  _tech: 1s interval + CSS transform digit column, tabular-nums_

- [ ] **58. Status LED Rack** (hook 7, S, hero)
  Four tiny labelled LEDs (UPTIME, FOCUS, COFFEE, DEPLOY) on the hero stats card, each blinking with its own organic rhythm; hovering shows a one-line tooltip ('COFFEE: 87% — refill imminent'), and clicking COFFEE makes it blink faster while the robot's eyes widen.
  _tech: CSS keyframe blinks with random delays + one click handler_

- [ ] **59. Contact Combo Counter** (hook 7, S, global (cursor ring))
  Clicking interactive toys in rapid succession builds a combo counter beside the cursor ring — x2, x3... in mono with a scale-punch per increment; x10 bursts into an amplified click-spark and logs a 'CHAIN REACTION' achievement. Costs almost nothing and retroactively makes every other toy more fun.
  _tech: click timestamp buffer + framer scale spring_

- [ ] **60. Visit Streak Terminal Stamp** (hook 7, S, about terminal + robot)
  The whoami output appends 'last_seen: 2d ago | streak: 3 visits' from localStorage timestamps; at streak 3+ the robot greets returning visitors ('you again. I like persistence.'). Only surprises repeat visitors — exactly the recruiter-returning-for-round-two moment.
  _tech: localStorage + existing typed-terminal pipeline_

- [ ] **61. Threat-Level Nav Underline** (hook 7, S, navbar)
  Each navbar link's underline grows and shifts from dim gray to ice-blue based on horizontal cursor distance along the bar — the nearest link is nearly fully underlined before the cursor arrives, neighbors partially. Reads like a targeting system acquiring lock.
  _tech: one mousemove on nav, per-link scaleX + color via CSS vars_

- [ ] **62. Mass-Coupled Image Reveal** (hook 7, S, showcase lab + projects)
  Showcase and project images scroll in like weights on springs: scale starts at 0.9 and overshoot past 1.0 is proportional to current scroll velocity — scroll slowly and they ease in politely, scroll fast and they visibly boing (absorbs the continuous velocity-breathing variant). Grow/shrink tied to felt momentum, not canned keyframes.
  _tech: useScroll velocity read at whileInView, mapped to spring stiffness/overshoot_

- [ ] **63. Robot Treat Toss** (hook 9, L, global (robot extension))
  Click-and-drag on empty background spawns an ice-blue data-cube you can fling; it arcs with spring physics toward the robot, whose eyes visibly TRACK the flying cube before it catches it with a chomp, happy wiggle, and 'nom. 64 bytes.' bubble (absorbs the double-click fetch variant). Serves eye-tracking visibility and companion cuteness in one L-effort hit.
  _tech: framer drag + animate to robot coords, existing robot state machine_

- [ ] **64. sudo Konami Root Shell** (hook 9, L, global easter egg)
  Typing 'sudo' anywhere spawns a fake password prompt; two attempts print 'permission denied — nice try', the third 'succeeds' and drops a mini root shell with 3 joke commands (ls /secrets, cat resume.txt → downloads CV, exit) — with the Konami code as an alternate trigger that also skins kickers with sudo-prefixes for 20s (merged). Multi-step payoff people screenshot.
  _tech: keydown buffer + small terminal component, framer, CSS class toggle_

- [ ] **65. Recon Drone Companion** (hook 9, L, global)
  The site's ONE auxiliary drone (merges the nav-escort and section-scan pitches): a palm-sized two-rotor drone docks on the robot, detaches when a nav link is clicked or a new section scrolls in, flies a curved path ahead of the scroll, hovers with a scanning light-cone over the section heading for 2s, then returns to dock. Clicking it mid-flight triggers a barrel roll; stays docked in perf-lite/reduced-motion.
  _tech: framer animate() along keyframe paths + IntersectionObserver + nav triggers_

- [ ] **66. Robot Rappel Descent** (hook 9, L, global (robot extension))
  The robot grabs a dashed tether and rappels down the viewport edge as you scroll, position mapped to scroll progress with springy lag; fast scrolls swing it outward with wide eyes, and at the footer it lands, dusts off, and waves. Turns dead scroll distance into a companion journey — the single most character-rich L on the list.
  _tech: framer useScroll + useSpring on translateY, rotation from velocity_

- [ ] **67. Hidden Access Keys Hunt** (hook 9, L, global, keys scattered)
  Five tiny key glyphs hidden across the site (divider chip, photo scanline, project row, footer ECG, skills chip); clicking one toasts 'KEY_03 ACQUIRED' and increments a HUD keyring, and all five unlock a hidden vault overlay with a personal note + resume download and a robot celebration. The strongest reason to explore every section.
  _tech: shared context + localStorage + framer layout animations_

- [ ] **68. Draggable ID Badge on a Lanyard** (hook 9, L, hero)
  A clip-on 'SECURITY CLEARANCE' mini-badge hangs from a drawn SVG lanyard on the hero card: grab and fling it and it swings on a damped spring pendulum with the cord bending via path interpolation, scroll velocity kicks it like wind, and yanking hard widens the robot's eyes (merges the pendulum and hologram-flip pitches). Double-click flips it to a back face with fake barcode, mouse-angle hologram sheen, and 'ACCESS: GRANTED'.
  _tech: framer drag + useSpring, SVG path pendulum, rotateY flip + gradient sheen_

- [ ] **69. Chat Demo CRT Boot-Up** (hook 7, M, projects featured card)
  The featured chat-bot demo frame starts as a collapsed horizontal accent line (CRT off); entering the viewport it powers on — the line expands vertically with a flash, one scanline sweeps down, then the demo fades in. Scrolling far away powers it back down to the line.
  _tech: framer whileInView + scaleY/clip-path keyframes, CSS scanline gradient_

- [ ] **70. Service Self-Test Boot** (hook 7, M, services)
  Hovering a service card draws its border clockwise like a trace, then a one-line mini terminal at the card's foot types '$ ./pentest --status … [ACTIVE]' with an ice-blue OK stamp; each card has its own command so hovering all four feels like booting a system. On leave the trace retracts.
  _tech: framer pathLength on SVG rect border + existing typer reuse_

- [ ] **71. Services Card Deal-In** (hook 7, M, services)
  Service cards enter with a scroll-scrubbed deal from a single deck point below the fold — each translating along its own arc into grid position like cards dealt onto a table, with reverse scroll sweeping them back into the deck. Continuous scrub, so users play it back and forth.
  _tech: useScroll section progress → per-card arc transforms_

- [ ] **72. Section Boundary Scanline** (hook 7, M, global (between sections))
  Crossing between major sections, a 1px full-width accent scanline sweeps the viewport exactly at the boundary's screen position (moving with scroll, not a timer), leaving a 300ms afterglow and stamping 'SECTOR 04 // PROJECTS'. Every boundary becomes a checkpoint.
  _tech: boundary elements' viewport position via useScroll, CSS glow_

- [ ] **73. Timeline Plunger Nodes** (hook 7, M, experience timeline)
  Timeline dots become mechanical push-buttons: clicking depresses one with plunger travel and shadow, powering on that entry — text decrypt-scrambles in and a thin current line animates from dot to card. Clicking a lit node powers it down with a CRT-off collapse; lighting all triggers a full-timeline current sweep.
  _tech: framer variants, decrypt reuse, stroke-dashoffset current_

- [ ] **74. Perimeter Breach Timeline** (hook 7, M, experience timeline)
  Timeline nodes are hollow rings that fill with accent and emit one sonar ripple when the cursor crosses within 120px, while the line segment between the two nearest nodes energizes with animated dash flow. Reading the CV becomes patrolling a network diagram.
  _tech: distance check per node, framer ripple, SVG stroke-dashoffset_

- [ ] **75. Timeline Exploit Chain** (hook 7, M, experience)
  The timeline restyled as a kill-chain: numbered stages (RECON → FOOTHOLD → ESCALATION → PERSISTENCE for the current role) connected by a scroll-drawn line, each node popping with a lock-opening tick as the line reaches it. Hovering decrypts the stage label; scrolling up re-locks. Complements (or alternative-skins) the packet rider.
  _tech: SVG pathLength scroll-linked + framer node variants_

- [ ] **76. KPI Counter Slot-Machine Pull** (hook 7, M, about KPIs)
  Pull any About KPI downward like a slot lever and release — all counters spin with motion blur, decelerate with spring overshoot, and land back on true values with a ka-chunk synth thud. A 1-in-8 chance they briefly land on '???' before correcting, with the robot commenting 'no, that one's real.'
  _tech: framer drag constraint + spring, tabular-nums roll_

- [ ] **77. Traceroute Contact Path** (hook 7, M, contact)
  Clicking 'trace me' in contact animates a traceroute: hop lines type one by one (visitor.local → isp.gateway → edge.cdn → maksut.dev) with randomized fake latencies and a packet dot traveling a dotted SVG path between hops, ending on the email card with a pulse. Replays differently each run.
  _tech: framer path animation + typed lines, SVG dotted path_

- [ ] **78. Packet Stream Divider** (hook 7, M, dividers)
  The canonical divider-traffic idea (absorbs the signal-runner duplicate): mono glyph clusters ([SYN], [ACK], [DATA]) travel along a hairline at scroll-velocity-bound speed; packets within ~120px of the cursor get 'inspected' — pausing and expanding to show a fake hex payload tooltip before resuming. Proximity-driven, not hover.
  _tech: framer x-loop + pointer distance check, CSS tooltip_

- [ ] **79. Cursor Gravity Well Divider** (hook 7, M, section dividers)
  Divider lines rendered as ~60 tiny ticks that bend vertically toward the cursor like iron filings within 200px, forming a smooth attraction curve traveling with the pointer. A two-second toy people drag back and forth repeatedly.
  _tech: SVG tick array, per-tick gaussian falloff of distance, rAF_

- [ ] **80. Coupled-Oscillator Divider Beads** (hook 7, M, dividers)
  Divider chips ride a horizontal wire like beads connected by invisible springs: scroll velocity yanks the wire and beads swing and settle as coupled oscillators — middle first, neighbors following with propagating lag. Fast scroll-stops ripple visibly down the chain.
  _tech: useScroll velocity → staggered useSpring array with per-index stiffness_

- [ ] **81. Man-in-the-Middle Tooltip** (hook 7, M, projects (featured))
  Hovering the chat-bot demo shows an 'intercepted traffic' panel: fake request/response pairs scroll by in mono ('POST /api/chat → 200, 214ms') with one line comically redacted via the existing shimmer. Clicking a line decrypts it into a real one-sentence fact about how the project works — a tooltip that doubles as a mini case study.
  _tech: framer list stagger + click-to-decrypt text swap_

- [ ] **82. Git-Diff Title Correction** (hook 7, M, projects + experience titles)
  A section title entering the viewport first types a corrupted version ('PROJEKTZ'), then self-corrects diff-style: wrong chars strike through and slide out in dim gray, correct chars insert in accent with a '+' gutter flicker. Runs once per section per visit.
  _tech: IntersectionObserver + staged per-char framer sequence_

- [ ] **83. ASCII Light-Source Shadow** (hook 7, M, hero)
  The hero name casts a shadow copy of itself at ~8% opacity whose offset direction and length respond to cursor position as if the cursor were a light source — move left, shadow stretches right; move close, it tightens. Subtle until noticed, then unforgettable.
  _tech: duplicated text layer + framer transform from normalized cursor vector_

- [ ] **84. Cursor-Shake Overheat Glitch** (hook 7, M, global headings)
  Rapidly shaking the cursor over a heading progressively overheats it: jitter grows, random glyphs corrupt into katakana/box-drawing chars, a 'SIGNAL DEGRADED' tag flickers — then it cools and reassembles over 1s when shaking stops (absorbs the page-wide shake-quake variant; localized is cheaper and safer). Cooldown prevents spam; skipped in perf-lite.
  _tech: mousemove velocity-reversal accumulator + per-char corruption state, framer jitter_

- [ ] **85. Skill-Name Keystroke Sniffer** (hook 7, M, global → skills)
  Typing any tech name with no input focused — 'nmap', 'react', 'python' — is sniffed by a global key listener; matching chips pulse in accent and a terminal toast types 'grep: 1 match found in /skills'. Extends the 'hack' egg into a whole vocabulary without duplicating it.
  _tech: keydown buffer matcher + chip highlight event, typed toast_

- [ ] **86. Lightbox Chromatic Open** (hook 7, M, showcase lightbox)
  Gallery images open via shared-layout expansion from their thumbnail while a one-frame RGB-split glitch (offset accent/white copies at low opacity) resolves into the sharp image, plus corner brackets flying in from the four screen corners to frame it.
  _tech: framer layoutId shared element + brief offset-clone glitch, no canvas_

- [ ] **87. Skills Chip X-Ray Reveal** (hook 7, M, skills section)
  Hovering a skill chip projects a large faint watermark glyph of that technology behind the whole grid — masked by a radial gradient centered on the cursor so it only shows within ~250px, growing and shrinking with approach. Scanning the grid with an x-ray gun.
  _tech: mask-image radial-gradient at cursor CSS vars, CSS-only glyph layer_

- [ ] **88. WebAudio Sonar Ping Toggle** (hook 7, M, global (navbar toggle))
  An 'AUDIO: OFF' toggle in the navbar HUD; enabled, key interactions emit whisper-quiet synthesized sonar blips — anchors ping low, easter eggs ping twice, the honeypot alarm gets a rising sweep. One AudioContext, localStorage persistence. Opt-in sound completes the terminal fantasy and amplifies every other toy on this list.
  _tech: WebAudio oscillator synth, no assets, localStorage_

- [ ] **89. Proximity Lean Field** (hook 7, M, skills + dividers)
  Skill and divider chips tilt and brighten toward accent as the cursor approaches (inverse-square falloff within ~140px), leaning away like grass in wind with per-chip springs so the field ripples with lag on a sweep. Physical lean variant of the proximity ask — pair with Torchlight or use standalone.
  _tech: single pointermove + per-chip distance, framer useSpring on rotate/color-mix_

- [ ] **90. Pull-Back Goal Slingshots** (hook 7, M, goals)
  Goal bars get a grabbable leading-edge handle: drag backward and the fill compresses with tension (edge glow brightening with stretch), release and it slingshots past its true value, wobbling like liquid before settling exactly right, the counter riding the overshoot.
  _tech: framer drag on fill width + spring release, counter via useTransform_

- [ ] **91. Marquee Stowaway** (hook 7, M, tech marquee)
  A tiny 8-bit robot silhouette occasionally rides the tech marquee like a conveyor belt (~once per 45s), bobbing atop a passing logo before hopping off at the edge; pausing the marquee on hover makes it look around nervously. Rare enough that spotting it feels like a secret.
  _tech: absolutely-positioned sprite synced to marquee translateX + framer bob_

- [ ] **92. Direction-Aware Section Kickers** (hook 6, S, all section headers)
  Kickers gain scroll-direction awareness: scrolling down they slide up with a '▼ SCANNING' micro-label; scrolling up they slide down with '▲ REWIND' and a brief strikethrough-then-restore, like re-reading logs. One shared hook, all kickers consume it.
  _tech: useScrollDirection hook + framer variants_

- [ ] **93. Selection Hex Readout** (hook 6, S, global)
  Selecting any text pops a tiny mono tooltip — '0x2A bytes selected' — with a one-frame accent underline sweep across the range, paired with an accent-blue ::selection style. Copy-pasting the bio feels like exfiltrating data.
  _tech: selectionchange listener + positioned tooltip, ::selection CSS_

- [ ] **94. Velocity Tracking Breathe** (hook 6, S, global section headings)
  Section headings' letter-spacing expands with live scroll velocity (up to +0.15em) with a slight opacity dip like motion blur, snapping back on a spring when scrolling stops. Fast scrolling feels like text resisting wind.
  _tech: framer useVelocity → letterSpacing motion value_

- [ ] **95. Exit-Pixelate Gallery Images** (hook 6, S, showcase lab)
  As a showcase image scrolls OUT of view it de-rezzes — a coarse CSS-gradient mosaic thickens with exit progress plus a brightness dip, like being buffered/encrypted away — and re-resolves crisply scrolling back in. Scrub-tied both directions.
  _tech: useScroll exit progress → overlay grid size + filter CSS vars_

- [ ] **96. Scroll-Scrub Image Mask Sweep** (hook 6, S, showcase lab rows)
  Each showcase row image reveals via a diagonal mask sweeping open in sync with that row's scroll progress — a thin accent sliver at 0%, fully revealed with an edge shimmer at center. Scrolling back re-masks, like documents sealed and unsealed.
  _tech: useScroll per-element + clip-path polygon transform_

- [ ] **97. Lab Evidence Board** (hook 6, S, showcase lab)
  Each image opened in the lightbox tags its thumbnail with a persistent 'ANALYZED' corner stamp; analyzing all flips the header to 'SHOWCASE // ALL EVIDENCE PROCESSED' with a decrypt-in and achievement toast. Turns the gallery into a checklist people finish.
  _tech: lightbox open events + localStorage + CSS stamp_

- [ ] **98. Contact Uplink Handshake** (hook 8, L, contact + robot)
  As contact approaches, a dashed SVG line scrubbed by scroll draws from the robot's corner to the email card, ending with 'HANDSHAKE ESTABLISHED — SYN/ACK' typing out; the robot's eyes track the line tip as it draws. Ties the mascot to the conversion moment.
  _tech: SVG pathLength scroll scrub + existing eye-target API_

- [ ] **99. Footer Gravity Well** (hook 8, L, pre-footer + footer)
  The last 150vh acts as a gravity well: the ECG heartbeat quickens with proximity to page bottom, debris glyphs drift toward the footer at increasing parallax speed, and at bottom everything lands with the ECG settling into calm plus an 'END OF TRANSMISSION' stamp. Gives the page an actual ending instead of just stopping.
  _tech: useScroll remaining-distance transform, extends ECG, parallax glyph layer_

- [ ] **100. Projects Dossier Unstack** (hook 8, L, projects)
  Project rows start stacked like classified folders (slight offsets, 1-2° rotation); scroll scrubs each folder out of the pile, straightening into row position as its redaction bar wipes away, and scrolling up restacks them. Reading projects = declassifying a dossier. (Alternative entrance to Port Scan Reveal — pick one per section.)
  _tech: useScroll per-row transforms (y, rotate, stagger), redaction shimmer reuse_

- [ ] **101. Scroll-Scrubbed Skill Compile** (hook 8, L, skills)
  The skills grid pins for ~1.5 viewport heights; scrolling scrubs a fake compiler log ('compiling react.ts... [OK]') while chips light up in build order, each flashing as it links. Scrolling backward decompiles them in reverse. Skills become a build you perform.
  _tech: position sticky + useScroll progress mapped to chip index_

- [ ] **102. Magnetic Grid Distortion Field** (hook 8, L, global background (hero + about))
  A faint canvas dot-grid where dots within ~150px of the cursor repel outward and brighten to accent, spring-snapping back as it leaves — the hero/about background becomes a fluid the visitor stirs. Disabled in perf-lite.
  _tech: single canvas, spatial-hash lattice, spring integration in rAF_

- [ ] **103. Robot Trust Meter** (hook 8, L, corner robot (extended))
  A hidden affinity score raised by petting the robot, consecutive-day visits, and easter eggs; at thresholds its behavior visibly upgrades — faster wider eye-tracking, waving when you return to the hero, and at max an occasional ice-blue heart-glyph blink. Never shown as a number; visitors discover the robot warming up to them.
  _tech: localStorage score + framer variants on existing robot_

- [ ] **104. Achievement Toast System** (hook 8, L, global)
  One reusable bottom-center toast styled as a terminal log line — '[ACHIEVEMENT] first_contact — copied email' — firing for ~8 discoverable acts (email copy, chat demo finish, 3 lightbox opens, all chips hovered, hack egg...). The list is viewable via the HUD counter with locked ones shown as ██████. The backbone that makes the other gamification ideas cohere.
  _tech: event bus + localStorage + framer slide/decrypt_

- [ ] **105. Ghost Trace Replay** (hook 8, L, terminal command + overlay)
  The site samples the visitor's scroll depth (session only); typing 'trace' in the terminal renders their session as a vertical minimap with an animated dot replaying the journey and dwell-heat bands per section, ending 'deepest dwell: PROJECTS — good taste.' The site was profiling you back.
  _tech: scroll sampling + SVG minimap + framer replay_

- [ ] **106. Recruiter Mode Switch** (hook 8, L, global (navbar + sections))
  A labeled [RECRUITER MODE] toggle near the navbar: the robot salutes, then key hiring signals highlight in sequence — KPIs pulse and re-roll, the CV/contact CTA gains a persistent beacon, and a guided line auto-scrolls through experience → projects → contact with typed callouts. Toggle off restores normal state. Keep the auto-scroll skippable on any input.
  _tech: framer orchestrated sequence + scrollIntoView steps, context flag_

- [ ] **107. Marquee Catch-and-Throw** (hook 8, L, tech marquee / hero)
  Marquee logos are grabbable mid-scroll: snatch one out of the stream into a free physics chip you can toss around the hero with spring drag and edge bounces; flick it back and it merges into the flow with a stagger ripple. Left dropped, the robot stares at it until it auto-returns.
  _tech: framer drag + layoutId reparenting, velocity from drag end_

- [ ] **108. Tethered Drone Companion** (hook 8, L, global (robot area))
  A tiny one-eyed drone floats near the robot on a thin elastic tether with real spring physics: it lags scroll with momentum, bobs on an idle sine, and grabbing and tossing it makes it boomerang around the robot before the tether reels it in — with the robot's eyes tracking it the whole time. (Overlaps Recon Drone; ship one drone, this is the physics-toy flavor.)
  _tech: rAF spring integrator + SVG tether line, framer drag for toss_

- [ ] **109. Tractor-Beam CTA Aura** (hook 6, M, hero + contact CTAs)
  Primary CTAs project a visible field beyond the existing magnetic pull: a soft radial accent gradient on the section background stretching toward the cursor within 300px, plus faint concentric arcs contracting as distance closes — the button visually reels the pointer in before hover fires.
  _tech: radial gradient positioned by cursor vector, framer scale on arcs_

- [ ] **110. Proximity Heat on Chat Demo** (hook 6, M, projects featured chat demo)
  The chat-bot demo frame stays dim until the cursor nears ~300px; approach drives a rising accent glow, the bot's avatar dot pulses faster, and at close range a typed 'user detected — say hi?' hint appears in the demo. Retreating cools it to idle. (Coordinate with the global threat-glow system so it reads as an escalation, not a duplicate.)
  _tech: mousemove distance → CSS vars (shadow alpha, pulse rate), framer hint_

- [ ] **111. Marquee Payload Swap** (hook 6, M, tech marquee)
  The marquee reacts to scroll depth: top of page shows tech names, but items glitch-swap one at a time into binary aliases (REACT → 0x52 45 41 43 54) as you descend, fully hex by the footer. The marquee visibly compiles down as you go deeper — subtle, but rewards the observant.
  _tech: useScroll global progress → per-item glitch swap, scramble reuse_

- [ ] **112. Skills Bingo Grid** (hook 6, M, skills)
  Hovered/tapped chips get a faint persistent underline tick; completing a full row or column fires a line-sweep across it and logs 'SKILL VECTOR VERIFIED' via the achievement toast. Silently turns idle chip-hovering into a compulsive completion loop.
  _tech: hover/tap state + grid row/col math + CSS sweep_

- [ ] **113. Section Boss Stamps** (hook 6, M, experience timeline)
  Timeline entries get a small hollow hexagon that certifies when fully scrolled into view — stroke draws via pathLength and fills with a faint tint, persisted — with the header showing 'CERTIFIED 3/5'. Half-read visitors feel the pull to finish the career story.
  _tech: IntersectionObserver + SVG pathLength (framer) + localStorage_

- [ ] **114. Daily Cipher Chip** (hook 6, M, dividers + about terminal)
  One divider chip per day shows a short date-seeded ROT13/hex word; typing the decoded word into the About terminal awards a CRYPTANALYST badge and the chip unlocks with a decrypt animation. A different cipher each day quietly rewards streaks with no streak UI.
  _tech: date-seeded encode + terminal command hook + localStorage_

- [ ] **115. Glyph Inspector Mode** (hook 6, M, hero + section headings)
  Double-clicking a heading enters a 2-second inspector state: baseline grid and cap-height lines draw across the text and each letter gets a floating 9px accent-mono Unicode codepoint label ('U+004D') before fading out. A typographic x-ray for technical recruiters.
  _tech: dblclick toggle + positioned per-char labels, CSS grid lines_

- [ ] **116. Skill Chip Firefly** (hook 6, M, skills)
  A single 3px glow-dot drifts lazily among the skill chips and flees to the far side of the grid when the cursor approaches; idle for 10s it perches on a random chip, which gently pulses. Pure ambience in the robot's spirit — pair with Torchlight, whose proximity warming it visually complements.
  _tech: framer firefly motion + rAF proximity check_

- [ ] **117. Cursor Trail Packet Train** (hook 6, M, global (cursor layer))
  Holding the mouse still for 2s spawns three follower packets trailing the cursor ring in a queued line like ducklings; fast movement scatters them, clicking makes them orbit once. Capped at 3, disabled in perf-lite.
  _tech: rAF lerp chain rendered as fixed divs, no canvas_

- [ ] **118. Packet Pong on the ECG Line** (hook 7, L, footer)
  Clicking the footer heartbeat detaches a packet dot that bounces along the ECG trace with the cursor as a vertical paddle; each bounce speeds it up and increments a mono HITS counter, a miss plays the flatline gag before the heartbeat resumes. Auto-dismisses after 15s idle.
  _tech: SVG/canvas rAF loop, pointer position, existing ECG path_

- [ ] **119. Idle Sentry Minigame** (hook 7, L, robot buddy overlay)
  After 45s idle the robot deploys a one-button minigame: a radar sweep rotates past 3 blips — tap/space when the sweep crosses one to neutralize it; 3/3 awards a SENTRY badge and a robot high-five. Any other interaction dismisses it instantly; never auto-appears under reduced-motion.
  _tech: idle timer + SVG rotate + rAF hit detection + framer_

- [ ] **120. Rubber-Band Project Deck** (hook 6, L, projects)
  Featured projects as a horizontally flickable deck with real inertia, rubber-band resistance at the ends, and velocity-based card advance with overshoot-then-snap — the chat-bot demo card 'weighs more' via higher drag resistance as a subtle joke. Ranked last: it restructures an existing section's layout for moderate payoff; the ideas above enhance without rearchitecting.
  _tech: framer drag='x' + dragConstraints + snap-point springs, per-card drag mass_

