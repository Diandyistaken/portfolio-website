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
        background: "#05070c",
        color: "#e9eef6",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 2L27.5 6.8V15.2C27.5 21.8 22.9 27.5 16 30C9.1 27.5 4.5 21.8 4.5 15.2V6.8L16 2Z"
            fill="rgba(79, 224, 141, 0.14)"
            stroke="#4fe08d"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M10.5 20.5V12L16 17L21.5 12V20.5"
            stroke="#e9eef6"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#4fe08d" }}>
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
          color: "#94a0b3",
        }}
      >
        Siber Güvenlik Meraklısı · Penetrasyon Testi · DevSecOps
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          marginTop: 44,
          color: "#4fe08d",
        }}
      >
        maksutcakmaktas.com
      </div>
    </div>
  );
}
