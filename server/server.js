// Point d'entrée du backend : charge les variables d'environnement (.env), importe l'app Express depuis app.js, puis démarre le serveur sur le port configuré.
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server demarré sur http://localhost:${PORT}`);
})