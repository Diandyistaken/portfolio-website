import { personalInfo } from "@/lib/data";

export function Footer() {
  return (
    <footer className="px-6 pb-10 pt-6 text-center text-xs text-muted">
      <p>
        © {new Date().getFullYear()} {personalInfo.name}. Tüm hakları saklıdır.
      </p>
    </footer>
  );
}
