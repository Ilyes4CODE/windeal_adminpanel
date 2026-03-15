// js/pages/plans.js
const PlansPage = {
  _data: [],
  _page: 1,
  _perPage: 8,

  async render() {
    return `
    <div class="page-header">
      <h2 class="page-title"><i class="fas fa-gem"></i> <span data-i18n="plans">${I18n.t("plans")}</span></h2>
      <button class="btn-primary" onclick="PlansPage.openCreate()">
        <i class="fas fa-plus"></i> <span data-i18n="add_plan">${I18n.t("add_plan")}</span>
      </button>
    </div>
    <div class="section-card">
      <div id="plans-grid"><div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div></div>
      <div id="plans-paginator"></div>
    </div>`;
  },

  async mount() {
    await this.load();
  },

  async load() {
    const res  = await API.plans.list();
    this._data = res.ok ? res.data.data : [];
    this._page = 1;
    this.renderGrid();
  },

  renderGrid() {
    const paged = Helpers.paginate(this._data, this._page, this._perPage);
    const el    = document.getElementById("plans-grid");
    if (!el) return;

    if (paged.length === 0) { el.innerHTML = `<p class="no-data">${I18n.t("no_data")}</p>`; return; }

    const durationLabel = (t) => I18n.t(t) || t;
    const roleLabel     = (r) => I18n.t(r) || r;

    el.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>${I18n.t("plan_name")}</th>
        <th>${I18n.t("price")}</th>
        <th>${I18n.t("duration_type")}</th>
        <th>${I18n.t("duration_days")}</th>
        <th>${I18n.t("target_role")}</th>
        <th>${I18n.t("status")}</th>
        <th>${I18n.t("actions")}</th>
      </tr></thead>
      <tbody>${paged.map(p => `
        <tr>
          <td><strong>${Helpers.escapeHtml(p.name)}</strong><br><small class="muted">${Helpers.truncate(p.description, 40)}</small></td>
          <td><span class="price-tag">${p.price} DZD</span></td>
          <td>${durationLabel(p.duration_type)}</td>
          <td>${p.duration_days}</td>
          <td><span class="role-tag role-${p.target_role}">${roleLabel(p.target_role)}</span></td>
          <td>${Helpers.statusBadge(p.is_active ? "ACTIVE" : "EXPIRED")}</td>
          <td>
            <div class="action-btns">
              <button class="btn-icon btn-edit" onclick="PlansPage.openEdit('${p.id}')"><i class="fas fa-pen"></i></button>
              <button class="btn-icon btn-delete" onclick="PlansPage.delete('${p.id}', '${Helpers.escapeHtml(p.name)}')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>`).join("")}
      </tbody>
    </table>`;
    Helpers.renderPaginator("plans-paginator", this._data.length, this._page, this._perPage, "PlansPage.goPage");
  },

  goPage(p) { PlansPage._page = p; PlansPage.renderGrid(); },

  _form(plan = null) {
    const durationTypes = ["monthly","quarterly","semi_annual","annual","custom"];
    const targetRoles   = ["client","business","both"];
    return `
    <div class="form-grid-2">
      <div class="form-field">
        <label>${I18n.t("plan_name")}</label>
        <input type="text" id="f-plan-name" class="field-input" value="${plan ? Helpers.escapeHtml(plan.name) : ""}" required />
      </div>
      <div class="form-field">
        <label>${I18n.t("price")}</label>
        <input type="number" id="f-plan-price" class="field-input" value="${plan ? plan.price : ""}" min="1" step="0.01" required />
      </div>
      <div class="form-field">
        <label>${I18n.t("duration_type")}</label>
        <select id="f-plan-dtype" class="field-select">
          ${durationTypes.map(t => `<option value="${t}" ${plan?.duration_type===t?"selected":""}>${I18n.t(t)}</option>`).join("")}
        </select>
      </div>
      <div class="form-field">
        <label>${I18n.t("duration_days")}</label>
        <input type="number" id="f-plan-days" class="field-input" value="${plan ? plan.duration_days : ""}" min="1" required />
      </div>
      <div class="form-field">
        <label>${I18n.t("target_role")}</label>
        <select id="f-plan-role" class="field-select">
          ${targetRoles.map(r => `<option value="${r}" ${plan?.target_role===r?"selected":""}>${I18n.t(r)}</option>`).join("")}
        </select>
      </div>
      <div class="form-field form-row">
        <label><input type="checkbox" id="f-plan-active" ${plan===null||plan.is_active?"checked":""} /> <span>${I18n.t("active")}</span></label>
      </div>
    </div>
    <div class="form-field">
      <label>${I18n.t("description")}</label>
      <textarea id="f-plan-desc" class="field-textarea">${plan ? Helpers.escapeHtml(plan.description || "") : ""}</textarea>
    </div>`;
  },

  openCreate() {
    Modal.open(I18n.t("add_plan"), this._form(), async () => {
      const body = {
        name: document.getElementById("f-plan-name").value.trim(),
        price: parseFloat(document.getElementById("f-plan-price").value),
        duration_type: document.getElementById("f-plan-dtype").value,
        duration_days: parseInt(document.getElementById("f-plan-days").value),
        target_role: document.getElementById("f-plan-role").value,
        is_active: document.getElementById("f-plan-active").checked,
        description: document.getElementById("f-plan-desc").value.trim(),
      };
      const res = await API.plans.create(body);
      if (!res.ok) { Helpers.toast(res.data?.message || I18n.t("error_generic"), "error"); return; }
      Helpers.toast(I18n.t("save_success"), "success");
      Modal.close();
      await this.load();
    }, null, null, "modal-lg");
  },

  openEdit(id) {
    const plan = this._data.find(p => p.id === id);
    if (!plan) return;
    Modal.open(I18n.t("edit"), this._form(plan), async () => {
      const body = {
        name: document.getElementById("f-plan-name").value.trim(),
        price: parseFloat(document.getElementById("f-plan-price").value),
        duration_type: document.getElementById("f-plan-dtype").value,
        duration_days: parseInt(document.getElementById("f-plan-days").value),
        target_role: document.getElementById("f-plan-role").value,
        is_active: document.getElementById("f-plan-active").checked,
        description: document.getElementById("f-plan-desc").value.trim(),
      };
      const res = await API.plans.update(id, body);
      if (!res.ok) { Helpers.toast(res.data?.message || I18n.t("error_generic"), "error"); return; }
      Helpers.toast(I18n.t("save_success"), "success");
      Modal.close();
      await this.load();
    }, null, null, "modal-lg");
  },

  delete(id, name) {
    Modal.confirm(I18n.t("delete"), `${I18n.t("confirm_delete")} "${name}"?`, async () => {
      const res = await API.plans.delete(id);
      if (!res.ok) { Helpers.toast(res.data?.message || I18n.t("error_generic"), "error"); return; }
      Helpers.toast(I18n.t("delete_success"), "success");
      await this.load();
    });
  },
};
