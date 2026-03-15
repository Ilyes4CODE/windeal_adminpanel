// js/utils/helpers.js
const Helpers = {
  formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(I18n.current === "ar" ? "ar-DZ" : I18n.current === "fr" ? "fr-FR" : "en-GB", {
      year: "numeric", month: "short", day: "numeric",
    });
  },

  formatDateTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(I18n.current === "ar" ? "ar-DZ" : I18n.current === "fr" ? "fr-FR" : "en-GB", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  },

  statusBadge(status) {
    const map = {
      PENDING:  ["badge badge-warning",  I18n.t("pending")],
      APPROVED: ["badge badge-success",  I18n.t("approved")],
      REJECTED: ["badge badge-danger",   I18n.t("rejected")],
      ACTIVE:   ["badge badge-success",  I18n.t("active")],
      FREE:     ["badge badge-secondary",I18n.t("free")],
      EXPIRED:  ["badge badge-danger",   I18n.t("expired")],
    };
    const [cls, label] = map[status] || ["badge badge-secondary", status];
    return `<span class="${cls}">${label}</span>`;
  },

  boolBadge(val) {
    return val
      ? `<span class="badge badge-success"><i class="fas fa-check"></i></span>`
      : `<span class="badge badge-danger"><i class="fas fa-times"></i></span>`;
  },

  truncate(str, n = 30) {
    if (!str) return "—";
    return str.length > n ? str.slice(0, n) + "…" : str;
  },

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  },

  paginate(data, page, perPage) {
    const start = (page - 1) * perPage;
    return data.slice(start, start + perPage);
  },

  renderPaginator(containerId, total, page, perPage, onPage) {
    const totalPages = Math.ceil(total / perPage);
    const el = document.getElementById(containerId);
    if (!el) return;
    if (totalPages <= 1) { el.innerHTML = ""; return; }

    let html = `<div class="paginator">
      <span class="page-info">${I18n.t("page")} ${page} ${I18n.t("of")} ${totalPages}</span>
      <div class="page-btns">`;
    html += `<button class="page-btn" ${page===1?"disabled":""} onclick="${onPage}(${page-1})"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && Math.abs(i - page) > 2 && i !== 1 && i !== totalPages) {
        if (i === page - 3 || i === page + 3) html += `<span class="page-ellipsis">…</span>`;
        continue;
      }
      html += `<button class="page-btn ${i===page?"active":""}" onclick="${onPage}(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" ${page===totalPages?"disabled":""} onclick="${onPage}(${page+1})"><i class="fas fa-chevron-right"></i></button>`;
    html += `</div></div>`;
    el.innerHTML = html;
  },

  toast(message, type = "success") {
    const icons = { success: "fa-check-circle", error: "fa-times-circle", info: "fa-info-circle", warning: "fa-exclamation-triangle" };
    const t = document.createElement("div");
    t.className = `toast toast-${type}`;
    t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    document.getElementById("toast-container")?.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 3500);
  },
};
