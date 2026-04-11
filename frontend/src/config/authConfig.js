const FALLBACK_GOOGLE_CLIENT_ID = "767728604444-7016feh1d5f37f11a1qc1a3ha4nqj4nc.apps.googleusercontent.com";

export const GOOGLE_CLIENT_ID = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  import.meta.env.VITE_GOOGLE_CLIENTID ||
  FALLBACK_GOOGLE_CLIENT_ID
).trim();

export const hasGoogleClientId = Boolean(GOOGLE_CLIENT_ID);
