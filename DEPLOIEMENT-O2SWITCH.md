# Déploiement o2switch — Cook'île & Co

Guide complet pour mettre en ligne et mettre à jour l'application sur **o2switch** (hébergement mutualisé), avec **Git**, **Node.js (Passenger)** et **MySQL**.

---

## Architecture sur le serveur

Sur o2switch, le **dossier domaine** et le **code source** sont séparés (comme pour d'autres projets sur le même compte) :

```text
/home/UTILISATEUR/
├── cookileandco.fr/          → dossier domaine (souvent quasi vide : api/, cgi-bin/, SSL…)
├── CookIleAndCo/             → dépôt Git cloné (client/, server/, …)  ← code ici
└── …
```

| Élément | Emplacement | Dans Git ? |
|---------|-------------|------------|
| Code source | `~/CookIleAndCo/` | Oui |
| `.env` prod | `~/CookIleAndCo/server/.env` | **Non** |
| Build React | `~/CookIleAndCo/client/dist/` | **Non** (`.gitignore`) |
| Photos uploadées | `~/CookIleAndCo/server/uploads/` | **Non** |

L'application Node (cPanel) pointe vers **`CookIleAndCo/server`** — pas vers `cookileandco.fr/`.

**Dépôt GitHub :** `https://github.com/anthony-pailloux/CookIleAndCo.git`

---

## Prérequis

- Compte o2switch avec **Node.js** activé (cPanel → **Setup Node.js App**)
- Base **MySQL** créée dans cPanel (ex. `paan3854_cookileandco`)
- Utilisateur MySQL avec **tous les droits** sur cette base
- Accès **SSH** au serveur
- Code **commité et pushé** sur GitHub depuis le PC

---

## Partie 1 — Premier déploiement

### 1.1 — Pousser le code depuis le PC (Windows / Laragon)

```powershell
cd C:\laragon\www\PFA\Cookîleandco
git add .
git commit -m "deploy: mise en prod"
git push
```

> **Important :** c'est **`git push`** qui envoie vers GitHub. Un `git pull` sur le PC ne met rien en ligne.

---

### 1.2 — Cloner le dépôt sur o2switch (SSH)

```bash
cd ~
git clone https://github.com/anthony-pailloux/CookIleAndCo.git CookIleAndCo
```

Ne pas cloner dans `~/cookileandco.fr/` — ce dossier est réservé au domaine web.

---

### 1.3 — Configurer le backend

```bash
cd ~/CookIleAndCo/server
npm install
```

Créer le fichier **`server/.env`** (jamais commité). Exemple pour la prod :

```env
PORT=3000

CLIENT_URL=https://www.cookileandco.fr

DB_HOST=localhost
DB_PORT=3306
DB_NAME=paan3854_cookileandco
DB_USER=paan3854_cookileandco
DB_PASSWORD=ton_mot_de_passe_mysql

SESSION_SECRET=une_longue_chaine_aleatoire_32_caracteres_minimum

COOKIE_SECURE=true

ADMIN_EMAIL=ton_email_admin
ADMIN_PASSWORD=ton_mot_de_passe_admin
```

| Variable | Rôle |
|----------|------|
| `CLIENT_URL` | CORS — **doit correspondre à l'URL réelle** (avec ou sans `www`) |
| `DB_*` | Connexion MySQL o2switch (préfixe `paan3854_` typique) |
| `SESSION_SECRET` | Secret des sessions Express |
| `COOKIE_SECURE` | **`true`** en HTTPS prod |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Compte admin créé par le seeder |

**Édition en SSH :**

```bash
nano ~/CookIleAndCo/server/.env
```

> **Attention :** ne pas réutiliser un `.env` d'un autre projet (ex. Laravel / GunShotAim). Cook'île & Co utilise `DB_NAME`, `DB_USER`, `DB_PASSWORD` — pas `DB_DATABASE` / `DB_USERNAME`.

---

### 1.4 — Migrations et données initiales

```bash
cd ~/CookIleAndCo/server
npm run db:migrate
node --env-file=.env ./node_modules/sequelize-cli/lib/sequelize db:seed:all
```

Le seeder admin crée le compte défini par `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

### 1.5 — Build du frontend

Le dossier `client/dist/` n'est **pas** versionné. Il faut builder **sur le serveur** :

```bash
cd ~/CookIleAndCo/client
npm install
VITE_API_URL="" npm run build
```

`VITE_API_URL` vide → le front appelle `/api/...` sur le **même domaine** (Express sert le build).

**Équivalent PowerShell (build local de test prod) :**

```powershell
cd client
$env:VITE_API_URL=""
npm run build
```

---

### 1.6 — Créer l'application Node.js (cPanel)

1. cPanel → **Setup Node.js App** (ou **Application Node.js**)
2. **CRÉER UNE APPLICATION**

| Champ | Valeur |
|-------|--------|
| Version Node.js | **22.x** (ou la plus récente dispo, ex. 22.23.0) |
| Mode | **Production** |
| Racine de l'application | `CookIleAndCo/server` |
| URL de l'application | `cookileandco.fr` |
| Fichier de démarrage | `server.js` |

3. **Exécuter NPM Install** (optionnel si déjà fait en SSH)
4. **CREATE** puis **REDÉMARRER**

Les variables d'environnement dans cPanel peuvent rester vides : le fichier **`server/.env`** suffit (`dotenv` au démarrage).

**Commande d'environnement virtuel** (affichée dans cPanel, utile pour le debug) :

```bash
source /home/UTILISATEUR/nodevenv/CookIleAndCo/server/22/bin/activate && cd /home/UTILISATEUR/CookIleAndCo/server
```

(Remplacer `UTILISATEUR` par l'identifiant o2switch, ex. `paan3854`.)

---

### 1.7 — Vérifications

| Test | URL attendue |
|------|----------------|
| API | `https://www.cookileandco.fr/api/health` → `{"status":"Route GET /api/health / Connecter"}` |
| Accueil | `https://www.cookileandco.fr` |
| Admin | `https://www.cookileandco.fr/connexion-superadmin` |

Identifiants admin : valeurs de `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans `server/.env`.

**En SSH :**

```bash
curl -s https://www.cookileandco.fr/api/health
```

---

## Partie 2 — Mises à jour (déploiement suivant)

À chaque modification déployée :

### 2.1 — Sur le PC

```powershell
cd C:\laragon\www\PFA\Cookîleandco
git add .
git commit -m "description des changements"
git push
```

### 2.2 — Sur o2switch (SSH)

```bash
cd ~/CookIleAndCo
git pull
```

**Si le frontend a changé** (`client/`) :

```bash
cd ~/CookIleAndCo/client
VITE_API_URL="" npm run build
```

**Si de nouvelles migrations existent** (`server/migrations/`) :

```bash
cd ~/CookIleAndCo/server
npm run db:migrate
```

**Si de nouvelles dépendances** (`package.json` modifié) :

```bash
cd ~/CookIleAndCo/server && npm install
cd ~/CookIleAndCo/client && npm install
```

### 2.3 — Redémarrer l'application

cPanel → **Setup Node.js App** → application Cook'île & Co → **REDÉMARRER**

> **`git pull`** se fait dans **`~/CookIleAndCo`**, jamais dans **`~/cookileandco.fr`**.

---

## Partie 3 — HTTPS et domaine

- Utiliser l'URL qui affiche le **cadenas vert** (souvent **`https://www.cookileandco.fr`**).
- Aligner **`CLIENT_URL`** dans `server/.env` sur cette URL exacte.
- Dans cPanel → **SSL/TLS** : activer le certificat pour **`cookileandco.fr`** et **`www.cookileandco.fr`**, et **Force HTTPS** si disponible.
- Avec `COOKIE_SECURE=true`, la connexion admin **ne fonctionne qu'en HTTPS**.

---

## Partie 4 — Dépannage

### Erreur Passenger (« something went wrong »)

L'app Node ne démarre pas. Diagnostic en SSH :

```bash
source /home/UTILISATEUR/nodevenv/CookIleAndCo/server/22/bin/activate
cd ~/CookIleAndCo/server
node server.js
```

**Attendu :**

```text
Connexion à la DB mysql : ok
Server démarré via Passenger
```

(En SSH sans Passenger, le message peut être `Server démarré sur http://localhost:3000` — c'est normal.)

Puis **Ctrl+C**, **REDÉMARRER** dans cPanel.

Consulter aussi les logs dans cPanel (Node.js app → logs / stderr).

---

### `Access denied for user ''@'localhost'`

- `.env` absent, mal formaté, ou variables `DB_*` vides / incorrectes.
- Vérifier : `grep "^DB_" ~/CookIleAndCo/server/.env`

---

### `git pull` → « Déjà à jour » mais le correctif manque

Le commit n'a pas été **pushé** depuis le PC. Refaire `git push`, puis `git pull` sur le serveur.

---

### Build front : `Could not resolve '../components/button'`

**Linux est sensible à la casse.** Le fichier est `Button.jsx` (B majuscule), pas `button.jsx`.

Corriger les imports en local, tester :

```powershell
$env:VITE_API_URL=""
npm run build
```

Puis commit, push, pull, rebuild sur le serveur.

---

### `TypeError: model.associate is not a function`

Dans `server/models/index.js`, la condition doit être :

```js
if (typeof model.associate === 'function') {
    model.associate(models);
}
```

Et **pas** `if (typeof model.associate)` — `typeof` renvoie la chaîne `'undefined'`, qui est truthy en JavaScript.

---

### Le site répond mais pas les données / login admin

- `CLIENT_URL` incorrect dans `.env`
- `COOKIE_SECURE=true` mais accès en HTTP
- Build front absent : relancer `VITE_API_URL="" npm run build`
- CORS : vérifier que l'URL du navigateur = `CLIENT_URL`

---

### Avertissement `MemoryStore` au démarrage

Message Express-session en prod (« not designed for a production environment »). Non bloquant pour le PFA v1 ; amélioration possible en v2 (store Redis ou MySQL).

---

## Partie 5 — Ce que Git ne synchronise pas

| Fichier / dossier | Action manuelle |
|-------------------|-----------------|
| `server/.env` | Créer / éditer sur le serveur uniquement |
| `client/dist/` | `VITE_API_URL="" npm run build` après chaque déploiement front |
| `server/uploads/` | Photos prod restent sur le serveur ; sauvegarder avant migration majeure |

---

## Récapitulatif — checklist premier déploiement

- [ ] `git push` depuis le PC
- [ ] `git clone` dans `~/CookIleAndCo`
- [ ] `npm install` dans `server/` et `client/`
- [ ] `server/.env` prod (MySQL o2switch, `CLIENT_URL`, `COOKIE_SECURE=true`)
- [ ] `npm run db:migrate` + seeder admin
- [ ] `VITE_API_URL="" npm run build` dans `client/`
- [ ] App Node cPanel : root `CookIleAndCo/server`, startup `server.js`, mode Production
- [ ] **REDÉMARRER** l'app Node
- [ ] Test `/api/health`, accueil, connexion admin en **HTTPS**

---

## Récapitulatif — checklist mise à jour

- [ ] `git push` (PC)
- [ ] `git pull` dans `~/CookIleAndCo` (o2switch)
- [ ] Rebuild front si `client/` modifié
- [ ] `npm run db:migrate` si nouvelles migrations
- [ ] `npm install` si `package.json` modifié
- [ ] **REDÉMARRER** dans cPanel Node

---

*Cook'île & Co — Tetelle Cook'île & Co · An Nou Ay !*
