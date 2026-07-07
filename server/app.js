// Construit l'application Express (middlewares + routes).

import express from 'express';
import cors from 'cors';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';


const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL, // adresse du front / seule origine autorisée à appeler l'API
    credentials: true, // le navigateur peut envoyer/recevoir des cookies
}));


app.get('/api/health', (req, res) => {
    res.json({ status: 'Route GET /api/health / Connecter' });
});

app.get('/api/test-error', (req, res, next) => {
    next('Erreur 500');
});

app.use(notFound);
app.use(errorHandler);

export default app;