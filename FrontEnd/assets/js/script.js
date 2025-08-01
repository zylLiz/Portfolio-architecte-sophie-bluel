console.log("Hello, World!");

// Sélectionne l'élément HTML avec la classe .gallery
const gallery = document.querySelector(".gallery");
console.log("Élément .gallery trouvé :", gallery);

// Fonction asynchrone qui va charger les projets depuis le backend
async function loadWorks() {
  try {
    console.log("Récupération des projets depuis l'API...");

    // Appel de l'API avec fetch
    const response = await fetch("http://localhost:5678/api/works");
    console.log("Réponse brute de l'API :", response);

    // Conversion des données en JSON exploitable
    const works = await response.json();
    console.log("Données JSON récupérées :", works);

    // Vide la galerie avant d'ajouter du contenu
    gallery.innerHTML = "";

    // Parcours du tableau de projets
    works.forEach(work => {
      console.log("Création d’un projet :", work.title);

       // Création des éléments HTML
      const figure = document.createElement("figure");

      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;

      const caption = document.createElement("figcaption");
      caption.textContent = work.title;

      // Ajout des éléments dans le DOM
      figure.appendChild(img);
      figure.appendChild(caption);
      gallery.appendChild(figure);

       console.log("Projet ajouté à la galerie :", work.title);
    });

    console.log("Tous les projets ont été chargés !");
  } catch (error) {
    console.error("Erreur lors du chargement des travaux :", error);
  }
}

// Appelle la fonction pour charger les projets au démarrage
loadWorks();
