//3.1_Sélectionne les éléments DOM nécessaires
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("modal-close");
const openModalBtn = document.getElementById("edit-button"); // <-- bouton "modifier"

// Garde-fous
if (!modal) console.warn("[modal] #modal introuvable");
if (!closeModalBtn) console.warn("[modal] #modal-close introuvable");
if (!openModalBtn) console.warn("[modal] #edit-button introuvable (bouton d'ouverture)");

// Helpers d’ouverture/fermeture
function openModal() {
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", onKeyDown);
}

function closeModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", onKeyDown);
}

function onKeyDown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    closeModal();
  }
}

// Événements
openModalBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  openModal();
});

closeModalBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  closeModal();
});

// Ferme si clic sur le fond assombri (en-dehors du panneau)
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

