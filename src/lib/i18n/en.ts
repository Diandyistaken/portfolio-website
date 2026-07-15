import type { Content } from "./types";

export const en: Content = {
  htmlLang: "en",
  meta: {
    title: "Muhammed Maksut Çakmaktaş | Computer Engineer & Cybersecurity",
    description:
      "Personal portfolio of Muhammed Maksut Çakmaktaş, a Computer Engineer who builds proactive solutions across cybersecurity and software development.",
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
    scanLabel: "Start ID scan",
    verifiedLabel: "ID VERIFIED",
    onlineLabel: "IST // ONLINE",
    scrollLabel: "SCROLL",
  },
  about: {
    kicker: "About",
    title: "Who is Muhammed Maksut?",
    reelLead: "The secret of the colors: this video colors the entire site.",
    stats: [
      { value: 2026, suffix: "", label: "Graduation year" },
      { value: 9, suffix: "", label: "Projects built" },
      { value: 20, suffix: "+", label: "Technologies used" },
    ],
  },
  reel: {
    description: "Every accent color on the site is sampled from this video — the interface takes on the color of the current frame. Scroll to try it.",
    captions: [
      "system secure",
      "attack simulation",
      "defense active",
      "sunset — workday over",
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
    photosIntro: "Two frames from graduation day — a short personal aside.",
    photos: [
      {
        id: "mother",
        alt: "Muhammed Maksut Çakmaktaş with his mother at his graduation ceremony",
        caption: "With my mom",
      },
      {
        id: "sibling",
        alt: "Muhammed Maksut Çakmaktaş with his sibling at his graduation ceremony",
        caption: "With my sibling",
      },
    ],
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
    day: "A breather between lines of code: Istanbul.",
    sunset: "End of the day: systems secure, sun going down.",
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
  },
  footer: {
    rights: "All rights reserved.",
  },
};
