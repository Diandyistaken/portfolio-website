export const cvFiles = {
  tr: "/cv/cv-tr.pdf",
  en: "/cv/cv-en.pdf",
};

// Warm accent glows placed behind existing site photos (profile photo,
// graduation photos) instead of separate decorative stock imagery.
export const photoGlows = {
  mother: "#f2a33c",
  sibling: "#e8748f",
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

export const educationPhotosMeta: Record<string, { src: string }> = {
  mother: { src: "/mezuniyet-anne.jpg" },
  sibling: { src: "/mezuniyet-kardes.jpg" },
};

export const projectsMeta: Record<string, { url: string; size: "lg" | "md"; tags: string[] }> = {
  rpg: {
    url: "https://github.com/Diandyistaken/2.5d-rpg-unity",
    size: "lg",
    tags: ["Unity", "C#", "Game Dev"],
  },
  "image-cleaner": {
    url: "https://github.com/Diandyistaken/image-cleaner",
    size: "md",
    tags: ["Python", "Automation"],
  },
  "file-namer": {
    url: "https://github.com/Diandyistaken/dosya-isim-kaydedici",
    size: "md",
    tags: ["Python", "CLI"],
  },
  "emotion-ai": {
    url: "https://github.com/Diandyistaken/emotion-detection-using-AI",
    size: "lg",
    tags: ["AI", "CNN", "Computer Vision"],
  },
};

export const goalsMeta: Record<string, { progress: number }> = {
  udemy: { progress: 70 },
  tryhackme: { progress: 45 },
  ejpt: { progress: 20 },
};
