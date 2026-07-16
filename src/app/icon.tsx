import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon version of the shield + M mark, fixed to the brand's
// "system secured" green on the site's dark base.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#11213f",
          borderRadius: 7,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 2L27.5 6.8V15.2C27.5 21.8 22.9 27.5 16 30C9.1 27.5 4.5 21.8 4.5 15.2V6.8L16 2Z"
            fill="rgba(79, 224, 141, 0.14)"
            stroke="#4fe08d"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M10.5 20.5V12L16 17L21.5 12V20.5"
            stroke="#e9eef6"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
