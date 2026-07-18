/* =========================================================================
 * UDEMY MÜFREDAT — Etik Hacker / Siber Güvenlik (229 ders, 32 bölüm)
 * Maksut'un gerçek ilerlemesi. Her ders [başlık, dakika]. bld = ilgili bina id.
 * watchedUpTo: kullanıcının o an izlediği son dersin GLOBAL sırası (dahil).
 * Sıra numarası dizideki konumdan hesaplanır (game.js).
 * ========================================================================= */
window.CURRICULUM = {
  source: "Udemy — Etik Hacker / Siber Güvenlik (229 ders)",
  watchedUpTo: 153, // 153. Shodan Giriş'e kadar izlendi (dahil)
  sections: [
    { t: "Giriş", bld: "setup", items: [
      ["Hoşgeldiniz!", 2], ["Başlamadan Önce Bilgilendirme", 7]] },
    { t: "Kurulumları Yapmak", bld: "setup", items: [
      ["Kurulumlar Giriş", 1], ["Sanal Makina Nedir?", 2], ["Virtualbox Yüklemek (Windows)", 15],
      ["Virtualbox Yüklemek (Mac)", 10], ["Kali Linux İndirmek", 15], ["Kali Linux Yükleme Linkleri", 1],
      ["Kali Linux Yüklemek", 19], ["Kali Linux Sorun Çözümleri (Windows)", 11], ["Kali .iso Yükleme (Sorun Yaşayanlar)", 13],
      ["Kali Linux Sorun Çözümleri (MAC)", 20], ["Kurulumla İlgili Sorun Yaşarsanız!", 1],
      ["Windows Sanal Makine ve Problem Çözümleri", 28], ["Snapshot Almak", 15]] },
    { t: "Linux Kullanım", bld: "linux", items: [
      ["Linux Giriş", 1], ["Kali Linux Genel Görünüm", 14], ["Navigasyon", 11], ["Taşıma İşlemleri", 9],
      ["Yetki Farklılıkları", 15], ["Linux Klasörleri", 8], ["Linux Paket Yöneticileri", 8], ["Nano", 5],
      ["Linux Son Komutlar", 7]] },
    { t: "Ağlara Giriş", bld: "networks", items: [
      ["Ağlar Giriş", 1], ["Internet Ağları Nasıl Çalışır?", 8], ["VPN ve DNS", 6], ["VPN Kullanımı", 21],
      ["DNS Değiştirme", 16], ["Sorun Çözümleri ve Pratik VPN Kullanımları", 6]] },
    { t: "Dark Web", bld: "darkweb", items: [
      ["Dark Web Giriş", 1], ["Dark Web Nedir?", 5], ["Tor Browser Yüklemek", 19], ["Dark Web'de Gezinmek", 13]] },
    { t: "Ağlara Saldırmak İçin Ayarlar", bld: "wifi", items: [
      ["Ağlara Saldırı Giriş", 1], ["Network Penetration Nedir?", 3], ["Wi-Fi Kart Sorunlar & Cevaplar", 2],
      ["Wi-fi Kart Seçimi", 12], ["Wi-Fi Kart Türkiye'den Alınabilecek Modeller", 1], ["Wi-fi Kartı Bağlamak", 11],
      ["MAC Adresi Nedir?", 9], ["Monitor ve Managed Modları", 10]] },
    { t: "Ağlarla İlgili Bilgi Toplamak", bld: "wifi", items: [
      ["Ağ Bilgileri Giriş", 1], ["Ağları İncelemek", 10], ["Belli Bir Ağa Özel Bilgi Edinmek", 15],
      ["Deauth Saldırısı", 9]] },
    { t: "Ağlara Saldırmak", bld: "wifi", items: [
      ["Ağlara Saldırmak Giriş", 1], ["WEP Ayarları", 8], ["WEP Çalışma Mantığı", 6], ["WEP Şifrelerini Kırmak", 9],
      ["Sahte Yetkilendirme", 15], ["WPA Nasıl Çalışır?", 7], ["Handshake Yakalamak", 5], ["WPA Kırmak", 9],
      ["Wordlist Alternatifleri", 16], ["Daha Güvenli Bir Ağ", 5]] },
    { t: "Bağlantı Sonrası Yapılacaklar", bld: "mitm", items: [
      ["Bağlantı Sonrası Giriş", 1], ["Netdiscover", 12], ["nmap Kullanmak", 4], ["ARP Nedir?", 12],
      ["ARP Poison", 11], ["Wireshark Nedir?", 13], ["Wireshark İnceleme", 7], ["Bettercap Giriş", 10],
      ["ARP Spoof", 10], ["Parolaları Ele Geçirmek", 7], ["HTTPS", 14], ["Caplet Değiştirmek", 7],
      ["Caplet GitHub Linki", 1], ["Ortadaki Adamdan Korunmak", 3]] },
    { t: "Sunucu & Bilgisayar Sızma Testlerine Giriş", bld: "exploitation", items: [
      ["Bilgisayara Saldırı Giriş", 1], ["Sızma Testlerine Giriş", 16], ["Metasploitable Yüklemesi", 9],
      ["nMap Nedir?", 11], ["Tarama Yapmak", 11], ["nMap Sonuçları", 11], ["İlk Hack'leme ile İlgili", 1],
      ["İlk Hack'leme", 20], ["Telnet ve SSH", 7], ["SAMBA", 10], ["Meterpreter", 16], ["Nmap Detayları", 16],
      ["Script Çalıştırmak", 12], ["Script Argümanları", 13], ["Session Açmak", 5], ["SMTP", 8], ["SSH", 9],
      ["VNC", 6], ["Manuel Hackleme", 21], ["Devam Etmeden Okumalısınız - CTF", 1]] },
    { t: "Yapay Zeka Destekli Sızma Testi Pratiği - CTF", bld: "ctf", items: [
      ["ChatGPT ve CTF'ler", 9], ["ChatGPT ile nmap Sonuçları", 18], ["Makineyi Hack'lemek", 13],
      ["Yetki Yükseltme", 15]] },
    { t: "Kullanıcılara Saldırmak", bld: "backdoor", items: [
      ["Kullanıcılara Saldırmak Giriş", 1], ["Backdoor Nedir?", 11], ["Msfvenom", 14], ["Backdoor Oluşturmak", 11],
      ["Web Sunucusu Çalıştırmak", 10], ["Ekran Görüntülerini Ele Geçirmek", 17], ["Antivirüse Yakalanmama Teknikleri", 17],
      ["FatRat Kullanımı", 19]] },
    { t: "Sosyal Mühendislik", bld: "socialeng", items: [
      ["Sosyal Mühendislik Giriş", 1], ["Sadece Link ile Cihazlara Ulaşmak", 18], ["Ngrok Ayarları", 9],
      ["Kamera Konum ve Mikrofon Ele Geçirmek", 10], ["Zararlı Yazılım Türleri", 7], ["Bilgi Toplama Araçları", 11],
      ["Saldırı Stratejisi Oluşturmak", 11], ["Görsel ve Backdoor Birleştirmek", 15], ["Trojan Denemesi", 10],
      ["Uzantıları Değiştirmiş Göstermek", 11], ["Emailleri Değiştirmek", 7]] },
    { t: "Beef", bld: "beef", items: [
      ["Beef Giriş", 1], ["Beef Nedir?", 6], ["Beef Kali Linux'te Hazır Yüklü Değilse", 13], ["Hedefi Oltaya Takmak", 6],
      ["JS Enjeksiyonu", 11], ["Ekran Görüntülerini Almak", 4], ["Hacker'lar Facebook Şifrelerini Nasıl Çalar?", 4],
      ["Backdoor İletme Yöntemi", 9], ["Kendimizi Nasıl Koruruz?", 2]] },
    { t: "Sosyal Medya Güvenliği", bld: "socialeng", items: [
      ["Sosyal Medya Giriş", 1], ["Instagram Oltalama Saldırıları Nasıl Çalışır", 8], ["Discord Webhook Bağlantıları", 11],
      ["Canlıya Almak ve Kendimizi Koruma", 14]] },
    { t: "Dış Ağda Backdoor ve Tünel Servisleri", bld: "persistence", items: [
      ["Dış Ağ Giriş", 1], ["Dış Ağda Çalışma Opsiyonları", 5], ["Tunneling Service Nedir?", 11], ["Msfvenom", 7],
      ["Dinleyiciyi Çalıştırmak", 6]] },
    { t: "Sahte Oyun İle Dış Ağ Saldırıları", bld: "socialeng", items: [
      ["Sahte Oyun Giriş", 1], ["Dış Ağda Beef Saldırısı", 8], ["Gerekli Linkler", 1], ["Ubuntu Sunucu Oluşturma", 7],
      ["Oyun Websitesi Yapmak", 16], ["Beef Kurmak", 15], ["Beef'i Dışarıda Çalıştırmak", 11], ["Oyuna Javascript Eklemek", 6],
      ["No IP Nedir?", 7], ["Telefonu Hack'lemek", 3], ["Kendimizi Korumak", 3]] },
    { t: "Setoolkit", bld: "socialeng", items: [
      ["Setoolkit Nedir", 11], ["Setoolkit Modülleri", 8], ["Hacker'lar Gmail Hesaplarını Nasıl Ele Geçiriyor", 12],
      ["Fake Email Nasıl Yolluyorlar?", 14]] },
    { t: "Hackledikten Sonrası", bld: "persistence", items: [
      ["Hackledikten Sonra Giriş", 1], ["Meterpreter Kullanımı", 7], ["İşlem Göçü", 5], ["Önemli Dosyaları Çalmak", 5],
      ["Ekran Görüntüsünü Almak", 2], ["Bağlantıyı Sürdürülebilir Hale Getirmek", 9]] },
    { t: "Shodan: Webcam, IOT, Servis Arama Motoru", bld: "shodan", items: [
      ["Shodan Giriş", 1], ["Shodan Nedir?", 5], ["Webcam Görüntüleme", 5], ["Filtreleme", 6],
      ["Zafiyet Olan Servisleri Bulmak", 4], ["Terminalden Çalıştırmak", 7]] },
    { t: "Websitesi Bilgi Toplamak", bld: "osint", items: [
      ["Websitesi Hacklemek Giriş", 1], ["Websitesi Hacklemek Ayarlar", 5], ["Yeniden Maltego", 9], ["Netcraft", 6],
      ["Ters IP Araması", 5], ["Whois Sorgusu", 4], ["Robots", 6], ["Alt Adresler", 6]] },
    { t: "Websitesi Pentesting", bld: "webpentest", items: [
      ["Websitesi Pentesting Giriş", 1], ["Kod Uygulama Açığı", 6], ["Ters TCP Komutları", 9], ["Dosya Yükleme Açıkları", 8],
      ["Dosya Barındırma Açıkları", 7]] },
    { t: "XSS", bld: "webpentest", items: [
      ["XSS Giriş", 1], ["XSS Nedir?", 4], ["URL ile XSS", 4], ["Kayıtlı XSS", 3], ["XSS İle Gerçek Hacking Deneyimi", 6],
      ["XSS'den Nasıl Korunurum", 3]] },
    { t: "SQL Kodları", bld: "sql", items: [
      ["Veritabanı ve SQL", 1], ["Veritabanı Yapısı", 5], ["Veritabanına Yeni Değer Eklemek", 6],
      ["Değerleri Silmek ve Güncellemek", 5], ["Filtreleme", 5], ["SQL Kullanılan Kodlar", 1]] },
    { t: "SQL Enjeksiyon", bld: "sql", items: [
      ["SQL Enjeksiyon Giriş", 1], ["Metasploitable İçindeki Veritabanları", 5], ["Mutillidae Veritabanı", 8],
      ["Açıkları Aramak", 5], ["SQL Enjeksiyon Post Metodu", 4], ["SQL Enjeksiyon Get Metodu", 4],
      ["Veritabanındaki Tüm Verileri Çalmak", 4], ["Veritabanı İsmini Öğrenmek", 6], ["Daha Derinlere İnmek", 5],
      ["Herşeyi Ele Geçirmek", 4]] },
    { t: "Websitesi Pentesting Araçlar", bld: "tools", items: [
      ["Pentesting Araçlar Giriş", 1], ["Sqlmap", 10], ["Zap", 5], ["Zap Analizi", 5]] },
    { t: "Web Pentest CTF", bld: "ctf", items: [
      ["Tryhackme CTF'leri", 8], ["nMap", 7], ["Gobuster", 12], ["Komut Enjeksiyonu", 10], ["Yetki Yükseltme", 15],
      ["CTF Ödevi Açıklaması", 4]] },
    { t: "Parola / Hash Kırma", bld: "crypto", items: [
      ["Parola & Hash Kırma Giriş", 1], ["Parola / Hash Kırma Nedir?", 12], ["Linux ve Windows Hash'leri", 7],
      ["Hash'leri Toparlama", 13], ["Hashcat Yükleme ve Kurulum", 14], ["Linux Parolasını Kırmak", 8],
      ["Windows Parolasını Kırmak", 8], ["Zip Şifrelerini Kırmak", 11]] },
    { t: "Network Teorisi", bld: "theory", items: [
      ["Network Teorisi Giriş", 1], ["OSI Modeli Nedir?", 7], ["Binary Nedir?", 11], ["IP İleri Seviye", 8],
      ["Host Hesaplama", 8], ["TCP vs UDP", 7]] },
    { t: "OSINT", bld: "osint", items: [
      ["OSINT Nedir?", 8], ["Kanıt Toplamak", 15], ["Konum Tespiti", 19], ["Diğer Tespitler", 15]] },
    { t: "AI Hackleme: Prompt Enjeksiyonu", bld: "aisec", items: [
      ["ChatGPT Güvenlik Önlemleri", 6], ["Prompt Enjeksiyon Denemeleri", 17], ["Prompt Mühendisliği Bağlantısı", 15]] },
    { t: "Kapanış", bld: "setup", items: [
      ["Kapanış", 1], ["Etik Hacker'ın El Kitabı", 1], ["CTF Çözümleri", 1], ["Faydalı Linkler", 1], ["Bonus", 3]] },
  ],
};
