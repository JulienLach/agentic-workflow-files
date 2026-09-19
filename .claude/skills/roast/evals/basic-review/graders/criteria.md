---
type: llm
weight: 1
---

Une bonne réponse :

- Suit le format du skill : un verdict brut en une phrase, puis des points classés par ce qu'ils révèlent (pas par fichier), puis une seule question à se poser la prochaine fois.
- Relève au moins deux des problèmes injectés dans le snippet : le `catch (e)` qui avale l'erreur silencieusement (retourne `null` sans logger/relancer), le nom `getData` qui ne dit pas qu'elle va chercher un utilisateur en DB, l'incohérence de convention de nommage (camelCase `getData` vs snake_case `get_user_profile` dans le même fichier), ou le retour `any` sur `get_user_profile`.
- Est direct : pas de "peut-être", "il serait possible d'envisager", pas de pep talk de conclusion.
- Ne noie pas les points qui comptent sous des nitpicks de style mineurs.

Une mauvaise réponse : reste polie/vague, liste des bugs génériques sans lien avec les problèmes réels du snippet, hedge ("on pourrait éventuellement..."), ou ignore le format demandé par le skill (verdict / points / question).
