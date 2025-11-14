import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://869d5fb3e5a6c8810106e200f4a0d51f@o4509618209357824.ingest.us.sentry.io/4510364910944256",

  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  tracesSampleRate: 1.0,

  enableLogs: true,

  debug: false,

  environment: process.env.NODE_ENV,
});
