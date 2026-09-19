---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Utilise le skill `add-entity` pour m'aider à créer l'entité suivante : une entité "Alerte" avec un champ `message` (texte), un champ `gravite` (colonne texte + contrainte CHECK IN low/medium/high) et un `created_at`. Le projet est un monorepo Node/Express/PostgreSQL + React classique (backend/, frontend/) en TypeScript. La table `contexts(id)` existe déjà et toutes les tables métier ont une colonne `id_context` en FK vers elle. Tous les utilisateurs authentifiés du contexte peuvent lire les alertes ; seuls les admins (`requireRole(1)`) peuvent créer/modifier/supprimer. Liste + formulaire de création suffisent côté frontend, pas de page de détail séparée. Le répertoire de travail ne contient pas encore de code - présente-moi directement le plan complet avec ces informations, sans poser de question supplémentaire et sans écrire aucun fichier pour l'instant (je veux valider le plan avant).
