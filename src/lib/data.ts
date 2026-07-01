export const cvFiles = {
  tr: "/cv/cv-tr.pdf",
  en: "/cv/cv-en.pdf",
};

export const ambientAssets = {
  day: {
    src: "/ambient/bosphorus-day.webp",
    width: 960,
    height: 536,
    glow: "#4cbeda",
  },
  sunset: {
    src: "/ambient/bosphorus-sunset.webp",
    width: 960,
    height: 524,
    glow: "#f2a33c",
  },
};

// Structural data that doesn't change across locales (ids, links, tags, numbers,
// tool/company names). Keeping it here means src/lib/i18n/{tr,en,de}.ts only ever
// hold translated copy, so adding a locale never risks drifting non-text fields.
export const skillsMeta: Record<string, { size: "lg" | "md"; tools?: string[] }> = {
  cyber: { size: "lg", tools: ["Kali Linux", "Nmap", "Metasploit", "Wireshark", "Bettercap"] },
  gamedev: { size: "md" },
  corporate: { size: "md" },
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
