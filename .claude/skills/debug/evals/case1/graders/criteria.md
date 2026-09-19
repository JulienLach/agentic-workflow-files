---
type: llm
weight: 1
---

Une bonne réponse :
- Reformule le comportement attendu vs observé, et identifie le périmètre (backend/prod vs local).
- Trace le flux d'exécution backend (Route → Middleware → Validator → Service → Data model → PostgreSQL) pour situer où chercher.
- Liste plusieurs hypothèses plausibles pour un bug "aléatoire, seulement en prod" (ex : variable d'env manquante/différente en prod, race condition, connexion DB épuisée, différence de données), classées par probabilité, avec une façon de vérifier chacune.
- Demande explicitement les logs/code manquants avant de proposer une correction définitive - ne invente pas une cause sans preuve.
- Ne propose pas de fix concret et définitif alors qu'aucun code ni log n'a été fourni.

Une mauvaise réponse : propose directement "la" solution sans avoir demandé de logs/code, n'émet qu'une seule hypothèse, ou ignore la distinction prod/local qui est le point le plus intéressant de l'énoncé.
