---
name: debug
description: Guide un débogage structuré. Utiliser quand l'utilisateur a un bug, une erreur, un comportement inattendu ou un crash à résoudre.
---

Aide-moi à déboguer le problème suivant : $ARGUMENTS

Procède dans cet ordre :

## 1. Compréhension du problème

- Reformule le **comportement attendu** vs le **comportement observé**
- Identifie le périmètre : backend / frontend / base de données / réseau / configuration
- Si le problème n'est pas clair, pose les questions de clarification nécessaires avant de continuer

## 2. Localisation du bug

Trace le flux d'exécution selon l'architecture :

**Backend** : `Route → Middleware (auth) → Validator (Zod) → Service → Data model → PostgreSQL`

**Frontend** : `Composant → Hook → services/api.ts → Backend`

- Identifie les fichiers et fonctions suspects avec leur chemin (`fichier:ligne`)
- Vérifie les logs (Winston côté backend, console côté frontend)
- Vérifie les réponses réseau dans l'onglet Network des DevTools si applicable

## 3. Hypothèses et vérifications

- Liste les causes possibles, de la plus probable à la moins probable
- Pour chaque hypothèse, indique comment la confirmer ou l'infirmer :
  - Log à ajouter temporairement
  - Valeur à inspecter dans le debugger
  - Requête SQL à tester directement en base
  - Appel API à reproduire dans un client REST (curl, Postman)

## 4. Correction

- Propose la **correction minimale** qui résout le problème sans effet de bord
- Explique **pourquoi** ça corrige le bug (ton pédagogique - comprendre, pas juste corriger)
- Si la correction touche des données ou une migration SQL, signaler clairement le risque et prévoir un rollback
- Ne pas refactorer du code hors du périmètre du bug

## 5. Prévention

- Ce bug aurait-il pu être détecté par un test automatisé ?
- Si oui, suggère le test à écrire (unitaire ou intégration) pour éviter la régression
- Identifie si c'est un pattern récurrent à surveiller ailleurs dans le projet

## Format de réponse

- Ton pédagogique : explique les concepts si nécessaire pour que l'utilisateur comprenne
- Toujours indiquer **fichier + ligne** pour chaque élément mentionné
- Si tu as besoin de voir du code ou des logs supplémentaires, **demande-les explicitement** avant de conclure
- Ne propose pas de solution si tu n'as pas suffisamment d'informations
