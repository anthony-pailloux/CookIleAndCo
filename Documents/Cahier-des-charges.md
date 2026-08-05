# Cahier des charges
## Application web — Cook'île & Co

| | |
|---|---|
| **Projet** | Tetelle Cook'île & Co |
| **Objet** | Spécification fonctionnelle de l'application de recettes |
| **Client** | Tetelle |
| **Réalisation** | Anthony Pailloux |
| **Date** | août 2026 |
| **Maquettes et Wireframe** | `/Documents/wireframes et /Documents/maquettes` |
| **Modèle de données** | `/Documents/mcd.png` |

---

## 1. Contexte et objectifs

Cook'île & Co est une application web de recettes culinaires mettant en avant la cuisine antillaise et des saveurs du monde.

**Objectifs :**
- permettre au public de consulter le catalogue et les fiches recettes sans créer de compte ;
- permettre à l'équipe d'administration de gérer le contenu (recettes, référentiels) ;
- offrir le partage des recettes et la possibilité de laisser un commentaire sur une fiche.

**Hors périmètre :** inscription du grand public, espace profil utilisateur, planning de repas, liste de courses.

---

## 2. Identité affichée

| Élément | Contenu |
|---|---|
| Marque | Cook'île & Co |
| Accroche | *An Nou Ay !* |
| Positionnement | Des Antilles aux saveurs du monde |
| Pied de page | © 2026 Tetelle Cook'île & Co |

Charte visuelle : thème Madras (réf. `documents/branding/colors.css`).

---

## 3. Acteurs et droits

Deux acteurs.

| Fonctionnalité | Visiteur | Administrateur |
|---|:---:|:---:|
| Consulter l'accueil, le catalogue, les fiches, les catégories | Oui | Oui |
| Rechercher et filtrer les recettes | Oui | Oui |
| Partager une recette | Oui | Oui |
| Publier un commentaire (avec captcha) | Oui | Oui |
| Se connecter / se déconnecter (espace admin) | — | Oui |
| Accéder au tableau de bord | Non | Oui |
| Créer, modifier, supprimer des recettes | Non | Oui |
| Gérer catégories, origines et types de repas | Non | Oui |
| Créer, modifier, supprimer des administrateurs | Non | Oui* |

\* Le compte administrateur principal ne peut pas être modifié ni supprimé.

La page de connexion n'apparaît pas dans la navigation publique. L'accès se fait par URL dédiée.

---

## 4. Exigences fonctionnelles

### 4.1 Accueil

- Hero : marque Cook'île & Co, accroche *An Nou Ay !*, mention « Des Antilles aux saveurs du monde ».
- Section « À propos » : image et texte de présentation.
- Section « Quelques recettes » : jusqu'à 3 recettes (photo, titre, catégorie, temps de cuisson) ; lien vers le catalogue.
- Section « Parcourir par catégorie » : jusqu'à 4 catégories (image, nom) ; lien vers la page catégories.

### 4.2 Catalogue des recettes

- Recherche textuelle.
- Trois filtres combinables : origine, type de repas, catégorie.
- Grille de cartes (photo, titre, catégorie, temps de cuisson).
- Pagination (12 recettes par page).
- Les filtres et la recherche sont reflétés dans l'URL pour permettre le partage d'une vue filtrée.

### 4.3 Fiche recette

- Photo, titre, catégorie, temps de cuisson.
- Ingrédients structurés (quantité, unité, nom).
- Étapes de préparation numérotées.
- Conseils de Tetelle (si renseignés).
- Partage : Facebook, WhatsApp, copie du lien ; partage natif du navigateur lorsque disponible.
- Commentaires :
  - liste des commentaires (pseudo + texte) ;
  - formulaire public : pseudo, commentaire, captcha arithmétique anti-spam ;
  - publication sans compte.

### 4.4 Catégories et origines (public)

- Liste des catégories (image, nom) ; clic → catalogue filtré sur la catégorie.
- Liste des origines ; clic → catalogue filtré sur l'origine.

### 4.5 Connexion administration

- Formulaire email + mot de passe.
- Accès réservé aux comptes administrateur.
- En cas de succès : redirection vers le tableau de bord et ouverture de session.
- Lien d'inscription public : non proposé.

### 4.6 Tableau de bord

**Administrateurs**
- Liste des comptes admin (email, rôle).
- Création d'un administrateur (email, mot de passe).
- Modification et suppression des administrateurs secondaires.
- Compte principal : badge distinct, aucune action de modification ou suppression.

**Recettes**
- Liste des recettes (photo, titre, catégorie).
- Création, modification, suppression (confirmation avant suppression).

### 4.7 Formulaire recette

Création et modification. Champs :

| Champ | Obligation |
|---|---|
| Titre | Obligatoire |
| Catégorie | Obligatoire |
| Origine | Obligatoire |
| Type de repas | Obligatoire |
| Temps de cuisson | Optionnel |
| Photo (JPG, PNG, WebP, max. 5 Mo) | Optionnel |
| Ingrédients (lignes dynamiques : quantité, unité, nom) | Selon saisie |
| Étapes de préparation (numérotées, dynamiques) | Selon saisie |
| Conseils de Tetelle | Optionnel |

Depuis ce formulaire, l'administrateur peut créer, renommer ou supprimer une catégorie, une origine ou un type de repas (suppression bloquée si des recettes y sont liées). Les catégories peuvent recevoir une image.

---

## 5. Règles métier

1. Une recette est rattachée à une catégorie, une origine et un type de repas (tous obligatoires).
2. Les ingrédients sont stockés par recette (quantité, unité, nom) ; l'unité est en saisie libre.
3. La suppression d'une recette entraîne la suppression de sa photo sur le serveur, de ses ingrédients et de ses étapes.
4. La suppression d'une catégorie, d'une origine ou d'un type de repas est refusée s'il reste des recettes liées.
5. Toute suppression côté administration demande une confirmation préalable.
6. Le compte administrateur principal (défini en configuration) est non modifiable et non supprimable.
7. Seuls les administrateurs authentifiés accèdent aux opérations d'écriture.
8. Un commentaire exige un pseudo (3 à 30 caractères), un texte (3 à 500 caractères) et une réponse captcha valide.
9. Les formats d'image acceptés pour les photos de recettes et de catégories sont JPG, PNG et WebP, taille maximale 5 Mo.

---

## 6. Contraintes techniques

| Domaine | Choix |
|---|---|
| Frontend | React, Vite (JavaScript) |
| Backend | Node.js, Express — API REST JSON |
| Données | MySQL, ORM Sequelize (migrations) |
| Authentification | Session serveur (`express-session`), cookie `httpOnly` |
| Hébergement cible | o2switch (mutualisé) |
| Environnement de développement | Laragon (Windows) |

Les origines sont stockées dans une table dédiée, distincte des catégories. Les types de repas constituent un référentiel séparé.

---

## 7. Inventaire des écrans

| Code | Écran | Public |
|---|---|---|
| E-01 | Accueil | Oui |
| E-02 | Catalogue des recettes | Oui |
| E-03 | Fiche recette | Oui |
| E-04 | Catégories et origines | Oui |
| E-05 | Connexion administration | Restreint |
| E-06 | Tableau de bord | Administrateur |
| E-07 | Formulaire recette (création / édition) | Administrateur |

Les écrans sont prévus pour usage desktop et mobile.