# agentic-workflow-files

Kit de développement agentique pour Claude Code et OpenCode, conçu pour les projets **TypeScript / Node.js / React / PostgreSQL**.

Ce repo est la **sauvegarde versionnée** de la config en scope utilisateur de plusieurs harnais (`~/.claude/`, `~/.config/opencode/`) - guidelines de dev communes (`AGENTS.md`), skills, agents, commandes. La vraie source de vérité vit dans ces dossiers globaux ; ce repo n'est lu par aucun harnais, il sert à versionner/cloner cette config sur d'autres machines. Voir [`STRUCTURE-AGNOSTIQUE.md`](./STRUCTURE-AGNOSTIQUE.md) pour le schéma complet.

---

## Table des matières

- [Stack cible](#stack-cible)
- [Contenu](#contenu)
- [`CLAUDE.md` vs `AGENTS.md`](#claudemd-vs-agentsmd)
- [Installation](#installation)
    - [Prérequis](#prérequis)
    - [Démarrer un nouveau projet de code](#démarrer-un-nouveau-projet-de-code)
- [Configuration](#configuration)
    - [Skills vs MCP vs Plugins - quelle différence ?](#skills-vs-mcp-vs-plugins--quelle-différence)
    - [Plugins](#plugins)
    - [`skills.sh` - installer des skills externes via CLI](#skillssh--installer-des-skills-externes-via-cli)
    - [MCP (Model Context Protocol) - outils externes](#mcp-model-context-protocol--outils-externes)
    - [Context7 - documentation des librairies en temps réel](#context7--documentation-des-librairies-en-temps-réel)
    - [Obsidian skills - gestion des notes de projet](#obsidian-skills--gestion-des-notes-de-projet)
    - [Agents personnalisés](#agents-personnalisés)
    - [Agent orchestrateur](#agent-orchestrateur)
- [Design - maquette client avant le code](#design--maquette-client-avant-le-code)
- [Workflow bout-en-bout : Sprint Obsidian → Code → PR GitHub](#workflow-bout-en-bout--sprint-obsidian--code--pr-github)
- [Écrire l'AGENTS.md d'un projet](#écrire-lagentsmd-dun-projet)
- [Skills disponibles](#skills-disponibles)
    - [Évaluer un skill (`claude plugin eval`)](#évaluer-un-skill-claude-plugin-eval)
- [Concepts IA - glossaire et fondamentaux](#concepts-ia--glossaire-et-fondamentaux)
- [Atelier - tester un nouveau modèle open-weight](#atelier---tester-un-nouveau-modèle-open-weight)

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
├── TEST-MODELES.md                  ← Cheat-sheet : tester un nouveau modèle open-weight via OpenRouter + OpenCode
├── design/
│   ├── design.md                    ← Charte graphique (Brand Guide) à remplir pour le client
│   └── instructions-maquette.md     ← Instructions de maquettage (écrans, navigation, règles UX)
├── .claude/                         ← backup de ~/.claude/ (scope utilisateur Claude Code)
│   ├── AGENTS.md                    ← Guidelines de dev communes à tous les projets (stack, conventions, sécurité, git)
│   ├── CLAUDE.md                    ← Import `@AGENTS.md`
│   ├── settings.json                ← Permissions MCP (Context7) + plugins activés (Playwright, Superpowers, Claude Pulse, Obsidian skills)
│   ├── agents/
│   │   ├── obsidian-expert.md       ← Agent custom : expertise Obsidian (notes, plugins, templates)
│   │   └── deep-review.md           ← Agent orchestrateur : revue de code en 3 passes parallèles (sécu/perf/tests)
│   └── skills/                      ← un sous-dossier par skill, `<nom>/SKILL.md` (format standard, aucun fichier plat) :
│                                       stack-review, debug, refactor, add-entity, write-tests,
│                                       security-audit, prep, prep-check, roast, competitor-benchmark,
│                                       ai-news, learn, pulse (fourni par le plugin Claude Pulse, pas écrit à la main)
│                                       - 10 d'entre eux ont une suite `evals/` (voir Évaluer un skill, plus bas)
│                                       (détail de chaque commande dans Skills disponibles, plus bas)
└── .opencode/                       ← backup de ~/.config/opencode/ (scope utilisateur OpenCode)
    ├── AGENTS.md                    ← symlink vers ../.claude/AGENTS.md (un seul fichier, agnostique du harnais)
    └── opencode.json               ← config OpenCode : MCP Context7 (clé via {env:CONTEXT7_API_KEY}, pas dans le repo)
```

Chaque projet garde ensuite son propre `AGENTS.md` - voir [Écrire l'AGENTS.md d'un projet](#écrire-lagentsmd-dun-projet).

---

## `CLAUDE.md` vs `AGENTS.md`

Au scope **utilisateur** (global), ce repo utilise les deux (`CLAUDE.md` → `@AGENTS.md`) pour rester lisible par Claude Code même dans les sessions qui ne supportent pas encore la lecture native d'`AGENTS.md`, et par tout outil compatible [AGENTS.md](https://agents.md/) (OpenCode, Codex...). Explication complète (pourquoi, précédence, symlink vs import) dans [`CONCEPTS-IA.md`](./CONCEPTS-IA.md#le-fichier-dinstructions-racine--claudemd-et-agentsmd).

Au scope **projet**, plus de `CLAUDE.md` : un seul `AGENTS.md` à la racine, lu nativement par Claude Code (v2.1.277+) et partagé avec les autres harnais.

⚠️ Pas de copie dédiée par harnais dans ce repo : [`.claude/AGENTS.md`](./.claude/AGENTS.md) est la seule source à copier-coller (pas de symlink, un fichier qui diverge silencieusement est pire qu'une copie à resynchroniser à la main) dans le dossier de config global de tout **nouveau** harnais compatible `AGENTS.md` que tu branches (ex. `~/.codex/AGENTS.md` pour Codex) - après toute modif des guidelines, répercuter dans `~/.claude/AGENTS.md` **et** `.claude/AGENTS.md` de ce repo, puis recopier vers chaque harnais qui n'a pas de lien vivant vers l'un des deux (OpenCode a un symlink, donc rien à refaire pour lui).

---

## Installation

### Prérequis

- [Claude Code CLI](https://code.claude.com/docs) installé - seul outil obligatoire, le reste de ce repo fonctionne sans les autres.
- OpenCode installé, **seulement** si tu comptes t'en servir en plus de Claude Code - pas fait par ce repo, voir [Setup OpenCode](./TEST-MODELES.md#setup-une-seule-fois) dans `TEST-MODELES.md`.

Ce repo se clone une fois par machine, pour restaurer la config **scope utilisateur** (pas pour être copié dans chaque projet de code) :

```bash
git clone https://github.com/JulienLach/agentic-workflow-files.git
```

⚠️ Si `~/.claude/` a déjà du contenu (une install existante, pas une machine neuve), `cp -r ... ~/.claude/` ci-dessous **écrase** les fichiers de même nom (`settings.json` compris) sans confirmation. Inspecter `~/.claude/` avant, ou fusionner à la main plutôt qu'un `cp -r` aveugle si tu as déjà des réglages spécifiques à cette machine.

```bash
# Restaurer la config Claude Code (scope utilisateur)
cp -r agentic-workflow-files/.claude/* ~/.claude/

# Restaurer la config OpenCode (scope utilisateur) - seulement si OpenCode est installé (voir Prérequis)
mkdir -p ~/.config/opencode
ln -sf ~/.claude/AGENTS.md ~/.config/opencode/AGENTS.md          # symlink, pas une copie
cp agentic-workflow-files/.opencode/opencode.json ~/.config/opencode/opencode.json

# Clé API Context7 (commune aux deux harnais, jamais commitée) - dans le fichier de conf de ton shell
# (~/.zshrc pour zsh, ~/.bashrc pour bash...) :
#   export CONTEXT7_API_KEY="ctx7sk-..."   # clé depuis https://context7.com/dashboard
```

Une fois ça fait, `~/.claude/AGENTS.md` (guidelines communes) et les skills/agents/commandes sont disponibles automatiquement dans **tous** tes projets, sans rien copier dedans. Pour vérifier que la config a bien été prise en compte, lancer `claude` dans un dossier quelconque et taper `/context` : la liste des **Memory files** doit inclure `~/.claude/CLAUDE.md` (qui importe `AGENTS.md`).

`CONTEXT7_API_KEY` est lue depuis l'environnement du shell par les deux harnais : Claude Code via `${CONTEXT7_API_KEY}` dans le `.mcp.json` du plugin `context7`, OpenCode via `{env:CONTEXT7_API_KEY}` dans `opencode.json`. Sans elle, le serveur MCP Context7 renvoie `HTTP 401`.

### Démarrer un nouveau projet de code

Un nouveau projet n'a besoin que de son propre `AGENTS.md` - voir [Écrire l'AGENTS.md d'un projet](#écrire-lagentsmd-dun-projet) plus bas.

---

## Configuration

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

#### Playwright

Plugin officiel Anthropic (marketplace `claude-plugins-official`, même source que Context7) : navigateur headless scriptable via MCP - utilisé pour vérifier réellement un changement UI/frontend (voir étape 4 du [`WORKFLOW.md`](./WORKFLOW.md)), pas seulement la compilation/les tests unitaires.

```bash
claude plugin install playwright@claude-plugins-official
```

En complément, installer aussi le MCP directement en scope user (tous les projets) - c'est lui qui sert au quotidien :

```bash
claude mcp add --scope user playwright -- npx @playwright/mcp@latest
```

> Plugin et MCP lancent la même commande (`npx @playwright/mcp@latest`) : Claude Code dédoublonne et n'en garde qu'un, le doublon est inoffensif. Le plugin reste activé dans `settings.json` comme filet de sécurité sur une machine où le MCP n'aurait pas été ajouté.

---

#### Claude Pulse

Statusline personnalisable (thèmes, couleurs, animations, coût de session en temps réel) - pas lié au workflow de dev, juste du confort d'affichage dans le terminal.

```bash
claude plugin install claude-pulse@anthropic-plugin-directory
```

> Ce plugin installe aussi un skill `/pulse` (visible dans `.claude/skills/pulse/`) qui pilote sa config - distinct des skills métier de ce repo listés dans [Skills disponibles](#skills-disponibles), il vient avec le plugin plutôt qu'écrit à la main.

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

Concept détaillé dans [`CONCEPTS-IA.md`](./CONCEPTS-IA.md#mcp-model-context-protocol). Côté pratique : un MCP s'installe via CLI et peut être configuré **globalement** (tous tes projets) ou **par projet**. Par défaut, `claude mcp add` installe en scope `local` (dossier courant uniquement) : pour un MCP global, toujours passer `--scope user` (config stockée dans `~/.claude.json`).

#### Installer un MCP globalement

```bash
# Syntaxe générale
claude mcp add --scope user <nom> -- <commande-de-lancement>

# Exemple
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp
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
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp
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
| `obsidian-expert` | Expert Obsidian : notes structurées, plugins (Dataview, Tasks, Advanced Canvas...), templates, organisation du vault |
| `deep-review`     | Orchestrateur de revue de code : délègue 3 passes parallèles (sécurité, perf, tests) à des workers puis synthétise. Voir [Agent orchestrateur](#agent-orchestrateur). |

> Le champ `memory: project` dans le frontmatter (utilisé par `obsidian-expert`) active une mémoire persistante propre à l'agent (dans `~/.claude/agent-memory/<nom-agent>/`), distincte de la mémoire de la session principale - une particularité Claude Code non couverte dans le glossaire général.

**Vs les skills `obsidian:*`** : les skills sont la mécanique (lire/écrire le vault via le CLI) ; l'agent est le jugement + la mémoire persistante propre au vault (conventions, structure) au-dessus, dans un contexte isolé.

**Invoquer** : auto (Claude route si la tâche correspond) ou explicite - *"utilise l'agent obsidian-expert pour..."* force l'agent plutôt qu'un skill.

### Agent orchestrateur

Un agent peut en piloter d'autres : il reçoit une tâche large, la découpe, lance plusieurs subagents (éventuellement chacun sur un modèle différent), puis fusionne leurs retours en une seule réponse. C'est le pattern [Orchestrator-Workers](./CONCEPTS-IA.md#orchestrator-workers). À réserver à une orchestration **récurrente** - pour un besoin ponctuel, l'agent principal sait déjà orchestrer à la volée sans qu'on écrive de fichier.

Ce repo fournit **`deep-review`** ([`.claude/agents/deep-review.md`](./.claude/agents/deep-review.md)) : sur un diff / une PR / un fichier, il lance **trois workers `general-purpose` en parallèle** (sécurité OWASP, performance, couverture de tests), attend leurs retours, puis rend une seule liste `chemin:ligne - problème - correctif` classée par sévérité. Invoquer : *"deep-review sur cette PR"*, ou avant un merge sensible.

Points clés de ce genre d'agent :

- **`tools: Agent, ...` obligatoire dans le frontmatter** - sans l'outil `Agent`, l'orchestrateur ne peut pas lancer de workers. Claude Code autorise l'imbrication jusqu'à 3 niveaux sous la session principale (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`).
- **Modèles différenciés** : `model: opus` sur l'orchestrateur qui planifie et synthétise ; les workers tournent sur le modèle hérité, ou un modèle plus léger (Haiku) passé à l'outil `Agent` pour réduire le coût des passes de lecture.
- **Lecture seule** : pas de `Write`/`Edit`, l'agent propose des correctifs, il ne les applique pas.
- Un cran au-dessus (plusieurs harnais différents en parallèle, pas juste des subagents du même harness) : **Orca**, voir [`CONCEPTS-IA.md`](./CONCEPTS-IA.md#8-panorama-des-outils).

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

## Écrire l'AGENTS.md d'un projet

`~/.claude/AGENTS.md` (global) ne contient volontairement aucun détail de projet. Chaque projet a son propre `AGENTS.md` à la racine, à écrire à la main, avec ce type de structure :

```markdown
# AGENTS.md

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

### Évaluer un skill (`claude plugin eval`)

10 des skills ci-dessus ont une suite d'éval sous `evals/` (`prompt.md` + `graders/criteria.md`) - un cas de test qui compare la réponse **avec** le skill vs **sans** (baseline), noté par un juge LLM. Sert à vérifier qu'une modif d'un skill l'améliore plutôt que de le casser, avant de la committer :

```bash
cd .claude/skills/<nom-du-skill>
claude plugin eval . --runs 1 --trust-plugin --no-publish
```

`ai-news`, `competitor-benchmark` et `pulse` n'en ont pas : ils dépendent du web en temps réel (non-déterministe, coûteux) ou modifient une vraie config (`pulse`), pas adaptés à ce genre de test automatisé.

---

## Concepts IA - glossaire et fondamentaux

Voir [`CONCEPTS-IA.md`](./CONCEPTS-IA.md) : glossaire LLM/agents IA (harness, tokens, contexte, RAG, MCP, choix de modèle) avec exemples concrets.

---

## Atelier - tester un nouveau modèle open-weight

Voir [`TEST-MODELES.md`](./TEST-MODELES.md) : méthode rapide pour tester un modèle open-weight qui vient de sortir (Kimi, Command R+, Qwen, DeepSeek...) avec OpenCode comme harnais - via OpenRouter (cloud, sans GPU) ou Ollama (local, avec GPU).
