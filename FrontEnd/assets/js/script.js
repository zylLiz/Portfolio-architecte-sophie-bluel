console.log("Hello, World!");

// Sélectionne l'élément HTML avec la classe .gallery
const gallery = document.querySelector(".gallery");
if (!gallery) {
  console.error("[script] .gallery introuvable dans le DOM.");
}

/*AJOUT: on rend le tableau global pour que modal.js puisse le lire/mettre à jour*/
window.allWorks = [];

// Fonction asynchrone qui va charger les projets depuis le backend
//async function loadWorks() {
  //try {
    //console.log("Récupération des projets depuis l'API...");

    // Appel de l'API avec fetch
    //const response = await fetch("http://localhost:5678/api/works");
    //console.log("Réponse brute de l'API :", response);

    // Conversion des données en JSON exploitable
    //const works = await response.json();
    //console.log("Données JSON récupérées :", works);

    // Vide la galerie avant d'ajouter du contenu
    //gallery.innerHTML = "";

    // Parcours du tableau de projets
    //works.forEach(work => {
      //console.log("Création d’un projet :", work.title);

       // Création des éléments HTML
      //const figure = document.createElement("figure");

      //const img = document.createElement("img");
      //img.src = work.imageUrl;
      //img.alt = work.title;

     // const caption = document.createElement("figcaption");
      //caption.textContent = work.title;

      // Ajout des éléments dans le DOM
      //figure.appendChild(img);
      //figure.appendChild(caption);
      //gallery.appendChild(figure);

      // console.log("Projet ajouté à la galerie :", work.title);
   //});

    //console.log("Tous les projets ont été chargés !");
  //} catch (error) {
   // console.error("Erreur lors du chargement des travaux :", error);
  //}
//}

// Appelle la fonction pour charger les projets au démarrage
//loadWorks();

////////////////////////////////////////////////////

//Conteneur des filtres
const filtersContainer = document.querySelector(".filters");

//Données globales des projets
//let allWorks = [];

//Fonction d'affichage des projets (réutilisable pour les filtres)
function displayWorks(works) {
    gallery.innerHTML = "";
    works.forEach(work => {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const caption = document.createElement("figcaption");
        caption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
    });    
}

// Nouvelle version unique loadWorks

// Fonction principale de chargement (modifiée pour stocker allWorks)
async function loadWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();

    window.allWorks = works; // <- Ajout "window" stock global (utilisé aussi dans modal.js)

    displayWorks(window.allWorks); // Affiche Galerie Principale (+ajout: window)
    generateFilters(); // Et on génère les filtres dynamiques après affichage
  } catch (error) {
    console.error("Erreur lors du chargement des travaux :", error);
  }
}

// Fonction pour créer les boutons de filtre
function generateFilters() {
    filtersContainer.innerHTML = ""; // Evite les doublons

    //CORRIGER: window.allWorks
  const categories = [...new Set(window.allWorks.map(work => work.category.name))];

  // Crée et ajoute le boutton "Tous"
  const allBtn = document.createElement("button");
  allBtn.textContent = "Tous";
  allBtn.classList.add("filter-btn", "active");
  filtersContainer.appendChild(allBtn);

   allBtn.addEventListener("click", () => {
    setActiveFilter(allBtn);
    displayWorks(window.allWorks); // ajout: window
  });

   // Crée les boutons pour chaque catégorie unique
  categories.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category;
    btn.classList.add("filter-btn");
    filtersContainer.appendChild(btn);

      btn.addEventListener("click", () => {
      setActiveFilter(btn);
      const filtered = window.allWorks.filter(work => work.category.name === category); //Ajout: window
      displayWorks(filtered);
    });
  });
}

// Fonction utilitaire pour gérer l'état actif des boutons
function setActiveFilter(activeBtn) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

// Appel au chargement
loadWorks();