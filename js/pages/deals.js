// js/pages/deals.js
const DealsPage = {
  _data: [],
  _filtered: [],
  _page: 1,
  _perPage: 10,
  _search: "",
  _filter: "all", // all | featured | not_featured

  async render() {
    return `
    <div class="page-header">
      <h2 class="page-title"><i class="fas fa-fire"></i> <span data-i18n="deals">${I18n.t("deals")}</span></h2>
      <div class="tab-switch">
        <button class="tab-btn active" id="tab-deals-all" onclick="DealsPage.setFilter('all')" data-i18n="filter_all">${I18n.t("filter_all")}</button>
        <button class="tab-btn" id="tab-deals-featured" onclick="DealsPage.setFilter('featured')" data-i18n="featured_only">${I18n.t("featured_only")}</button>
      </div>
    </div>
    <div class="section-card">
      <div class="table-toolbar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="deal-search" data-i18n-ph="search" placeholder="${I18n.t("search")}"
            oninput="DealsPage.onSearch(this.value)" />
        </div>
      </div>
      <div id="deal-table"><div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div></div>
      <div id="deal-paginator"></div>
    </div>`;
  },

  async mount() {
    await this.load();
  },

  async setFilter(f) {
    this._filter = f;
    this._page = 1;
    document.getElementById("tab-deals-all")?.classList.toggle("active", f === "all");
    document.getElementById("tab-deals-featured")?.classList.toggle("active", f === "featured");
    await this.load();
  },

  async load() {
    const el = document.getElementById("deal-table");
    if (el) el.innerHTML = `<div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div>`;
    const params = this._filter === "featured" ? "?featured=true" : "";
    const res = await API.deals.list(params);
    this._data = res.ok ? res.data.data : [];
    this._applySearch();
    this.renderTable();
  },

  onSearch(val) {
    this._search = val.toLowerCase();
    this._page = 1;
    this._applySearch();
    this.renderTable();
  },

  _applySearch() {
    this._filtered = this._data.filter(d =>
      (d.title || "").toLowerCase().includes(this._search) ||
      (d.business_name || "").toLowerCase().includes(this._search)
    );
  },

  renderTable() {
    const paged = Helpers.paginate(this._filtered, this._page, this._perPage);
    const el = document.getElementById("deal-table");
    if (!el) return;

    if (paged.length === 0) {
      el.innerHTML = `<p class="no-data">${I18n.t("no_data")}</p>`;
      document.getElementById("deal-paginator").innerHTML = "";
      return;
    }

    el.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>${I18n.t("deal_title")}</th>
        <th>${I18n.t("business")}</th>
        <th>${I18n.t("category")}</th>
        <th>${I18n.t("rating")}</th>
        <th>${I18n.t("featured")}</th>
        <th>${I18n.t("status")}</th>
        <th>${I18n.t("actions")}</th>
      </tr></thead>
      <tbody>${paged.map(d => `
        <tr>
          <td><strong>${Helpers.escapeHtml(d.title)}</strong></td>
          <td>${Helpers.escapeHtml(d.business_name) || "—"}</td>
          <td>${Helpers.escapeHtml(d.category_name) || "—"}</td>
          <td><i class="fas fa-star" style="color:#f5a623"></i> ${d.rating ?? "0"}</td>
          <td>${Helpers.boolBadge(d.is_featured)}</td>
          <td>${Helpers.statusBadge(d.is_active ? "ACTIVE" : "EXPIRED")}</td>
          <td>
            <button class="btn-icon ${d.is_featured ? "btn-delete" : "btn-approve"}"
              title="${d.is_featured ? I18n.t("unfeature") : I18n.t("feature")}"
              onclick="DealsPage.toggleFeature('${d.id}', ${d.is_featured})">
              <i class="fas ${d.is_featured ? "fa-star-half-stroke" : "fa-star"}"></i>
            </button>
          </td>
        </tr>`).join("")}
      </tbody>
    </table>`;

    Helpers.renderPaginator("deal-paginator", this._filtered.length, this._page, this._perPage, "DealsPage.goPage");
  },

  goPage(p) { DealsPage._page = p; DealsPage.renderTable(); },

  async toggleFeature(id, current) {
    const res = await API.deals.feature(id, { is_featured: !current });
    if (!res.ok) { Helpers.toast(res.data?.message || I18n.t("error_generic"), "error"); return; }
    Helpers.toast(!current ? I18n.t("featured_set") : I18n.t("featured_unset"), "success");
    await this.load();
  },
};
