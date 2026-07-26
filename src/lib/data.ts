export const cvFiles = {
  tr: "/cv/cv-tr.pdf",
  en: "/cv/cv-en.pdf",
};

// Structural data that doesn't change across locales (ids, links, tags, numbers,
// tool/company names). Keeping it here means src/lib/i18n/{tr,en,de}.ts only ever
// hold translated copy, so adding a locale never risks drifting non-text fields.
export const skillsMeta: Record<string, { size: "lg" | "md"; tools?: string[] }> = {
  cyber: { size: "lg", tools: ["Kali Linux", "Nmap", "Metasploit", "Wireshark", "Bettercap"] },
  gamedev: { size: "md" },
  corporate: { size: "md" },
  other: { size: "lg", tools: ["Next.js", "React", "Raspberry Pi", "Swift", "Kotlin"] },
};

export const servicesMeta: Record<string, { icon: "home" | "globe" | "bug" | "gamepad" | "smartphone" | "monitor" }> = {
  "smart-home": { icon: "home" },
  "web-dev": { icon: "globe" },
  pentest: { icon: "bug" },
  "game-dev": { icon: "gamepad" },
  "mobile-design": { icon: "smartphone" },
  "cross-platform": { icon: "monitor" },
};

export const experienceMeta: Record<string, { company: string }> = {
  cyber4: { company: "Cyber4 Intelligence" },
  negzel: { company: "Negzel Technology" },
  iskur: { company: "İŞKUR" },
};

export const projectsMeta: Record<string, { url: string; size: "lg" | "md"; tags: string[] }> = {
  "daily-ai-researcher": {
    url: "https://github.com/diandyistaken/daily-ai-researcher",
    size: "lg",
    tags: ["Python", "Claude API", "Automation"],
  },
  "emotion-ai": {
    url: "https://github.com/diandyistaken/emotion-detection-using-AI",
    size: "lg",
    tags: ["AI", "CNN", "Computer Vision"],
  },
  rpg: {
    url: "https://github.com/diandyistaken/2.5d-rpg-unity",
    size: "lg",
    tags: ["Unity", "C#", "Game Dev"],
  },
  "career-tracker": {
    url: "https://github.com/diandyistaken/udemy-kariyer-takip",
    size: "md",
    tags: ["Chrome Extension", "JavaScript", "SVG"],
  },
  "gmail-agent": {
    url: "https://github.com/diandyistaken/gmail-ozet-ajani",
    size: "md",
    tags: ["Node.js", "Gmail API", "Automation"],
  },
  "image-cleaner": {
    url: "https://github.com/diandyistaken/image-cleaner",
    size: "md",
    tags: ["Python", "Automation"],
  },
  "file-namer": {
    url: "https://github.com/diandyistaken/dosya-isim-kaydedici",
    size: "md",
    tags: ["Python", "CLI"],
  },
};

// Live "arsenal" cards backed by real (anonymized) screenshots. Non-text fields
// only — copy lives in i18n. `url` omitted = no public source (commercial or
// not yet published). Screenshot paths resolve under /public.
export const arsenalMeta: Record<
  string,
  { screenshots: string[]; kind: "commercial" | "oss"; url?: string; tags: string[] }
> = {
  detector: {
    screenshots: ["/showcase/detector-1.webp", "/showcase/detector-2.webp"],
    kind: "commercial",
    tags: ["Python", "DSP / ML", "5 katman", "FastAPI"],
  },
  "intent-spec": {
    screenshots: ["/showcase/intent-1.webp", "/showcase/intent-2.webp"],
    kind: "oss",
    tags: ["React 19", "TypeScript", "Vite", "Client-side"],
  },
  alleye: {
    screenshots: ["/showcase/alleye-1.webp"],
    kind: "oss",
    url: "https://github.com/diandyistaken/all-eye",
    tags: ["Python", "Windows", "Gemini API", "SQLite"],
  },
};

export const goalsMeta: Record<string, { progress: number }> = {
  udemy: { progress: 70 },
  tryhackme: { progress: 45 },
  ejpt: { progress: 20 },
};
