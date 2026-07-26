// js/api/endpoints.js
const API = {
  // Auth
  auth: {
    login:       () => Http.post(`${AppConfig.API.AUTH}/login/`,              null),
    logout:      (refresh) => Http.post(`${AppConfig.API.AUTH}/logout/`,      { refresh }),
    registerAdmin: (body)  => Http.post(`${AppConfig.API.AUTH}/register/client/`, body),
  },

  // Categories
  categories: {
    list:    ()           => Http.get(`${AppConfig.API.ADMIN}/categories/`),
    create:  (fd)         => Http.postForm(`${AppConfig.API.ADMIN}/categories/`, fd),
    update:  (id, fd)     => Http.patchForm(`${AppConfig.API.ADMIN}/categories/${id}/`, fd),
    delete:  (id)         => Http.delete(`${AppConfig.API.ADMIN}/categories/${id}/`),
  },

  // Plans
  plans: {
    list:    ()           => Http.get(`${AppConfig.API.ADMIN}/plans/`),
    create:  (body)       => Http.post(`${AppConfig.API.ADMIN}/plans/`, body),
    update:  (id, body)   => Http.patch(`${AppConfig.API.ADMIN}/plans/${id}/`, body),
    delete:  (id)         => Http.delete(`${AppConfig.API.ADMIN}/plans/${id}/`),
  },

  // Payments
  payments: {
    pending: ()           => Http.get(`${AppConfig.API.ADMIN}/payments/pending/`),
    all:     ()           => Http.get(`${AppConfig.API.ADMIN}/payments/all/`),
    review:  (id, body)   => Http.post(`${AppConfig.API.ADMIN}/payments/${id}/review/`, body),
  },

  // Deals (featuring control)
  deals: {
    list:    (params = "") => Http.get(`${AppConfig.API.ADMIN}/deals/${params}`),
    feature: (id, body)    => Http.patch(`${AppConfig.API.ADMIN}/deals/${id}/feature/`, body),
  },

  // Users
  users: {
    list:    (role)       => Http.get(`${AppConfig.API.ADMIN}/users/${role ? `?role=${role}` : ""}`),
    toggle:  (id)         => Http.patch(`${AppConfig.API.ADMIN}/users/${id}/toggle/`, {}),
    setSub:  (id, status) => Http.patch(`${AppConfig.API.ADMIN}/users/${id}/subscription/`, { subscription_status: status }),
  },

  // Admins — register via auth endpoint, then mark role on backend
  admins: {
    create: (body) => Http.post(`${AppConfig.API.AUTH}/register/client/`, body),
  },

  // Global app settings (free vs plans mode)
  settings: {
    get:    ()      => Http.get(`${AppConfig.API.ADMIN}/settings/`),
    update: (body)  => Http.patch(`${AppConfig.API.ADMIN}/settings/`, body),
  },
};
