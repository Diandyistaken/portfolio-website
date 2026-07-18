import nodemailer from "nodemailer";

// Fixed recipients: password-reset links only ever go to the site owner.
export const RESET_RECIPIENTS = ["mo.maksut@gmail.com", "greengamegf@gmail.com"] as const;

export function isMailerConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendResetEmail(resetLink: string): Promise<void> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error("E-posta servisi yapılandırılmamış (SMTP_USER + SMTP_PASS gerekli).");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"maksutcakmaktas.com" <${user}>`,
    to: RESET_RECIPIENTS.join(", "),
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
