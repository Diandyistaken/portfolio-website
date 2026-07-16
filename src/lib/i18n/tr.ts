import type { Content } from "./types";

export const tr: Content = {
  htmlLang: "tr",
  meta: {
    title: "Muhammed Maksut Çakmaktaş | Bilgisayar Mühendisi & Siber Güvenlik",
    description:
      "Muhammed Maksut Çakmaktaş — İstanbul merkezli Bilgisayar Mühendisi. Siber güvenlik, penetrasyon testi ve DevSecOps üzerine projeler; portfolyo ve iletişim.",
    knowsAbout: [
      "Siber Güvenlik",
      "Penetrasyon Testi",
      "DevSecOps",
      "Kali Linux",
      "Metasploit",
      "Nmap",
      "Wireshark",
      "Python",
      "Unity",
      "Next.js",
    ],
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
    badge: "Yeni fırsatlara açık",
    ctaPrimary: "İletişime Geç",
    ctaSecondary: "Projeleri Gör",
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
    statusCycle: [
      "Yeni fırsatlara açık",
      "durum: kahve %87",
      "uptime: %99,98",
      "mod: derin odak",
      "vpn: aktif · iz yok",
    ],
    scanLabel: "Kimlik taramasını başlat",
    verifiedLabel: "KİMLİK DOĞRULANDI",
    onlineLabel: "İST // ÇEVRİMİÇİ",
    scrollLabel: "KAYDIR",
  },
  robot: {
    label: "Robot asistan — tıkla, konuşsun",
    dismissLabel: "Robotu gizle",
    introMessage: "bip bop! ben nöbetçi robot — gözlerim seni izliyor 👀",
    messages: [
      "bip bop! hoş geldin ziyaretçi_",
      "sistem taraması: her şey temiz ✓",
      "maksut şu an kod yazıyor, ben nöbetteyim",
      "beni tıkladın! +10 sevimlilik puanı",
      "güvenlik duvarı: ben. şaka şaka… ya da değil",
      "kahve seviyesi kritik, tekrar dolduruluyor…",
      "bugün 0 saldırı engelledim. sakin gün.",
      "psst… ⌘K ile komut paletini dene",
    ],
    sleepingMessage: "zzz… (fareyi oynat, uyanayım)",
    hackMessage: "!! saldırı tespit edildi… şaka. sistem güvende ✓",
    honeypotMessage: "o butona basmamalıydın... neyse ki ben tatlıyım 👀",
  },
  about: {
    kicker: "Hakkımda",
    title: "Kim bu Muhammed Maksut?",
    terminalLead: "Kısa bir tanışma — komut satırından.",
    terminal: {
      title: "maksut@istanbul: ~",
      commands: [
        { cmd: "whoami", out: "Muhammed Maksut Çakmaktaş — Bilgisayar Mühendisi" },
        { cmd: "cat odak.txt", out: "güvenlik · yazılım geliştirme · sistem otomasyonu" },
        { cmd: "ls yetenekler/", out: "nmap  metasploit  python  next.js  unity  sap-pi/po" },
        { cmd: "durum --now", out: "● çalışmaya hazır · İstanbul · Ocak 2026 mezunu" },
      ],
      extras: [
        { cmd: "sudo make coffee", out: "izin reddedildi: önce fincanını getir ☕" },
        { cmd: "ping motivasyon", out: "64 bayt yanıt: süre=0.1ms — hep burada" },
        { cmd: "rm -rf uyku/", out: "silindi. sınav haftası modu aktif." },
        { cmd: "git push --force cesaret", out: "everything up-to-date ✓" },
      ],
      extraHint: "// tıkla — bir komut daha çalışsın",
      sentryDetected: "> yakınlık uyarısı: ziyaretçi tespit edildi [mesafe: {px}px]",
      sentryLost: "> hedef kayboldu_",
    },
    stats: [
      { value: 2026, suffix: "", label: "Mezuniyet yılı" },
      { value: 9, suffix: "", label: "Üretilen proje" },
      { value: 20, suffix: "+", label: "Kullanılan teknoloji" },
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
  achievements: {
    unlocked: "BAŞARIM AÇILDI",
    items: [
      { id: "robot-friend", title: "Yeni Arkadaş — robota merhaba dedin" },
      { id: "white-hat", title: "Beyaz Şapka — gizli komutu buldun" },
      { id: "shell-runner", title: "Komut Zinciri — terminalde 3 komut çalıştırdın" },
      { id: "explorer", title: "Kâşif — tüm bölümleri gezdin" },
      { id: "first-contact", title: "İlk Temas — e-postayı kopyaladın" },
      { id: "status-dj", title: "Durum DJ'i — rozeti 5 kez çevirdin" },
      { id: "honeypot", title: "Bal Küpü — tıklamaman gerekeni tıkladın" },
    ],
  },
  honeypot: {
    button: "[ SAKIN TIKLAMA — YÖNETİCİ ]",
    intro: "> İZİNSİZ ERİŞİM GİRİŞİMİ TESPİT EDİLDİ",
    profile: "> profil çıkarılıyor: {browser} · {viewport} · tık sayısı: {clicks}",
    verdict: "> tehdit analizi: zararsız (muhtemelen işe alımcı) ✓",
    closed: "> kayıt kapatıldı_",
    again: "> yine mi sen? dosyana not düşüldü.",
  },
  syslog: {
    label: "canlı sistem kaydı",
  },
  classified: {
    kicker: "Saha Kayıtları",
    title: "Kayıt altında: teslim edilen işler",
    description:
      "Müşteri işleri ve kişisel ürünler — isimler, markalar ve içerikler gizlilik gereği kapalı. Künye yok, sonuç var.",
    fileLabel: "DOSYA",
    redactedLabel: "Proje adı gizlilik nedeniyle kapatıldı",
    note: "> not: bu kayıtlardaki isim ve içerikler NDA/gizlilik kapsamında maskelendi. Detay yalnızca görüşmede.",
    statuses: {
      delivered: "Teslim edildi",
      active: "Aktif kullanımda",
      building: "Geliştiriliyor",
    },
    items: [
      {
        code: "KAYIT-01",
        tag: "NDA",
        type: "Kurumsal Tanıtım Sitesi",
        blurb:
          "Yaratıcı bir stüdyo için 3D sahneli, scroll-hikâyeli tanıtım sitesi. Marka ve içerik müşteriye ait — kapalı.",
        year: "2026",
        stack: ["Next.js", "TypeScript", "WebGL / R3F", "Tailwind", "Framer Motion"],
        status: "delivered",
      },
      {
        code: "KAYIT-02",
        tag: "ÖZEL",
        type: "İş Fırsatı Radarı",
        blurb:
          "Resmî API'ler üzerinden 7/24 ilan tarayan, puanlayan ve bildirim geçen kişisel otomasyon sistemi.",
        year: "2026",
        stack: ["Python", "REST API", "Bot", "Dashboard"],
        status: "active",
      },
      {
        code: "KAYIT-03",
        tag: "ÖZEL",
        type: "Yerel AI Atölye Uygulaması",
        blurb:
          "Yerel AI oturumlarıyla çalışan, API anahtarı gerektirmeyen içerik üretim atölyesi (web uygulaması).",
        year: "2026",
        stack: ["Node.js", "Express", "React"],
        status: "building",
      },
      {
        code: "KAYIT-04",
        tag: "ÖZEL",
        type: "Geliştirme Ortamı Optimizasyonu",
        blurb:
          "Ajan tabanlı geliştirme ortamında bağlam/maliyet analizi ve otomatik bakım düzeni kuran araç seti.",
        year: "2026",
        stack: ["CLI", "Otomasyon", "Veri Analizi"],
        status: "active",
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
    day: "> kahve.doldur() — devam",
    sunset: "> console.log(\"gün teslim edildi\")",
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
    tagline: "İstanbul'dan, kahve ve terminal eşliğinde.",
    backToTop: "Başa dön",
  },
};
