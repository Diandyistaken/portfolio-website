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
        background: "#0a0a08",
        color: "#f2efe6",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#f2efe6",
          }}
        />
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#ff8a42" }}>
          BİLGİSAYAR MÜHENDİSİ
        </div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 700,
          marginTop: 28,
          lineHeight: 1.1,
        }}
      >
        Muhammed Maksut Çakmaktaş
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 32,
          marginTop: 26,
          color: "#a29c8b",
        }}
      >
        Siber Güvenlik Uzmanı · Penetrasyon Testi · DevSecOps
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          marginTop: 44,
          color: "#ff8a42",
        }}
      >
        maksutcakmaktas.com
      </div>
    </div>
  );
}
