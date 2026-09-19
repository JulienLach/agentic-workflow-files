# Structure agnostique du harnais - Claude Code / OpenCode

Une seule source de vérité (`~/.claude/AGENTS.md`), lue par les deux harnais actuellement branchés dessus, sauvegardée à part.

```mermaid
flowchart LR
    SRC["~/.claude/AGENTS.md<br/><b>source unique</b><br/>guidelines communes à tous les projets"]

    CC["Claude Code<br/>CLAUDE.md → @AGENTS.md"]
    OC["OpenCode<br/>AGENTS.md (symlink)"]
    BACKUP["agentic-workflow-files/.claude/<br/>backup git, cloné sur les autres machines"]
    PROJ["Chaque projet (radar, ...)<br/>son propre AGENTS.md, spécifique"]
    NEW["Nouveau harnais (ex. Codex)<br/>~/.codex/AGENTS.md - pas encore branché"]

    SRC -->|lu par| CC
    SRC -. symlink .-> OC
    SRC -. copie manuelle .-> BACKUP
    BACKUP -. copier .claude/AGENTS.md .-> NEW
    CC -->|+ complété par| PROJ
```

## Légende

- **`SRC`** : le seul endroit où on édite les guidelines générales (stack, conventions, sécurité, git, hooks, skills).
- **`CC` / `OC`** : chaque harnais lit `SRC`, l'un par import, l'autre par symlink - un seul fichier, deux points de lecture.
- **`BACKUP`** : copie de sauvegarde versionnée (git) de `~/.claude/` en entier (skills, agents, settings), **pas de lien vivant** - à resynchroniser à la main après une modif de `SRC`.
- **`NEW`** : pour brancher un harnais supplémentaire, copier `.claude/AGENTS.md` (de ce repo, ou directement `~/.claude/AGENTS.md`) dans son dossier de config global - pas de copie dédiée à la racine du repo, une seule source à recopier à la demande.
- **`PROJ`** : un projet n'a que ses propres détails (entités, schéma, patterns) - jamais les guidelines générales, déjà chargées via `SRC`.
