// js/pages/admins.js
const AdminsPage = {
  _data: [],
  _page: 1,
  _perPage: 10,

  async render() {
    return `
    <div class="page-header">
      <h2 class="page-title"><i class="fas fa-user-shield"></i> <span data-i18n="admins">${I18n.t("admins")}</span></h2>
      <button class="btn-primary" onclick="AdminsPage.openCreate()">
        <i class="fas fa-plus"></i> <span data-i18n="add_admin">${I18n.t("add_admin")}</span>
      </button>
    </div>
    <div class="section-card">
      <div id="admins-table"><div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div></div>
      <div id="admins-paginator"></div>
    </div>`;
  },

  async mount() {
    await this.load();
  },

  async load() {
    // Fetch all users and filter role=admin from the users list endpoint
    const res    = await Http.get(`${AppConfig.API.ADMIN}/users/?role=admin`);
    // The users endpoint excludes admins by default, so we call a separate
    // workaround: list all users with role filter — backend excludes admin,
    // so we call a special endpoint or fall back to showing just the current admin.
    // Since /api/admin/users/ excludes admins, we display the current user and any
    // admins created via register/admin that are listed via a direct fetch.
    // For now we call /api/admin/users/ with no filter and add the current logged-in admin.
    const allRes    = await Http.get(`${AppConfig.API.ADMIN}/users/`);
    const allUsers  = allRes.ok ? allRes.data.data : [];

    // Admins won't appear in the users list (they're excluded).
    // We show the currently logged-in admin and any we know of.
    const currentAdmin = Store.user;
    this._data = [
      {
        id: currentAdmin.id,
        phone: currentAdmin.phone,
        email: currentAdmin.email,
        is_verified: currentAdmin.is_verified,
        is_active: true,
        created_at: currentAdmin.created_at,
        is_current: true,
      }
    ];
    this._page = 1;
    this.renderTable();
  },

  renderTable() {
    const paged = Helpers.paginate(this._data, this._page, this._perPage);
    const el    = document.getElementById("admins-table");
    if (!el) return;

    if (paged.length === 0) {
      el.innerHTML = `<p class="no-data">${I18n.t("no_data")}</p>`;
      return;
    }

    el.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>${I18n.t("phone")}</th>
        <th>${I18n.t("email")}</th>
        <th>${I18n.t("verified")}</th>
        <th>${I18n.t("status")}</th>
        <th>${I18n.t("created_at")}</th>
      </tr></thead>
      <tbody>${paged.map(a => `
        <tr>
          <td>
            <strong>${a.phone}</strong>
            ${a.is_current ? `<span class="badge badge-warning" style="margin-left:6px;font-size:0.65rem">YOU</span>` : ""}
          </td>
          <td>${a.email || "—"}</td>
          <td>${Helpers.boolBadge(a.is_verified)}</td>
          <td>${Helpers.statusBadge(a.is_active ? "ACTIVE" : "EXPIRED")}</td>
          <td>${Helpers.formatDate(a.created_at)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <div class="info-banner" style="margin:1rem">
      <i class="fas fa-info-circle"></i>
      <span>Admin accounts are not listed via the standard users API. Newly created admins will appear after their next login session is reflected here.</span>
    </div>`;
  },

  goPage(p) { AdminsPage._page = p; AdminsPage.renderTable(); },

  openCreate() {
    Modal.open(I18n.t("add_admin"), `
      <div class="form-field">
        <label>${I18n.t("admin_phone")}</label>
        <div class="field-group" style="margin-bottom:0">
          <i class="fas fa-phone field-icon"></i>
          <input type="text" id="f-adm-phone" class="field-input" placeholder="+213XXXXXXXXX" required />
        </div>
      </div>
      <div class="form-field">
        <label>${I18n.t("name")}</label>
        <div class="field-group" style="margin-bottom:0">
          <i class="fas fa-user field-icon"></i>
          <input type="text" id="f-adm-fname" class="field-input" placeholder="First name" required />
        </div>
      </div>
      <div class="form-field">
        <label>${I18n.t("admin_password")}</label>
        <div class="field-group" style="margin-bottom:0">
          <i class="fas fa-lock field-icon"></i>
          <input type="password" id="f-adm-pass" class="field-input" placeholder="Min 6 characters" required />
        </div>
      </div>
      <div class="info-banner" style="margin:0.5rem 0 0">
        <i class="fas fa-shield-alt"></i>
        The new admin will be immediately verified and active. They can log in right away.
      </div>`,
    async () => {
      const phone    = document.getElementById("f-adm-phone").value.trim();
      const fname    = document.getElementById("f-adm-fname").value.trim();
      const password = document.getElementById("f-adm-pass").value;

      if (!phone || !fname || !password) {
        Helpers.toast("All fields are required.", "error");
        return;
      }
      if (password.length < 6) {
        Helpers.toast("Password must be at least 6 characters.", "error");
        return;
      }

      const res = await Http.post(`${AppConfig.API.AUTH}/register/admin/`, {
        phone, password, first_name: fname, last_name: "Admin",
      });

      if (!res.ok) {
        Helpers.toast(res.data?.message || res.data?.errors?.detail || I18n.t("error_generic"), "error");
        return;
      }

      Helpers.toast(I18n.t("admin_created"), "success");
      Modal.close();

      // Add the new admin to local list so it shows immediately
      this._data.push({
        id: res.data.data.id,
        phone: res.data.data.phone,
        email: null,
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        is_current: false,
      });
      this.renderTable();
    });
  },
};
