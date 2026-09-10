import nodemailer from "nodemailer";
import { TtlCache } from "../utils/cache";

const LOGIN_MAIL_COOLDOWN_MS = 30 * 60 * 1000;
const loginNotificationCache = new TtlCache<string, number>({
  defaultTtlMs: LOGIN_MAIL_COOLDOWN_MS,
  maxSize: 500,
});

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const notifyFrom =
  process.env.NOTIFY_FROM || smtpUser || "noreply@dsa-tracker.local";
const notifyTo =
  process.env.LOGIN_NOTIFY_EMAIL ||
  process.env.ADMIN_EMAIL ||
  "rajat.sharma.myid1@gmail.com";

const mailTransporter =
  smtpHost && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    : null;

export const notifyLogin = async (email: string) => {
  if (!mailTransporter) {
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const lastNotifiedAt = loginNotificationCache.get(normalizedEmail) || 0;
  if (Date.now() - lastNotifiedAt < LOGIN_MAIL_COOLDOWN_MS) {
    return;
  }

  try {
    await mailTransporter.sendMail({
      from: notifyFrom,
      to: notifyTo,
      subject: "DSA Tracker login alert",
      text: `A user logged in to DSA Tracker.\n\nEmail: ${normalizedEmail}\nTime (UTC): ${new Date().toISOString()}\n`,
    });
    loginNotificationCache.set(normalizedEmail, Date.now());
  } catch (error) {
    console.error("Failed to send login notification email:", error);
  }
};
