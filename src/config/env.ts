import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT,
  dbUrl: process.env.DATABASE_URL,
  appUrl: process.env.APP_URL,
  smtpHost: process.env.SMTP_HOST,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASS,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPass: process.env.ADMIN_PASS,
  serverUrl: process.env.SERVER_URL,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
};
