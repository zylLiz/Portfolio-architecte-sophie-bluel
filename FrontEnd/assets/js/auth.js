

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
document.getElementById('edit-button')?.classList.remove('hidden');

//Masque les filtres (si présents)
document.getElementById('filters-section')?.classList.add('hidden');
}

//Vérifie à chaque chargement si l'utilisateur est connecté
document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token'); // ou localStorage

    if (token) {
        handleLoginSuccess();

        //Gère la déconnexion
        const loginLink = document.getElementById('login-link');
        loginLink?.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('token');
            location.reload();
        });
    }
});