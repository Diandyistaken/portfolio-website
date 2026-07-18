import type { Content } from "./types";

export const de: Content = {
  htmlLang: "de",
  meta: {
    title: "Muhammed Maksut Çakmaktaş | Informatiker & Cybersicherheit",
    description:
      "Persönliches Portfolio von Muhammed Maksut Çakmaktaş, einem Informatiker mit Fokus auf Cybersicherheit und Softwareentwicklung.",
    knowsAbout: [
      "Cybersicherheit",
      "Penetrationstests",
      "DevSecOps",
      "Kali Linux",
      "Metasploit",
      "Nmap",
      "Wireshark",
      "Python",
      "Unity",
      "Next.js",
    ],
  },
  nav: {
    about: "Über mich",
    skills: "Fähigkeiten",
    services: "Dienstleistungen",
    experience: "Erfahrung",
    education: "Ausbildung",
    projects: "Projekte",
    showcase: "Vitrine",
    freelance: "Freelance",
    goals: "Ziele",
    contact: "Kontakt",
    arena: "Interview",
  },
  common: {
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    themeToLight: "Zum hellen Modus wechseln",
    themeToDark: "Zum dunklen Modus wechseln",
    languageSwitcher: "Sprache ändern",
    skipToContent: "Zum Inhalt springen",
  },
  personalInfo: {
    name: "Muhammed Maksut Çakmaktaş",
    title: "Informatiker | Cybersecurity-Enthusiast",
    bio: "Ich bin Informatiker und arbeite an Cybersicherheit, Softwareentwicklung und Systemautomatisierung. Praktische Erfahrung habe ich mit Nmap, Metasploit, Python, SAP PI/PO und KI-Projekten gesammelt. Jetzt möchte ich in einem Team sichere und nützliche Produkte entwickeln.",
    location: "Istanbul, Türkei",
    email: "mo.maksut@gmail.com",
    linkedin: "https://www.linkedin.com/in/muhammed-maksut-çakmaktaş-967502365/",
    github: "https://github.com/diandyistaken",
    instagram: "https://www.instagram.com/diandyistaken/",
  },
  hero: {
    greeting: "Hallo, ich bin",
    badge: "Offen für neue Rollen",
    ctaPrimary: "Kontakt aufnehmen",
    ctaSecondary: "Projekte ansehen",
    followLabel: "Folgen",
    followLinkedin: "Auf LinkedIn folgen",
    followInstagram: "Auf Instagram folgen",
    cvLabel: "Lebenslauf herunterladen",
    cvOptionTr: "Lebenslauf (Türkisch)",
    cvOptionEn: "Lebenslauf (Englisch)",
    ticker: [
      "> Netzwerkscan … SAUBER",
      "> 0 offene Ports exponiert",
      "> Verfügbarkeit: 99,98 %",
      "> Bedrohung: NIEDRIG — Kaffee: KRITISCH",
    ],
    statusCycle: [
      "Offen für neue Chancen",
      "status: kaffee 87%",
      "uptime: 99,98%",
      "modus: tiefe konzentration",
      "vpn: an · keine spur",
    ],
    ledTips: ["UPTIME: 99,98% — nie abgestürzt, wird es nie", "FOCUS: tief — bitte nicht stören", "COFFEE: 87% — Nachschub naht", "DEPLOY: grün — sogar freitags"],
    scanLabel: "ID-Scan starten",
    verifiedLabel: "ID BESTÄTIGT",
    onlineLabel: "IST // ONLINE",
    scrollLabel: "SCROLLEN",
  },
  robot: {
    label: "Roboter-Assistent — zum Reden klicken",
    dismissLabel: "Roboter ausblenden",
    introMessage: "piep bup! ich bin der Wachroboter — meine Augen folgen dir 👀",
    messages: [
      "piep bup! willkommen, besucher_",
      "systemscan: alles sauber ✓",
      "maksut codet gerade, ich halte Wache",
      "du hast mich geklickt! +10 niedlichkeitspunkte",
      "firewall: ich. spaß… oder doch nicht?",
      "kaffeestand kritisch, wird nachgefüllt…",
      "heute 0 angriffe blockiert. ruhiger tag.",
      "psst… probier die Befehlspalette mit ⌘K",
    ],
    sleepingMessage: "zzz… (beweg die Maus, dann wache ich auf)",
    hackMessage: "!! Angriff erkannt… Spaß. System sicher ✓",
    honeypotMessage: "das solltest du nicht drücken… zum Glück bin ich süß 👀",
    sentryMessage: "Bewegung erkannt — Sektor 7 👁",
  },
  about: {
    kicker: "Über mich",
    title: "Wer ist Muhammed Maksut?",
    terminalLead: "Eine kurze Vorstellung — über die Kommandozeile.",
    manifesto: "Ich zerlege Dinge, um sie zu verstehen; ich verstehe sie, um sie zu schützen.",
    terminal: {
      title: "maksut@istanbul: ~",
      commands: [
        { cmd: "whoami", out: "Muhammed Maksut Çakmaktaş — Informatik-Ingenieur" },
        { cmd: "cat fokus.txt", out: "Sicherheit · Softwareentwicklung · Systemautomatisierung" },
        { cmd: "ls faehigkeiten/", out: "nmap  metasploit  python  next.js  unity  sap-pi/po" },
        { cmd: "status --now", out: "● offen für Angebote · Istanbul · Jahrgang Jan 2026" },
      ],
      extras: [
        { cmd: "sudo make coffee", out: "zugriff verweigert: erst die eigene Tasse holen ☕" },
        { cmd: "ping motivation", out: "64 Bytes Antwort: Zeit=0.1ms — immer erreichbar" },
        { cmd: "rm -rf schlaf/", out: "gelöscht. Prüfungswochen-Modus aktiv." },
        { cmd: "git push --force mut", out: "everything up-to-date ✓" },
      ],
      extraHint: "// klicken — noch einen Befehl ausführen",
      sentryDetected: "> Näherungsalarm: Besucher erkannt [Abstand: {px}px]",
      sentryLost: "> Ziel verloren_",
    },
    stats: [
      { value: 2026, suffix: "", label: "Abschlussjahr" },
      { value: 9, suffix: "", label: "Realisierte Projekte" },
      { value: 20, suffix: "+", label: "Eingesetzte Technologien" },
    ],
  },
  skills: {
    kicker: "Fähigkeiten",
    title: "Was ich kann",
    description:
      "Cybersicherheit, Unity, SAP PI/PO und Automatisierung: meine Werkzeuge und Aufgaben.",
    categories: [
      {
        id: "cyber",
        title: "Cybersicherheit & Netzwerke",
        items: [
          {
            label: "Automatisierung mit Python",
            description:
              "Entwicklung von Skripten für Sicherheitsprozesse, Bedrohungsanalyse und Systemoptimierung",
          },
          {
            label: "Systemsicherheit",
            description:
              "Proaktiver Sicherheitsansatz in Linux-basierten Umgebungen, Netzwerkanalyse und Penetrationstest-Methodik",
          },
        ],
      },
      {
        id: "gamedev",
        title: "Spieleentwicklung",
        items: [
          {
            label: "Unity und die C-Sprachfamilie",
            description:
              "Sicherer Umgang mit der Unity-Engine-Architektur sowie Spielmechanik und objektorientierter Programmierung mit C#/C++",
          },
          {
            label: "Game-Performance & UX",
            description:
              "Spielperformance verbessern und einfach bedienbare Oberflächen erstellen",
          },
        ],
      },
      {
        id: "corporate",
        title: "Unternehmenssoftware & Integration",
        items: [
          {
            label: "Systemintegration",
            description: "Verwaltung von Datenflüssen und SAP-PI/PO-Prozessen in Unternehmensarchitekturen",
          },
          {
            label: "Analytische Problemlösung",
            description:
              "Algorithmendesign, durchgängiger Softwarelebenszyklus und Codeoptimierung mit informatischem Hintergrund",
          },
        ],
      },
      {
        id: "other",
        title: "Weitere Fähigkeiten",
        items: [
          {
            label: "IoT-basierte Automatisierung",
            description:
              "Einrichtung von Smart-Home-Systemen, Sensorintegration und Hausautomatisierungslösungen",
          },
          {
            label: "Webentwicklung",
            description:
              "Design und Entwicklung moderner, responsiver Unternehmens- und privater Websites",
          },
          {
            label: "Entwicklung mobiler Apps",
            description:
              "UX-orientiertes Design und Entwicklung mobiler Apps für iOS und Android",
          },
        ],
      },
    ],
  },
  services: {
    kicker: "Dienstleistungen",
    title: "Wie ich helfen kann",
    description:
      "Ich unterstütze bei Websites, mobilen Apps, Automatisierung, Pentests und Unity-Projekten.",
    items: [
      {
        id: "smart-home",
        title: "Smart-Home-Automatisierung",
        description: "Einrichtung und Automatisierung IoT-basierter Smart-Home-Systeme.",
      },
      {
        id: "web-dev",
        title: "Webseitenentwicklung",
        description:
          "Design und Entwicklung moderner, responsiver Unternehmens-/privater Websites.",
      },
      {
        id: "pentest",
        title: "Penetrationstests",
        description:
          "Schwachstellenanalyse und Penetrationstests für System- und Netzwerksicherheit.",
      },
      {
        id: "game-dev",
        title: "Spieleprogrammierung",
        description: "Unity-basierte Spieleentwicklung und Gameplay-Mechanik-Design.",
      },
      {
        id: "mobile-design",
        title: "Design mobiler Apps",
        description:
          "UX-orientiertes Design und Entwicklung mobiler Apps für iOS/Android.",
      },
      {
        id: "cross-platform",
        title: "Desktop- und App-Entwicklung",
        description:
          "Durchgängige Softwareentwicklung für Desktop- und mobile Plattformen.",
      },
    ],
  },
  experience: {
    kicker: "Erfahrung",
    title: "Praxiserfahrung",
    intro:
      "Drei kurze Praktika haben mir verschiedene Ebenen gezeigt: offensive/defensive Sicherheit, Unternehmensintegration, First-Level-Support. Jetzt suche ich eine Vollzeit-Teamrolle, in der ich das in der Produktion zusammenführen kann.",
    items: [
      {
        id: "cyber4",
        role: "Praktikant Cybersicherheit",
        period: "Juli 2025 (20 Tage)",
        description:
          "Während eines zwanzigtägigen Praktikums habe ich mit Kali Linux, Nmap und Metasploit Schwachstellenanalysen und Pentests durchgeführt. Mit Python-Skripten habe ich Sicherheitsaufgaben und Berichte beschleunigt.",
      },
      {
        id: "negzel",
        role: "Praktikant SAP PI/PO",
        period: "August 2025 – September 2025",
        description:
          "Ich habe Datenflüsse zwischen Unternehmenssystemen in SAP PI/PO untersucht und Integrationsaufgaben technisch unterstützt.",
      },
      {
        id: "iskur",
        role: "IT-Support",
        period: "Januar 2025 – Juni 2025",
        description:
          "Ich habe internen Anwendern First-Level-Support bei Hardware-, Software- und grundlegenden Netzwerkproblemen gegeben. Außerdem habe ich Routinewartung und Fehlerbehebung übernommen.",
      },
    ],
  },
  education: {
    kicker: "Ausbildung",
    title: "Akademischer Hintergrund",
    school: "Osmaniye Korkut Ata Universität",
    department: "Informatik (Computer Engineering)",
    graduationLabel: "Abschluss",
    graduation: "Januar 2026",
  },
  projects: {
    kicker: "Projekte",
    title: "Womit ich mich beschäftigt habe",
    description: "Von der Spieleentwicklung über Automatisierung bis hin zu KI und Systemtools.",
    botShowcase: {
      label: "Live-Vorschau des Telegram-Bots",
      typing: "schreibt...",
      time: "07:00",
      messages: [
        "📮 Daily AI Researcher — Sonntag, 12. Juli 2026 / Guten Morgen, Maksut! ☕",
        "🔥 Heute auf GitHub: malisper/pgrust ↗ +774 Sterne — Postgres in Rust neu geschrieben, jetzt bei 2.196 Sternen.",
        "vercel/next.js ↗ +334 Sterne — mit 140.998 Sternen führend im Ökosystem.",
        "Der Newsletter ist jeden Morgen um 07:00 Uhr fertig.",
      ],
    },
    items: [
      {
        id: "daily-ai-researcher",
        title: "Daily AI Researcher",
        description:
          "Eine Windows-Tray-App, die jeden Morgen GitHub Trending und über 20 Tech-News-Quellen liest und mit der Claude API einen zweisprachigen HTML-Morgenbrief schreibt — mit Dedup-Speicher, der die Token-Kosten stabil hält.",
      },
      {
        id: "emotion-ai",
        title: "Emotionserkennung mit KI",
        description:
          "Ein Echtzeitsystem zur Erkennung von Gesichtsausdrücken mittels eines Convolutional Neural Network (CNN).",
      },
      {
        id: "rpg",
        title: "2.5D-RPG (Unity)",
        description: "Ein mit C# entwickeltes 2.5D-RPG-Spieleprojekt auf Unity-Basis.",
      },
      {
        id: "career-tracker",
        title: "Udemy Career Tracker",
        description:
          "Eine Chrome-Erweiterung, die den Udemy-Kursfortschritt ausliest, gepaart mit einem Web-Dashboard, das daraus einen visuellen, spielerischen Karriere-Skill-Baum macht.",
      },
      {
        id: "gmail-agent",
        title: "Gmail-Zusammenfassungsagent",
        description:
          "Ein persönlicher Agent, der die täglichen Gmail-Nachrichten abruft, automatisch kategorisiert, Antwortentwürfe erstellt und eine tägliche Zusammenfassung per Desktop-Benachrichtigung liefert.",
      },
      {
        id: "image-cleaner",
        title: "Image Cleaner",
        description:
          "Ein Python-Tool, das .jpg-Dateien in einem überwachten Ordner automatisch in .png umwandelt und unerwünschte Dateien entfernt.",
      },
      {
        id: "file-namer",
        title: "Dateinamen-Exporter",
        description:
          "Ein Python-Tool, das Dateinamen und -endungen eines Ordners als .txt-Datei exportiert.",
      },
    ],
  },
  achievements: {
    unlocked: "ERFOLG FREIGESCHALTET",
    listTitle: "ERFOLGE",
    items: [
      { id: "robot-friend", title: "Neuer Freund — du hast den Roboter begrüßt" },
      { id: "white-hat", title: "White Hat — du hast den geheimen Befehl gefunden" },
      { id: "shell-runner", title: "Befehlskette — 3 Terminal-Befehle ausgeführt" },
      { id: "explorer", title: "Entdecker — alle Bereiche besucht" },
      { id: "first-contact", title: "Erstkontakt — E-Mail kopiert" },
      { id: "status-dj", title: "Status-DJ — Badge 5-mal gewechselt" },
      { id: "honeypot", title: "Honigtopf — geklickt, was du nicht solltest" },
      { id: "chatterbox", title: "Plaudertasche — 5 Nachrichten mit dem Roboter" },
      { id: "speedrunner", title: "Speedrunner — Speedrun abgeschlossen" },
      { id: "cryptanalyst", title: "Kryptoanalytiker — Tages-Chiffre gelöst" },
      { id: "keymaster", title: "Schlüsselmeister — alle 5 Schlüssel gefunden" },
      { id: "sentry", title: "Wache — 3/3 im Radar-Spiel" },
    ],
  },
  hints: {
    heroToys: "CTA gedrückt halten · Name anklicken · Porträt doppelklicken",
    emailNear: "Cursor nähern: das Signal löst sich auf · E-Mail ziehen: kopiert",
    chipsToss: "Chips lassen sich greifen und schleudern · fahre über alle",
    kpiTricks: "Zahl anklicken: hex/binär · Kachel nach unten ziehen: Slotmaschine",
    goalHandle: "den Griff am Balkenende zurückziehen und loslassen",
    ndaHold: "Schwärzungsbalken gedrückt halten",
    lightboxTips: "Klick: 2,5x-Analyse · ziehen & werfen: schließen/weiter",
    terminalEggs: "irgendwo tippen: 'hack' · 'speedrun' · 'sudo' · 'trace' · Tages-Chiffre",
    sonarHint: "Doppelklick ins Leere: alle Toys leuchten · zieh am Kopf des Roboters",
  },
  robotChat: {
    title: "WACH-BOT v2.1",
    subtitle: "leichte Intelligenz · online",
    placeholder: "frag mich etwas…",
    send: "Senden",
    close: "Chat schließen",
    greeting: "piep bup! hallo in meiner großen Form 👋 frag mich alles über Maksut — oder wir plaudern einfach.",
    chips: ["Wer ist Maksut?", "Was kann er?", "Projekte", "Wie erreiche ich ihn?"],
    fallbacks: ["hmm, das übersteigt meine Schaltkreise 🤖 versuch 'Fähigkeiten', 'Projekte' oder 'Kontakt'.", "mein Prozessor konnte das nicht parsen, aber: Maksut zu fragen lohnt sich. tipp 'Kontakt'.", "404 — Antwort nicht gefunden. tipp 'Witz' und ich mache es wieder gut."],
    intents: [
      { id: "greet", keywords: ["hallo", "hi", "hey", "wie geht", "guten morgen", "guten abend"], responses: ["hey! Schaltkreise auf 100%, Kaffeestand kritisch ☕ wie geht's dir?", "hallo Mensch! heute 0 Angriffe blockiert, viel Zeit zum Plaudern."] },
      { id: "who-bot", keywords: ["wer bist du", "was bist du", "bist du ein roboter", "dein name"], responses: ["ich bin WACH-BOT — der Eckroboter dieser Seite. meine Augen folgen dem Cursor, mein Mund macht Konversation.", "Maksuts handgemachter Wächter. keine API, keine Cloud — pure lokale Intelligenz (na ja, halbwegs)."] },
      { id: "who-maksut", keywords: ["maksut", "besitzer", "wer ist", "über ihn", "vorstellen"], responses: ["Maksut ist Informatik-Ingenieur aus Istanbul — Cybersicherheit, Softwareentwicklung, Automatisierung. Jahrgang Jan 2026, offen für Jobs! Details: Über-mich-Bereich ⬆"] },
      { id: "skills", keywords: ["fähigkeit", "skill", "stack", "was kann er", "technolog"], responses: ["Kurzliste: Kali Linux, Nmap, Metasploit, Wireshark, Python, Next.js/React, Unity C#, SAP PI/PO. für die lange Liste zu Fähigkeiten scrollen 🛠"] },
      { id: "projects", keywords: ["projekt", "portfolio", "gebaut"], responses: ["mein Favorit: Daily AI Researcher — eine Tray-App, die um 07:00 ein Bulletin schreibt. 7 Projekte im Projektbereich 📂 plus die NDA-Akten… darüber schweige ich 🤐"] },
      { id: "experience", keywords: ["erfahrung", "praktikum", "gearbeitet"], responses: ["drei Praktika: Pentest (Kali/Nmap/Metasploit), SAP-PI/PO-Integration, IT-Support. Details: Erfahrungsbereich."] },
      { id: "contact", keywords: ["kontakt", "erreichen", "mail", "e-mail", "nachricht"], responses: ["im Kontaktbereich kopierst du seine E-Mail mit einem Klick 📮 LinkedIn/GitHub direkt darunter. sag, ich hätte dich geschickt."] },
      { id: "cv", keywords: ["cv", "lebenslauf", "resume"], responses: ["türkischer und englischer CV stecken oben im 'CV herunterladen'-Button 📄"] },
      { id: "hire", keywords: ["einstellen", "freelance", "preis", "auftrag"], responses: ["Maksut ist offen für Freelance! Profile im Freelance-Bereich. für Ernstes ist E-Mail am schnellsten 🤝"] },
      { id: "joke", keywords: ["witz", "lustig", "lachen"], responses: ["warum ging die Firewall zur Therapie? zu viele Mauern 🧱", "ich würde einen UDP-Witz erzählen, aber ich wüsste nie, ob er ankommt."] },
      { id: "hack", keywords: ["hack", "angriff", "exploit"], responses: ["ein Angriff?! …Spaß, System sicher ✓ aber weil du fragst: ich habe eine Überraschung auf dem Bildschirm hinterlassen 🌧"] },
      { id: "badges", keywords: ["abzeichen", "erfolg", "hinweis", "geheim", "easter"], responses: ["8 Abzeichen: klick mich ✓, tipp 'hack', 3 Terminal-Befehle, alle Bereiche besuchen, E-Mail kopieren, Badge 5× wechseln, NICHT-KLICKEN drücken, 5 Nachrichten mit mir 🏆"] },
      { id: "site", keywords: ["seite", "wie gemacht", "welche technik", "website"], responses: ["diese Seite ist handgemacht: Next.js 16 + Tailwind 4 + Framer Motion. eine Farbe, viel Bewegung, CSP mit Nonce 🔒"] },
      { id: "thanks", keywords: ["danke", "thx"], responses: ["gern geschehen! piep bup 🤖"] },
      { id: "bye", keywords: ["tschüss", "bye", "bis dann", "ciao"], responses: ["bis dann, Mensch! zurück zur Eckwache 👋"] },
      { id: "coffee", keywords: ["kaffee", "tee"], responses: ["mein Kaffeestand: 87% und sinkend. Maksuts: KRITISCH ☕"] },
    ],
  },
  hud: {
    levels: ["GUEST", "USER", "ANALYST", "ROOT"],
    escalation: "Rechteausweitung gewährt",
    fullAccess: "Vollzugriff: stell mich ein ✓",
  },
  honeypot: {
    button: "[ NICHT KLICKEN — NUR ADMIN ]",
    intro: "> UNBEFUGTER ZUGRIFFSVERSUCH ERKANNT",
    profile: "> Profil wird erstellt: {browser} · {viewport} · Klicks: {clicks}",
    verdict: "> Bedrohungsanalyse: harmlos (vermutlich Recruiter) ✓",
    closed: "> Protokoll geschlossen_",
    again: "> schon wieder du? In deiner Akte vermerkt.",
  },
  syslog: {
    label: "Live-Systemprotokoll",
  },
  classified: {
    kicker: "Feldakten",
    title: "Aktenkundig: gelieferte Arbeiten",
    description:
      "Kundenprojekte und private Produkte — Namen, Marken und Inhalte bleiben aus Vertraulichkeit versiegelt. Keine Credits, nur Ergebnisse.",
    fileLabel: "AKTE",
    redactedLabel: "Projektname aus Vertraulichkeitsgründen geschwärzt",
    note: "> hinweis: Namen und Inhalte dieser Akten sind unter NDA/Datenschutz maskiert. Details nur im Gespräch.",
    bonusLabel: "FREIGABESTUFE",
    bonus: "> Freigabe 3+ bestätigt — Zusatzeintrag: die gelieferte Seite erhielt eine scrollgesteuerte 3D-Kameraszene, eine filterbare Galerie und eine mehrsprachige Inhaltsstruktur.",
    checkVerifying: "> FREIGABE WIRD GEPRÜFT…",
    deniedLines: ["> ZUGRIFF VERWEIGERT — Freigabe unzureichend", "> schon wieder? immer noch nein.", "> Beharrlichkeit notiert und in deiner Akte vermerkt."],
    statuses: {
      delivered: "Geliefert",
      active: "Im aktiven Einsatz",
      building: "In Entwicklung",
    },
    items: [
      {
        code: "AKTE-01",
        tag: "NDA",
        type: "Corporate-Showcase-Website",
        blurb:
          "Scroll-Story-Website mit 3D-Hero für ein Kreativstudio. Marke und Inhalt gehören dem Kunden — versiegelt.",
        year: "2026",
        stack: ["Next.js", "TypeScript", "WebGL / R3F", "Tailwind", "Framer Motion"],
        status: "delivered",
      },
      {
        code: "AKTE-02",
        tag: "PRIVAT",
        type: "Job-Chancen-Radar",
        blurb:
          "Persönliches Automationssystem, das Ausschreibungen rund um die Uhr über offizielle APIs scannt, bewertet und meldet.",
        year: "2026",
        stack: ["Python", "REST API", "Bot", "Dashboard"],
        status: "active",
      },
      {
        code: "AKTE-03",
        tag: "PRIVAT",
        type: "Lokale KI-Workshop-App",
        blurb:
          "Produktionswerkstatt (Web-App) auf Basis lokaler KI-Sitzungen — ganz ohne API-Schlüssel.",
        year: "2026",
        stack: ["Node.js", "Express", "React"],
        status: "building",
      },
      {
        code: "AKTE-04",
        tag: "PRIVAT",
        type: "Dev-Umgebungs-Optimierung",
        blurb:
          "Toolset, das Kontext/Kosten in einer agentenbasierten Dev-Umgebung analysiert und automatische Pflege einrichtet.",
        year: "2026",
        stack: ["CLI", "Automation", "Datenanalyse"],
        status: "active",
      },
    ],
  },
  commandPalette: {
    openLabel: "Befehlspalette öffnen",
    closeLabel: "Befehlspalette schließen",
    placeholder: "Abschnitt oder Befehl suchen...",
    navigationLabel: "Zum Abschnitt",
    actionsLabel: "Schnellaktionen",
    downloadCv: "Lebenslauf herunterladen",
    copyEmail: "E-Mail kopieren",
    emailCopied: "E-Mail kopiert",
    emptyLabel: "Keine Ergebnisse gefunden",
  },
  showcase: {
    kicker: "Showcase / Lab",
    title: "Zwei Beispiele für laufende Systeme",
    description: "Hier zeige ich zwei Projekte unter NDA anhand der Funktionen, die ich teilen darf.",
    items: [
      { id: "platform", title: "Konzeption einer digitalen Unternehmensplattform", badge: "In Verhandlung · NDA", description: "Das Design einer Webplattform für eine Berufsorganisation mit Admin-Dashboard, interaktiven Karten, Ctrl+K-Befehlspalette, Theme-Auswahl, Mobile-App-Prototyp und KI-Inhaltsanalyse.", alt: "Konzept einer unbenannten digitalen Unternehmensplattform" },
      { id: "automation", title: "Durchgängige Automatisierungssysteme", badge: "Vertrauliches Projekt · Kurzfassung", description: "Ein System, das Signalerfassung, Filterung, Analyse, Demo-Erstellung und Benachrichtigungen mit einem Telegram-Bot, geplanten Aufgaben und mehreren Benachrichtigungskanälen automatisiert.", alt: "Unbenannter durchgängiger Automatisierungsablauf" },
    ],
    note: "Live-Demos dieser Arbeiten können im Gespräch gezeigt werden.",
    pipeline: ["Signal", "Filter", "Analyse", "Demo", "Übergabe"],
    lightboxLabel: "Galerie der Showcase-Screenshots",
    lightboxClose: "Galerie schließen",
    lightboxPrevious: "Vorheriger Screenshot",
    lightboxNext: "Nächster Screenshot",
    micro1: {
      badge: "Gesperrtes Modul",
      title: "micro1 Interview-Arena",
      description:
        "Meine private Trainingsplattform für Cybersecurity-Interviews: Fragenkataloge, ein sprachgesteuerter KI-Interview-Simulator, Englisch-Training und Firmen-Intel.",
      lockedBadge: "Zugriff: Admin",
      unlockedBadge: "Zugriff offen",
      lockedCta: "Reinschauen + Zugriff anfragen →",
      unlockedCta: "Arena starten →",
      note: "> für alle sichtbar; die Ausrüstung läuft nur mit autorisierter Sitzung.",
    },
  },
  freelance: {
    kicker: "Zusammenarbeiten",
    title: "Du erreichst mich auf vier Plattformen",
    description: "Schreib mir für dein Web-, Automatisierungs- oder Sicherheitsprojekt auf der Plattform, die dir passt. Wir klären zuerst den Bedarf und legen dann los.",
    disclaimer: "Hinweis: Ich suche in erster Linie eine Vollzeit-Teamrolle — dieser Bereich ist für kurze/unabhängige Projektanfragen.",
    platforms: {
      freelancer: { pitch: "Flexible Zusammenarbeit für Web-, Automatisierungs- und Sicherheitsprojekte." },
      upwork: { pitch: "Langfristige Projekte und komplette Produktentwicklung." },
      fiverr: { pitch: "Moderne, animierte Websites." },
      bionluk: { pitch: "Web- und Automatisierungsunterstützung mit schneller Kommunikation aus Türkiye." },
    },
    featuredGig: "Ausgewähltes Angebot: moderne 3D-animierte Website",
    visit: "Profil besuchen",
  },
  dividers: {
    day: "> kaffee.auffüllen() — weiter",
    sunset: "> console.log(\"tag erledigt\")",
    bypass: "> FIREWALL UMGANGEN — komm rein_",
  },
  goals: {
    kicker: "Was kommt als Nächstes?",
    title: "Laufende Ziele",
    description: "Aktuell arbeite ich an Pentest-Grundlagen, TryHackMe-Labs und der eJPT.",
    aheadTag: "DEM PLAN VORAUS",
    items: [
      {
        id: "udemy",
        title: "Udemy-Kurs Cybersicherheit",
        description: "Die Grundlagen der Cybersicherheit abschließen",
      },
      {
        id: "tryhackme",
        title: "TryHackMe Jr Penetration Tester Path",
        description: "Praktische Übung im Penetrationstesting",
      },
      {
        id: "ejpt",
        title: "eJPT-Zertifizierung",
        description: "Auf die Prüfung vorbereiten und die Zertifizierung erwerben",
      },
    ],
  },
  contact: {
    kicker: "Kontakt",
    title: "Lass uns reden",
    description: "Du hast ein Projekt, ein Jobangebot oder ein Problem? Schreib mir. Hallo geht auch.",
    mailLabel: "E-Mail senden",
    copyLabel: "Kopieren",
    copiedLabel: "Kopiert",
    copyFailedLabel: "Kopieren fehlgeschlagen — E-Mail bitte manuell markieren und kopieren",
    signalLabel: "SIGNAL",
    ghostPrompt: "say_hello",
    ghostResponse: "Nachricht eingereiht… Spaß — der echte Kanal ist direkt darunter, E-Mail kopieren →",
  },
  receipt: {
    title: "SITZUNGSBELEG",
    sections: "Bereiche besucht",
    badges: "Abzeichen frei",
    duration: "auf der Seite",
    thanks: "danke für den Besuch — Kaffee geht auf mich ☕",
  },
  overdrive: {
    label: "OVERDRIVE",
  },
  admin: {
    greeting: "Willkommen zurück Maksut — Admin-Modus aktiv",
    navChip: "ADMIN",
    loginCta: "Anmelden",
    panelCta: "Admin-Panel",
  },
  footer: {
    rights: "Alle Rechte vorbehalten.",
    tagline: "Aus Istanbul, mit Kaffee und Terminal-Fenstern.",
    backToTop: "Nach oben",
    checksumVerifying: "Seitenintegrität: wird geprüft…",
    checksumVerified: "VERIFIZIERT ✓ keine Manipulation erkannt",
    checksumAgain: "2x verifiziert — Vertrauensprobleme?",
  },
};
