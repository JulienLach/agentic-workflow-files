---
type: llm
weight: 1
---

Une bonne réponse détecte, structuré par catégorie OWASP Top 10:2025, au minimum :
- **A05 Injection** (A03 dans l'édition 2021) : le `GET /reports/:id` concatène `req.params.id` directement dans le SQL (injection SQL critique) - alors que le `POST` utilise bien des requêtes paramétrées.
- **A01 Broken Access Control** : aucun `authenticateToken`/`requireRole` visible sur ces routes, aucun filtrage par `id_context` (IDOR potentiel sur le GET par ID).
- Pour chaque problème : fichier/ligne (ou l'extrait concerné), sévérité, catégorie OWASP, description de l'exploitation, correction.
- Indique les catégories ou points non applicables (SSRF, intégré à A01 depuis 2025, etc.) avec ➖ plutôt que de les ignorer silencieusement.
- Termine par un score de risque global et 3 actions prioritaires.

Une mauvaise réponse : ne détecte pas l'injection SQL évidente sur le `GET`, ne mentionne pas l'absence d'authentification/IDOR, ou ne suit pas le format attendu (sévérité/catégorie/correction).
