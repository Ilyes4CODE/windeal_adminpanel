// js/pages/dashboard.js
const DashboardPage = {
  async render() {
    return `
    <div class="page-header">
      <h2 class="page-title"><i class="fas fa-chart-line"></i> <span data-i18n="dashboard">${I18n.t("dashboard")}</span></h2>
    </div>
    <div class="stats-grid" id="stats-grid">
      ${[1,2,3,4].map(() => `<div class="stat-card skeleton"></div>`).join("")}
    </div>
    <div class="section-card mt-6">
      <h3 class="section-title"><i class="fas fa-clock"></i> <span data-i18n="recent_payments">${I18n.t("recent_payments")}</span></h3>
      <div id="recent-payments-table"><div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div></div>
    </div>`;
  },

  async mount() {
    const [usersRes, paymentsRes, plansRes] = await Promise.all([
      API.users.list(),
      API.payments.all(),
      API.plans.list(),
    ]);

    const users    = usersRes.ok    ? usersRes.data.data    : [];
    const payments = paymentsRes.ok ? paymentsRes.data.data : [];
    const plans    = plansRes.ok    ? plansRes.data.data    : [];

    const clients    = users.filter(u => u.role === "client");
    const businesses = users.filter(u => u.role === "business");
    const pending    = payments.filter(p => p.status === "PENDING");
    const active     = users.filter(u => u.subscription_status === "ACTIVE");

    const stats = [
      { icon: "fa-users",        color: "blue",   value: clients.length,    label: I18n.t("total_users") },
      { icon: "fa-store",        color: "teal",   value: businesses.length, label: I18n.t("total_businesses") },
      { icon: "fa-clock",        color: "amber",  value: pending.length,    label: I18n.t("pending_payments") },
      { icon: "fa-crown",        color: "green",  value: active.length,     label: I18n.t("active_subscriptions") },
    ];

    document.getElementById("stats-grid").innerHTML = stats.map(s => `
      <div class="stat-card">
        <div class="stat-icon stat-${s.color}"><i class="fas ${s.icon}"></i></div>
        <div class="stat-body">
          <div class="stat-value">${s.value}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      </div>`).join("");

    const recent = payments.slice(0, 8);
    document.getElementById("recent-payments-table").innerHTML = recent.length === 0
      ? `<p class="no-data">${I18n.t("no_data")}</p>`
      : `<table class="data-table">
          <thead><tr>
            <th>${I18n.t("user_phone")}</th>
            <th>${I18n.t("plan")}</th>
            <th>${I18n.t("amount")}</th>
            <th>${I18n.t("status")}</th>
            <th>${I18n.t("created_at")}</th>
          </tr></thead>
          <tbody>${recent.map(p => `<tr>
            <td>${p.user?.phone || "—"}</td>
            <td>${p.plan?.name || "—"}</td>
            <td>${p.amount} DZD</td>
            <td>${Helpers.statusBadge(p.status)}</td>
            <td>${Helpers.formatDateTime(p.created_at)}</td>
          </tr>`).join("")}</tbody>
        </table>`;
  },
};
