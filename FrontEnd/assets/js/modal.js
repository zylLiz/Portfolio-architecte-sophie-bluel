//3.1_Sélectionne les éléments DOM nécessaires
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("modal-close");
const openModalBtn = document.getElementById("edit-button"); // <-- bouton "modifier"

/* AJOUT : sélection des 2 vues internes */
const viewGallery = document.getElementById("modal-view-gallery");
const viewAdd = document.getElementById("modal-view-add");
const btnAddPhoto = document.getElementById("btn-primary"); // bouton "Ajouter une photo"

// Garde-fous
if (!modal) console.warn("[modal] #modal introuvable");
if (!closeModalBtn) console.warn("[modal] #modal-close introuvable");
if (!openModalBtn) console.warn("[modal] #edit-button introuvable (bouton d'ouverture)");

/*AJOUT : fonction pour basculer entre les vues */
function showView(view) {
    [viewGallery, viewAdd].forEach(v => v?.classList.add("hidden")); // cache tout
    view?.classList.remove("hidden"); //affiche la vue demandée
}

// Helpers d’ouverture/fermeture
function openModal() {
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", onKeyDown);

/* AJOUT : réinitialiser la modale à la vue Galerie par défaut */
showView(viewGallery);
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

/* AJOUT : bouton "Ajouter une photo" → bascule vers vue Ajout */
btnAddPhoto?.addEventListener("click", (e) => {
    e.preventDefault();
    showView(viewAdd);
});

// Ferme si clic sur le fond assombri (en-dehors du panneau)
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

