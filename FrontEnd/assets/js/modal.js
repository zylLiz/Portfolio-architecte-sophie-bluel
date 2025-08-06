//3.1_Sélectionne les éléments DOM nécessaires
const modal = document.getElementById("modal");
const openModalBtn = document.querySelector(".modifier-btn"); //Adaptable si besoin
const closeModalBtn = document.getElementById("modal-close");

//Vérifie si le bouton d'ouverture est présent avant d'attacher l'évènement
if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
        modal.classList.remove("hidden"); //Affiche la modale
    });
}

//Fermeture de la modale quand on clique sur la croix
closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden"); //cache la modale
});

//Fermer la modale en cliquant en dehors du contenu
modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.add("hidden");
    }
});
