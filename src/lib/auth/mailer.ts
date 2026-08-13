import nodemailer from "nodemailer";

// Reset links only ever go to the site owner. The recipient list lives in the
// RESET_RECIPIENTS env var (comma-separated) rather than in source, because the
// source tree is published in a public repository.
function resetRecipients(): string[] {
  return (process.env.RESET_RECIPIENTS ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

export function isMailerConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS) && resetRecipients().length > 0;
}

export async function sendResetEmail(resetLink: string): Promise<void> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error("E-posta servisi yapılandırılmamış (SMTP_USER + SMTP_PASS gerekli).");
  }
  const recipients = resetRecipients();
  if (recipients.length === 0) {
    throw new Error("E-posta servisi yapılandırılmamış (RESET_RECIPIENTS gerekli).");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"maksutcakmaktas.com" <${user}>`,
    to: recipients.join(", "),
    subject: "Admin şifre yenileme bağlantısı",
    text: [
      "Merhaba Maksut,",
      "",
      "maksutcakmaktas.com admin şifreni yenilemek için bağlantı:",
      resetLink,
      "",
      "Bağlantı 30 dakika geçerlidir ve şifre değiştiğinde kullanılamaz hale gelir.",
      "Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin — şifren değişmedi.",
    ].join("\n"),
  });
}
