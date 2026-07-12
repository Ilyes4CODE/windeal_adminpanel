// js/config/app.config.js
const AppConfig = {
  // Production API. For local development against a local backend,
  // change this to "http://127.0.0.1:8000".
  BASE_URL: "https://api.windeal.company",
  API: {
    AUTH:    "/api/auth",
    ADMIN:   "/api/admin",
  },
  TOKEN_KEY:    "windeal_access",
  REFRESH_KEY:  "windeal_refresh",
  LANG_KEY:     "windeal_lang",
  USER_KEY:     "windeal_user",
  DEFAULT_LANG: "en",
};
