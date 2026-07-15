import type { Content } from "./types";

export const tr: Content = {
  htmlLang: "tr",
  meta: {
    title: "Muhammed Maksut Çakmaktaş | Bilgisayar Mühendisi & Siber Güvenlik Meraklısı",
    description:
      "Muhammed Maksut Çakmaktaş — İstanbul merkezli Bilgisayar Mühendisi. Siber güvenlik, penetrasyon testi ve DevSecOps üzerine projeler; portfolyo ve iletişim.",
  },
  nav: {
    about: "Hakkımda",
    skills: "Yetenekler",
    services: "Hizmetler",
    experience: "Deneyim",
    education: "Eğitim",
    projects: "Projeler",
    showcase: "Vitrin",
    freelance: "Freelance",
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
    title: "Bilgisayar Mühendisi | Siber Güvenlik Meraklısı",
    bio: "Bilgisayar mühendisiyim; siber güvenlik, yazılım geliştirme ve sistem otomasyonu üzerine çalışıyorum. Nmap, Metasploit, Python, SAP PI/PO ve yapay zekâ projelerinde uygulamalı deneyim kazandım. Şimdi güvenli ve kullanışlı ürünler geliştiren bir ekipte çalışmak istiyorum.",
    location: "İstanbul, Türkiye",
    email: "mo.maksut@gmail.com",
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
    ticker: [
      "> ağ taraması … TEMİZ",
      "> dışa açık port: 0",
      "> çalışma süresi: %99,98",
      "> tehdit: DÜŞÜK — kahve: KRİTİK",
    ],
    scanLabel: "Kimlik taramasını başlat",
    verifiedLabel: "KİMLİK DOĞRULANDI",
    onlineLabel: "İST // ÇEVRİMİÇİ",
    scrollLabel: "KAYDIR",
  },
  about: {
    kicker: "Hakkımda",
    title: "Kim bu Muhammed Maksut?",
    reelLead: "Renklerin sırrı: bu video, sitenin tamamını boyuyor.",
    stats: [
      { value: 2026, suffix: "", label: "Mezuniyet yılı" },
      { value: 9, suffix: "", label: "Üretilen proje" },
      { value: 20, suffix: "+", label: "Kullanılan teknoloji" },
    ],
  },
  reel: {
    description: "Sitedeki bütün vurgu renkleri bu videodan örnekleniyor — hangi karedeysen arayüz o karenin rengine bürünür. Kaydırarak dene.",
    captions: [
      "sistem güvende",
      "saldırı simülasyonu",
      "savunma devrede",
      "gün batımı — mesai bitti",
    ],
  },
  skills: {
    kicker: "Yetenekler",
    title: "Neler yapabiliyorum",
    description:
      "Siber güvenlik, Unity, SAP PI/PO ve otomasyon: kullandığım araçlar ve yaptığım işler.",
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
            label: "Oyun Performansı ve UX",
            description:
              "Oyun performansını iyileştirme ve kullanımı kolay arayüzler hazırlama",
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
      "Web sitesi, mobil uygulama, otomasyon, pentest ve Unity projelerinde destek veriyorum.",
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
    intro:
      "Üç kısa stajda farklı katmanları gördüm: saldırı/savunma güvenliği, kurumsal entegrasyon, birinci seviye destek. Şimdi bunları üretim ortamında bir araya getireceğim tam zamanlı bir ekip rolü arıyorum.",
    items: [
      {
        id: "cyber4",
        role: "Siber Güvenlik Stajyeri",
        period: "Temmuz 2025 (20 gün)",
        description:
          "Yirmi günlük stajda Kali Linux, Nmap ve Metasploit ile zafiyet analizi ve pentest yaptım. Güvenlik görevlerini ve raporlamayı hızlandıran Python betikleri yazdım.",
      },
      {
        id: "negzel",
        role: "SAP PI/PO Stajyeri",
        period: "Ağustos 2025 – Eylül 2025",
        description:
          "SAP PI/PO üzerinde kurumsal sistemler arasındaki veri akışlarını inceledim ve entegrasyon görevlerine teknik destek verdim.",
      },
      {
        id: "iskur",
        role: "BT Destek (IT Support)",
        period: "Ocak 2025 – Haziran 2025",
        description:
          "Kurum içindeki donanım, yazılım ve temel ağ sorunlarına birinci seviye destek verdim. Rutin bakım ve arıza giderme işlerini yürüttüm.",
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
    photosIntro: "Mezuniyet günümden iki kare — kısa bir kişisel ara.",
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
    botShowcase: {
      label: "Canlı Telegram bot önizlemesi",
      typing: "yazıyor...",
      time: "07:00",
      messages: [
        "📮 Daily AI Researcher — 12 Temmuz 2026, Pazar / Günaydın Maksut! ☕",
        "🔥 GitHub'da bugün: malisper/pgrust ↗ +774 yıldız — Postgres'in Rust ile yeniden yazımı, 2.196 yıldıza ulaştı.",
        "vercel/next.js ↗ +334 yıldız — 140.998 yıldızla ekosistem lideri.",
        "Bülten her sabah 07:00'de hazır.",
      ],
    },
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
  commandPalette: {
    openLabel: "Komut paletini aç",
    closeLabel: "Komut paletini kapat",
    placeholder: "Bir bölüm veya komut ara...",
    navigationLabel: "Bölümlere git",
    actionsLabel: "Hızlı işlemler",
    downloadCv: "CV indir",
    copyEmail: "E-postayı kopyala",
    emailCopied: "E-posta kopyalandı",
    emptyLabel: "Sonuç bulunamadı",
  },
  showcase: {
    kicker: "Vitrin / Lab",
    title: "Çalışan sistemlerden iki örnek",
    description: "NDA kapsamındaki iki projeyi, paylaşabildiğim özellikleriyle burada gösteriyorum.",
    items: [
      { id: "platform", title: "Kurumsal dijital platform tasarımı", badge: "Görüşme aşamasında · NDA", description: "Bir meslek kurumu için yönetim paneli, interaktif haritalar, Ctrl+K komut paleti, tema seçimi, mobil uygulama prototipi ve AI içerik analizi içeren web platformu tasarımı.", alt: "İsimsiz kurumsal dijital platform arayüzü konsepti" },
      { id: "automation", title: "Uçtan uca otomasyon sistemleri", badge: "Gizli proje · özet", description: "Sinyal toplama, filtreleme, analiz, demo üretimi ve bildirimi otomatikleştiren sistem; Telegram botu, zamanlanmış görevler ve birden fazla bildirim kanalı kullanıyor.", alt: "İsimsiz uçtan uca otomasyon akışı" },
    ],
    note: "Bu çalışmaların canlı demoları görüşme sırasında gösterilebilir.",
    pipeline: ["Sinyal", "Filtre", "Analiz", "Demo", "Teslim"],
    lightboxLabel: "Vitrin ekran görüntüsü galerisi",
    lightboxClose: "Galeriyi kapat",
    lightboxPrevious: "Önceki ekran görüntüsü",
    lightboxNext: "Sonraki ekran görüntüsü",
  },
  freelance: {
    kicker: "Birlikte Çalışalım",
    title: "Dört platformdan ulaşabilirsin",
    description: "Web, otomasyon veya güvenlik projen için sana uygun platformdan yaz. Önce ihtiyacı netleştirir, sonra işe koyuluruz.",
    disclaimer: "Not: Asıl aradığım tam zamanlı bir ekip rolü — burası kısa/bağımsız proje talepleri için.",
    platforms: {
      freelancer: { pitch: "Web, otomasyon ve güvenlik odaklı projeler için esnek iş birliği." },
      upwork: { pitch: "Uzun süreli projeler ve baştan sona ürün geliştirme." },
      fiverr: { pitch: "Modern ve animasyonlu web siteleri." },
      bionluk: { pitch: "Türkiye’den hızlı iletişimle web ve otomasyon desteği." },
    },
    featuredGig: "Öne çıkan ilan: 3D animasyonlu modern web sitesi",
    visit: "Profili ziyaret et",
  },
  dividers: {
    day: "Kod arası nefes molası: İstanbul.",
    sunset: "Günün sonu: sistemler güvende, gün batıyor.",
  },
  goals: {
    kicker: "Sırada Ne Var?",
    title: "Devam eden hedefler",
    description: "Şu anda pentest temelleri, TryHackMe laboratuvarları ve eJPT için çalışıyorum.",
    items: [
      {
        id: "udemy",
        title: "Udemy Cybersecurity Kursu",
        description: "Siber güvenlik temellerini tamamlamak",
      },
      {
        id: "tryhackme",
        title: "TryHackMe Jr Penetration Tester Path",
        description: "Uygulamalı sızma testi pratiği",
      },
      {
        id: "ejpt",
        title: "eJPT Sertifikasyonu",
        description: "Sınava hazırlanmak ve sertifikayı almak",
      },
    ],
  },
  contact: {
    kicker: "İletişim",
    title: "Hadi konuşalım",
    description: "Projen, iş fırsatın veya bir sorun varsa yaz. Merhaba da kabul.",
    mailLabel: "Mail gönder",
    copyLabel: "Kopyala",
    copiedLabel: "Kopyalandı",
    copyFailedLabel: "Kopyalanamadı — e-postayı seçip elle kopyala",
  },
  footer: {
    rights: "Tüm hakları saklıdır.",
  },
};
