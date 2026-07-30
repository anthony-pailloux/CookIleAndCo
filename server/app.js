// l'app express avec les routes et middlewares
import express from 'express';
import session from 'express-session';
import cors from 'cors';

import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import originRoutes from './routes/originRoutes.js';
import mealTypeRoutes from './routes/mealTypeRoute.js';


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

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/origins', originRoutes);
app.use('/api/mealTypes', mealTypeRoutes);



// 404 puis gestion des erreurs
app.use(notFound);
app.use(errorHandler);

export default app;