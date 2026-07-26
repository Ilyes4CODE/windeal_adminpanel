// js/pages/settings.js
const SettingsPage = {
  _mode: "free",

  async render() {
    return `
    <div class="page-header">
      <h2 class="page-title"><i class="fas fa-sliders-h"></i> <span data-i18n="settings">${I18n.t("settings")}</span></h2>
    </div>

    <div class="section-card" id="settings-card">
      <div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div>
    </div>`;
  },

  async mount() {
    const res = await API.settings.get();
    const card = document.getElementById("settings-card");
    if (!res.ok) {
      card.innerHTML = `<p class="no-data">${res.data?.message || I18n.t("error_generic")}</p>`;
      return;
    }
    this._mode = res.data.data.subscription_mode;
    this.paint();
  },

  paint() {
    const free  = this._mode === "free";
    const card  = document.getElementById("settings-card");
    card.innerHTML = `
      <h3 class="section-title"><i class="fas fa-crown"></i> <span data-i18n="access_mode">${I18n.t("access_mode")}</span></h3>
      <p class="settings-hint" data-i18n="access_mode_hint">${I18n.t("access_mode_hint")}</p>

      <div class="mode-cards">
        <div class="mode-card ${free ? "selected" : ""}" data-mode="free" onclick="SettingsPage.select('free')">
          <div class="mode-card-icon"><i class="fas fa-unlock"></i></div>
          <div class="mode-card-title" data-i18n="mode_free">${I18n.t("mode_free")}</div>
          <div class="mode-card-desc" data-i18n="mode_free_desc">${I18n.t("mode_free_desc")}</div>
          <div class="mode-card-check"><i class="fas fa-check-circle"></i></div>
        </div>

        <div class="mode-card ${!free ? "selected" : ""}" data-mode="plans" onclick="SettingsPage.select('plans')">
          <div class="mode-card-icon"><i class="fas fa-gem"></i></div>
          <div class="mode-card-title" data-i18n="mode_plans">${I18n.t("mode_plans")}</div>
          <div class="mode-card-desc" data-i18n="mode_plans_desc">${I18n.t("mode_plans_desc")}</div>
          <div class="mode-card-check"><i class="fas fa-check-circle"></i></div>
        </div>
      </div>

      <div class="settings-actions">
        <span class="settings-current">
          <span data-i18n="current_mode">${I18n.t("current_mode")}</span>:
          <strong class="mode-pill mode-pill-${this._mode}">${I18n.t(free ? "mode_free" : "mode_plans")}</strong>
        </span>
        <button class="btn-primary" id="save-mode" onclick="SettingsPage.save()">
          <i class="fas fa-save"></i> <span data-i18n="save">${I18n.t("save")}</span>
        </button>
      </div>`;
    I18n.set(I18n.current);
  },

  select(mode) {
    this._mode = mode;
    document.querySelectorAll(".mode-card").forEach(el => {
      el.classList.toggle("selected", el.dataset.mode === mode);
    });
    const free = mode === "free";
    const pill = document.querySelector(".settings-current strong");
    if (pill) {
      pill.className = `mode-pill mode-pill-${mode}`;
      pill.textContent = I18n.t(free ? "mode_free" : "mode_plans");
    }
  },

  async save() {
    const btn = document.getElementById("save-mode");
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
    const res = await API.settings.update({ subscription_mode: this._mode });
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-save"></i> <span>${I18n.t("save")}</span>`;
    if (!res.ok) {
      Helpers.toast(res.data?.message || I18n.t("error_generic"), "error");
      return;
    }
    this._mode = res.data.data.subscription_mode;
    Helpers.toast(res.data.message || I18n.t("save_success"), "success");
    this.paint();
  },
};
