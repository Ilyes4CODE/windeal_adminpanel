// js/pages/users.js
const UsersPage = {
  _data: [],
  _filtered: [],
  _role: "",
  _page: 1,
  _perPage: 10,
  _search: "",

  async render() {
    return `
    <div class="page-header">
      <h2 class="page-title"><i class="fas fa-users"></i> <span data-i18n="users">${I18n.t("users")}</span></h2>
    </div>
    <div class="section-card">
      <div class="table-toolbar">
        <div class="filter-tabs">
          <button class="tab-btn active" onclick="UsersPage.setRole('')"  data-i18n="filter_all">${I18n.t("filter_all")}</button>
          <button class="tab-btn" onclick="UsersPage.setRole('client')"   data-i18n="filter_clients">${I18n.t("filter_clients")}</button>
          <button class="tab-btn" onclick="UsersPage.setRole('business')" data-i18n="filter_businesses">${I18n.t("filter_businesses")}</button>
        </div>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="user-search" placeholder="${I18n.t("search")}"
            oninput="UsersPage.onSearch(this.value)" />
        </div>
      </div>
      <div id="users-table"><div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div></div>
      <div id="users-paginator"></div>
    </div>`;
  },

  async mount() {
    await this.load();
  },

  async setRole(role) {
    this._role = role;
    this._page = 1;
    document.querySelectorAll(".filter-tabs .tab-btn").forEach((b, i) => {
      b.classList.toggle("active", (role === "" && i === 0) || (role === "client" && i === 1) || (role === "business" && i === 2));
    });
    await this.load();
  },

  async load() {
    const el = document.getElementById("users-table");
    if (el) el.innerHTML = `<div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div>`;
    const res   = await API.users.list(this._role);
    this._data  = res.ok ? res.data.data : [];
    this.applySearch();
  },

  onSearch(val) {
    this._search = val.toLowerCase();
    this.applySearch();
  },

  applySearch() {
    this._filtered = this._data.filter(u => {
      const q = this._search;
      return !q || u.phone?.includes(q) || u.email?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q)
        || u.client_profile?.first_name?.toLowerCase().includes(q)
        || u.client_profile?.last_name?.toLowerCase().includes(q)
        || u.business_profile?.business_name?.toLowerCase().includes(q);
    });
    this._page = 1;
    this.renderTable();
  },

  renderTable() {
    const paged = Helpers.paginate(this._filtered, this._page, this._perPage);
    const el    = document.getElementById("users-table");
    if (!el) return;

    if (paged.length === 0) { el.innerHTML = `<p class="no-data">${I18n.t("no_data")}</p>`; return; }

    el.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>${I18n.t("name")}</th>
        <th>${I18n.t("phone")}</th>
        <th>${I18n.t("role")}</th>
        <th>${I18n.t("city")}</th>
        <th>${I18n.t("subscription")}</th>
        <th>${I18n.t("verified")}</th>
        <th>${I18n.t("active")}</th>
        <th>${I18n.t("actions")}</th>
      </tr></thead>
      <tbody>${paged.map(u => {
        const name = u.role === "client"
          ? `${u.client_profile?.first_name || ""} ${u.client_profile?.last_name || ""}`.trim() || u.phone
          : u.business_profile?.business_name || u.phone;
        return `<tr>
          <td><strong>${Helpers.escapeHtml(name)}</strong>${u.email ? `<br><small class="muted">${Helpers.escapeHtml(u.email)}</small>` : ""}</td>
          <td>${u.phone}</td>
          <td><span class="role-tag role-${u.role}">${I18n.t(u.role)}</span></td>
          <td>${u.city || "—"}</td>
          <td>${Helpers.statusBadge(u.subscription_status)}</td>
          <td>${Helpers.boolBadge(u.is_verified)}</td>
          <td>${Helpers.boolBadge(u.is_active)}</td>
          <td>
            <div class="action-btns">
              <button class="btn-icon ${u.is_active?"btn-warning":"btn-approve"}" title="${I18n.t("toggle_active")}"
                onclick="UsersPage.toggle('${u.id}', ${u.is_active})">
                <i class="fas ${u.is_active?"fa-ban":"fa-check"}"></i>
              </button>
              <button class="btn-icon btn-edit" title="${I18n.t("set_subscription")}"
                onclick="UsersPage.openSetSub('${u.id}', '${u.subscription_status}')">
                <i class="fas fa-crown"></i>
              </button>
            </div>
          </td>
        </tr>`;
      }).join("")}
      </tbody>
    </table>`;

    Helpers.renderPaginator("users-paginator", this._filtered.length, this._page, this._perPage, "UsersPage.goPage");
  },

  goPage(p) { UsersPage._page = p; UsersPage.renderTable(); },

  toggle(id, currentlyActive) {
    const msg = currentlyActive ? "Deactivate this user?" : "Reactivate this user?";
    Modal.confirm(I18n.t("toggle_active"), msg, async () => {
      const res = await API.users.toggle(id);
      if (!res.ok) { Helpers.toast(I18n.t("error_generic"), "error"); return; }
      Helpers.toast(I18n.t("save_success"), "success");
      await this.load();
    });
  },

  openSetSub(id, current) {
    const statuses = ["FREE","PENDING","ACTIVE","EXPIRED"];
    Modal.open(I18n.t("set_subscription"), `
      <div class="form-field">
        <label>${I18n.t("subscription")}</label>
        <select id="f-sub-status" class="field-select">
          ${statuses.map(s => `<option value="${s}" ${s===current?"selected":""}>${I18n.t(s.toLowerCase()) || s}</option>`).join("")}
        </select>
      </div>`, async () => {
      const newStatus = document.getElementById("f-sub-status").value;
      const res = await API.users.setSub(id, newStatus);
      if (!res.ok) { Helpers.toast(I18n.t("error_generic"), "error"); return; }
      Helpers.toast(I18n.t("save_success"), "success");
      Modal.close();
      await this.load();
    });
  },
};
