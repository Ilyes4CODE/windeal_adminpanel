// js/pages/login.js
const LoginPage = {
  render() {
    return `
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-logo">
          <div class="logo-ring"><span class="logo-w">W</span></div>
        </div>
        <h1 class="login-title" data-i18n="login_title">${I18n.t("login_title")}</h1>
        <p class="login-sub" data-i18n="login_subtitle">${I18n.t("login_subtitle")}</p>
        <form id="login-form" autocomplete="off">
          <div class="field-group">
            <i class="fas fa-user field-icon"></i>
            <input type="text" id="login-identifier" class="field-input"
              data-i18n-ph="phone_or_email"
              placeholder="${I18n.t("phone_or_email")}" required />
          </div>
          <div class="field-group">
            <i class="fas fa-lock field-icon"></i>
            <input type="password" id="login-password" class="field-input"
              data-i18n-ph="password"
              placeholder="${I18n.t("password")}" required />
            <button type="button" class="eye-btn" id="eye-toggle">
              <i class="fas fa-eye"></i>
            </button>
          </div>
          <div id="login-error" class="login-error hidden"></div>
          <button type="submit" class="btn-primary full" id="login-btn">
            <span data-i18n="sign_in">${I18n.t("sign_in")}</span>
          </button>
        </form>
        <div class="lang-switcher login-lang">
          <button class="lang-btn ${I18n.current === "en" ? "active" : ""}" data-lang="en" onclick="I18n.set('en')">EN</button>
          <button class="lang-btn ${I18n.current === "ar" ? "active" : ""}" data-lang="ar" onclick="I18n.set('ar')">AR</button>
          <button class="lang-btn ${I18n.current === "fr" ? "active" : ""}" data-lang="fr" onclick="I18n.set('fr')">FR</button>
        </div>
      </div>
    </div>`;
  },

  mount() {
    const form  = document.getElementById("login-form");
    const errEl = document.getElementById("login-error");

    // Password eye toggle
    document.getElementById("eye-toggle").addEventListener("click", () => {
      const inp  = document.getElementById("login-password");
      const icon = document.querySelector("#eye-toggle i");
      if (inp.type === "password") {
        inp.type = "text";
        icon.className = "fas fa-eye-slash";
      } else {
        inp.type = "password";
        icon.className = "fas fa-eye";
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.classList.add("hidden");

      const btn = document.getElementById("login-btn");
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

      const identifier = document.getElementById("login-identifier").value.trim();
      const password   = document.getElementById("login-password").value;

      const res = await Http.post(`${AppConfig.API.AUTH}/login/admin/`, { identifier, password });

      btn.disabled = false;
      btn.innerHTML = `<span data-i18n="sign_in">${I18n.t("sign_in")}</span>`;

      if (!res.ok) {
        errEl.textContent = res.data?.message || I18n.t("login_error");
        errEl.classList.remove("hidden");
        return;
      }

      const user = res.data.data;

      if (user.role !== "admin") {
        errEl.textContent = I18n.t("role_error");
        errEl.classList.remove("hidden");
        return;
      }

      // Save auth state first
      Store.setAuth(user.tokens.access, user.tokens.refresh, user);

      // ✅ FIX: render the shell into #app BEFORE navigating,
      //    so #main-content exists when navigate() looks for it.
      App.showShell();
      await App.navigate("dashboard");
    });
  },
};