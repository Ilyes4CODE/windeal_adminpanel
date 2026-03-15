// js/api/http.js
const Http = {
  async request(method, endpoint, body = null, isMultipart = false) {
    const url     = AppConfig.BASE_URL + endpoint;
    const headers = {};

    if (Store.token) headers["Authorization"] = `Bearer ${Store.token}`;
    headers["Accept-Language"] = I18n.current;

    if (!isMultipart && body) headers["Content-Type"] = "application/json";

    const options = { method, headers };
    if (body) options.body = isMultipart ? body : JSON.stringify(body);

    try {
      const res  = await fetch(url, options);
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      return { ok: false, status: 0, data: { message: I18n.t("error_generic") } };
    }
  },

  get(endpoint)               { return this.request("GET",    endpoint); },
  post(endpoint, body)        { return this.request("POST",   endpoint, body); },
  patch(endpoint, body)       { return this.request("PATCH",  endpoint, body); },
  delete(endpoint)            { return this.request("DELETE", endpoint); },
  postForm(endpoint, formData){ return this.request("POST",   endpoint, formData, true); },
  patchForm(endpoint, formData){ return this.request("PATCH", endpoint, formData, true); },
};
