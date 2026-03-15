// js/pages/categories.js
const CategoriesPage = {
  _data: [],
  _filtered: [],
  _page: 1,
  _perPage: 8,
  _search: "",

  async render() {
    return `
    <div class="page-header">
      <h2 class="page-title"><i class="fas fa-tags"></i> <span data-i18n="categories">${I18n.t("categories")}</span></h2>
      <button class="btn-primary" onclick="CategoriesPage.openCreate()">
        <i class="fas fa-plus"></i> <span data-i18n="add_category">${I18n.t("add_category")}</span>
      </button>
    </div>
    <div class="section-card">
      <div class="table-toolbar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="cat-search" data-i18n-ph="search" placeholder="${I18n.t("search")}"
            oninput="CategoriesPage.onSearch(this.value)" />
        </div>
      </div>
      <div id="cat-table"><div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div></div>
      <div id="cat-paginator"></div>
    </div>`;
  },

  async mount() {
    await this.load();
  },

  async load() {
    const res = await API.categories.list();
    this._data     = res.ok ? res.data.data : [];
    this._filtered = [...this._data];
    this._page     = 1;
    this.renderTable();
  },

  onSearch(val) {
    this._search   = val.toLowerCase();
    this._filtered = this._data.filter(c => c.name.toLowerCase().includes(this._search));
    this._page     = 1;
    this.renderTable();
  },

  renderTable() {
    const paged = Helpers.paginate(this._filtered, this._page, this._perPage);
    const el    = document.getElementById("cat-table");
    if (!el) return;

    if (paged.length === 0) {
      el.innerHTML = `<p class="no-data">${I18n.t("no_data")}</p>`;
      document.getElementById("cat-paginator").innerHTML = "";
      return;
    }

    el.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>${I18n.t("category_photo")}</th>
        <th>${I18n.t("category_name")}</th>
        <th>${I18n.t("status")}</th>
        <th>${I18n.t("created_at")}</th>
        <th>${I18n.t("actions")}</th>
      </tr></thead>
      <tbody>${paged.map(c => `
        <tr>
          <td><div class="cat-photo">${c.photo_url ? `<img src="${c.photo_url}" alt="${Helpers.escapeHtml(c.name)}">` : `<div class="cat-photo-placeholder"><i class="fas fa-image"></i></div>`}</div></td>
          <td><strong>${Helpers.escapeHtml(c.name)}</strong></td>
          <td>${Helpers.statusBadge(c.is_active ? "ACTIVE" : "EXPIRED")}</td>
          <td>${Helpers.formatDate(c.created_at)}</td>
          <td>
            <div class="action-btns">
              <button class="btn-icon btn-edit" title="${I18n.t("edit")}" onclick="CategoriesPage.openEdit('${c.id}')"><i class="fas fa-pen"></i></button>
              <button class="btn-icon btn-delete" title="${I18n.t("delete")}" onclick="CategoriesPage.delete('${c.id}', '${Helpers.escapeHtml(c.name)}')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>`).join("")}
      </tbody>
    </table>`;

    Helpers.renderPaginator("cat-paginator", this._filtered.length, this._page, this._perPage, "CategoriesPage.goPage");
  },

  goPage(p) {
    CategoriesPage._page = p;
    CategoriesPage.renderTable();
  },

  _form(cat = null) {
    return `
    <div class="form-field">
      <label data-i18n="category_name">${I18n.t("category_name")}</label>
      <input type="text" id="f-cat-name" class="field-input" value="${cat ? Helpers.escapeHtml(cat.name) : ""}" required />
    </div>
    <div class="form-field">
      <label data-i18n="category_photo">${I18n.t("category_photo")}</label>
      <div class="file-drop-zone" id="cat-photo-zone">
        <i class="fas fa-cloud-upload-alt"></i>
        <span>Click or drag photo here</span>
        <input type="file" id="f-cat-photo" accept="image/*" style="display:none" onchange="CategoriesPage.previewPhoto(this)" />
      </div>
      <div id="cat-photo-preview" class="photo-preview-wrap" style="display:none"></div>
    </div>
    <div class="form-field form-row">
      <label><input type="checkbox" id="f-cat-active" ${cat===null||cat.is_active?"checked":""} /> <span data-i18n="active">${I18n.t("active")}</span></label>
    </div>`;
  },

  previewPhoto(input) {
    if (!input.files[0]) return;
    const url = URL.createObjectURL(input.files[0]);
    const p = document.getElementById("cat-photo-preview");
    p.innerHTML = `<img src="${url}" class="photo-preview" />`;
    p.style.display = "";
  },

  openCreate() {
    Modal.open(I18n.t("add_category"), this._form(), async () => {
      const name   = document.getElementById("f-cat-name").value.trim();
      const active = document.getElementById("f-cat-active").checked;
      const file   = document.getElementById("f-cat-photo").files[0];
      const fd     = new FormData();
      fd.append("name", name);
      fd.append("is_active", active);
      if (file) fd.append("photo", file);
      const res = await API.categories.create(fd);
      if (!res.ok) { Helpers.toast(res.data?.message || I18n.t("error_generic"), "error"); return; }
      Helpers.toast(I18n.t("save_success"), "success");
      Modal.close();
      await this.load();
    });
    document.getElementById("cat-photo-zone").addEventListener("click", () => document.getElementById("f-cat-photo").click());
  },

  openEdit(id) {
    const cat = this._data.find(c => c.id === id);
    if (!cat) return;
    Modal.open(I18n.t("edit") + " — " + cat.name, this._form(cat), async () => {
      const name   = document.getElementById("f-cat-name").value.trim();
      const active = document.getElementById("f-cat-active").checked;
      const file   = document.getElementById("f-cat-photo").files[0];
      const fd     = new FormData();
      fd.append("name", name);
      fd.append("is_active", active);
      if (file) fd.append("photo", file);
      const res = await API.categories.update(id, fd);
      if (!res.ok) { Helpers.toast(res.data?.message || I18n.t("error_generic"), "error"); return; }
      Helpers.toast(I18n.t("save_success"), "success");
      Modal.close();
      await this.load();
    });
    document.getElementById("cat-photo-zone").addEventListener("click", () => document.getElementById("f-cat-photo").click());
  },

  delete(id, name) {
    Modal.confirm(I18n.t("delete"), `${I18n.t("confirm_delete")} "${name}"?`, async () => {
      const res = await API.categories.delete(id);
      if (!res.ok) { Helpers.toast(res.data?.message || I18n.t("error_generic"), "error"); return; }
      Helpers.toast(I18n.t("delete_success"), "success");
      await this.load();
    });
  },
};
