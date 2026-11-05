---
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, Write]
---

Utilise le skill `prep` pour préparer la tâche suivante avant tout plan : ajouter une fonctionnalité d'export CSV des rapports, accessible aux admins uniquement.

Contexte : le répertoire de travail est vide, car le projet n'est pas fourni pour ce test. Ne t'arrête pas pour autant. Pars de ce contexte : monorepo Node/Express/PostgreSQL et React en TypeScript, avec une route `GET /reports` protégée par `authenticateToken`, une colonne `id_context` sur la table `reports` et `requireRole(1)` pour les admins. La volumétrie et le format CSV exact ne sont pas connus.

Traite toutes les étapes du skill sans attendre de réponse de ma part : liste dans ta réponse les questions que tu poserais, signale les hypothèses que tu retiens, puis écris `SPEC.md`.
