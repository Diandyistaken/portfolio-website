import { ImageResponse } from "next/og";
import { OgImageContent, ogImageSize } from "@/lib/og-image";

export const alt = "Muhammed Maksut Çakmaktaş — Bilgisayar Mühendisi & Siber Güvenlik Meraklısı";
export const size = ogImageSize;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<OgImageContent />, { ...size });
}
