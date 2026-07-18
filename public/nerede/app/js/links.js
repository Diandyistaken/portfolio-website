/* =========================================================================
 * ÖĞRENME BAĞLANTILARI — gerçek, güvenilir siber güvenlik kaynakları.
 * 1) RESOURCE_URLS: data.js'teki kaynak adlarını gerçek URL'lere eşler.
 * 2) LEARN_HUB: "Öğrenme Merkezi" modalı için kategorize edilmiş bağlantılar.
 * Eğitim/savunma odaklı; yasal pratik platformları önceliklidir.
 * ========================================================================= */

/* Ada kaynak adı (veya alt-dize) -> gerçek URL. resolveResourceURL() eşler. */
const RESOURCE_URLS = {
  "kali.org": "https://www.kali.org/docs/",
  "virtualbox": "https://www.virtualbox.org/manual/",
  "linuxjourney": "https://linuxjourney.com/",
  "gtfobins": "https://gtfobins.github.io/",
  "howdns": "https://howdns.works/",
  "cloudflare": "https://www.cloudflare.com/learning/",
  "practical networking": "https://www.practicalnetworking.net/",
  "subnetting": "https://www.subnettingpractice.com/",
  "torproject": "https://www.torproject.org/",
  "osint framework": "https://osintframework.com/",
  "bellingcat": "https://www.bellingcat.com/category/resources/how-tos/",
  "aircrack": "https://www.aircrack-ng.org/documentation.html",
  "hak5": "https://hak5.org/",
  "hackersploit": "https://hackersploit.org/",
  "bettercap": "https://www.bettercap.org/",
  "wireshark": "https://www.wireshark.org/docs/",
  "hashcat": "https://hashcat.net/wiki/",
  "crackstation": "https://crackstation.net/",
  "hacktricks": "https://book.hacktricks.wiki/",
  "tryhackme": "https://tryhackme.com/",
  "htb": "https://www.hackthebox.com/",
  "hackthebox": "https://www.hackthebox.com/",
  "mitre att&ck": "https://attack.mitre.org/",
  "mitre": "https://attack.mitre.org/",
  "blue team labs": "https://blueteamlabs.online/",
  "sans": "https://www.sans.org/blog/",
  "owasp": "https://owasp.org/www-project-top-ten/",
  "portswigger": "https://portswigger.net/web-security",
  "shodan": "https://help.shodan.io/",
  "sqlmap": "https://github.com/sqlmapproject/sqlmap/wiki",
  "gobuster": "https://github.com/OJ/gobuster",
  "zap": "https://www.zaproxy.org/docs/",
  "beef": "https://beefproject.com/",
  "picoctf": "https://picoctf.org/",
  "ctftime": "https://ctftime.org/",
  "overthewire": "https://overthewire.org/wargames/",
  "gandalf": "https://gandalf.lakera.ai/",
  "exif": "https://exiftool.org/",
};

/* Bir kaynak adına en iyi eşleşen URL'yi bul; yoksa güvenli arama bağlantısı. */
function resolveResourceURL(name) {
  const key = String(name || "").toLowerCase();
  for (const k in RESOURCE_URLS) if (key.includes(k)) return RESOURCE_URLS[k];
  return "https://duckduckgo.com/?q=" + encodeURIComponent(name + " siber güvenlik");
}

/* "Öğrenme Merkezi" — kategorize edilmiş gerçek platformlar. */
const LEARN_HUB = [
  {
    cat: "🎯 Yasal Pratik Platformları", color: "#ef4444",
    links: [
      { t: "TryHackMe", u: "https://tryhackme.com/", d: "Rehberli odalar, sıfırdan ileri seviye yol haritaları" },
      { t: "Hack The Box", u: "https://www.hackthebox.com/", d: "Gerçekçi zafiyetli makineler + Academy" },
      { t: "PortSwigger Web Security Academy", u: "https://portswigger.net/web-security", d: "Web zafiyetleri — ücretsiz, laboratuvarlı" },
      { t: "OverTheWire", u: "https://overthewire.org/wargames/", d: "Terminal/Linux savaş oyunları (Bandit ile başla)" },
      { t: "picoCTF", u: "https://picoctf.org/", d: "Başlangıç dostu CTF alıştırmaları" },
      { t: "Root-Me", u: "https://www.root-me.org/", d: "300+ kategorili hacking mücadelesi" },
    ],
  },
  {
    cat: "📚 Referans & Metodoloji", color: "#a78bfa",
    links: [
      { t: "HackTricks", u: "https://book.hacktricks.wiki/", d: "Enumeration & privesc başvuru kitabı" },
      { t: "MITRE ATT&CK", u: "https://attack.mitre.org/", d: "Saldırgan taktik/teknik matrisi (Red+Blue)" },
      { t: "OWASP Top 10", u: "https://owasp.org/www-project-top-ten/", d: "En kritik web uygulama riskleri" },
      { t: "PayloadsAllTheThings", u: "https://github.com/swisskyrepo/PayloadsAllTheThings", d: "Saldırı payload/teknik derlemesi" },
      { t: "GTFOBins", u: "https://gtfobins.github.io/", d: "Unix ikili dosyalarıyla privesc referansı" },
      { t: "LOLBAS", u: "https://lolbas-project.github.io/", d: "Windows 'living off the land' ikilileri" },
    ],
  },
  {
    cat: "🛡️ Blue Team & Savunma", color: "#38bdf8",
    links: [
      { t: "Blue Team Labs Online", u: "https://blueteamlabs.online/", d: "Savunma/olay müdahale senaryoları" },
      { t: "LetsDefend", u: "https://letsdefend.io/", d: "SOC analisti simülasyonu" },
      { t: "CyberDefenders", u: "https://cyberdefenders.org/", d: "Blue team CTF & adli analiz" },
      { t: "Malware Traffic Analysis", u: "https://www.malware-traffic-analysis.net/", d: "Gerçek PCAP analiz alıştırmaları" },
      { t: "SANS Internet Storm Center", u: "https://isc.sans.edu/", d: "Güncel tehdit istihbaratı günlüğü" },
    ],
  },
  {
    cat: "🎓 Sertifika & Kariyer", color: "#fbbf24",
    links: [
      { t: "TryHackMe — Jr Penetration Tester", u: "https://tryhackme.com/path/outline/pentesting", d: "eJPT/PNPT'ye hazırlık yolu" },
      { t: "INE / eLearnSecurity (eJPT)", u: "https://ine.com/", d: "Giriş seviyesi sızma testi sertifikası" },
      { t: "OffSec (OSCP)", u: "https://www.offsec.com/courses/pen-200/", d: "Sektör standardı pratik sızma sertifikası" },
      { t: "CompTIA Security+", u: "https://www.comptia.org/certifications/security", d: "Blue team giriş sertifikası" },
      { t: "TCM Security (PNPT)", u: "https://certifications.tcm-sec.com/pnpt/", d: "Uygun fiyatlı, rapor odaklı sızma sertifikası" },
    ],
  },
  {
    cat: "📰 Güncel Kal & Topluluk", color: "#34d399",
    links: [
      { t: "The Hacker News", u: "https://thehackernews.com/", d: "Günlük güvenlik haberleri" },
      { t: "r/netsec", u: "https://www.reddit.com/r/netsec/", d: "Teknik güvenlik topluluğu" },
      { t: "CVE / NVD", u: "https://nvd.nist.gov/", d: "Bilinen zafiyet veritabanı" },
      { t: "Exploit-DB", u: "https://www.exploit-db.com/", d: "Herkese açık exploit arşivi (searchsploit)" },
      { t: "HackerOne Hacktivity", u: "https://hackerone.com/hacktivity", d: "Gerçek bug bounty raporları" },
    ],
  },
];

window.GAME_LINKS = { RESOURCE_URLS, resolveResourceURL, LEARN_HUB };
