export type Locale = "tr" | "en" | "de";

export type SkillCategoryContent = {
  id: string;
  title: string;
  items: { label: string; description: string }[];
};

export type ExperienceContent = {
  id: string;
  role: string;
  period: string;
  description: string;
};

export type ProjectContent = {
  id: string;
  title: string;
  description: string;
};

export type GoalContent = {
  id: string;
  title: string;
  description: string;
};

export type ServiceContent = {
  id: string;
  title: string;
  description: string;
};

export type ShowcaseItemContent = {
  id: "platform" | "automation";
  title: string;
  badge: string;
  description: string;
  alt: string;
};

export type FreelancePlatformId = "freelancer" | "upwork" | "fiverr" | "bionluk";

export type Content = {
  htmlLang: string;
  meta: {
    title: string;
    description: string;
    knowsAbout: string[];
  };
  nav: {
    about: string;
    skills: string;
    services: string;
    experience: string;
    education: string;
    projects: string;
    showcase: string;
    freelance: string;
    goals: string;
    contact: string;
  };
  common: {
    openMenu: string;
    closeMenu: string;
    themeToLight: string;
    themeToDark: string;
    languageSwitcher: string;
    skipToContent: string;
  };
  personalInfo: {
    name: string;
    title: string;
    bio: string;
    location: string;
    email: string;
    linkedin: string;
    github: string;
    instagram: string;
  };
  hero: {
    greeting: string;
    badge: string;
    ctaPrimary: string;
    ctaSecondary: string;
    followLabel: string;
    followLinkedin: string;
    followInstagram: string;
    cvLabel: string;
    cvOptionTr: string;
    cvOptionEn: string;
    ticker: string[];
    statusCycle: string[];
    ledTips: string[];
    scanLabel: string;
    verifiedLabel: string;
    onlineLabel: string;
    scrollLabel: string;
  };
  robot: {
    label: string;
    dismissLabel: string;
    introMessage: string;
    messages: string[];
    sleepingMessage: string;
    hackMessage: string;
    honeypotMessage: string;
    sentryMessage: string;
  };
  achievements: {
    unlocked: string;
    items: { id: string; title: string }[];
  };
  robotChat: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    close: string;
    greeting: string;
    chips: string[];
    fallbacks: string[];
    intents: { id: string; keywords: string[]; responses: string[] }[];
  };
  hud: {
    levels: string[];
    escalation: string;
    fullAccess: string;
  };
  honeypot: {
    button: string;
    intro: string;
    profile: string;
    verdict: string;
    closed: string;
    again: string;
  };
  syslog: {
    label: string;
  };
  about: {
    kicker: string;
    title: string;
    terminalLead: string;
    manifesto: string;
    terminal: {
      title: string;
      commands: { cmd: string; out: string }[];
      extras: { cmd: string; out: string }[];
      extraHint: string;
      sentryDetected: string;
      sentryLost: string;
    };
    stats: { value: number; suffix: string; label: string }[];
  };
  skills: {
    kicker: string;
    title: string;
    description: string;
    categories: SkillCategoryContent[];
  };
  services: {
    kicker: string;
    title: string;
    description: string;
    items: ServiceContent[];
  };
  experience: {
    kicker: string;
    title: string;
    intro: string;
    items: ExperienceContent[];
  };
  education: {
    kicker: string;
    title: string;
    school: string;
    department: string;
    graduationLabel: string;
    graduation: string;
  };
  projects: {
    kicker: string;
    title: string;
    description: string;
    items: ProjectContent[];
    botShowcase: {
      label: string;
      messages: string[];
      typing: string;
      time: string;
    };
  };
  classified: {
    kicker: string;
    title: string;
    description: string;
    fileLabel: string;
    redactedLabel: string;
    note: string;
    bonusLabel: string;
    bonus: string;
    checkVerifying: string;
    deniedLines: string[];
    statuses: { delivered: string; active: string; building: string };
    items: {
      code: string;
      tag: string;
      type: string;
      blurb: string;
      year: string;
      stack: string[];
      status: "delivered" | "active" | "building";
    }[];
  };
  commandPalette: {
    openLabel: string;
    closeLabel: string;
    placeholder: string;
    navigationLabel: string;
    actionsLabel: string;
    downloadCv: string;
    copyEmail: string;
    emailCopied: string;
    emptyLabel: string;
  };
  showcase: {
    kicker: string;
    title: string;
    description: string;
    items: ShowcaseItemContent[];
    note: string;
    pipeline: string[];
    lightboxLabel: string;
    lightboxClose: string;
    lightboxPrevious: string;
    lightboxNext: string;
  };
  freelance: {
    kicker: string;
    title: string;
    description: string;
    disclaimer: string;
    platforms: Record<FreelancePlatformId, { pitch: string }>;
    featuredGig: string;
    visit: string;
  };
  dividers: {
    day: string;
    sunset: string;
    bypass: string;
  };
  goals: {
    kicker: string;
    title: string;
    description: string;
    aheadTag: string;
    items: GoalContent[];
  };
  contact: {
    kicker: string;
    title: string;
    description: string;
    mailLabel: string;
    copyLabel: string;
    copiedLabel: string;
    copyFailedLabel: string;
    signalLabel: string;
    ghostPrompt: string;
    ghostResponse: string;
  };
  footer: {
    rights: string;
    tagline: string;
    backToTop: string;
    checksumVerifying: string;
    checksumVerified: string;
    checksumAgain: string;
  };
  receipt: {
    title: string;
    sections: string;
    badges: string;
    duration: string;
    thanks: string;
  };
  overdrive: {
    label: string;
  };
};
