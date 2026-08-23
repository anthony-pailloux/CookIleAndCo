// App express : middlewares, session, routes API, 404.
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fileStoreFactory from 'session-file-store';

import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import originRoutes from './routes/originRoutes.js';
import mealTypeRoutes from './routes/mealTypeRoute.js';
import captchaRoutes from './routes/captchaRoutes.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());

// autorise le front à appeler l'api
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // autorise les cookies
}));

const cookieSecure = process.env.COOKIE_SECURE === 'true';

app.set('trust proxy', 1);

// store + middleware session
const sessionDurationSeconds = 1 * 60 * 60;
const sessionsPath = path.join(dirname, 'sessions');
const FileStore = fileStoreFactory(session);
const sessionStore = new FileStore({
    path: sessionsPath,
    ttl: sessionDurationSeconds,
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
        maxAge: sessionDurationSeconds * 1000,
    },
}));

app.get('/api/health', (req, res) => {
    res.json({ status: 'Route GET /api/health / Connecter' });
});

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/origins', originRoutes);
app.use('/api/mealTypes', mealTypeRoutes);
app.use('/api/captcha', captchaRoutes);

// Front React buildé (prod) static + fallback SPA pour React Router
const clientDistPath = path.join(dirname, '../client/dist');
const indexHtmlPath = path.join(clientDistPath, 'index.html');
const hasClientBuild = fs.existsSync(indexHtmlPath);

if (hasClientBuild) {
    app.use(express.static(clientDistPath));

    app.use((req, res, next) => {
        if (req.method !== 'GET') {
            next();
        } else if (req.path.startsWith('/api')) {
            next();
        } else {
            res.sendFile(indexHtmlPath);
        }
    });
}

// 404 puis gestion des erreurs
app.use(notFound);
app.use(errorHandler);

export default app;