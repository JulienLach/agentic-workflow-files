# Structure agnostique du harnais - Claude Code / OpenCode

Une seule source de vérité (`~/.claude/AGENTS.md`), lue par les deux harnais actuellement branchés dessus, sauvegardée à part.

```mermaid
flowchart LR
    SRC["~/.claude/AGENTS.md<br/><b>source unique</b><br/>guidelines communes à tous les projets"]

    CC["Claude Code<br/>CLAUDE.md → @AGENTS.md"]
    OC["OpenCode<br/>AGENTS.md (symlink)"]
    BACKUP["agentic-workflow-files/.claude/<br/>backup git, cloné sur les autres machines"]
    ROOT["agentic-workflow-files/AGENTS.md<br/>copie racine, prête à coller dans<br/>tout autre harnais (ex. Codex, pas encore branché)"]
    PROJ["Chaque projet (radar, ...)<br/>son propre AGENTS.md, spécifique"]

    SRC -->|lu par| CC
    SRC -. symlink .-> OC
    SRC -. copie manuelle .-> BACKUP
    SRC -. copie manuelle .-> ROOT
    CC -->|+ complété par| PROJ
```

## Légende

- **`SRC`** : le seul endroit où on édite les guidelines générales (stack, conventions, sécurité, git, hooks, skills).
- **`CC` / `OC`** : chaque harnais lit `SRC`, l'un par import, l'autre par symlink - un seul fichier, deux points de lecture.
- **`BACKUP`** : copie de sauvegarde versionnée (git) de `~/.claude/` en entier (skills, agents, settings), **pas de lien vivant** - à resynchroniser à la main après une modif de `SRC`.
- **`ROOT`** : même contenu que `SRC`, mais positionné à la racine du repo pour être copié-collé tel quel dans le dossier de config global de n'importe quel autre harnais compatible `AGENTS.md` (ex. `~/.codex/AGENTS.md`) - **pas de lien vivant non plus**, une 3ᵉ copie à resynchroniser à la main.
- **`PROJ`** : un projet n'a que ses propres détails (entités, schéma, patterns) - jamais les guidelines générales, déjà chargées via `SRC`.
