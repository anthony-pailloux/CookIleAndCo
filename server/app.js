// Construit l app Express. Session, CORS, puis les URLs /api.
import express from 'express';
import compression from 'compression';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectSessionSequelize from 'connect-session-sequelize';

import sequelize from './config/database.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import originRoutes from './routes/originRoutes.js';
import mealTypeRoutes from './routes/mealTypeRoutes.js';
import captchaRoutes from './routes/captchaRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js';
import planningRoutes from './routes/planningRoutes.js';
import shoppingListRoutes from './routes/shoppingListRoutes.js';
import recipeViewRoutes from './routes/recipeViewRoutes.js';
import adminStatsRoutes from './routes/adminStatsRoutes.js';
import { createServeClient } from './controllers/spaController.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Gzip du HTML, JS, CSS, JSON et SVG. Les images déjà compressées sont ignorées.
app.use(compression());

app.use(express.json());

// Le front a le droit d appeler l API (cookie compris)
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // le cookie voyage avec la requete
}));

const cookieSecure = process.env.COOKIE_SECURE === 'true';

app.set('trust proxy', 1);

// Sessions en base MySQL, pendant 1 heure (cookie et ligne SQL)
const sessionDurationMs = 60 * 60 * 1000;
const SequelizeStore = connectSessionSequelize(session.Store);
const sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'sessions',
    expiration: sessionDurationMs,
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: cookieSecure,
        maxAge: sessionDurationMs,
    },
}));

app.get('/api/health', (req, res) => {
    res.json({ status: 'Route GET /api/health / Connecter' });
});

// Noms de fichiers uniques (Date.now) : cache 7 jours, même URL.
const uploadsMaxAgeMs = 7 * 24 * 60 * 60 * 1000;
app.use('/uploads', express.static('uploads', {
    maxAge: uploadsMaxAgeMs,
}));

// Chaque URL /api pointe vers un fichier dans routes/
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/origins', originRoutes);
app.use('/api/mealTypes', mealTypeRoutes);
app.use('/api/captcha', captchaRoutes);
app.use('/api/plannings', planningRoutes);
app.use('/api/shopping-lists', shoppingListRoutes);
app.use('/api/recipe-views', recipeViewRoutes);
app.use('/api/admin/stats', adminStatsRoutes);

// Avant le fichier statique, sinon client/dist/sitemap.xml gagne
app.use(sitemapRoutes);

// En prod, Express sert aussi le site React compile
const clientDistPath = path.join(dirname, '../client/dist');
const indexHtmlPath = path.join(clientDistPath, 'index.html');
const hasClientBuild = fs.existsSync(indexHtmlPath);

// Fichiers hashés Vite : cache long. index.html : pas de cache long.
function setClientStaticHeaders(res, filePath) {
    const normalizedPath = filePath.split('\\').join('/');

    if (normalizedPath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (normalizedPath.endsWith('/index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
    }
}

if (hasClientBuild) {
    app.use(express.static(clientDistPath, {
        // GET / ne doit plus être répondu ici pour que serveClient injecte l'accueil.
        index: false,
        setHeaders: setClientStaticHeaders,
    }));
    app.use(createServeClient(indexHtmlPath));
}

// 404 puis gestion des erreurs
app.use(notFound);
app.use(errorHandler);

export default app;