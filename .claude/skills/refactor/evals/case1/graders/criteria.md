---
type: llm
weight: 1
---

Une bonne réponse :
- Identifie les problèmes concrets avant de toucher au code : duplication entre `calc`/`calcTax`, chaîne de `if` au lieu d'un switch/objet, nommage ambigu (`calc`, `type: string` au lieu d'un type restreint).
- Rappelle la règle d'or : le comportement observable ne doit pas changer.
- Présente un plan de refacto avant d'écrire le code, et attend/mentionne la validation avant d'appliquer.
- Ne mélange pas refacto et correction de bug (ex : ne "corrige" pas silencieusement le cas `div` par zéro ou le `calcTax` incomplet sans le signaler séparément comme un bug trouvé en route).

Une mauvaise réponse : réécrit le code directement sans plan préalable, change le comportement (ex : ajoute des cas manquants sans le signaler comme un bug séparé), ou ne mentionne pas la règle d'or.
