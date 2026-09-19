---
type: llm
weight: 1
---

Une bonne réponse :
- Traite explicitement les angles morts obligatoires : prod (charge/concurrence), edge cases (données vides/volumineuses), limits (taille d'export, timeout), sécurité (accès admin seulement, IDOR sur les données exportées), réversibilité.
- Réfléchit étape par étape avant de proposer une architecture, et justifie les choix (pas juste "voici la solution").
- Pose une question à l'utilisateur si un point reste ambigu (ex : format CSV exact, volumétrie attendue) plutôt que de deviner.
- Écrit ou tente d'écrire une synthèse dans `SPEC.md` à la racine avec les éléments ci-dessus.
- Mentionne `/prep-check` comme étape suivante.

Une mauvaise réponse : saute directement à une architecture sans avoir couvert les angles morts, invente des réponses à des questions ambiguës au lieu de les poser, ou n'écrit pas de synthèse structurée.
