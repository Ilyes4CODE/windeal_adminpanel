// js/state/store.js
const Store = {
  _state: {
    user: null,
    token: null,
    currentPage: "dashboard",
  },

  init() {
    const token = localStorage.getItem(AppConfig.TOKEN_KEY);
    const user  = JSON.parse(localStorage.getItem(AppConfig.USER_KEY) || "null");
    if (token && user) {
      this._state.token = token;
      this._state.user  = user;
    }
  },

  get token()       { return this._state.token; },
  get user()        { return this._state.user; },
  get currentPage() { return this._state.currentPage; },

  setAuth(token, refresh, user) {
    this._state.token = token;
    this._state.user  = user;
    localStorage.setItem(AppConfig.TOKEN_KEY,  token);
    localStorage.setItem(AppConfig.REFRESH_KEY, refresh);
    localStorage.setItem(AppConfig.USER_KEY,   JSON.stringify(user));
  },

  clearAuth() {
    this._state.token = null;
    this._state.user  = null;
    localStorage.removeItem(AppConfig.TOKEN_KEY);
    localStorage.removeItem(AppConfig.REFRESH_KEY);
    localStorage.removeItem(AppConfig.USER_KEY);
  },

  setPage(page) {
    this._state.currentPage = page;
  },

  isLoggedIn() {
    return !!this._state.token && !!this._state.user;
  },

  isAdmin() {
    return this._state.user?.role === "admin";
  },
};
