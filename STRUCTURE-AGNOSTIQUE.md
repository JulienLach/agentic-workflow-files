# Structure agnostique du harnais - Claude Code / OpenCode

Une seule source de vérité (`~/.claude/AGENTS.md`), lue par les deux harnais actuellement branchés dessus, sauvegardée à part.

```mermaid
flowchart LR
    SRC["~/.claude/AGENTS.md<br/><b>source unique</b><br/>guidelines communes à tous les projets"]

    CC["Claude Code<br/>~/.claude/<br/>CLAUDE.md → @AGENTS.md"]
    OC["OpenCode<br/>~/.config/opencode/<br/>AGENTS.md (symlink)"]
    BACKUP["agentic-workflow-files/<br/>.claude/ et .opencode/<br/>backup git, cloné sur les autres machines"]
    PROJ["Chaque projet<br/>son propre AGENTS.md, spécifique"]
    NEW["Nouveau harnais (ex. Codex)<br/>~/.codex/AGENTS.md - pas encore branché"]

    SRC -->|lu par| CC
    SRC -. symlink .-> OC
    SRC -. copie manuelle .-> BACKUP
    CC -. "skills, agents, settings partageables" .-> BACKUP
    OC -. "opencode.json" .-> BACKUP
    BACKUP -. "copier .claude/AGENTS.md" .-> NEW
    CC -->|+ complété par| PROJ
    OC -->|+ complété par| PROJ
```

## Légende

- **`SRC`** : le seul endroit où on édite les guidelines générales (stack, conventions, sécurité, git, hooks, skills).
- **`CC` / `OC`** : chaque harnais lit `SRC`, l'un par import, l'autre par symlink - un seul fichier, deux points de lecture. Chacun garde aussi sa propre config dans son dossier global.
- **`BACKUP`** : sauvegarde versionnée (git), lue par aucun harnais et **sans lien vivant** - à resynchroniser à la main après une modif. `.claude/` contient `AGENTS.md`, les skills, les agents et un `settings.json` partageable, sans les réglages propres à la machine. `.opencode/` contient `opencode.json` et un symlink vers `.claude/AGENTS.md`.
- **`NEW`** : pour brancher un harnais supplémentaire, copier `.claude/AGENTS.md` (de ce repo, ou directement `~/.claude/AGENTS.md`) dans son dossier de config global - pas de copie dédiée à la racine du repo, une seule source à recopier à la demande.
- **`PROJ`** : un projet n'a que ses propres détails (entités, schéma, patterns) - jamais les guidelines générales, déjà chargées via `SRC`.
