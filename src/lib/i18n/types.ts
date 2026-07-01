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

export type GraduationPhotoContent = {
  id: string;
  alt: string;
  caption: string;
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

export type Content = {
  htmlLang: string;
  meta: {
    title: string;
    description: string;
  };
  nav: {
    about: string;
    skills: string;
    services: string;
    experience: string;
    education: string;
    projects: string;
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
    ctaPrimary: string;
    followLabel: string;
    followLinkedin: string;
    followInstagram: string;
    cvLabel: string;
    cvOptionTr: string;
    cvOptionEn: string;
  };
  about: {
    kicker: string;
    title: string;
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
    items: ExperienceContent[];
  };
  education: {
    kicker: string;
    title: string;
    school: string;
    department: string;
    graduationLabel: string;
    graduation: string;
    photos: GraduationPhotoContent[];
  };
  projects: {
    kicker: string;
    title: string;
    description: string;
    items: ProjectContent[];
  };
  goals: {
    kicker: string;
    title: string;
    description: string;
    items: GoalContent[];
  };
  contact: {
    kicker: string;
    title: string;
    description: string;
    copyLabel: string;
    copiedLabel: string;
  };
  footer: {
    rights: string;
  };
};
