// js/components/modal.js
const Modal = {
  open(title, bodyHtml, onConfirm, confirmLabel, cancelLabel, size = "") {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").innerHTML  = bodyHtml;
    document.getElementById("modal-confirm").textContent = confirmLabel || I18n.t("save");
    document.getElementById("modal-cancel").textContent  = cancelLabel  || I18n.t("cancel");

    const overlay = document.getElementById("modal-overlay");
    overlay.className = `modal-overlay ${size}`;
    overlay.classList.add("open");

    const confirmBtn = document.getElementById("modal-confirm");
    confirmBtn.onclick = null;
    if (onConfirm) {
      confirmBtn.style.display = "";
      confirmBtn.onclick = async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        await onConfirm();
        confirmBtn.disabled = false;
        confirmBtn.textContent = confirmLabel || I18n.t("save");
      };
    } else {
      confirmBtn.style.display = "none";
    }
  },

  close() {
    document.getElementById("modal-overlay").classList.remove("open");
  },

  confirm(title, text, onYes) {
    Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1565c0",
      cancelButtonColor:  "#455a64",
      confirmButtonText:  I18n.t("yes"),
      cancelButtonText:   I18n.t("cancel"),
      background: "#1a2744",
      color: "#e3eafc",
    }).then(result => { if (result.isConfirmed) onYes(); });
  },
};
