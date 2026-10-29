import { createTransport } from "nodemailer10";
import type { EmailConfig } from "next-auth/providers";

export default function Nodemailer(
  config: Partial<EmailConfig>
): EmailConfig {
  return {
    id: "nodemailer",
    type: "email",
    name: "Nodemailer",
    server: config.server ?? "",
    from: config.from ?? "",
    maxAge: 24 * 60 * 60,
    async sendVerificationRequest({ identifier, url, provider }) {
      const { host } = new URL(url);
      const transport = createTransport(provider.server);
      const result = await transport.sendMail({
        to: identifier,
        from: provider.from,
        subject: `Accede a ${host}`,
        // Evita que Brevo reescriba enlaces de autenticación de un solo uso.
        headers: { "X-Mailin-track-clicks": "0" },
        text: `Accede a tu cuenta utilizando este enlace:\n${url}\n\nSi no lo has solicitado, ignora este mensaje.`,
        html: `<p>Accede a tu cuenta:</p><p><a href="${url}">Iniciar sesión</a></p><p>Si no lo has solicitado, ignora este mensaje.</p>`,
      });

      const failed = [
        ...(result.rejected ?? []),
        ...(result.pending ?? []),
      ];

      if (failed.length) {
        throw new Error(`No se pudo enviar el correo a: ${failed.join(", ")}`);
      }
    },
    options: config,
  };
}
