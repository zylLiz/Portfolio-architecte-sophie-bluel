console.log("Fichier JS bien chargé !");

// Sélectionne le formulaire dasn la page
const form = document.querySelector("form");

if (!form) {
  console.error("Le formulaire n'a pas été trouvé dans le DOM !");
} else {
  form.addEventListener("submit", async function (event) {
    event.preventDefault(); // Empêche le rechargement 

// Récupération des valeurs du formulaire
const email = document.querySelector("#email").value;
const password = document.querySelector("#password").value;

console.log("Tentative de connexion avec :", email);

try {
    const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    const data = await response.json();
    console.log("Réponse de l'API :", data);

    if (response.ok) {
        //Connexion réussie
        console.log("Connexion réussie !", data);
        localStorage.setItem("token", data.token);
        window.location.href = "index.html"; 
    } else {
        //Connexion échouée
        alert("Erreur : " + data.message); //message retourné par l'API
    }

    } catch (error) {
        console.error("Erreur lors de la requête :", error);
        alert("Une erreur s'est produite. Veuillez réessayé plus tard.");
    }
});

}


