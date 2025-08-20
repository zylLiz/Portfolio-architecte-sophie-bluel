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
   - BONUS : sinon on fait un GET API en fallback
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

/* AJOUT : rend la galerie dans la modale à partir des works + icone poubelle */
async function renderModalGallery() {
  if (!modalGallery) return;

  // reset du conteneur
  modalGallery.innerHTML = ""; //reset

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
    icon.src = "./assets/icons/Icon-poubelle.svg";             /* AJOUT : vérifie le chemin exact */
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    delBtn.appendChild(icon);

    //Clic poubelle → suppression
    delBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation(); // évite tt clic "derrière"

        const ok = await deleteWork(work.id);
        if (!ok) return; 

        //Retire la vignette tout de suite (UX fluide)
        figure.remove();

        // AJOUT: sécurise la remise en état de la grille modale
        await renderModalGallery();

        //Rafraichit la galerie principale
        if (typeof displayWorks === "function") {
            displayWorks(window.allWorks);
        } else if (typeof renderWorks === "function") {
            renderWorks(window.allWorks);
        }
    });

    // TODO (prochaine étape) : suppression API + refresh UI
    // delBtn.addEventListener("click", async () => { await deleteWork(work.id); });

    figure.appendChild(img);
    figure.appendChild(delBtn);
    modalGallery.appendChild(figure);

    });
}

/* ===================================================
   4.1 Suppression d’un work via la poubelle
   =================================================== */
/**
 * ATTENTION :
 *   - La suppression est DÉFINITIVE côté API (backend).
 *   - Une fois supprimé, le work (image + infos) disparaît
 *     de la base de données et n’est pas récupérable.
 *   - Si on veut revoir l’image, il faudra la réuploader 
 *     via la vue "Ajouter une photo".
 *
 * MINIMUM DEMANDÉ :
 *   - Suppression d’un work via DELETE /works/:id
 *   - Refresh de la modale + galerie principale
 *
 * AMÉLIORATION (BONUS, PAS OBLIGATOIRE MAIS +PROPRE) :
 *   - Gestion des erreurs API (401, 403, 404, etc.)
 *   - Message console + alert utilisateur
 */

async function deleteWork(workId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vous devez être connecté pour supprimer une image.");
            return false;
        }

        const res = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        //MINIMUM : succès API (200/204)
        if (res.ok) {
            // met à jour la source locale globale
            if (Array.isArray(window.allWorks)) {
            window.allWorks = window.allWorks.filter(w => String(w.id) !== String(workId));
        }
        return true;
    }

        //BONUS : gestion simple d'erreurs
        switch (res.status) {
            case 401: alert("Erreur 401 : non authentifié. Connectez-vous."); break;
            case 403: alert("Erreur 403 : droits insuffisants."); break;
            case 404: alert("Erreur 404 : élément introuvable."); break;
            default:  alert(`Erreur ${res.status} lors de la suppression.`);
        }
        return false;

    } catch (err) {
        console.error("[modal] Erreur réseau :", err);
        alert("Impossible de joindre le serveur.");
        return false;
    }
    
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

