# AGENTS.md

Ce fichier fournit les instructions à Claude Code (claude.ai/code) et à tout autre outil agentique compatible avec le standard [AGENTS.md](https://agents.md/) pour travailler sur ce dépôt.

> **Note** : Ce fichier est un template transversal pour tous les projets TypeScript / Node.js / React / PostgreSQL. Remplis la section **[Contexte projet]** en bas avec les détails spécifiques à ton application pour donner à Claude le contexte nécessaire pour répondre précisément à tes questions et implémenter les fonctionnalités.

---

## Stack technique

- **Backend** : Node.js, Express, TypeScript, PostgreSQL (`pg` raw SQL), Zod, Vitest, Winston
- **Frontend** : React, Vite, TypeScript, React Router, Zod, Chart.js
- **Structure** : Monorepo avec dossiers `backend/` et `frontend/`
- **Auth** : JWT (httpOnly cookie) + middleware `authenticateToken`
- **Documentation** : Context7 MCP pour toute la documentation des libs/frameworks

---

## Commandes de développement

### Backend

```bash
cd backend
npm run dev          # Serveur de développement avec tsx watch
npm run build        # Compilation TypeScript
npm test             # Tests Vitest
npm run test:ui      # Tests avec interface graphique
npm run test:ui:coverage  # Tests avec rapport de couverture
```

### Frontend

```bash
cd frontend
npm run dev          # Serveur Vite
npm run build        # Build de production
npm run lint         # ESLint
npm run preview      # Prévisualisation du build
```

### Installation initiale

```bash
cd frontend && npm install
cd ../backend && npm install
# Configurer PostgreSQL et créer le fichier .env (voir README.md)
```

---

## Architecture

### Structure backend

```
backend/
├── server.ts           ← Point d'entrée, enregistrement des routes, migrations au démarrage
├── auth/               ← Logique JWT
├── config/             ← Pool de connexion PostgreSQL
├── data/               ← Modèles de données (classes représentant les entités DB)
├── interfaces/         ← Interfaces TypeScript partagées
├── middleware/         ← auth, sanitization, erreurs, CORS, rate limiting
├── routes/             ← Handlers Express par entité (ex: user.routes.ts)
├── services/           ← Couche métier appelée par les routes
├── validators/         ← Schémas Zod pour la validation des requêtes
├── utils/              ← Logger Winston, utilitaires (password, etc.)
├── types/              ← Augmentations TypeScript (ex: express.d.ts)
└── updates/            ← Scripts de migration SQL (migration.ts au démarrage)
```

### Structure frontend

```
frontend/src/
├── main.tsx / App.tsx  ← Point d'entrée, routing
├── components/         ← Composants réutilisables (Charts/, Forms/, Layout/, Table/)
├── contexts/           ← React Context providers (AuthContext, etc.)
├── hooks/              ← Custom hooks React
├── interfaces/         ← Interfaces TypeScript
├── pages/              ← Pages organisées par feature
├── services/api.ts     ← TOUS les appels API centralisés ici
├── utils/              ← Utilitaires (PrivateRoute, helpers)
└── validators/         ← Schémas Zod côté client
```

### Flux de données

**Backend** : `Route → Middleware (auth, sanitize) → Validator (Zod) → Service → Data model → PostgreSQL`

**Frontend** : `Composant → Hook → services/api.ts → Backend`

---

## Patterns clés

### Authentification & Autorisation

- JWT vérifié par `authenticateToken` sur toutes les routes protégées (appliqué globalement dans `server.ts`)
- Routes admin : `requireRole(1)` sur les méthodes POST/PUT/DELETE
- `useAuth()` hook côté frontend pour accéder à `user` et `isAdmin`
- Token JWT en cookie httpOnly ; userId dans localStorage

### Protection IDOR

- Les endpoints GET par ID vérifient toujours que la ressource appartient à l'utilisateur courant
- Retourner 404 (pas 403) si la ressource n'appartient pas à l'utilisateur courant

### Validation

- Zod utilisé côté **backend** (`backend/validators/`) ET **frontend** (`frontend/src/validators/`)
- Valider uniquement aux frontières du système (entrée utilisateur, APIs externes)

### Appels API

- Tous les appels centralisés dans `frontend/src/services/api.ts`
- Utiliser `credentials: "include"` pour le cookie JWT
- `API_URL` switche selon l'environnement : `localhost:3001` en dev, `/api` en prod

---

## Principes POO (Programmation Orientée Objet)

Règles de base à respecter dans toutes les classes (`backend/data/`, mais aussi côté frontend si des classes sont utilisées).

### Constructeur

- Le constructeur sert **uniquement** à initialiser l'état de l'objet (assigner les propriétés)
- Jamais d'appel réseau, de requête SQL, ou de logique métier dans un constructeur
- Si la création d'un objet nécessite une opération asynchrone (ex: aller chercher des données en DB), utiliser une **méthode statique factory** (ex: `static async fromId(id: number)`) plutôt que de complexifier le constructeur

### Encapsulation

- Propriétés `private` par défaut ; ne les rendre `public`/accessibles que si un autre module en a réellement besoin
- Exposer l'état via des getters plutôt que d'exposer les propriétés internes brutes
- Une classe ne doit pas exposer de détails qui permettent à l'extérieur de la mettre dans un état incohérent

### Répartition des responsabilités

- **Data model (`backend/data/`)** : représente une entité et son état. Peut contenir des méthodes simples liées à l'objet lui-même (ex: `isExpired()`, `getFullName()`). Ne contient **pas** de règles métier complexes ni d'orchestration entre plusieurs entités
- **Service (`backend/services/`)** : contient la **règle métier** — validations métier, orchestration entre plusieurs data models, décisions ("un utilisateur peut-il faire X ?"). C'est la couche qui sait *pourquoi*, pas seulement *comment*
- **Route** : ne contient **aucune** logique métier — elle appelle le service et retourne la réponse HTTP

### Autres règles simples

- Une classe = une responsabilité (cf. SOLID, section suivante)
- Préférer la **composition** à l'héritage : injecter une dépendance plutôt que d'hériter d'une classe pour réutiliser son comportement
- Éviter les hiérarchies d'héritage de plus de 1 niveau
- Nommer les classes avec un nom (substantif) et les méthodes avec un verbe (`createUser`, pas `userCreation`)

---

## Qualité du code

### Principes fondamentaux

**DRY** — Ne pas dupliquer la logique. Extraire les patterns répétés en fonctions/composants réutilisables.

**KISS** — Code simple et lisible plutôt que code astucieux. Éviter la sur-ingénierie. Principe de moindre surprise.

**SOLID** :

- **S** — Une seule responsabilité par fonction/classe
- **O** — Ouvert à l'extension, fermé à la modification
- **L** — Les classes dérivées remplacent les classes de base
- **I** — Interfaces spécifiques plutôt que générales
- **D** — Dépendre des abstractions, pas des implémentations

**YAGNI** — N'implémenter que ce qui est nécessaire maintenant. Pas de fonctionnalités "au cas où".

### Standards TypeScript

- Mode strict activé dans `tsconfig.json`
- Préférer `async/await` aux promesses chaînées
- Fonctions courtes et ciblées (max ~20 lignes)
- Pas de nombres magiques — utiliser des constantes nommées
- Nommage clair et cohérent avec le reste du projet
- Pas de `console.log` oubliés côté backend — utiliser Winston (`utils/logger.ts`)
- Pas de styles inline côté frontend — CSS classes ou fichiers de styles dédiés

---

## Sécurité

- **SQL injection** : toujours utiliser des requêtes paramétrées (`$1, $2, ...`)
- **XSS** : tous les inputs passent par `sanitizeInputs` middleware (DOMPurify via jsdom)
- **Auth** : `authenticateToken` présent sur toutes les routes protégées
- **IDOR** : vérifier que la ressource appartient à l'utilisateur dans toutes les requêtes GET par ID
- **Données sensibles** : jamais de tokens, mots de passe, ou clés dans les logs ou réponses
- **Mots de passe** : hachage scrypt via `utils/password.ts` (`hashPassword` / `verifyPassword`)
- **Rate limiting** : sur `/login` via express-rate-limit
- **Headers de sécurité** : middleware dédié (CSP, HSTS, etc.)

---

## Tests

- Framework : **Vitest** côté backend
- Fichiers de test dans `backend/test/`
- Ajouter des tests unitaires et d'intégration pour toute nouvelle fonctionnalité
- Préférer les tests sur les **services** et les **data models** (logique métier)
- Ne pas mocker la base de données dans les tests d'intégration

---

## Documentation avec Context7

Toujours utiliser le MCP **Context7** pour consulter la documentation à jour des librairies et frameworks (Express, React, Zod, Vitest, pg, etc.) avant d'implémenter ou de répondre à une question sur une API spécifique.

---

## Conventions Git

### Messages de commit (Conventional Commits)

Format : `type(scope): description courte`

| Type       | Usage                                   |
| ---------- | --------------------------------------- |
| `feat`     | Nouvelle fonctionnalité                 |
| `fix`      | Correction de bug                       |
| `refactor` | Refacto sans changement de comportement |
| `test`     | Ajout ou modification de tests          |
| `chore`    | Tâche technique (deps, config, CI)      |
| `docs`     | Documentation uniquement                |
| `perf`     | Amélioration de performance             |

Exemples :

```
feat(auth): add password reset via email
fix(risks): prevent IDOR on GET /risks/:id
refactor(services): extract common pagination helper
test(users): add integration tests for role-based access
```

### Nommage des branches

```
feat/nom-de-la-feature
fix/description-du-bug
chore/tâche-technique
refactor/scope-du-refacto
```

### Règles générales

- Ne **jamais** ajouter de ligne `Co-Authored-By: Claude` dans les messages de commit
- Messages de commit en anglais (convention standard open source)
- Une seule responsabilité par commit — ne pas mélanger feat et fix

---

## Ton pédagogique

- Toujours expliquer les réponses avec un ton d'apprentissage et de pédagogie
- Fournir des explications claires sur les changements de code et **pourquoi** ils sont faits
- Référencer la documentation pertinente si applicable (via Context7)
- En cas de doute sur un changement, demander une clarification avant de procéder
- Indiquer toujours **fichier + numéro de ligne** pour chaque élément mentionné

---

## Workflow — Ajouter une nouvelle entité

1. Créer le modèle de données dans `backend/data/EntityName.ts`
2. Créer le service dans `backend/services/entityName.services.ts`
3. Créer le validator Zod dans `backend/validators/entityNameSchema.ts`
4. Créer les routes dans `backend/routes/entityName.routes.ts`
5. Enregistrer la route dans `backend/server.ts`
6. Ajouter les fonctions API dans `frontend/src/services/api.ts`
7. Créer le composant formulaire dans `frontend/src/components/Forms/EntityNameForm.tsx`
8. Créer les pages dans `frontend/src/pages/EntityNamePage/`
9. Ajouter les routes dans `frontend/src/App.tsx`
10. Créer le validator Zod frontend dans `frontend/src/validators/entityNameSchema.ts`

---

## [Contexte projet]

> Remplace cette section par les informations spécifiques à ton projet.

### Vue d'ensemble

<!-- Décris le projet : domaine métier, logique métier utilisateurs cibles, fonctionnalité principale -->

### Entités principales

<!-- Liste les entités clés et leurs relations -->

### Variables d'environnement

<!-- Liste les variables .env requises -->

### Commandes spécifiques

<!-- Commandes de build, migration -->

### Patterns spécifiques

<!-- Règles métier, conventions ou décisions d'architecture propres à ce projet -->
