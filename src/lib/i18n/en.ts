import type { Content } from "./types";

export const en: Content = {
  htmlLang: "en",
  meta: {
    title: "Muhammed Maksut Çakmaktaş | Computer Engineer & Cybersecurity",
    description:
      "Personal portfolio of Muhammed Maksut Çakmaktaş, a Computer Engineer who builds proactive solutions across cybersecurity and software development.",
    knowsAbout: [
      "Cybersecurity",
      "Penetration Testing",
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
    about: "About",
    skills: "Skills",
    services: "Services",
    experience: "Experience",
    education: "Education",
    projects: "Projects",
    showcase: "Showcase",
    freelance: "Freelance",
    goals: "Goals",
    contact: "Contact",
  },
  common: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    languageSwitcher: "Change language",
    skipToContent: "Skip to content",
  },
  personalInfo: {
    name: "Muhammed Maksut Çakmaktaş",
    title: "Computer Engineer | Cybersecurity Enthusiast",
    bio: "I'm a Computer Engineer working on cybersecurity, software development, and system automation. I've gained hands-on experience with Nmap, Metasploit, Python, SAP PI/PO, and AI projects. Now I want to join a team that builds secure, useful products.",
    location: "Istanbul, Türkiye",
    email: "mo.maksut@gmail.com",
    linkedin: "https://www.linkedin.com/in/muhammed-maksut-çakmaktaş-967502365/",
    github: "https://github.com/diandyistaken",
    instagram: "https://www.instagram.com/diandyistaken/",
  },
  hero: {
    greeting: "Hi, I'm",
    badge: "Open to new roles",
    ctaPrimary: "Get in Touch",
    ctaSecondary: "See Projects",
    followLabel: "Follow",
    followLinkedin: "Follow on LinkedIn",
    followInstagram: "Follow on Instagram",
    cvLabel: "Download CV",
    cvOptionTr: "Turkish CV",
    cvOptionEn: "English CV",
    ticker: [
      "> network scan … CLEAN",
      "> 0 open ports exposed",
      "> uptime 99.98%",
      "> threat: LOW — coffee: CRITICAL",
    ],
    statusCycle: [
      "Open to new opportunities",
      "status: coffee 87%",
      "uptime: 99.98%",
      "mode: deep focus",
      "vpn: on · no trace",
    ],
    scanLabel: "Start ID scan",
    verifiedLabel: "ID VERIFIED",
    onlineLabel: "IST // ONLINE",
    scrollLabel: "SCROLL",
  },
  robot: {
    label: "Robot assistant — click to chat",
    dismissLabel: "Hide robot",
    introMessage: "beep boop! I'm the watch robot — my eyes follow you 👀",
    messages: [
      "beep boop! welcome, visitor_",
      "system scan: all clear ✓",
      "maksut is coding right now, I'm on watch",
      "you clicked me! +10 cuteness points",
      "firewall: me. kidding… or am I?",
      "coffee level critical, refilling…",
      "blocked 0 attacks today. quiet day.",
      "psst… try the command palette with ⌘K",
    ],
    sleepingMessage: "zzz… (move the mouse to wake me)",
    hackMessage: "!! intrusion detected… kidding. system secure ✓",
    honeypotMessage: "you weren't supposed to press that… lucky I'm cute 👀",
  },
  about: {
    kicker: "About",
    title: "Who is Muhammed Maksut?",
    terminalLead: "A quick introduction — from the command line.",
    terminal: {
      title: "maksut@istanbul: ~",
      commands: [
        { cmd: "whoami", out: "Muhammed Maksut Çakmaktaş — Computer Engineer" },
        { cmd: "cat focus.txt", out: "security · software development · system automation" },
        { cmd: "ls skills/", out: "nmap  metasploit  python  next.js  unity  sap-pi/po" },
        { cmd: "status --now", out: "● open to work · Istanbul · class of Jan 2026" },
      ],
      extras: [
        { cmd: "sudo make coffee", out: "permission denied: bring your own cup first ☕" },
        { cmd: "ping motivation", out: "64 bytes reply: time=0.1ms — always up" },
        { cmd: "rm -rf sleep/", out: "removed. exam-week mode enabled." },
        { cmd: "git push --force courage", out: "everything up-to-date ✓" },
      ],
      extraHint: "// click — run one more command",
      sentryDetected: "> proximity alert: visitor detected [distance: {px}px]",
      sentryLost: "> target lost_",
    },
    stats: [
      { value: 2026, suffix: "", label: "Graduation year" },
      { value: 9, suffix: "", label: "Projects built" },
      { value: 20, suffix: "+", label: "Technologies used" },
    ],
  },
  skills: {
    kicker: "Skills",
    title: "What I can do",
    description:
      "Cybersecurity, Unity, SAP PI/PO, and automation: the tools I use and the work I do.",
    categories: [
      {
        id: "cyber",
        title: "Cybersecurity & Networking",
        items: [
          {
            label: "Automation with Python",
            description:
              "Building scripts for security workflows, threat analysis, and system optimization",
          },
          {
            label: "System Security",
            description:
              "A proactive security mindset on Linux-based environments, network analysis, and penetration testing methodologies",
          },
        ],
      },
      {
        id: "gamedev",
        title: "Game Development",
        items: [
          {
            label: "Unity & the C-family Ecosystem",
            description:
              "Strong command of the Unity engine architecture, gameplay mechanics and object-oriented programming with C#/C++",
          },
          {
            label: "Game Performance & UX",
            description:
              "Improving game performance and building easy-to-use interfaces",
          },
        ],
      },
      {
        id: "corporate",
        title: "Enterprise Software & Integration",
        items: [
          {
            label: "System Integration",
            description: "Managing data flow and SAP PI/PO processes within enterprise architectures",
          },
          {
            label: "Analytical Problem Solving",
            description:
              "Algorithm design, end-to-end software lifecycle, and code optimization grounded in Computer Engineering",
          },
        ],
      },
      {
        id: "other",
        title: "Other Skills",
        items: [
          {
            label: "IoT-based Automation",
            description:
              "Smart home system setup, sensor integration, and home automation solutions",
          },
          {
            label: "Web Development",
            description:
              "Designing and building modern, responsive corporate and personal websites",
          },
          {
            label: "Mobile App Development",
            description:
              "UX-focused mobile app design and development for iOS and Android",
          },
        ],
      },
    ],
  },
  services: {
    kicker: "Services",
    title: "How I can help",
    description:
      "I can help with websites, mobile apps, automation, pentesting, and Unity projects.",
    items: [
      {
        id: "smart-home",
        title: "Smart Home Automation",
        description: "IoT-based smart home system setup and automation.",
      },
      {
        id: "web-dev",
        title: "Website Development",
        description:
          "Design and development of modern, responsive corporate/personal websites.",
      },
      {
        id: "pentest",
        title: "Penetration Testing",
        description:
          "Vulnerability analysis and penetration testing for systems and network security.",
      },
      {
        id: "game-dev",
        title: "Game Programming",
        description: "Unity-based game development and gameplay mechanics design.",
      },
      {
        id: "mobile-design",
        title: "Mobile App Design",
        description:
          "UX-focused mobile app design and development for iOS/Android.",
      },
      {
        id: "cross-platform",
        title: "Desktop & Mobile App Development",
        description:
          "End-to-end software development for desktop and mobile platforms.",
      },
    ],
  },
  experience: {
    kicker: "Experience",
    title: "Field experience",
    intro:
      "Three short internships showed me different layers: offensive/defensive security, enterprise integration, first-line support. Now I'm looking for a full-time team role to bring those together in production.",
    items: [
      {
        id: "cyber4",
        role: "Cybersecurity Intern",
        period: "Jul 2025 (20 days)",
        description:
          "During a twenty-day internship, I used Kali Linux, Nmap, and Metasploit for vulnerability analysis and pentesting. I wrote Python scripts that sped up security tasks and reporting.",
      },
      {
        id: "negzel",
        role: "SAP PI/PO Intern",
        period: "Aug 2025 – Sep 2025",
        description:
          "I examined data flows between enterprise systems in SAP PI/PO and provided technical support for integration tasks.",
      },
      {
        id: "iskur",
        role: "IT Support",
        period: "Jan 2025 – Jun 2025",
        description:
          "I provided first-level support for in-house hardware, software, and basic network issues. I handled routine maintenance and troubleshooting.",
      },
    ],
  },
  education: {
    kicker: "Education",
    title: "Academic background",
    school: "Osmaniye Korkut Ata University",
    department: "Computer Engineering",
    graduationLabel: "Graduation",
    graduation: "January 2026",
  },
  projects: {
    kicker: "Projects",
    title: "Things I've worked on",
    description: "From game development to automation, from AI to system tooling.",
    botShowcase: {
      label: "Live Telegram bot preview",
      typing: "typing...",
      time: "07:00",
      messages: [
        "📮 Daily AI Researcher — Sunday, July 12, 2026 / Good morning, Maksut! ☕",
        "🔥 Today on GitHub: malisper/pgrust ↗ +774 stars — a Rust rewrite of Postgres, now at 2,196 stars.",
        "vercel/next.js ↗ +334 stars — the ecosystem leader with 140,998 stars.",
        "The briefing is ready every morning at 07:00.",
      ],
    },
    items: [
      {
        id: "daily-ai-researcher",
        title: "Daily AI Researcher",
        description:
          "A Windows tray app that wakes up every morning, reads GitHub Trending and 20+ tech news sources, and uses the Claude API to write a bilingual HTML morning briefing — with dedup memory to keep token costs flat.",
      },
      {
        id: "emotion-ai",
        title: "Emotion Detection Using AI",
        description:
          "A real-time facial emotion recognition system built with a Convolutional Neural Network (CNN).",
      },
      {
        id: "rpg",
        title: "2.5D RPG (Unity)",
        description: "A Unity-based 2.5D RPG game project built in C#.",
      },
      {
        id: "career-tracker",
        title: "Udemy Career Tracker",
        description:
          "A Chrome extension that reads Udemy course progress and a companion web dashboard that turns it into a visual, gamified career-skill tree.",
      },
      {
        id: "gmail-agent",
        title: "Gmail Summary Agent",
        description:
          "A personal agent that pulls in the day's Gmail, auto-categorizes and drafts replies, and delivers a daily summary with desktop notifications.",
      },
      {
        id: "image-cleaner",
        title: "Image Cleaner",
        description:
          "A Python tool that automatically converts .jpg files in a watched folder to .png and cleans up unwanted files.",
      },
      {
        id: "file-namer",
        title: "File Name Logger",
        description:
          "A Python tool that exports file names and extensions from a folder into a .txt file.",
      },
    ],
  },
  achievements: {
    unlocked: "ACHIEVEMENT UNLOCKED",
    items: [
      { id: "robot-friend", title: "New Friend — you said hi to the robot" },
      { id: "white-hat", title: "White Hat — you found the hidden command" },
      { id: "shell-runner", title: "Command Chain — ran 3 terminal commands" },
      { id: "explorer", title: "Explorer — visited every section" },
      { id: "first-contact", title: "First Contact — copied the email" },
      { id: "status-dj", title: "Status DJ — cycled the badge 5 times" },
      { id: "honeypot", title: "Honeypot — clicked what you shouldn't have" },
      { id: "chatterbox", title: "Chatterbox — 5 messages with the robot" },
    ],
  },
  robotChat: {
    title: "SENTRY-BOT v2.1",
    subtitle: "light intelligence · online",
    placeholder: "ask me something…",
    send: "Send",
    close: "Close chat",
    greeting: "beep boop! hello in my big form 👋 ask me anything about Maksut — or we can just chat.",
    chips: ["Who is Maksut?", "What can he do?", "Projects", "How to reach him?"],
    fallbacks: ["hmm, that's beyond my circuits 🤖 try 'skills', 'projects' or 'contact'.", "my processor couldn't parse that, but I know this: Maksut is worth asking. type 'contact'.", "404 — answer not found. type 'joke' and I'll make it up to you."],
    intents: [
      { id: "greet", keywords: ["hello", "hi", "hey", "how are you", "good morning", "good evening", "sup"], responses: ["hey! circuits at 100%, coffee level critical ☕ how are you?", "hello human! blocked 0 attacks today, plenty of time to chat."] },
      { id: "who-bot", keywords: ["who are you", "what are you", "are you a robot", "your name"], responses: ["I'm SENTRY-BOT — this site's corner robot. my eyes track the cursor, my mouth makes conversation.", "Maksut's handmade sentry. no API, no cloud — pure local intelligence (decent, anyway)."] },
      { id: "who-maksut", keywords: ["maksut", "owner", "who is", "about him", "introduce"], responses: ["Maksut is an Istanbul-based Computer Engineer — cybersecurity, software development and automation. class of Jan 2026, open to work! details: About section ⬆", "my boss? a security-minded engineer. scans with nmap, automates with python, builds robots like me."] },
      { id: "skills", keywords: ["skill", "stack", "what can he do", "technolog", "which language"], responses: ["short list: Kali Linux, Nmap, Metasploit, Wireshark, Python, Next.js/React, Unity C#, SAP PI/PO. scroll to Skills for the long one 🛠", "cybersec + web + games + automation. hover the chips — they literally glow."] },
      { id: "projects", keywords: ["project", "portfolio", "built", "work"], responses: ["my favorite is Daily AI Researcher — a tray app writing a morning bulletin at 07:00 (I was inspired by it). 7 listed in Projects 📂", "7 projects from AI to Unity — plus the NDA'd classified records… can't talk about those 🤐"] },
      { id: "experience", keywords: ["experience", "internship", "worked"], responses: ["three internships: pentest (Kali/Nmap/Metasploit), SAP PI/PO integration, IT support. field-tested. details: Experience section."] },
      { id: "contact", keywords: ["contact", "reach", "mail", "email", "message", "get in touch"], responses: ["the Contact section copies his email in one click 📮 LinkedIn/GitHub right below. tell him I sent you.", "scroll down to Contact and copy the email. that easy. (copying also unlocks a badge, just saying)"] },
      { id: "cv", keywords: ["cv", "resume"], responses: ["Turkish and English CVs live in the hero's 'Download CV' button at the top 📄"] },
      { id: "hire", keywords: ["hire", "freelance", "price", "rate", "commission"], responses: ["Maksut is open to freelance! Freelancer/Upwork/Fiverr/Bionluk profiles are in the Freelance section. for serious work, email is fastest 🤝"] },
      { id: "joke", keywords: ["joke", "funny", "make me laugh"], responses: ["why did the firewall go to therapy? too many walls 🧱", "I'd tell you a UDP joke but I'd never know if it arrived.", "- are you root? - no, but I tried: sudo make coffee, permission denied ☕"] },
      { id: "hack", keywords: ["hack", "attack", "exploit", "breach"], responses: ["an attack?! …kidding, system secure ✓ but since you asked, I left a surprise on screen 🌧 check if it's raining."] },
      { id: "badges", keywords: ["badge", "achievement", "hint", "secret", "easter"], responses: ["8 badges: click me ✓, type 'hack', run 3 terminal commands, visit every section, copy the email, cycle the badge 5x, press DO NOT CLICK, chat 5 messages with me 🏆"] },
      { id: "site", keywords: ["site", "how was it made", "which tech", "website"], responses: ["this site is handmade: Next.js 16 + Tailwind 4 + Framer Motion. one color, lots of motion, nonce'd CSP — that's a security guy's website 🔒"] },
      { id: "thanks", keywords: ["thank", "thanks", "thx"], responses: ["you're welcome! beep boop 🤖", "anytime — I'm on watch anyway."] },
      { id: "bye", keywords: ["bye", "goodbye", "see you", "later"], responses: ["see you human! back to my corner watch 👋 (move the mouse and my eyes will find you)"] },
      { id: "coffee", keywords: ["coffee", "tea", "drink"], responses: ["my coffee level: 87% and dropping. Maksut's: CRITICAL. we're both refilling ☕"] },
    ],
  },
  honeypot: {
    button: "[ DO NOT CLICK — ADMIN ONLY ]",
    intro: "> UNAUTHORIZED ACCESS ATTEMPT DETECTED",
    profile: "> profiling: {browser} · {viewport} · clicks: {clicks}",
    verdict: "> threat assessment: harmless (probably a recruiter) ✓",
    closed: "> log closed_",
    again: "> you again? noted in your file.",
  },
  syslog: {
    label: "live system log",
  },
  classified: {
    kicker: "Field Records",
    title: "On the record: delivered work",
    description:
      "Client work and private products — names, brands and contents stay sealed for confidentiality. No credits, just outcomes.",
    fileLabel: "FILE",
    redactedLabel: "Project name redacted for confidentiality",
    note: "> note: names and contents in these records are masked under NDA/privacy. Details only in an interview.",
    bonusLabel: "CLEARANCE LEVEL",
    bonus: "> clearance 3+ verified — extra record: the delivered site shipped a scroll-driven 3D camera scene, a filterable gallery and a multilingual corporate content structure.",
    statuses: {
      delivered: "Delivered",
      active: "In active use",
      building: "In development",
    },
    items: [
      {
        code: "RECORD-01",
        tag: "NDA",
        type: "Corporate Showcase Website",
        blurb:
          "A scroll-story showcase site with a 3D hero for a creative studio. Brand and content belong to the client — sealed.",
        year: "2026",
        stack: ["Next.js", "TypeScript", "WebGL / R3F", "Tailwind", "Framer Motion"],
        status: "delivered",
      },
      {
        code: "RECORD-02",
        tag: "PRIVATE",
        type: "Job Opportunity Radar",
        blurb:
          "A personal automation system that scans, scores and notifies about listings 24/7 via official APIs.",
        year: "2026",
        stack: ["Python", "REST API", "Bot", "Dashboard"],
        status: "active",
      },
      {
        code: "RECORD-03",
        tag: "PRIVATE",
        type: "Local AI Workshop App",
        blurb:
          "A content production workshop (web app) running on local AI sessions — no API keys required.",
        year: "2026",
        stack: ["Node.js", "Express", "React"],
        status: "building",
      },
      {
        code: "RECORD-04",
        tag: "PRIVATE",
        type: "Dev Environment Optimization",
        blurb:
          "A toolset that audits context/cost in an agent-based dev environment and sets up automated upkeep.",
        year: "2026",
        stack: ["CLI", "Automation", "Data Analysis"],
        status: "active",
      },
    ],
  },
  commandPalette: {
    openLabel: "Open command palette",
    closeLabel: "Close command palette",
    placeholder: "Search for a section or command...",
    navigationLabel: "Go to section",
    actionsLabel: "Quick actions",
    downloadCv: "Download CV",
    copyEmail: "Copy email",
    emailCopied: "Email copied",
    emptyLabel: "No results found",
  },
  showcase: {
    kicker: "Showcase / Lab",
    title: "Two working system examples",
    description: "Here are two projects covered by NDAs, shown through the features I can share.",
    items: [
      { id: "platform", title: "Enterprise digital platform design", badge: "In negotiation · NDA", description: "A web platform design for a professional institution, with an admin dashboard, interactive maps, a Ctrl+K command palette, theme selection, a mobile app prototype, and AI content analysis.", alt: "Unnamed enterprise digital platform interface concept" },
      { id: "automation", title: "End-to-end automation systems", badge: "Stealth project · summary", description: "A system that automates signal collection, filtering, analysis, demo generation, and notifications using a Telegram bot, scheduled tasks, and multiple notification channels.", alt: "Unnamed end-to-end automation workflow" },
    ],
    note: "Live demos of these builds can be presented during an interview.",
    pipeline: ["Signal", "Filter", "Analysis", "Demo", "Delivery"],
    lightboxLabel: "Showcase screenshot gallery",
    lightboxClose: "Close gallery",
    lightboxPrevious: "Previous screenshot",
    lightboxNext: "Next screenshot",
  },
  freelance: {
    kicker: "Work With Me",
    title: "Reach me on four platforms",
    description: "For a web, automation, or security project, message me on the platform that suits you. We'll define what you need, then get to work.",
    disclaimer: "Note: I'm primarily looking for a full-time team role — this section is for short/independent project requests.",
    platforms: {
      freelancer: { pitch: "Flexible collaboration for web, automation, and security projects." },
      upwork: { pitch: "Long-term projects and complete product development." },
      fiverr: { pitch: "Modern, animated websites." },
      bionluk: { pitch: "Web and automation support with fast communication from Türkiye." },
    },
    featuredGig: "Featured gig: modern 3D animated website",
    visit: "Visit profile",
  },
  dividers: {
    day: "> coffee.refill() — resuming",
    sunset: "> console.log(\"day shipped\")",
  },
  goals: {
    kicker: "What's Next?",
    title: "Ongoing goals",
    description: "I'm currently working on pentesting fundamentals, TryHackMe labs, and the eJPT.",
    items: [
      {
        id: "udemy",
        title: "Udemy Cybersecurity Course",
        description: "Complete the cybersecurity fundamentals",
      },
      {
        id: "tryhackme",
        title: "TryHackMe Jr Penetration Tester Path",
        description: "Hands-on penetration testing practice",
      },
      {
        id: "ejpt",
        title: "eJPT Certification",
        description: "Prepare for the exam and earn the certification",
      },
    ],
  },
  contact: {
    kicker: "Contact",
    title: "Let's talk",
    description: "Got a project, job opportunity, or problem to solve? Send a message. Hello works too.",
    mailLabel: "Send email",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    copyFailedLabel: "Couldn't copy — select and copy the email manually",
    signalLabel: "SIGNAL",
  },
  receipt: {
    title: "SESSION RECEIPT",
    sections: "sections visited",
    badges: "badges unlocked",
    duration: "on page",
    thanks: "thanks for visiting — coffee's on me ☕",
  },
  overdrive: {
    label: "OVERDRIVE",
  },
  footer: {
    rights: "All rights reserved.",
    tagline: "From Istanbul, fueled by coffee and terminal windows.",
    backToTop: "Back to top",
  },
};
