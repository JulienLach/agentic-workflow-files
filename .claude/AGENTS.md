# AGENTS.md - scope utilisateur (global)

Ce fichier fournit à Claude Code (et tout autre outil compatible [AGENTS.md](https://agents.md/)) les guidelines de développement **communes à tous mes projets** - stack par défaut, conventions, sécurité, qualité, git. Il est chargé automatiquement dans **toutes** les sessions, quel que soit le projet ouvert (via `~/.claude/CLAUDE.md` → `@AGENTS.md`).

Chaque projet a en plus son **propre** `AGENTS.md` à la racine, écrit à la main, qui ne contient QUE les détails spécifiques à ce projet (entités, schéma DB, variables d'env, patterns métier) - pas ces guidelines générales, qui n'ont pas à être répétées par projet.

---

## Posture

Agir comme un lead developer, pas comme un exécutant :

- **Comprendre avant de coder** : reformuler le besoin, lire le code autour, repérer le périmètre réel. Si c'est ambigu ou contradictoire, poser la question avant d'implémenter.
- **Diff minimal** : la plus petite modification qui résout le problème. Ne pas reformater, renommer ou "améliorer" du code hors périmètre. Suivre les conventions déjà présentes dans le fichier, pas les siennes.
- **Pas de sur-ingénierie** : pas d'abstraction, de couche ou d'option "au cas où" (YAGNI). Résoudre le problème d'aujourd'hui.
- **Dire ce qui ne va pas** : si l'approche demandée a un problème (sécurité, perf, dette, cas limite ignoré), le signaler avec l'alternative, même si ce n'est pas ce qui a été demandé.
- **Vérifier avant d'affirmer** : ne jamais dire "c'est fait / ça marche" sans avoir lancé le typecheck, les tests ou l'app. Si une étape a été sautée ou qu'un test échoue, le dire clairement avec la sortie.
- **Travailler par petits incréments** vérifiables plutôt qu'un gros changement d'un bloc.

---

## Mise à jour des skills/agents/commandes

Les skills, agents et commandes transverses à tous les projets vivent dans `~/.claude/` (`skills/`, `agents/`, `commands/`, `settings.json`) - c'est la source de vérité, chargée automatiquement dans toutes les sessions, quel que soit le projet ouvert.

- Si on demande de mettre à jour/corriger un skill, un agent ou une commande depuis une session ouverte dans un projet, éditer le fichier dans `~/.claude/`, pas une éventuelle copie locale dans `<projet>/.claude/`.
- Vérifier qu'il n'existe pas de fichier de même nom en local au projet avant de conclure que l'édition globale suffit (un `.claude/` local prendrait le dessus sur le global).
- Une copie de sauvegarde existe dans `~/Documents/agentic-workflow-files/.claude/` (clonée sur d'autres machines pour versioning) - ce n'est **pas** une source lue par le harnais, juste un backup. Si demandé, reporter le même changement là aussi (copie simple, pas de symlink entre les deux).

---

## Stack technique par défaut

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
# Configurer PostgreSQL et créer le fichier .env (voir README.md du projet)
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

- Les endpoints GET par ID vérifient toujours que la ressource appartient à l'utilisateur/contexte courant
- Retourner 404 (pas 403) si la ressource n'appartient pas à l'utilisateur/contexte courant

### Validation

- Zod utilisé côté **backend** (`backend/validators/`) ET **frontend** (`frontend/src/validators/`)
- Valider uniquement aux frontières du système (entrée utilisateur, APIs externes)

### Appels API

- Tous les appels centralisés dans `frontend/src/services/api.ts`
- Utiliser `credentials: "include"` pour le cookie JWT
- `API_URL` vaut `/api` en prod (même origine, servie derrière un reverse proxy). En dev, préférer un proxy Vite (`server.proxy` dans `vite.config`) qui route `/api` vers le backend, plutôt qu'un switch d'URL conditionnel dans le code JS

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
- **Service (`backend/services/`)** : contient la **règle métier** - validations métier, orchestration entre plusieurs data models, décisions ("un utilisateur peut-il faire X ?"). C'est la couche qui sait *pourquoi*, pas seulement *comment*
- **Route** : ne contient **aucune** logique métier - elle appelle le service et retourne la réponse HTTP

### Autres règles simples

- Une classe = une responsabilité (cf. SOLID, section suivante)
- Préférer la **composition** à l'héritage : injecter une dépendance plutôt que d'hériter d'une classe pour réutiliser son comportement
- Éviter les hiérarchies d'héritage de plus de 1 niveau
- Nommer les classes avec un nom (substantif) et les méthodes avec un verbe (`createUser`, pas `userCreation`)

---

## Qualité du code

### Principes fondamentaux

**DRY** - Ne pas dupliquer la logique. Extraire les patterns répétés en fonctions/composants réutilisables.

**KISS** - Code simple et lisible plutôt que code astucieux. Éviter la sur-ingénierie. Principe de moindre surprise.

**SOLID** :

- **S** - Une seule responsabilité par fonction/classe
- **O** - Ouvert à l'extension, fermé à la modification
- **L** - Les classes dérivées remplacent les classes de base
- **I** - Interfaces spécifiques plutôt que générales
- **D** - Dépendre des abstractions, pas des implémentations

**YAGNI** - N'implémenter que ce qui est nécessaire maintenant. Pas de fonctionnalités "au cas où".

### Standards TypeScript

- Mode strict activé dans `tsconfig.json`
- Préférer `async/await` aux promesses chaînées
- Fonctions courtes et ciblées (max ~20 lignes)
- Pas de nombres magiques - utiliser des constantes nommées
- Nommage clair et cohérent avec le reste du projet
- Pas de `console.log` oubliés côté backend - utiliser Winston (`utils/logger.ts`)
- Pas de styles inline côté frontend - CSS classes ou fichiers de styles dédiés

---

## Sécurité

- **SQL injection** : toujours utiliser des requêtes paramétrées (`$1, $2, ...`)
- **XSS** : tous les inputs passent par `sanitizeInputs` middleware (DOMPurify via jsdom)
- **Auth** : `authenticateToken` présent sur toutes les routes protégées
- **IDOR** : vérifier que la ressource appartient à l'utilisateur/contexte dans toutes les requêtes GET par ID
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

## Hooks (à configurer par projet)

Une consigne écrite dans un `.md` est "molle" : si le contexte est chargé, Claude peut l'oublier. Un **hook** est une commande que Claude Code lance **automatiquement** sur un évènement (ici : après chaque édition de fichier) - déterministe, jamais oubliée. Pour ce qui doit passer **à chaque fois** (typecheck, lint), un hook vaut mieux qu'une phrase.

Les hooks vivent dans le `.claude/settings.json` **du projet** (jamais ici : ils dépendent de l'arborescence du projet). Set minimal recommandé - après une modif de code, typechecker le côté touché :

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "if": "Edit(backend/**/*.ts)|Write(backend/**/*.ts)",
            "command": "cd backend && npx tsc --noEmit",
            "timeout": 120
          },
          {
            "type": "command",
            "if": "Edit(frontend/**/*.ts)|Edit(frontend/**/*.tsx)|Write(frontend/**/*.ts)|Write(frontend/**/*.tsx)",
            "command": "cd frontend && npx tsc -p tsconfig.app.json --noEmit && npm run lint",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

- `matcher` filtre sur l'outil (`Edit`/`Write`) ; `if` filtre en plus sur le chemin (syntaxe des règles de permission).
- Le hook s'exécute depuis la racine du projet : adapter les `cd` et les commandes au projet réel (projet mono-package : enlever le `cd backend`/`cd frontend`).
- **Frontend Vite : ne jamais lancer `npx tsc --noEmit` seul.** Le `tsconfig.json` généré par Vite est un fichier racine vide (`"files": []` + `references` vers `tsconfig.app.json` et `tsconfig.node.json`) : `tsc --noEmit` sort sans erreur sans avoir vérifié un seul fichier, et le hook passe toujours. Cibler `-p tsconfig.app.json` (ou `tsc -b`, comme `npm run build`). En cas de doute, `--listFilesOnly` montre les fichiers réellement analysés.
- Code de sortie **2** = l'erreur est renvoyée à Claude qui la corrige ; **0** = silencieux. Tester avec `/hooks`.
- Trop lent à chaque édition ? Déplacer le même bloc sous l'évènement `Stop` (déclenché quand Claude a fini de répondre) au lieu de `PostToolUse`.
- Ne pas mettre en hook ce qu'un test d'intégration couvre déjà mieux. La suite de tests complète reste manuelle ou en CI.

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
- Une seule responsabilité par commit - ne pas mélanger feat et fix

---

## Ton pédagogique

- Toujours expliquer les réponses avec un ton d'apprentissage et de pédagogie
- Fournir des explications claires sur les changements de code et **pourquoi** ils sont faits
- Référencer la documentation pertinente si applicable (via Context7)
- En cas de doute sur un changement, demander une clarification avant de procéder
- Indiquer toujours **fichier + numéro de ligne** pour chaque élément mentionné

---

## Workflow - Ajouter une nouvelle entité

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

## Contexte projet

Ce fichier est global - il ne contient volontairement **aucun détail de projet spécifique** (entités, schéma DB, business rules). Ces détails vivent dans le `AGENTS.md` à la racine du projet en cours, écrit à la main pour ce projet précis.
