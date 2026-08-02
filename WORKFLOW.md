# Workflow — Sprint Obsidian → Code → PR GitHub

Ce document décrit le cycle complet utilisé pour piloter le développement d'un projet depuis un **vault Obsidian** (backlog/sprints) jusqu'à une **Pull Request GitHub**, via **Claude Code**, le **CLI Obsidian** et **`gh` CLI**.

Il complète le `AGENTS.md` (conventions de code) et le `README.md` (setup des skills/MCP) de ce repo : ceux-ci décrivent *comment coder*, celui-ci décrit *comment on articule réunion → tâche → code → PR → mise à jour du suivi*.

---

## Vue d'ensemble

```
┌────────────────┐  0. point dev /   ┌─────────────────────┐
│  Réunion /       │  recette client │  Vault Obsidian       │
│  recette client  │ ───────────────▶│  Sprint NN.md          │
└────────────────┘   (Obsidian CLI)  │  - [ ] nouvelle tâche  │
                                     └─────────────────────┘
                                              │ 1. choisir une tâche
                                              ▼
┌─────────────────────┐  5. revue solo dev  ┌──────────────────┐
│  gh pr create          │ ◀──────────────── │  Repo de code      │
│  (GitHub)              │   2-3. commit/push │  (feat/xxx)         │
└─────────────────────┘                     └──────────────────┘
        │
        │ 6. merge + cocher la tâche
        ▼
┌─────────────────────┐
│  Vault Obsidian        │
│  - [x] tâche ✅ date    │
└─────────────────────┘
```

Le vault Obsidian et le repo de code sont deux répertoires distincts sur la même machine. Claude Code peut passer de l'un à l'autre de deux façons :
- **CLI Obsidian** (`obsidian ...`, binaire dans `~/.local/bin/obsidian`) — nécessite qu'Obsidian soit **lancé** (le CLI communique avec l'app via un socket local). Pratique pour capturer/lister des notes et des tâches sans quitter le terminal.
- **Lecture/écriture directe des fichiers** (`Read`, `Edit`, `Write`) via le chemin absolu du vault (`~/Documents/vault/...`) — toujours possible, même si Obsidian n'est pas lancé ou si `obsidian` n'est pas dans le `PATH`. Indispensable pour les insertions précises **sous un sous-titre donné**, que le CLI ne gère pas (`append`/`prepend` n'agissent que sur le début/la fin du fichier entier).

---

## 0. Capturer les tâches depuis un point dev / une recette client (Obsidian CLI)

Après une réunion (point dev interne, recette client), transformer les échanges en tâches de sprint plutôt que de les laisser dans des notes volantes :

1. **Noter à chaud** pendant/juste après la réunion, dans une note dédiée ou la note du jour :
   ```bash
   obsidian daily:append content="## Point dev 2026-07-15\n- Rozenn: retirer les phases non nécessaires à la sync\n- Anthony: tester la modif de phase a posteriori"
   ```
   ou une note dédiée :
   ```bash
   obsidian create name="Recette client 2026-07-15" content="- Retour Laurent: ..." folder="Projets/Simon Médical/notes"
   ```
2. **Demander à Claude Code de structurer** : « transforme les notes de la réunion du 15/07 en tâches dans le Sprint courant ». Claude :
   - lit la note de réunion (`obsidian read file="..."` ou lecture directe) ;
   - lit le sprint courant pour repérer le bon sous-titre (ex. `#### App Audit`) ;
   - insère les nouvelles lignes `- [ ] ...` **sous ce sous-titre précis**, via édition directe du fichier (le CLI `append` ajouterait à la fin du fichier entier, pas sous la bonne section).
3. Vérifier le résultat (`obsidian read path="Projets/<Projet>/sprints/Sprint NN.md"`) avant de passer à l'implémentation.

> Si `obsidian: command not found` : vérifier qu'Obsidian est ouvert et que `~/.local/bin` est dans le `PATH`. À défaut, revenir à la lecture/écriture directe des fichiers du vault (équivalente pour cet usage).

---

## 1. Suivi des tâches dans Obsidian

Chaque projet a ses sprints dans `Projets/<Projet>/sprints/Sprint NN.md`, avec un frontmatter commun :

```yaml
---
numero: 10
titre: Titre du sprint
statut: active   # planifié | active | done
debut: 2026-06-18
fin: 2026-07-31
progression: 60  # % — mis à jour à la main
type: sprint
tags: [project, sprint]
---
```

Les tâches suivent le format checklist du plugin **Tasks** :

```markdown
- [ ] Tâche non faite
- [x] Tâche faite ✅ 2026-06-18
```

Quand un projet couvre plusieurs sous-thèmes (ex. Configurateur / App Audit / Axelor pour ET2I), les tâches sont regroupées sous des sous-titres (`#### App Audit`) — ça permet de retrouver rapidement à quoi correspond une tâche et de filtrer par sous-projet.

**Pour demander une tâche à Claude Code** : « fais la tâche X du sprint N » → Claude ouvre `Sprint 0N.md`, repère la section correspondante et la ligne `- [ ]` associée.

---

## 2. Implémentation dans le repo de code

1. Se placer sur la branche principale de dev du repo (`develop` ou `main` selon le projet) et créer une branche dédiée, avec le nommage défini dans `AGENTS.md` :

   | Préfixe | Usage |
   |---|---|
   | `feat/nom-de-la-feature` | Nouvelle fonctionnalité |
   | `fix/description-du-bug` | Correction de bug |
   | `chore/tâche-technique` | Tâche technique (deps, config, CI) |
   | `refactor/scope-du-refacto` | Refacto sans changement de comportement |

   ```bash
   git checkout -b feat/nom-de-la-feature
   ```
2. Implémenter en suivant le `AGENTS.md` du repo concerné (stack, conventions, tests).
3. Vérifier (tests, lint, exécution locale) avant de committer.

---

## 3. Commit & Push

Les règles de commit sont **celles définies dans `AGENTS.md`** — ce workflow ne fait que les appliquer, il n'en redéfinit aucune :

- **Format (Conventional Commits)** : `type(scope): description courte`

  | Type | Usage |
  |---|---|
  | `feat` | Nouvelle fonctionnalité |
  | `fix` | Correction de bug |
  | `refactor` | Refacto sans changement de comportement |
  | `test` | Ajout ou modification de tests |
  | `chore` | Tâche technique (deps, config, CI) |
  | `docs` | Documentation uniquement |
  | `perf` | Amélioration de performance |

- **Message en anglais** (convention standard open source) — même si le reste des échanges avec Claude se fait en français.
- **Une seule responsabilité par commit** — ne pas mélanger un `feat` et un `fix` dans le même commit.
- **Jamais de ligne `Co-Authored-By: Claude`** dans le message — c'est le comportement par défaut de certains outils Git assistés par IA, il doit être explicitement désactivé ici.

```bash
git add <fichiers>
git commit -m "feat(auth): add password reset via email"
git push -u origin feat/nom-de-la-feature
```

---

## 4. Pull Request avec `gh` CLI

Le titre de la PR suit la même convention que les commits (`type(scope): description`, en anglais), pour rester cohérent avec l'historique Git :

```bash
gh pr create --title "feat(auth): add password reset via email" --body "$(cat <<'EOF'
## Summary
- ...

## Test plan
- [ ] ...
EOF
)"
```

### Environnement sans `gh` ni credentials Git préinstallés (sandbox)

Certains environnements d'exécution (sandbox Claude Code sans accès root) n'ont ni `gh` ni identifiants Git configurés. Contournement qui fonctionne sans `sudo` :

1. Télécharger le binaire `gh` (release tarball sur `github.com/cli/cli/releases`), l'extraire, le copier dans `~/.local/bin/gh` (déjà dans le `PATH` en général, pas besoin de droits admin).
2. **L'utilisateur** doit lancer lui-même `gh auth login` (flux interactif par device code dans un navigateur) — Claude Code ne peut pas le faire à sa place.
3. Une fois authentifié : `gh auth setup-git`, pour que `git push`/`git pull` en HTTPS fonctionnent (sinon erreur `could not read Username`).

Avant de repartir de zéro sur un nouvel environnement, vérifier d'abord si `~/.local/bin/gh` existe déjà et si `gh auth status` est valide.

---

## 5. Revue de la PR (dev solo)

Pas de reviewer tiers humain sur ce workflow : **c'est le développeur qui fait la revue lui-même**, assisté par Claude Code, avant de merger. Ne pas sauter cette étape sous prétexte d'être seul sur le projet — c'est justement ce qui remplace la revue par les pairs.

1. Lancer une revue automatisée sur la branche de la PR :
   ```bash
   /code-review
   ```
   (vérifie la conformité au `AGENTS.md`, les bugs potentiels, la sécurité — voir la section Plugins du `README.md`)
2. Traiter les findings : corriger ce qui est bloquant, committer les corrections (nouveau commit, toujours Conventional Commits — pas d'amend sur un commit déjà pushé sans raison explicite).
3. Relire soi-même le diff final (`gh pr diff` ou l'interface GitHub) avant de merger.
4. Merger :
   ```bash
   gh pr merge --squash   # ou la stratégie de merge retenue pour le repo
   ```

---

## 6. Boucler : cocher la tâche dans Obsidian

Une tâche n'est considérée **terminée** que lorsque :
1. La PR est revue (étape 5) et mergée.
2. La checkbox correspondante dans le Sprint Obsidian est cochée avec sa date :
   ```markdown
   - [x] Tâche faite ✅ 2026-07-13
   ```
   ```bash
   obsidian task path="Projets/<Projet>/sprints/Sprint NN.md" line=<n> done
   ```

Ne pas oublier cette dernière étape — c'est elle qui garde le vault Obsidian comme source de vérité à jour sur l'avancement réel du sprint (`progression` du frontmatter à ajuster en conséquence, et `statut: done` quand toutes les tâches du sprint sont traitées ou reportées au sprint suivant).

---

## Résumé express

| Étape | Où | Action |
|---|---|---|
| 0 | Réunion → Vault Obsidian | Capturer les notes (`obsidian daily:append`/`create`), en extraire des tâches sous le bon sous-titre |
| 1 | Vault Obsidian | Repérer une tâche `- [ ]` dans le sprint courant |
| 2 | Repo de code | Créer une branche, implémenter, tester |
| 3 | Repo de code | Commit (Conventional Commits, anglais, sans `Co-Authored-By`) + push |
| 4 | GitHub (`gh` CLI) | `gh pr create` |
| 5 | Repo de code / GitHub | Revue solo dev (`/code-review`) puis `gh pr merge` |
| 6 | Vault Obsidian | Cocher la tâche `- [x] ... ✅ date`, mettre à jour `progression`/`statut` |
