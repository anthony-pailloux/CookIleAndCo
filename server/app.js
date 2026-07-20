// l'app express avec les routes et middlewares
import express from 'express';
import session from 'express-session';
import cors from 'cors';

import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';


const app = express();

app.use(express.json()); // lit le json des requêtes

// autorise le front à appeler l'api
app.use(cors({
    origin: process.env.CLIENT_URL, // url du front
    credentials: true, // autorise les cookies
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
    },
}));


// route de test pour voir si le serveur répond
app.get('/api/health', (req, res) => {
    res.json({ status: 'Route GET /api/health / Connecter' });
});

// route de test pour l'error handler
app.get('/api/test-error', (req, res, next) => {
    next('Erreur 500');
});

// Routes auth
app.use('/api/auth', authRoutes);

// Routes recipe
app.use('/api/recipes', recipeRoutes);

// 404 puis gestion des erreurs
app.use(notFound);
app.use(errorHandler);

export default app;