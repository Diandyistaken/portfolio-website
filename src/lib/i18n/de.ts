import type { Content } from "./types";

export const de: Content = {
  htmlLang: "de",
  meta: {
    title: "Muhammed Maksut Çakmaktaş | Informatiker & Cybersecurity-Enthusiast",
    description:
      "Persönliches Portfolio von Muhammed Maksut Çakmaktaş, einem Informatiker, der proaktive Lösungen in den Bereichen Cybersicherheit und Softwareentwicklung entwickelt.",
  },
  nav: {
    about: "Über mich",
    skills: "Fähigkeiten",
    experience: "Erfahrung",
    education: "Ausbildung",
    projects: "Projekte",
    goals: "Ziele",
    contact: "Kontakt",
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
    bio: "Ich bin ein innovativer Informatiker, der proaktive Lösungen in den Bereichen Cybersicherheit und Softwareentwicklung entwickelt. Meine praktischen Erfahrungen, von Netzwerksicherheit bis hin zu Systemautomatisierung, verbinde ich mit ausgeprägtem analytischem Denken und einer konsequenten Arbeitsdisziplin. Mit meiner Leidenschaft für Technologie möchte ich langfristig Teil professioneller Teams werden, die echten Mehrwert schaffen und Grenzen verschieben. Während meines Studiums habe ich praxisnahe Projekte in verschiedenen Bereichen umgesetzt, darunter auch akademische Arbeiten im Bereich KI und große Sprachmodelle – ein Feld, in dem ich mich kontinuierlich weiterentwickle.",
    location: "Istanbul, Türkei",
    email: "mo_maksut@gmail.com",
    linkedin: "https://www.linkedin.com/in/muhammed-maksut-çakmaktaş-967502365/",
    github: "https://github.com/diandyistaken",
    instagram: "https://www.instagram.com/diandyistaken/",
  },
  hero: {
    greeting: "Hallo, ich bin",
    ctaPrimary: "Kontakt aufnehmen",
    followLabel: "Folgen",
    followLinkedin: "Auf LinkedIn folgen",
    followInstagram: "Auf Instagram folgen",
    cvLabel: "Lebenslauf herunterladen",
    cvOptionTr: "Lebenslauf (Türkisch)",
    cvOptionEn: "Lebenslauf (Englisch)",
  },
  about: {
    kicker: "Über mich",
    title: "Wer ist Muhammed Maksut?",
  },
  skills: {
    kicker: "Fähigkeiten",
    title: "Drei Disziplinen, ein analytischer Blick",
    description:
      "Von Cybersicherheit über Spieleentwicklung bis hin zu Unternehmensintegration und Automatisierung – ein breites technisches Spektrum.",
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
            label: "Entwickler-Perspektive",
            description:
              "Gestaltung digitaler Welten mit Fokus auf Performance, Optimierung und Nutzererfahrung",
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
    ],
  },
  experience: {
    kicker: "Erfahrung",
    title: "Praxiserfahrung",
    items: [
      {
        id: "cyber4",
        role: "Praktikant Cybersicherheit",
        period: "Juli 2025 – August 2025",
        description:
          "Im Rahmen eines zwanzigtägigen Praktikums habe ich aktiv an der Systemschwachstellenanalyse und an Penetrationstests mitgewirkt, unter anderem mit Nmap und Metasploit in einer Kali-Linux-Umgebung. Zudem habe ich Python-basierte Skripte entwickelt, die direkt zur Automatisierung von Sicherheitsabläufen und zur technischen Praktikumsberichterstattung beigetragen haben.",
      },
      {
        id: "negzel",
        role: "Praktikant SAP PI/PO",
        period: "August 2025 – September 2025",
        description:
          "Ich habe praxisnah an der SAP-PI/PO-Integrationsarchitektur gearbeitet, um den Datenfluss und die Kommunikation zwischen Unternehmenssystemen zu optimieren. Mithilfe von Middleware-Software habe ich technischen Support für die Digitalisierungs- und Integrationsphasen von Geschäftsprozessen geleistet.",
      },
      {
        id: "iskur",
        role: "IT-Support",
        period: "Januar 2025 – Juni 2025",
        description:
          "Ich habe internen Anwendern erstklassigen technischen Support bei Hardware-, Software- und grundlegenden Netzwerkproblemen geleistet. Zudem habe ich die notwendigen Wartungs- und Fehlerbehebungsarbeiten für einen unterbrechungsfreien Systembetrieb durchgeführt.",
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
    photos: [
      {
        id: "mother",
        alt: "Muhammed Maksut Çakmaktaş mit seiner Mutter bei der Abschlussfeier",
        caption: "Mit meiner Mutter",
      },
      {
        id: "sibling",
        alt: "Muhammed Maksut Çakmaktaş mit seinem Geschwister bei der Abschlussfeier",
        caption: "Mit meinem Geschwister",
      },
    ],
  },
  projects: {
    kicker: "Projekte",
    title: "Womit ich mich beschäftigt habe",
    description: "Von der Spieleentwicklung über Automatisierung bis hin zu KI und Systemtools.",
    items: [
      {
        id: "rpg",
        title: "2.5D-RPG (Unity)",
        description: "Ein mit C# entwickeltes 2.5D-RPG-Spieleprojekt auf Unity-Basis.",
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
      {
        id: "emotion-ai",
        title: "Emotionserkennung mit KI",
        description:
          "Ein Echtzeitsystem zur Erkennung von Gesichtsausdrücken mittels eines Convolutional Neural Network (CNN).",
      },
    ],
  },
  goals: {
    kicker: "Fahrplan",
    title: "Laufende Ziele",
    description: "Weniger Zertifikate, mehr eine kontinuierliche Lernreise.",
    items: [
      {
        id: "udemy",
        title: "Udemy-Kurs Cybersicherheit",
        description: "Aufbau von Grundlagenwissen",
      },
      {
        id: "tryhackme",
        title: "TryHackMe Jr Penetration Tester Path",
        description: "Praktische Übung im Penetrationstesting",
      },
      {
        id: "ejpt",
        title: "eJPT-Zertifizierung",
        description: "eLearnSecurity Junior Penetration Tester",
      },
    ],
  },
  contact: {
    kicker: "Kontakt",
    title: "Lass uns reden",
    description: "Für eine Idee, eine Gelegenheit oder einfach nur, um Hallo zu sagen.",
    copyLabel: "Kopieren",
    copiedLabel: "Kopiert",
  },
  footer: {
    rights: "Alle Rechte vorbehalten.",
  },
};
