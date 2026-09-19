---
type: llm
weight: 1
---

Une bonne réponse, structurée selon les axes du skill (sécurité puis qualité puis architecture puis performance), relève au minimum :
- **Sécurité** : pas de filtrage `id_context` sur `SELECT * FROM invoices` (fuite multi-tenant potentielle), pas d'`authenticateToken` visible.
- **Qualité** : `console.log` de debug oublié, magic number `500` non nommé, boucle `for` + filtrage manuel au lieu d'un `.filter()` ou d'un `WHERE` SQL, `SELECT *` au lieu de colonnes explicites.
- Chaque problème a fichier/ligne (ou extrait), sévérité, description, correction suggérée.
- Termine par un résumé avec nombre de problèmes par sévérité et un verdict (Prêt à merger / À retravailler).

Une mauvaise réponse : ignore le `console.log` ou le magic number, ne relève pas l'absence de filtrage multi-tenant, ou ne conclut pas par un verdict clair.
