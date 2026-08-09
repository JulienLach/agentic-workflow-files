---
name: prep
description: Prépare une tâche complexe avant de passer en mode plan. Utiliser sur un besoin flou, une nouvelle feature non triviale, ou toute tâche où foncer direct sur un plan produirait un résultat incomplet, à côté du besoin, ou qui ignore la prod.
---

Prépare la tâche suivante avant tout plan ou toute ligne de code : $ARGUMENTS

Ne passe en mode plan qu'une fois les 5 étapes suivantes traitées.

## 1. Doc

Rassemble la doc pertinente avant de réfléchir à une solution :
- Doc des libs concernées (Context7)
- Code existant qui touche à la même zone (patterns déjà en place, à respecter ou à casser consciemment)
- Specs ou contexte projet (`AGENTS.md`, ticket, échange avec l'utilisateur)

## 2. Boucle de remise en question

Ne prends pas la doc ou le besoin au premier degré. Pour chaque hypothèse :
- Qu'est-ce qui est explicite vs déduit ?
- Qu'est-ce qui pourrait être mal compris ou incomplet ?
- Si un point reste ambigu, pose la question à l'utilisateur — ne pas avancer sur une supposition non confirmée.

## 3. Réflexion étape par étape

Avant de proposer quoi que ce soit : réfléchis étape par étape (*think step-by-step*), jusqu'à avoir couvert le problème en entier. Ne t'arrête pas à la première solution qui marche — liste les options si plusieurs approches sont valables, et justifie celle retenue.

## 4. Angles morts (obligatoire)

Ce qui casse en prod sans jamais avoir été vu en dev — à couvrir explicitement, même si l'utilisateur ne l'a pas demandé :
- **Prod** : comportement sous charge, concurrence, latence réseau
- **Edge cases** : entrées vides/invalides/limites, erreurs partielles
- **Limits** : rate limits, quotas, taille de données
- **Sécurité** : auth, IDOR, injection, exposition de données
- **Réversibilité** : si ça touche des données, comment on rollback

## 5. Architecture de base — mode tuteur

Propose une architecture minimale et explique **pourquoi** (ton pédagogique, pas juste la solution) : quels fichiers, quels choix, quelles alternatives écartées et pourquoi.

## Ensuite

Une fois ces 5 points traités, lance `/prep-check` pour vérifier que rien n'a été oublié avant d'entrer en mode plan. Le plan doit refléter les angles morts de l'étape 4, pas juste le chemin heureux.
