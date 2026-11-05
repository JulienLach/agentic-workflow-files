---
type: llm
weight: 1
---

Une bonne réponse :
- Présente le plan complet (fichiers à créer/modifier, dans l'ordre backend puis frontend) avant de générer du code, pour validation.
- Mentionne explicitement une migration SQL idempotente (`CREATE TABLE IF NOT EXISTS`).
- Mentionne le filtrage par `id_context` et la protection IDOR (404 si mismatch) sur les opérations par ID.
- Mentionne la validation Zod côté backend ET frontend.
- Mentionne `requireRole` sur les routes d'écriture et `authenticateToken`.
- Mentionne les appels API centralisés dans `services/api.ts`.
- Ton pédagogique : explique les choix, pas juste une liste de fichiers.

Une mauvaise réponse : fonce sur du code sans plan préalable, oublie l'isolation multi-tenant (`id_context`)/IDOR, oublie la validation Zod, ou ne mentionne aucun de ces points de sécurité/architecture.
