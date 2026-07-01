// Point d'entrée du backend : charge .env, teste la connexion MySQL (Sequelize), puis démarre Express.
import 'dotenv/config';
import app from './app.js';
import sequelize from './config/database.js';

const PORT = process.env.PORT || 3000;

async function startServer() {

    try {
        await sequelize.authenticate();

        console.log('Connexion à la DB mysql : ok');

        app.listen(PORT, () => {
            console.log(`Server demarré sur http://localhost:${PORT}`);
        })

    } catch (error) {

        console.error('Erreur de connexion à la DB:', error.message);

        process.exit(1)
        
    }
}

startServer();