# Cook'île & Co

Application web de recettes **Tetelle Cook'île & Co** — saveurs antillaises et du monde.  

Projet réalisé dans le cadre d’un Projet de Fin d’Année. L’objectif est de mettre en valeur les recettes de Tetelle : catalogue consultable par tous, et espace d’administration pour gérer le contenu.

## Ce qui est en place

| Partie | Contenu |
|--------|---------|
| **Public** | Accueil, catalogue des recettes, fiche détail, page catégories, recherche et filtres (origine, type de repas, catégorie) |
| **Admin** | Connexion sécurisée, tableau de bord, création / modification / suppression de recettes (photo, ingrédients, étapes), gestion des catégories, origines et types de repas |
| **API** | REST JSON — recettes, catégories, origines, types de repas, authentification par session |
| **Base de données** | MySQL via Sequelize (migrations + seeders pour les données de référence et le compte admin) |

**Stack :** React + Vite (frontend) · Node.js + Express (backend) · Sequelize + MySQL · sessions `express-session`.

## Structure du dépôt

```text
Cookîleandco/
├── client/          → interface React (port 5173 en dev)
├── server/          → API Express (port 3000)
│   ├── migrations/  → schéma BDD
│   ├── seeders/     → données initiales (catégories, origines, admin…)
│   └── uploads/     → photos recettes et catégories (non versionnées)
└── documents/       → cahier des charges, maquettes, branding
```

## Prérequis

- [Laragon](https://laragon.org/) (Windows) avec **MySQL** activé
- **Node.js** (Laragon peut l’installer via *Menu → Tools → Quick add → Node.js*, ou depuis [nodejs.org](https://nodejs.org/))

## Lancer le projet avec Laragon

### 1. Démarrer Laragon

1. Ouvrir Laragon et cliquer sur **Start All** (au minimum **MySQL** doit être vert).
2. Le projet peut rester dans `C:\laragon\www\PFA\Cookîleandco` — pas besoin de virtual host pour le dev : le front et l’API tournent via Node.

### 2. Créer la base MySQL

1. Dans Laragon : **Menu → Database → Open phpMyAdmin** (ou l’icône phpMyAdmin dans Laragon).
2. Créer une base, par exemple `cookileandco` — interclassement **utf8mb4_unicode_ci** (ou utf8mb4).

### 3. Configurer le backend

Dans un terminal, à la racine du projet :

```bash
cd server
copy .env.example .env
npm install
```

Éditer `server/.env` — valeurs typiques Laragon :

```env
PORT=3000
CLIENT_URL=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=cookileandco
DB_USER=root
DB_PASSWORD=

SESSION_SECRET=une_chaine_longue_et_aleatoire

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ton_mot_de_passe_admin
```

> Laragon utilise souvent `root` sans mot de passe en local. Adapte `DB_NAME`, `ADMIN_EMAIL` et `ADMIN_PASSWORD` à ton environnement.

### 4. Migrer et peupler la base

Toujours dans `server/` :

```bash
npm run db:migrate
node --env-file=.env ./node_modules/sequelize-cli/lib/sequelize db:seed:all
```

Vérifier l’état des migrations :

```bash
npm run db:status
```

### 5. Configurer le frontend

Dans un **second** terminal :

```bash
cd client
copy .env.example .env
npm install
```

Le fichier `client/.env` contient :

```env
VITE_API_URL=http://localhost:3000
```

### 6. Démarrer les deux serveurs de développement

**Terminal 1 — API :**

```bash
cd server
npm run dev
```

Attendu : `Connexion à la DB mysql : ok` puis `Server demarré sur http://localhost:3000`.

**Terminal 2 — interface :**

```bash
cd client
npm run dev
```

Ouvrir l’URL affichée par Vite (souvent [http://localhost:5173](http://localhost:5173)).

### 7. Se connecter en admin

- URL : [http://localhost:5173/connexion-superadmin](http://localhost:5173/connexion-superadmin)
- Identifiants : ceux définis dans `ADMIN_EMAIL` / `ADMIN_PASSWORD` du `.env` serveur (créés par le seeder).

## Vérification rapide

| Test | URL |
|------|-----|
| API en ligne | [http://localhost:3000/api/health](http://localhost:3000/api/health) |
| Catalogue | [http://localhost:5173/recettes](http://localhost:5173/recettes) |
| Admin | [http://localhost:5173/admin](http://localhost:5173/admin) (après connexion) |

## Dépannage courant

- **Erreur de connexion MySQL** : MySQL Laragon démarré ? `DB_HOST`, `DB_NAME`, `DB_USER` et `DB_PASSWORD` corrects dans `server/.env` ?
- **Le front n’affiche pas les données** : l’API tourne sur le port 3000 ? `VITE_API_URL` dans `client/.env` pointe bien vers `http://localhost:3000` ?
- **Connexion admin refusée** : seeder exécuté ? Email / mot de passe identiques à ceux du `.env` serveur ?

## Scripts utiles

| Commande | Dossier | Rôle |
|----------|---------|------|
| `npm run dev` | `server/` | API avec rechargement automatique |
| `npm run dev` | `client/` | Interface React (Vite) |
| `npm run db:migrate` | `server/` | Appliquer les migrations |
| `npm run db:status` | `server/` | État des migrations |
| `npm run build` | `client/` | Build de production du frontend |
