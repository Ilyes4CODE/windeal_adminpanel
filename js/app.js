// js/app.js
const App = {
  _pages: {
    dashboard: DashboardPage,
    categories: CategoriesPage,
    deals: DealsPage,
    plans: PlansPage,
    payments: PaymentsPage,
    users: UsersPage,
    admins: AdminsPage,
  },

  init() {
    Store.init();
    I18n.set(I18n.current);

    if (!Store.isLoggedIn() || !Store.isAdmin()) {
      this.showLogin();
    } else {
      this.showShell();
      this.navigate(Store.currentPage || "dashboard");
    }
  },

  showLogin() {
    document.getElementById("app").innerHTML = LoginPage.render();
    LoginPage.mount();
  },

  showShell() {
    const user = Store.user;
    document.getElementById("app").innerHTML = `
    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="logo-mark"><span>W</span></div>
          <span class="logo-text">WINDEAL</span>
          <button class="sidebar-close" id="sidebar-close" onclick="App.toggleSidebar()"><i class="fas fa-times"></i></button>
        </div>

        <nav class="sidebar-nav">
          ${[
            { page:"dashboard",  icon:"fa-chart-line",    key:"dashboard"  },
            { page:"categories", icon:"fa-tags",          key:"categories" },
            { page:"deals",      icon:"fa-fire",          key:"deals"      },
            { page:"plans",      icon:"fa-gem",           key:"plans"      },
            { page:"payments",   icon:"fa-receipt",       key:"payments"   },
            { page:"users",      icon:"fa-users",         key:"users"      },
            { page:"admins",     icon:"fa-user-shield",   key:"admins"     },
          ].map(item => `
            <a class="nav-item" data-page="${item.page}" onclick="App.navigate('${item.page}')">
              <i class="fas ${item.icon} nav-icon"></i>
              <span data-i18n="${item.key}">${I18n.t(item.key)}</span>
            </a>`).join("")}
        </nav>

        <div class="sidebar-footer">
          <div class="admin-info">
            <div class="admin-avatar"><i class="fas fa-user-circle"></i></div>
            <div class="admin-meta">
              <span class="admin-name">${user?.phone || "Admin"}</span>
              <span class="admin-role-tag">Admin</span>
            </div>
          </div>
          <button class="btn-logout" onclick="App.logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span data-i18n="logout">${I18n.t("logout")}</span>
          </button>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      <div class="sidebar-overlay" id="sidebar-overlay" onclick="App.toggleSidebar()"></div>

      <!-- Main -->
      <div class="main-wrap">
        <header class="topbar">
          <button class="hamburger" onclick="App.toggleSidebar()"><i class="fas fa-bars"></i></button>
          <div class="topbar-right">
            <div class="lang-switcher">
              <button class="lang-btn ${I18n.current==="en"?"active":""}" data-lang="en" onclick="I18n.set('en')">EN</button>
              <button class="lang-btn ${I18n.current==="ar"?"active":""}" data-lang="ar" onclick="I18n.set('ar')">AR</button>
              <button class="lang-btn ${I18n.current==="fr"?"active":""}" data-lang="fr" onclick="I18n.set('fr')">FR</button>
            </div>
          </div>
        </header>
        <main class="main-content" id="main-content">
          <div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div>
        </main>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" id="modal-overlay" onclick="App.handleModalClick(event)">
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modal-title"></h3>
          <button class="modal-close" onclick="Modal.close()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" id="modal-body"></div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-cancel" onclick="Modal.close()"></button>
          <button class="btn-primary" id="modal-confirm"></button>
        </div>
      </div>
    </div>

    <!-- Toast container -->
    <div id="toast-container"></div>`;
  },

  async navigate(page) {
    if (!this._pages[page]) page = "dashboard";
    Store.setPage(page);

    // Update nav active state
    document.querySelectorAll(".nav-item").forEach(el => {
      el.classList.toggle("active", el.dataset.page === page);
    });

    const main = document.getElementById("main-content");
    if (!main) return;
    main.innerHTML = `<div class="loading-row"><i class="fas fa-spinner fa-spin"></i></div>`;

    const pageObj = this._pages[page];
    main.innerHTML = await pageObj.render();
    I18n.set(I18n.current); // re-apply translations to new DOM
    await pageObj.mount();

    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) this.closeSidebar();
  },

  handleModalClick(e) {
    if (e.target.id === "modal-overlay") Modal.close();
  },

  toggleSidebar() {
    document.getElementById("sidebar")?.classList.toggle("open");
    document.getElementById("sidebar-overlay")?.classList.toggle("show");
  },

  closeSidebar() {
    document.getElementById("sidebar")?.classList.remove("open");
    document.getElementById("sidebar-overlay")?.classList.remove("show");
  },

  async logout() {
    Modal.confirm(I18n.t("logout"), "Are you sure you want to logout?", async () => {
      const refresh = localStorage.getItem(AppConfig.REFRESH_KEY);
      if (refresh) await Http.post(`${AppConfig.API.AUTH}/logout/`, { refresh });
      Store.clearAuth();
      document.getElementById("app").innerHTML = "";
      this.showLogin();
    });
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
