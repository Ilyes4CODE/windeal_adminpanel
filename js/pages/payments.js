// js/pages/payments.js
const PaymentsPage = {
  _data: [],
  _filtered: [],
  _mode: "pending",
  _page: 1,
  _perPage: 10,

  async render() {
    return `
    <div class="page-header">
      <h2 class="page-title"><i class="fas fa-receipt"></i> <span data-i18n="payments">${I18n.t("payments")}</span></h2>
      <div class="tab-switch">
        <button class="tab-btn active" id="tab-pending" onclick="PaymentsPage.setMode('pending')" data-i18n="pending_only">${I18n.t("pending_only")}</button>
        <button class="tab-btn" id="tab-all" onclick="PaymentsPage.setMode('all')" data-i18n="all_payments">${I18n.t("all_payments")}</button>
      </div>
    </div>
    <div class="section-card">
      <div id="pay-table"><div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div></div>
      <div id="pay-paginator"></div>
    </div>`;
  },

  async mount() {
    await this.load();
  },

  async setMode(mode) {
    this._mode = mode;
    this._page = 1;
    document.getElementById("tab-pending")?.classList.toggle("active", mode === "pending");
    document.getElementById("tab-all")?.classList.toggle("active", mode === "all");
    await this.load();
  },

  async load() {
    const el = document.getElementById("pay-table");
    if (el) el.innerHTML = `<div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div>`;
    const res    = this._mode === "pending" ? await API.payments.pending() : await API.payments.all();
    this._data   = res.ok ? res.data.data : [];
    this._filtered = [...this._data];
    this.renderTable();
  },

  renderTable() {
    const paged = Helpers.paginate(this._filtered, this._page, this._perPage);
    const el    = document.getElementById("pay-table");
    if (!el) return;

    if (paged.length === 0) {
      el.innerHTML = `<p class="no-data">${I18n.t("no_data")}</p>`;
      document.getElementById("pay-paginator").innerHTML = "";
      return;
    }

    el.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>${I18n.t("user_phone")}</th>
        <th>${I18n.t("role")}</th>
        <th>${I18n.t("plan")}</th>
        <th>${I18n.t("amount")}</th>
        <th>${I18n.t("status")}</th>
        <th>${I18n.t("receipt")}</th>
        <th>${I18n.t("created_at")}</th>
        <th>${I18n.t("actions")}</th>
      </tr></thead>
      <tbody>${paged.map(p => `
        <tr>
          <td><strong>${p.user?.phone || "—"}</strong></td>
          <td><span class="role-tag role-${p.user?.role}">${I18n.t(p.user?.role || "")}</span></td>
          <td>${p.plan?.name || "—"}</td>
          <td><strong>${p.amount} DZD</strong></td>
          <td>${Helpers.statusBadge(p.status)}</td>
          <td>
            ${p.receipt_url
              ? `<a href="${p.receipt_url}" target="_blank" class="btn-receipt"><i class="fas fa-file-alt"></i> ${I18n.t("view_receipt")}</a>`
              : "—"}
          </td>
          <td>${Helpers.formatDateTime(p.created_at)}</td>
          <td>
            ${p.status === "PENDING" ? `
            <div class="action-btns">
              <button class="btn-icon btn-approve" title="${I18n.t("approve")}" onclick="PaymentsPage.approve('${p.id}')"><i class="fas fa-check"></i></button>
              <button class="btn-icon btn-delete" title="${I18n.t("reject")}" onclick="PaymentsPage.openReject('${p.id}')"><i class="fas fa-times"></i></button>
            </div>` : `<span class="muted small">${Helpers.formatDate(p.reviewed_at)}</span>`}
          </td>
        </tr>`).join("")}
      </tbody>
    </table>`;

    Helpers.renderPaginator("pay-paginator", this._filtered.length, this._page, this._perPage, "PaymentsPage.goPage");
  },

  goPage(p) { PaymentsPage._page = p; PaymentsPage.renderTable(); },

  approve(id) {
    Modal.confirm(I18n.t("approve"), I18n.t("confirm_approve"), async () => {
      const res = await API.payments.review(id, { action: "approve" });
      if (!res.ok) { Helpers.toast(res.data?.message || I18n.t("error_generic"), "error"); return; }
      Helpers.toast(I18n.t("approved") + " ✓", "success");
      await this.load();
    });
  },

  openReject(id) {
    Modal.open(I18n.t("reject"), `
      <div class="form-field">
        <label>${I18n.t("rejection_reason")}</label>
        <textarea id="f-reject-reason" class="field-textarea" placeholder="${I18n.t("rejection_placeholder")}" rows="4"></textarea>
      </div>`, async () => {
      const reason = document.getElementById("f-reject-reason").value.trim();
      if (!reason) { Helpers.toast(I18n.t("rejection_reason") + " required", "error"); return; }
      const res = await API.payments.review(id, { action: "reject", rejection_reason: reason });
      if (!res.ok) { Helpers.toast(res.data?.message || I18n.t("error_generic"), "error"); return; }
      Helpers.toast(I18n.t("rejected"), "info");
      Modal.close();
      await this.load();
    }, I18n.t("reject"));
  },
};
