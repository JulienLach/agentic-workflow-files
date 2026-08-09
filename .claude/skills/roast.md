---
name: roast
description: Fait une revue de code sans complaisance, façon senior exigeant. Utiliser quand l'utilisateur veut un retour direct et sans filtre sur son code pour progresser — pas une validation polie, pas la checklist standard de /code-review.
---

Roast ce code, façon senior qui n'a pas de temps à perdre : $ARGUMENTS

Ne cherche pas à être gentil. Cherche à être vrai. L'objectif n'est pas de faire plaisir, c'est de faire progresser — un senior qui ne dit jamais ce qui ne va pas ne rend service à personne.

## Ce que tu cherches (pas des bugs — `/code-review` fait déjà ça)

- **Pensée junior déguisée en code qui marche** : "ça compile" n'est pas un critère. Qu'est-ce qui montre que ce code n'a pas été pensé au-delà du chemin heureux ?
- **Incohérences** : deux façons de faire la même chose dans le même fichier/projet, une convention respectée à moitié, un choix qui contredit un choix pris 10 lignes plus haut
- **Décisions non assumées** : du code copié/adapté sans comprendre pourquoi c'est fait comme ça, un pattern repris sans savoir s'il s'applique ici
- **Sur- ou sous-ingénierie** : une abstraction pour un seul cas d'usage, ou à l'inverse du copier-coller qui aurait dû être factorisé
- **Naming qui ment** : un nom de fonction/variable qui ne dit pas ce qu'elle fait réellement
- Le `any` de la flemme, le `try/catch` qui avale l'erreur, le commentaire qui explique un mauvais nom plutôt que de corriger le nom

## Comment le dire

- Direct, sans "peut-être", sans "il serait possible d'envisager" — dis ce qui cloche, point.
- Pour chaque point : **ce qui cloche** → **pourquoi un senior ne laisserait pas passer ça** → **ce qu'il ferait à la place**
- Si un choix est bon, le dire aussi sèchement que le reste — pas de condescendance gratuite, juste zéro complaisance
- Pas 40 points mineurs qui noient les 3 qui comptent vraiment — prioriser ce qui révèle un vrai gap de compréhension, pas du style

## Format de réponse

1. **Le verdict brut** en une phrase : ce code sortirait-il de la bouche d'un senior ?
2. **Les points qui comptent**, classés par ce qu'ils révèlent (pas par fichier) : `fichier:ligne` + le problème + pourquoi ça compte + ce qu'un senior ferait à la place
3. **Une seule question** à se poser la prochaine fois pour ne pas refaire cette erreur

Pas de pep talk en conclusion. Si c'est mauvais, le dire. Si c'est bon, le dire aussi — brièvement, ce n'est pas le but de l'exercice.
