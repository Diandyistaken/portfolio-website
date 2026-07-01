export const ogImageSize = { width: 1200, height: 630 };

export function OgImageContent() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "90px",
        background: "linear-gradient(135deg, #05070c 0%, #1a1530 55%, #05070c 100%)",
        color: "#eef1f8",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          letterSpacing: 6,
          color: "#8b7bff",
        }}
      >
        BİLGİSAYAR MÜHENDİSİ
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 78,
          fontWeight: 700,
          marginTop: 24,
          lineHeight: 1.1,
        }}
      >
        Muhammed Maksut Çakmaktaş
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 34,
          marginTop: 28,
          color: "#9aa2b8",
        }}
      >
        Siber Güvenlik Uzmanı · Penetrasyon Testi · DevSecOps
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 26,
          marginTop: 48,
          color: "#2fe3ff",
        }}
      >
        maksutcakmaktas.com
      </div>
    </div>
  );
}
