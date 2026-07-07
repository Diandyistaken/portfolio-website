import type { Content } from "./types";

export const tr: Content = {
  htmlLang: "tr",
  meta: {
    title: "Muhammed Maksut Çakmaktaş | Bilgisayar Mühendisi & Siber Güvenlik Uzmanı",
    description:
      "Muhammed Maksut Çakmaktaş (Maksut Çakmaktaş) — İstanbul merkezli Bilgisayar Mühendisi; Siber Güvenlik, Penetrasyon Testi ve DevSecOps alanlarında projeler geliştiriyor. Portfolyo, yetenekler ve iletişim.",
  },
  nav: {
    about: "Hakkımda",
    skills: "Yetenekler",
    services: "Hizmetler",
    experience: "Deneyim",
    education: "Eğitim",
    projects: "Projeler",
    goals: "Hedefler",
    contact: "İletişim",
  },
  common: {
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    themeToLight: "Açık temaya geç",
    themeToDark: "Koyu temaya geç",
    languageSwitcher: "Dili değiştir",
    skipToContent: "İçeriğe geç",
  },
  personalInfo: {
    name: "Muhammed Maksut Çakmaktaş",
    title: "Bilgisayar Mühendisi | Cybersecurity Enthusiast",
    bio: "Siber güvenlik ve yazılım geliştirme süreçlerinde proaktif çözümler üreten yenilikçi bir Bilgisayar Mühendisiyim. Ağ güvenliğinden sistem otomasyonlarına kadar geniş bir yelpazede edindiğim saha tecrübelerini, güçlü bir analitik zekâ ve tavizsiz bir çalışma disipliniyle harmanlıyorum. Teknolojiye olan tutkumla, değer yaratan ve sınırları zorlayan profesyonel ekiplerin kalıcı bir parçası olmayı hedefliyorum. Eğitimim boyunca farklı disiplinlerde uygulamalı projeler geliştirdim; bunlar arasında yapay zekâ ve büyük dil modelleri üzerine akademik çalışmalar da yer alıyor ve bu alanda kendimi aktif biçimde geliştirmeye devam ediyorum.",
    location: "İstanbul, Türkiye",
    email: "mo_maksut@gmail.com",
    linkedin: "https://www.linkedin.com/in/muhammed-maksut-çakmaktaş-967502365/",
    github: "https://github.com/diandyistaken",
    instagram: "https://www.instagram.com/diandyistaken/",
  },
  hero: {
    greeting: "Merhaba, ben",
    ctaPrimary: "İletişime Geç",
    followLabel: "Takip Et",
    followLinkedin: "LinkedIn'de takip et",
    followInstagram: "Instagram'da takip et",
    cvLabel: "CV İndir",
    cvOptionTr: "Türkçe CV",
    cvOptionEn: "English CV",
  },
  about: {
    kicker: "Hakkımda",
    title: "Kim bu Muhammed Maksut?",
  },
  skills: {
    kicker: "Yetenekler",
    title: "Üç disiplin, tek analitik bakış",
    description:
      "Siber güvenlikten oyun geliştirmeye, kurumsal entegrasyondan otomasyona kadar geniş bir teknik yelpaze.",
    categories: [
      {
        id: "cyber",
        title: "Siber Güvenlik ve Ağ",
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
      },
      {
        id: "gamedev",
        title: "Oyun Geliştirme",
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
        id: "corporate",
        title: "Kurumsal Yazılım ve Entegrasyon",
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
      {
        id: "other",
        title: "Diğer Yetkinlikler",
        items: [
          {
            label: "IoT Tabanlı Otomasyon",
            description:
              "Akıllı ev sistemleri kurulumu, sensör entegrasyonu ve ev otomasyonu çözümleri",
          },
          {
            label: "Web Geliştirme",
            description:
              "Modern, responsive kurumsal ve kişisel web siteleri tasarımı ve geliştirmesi",
          },
          {
            label: "Mobil Uygulama Geliştirme",
            description:
              "iOS ve Android için kullanıcı deneyimi odaklı mobil uygulama tasarımı ve geliştirmesi",
          },
        ],
      },
    ],
  },
  services: {
    kicker: "Hizmetler",
    title: "Nasıl yardımcı olabilirim",
    description:
      "Fikirden çalışan ürüne; otomasyondan güvenliğe uçtan uca destek.",
    items: [
      {
        id: "smart-home",
        title: "Akıllı Ev Otomasyonu",
        description: "IoT tabanlı akıllı ev sistemleri kurulumu ve otomasyonu.",
      },
      {
        id: "web-dev",
        title: "Web Sitesi Geliştirme",
        description:
          "Modern, responsive kurumsal/kişisel web siteleri tasarımı ve geliştirmesi.",
      },
      {
        id: "pentest",
        title: "Sızma Testi (Pentesting)",
        description:
          "Sistem ve ağ güvenliği için zafiyet analizi ve sızma testi hizmetleri.",
      },
      {
        id: "game-dev",
        title: "Oyun Programlama",
        description: "Unity tabanlı oyun geliştirme ve oyun mekaniği tasarımı.",
      },
      {
        id: "mobile-design",
        title: "Mobil Uygulama Tasarımı",
        description:
          "iOS/Android için kullanıcı deneyimi odaklı mobil uygulama tasarımı ve geliştirmesi.",
      },
      {
        id: "cross-platform",
        title: "PC ve Mobil Uygulama Geliştirme",
        description:
          "Masaüstü ve mobil platformlar için uçtan uca yazılım geliştirme.",
      },
    ],
  },
  experience: {
    kicker: "Deneyim",
    title: "Saha tecrübesi",
    items: [
      {
        id: "cyber4",
        role: "Siber Güvenlik Stajyeri",
        period: "Temmuz 2025 – Ağustos 2025",
        description:
          "Yirmi günlük staj programı kapsamında, Kali Linux ortamında Nmap ve Metasploit gibi araçları kullanarak sistem zafiyet analizi ve penetrasyon testi süreçlerinde aktif rol aldım. Ayrıca Python tabanlı betikler geliştirerek güvenlik operasyonlarının otomasyonuna ve teknik staj raporlama süreçlerine doğrudan katkı sağladım.",
      },
      {
        id: "negzel",
        role: "SAP PI/PO Stajyeri",
        period: "Ağustos 2025 – Eylül 2025",
        description:
          "Kurumsal sistemler arasındaki veri akışını ve iletişimi optimize etmek amacıyla SAP PI/PO entegrasyon mimarisi üzerinde uygulamalı çalışmalar gerçekleştirdim. Ara katman yazılımları kullanılarak yürütülen iş süreçlerinin dijital dönüşüm ve entegrasyon aşamalarına teknik destek sundum.",
      },
      {
        id: "iskur",
        role: "BT Destek (IT Support)",
        period: "Ocak 2025 – Haziran 2025",
        description:
          "Kurum içi kullanıcılardan gelen talepler doğrultusunda donanım, yazılım ve temel ağ problemlerine yönelik birinci seviye teknik destek sağladım. Sistemlerin kesintisiz çalışması için gerekli rutin bakım ve sorun giderme operasyonlarını yürüttüm.",
      },
    ],
  },
  education: {
    kicker: "Eğitim",
    title: "Akademik altyapı",
    school: "Osmaniye Korkut Ata Üniversitesi",
    department: "Bilgisayar Mühendisliği (Computer Engineering)",
    graduationLabel: "Mezuniyet",
    graduation: "Ocak 2026",
    photos: [
      {
        id: "mother",
        alt: "Muhammed Maksut Çakmaktaş annesiyle mezuniyet töreninde",
        caption: "Annemle",
      },
      {
        id: "sibling",
        alt: "Muhammed Maksut Çakmaktaş kardeşiyle mezuniyet töreninde",
        caption: "Kardeşimle",
      },
    ],
  },
  projects: {
    kicker: "Projeler",
    title: "Üzerinde çalıştığım projeler",
    description:
      "Oyun geliştirmeden otomasyona, yapay zekadan sistem araçlarına kadar.",
    items: [
      {
        id: "daily-ai-researcher",
        title: "Daily AI Researcher",
        description:
          "Her sabah GitHub Trending ve 20'den fazla teknoloji haber kaynağını tarayıp Claude API ile iki dilli bir HTML sabah bülteni yazan bir Windows tray uygulaması — tekrarları önleyen hafıza sistemiyle token maliyetini sabit tutar.",
      },
      {
        id: "emotion-ai",
        title: "Emotion Detection Using AI",
        description:
          "CNN (Convolutional Neural Network) kullanılarak gerçek zamanlı yüz ifadesinden duygu tanıma sistemi.",
      },
      {
        id: "rpg",
        title: "2.5D RPG (Unity)",
        description: "C# ile geliştirilmiş Unity tabanlı 2.5D RPG oyun projesi.",
      },
      {
        id: "career-tracker",
        title: "Udemy Kariyer Takip",
        description:
          "Udemy kurs ilerlemesini okuyan bir Chrome uzantısı ve bu veriyi görsel, oyunlaştırılmış bir kariyer/beceri ağacına dönüştüren web paneli.",
      },
      {
        id: "gmail-agent",
        title: "Gmail Özet Ajanı",
        description:
          "Günlük Gmail trafiğini çeken, otomatik kategorize edip cevap taslağı hazırlayan ve masaüstü bildirimiyle günlük özet sunan kişisel ajan.",
      },
      {
        id: "image-cleaner",
        title: "Image Cleaner",
        description:
          "İzlenen klasördeki .jpg dosyalarını otomatik .png formatına dönüştüren ve istenmeyen dosyaları temizleyen Python aracı.",
      },
      {
        id: "file-namer",
        title: "Dosya İsim Kaydedici",
        description:
          "Klasördeki dosya adlarını/uzantılarını .txt formatında dışa aktaran Python aracı.",
      },
    ],
  },
  goals: {
    kicker: "Yol Haritası",
    title: "Devam eden hedefler",
    description: "Sertifikalardan çok, sürekli ilerleyen bir öğrenme yolculuğu.",
    items: [
      {
        id: "udemy",
        title: "Udemy Cybersecurity Kursu",
        description: "Temel bilgi edinimi",
      },
      {
        id: "tryhackme",
        title: "TryHackMe Jr Penetration Tester Path",
        description: "Uygulamalı sızma testi pratiği",
      },
      {
        id: "ejpt",
        title: "eJPT Sertifikasyonu",
        description: "eLearnSecurity Junior Penetration Tester",
      },
    ],
  },
  contact: {
    kicker: "İletişim",
    title: "Hadi konuşalım",
    description: "Bir fikri, bir fırsatı ya da sadece merhaba demeyi konuşmak için.",
    copyLabel: "Kopyala",
    copiedLabel: "Kopyalandı",
  },
  footer: {
    rights: "Tüm hakları saklıdır.",
  },
};
