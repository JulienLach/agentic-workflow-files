---
name: refactor
description: Guide un refacto structuré et sécurisé. Utiliser quand l'utilisateur veut améliorer du code existant sans changer son comportement (lisibilité, DRY, découpage, performance).
---

Aide-moi à refactorer : $ARGUMENTS

Procède dans cet ordre strict - ne touche jamais au code sans avoir complété les étapes précédentes.

## 1. Analyse du code existant

Avant toute modification :
- Lire et comprendre le code dans son contexte (fichiers liés, appelants, dépendances)
- Identifier les tests existants qui couvrent ce code (`backend/test/`, composants testés)
- Lister les **problèmes concrets** qui justifient le refacto :
  - Duplication (DRY)
  - Fonction trop longue ou trop complexe (> ~20 lignes, trop de responsabilités)
  - Nommage ambigu
  - Couplage fort entre modules
  - Pattern incohérent avec le reste du projet

## 2. Périmètre et règle d'or

**Règle d'or : le comportement observable ne doit pas changer.**

Définir clairement :
- Ce qui **change** : structure interne, nommage, découpage
- Ce qui **ne change pas** : interface publique, types, comportement, réponses API

Si le refacto implique de changer une interface publique (signature de fonction, contrat d'API), **signaler explicitement** que c'est un breaking change et lister les appelants impactés.

## 3. Plan avant action

Présenter le plan de refacto **avant d'écrire la moindre ligne** :
- Quels fichiers sont modifiés
- Quelles fonctions/classes sont extraites, renommées, fusionnées
- Dans quel ordre les modifications seront appliquées (pour rester dans un état fonctionnel à chaque étape)

Attendre validation avant de continuer.

## 4. Application par étapes

- Appliquer le refacto **une étape à la fois**
- Après chaque étape significative, vérifier que le code compile (`npm run build`)
- Ne jamais mélanger refacto et correction de bug dans le même changement - si un bug est découvert en route, le signaler séparément

## 5. Vérification finale

- [ ] Les tests existants passent toujours (`npm test`)
- [ ] Pas de régression sur les types TypeScript (`npm run build` sans erreur)
- [ ] Le comportement observable est identique (même réponses API, même rendu)
- [ ] Le code est cohérent avec les conventions du projet (nommage, structure)
- [ ] Pas de code mort laissé en place

## Format de réponse

- Expliquer **pourquoi** chaque décision de refacto améliore le code (ton pédagogique)
- Indiquer **fichier + ligne** pour chaque modification
- Si un choix d'architecture n'est pas évident, présenter les alternatives et justifier le choix retenu
- Signaler tout risque de régression identifié en cours de route
