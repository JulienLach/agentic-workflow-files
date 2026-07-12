# claude-code-files

Ressources Claude Code transversales pour les projets **TypeScript / Node.js / React / PostgreSQL**.

Ce repo contient un `CLAUDE.md` complet et des skills prêts à l'emploi pour accélérer le développement sur toute la stack.

---

## Stack cible

- **Backend** : Node.js · Express · TypeScript · PostgreSQL (`pg`) · Zod · Vitest · Winston
- **Frontend** : React · Vite · TypeScript · React Router · Zod
- **Structure** : Monorepo `backend/` + `frontend/`
- **Auth** : JWT (httpOnly cookie)
- **MCP** : Context7 pour la documentation des librairies

---

## Contenu

```
claude-code-files/
├── CLAUDE.md                        ← Instructions transversales pour Claude Code
├── WORKFLOW.md                      ← Workflow bout-en-bout : Sprint Obsidian → Code → PR GitHub
└── .claude/
    ├── settings.json                ← Permissions MCP (Context7)
    └── skills/
        ├── code-review.md           ← /code-review  : revue de code
        ├── debug.md                 ← /debug         : débogage structuré
        ├── refactor.md              ← /refactor      : refacto sécurisé
        ├── add-entity.md            ← /add-entity    : création d'entité full-stack
        ├── write-tests.md           ← /write-tests   : rédaction de tests Vitest
        └── security-audit.md        ← /security-audit: audit sécurité OWASP
```

---

## Installation

### Option 1 — Copier les fichiers dans un projet existant

```bash
# Cloner ce repo
git clone https://github.com/JulienLach/claude-code-files.git

# Copier le CLAUDE.md à la racine de ton projet
cp claude-code-files/CLAUDE.md mon-projet/CLAUDE.md

# Copier la config Claude Code
cp -r claude-code-files/.claude mon-projet/.claude
```

### Option 2 — Utiliser comme base d'un nouveau projet

```bash
git clone https://github.com/JulienLach/claude-code-files.git mon-projet
cd mon-projet
# Supprimer l'origine et rattacher à ton propre repo
git remote remove origin
git remote add origin https://github.com/<ton-nom-utilisateur>/mon-projet.git
```

---

## Configuration

### Prérequis

- [Claude Code CLI](https://docs.anthropic.com/fr/docs/claude-code) installé
- MCP Context7 configuré (voir ci-dessous)

### Skills vs MCP vs Plugins — quelle différence ?

Claude Code propose trois mécanismes d'extension complémentaires :

|                         | **Skills**                            | **MCP**                               | **Plugins**                             |
| ----------------------- | ------------------------------------- | ------------------------------------- | --------------------------------------- |
| **Qu'est-ce que c'est** | Fichiers `.md` dans `.claude/skills/` | Serveurs externes connectés à Claude  | Bundles complets (skills + MCP + hooks) |
| **Invoquer**            | `/nom-du-skill`                       | Automatique ou à la demande           | `/nom-du-plugin:commande`               |
| **Installer**           | Copier le fichier `.md`               | `claude mcp add`                      | `claude plugin install`                 |
| **Usage**               | Prompts guidés réutilisables          | Accès outils externes (API, DB, docs) | Features complètes packagées            |

> Ce repo fournit des **skills** et un **MCP** (Context7). Les plugins officiels Anthropic s'installent séparément.

---

### Plugins

#### Code Review

Le plugin officiel Anthropic pour la revue de PR. Il lance **5 agents spécialisés en parallèle** :

- Vérification conformité `CLAUDE.md`
- Détection de bugs
- Analyse du contexte git (historique, commits liés)
- Revue des commentaires PR précédents
- Vérification des commentaires de code

Chaque finding reçoit un **score de confiance (0–100)** — seuls les problèmes à plus de 80 de confiance sont remontés, ce qui réduit drastiquement les faux positifs.

**Installation :**

```bash
claude plugin install https://claude.com/plugins/code-review
```

**Utilisation** (sur une branche avec une PR ouverte) :

```bash
/code-review
```

> **Note :** Ce plugin utilise la même commande `/code-review` que le skill inclus dans ce repo. Si tu installes le plugin officiel, **supprime ou renomme** le skill `code-review.md` pour éviter le conflit.

---

#### Superpowers

Le couteau suisse de Claude Code — 20+ skills battle-tested couvrant tout le cycle de développement. 350k+ installs, maintenu par Jesse Vincent.

**Installation :**

```bash
claude plugin install https://claude.com/plugins/superpowers
```

**Commandes disponibles :**

| Commande           | Description                                                                            |
| ------------------ | -------------------------------------------------------------------------------------- |
| `/brainstorming`   | Session Socratique pour explorer et affiner les besoins **avant** de coder             |
| `/execute-plan`    | Implémente un plan par batches avec un agent de revue intégré à chaque checkpoint      |
| `/debugging`       | Débogage en 4 phases avec revue architecturale automatique après 3 tentatives échouées |
| `/skill-authoring` | Crée et teste de nouveaux skills Claude Code en appliquant les principes TDD           |

**Pourquoi l'utiliser avec cette stack :**

- `/brainstorming` avant toute nouvelle feature pour clarifier le besoin avant de toucher au code
- `/execute-plan` pour les implémentations complexes (nouvelle entité, refacto) avec validation continue
- `/debugging` en complément du skill `/debug` de ce repo pour les bugs récalcitrants
- `/skill-authoring` pour créer tes propres skills personnalisés au projet

---

### MCP (Model Context Protocol) — outils externes

Les MCP connectent Claude Code à des services externes (APIs, bases de données, documentation, etc.). Ils s'installent via CLI et peuvent être configurés **globalement** (tous tes projets) ou **par projet** (dans `.claude/`).

#### Installer un MCP globalement

```bash
# Syntaxe générale
claude mcp add <nom> -- <commande-de-lancement>

# Exemples
claude mcp add context7 -- npx -y @upstash/context7-mcp
claude mcp add obsidian -- npx -y mcp-obsidian
```

#### Lister / supprimer les MCP

```bash
claude mcp list
claude mcp remove <nom>
```

---

### Context7 — documentation des librairies en temps réel

**Context7** est le MCP indispensable pour cette stack. Il fournit à Claude la documentation à jour de toutes les librairies (Express, React, Zod, Vitest, pg, etc.) directement pendant la conversation, sans avoir à copier-coller de la doc.

**Installation (une seule fois, globalement) :**

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

**Utilisation :** Claude l'utilise automatiquement quand il a besoin de documentation. Tu peux aussi lui demander explicitement :

```
Utilise context7 pour me montrer comment configurer les middlewares dans Express 5
```

**Permissions :** Le fichier `.claude/settings.json` inclus dans ce repo autorise déjà Context7 sans confirmation à chaque appel :

```json
{
    "permissions": {
        "allow": ["mcp__plugin_context7_context7__query-docs", "mcp__plugin_context7_context7__resolve-library-id"]
    }
}
```

> Si tu ajoutes d'autres MCP, ajoute leurs permissions dans ce fichier pour éviter les confirmations répétées. Le pattern est `mcp__<nom-du-mcp>__<nom-de-loutil>`.

---

### Obsidian MCP — gestion des notes de projet

Le MCP Obsidian permet à Claude de lire, créer et modifier des notes dans ton vault Obsidian directement depuis une session Claude Code. Utile pour documenter les décisions d'architecture, gérer un backlog en Markdown, ou lier des notes techniques à ton code.

**Installation (une seule fois, globalement) :**

```bash
claude mcp add obsidian -- npx -y mcp-obsidian /chemin/vers/ton/vault
```

**Cas d'usage :**

- Créer une note de décision d'architecture directement depuis Claude Code
- Rechercher dans tes notes de projet sans quitter le terminal
- Mettre à jour un backlog ou un journal de bord en cours de session

**Ajouter les permissions dans `.claude/settings.json` :**

```json
{
    "permissions": {
        "allow": [
            "mcp__plugin_context7_context7__query-docs",
            "mcp__plugin_context7_context7__resolve-library-id",
            "mcp__obsidian__read_note",
            "mcp__obsidian__write_note",
            "mcp__obsidian__search_notes",
            "mcp__obsidian__list_directory"
        ]
    }
}
```

> Ce MCP est **optionnel** — il est utile si tu gères ta documentation de projet dans Obsidian. Il n'est pas nécessaire pour utiliser les skills et le CLAUDE.md.

> **MCP vs CLI Obsidian — ne pas confondre :** ce MCP (`mcp-obsidian`) est un serveur que Claude appelle via des tool calls. Le workflow décrit ci-dessous (`WORKFLOW.md`) utilise plutôt le **[CLI natif `obsidian`](https://help.obsidian.md/cli)** (commande shell `obsidian ...`), qui communique directement avec l'app Obsidian ouverte via un socket local — pas besoin d'installer ce MCP pour suivre `WORKFLOW.md`. Utilise le MCP si tu veux intégrer Obsidian à d'autres automatisations Claude ; utilise le CLI pour le workflow sprint → code → PR documenté ici.

---

## Workflow bout-en-bout : Sprint Obsidian → Code → PR GitHub

Voir [`WORKFLOW.md`](./WORKFLOW.md) pour le détail du cycle complet : capture des tâches depuis un point dev/une recette client via le **CLI Obsidian** (voir encadré ci-dessus, distinct du MCP), suivi des tâches dans le vault (sprints, checklists), implémentation dans le repo de code, commit/push, ouverture de PR avec `gh` CLI (y compris le contournement pour les environnements sandboxés sans `gh` ni credentials Git préinstallés), revue de la PR en solo dev (`/code-review`), puis retour cocher la tâche dans Obsidian une fois faite.

---

## Personnaliser CLAUDE.md pour le projet

Le `CLAUDE.md` contient une section `## [Contexte projet]` en bas du fichier. Remplir avec les informations spécifiques de l'application :

```markdown
## [Contexte projet]

### Vue d'ensemble

Application de gestion des congés pour PME. Utilisateurs : RH (admin) et employés.

### Entités principales

- users, leave_requests, leave_types, departments

### Variables d'environnement

- DATABASE_URL, JWT_SECRET, SMTP_HOST, PORT

### Patterns spécifiques

- Les demandes de congé sont scopées par département (id_department)
- Workflow d'approbation : pending → approved / rejected
```

---

## Skills disponibles

| Commande          | Description                                                                          |
| ----------------- | ------------------------------------------------------------------------------------ |
| `/code-review`    | Revue de code : sécurité, qualité, architecture, performance                         |
| `/debug`          | Débogage structuré : localisation → hypothèses → correction → prévention             |
| `/refactor`       | Refacto sécurisé : plan avant action, vérification que le comportement ne change pas |
| `/add-entity`     | Création d'une entité full-stack avec checklist complète                             |
| `/write-tests`    | Rédaction de tests unitaires et d'intégration Vitest                                 |
| `/security-audit` | Audit de sécurité OWASP : injection, auth, IDOR, exposition de données               |

### Utilisation

Dans Claude Code, utilise les skills avec `/nom-du-skill` suivi du contexte :

```
/code-review backend/routes/user.routes.ts
/debug La liste des utilisateurs ne se charge plus après le login
/add-entity une entité "department" avec nom, description et un responsable (FK vers users)
/write-tests backend/services/user.services.ts
/security-audit backend/routes/auth.routes.ts
```
