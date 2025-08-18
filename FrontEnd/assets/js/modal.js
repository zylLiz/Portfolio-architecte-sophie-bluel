/* ===================================================
   3.1 MODALE SIMPLE + INJECTION IMAGES (source: allWorks)
   =================================================== */

//ÉTAPE 1 : Sélection des éléments DOM
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("modal-close");
const openModalBtn = document.getElementById("edit-button"); // <-- bouton "modifier"

/* AJOUT : sélection des 2 vues internes */
const viewGallery = document.getElementById("modal-view-gallery");
const viewAdd = document.getElementById("modal-view-add");
const btnAddPhoto = document.getElementById("btn-primary"); // bouton "Ajouter une photo"
const modalGallery = document.getElementById("modal-gallery");

// Garde-fous
if (!modal) console.warn("[modal] #modal introuvable");
if (!closeModalBtn) console.warn("[modal] #modal-close introuvable");
if (!openModalBtn) console.warn("[modal] #edit-button introuvable (bouton d'ouverture)");
if (!modalGallery) console.warn("[modal] #modal-gallery introuvable");

// ÉTAPE 2 : Navigation entre les vues
function showView(view) {
    [viewGallery, viewAdd].forEach(v => v?.classList.add("hidden")); // cache tout
    view?.classList.remove("hidden"); //affiche la vue demandée
}

// ÉTAPE 3 : Helpers d’ouverture/fermeture
function openModal() {
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", onKeyDown);

// AJOUT : par défaut → toujours la vue Galerie 
showView(viewGallery);

// AJOUT : charge/rafraichit les vignettes à partir des vraies données
renderModalGallery();
}

//Ferme la modale
function closeModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", onKeyDown);
}

//Ferme avec ESC
function onKeyDown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    closeModal();
  }
}

/* ===================================================
   ÉTAPE 4 : Injection des images dans la modale
   =================================================== */

/* AJOUT : utilitaire pour obtenir la source des works
   - priorité à window.allWorks (déjà rempli par script.js)
   - sinon fallback: requête API
*/
async function getWorksSource() {
  // cas normal : script.js a déjà rempli allWorks
  if (Array.isArray(window.allWorks) && window.allWorks.length > 0) {
    return window.allWorks;
  }

  // fallback (rare): si script.js n’a pas encore chargé
  try {
    const res = await fetch("http://localhost:5678/api/works");
    if (!res.ok) throw new Error(`GET /works ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[modal] Impossible de récupérer les works :", err);
    return [];
  }
}

/* AJOUT : rend la galerie dans la modale à partir des works */
async function renderModalGallery() {
  if (!modalGallery) return;

  // reset du conteneur
  modalGallery.innerHTML = "";

  const works = await getWorksSource();

  if (!Array.isArray(works) || works.length === 0) {
    modalGallery.innerHTML = "<p>Aucune image pour le moment.</p>";
    return;
  }

  works.forEach((work) => {
    const figure = document.createElement("figure"); // .modal-gallery figure { position:relative; }

    // image
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title || "";

    // bouton poubelle (overlay en haut à droite)
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "delete-icon";                  /* AJOUT : classe stylée en CSS */
    delBtn.setAttribute("aria-label", "Supprimer");

    const icon = document.createElement("img");
    icon.src = "./assets/icons/Icon-poubelle.svg";             /* AJOUT : vérifie le chemin */
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    delBtn.appendChild(icon);

    // TODO (prochaine étape) : suppression API + refresh UI
    // delBtn.addEventListener("click", async () => { await deleteWork(work.id); });

    figure.appendChild(img);
    figure.appendChild(delBtn);
    modalGallery.appendChild(figure);

    });
}


// ÉTAPE 5 : Événements d’ouverture/fermeture
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

