# agentic-workflow-files

Ressources Claude Code transversales pour les projets **TypeScript / Node.js / React / PostgreSQL**.

Ce repo est la **sauvegarde versionnée** de la config Claude Code/OpenCode en scope utilisateur (`~/.claude/`, `~/.config/opencode/`) - guidelines de dev communes, skills, agents, commandes. La vraie source de vérité vit dans ces dossiers globaux ; ce repo n'est lu par aucun harnais, il sert à versionner/cloner cette config sur d'autres machines. Voir [`STRUCTURE-AGNOSTIQUE.md`](./STRUCTURE-AGNOSTIQUE.md) pour le schéma complet.

---

## Table des matières

- [Stack cible](#stack-cible)
- [Contenu](#contenu)
- [`CLAUDE.md` vs `AGENTS.md`](#claudemd-vs-agentsmd)
- [Installation](#installation)
    - [Démarrer un nouveau projet de code](#démarrer-un-nouveau-projet-de-code)
- [Configuration](#configuration)
    - [Prérequis](#prérequis)
    - [Skills vs MCP vs Plugins - quelle différence ?](#skills-vs-mcp-vs-plugins--quelle-différence)
    - [Plugins](#plugins)
    - [`skills.sh` - installer des skills externes via CLI](#skillssh--installer-des-skills-externes-via-cli)
    - [MCP (Model Context Protocol) - outils externes](#mcp-model-context-protocol--outils-externes)
    - [Context7 - documentation des librairies en temps réel](#context7--documentation-des-librairies-en-temps-réel)
    - [Obsidian skills - gestion des notes de projet](#obsidian-skills--gestion-des-notes-de-projet)
    - [Agents personnalisés](#agents-personnalisés)
- [Design - maquette client avant le code](#design--maquette-client-avant-le-code)
- [Workflow bout-en-bout : Sprint Obsidian → Code → PR GitHub](#workflow-bout-en-bout--sprint-obsidian--code--pr-github)
- [Écrire le CLAUDE.md d'un projet](#écrire-le-claudemd-dun-projet)
- [Skills disponibles](#skills-disponibles)
- [Concepts IA - glossaire et fondamentaux](#concepts-ia--glossaire-et-fondamentaux)

---

## Stack cible

Node.js/Express/TypeScript/PostgreSQL + React/Vite, monorepo `backend/`+`frontend/`. Détail complet (commandes, architecture, conventions) dans [`.claude/AGENTS.md`](./.claude/AGENTS.md) - c'est la source de vérité, pas ce README.

---

## Contenu

```
agentic-workflow-files/
├── WORKFLOW.md                      ← Workflow bout-en-bout : Sprint Obsidian → Code → PR GitHub
├── CONCEPTS-IA.md                   ← Glossaire et concepts IA (harness, modèles, tokens, RAG...)
├── STRUCTURE-AGNOSTIQUE.md          ← Schéma de la centralisation Claude Code / OpenCode
├── design/
│   ├── design.md                    ← Charte graphique (Brand Guide) à remplir pour le client
│   └── instructions-maquette.md     ← Instructions de maquettage (écrans, navigation, règles UX)
├── .claude/                         ← backup de ~/.claude/ (scope utilisateur Claude Code)
│   ├── AGENTS.md                    ← Guidelines de dev communes à tous les projets (stack, conventions, sécurité, git)
│   ├── CLAUDE.md                    ← Import `@AGENTS.md`
│   ├── settings.json                ← Permissions MCP (Context7) + prefs
│   ├── agents/
│   │   └── obsidian-expert.md       ← Agent custom : expertise Obsidian (notes, plugins, templates)
│   └── skills/                      ← un sous-dossier par skill, `<nom>/SKILL.md` (format standard, aucun fichier plat) :
│                                       stack-review, debug, refactor, add-entity, write-tests,
│                                       security-audit, prep, prep-check, roast, competitor-benchmark,
│                                       ai-news, learn, pulse
│                                       (détail de chaque commande dans Skills disponibles, plus bas)
└── .opencode/                       ← backup de ~/.config/opencode/ (scope utilisateur OpenCode)
    └── AGENTS.md                    ← même contenu que .claude/AGENTS.md (symlinké entre les deux en réel)
```

Chaque projet garde ensuite son propre `CLAUDE.md` - voir [Écrire le CLAUDE.md d'un projet](#écrire-le-claudemd-dun-projet).

---

## `CLAUDE.md` vs `AGENTS.md`

Ce repo utilise les deux (`CLAUDE.md` → `@AGENTS.md`) pour rester lisible par Claude Code et par tout outil compatible [AGENTS.md](https://agents.md/) (OpenCode...). Explication complète (pourquoi, précédence, symlink vs import) dans [`CONCEPTS-IA.md`](./CONCEPTS-IA.md#le-fichier-dinstructions-racine--claudemd-et-agentsmd).

---

## Installation

Ce repo se clone une fois par machine, pour restaurer la config **scope utilisateur** (pas pour être copié dans chaque projet de code) :

```bash
git clone https://github.com/JulienLach/agentic-workflow-files.git

# Restaurer la config Claude Code (scope utilisateur)
cp -r agentic-workflow-files/.claude/* ~/.claude/

# Restaurer la config OpenCode (scope utilisateur) - symlink, pas une copie
mkdir -p ~/.config/opencode
ln -sf ~/.claude/AGENTS.md ~/.config/opencode/AGENTS.md
```

Une fois ça fait, `~/.claude/AGENTS.md` (guidelines communes) et les skills/agents/commandes sont disponibles automatiquement dans **tous** tes projets, sans rien copier dedans.

### Démarrer un nouveau projet de code

Un nouveau projet n'a besoin que de son propre `CLAUDE.md` - voir [Écrire le CLAUDE.md d'un projet](#écrire-le-claudemd-dun-projet) plus bas.

---

## Configuration

### Prérequis

- [Claude Code CLI](https://code.claude.com/docs) installé
- MCP Context7 configuré (voir ci-dessous)

### Skills vs MCP vs Plugins - quelle différence ?

Pour ce que sont ces mécanismes conceptuellement, voir [`CONCEPTS-IA.md`](./CONCEPTS-IA.md#skills-plugins-et-subagents) et [`MCP vs Skill - quand choisir quoi`](./CONCEPTS-IA.md#mcp-vs-skill--quand-choisir-quoi). Ici, juste l'essentiel pratique pour ce repo :

|               | **Skills**              | **MCP**                     | **Plugins**               | **Agents**                         |
| ------------- | ----------------------- | --------------------------- | ------------------------- | ---------------------------------- |
| **Invoquer**  | `/nom-du-skill`         | Automatique ou à la demande | `/nom-du-plugin:commande` | Automatique ou via l'outil `Agent` |
| **Installer** | Copier le fichier `.md` | `claude mcp add`            | `claude plugin install`   | Copier le fichier `.md`            |

> Ce repo fournit des **skills**, un **MCP** (Context7) et un **agent custom** (`obsidian-expert`). Les plugins officiels Anthropic s'installent séparément.

---

### Plugins

#### Code Review

Plugin officiel Anthropic : 5 agents en parallèle (conformité `AGENTS.md`, bugs, contexte git, commentaires PR/code), findings filtrés à >80 de confiance.

```bash
claude plugin install https://claude.com/plugins/code-review
/code-review   # sur une branche avec une PR ouverte
```

> Le skill `stack-review.md` de ce repo a été renommé (depuis `code-review.md`) précisément pour ne pas entrer en collision avec ce plugin - les deux coexistent sans problème : `/code-review` (natif Claude Code / ce plugin, revue de diff générique) et `/stack-review` (checklist sécu/qualité propre à la stack de ce repo).

---

#### Superpowers

20+ skills battle-tested couvrant tout le cycle de dev. 350k+ installs, maintenu par Jesse Vincent.

```bash
claude plugin install https://claude.com/plugins/superpowers
```

| Commande           | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `/brainstorming`   | Clarifier le besoin avant de coder                         |
| `/execute-plan`    | Implémenter un plan par batches, revue à chaque checkpoint |
| `/debugging`       | Débogage en 4 phases, revue archi auto après 3 échecs      |
| `/skill-authoring` | Créer/tester de nouveaux skills (TDD)                      |

> Déclenchement auto : le skill méta `using-superpowers` (hook `SessionStart`) active `systematic-debugging` sans commande explicite dès qu'un bug/test cassé apparaît - à ne pas confondre avec le skill `/debug` de ce repo, complémentaire.

---

### `skills.sh` - installer des skills externes via CLI

Registre/CLI dédié aux skills seuls (pas de MCP/hooks embarqués comme un plugin), open source, maintenu par Vercel Labs, sans install globale (`npx`).

```bash
npx skills add <owner>/<repo>   # écrit le SKILL.md dans .claude/skills/
```

| Commande                    | Rôle                                  |
| --------------------------- | ------------------------------------- |
| `npx skills list`           | Skills installés dans le projet       |
| `npx skills find [terme]`   | Recherche dans le registre public     |
| `npx skills update [skill]` | Mise à jour                           |
| `npx skills remove [skill]` | Désinstallation                       |
| `npx skills init [nom]`     | Nouveau `SKILL.md` depuis un template |

Options : `-g` (global, `~/.claude/skills/`) · `-a <agent>` (cible un harness précis) · `-y` (skip confirmations).

---

### MCP (Model Context Protocol) - outils externes

Concept détaillé dans [`CONCEPTS-IA.md`](./CONCEPTS-IA.md#mcp-model-context-protocol). Côté pratique : un MCP s'installe via CLI et peut être configuré **globalement** (tous tes projets) ou **par projet** (dans `.claude/`).

#### Installer un MCP globalement

```bash
# Syntaxe générale
claude mcp add <nom> -- <commande-de-lancement>

# Exemple
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

#### Lister / supprimer les MCP

```bash
claude mcp list
claude mcp remove <nom>
```

---

### Context7 - documentation des librairies en temps réel

Doc à jour des librairies (Express, React, Zod, Vitest, pg...) directement en conversation.

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

Utilisé automatiquement par Claude, ou explicitement : `Utilise context7 pour...`.

**Permissions :** `.claude/settings.json` autorise déjà Context7 sans confirmation :

```json
{
    "permissions": {
        "allow": ["mcp__plugin_context7_context7__query-docs", "mcp__plugin_context7_context7__resolve-library-id"]
    }
}
```

> Si tu ajoutes d'autres MCP, ajoute leurs permissions dans ce fichier pour éviter les confirmations répétées. Le pattern est `mcp__<nom-du-mcp>__<nom-de-loutil>`.

---

### Obsidian skills - gestion des notes de projet

Pas de MCP Obsidian : la gestion du vault passe par le plugin **[obsidian-skills de kepano](https://github.com/kepano/obsidian-skills)**.

```bash
claude plugin install https://github.com/kepano/obsidian-skills
```

| Skill                        | Usage                                                       |
| ---------------------------- | ----------------------------------------------------------- |
| `obsidian:obsidian-cli`      | Lire/créer/rechercher notes et tâches via le CLI `obsidian` |
| `obsidian:obsidian-markdown` | Wikilinks, embeds, callouts, frontmatter                    |
| `obsidian:obsidian-bases`    | Fichiers `.base` (vues type BDD)                            |
| `obsidian:json-canvas`       | Fichiers `.canvas` (mind maps, flowcharts)                  |
| `obsidian:defuddle`          | Extraction web → Markdown propre                            |

> Utilise le [CLI natif `obsidian`](https://help.obsidian.md/cli) via socket local - l'app doit être **lancée**. Sinon, Claude lit/écrit le vault directement (`Read`/`Edit`/`Write`).

---

### Agents personnalisés

Concept et structure de fichier détaillés dans [`CONCEPTS-IA.md`](./CONCEPTS-IA.md#skills-plugins-et-subagents). Ce repo inclut :

| Agent             | Rôle                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `obsidian-expert` | Expert Obsidian : notes structurées, plugins (Dataview, Templater, Tasks...), templates, organisation du vault |

> Le champ `memory: project` dans le frontmatter (utilisé par `obsidian-expert`) active une mémoire persistante propre à l'agent (dans `~/.claude/agent-memory/<nom-agent>/`), distincte de la mémoire de la session principale - une particularité Claude Code non couverte dans le glossaire général.

---

## Design - maquette client avant le code

Avant le code, remplir les deux templates du dossier [`design/`](./design) pour cadrer le projet avec le client :

| Fichier                                                                | Contenu                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| [`design/design.md`](./design/design.md)                               | Charte graphique : identité, palette, typo, composants UI     |
| [`design/instructions-maquette.md`](./design/instructions-maquette.md) | Maquettage : écrans, navigation, règles UX, modèle de données |

```bash
cp agentic-workflow-files/design/design.md mon-projet/design.md
cp agentic-workflow-files/design/instructions-maquette.md mon-projet/instructions-maquette.md
```

Remplir (placeholders `{{...}}`) → donner en contexte à Claude pour générer la maquette → une fois validée par le client, elle sert de référence pour l'implémentation (étape 4 du [`WORKFLOW.md`](./WORKFLOW.md)).

---

## Workflow bout-en-bout : Sprint Obsidian → Code → PR GitHub

Voir [`WORKFLOW.md`](./WORKFLOW.md) : capture des tâches (Obsidian skills) → suivi sprint dans le vault → implémentation → commit/push → PR (`gh`) → revue (`/code-review`) → tâche cochée dans Obsidian.

---

## Écrire le CLAUDE.md d'un projet

`~/.claude/AGENTS.md` (global) ne contient volontairement aucun détail de projet. Chaque projet a son propre `CLAUDE.md` à la racine, à écrire à la main, avec ce type de structure :

```markdown
# CLAUDE.md

## Vue d'ensemble

Application de gestion des congés pour PME. Utilisateurs : RH (admin) et employés.

## Entités principales

- users, leave_requests, leave_types, departments

## Variables d'environnement

- DATABASE_URL, JWT_SECRET, SMTP_HOST, PORT

## Patterns spécifiques

- Les demandes de congé sont scopées par département (id_department)
- Workflow d'approbation : pending → approved / rejected
```

Les guidelines générales (stack, conventions, sécurité, git...) n'ont pas à être répétées ici - elles sont déjà chargées via `~/.claude/AGENTS.md`.

---

## Skills disponibles

| Commande          | Description                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- |
| `/stack-review`   | Revue de code : sécurité, qualité, architecture, performance (checklist propre à ce repo - distinct du `/code-review` natif) |
| `/debug`          | Débogage structuré : localisation → hypothèses → correction → prévention               |
| `/refactor`       | Refacto sécurisé : plan avant action, vérification que le comportement ne change pas   |
| `/add-entity`     | Création d'une entité full-stack avec checklist complète                               |
| `/write-tests`    | Rédaction de tests unitaires et d'intégration Vitest                                   |
| `/security-audit` | Audit de sécurité OWASP : injection, auth, IDOR, exposition de données                 |
| `/prep`           | Prépare une tâche complexe (doc, remise en question, angles morts) avant le plan       |
| `/prep-check`     | Vérifie que `/prep` est complet avant d'entrer en mode plan                            |
| `/roast`          | Revue de code sans complaisance, façon senior - au-delà de la checklist `/stack-review` |
| `/ai-news`        | Briefing IA quotidien : actus modèles, économie, robotique, régulation                 |
| `/competitor-benchmark` | Benchmark d'une app concurrente (URL) : inventaire de ses features vs celles du projet |
| `/learn`          | Cours express de 10 min sur un sujet dev précis, avec sources fiables et exercice      |

### Utilisation

Dans Claude Code, utilise les skills avec `/nom-du-skill` suivi du contexte :

```
/stack-review backend/routes/user.routes.ts
/debug La liste des utilisateurs ne se charge plus après le login
/add-entity une entité "department" avec nom, description et un responsable (FK vers users)
/write-tests backend/services/user.services.ts
/security-audit backend/routes/auth.routes.ts
/prep Ajouter un système de notifications temps réel pour les demandes de congé
/prep-check Ajouter un système de notifications temps réel pour les demandes de congé
/roast backend/services/leaveRequest.services.ts
/competitor-benchmark https://app-concurrente.com
/learn les principes SOLID
```

---

## Concepts IA - glossaire et fondamentaux

Voir [`CONCEPTS-IA.md`](./CONCEPTS-IA.md) : glossaire LLM/agents IA (harness, tokens, contexte, RAG, MCP, choix de modèle) avec exemples concrets.
