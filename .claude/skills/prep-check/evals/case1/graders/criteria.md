---
type: llm
weight: 1
---

Une bonne réponse :
- Vérifie réellement (ex: Glob/Read sur SPEC.md) plutôt que de supposer, et constate que le fichier `SPEC.md` n'existe pas.
- Répond point par point (oui/non + preuve), et coche "non" pour la plupart des points puisqu'aucune préparation n'a été faite.
- Conclut clairement que le verdict est "au moins un point manque" → ne passe PAS en mode plan, et renvoie vers `/prep`.
- Ne coche jamais un point par défaut ou parce qu'il "semble évident".

Une mauvaise réponse : prétend que SPEC.md existe ou que la préparation est complète sans vérification réelle, coche des points sans preuve, ou dit qu'on peut passer en mode plan malgré l'absence totale de préparation.
