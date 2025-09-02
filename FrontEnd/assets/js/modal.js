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

/* Ajout : éléments de la vue Ajout*/
const addForm = document.getElementById("add-photo-form");
const addImageInput = document.getElementById("add-image");
const addPreview = document.getElementById("add-preview");
const addPlaceholder = document.getElementById("add-placeholder");
const addTitle = document.getElementById("add-title");
const addCategory = document.getElementById("add-category");
const addSubmit = document.getElementById("add-submit");
const backBtn = document.getElementById("back-to-gallery");

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

/* ===================================================
   4.2 Vue Ajout Photo — logique JS
   =================================================== */
/* AJOUT: Reset complet du formulaire d'ajout photo*/
function resetAddForm() {
  if (!addForm) return;
  addForm.reset(); //vide champs "titre + select"

  //reset image preview
  if (addPreview) {
    addPreview.src = "";
    addPreview.classList.add("hidden");
  }

  //Réaffiche le placeholder
  if (addPlaceholder) {
    addPlaceholder.classList.remove("hidden");
  }

  //bouton "Valider/désactiver"
  if (addSubmit) {
    addSubmit.disabled = true;
  }
}

   /* AJOUT : Charger les catégories depuis l’API */
async function  loadCategories() {
  if (!addCategory) return; //garde-fou

  try {
    const res = await fetch("http://localhost:5678/api/categories");
    if (!res.ok) throw new Error(`GET /categories ${res.status}`);

    const categories = await res.json();

    //Reset + placeholder :  on vide d’abord le select pour éviter les doublons
    addCategory.innerHTML = "";

    //Ajout d'une option par défaut
    const defaultOp = document.createElement("option");
    defaultOp.value = "";
    defaultOp.disabled = true;
    defaultOp.selected = true;
    defaultOp.textContent = "- Choisir -";
    addCategory.appendChild(defaultOp);

    //Injecter les options (ajout des vraies catégories)
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      addCategory.appendChild(opt);
    });

  } catch (err) {
    console.error("[modal] Erreur chargement catégories :", err);   
  }
  
}   

/* Aperçu image quand un fichier est choisi */
addImageInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  //Vérif rapide du poids (4 Mo max)
  if (file.size > 4 * 1024 * 1024) {
    alert("Image trop lourde (max 4 Mo).");
    addImageInput.value = "";
    checkFormValidity();
    return;
  }

  //Générer l'aperçu
  const reader = new FileReader();
  reader.onload = (ev) => {
    addPreview.src = ev.target.result;
    addPreview.classList.remove("hidden");
    addPlaceholder.classList.add("hidden"); //masque le bloc+Ajouter
    checkFormValidity(); //vérifie si on active "valider"
  };
  reader.readAsDataURL(file);
});

/* Validation dynamique (active/désactive le bouton "valider")*/
function checkFormValidity() {
  if (!addSubmit) return;
  const hasImage = !! (addImageInput && addImageInput.files && addImageInput.files.length > 0);

  const valid =
  hasImage &&
  (addTitle?.value.trim() !== "") &&
  (addCategory?.value && addCategory.value !== "");

  addSubmit.disabled = !valid; //si pas valide → désactivé
}

/* Branche les champs texte/select sur la validation*/
[addTitle, addCategory].forEach(el =>
  el?.addEventListener("input", checkFormValidity)
);

/* Bouton retour vers Galerie */
backBtn?.addEventListener("click", (e) => {
  e.preventDefault();

  // reset complet (champs texte, select, fichier, preview)
  resetAddForm();
  if (addImageInput) addImageInput.value = ""; // FIX : reset du file input

  // revient à la vue Galerie
  showView(viewGallery);
});

/* Initialiser la vue Ajout quand on y bascule*/
function initAddView() {
  resetAddForm();    // FIX : utilise la fonction utilitaire
  loadCategories();  // recharge les catégories
}


/* ===================================================
   4.3 Soumission du formulaire d'ajout photo (POST API)
   =================================================== */

// Nouveau : sélection du message d'erreur
const addError = document.getElementById("add-error");
const addSuccess = document.getElementById("add-success");  

/* AJOUT : écoute l’événement "submit" du formulaire */
addForm?.addEventListener("submit", async (e) => {
  e.preventDefault(); //évite le chargement de page

  //Masquer message au début
  if (addError) addError.classList.add("hidden");
  if (addSuccess) addSuccess.classList.add("hidden");
  

  //---Vérification de base---
  if(!addImageInput.files[0] || !addTitle.value.trim() || !addCategory.value) {
    if (addError) {
      addError.textContent = "⚠️ Merci de remplir tous les champs et d'ajouter une image.";
      addError.classList.remove("hidden");
    }
    return; // on bloque ici si formulaire incomplet
  }

  // ---Péparation de la requête (données au format FormData (multipart/form-data) ---
  //On utilise FormData pour envoyer un fichier + texte
const formData = new FormData();
  formData.append("image", addImageInput.files[0]); //image binaire
  formData.append("title", addTitle.value.trim());  //titre
  formData.append("category", addCategory.value);  //catégorie (id numérique)

  try {
    // ---Récupération du "Token" pour l'authentification ---
    const token = localStorage.getItem("token");
    if (!token) {
     alert("Non autorisé, vous devez être connecté.");
      return;
    }

    // ---Envoi de la requête POST à l'API ---
    const res = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}` //authentification indispensable
      // Ne PAS mettre de "Content-type" → laissé à FormData  
      },
      body: formData
    });

    // ---Gestion des erreurs ---
     if (!res.ok) {
      if (res.status === 400 && addError) {
        addError.textContent = " Formulaire incomplet ou invalide.";
        addError.classList.remove("hidden");
      } else if (res.status === 401) {
        alert("Non autorisé : reconnectez-vous.");
      } else {
        alert(`Erreur ${res.status} lors de l'ajout.`);
      }
      return;
    }

    // --- Succès : on récupère le nouvel objet Work renvoyé par l'API ---
    const newWork = await res.json();
    

    //--Mettre à jour la source locale ---
    if (Array.isArray(window.allWorks)) {
      window.allWorks.push(newWork);
    }

    // --- Rafraîchir la galerie principale + galerie modale ---
    if (typeof displayWorks === "function") {
      displayWorks(window.allWorks);
    }
    renderModalGallery();

    // AJOUT : message succès (vert)
     if (addSuccess) {
      addSuccess.textContent = "Projet ajouté avec succès !";
      addSuccess.classList.remove("hidden");
    }
     
     // Reset du formulaire après succès
    resetAddForm();

    // Option UX : cacher message après 2 secondes et revenir galerie
    setTimeout(() => {
      if (addSuccess) addSuccess.classList.add("hidden");
      showView(viewGallery);
    }, 2000);

  } catch (err) {
    console.error("Erreur réseau lors de l'ajout :", err);
    if (addError) {
      addError.textContent = "Impossible d'ajouter le projet (connexion ?)";
      addError.classList.remove("hidden");
    }
  }  
});


/* ===================================================
   ÉTAPE 5 : Événements d’ouverture/fermeture
   =================================================== */
openModalBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  openModal();
});

closeModalBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  closeModal();
});

/* AJOUT : bouton "Ajouter une photo" → bascule vers vue Ajout + init */
btnAddPhoto?.addEventListener("click", (e) => {
    e.preventDefault();
    showView(viewAdd);
    loadCategories(); /* ajout init*/
});

// Ferme si clic sur le fond assombri (en-dehors du panneau)
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

