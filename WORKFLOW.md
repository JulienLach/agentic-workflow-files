# Workflow IA — Obsidian → Claude Code → Code → PR GitHub

Ce document décrit le cycle complet utilisé pour piloter le développement d'un projet depuis un **vault Obsidian** (backlog/sprints) jusqu'à une **Pull Request GitHub**, avec **Claude Code** comme hub central (contexte, plugins, skills, agents), le **CLI Obsidian** et **`gh` CLI**.

Il complète le `AGENTS.md` (conventions de code) et le `README.md` (setup des skills/MCP) de ce repo : ceux-ci décrivent *comment coder*, celui-ci décrit *comment on articule réunion → tâche → conception → code → PR → mise à jour du suivi*.

---

## Vue d'ensemble

```
┌───────────────────────────────────────────────────────────────────────┐
│                              Vault Obsidian                             │
│                                                                          │
│   Projets ──▶ Index ──▶ Backlog ◀── Notes (réunions/recettes)           │
│      │           └────▶ Ressources                                     │
│      ▼                                                                 │
│   Sprints ◀───────────────────────┐                                    │
│      │                            │                                    │
│      ▼                            │ 6. boucler : cocher + MAJ progress │
│   Tâches ──────────────────────────┘                                   │
└──────────────────────┬───────────────────────────────────────────────┘
                        │ 1. choisir une tâche (Obsidian skills)
                        ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         Claude Code (hub central)                       │
│                                                                          │
│  AGENTS.md ──▶ context window        Plugins ──▶ Context7               │
│                                             └───▶ Obsidian skills        │
│  MCP Excalidraw ──▶ Conception / Architecture                           │
│                                                                          │
│  Skills ──▶ /code-review · /debug · /refactor · /security-audit …       │
│  Agents (.claude/agents/*.md) ──▶ Plan · Agent pédagogique · Agent autonome │
└──────────────────────┬───────────────────────────────────────────────┘
                        │ 4. implémentation
                        ▼
┌─────────────────────┐  5-6. commit/push + gh pr create  ┌──────────────────┐
│  Repo de code          │ ─────────────────────────────▶ │  GitHub (PR)       │
│  (feat/xxx)             │ ◀──────────────────────────── │  gh pr merge        │
└─────────────────────┘        7. revue solo dev (/code-review)  └──────────────────┘
```

Le vault Obsidian et le repo de code sont deux répertoires distincts sur la même machine. Claude Code peut passer de l'un à l'autre de deux façons :

- **Obsidian skills** (plugin `obsidian:*` — `obsidian-cli`, `obsidian-markdown`, `obsidian-bases`, `json-canvas`, `defuddle`) : ce sont les skills que Claude invoque pour lire/écrire dans le vault, y compris via le binaire CLI (`obsidian ...`, dans `~/.local/bin/obsidian`) — nécessite qu'Obsidian soit **lancé** (communication via socket local).
- **Lecture/écriture directe des fichiers** (`Read`, `Edit`, `Write`) via le chemin absolu du vault (`~/Documents/vault/...`) — toujours possible, même si Obsidian n'est pas lancé. Indispensable pour les insertions précises **sous un sous-titre donné**, que le CLI ne gère pas (`append`/`prepend` n'agissent que sur le début/la fin du fichier entier).

> Ce workflow n'utilise pas de MCP Obsidian : les **Obsidian skills** ([kepano/obsidian-skills](https://github.com/kepano/obsidian-skills), voir `README.md`) sont un plugin de skills Claude Code qui enveloppe le CLI natif `obsidian` — c'est la seule brique utilisée ici pour interagir avec le vault.

---

## 0. Conception / Architecture — MCP Excalidraw (optionnel)

Pour une tâche qui demande de clarifier une architecture ou un flux avant de coder (nouvelle entité complexe, refonte, intégration externe), passer par un schéma plutôt que d'improviser directement en code :

1. Demander à Claude Code de produire un schéma via le **MCP Excalidraw** : « fais-moi un schéma d'architecture pour [fonctionnalité] ».
2. Itérer sur le schéma jusqu'à ce que la structure soit claire (entités, flux de données, séquence d'appels).
3. Une fois validée, la conception sert de base à l'étape 1 (capture de la tâche) ou directement à l'étape 4 (implémentation) si la tâche existe déjà dans le sprint.

> Cette étape est **optionnelle** — à réserver aux tâches où un schéma apporte réellement de la clarté (architecture, refonte). Pour un bugfix ou une petite feature, passer directement à l'étape 1 ou 4.

---

## 1. Capturer les tâches depuis un point dev / une recette client (Obsidian skills)

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

Les notes de réunion et les tâches ponctuelles alimentent aussi le **Backlog** du projet (`Index` → `Backlog`) — utile pour tout ce qui n'est pas encore priorisé dans un sprint actif ; l'`Index` d'un projet pointe également vers ses **Ressources** (docs, liens, comptes-rendus).

> Si `obsidian: command not found` : vérifier qu'Obsidian est ouvert et que `~/.local/bin` est dans le `PATH`. À défaut, revenir à la lecture/écriture directe des fichiers du vault (équivalente pour cet usage).

---

## 2. Suivi des tâches dans Obsidian

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

## 3. Claude Code : le hub central

Une fois la tâche identifiée, tout se joue dans Claude Code, qui combine quatre briques :

- **Fichiers de contexte** (`AGENTS.md` du repo concerné) → chargés automatiquement dans la **context window** de la session, avant toute implémentation.
- **Plugins** → `Context7` (doc à jour des librairies) et `Obsidian skills` (lecture/écriture du vault, voir Vue d'ensemble).
- **Skills** (`.claude/skills/*.md` de ce repo) → invoqués à la demande selon le besoin :

  | Catégorie | Skills |
  |---|---|
  | Review | `/code-review` |
  | Débug | `/debug` |
  | Qualité du code | `/refactor`, `/write-tests`, `/security-audit` |

- **Agents personnalisés** (`.claude/agents/*.md`) → subagents avec instructions et outils dédiés, invocables via l'outil `Agent` :
  - `Plan` — agent intégré pour concevoir des plans d'implémentation.
  - `Agent pédagogique` — ton explicatif, pas-à-pas, pour comprendre une notion avant de l'implémenter.
  - `Agent autonome` — exécution en arrière-plan sur une tâche bien définie, sans allers-retours.

  > L'agent `obsidian-expert` est inclus dans ce repo (`.claude/agents/obsidian-expert.md`) — voir la section « Agents personnalisés » du `README.md`. Un agent du même nom existe aussi en config **globale** (`~/.claude/agents/`) : en cas de doublon, l'agent du repo (local au projet) prime.

---

## 4. Implémentation dans le repo de code

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

## 5. Commit & Push (manuel ou délégué à Claude)

Pas de hook configuré sur ce repo : le commit/changelog/push n'est **pas automatisé** par un mécanisme du harnais (voir note plus bas sur les hooks). Deux façons équivalentes de faire, selon le moment :

- **À la main** : tu tapes toi-même les commandes `git`/`gh`.
- **Via prompt à Claude** : tu demandes « commit et push cette modif » et Claude exécute les mêmes commandes, en respectant les règles ci-dessous.

Les règles de commit sont **celles définies dans `AGENTS.md`** — que ce soit toi ou Claude qui committe, ce sont les mêmes :

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

> **Envie d'une vraie automatisation ?** Un **hook** Claude Code (`PostToolUse` sur `Edit`/`Write`, ou `Stop` en fin de session) pourrait déclencher un lint ou un rappel de commit automatiquement — mais ce n'est pas configuré ici. Voir le skill `update-config` si tu veux en mettre un en place.

---

## 6. Pull Request avec `gh` CLI

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

## 7. Revue de la PR (dev solo)

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

## 8. Boucler : cocher la tâche dans Obsidian

Une tâche n'est considérée **terminée** que lorsque :
1. La PR est revue (étape 7) et mergée.
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
| 0 | Claude Code (MCP Excalidraw) | Schéma d'architecture/conception si la tâche le justifie *(optionnel)* |
| 1 | Réunion → Vault Obsidian | Capturer les notes (`obsidian daily:append`/`create`), en extraire des tâches sous le bon sous-titre |
| 2 | Vault Obsidian | Repérer une tâche `- [ ]` dans le sprint courant |
| 3 | Claude Code | Contexte (`AGENTS.md`), plugins (Context7, Obsidian skills), skills et agents mobilisés selon le besoin |
| 4 | Repo de code | Créer une branche, implémenter, tester |
| 5 | Repo de code | Commit (manuel ou via prompt Claude, Conventional Commits, anglais, sans `Co-Authored-By`) + push |
| 6 | GitHub (`gh` CLI) | `gh pr create` |
| 7 | Repo de code / GitHub | Revue solo dev (`/code-review`) puis `gh pr merge` |
| 8 | Vault Obsidian | Cocher la tâche `- [x] ... ✅ date`, mettre à jour `progression`/`statut` |
