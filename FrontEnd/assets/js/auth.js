//3-Fonction appelé après une connexion réussie
function handleLoginSuccess() {
    //Affiche le bandeau noir
    document.getElementById('black-header')?.classList.remove('hidden');

    //Change "login" en "logout"
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.textContent = 'logout';
    }

    //Affiche aussi le "bouton modifier" (si présent)
    const editBtn = document.getElementById('edit-button');
    if (editBtn) {
        editBtn.style.display = 'inline-flex';
    }

    //Masque les filtres (si présents)
    document.getElementById('filters-section')?.classList.add('hidden');
}

//Vérifie à chaque chargement si l'utilisateur est connecté
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); 

    if (token) {
        handleLoginSuccess();

        //Gère la déconnexion
        const loginLink = document.getElementById('login-link');
        loginLink?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            location.reload();
        });
    }
});

//rajouter un traitement faire afficher le "boutton modifier" (creer class avec propiete display block ou flex)