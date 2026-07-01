export const personalInfo = {
  name: "Muhammed Maksut Çakmaktaş",
  title: "Bilgisayar Mühendisi | Cybersecurity Enthusiast",
  bio: "Siber güvenlik ve yazılım geliştirme süreçlerinde proaktif çözümler üreten yenilikçi bir Bilgisayar Mühendisiyim. Ağ güvenliğinden sistem otomasyonlarına kadar geniş bir yelpazede edindiğim saha tecrübelerini, güçlü bir analitik zekâ ve tavizsiz bir çalışma disipliniyle harmanlıyorum. Teknolojiye olan tutkumla, değer yaratan ve sınırları zorlayan profesyonel ekiplerin kalıcı bir parçası olmayı hedefliyorum.",
  email: "mo_maksut@gmail.com",
  linkedin: "https://www.linkedin.com/in/muhammed-maksut-çakmaktaş-967502365/",
  github: "https://github.com/diandyistaken",
};

export type SkillCategory = {
  title: string;
  size: "lg" | "md";
  items: { label: string; description: string }[];
  tools?: string[];
};

export const skillCategories: SkillCategory[] = [
  {
    title: "Siber Güvenlik ve Ağ",
    size: "lg",
    items: [
      {
        label: "Python ile Otomasyon",
        description:
          "Güvenlik süreçleri, tehdit analizi ve sistem optimizasyonu için betik geliştirme",
      },
      {
        label: "Sistem Güvenliği",
        description:
          "Linux tabanlı ortamlarda proaktif güvenlik yaklaşımı, ağ analizi ve sızma testi metodolojileri",
      },
    ],
    tools: ["Kali Linux", "Nmap", "Metasploit", "Wireshark", "Bettercap"],
  },
  {
    title: "Oyun Geliştirme",
    size: "md",
    items: [
      {
        label: "Unity ve C Ekosistemi",
        description:
          "Unity oyun motoru mimarisine hakimiyet, C tabanlı diller (C#/C++) ile oyun mekaniği ve nesne yönelimli programlama",
      },
      {
        label: "Geliştirici Vizyonu",
        description:
          "Performans, optimizasyon ve kullanıcı deneyimi odaklı dijital dünya tasarımı",
      },
    ],
  },
  {
    title: "Kurumsal Yazılım ve Entegrasyon",
    size: "md",
    items: [
      {
        label: "Sistem Entegrasyonu",
        description:
          "Kurumsal mimarilerde veri akışı ve SAP PI/PO süreçleri yönetimi",
      },
      {
        label: "Analitik Problem Çözme",
        description:
          "Bilgisayar Mühendisliği disipliniyle algoritma tasarımı, uçtan uca yazılım yaşam döngüsü ve kod optimizasyonu",
      },
    ],
  },
];

export type Experience = {
  company: string;
  role: string;
  period: string;
  description: string;
};

export const experiences: Experience[] = [
  {
    company: "Cyber4 Intelligence",
    role: "Siber Güvenlik Stajyeri",
    period: "Temmuz 2025 – Ağustos 2025",
    description:
      "Yirmi günlük staj programı kapsamında, Kali Linux ortamında Nmap ve Metasploit gibi araçları kullanarak sistem zafiyet analizi ve penetrasyon testi süreçlerinde aktif rol aldım. Ayrıca Python tabanlı betikler geliştirerek güvenlik operasyonlarının otomasyonuna ve teknik staj raporlama süreçlerine doğrudan katkı sağladım.",
  },
  {
    company: "Negzel Technology",
    role: "SAP PI/PO Stajyeri",
    period: "Ağustos 2025 – Eylül 2025",
    description:
      "Kurumsal sistemler arasındaki veri akışını ve iletişimi optimize etmek amacıyla SAP PI/PO entegrasyon mimarisi üzerinde uygulamalı çalışmalar gerçekleştirdim. Ara katman yazılımları kullanılarak yürütülen iş süreçlerinin dijital dönüşüm ve entegrasyon aşamalarına teknik destek sundum.",
  },
  {
    company: "İŞKUR",
    role: "BT Destek (IT Support)",
    period: "Ocak 2025 – Haziran 2025",
    description:
      "Kurum içi kullanıcılardan gelen talepler doğrultusunda donanım, yazılım ve temel ağ problemlerine yönelik birinci seviye teknik destek sağladım. Sistemlerin kesintisiz çalışması için gerekli rutin bakım ve sorun giderme operasyonlarını yürüttüm.",
  },
];

export const education = {
  school: "Osmaniye Korkut Ata Üniversitesi",
  department: "Bilgisayar Mühendisliği (Computer Engineering)",
  graduation: "Ocak 2026",
};

export type Project = {
  title: string;
  description: string;
  url: string;
  size: "lg" | "md";
  tags: string[];
};

export const projects: Project[] = [
  {
    title: "2.5D RPG (Unity)",
    description:
      "C# ile geliştirilmiş Unity tabanlı 2.5D RPG oyun projesi.",
    url: "https://github.com/Diandyistaken/2.5d-rpg-unity",
    size: "lg",
    tags: ["Unity", "C#", "Game Dev"],
  },
  {
    title: "Image Cleaner",
    description:
      "İzlenen klasördeki .jpg dosyalarını otomatik .png formatına dönüştüren ve istenmeyen dosyaları temizleyen Python aracı.",
    url: "https://github.com/Diandyistaken/image-cleaner",
    size: "md",
    tags: ["Python", "Automation"],
  },
  {
    title: "Dosya İsim Kaydedici",
    description:
      "Klasördeki dosya adlarını/uzantılarını .txt formatında dışa aktaran Python aracı.",
    url: "https://github.com/Diandyistaken/dosya-isim-kaydedici",
    size: "md",
    tags: ["Python", "CLI"],
  },
  {
    title: "Emotion Detection Using AI",
    description:
      "CNN (Convolutional Neural Network) kullanılarak gerçek zamanlı yüz ifadesinden duygu tanıma sistemi.",
    url: "https://github.com/Diandyistaken/emotion-detection-using-AI",
    size: "lg",
    tags: ["AI", "CNN", "Computer Vision"],
  },
];

export type Goal = {
  title: string;
  description: string;
  progress: number;
};

export const goals: Goal[] = [
  {
    title: "Udemy Cybersecurity Kursu",
    description: "Temel bilgi edinimi",
    progress: 70,
  },
  {
    title: "TryHackMe Jr Penetration Tester Path",
    description: "Uygulamalı sızma testi pratiği",
    progress: 45,
  },
  {
    title: "eJPT Sertifikasyonu",
    description: "eLearnSecurity Junior Penetration Tester",
    progress: 20,
  },
];
