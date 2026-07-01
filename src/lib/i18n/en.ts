import type { Content } from "./types";

export const en: Content = {
  htmlLang: "en",
  meta: {
    title: "Muhammed Maksut Çakmaktaş | Computer Engineer & Cybersecurity Enthusiast",
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
    bio: "I'm an innovative Computer Engineer who builds proactive solutions across cybersecurity and software development. I combine hands-on field experience, ranging from network security to system automation, with sharp analytical thinking and uncompromising work discipline. Driven by a genuine passion for technology, my goal is to become a lasting part of professional teams that create value and push boundaries. Throughout my studies I've built hands-on projects across several disciplines, including academic work in AI and large language models — an area I'm continuing to actively grow in.",
    location: "Istanbul, Türkiye",
    email: "mo_maksut@gmail.com",
    linkedin: "https://www.linkedin.com/in/muhammed-maksut-çakmaktaş-967502365/",
    github: "https://github.com/diandyistaken",
    instagram: "https://www.instagram.com/diandyistaken/",
  },
  hero: {
    greeting: "Hi, I'm",
    ctaPrimary: "Get in Touch",
    followLabel: "Follow",
    followLinkedin: "Follow on LinkedIn",
    followInstagram: "Follow on Instagram",
    cvLabel: "Download CV",
    cvOptionTr: "Turkish CV",
    cvOptionEn: "English CV",
  },
  about: {
    kicker: "About",
    title: "Who is Muhammed Maksut?",
  },
  skills: {
    kicker: "Skills",
    title: "Three disciplines, one analytical mindset",
    description:
      "From cybersecurity to game development, from enterprise integration to automation — a broad technical range.",
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
            label: "Developer Vision",
            description:
              "Designing digital worlds with a focus on performance, optimization, and user experience",
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
      "From idea to working product — end-to-end support across automation and security.",
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
    items: [
      {
        id: "cyber4",
        role: "Cybersecurity Intern",
        period: "Jul 2025 – Aug 2025",
        description:
          "During a twenty-day internship, I took an active role in system vulnerability analysis and penetration testing using tools such as Nmap and Metasploit in a Kali Linux environment. I also developed Python-based scripts that directly contributed to automating security operations and to the technical internship reporting process.",
      },
      {
        id: "negzel",
        role: "SAP PI/PO Intern",
        period: "Aug 2025 – Sep 2025",
        description:
          "I carried out hands-on work on the SAP PI/PO integration architecture to optimize data flow and communication between enterprise systems. Using middleware software, I provided technical support for the digital transformation and integration stages of business processes.",
      },
      {
        id: "iskur",
        role: "IT Support",
        period: "Jan 2025 – Jun 2025",
        description:
          "I provided first-level technical support for hardware, software, and basic network issues reported by internal users. I carried out the routine maintenance and troubleshooting operations required to keep systems running without interruption.",
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
    items: [
      {
        id: "rpg",
        title: "2.5D RPG (Unity)",
        description: "A Unity-based 2.5D RPG game project built in C#.",
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
      {
        id: "emotion-ai",
        title: "Emotion Detection Using AI",
        description:
          "A real-time facial emotion recognition system built with a Convolutional Neural Network (CNN).",
      },
    ],
  },
  goals: {
    kicker: "Roadmap",
    title: "Ongoing goals",
    description: "Less about certificates, more about a continuous learning journey.",
    items: [
      {
        id: "udemy",
        title: "Udemy Cybersecurity Course",
        description: "Building foundational knowledge",
      },
      {
        id: "tryhackme",
        title: "TryHackMe Jr Penetration Tester Path",
        description: "Hands-on penetration testing practice",
      },
      {
        id: "ejpt",
        title: "eJPT Certification",
        description: "eLearnSecurity Junior Penetration Tester",
      },
    ],
  },
  contact: {
    kicker: "Contact",
    title: "Let's talk",
    description: "For an idea, an opportunity, or just to say hello.",
    copyLabel: "Copy",
    copiedLabel: "Copied",
  },
  footer: {
    rights: "All rights reserved.",
  },
};
