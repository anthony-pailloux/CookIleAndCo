/**
 * Construit l'application Express (middlewares + routes).
 * Ne démarre pas le serveur : c'est server.js qui importe ce fichier et appelle app.listen().
 */
import express from 'express';
import cors from 'cors';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';


const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL, // origine autorisée 
    credentials: true, // le navigateur peut envoyer/recevoir des cookies
}));


// Route test — pas de try/catch : rien ne peut échouer ici
app.get('/api/health', (req, res) => {
    res.json({ status: 'Route GET /api/health / Connecter' });
});

// Route test — throw direct pour simuler une erreur vers errorHandler
app.get('/api/test-error', (req, res, next) => {
    next('Erreur 500');
});

app.use(notFound);
app.use(errorHandler);

export default app;