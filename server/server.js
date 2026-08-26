// Demarre l API. D abord on teste MySQL, ensuite on ecoute le port.
import 'dotenv/config';
import './models/index.js';
import app from './app.js';
import sequelize from './config/database.js';

const PORT = process.env.PORT || 3000;

async function startServer() {

    try {
        await sequelize.authenticate();
        console.log('Connexion à la DB mysql : ok');

        // Chez o2switch, Passenger choisit le port tout seul
        if (typeof PhusionPassenger !== 'undefined') {
            app.listen('passenger');
            console.log('Server démarré via Passenger');
        } else {
            app.listen(PORT, () => {
                console.log(`Server démarré sur http://localhost:${PORT}`);
            });
        }

    } catch (error) {

        console.error('Erreur de connexion à la DB:', error.message);

        process.exit(1);

    }
}

startServer();