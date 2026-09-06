---
name: write-tests
description: Rédige des tests unitaires et d'intégration avec Vitest. Utiliser quand l'utilisateur veut tester un service, un data model, une route ou un composant React.
---

Écris des tests pour : $ARGUMENTS

## 1. Analyse préalable

Avant d'écrire les tests, identifie :
- Le type de code à tester : service / data model / route Express / composant React / utilitaire
- Les cas nominaux (happy path) et les cas d'erreur à couvrir
- Les dépendances externes à isoler (base de données, services tiers, etc.)
- Les fichiers de test existants à consulter pour respecter les conventions du projet

## 2. Stratégie de test

### Tests unitaires (services, utilitaires, data models sans DB)
- Tester chaque fonction de façon isolée
- Mocker les dépendances externes (autres services, appels HTTP)
- Couvrir : cas nominal, cas d'erreur, cas limites (valeurs nulles, vides, extrêmes)

### Tests d'intégration (routes, data models avec DB)
- Tester le flux complet : requête HTTP → réponse
- **Ne pas mocker la base de données** - tester contre une vraie DB de test
- Nettoyer les données de test avant/après chaque test (`beforeEach` / `afterEach`)
- Tester les codes HTTP retournés (200, 201, 400, 401, 403, 404, 500)

### Tests de composants React (si applicable)
- Tester le comportement visible, pas l'implémentation interne
- Simuler les interactions utilisateur (click, saisie, submit)
- Vérifier le rendu conditionnel (états loading, error, empty)

## 3. Structure des tests Vitest

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('NomDuModule', () => {
  // Setup commun
  beforeEach(() => { /* ... */ })
  afterEach(() => { /* ... */ })

  describe('nomDeLaFonction', () => {
    it('devrait [comportement attendu] quand [condition]', async () => {
      // Arrange
      const input = { /* ... */ }

      // Act
      const result = await fonctionATester(input)

      // Assert
      expect(result).toEqual({ /* ... */ })
    })

    it('devrait lever une erreur quand [condition d\'erreur]', async () => {
      await expect(fonctionATester(invalidInput)).rejects.toThrow('message d\'erreur')
    })
  })
})
```

## 4. Ce que les tests doivent vérifier

Pour chaque fonction/route testée :
- **Cas nominal** : comportement attendu avec des données valides
- **Validation** : rejet des données invalides (Zod, contraintes métier)
- **Authentification** : rejet des requêtes sans token ou avec token expiré
- **Autorisation** : rejet des requêtes d'un rôle insuffisant
- **IDOR** : impossibilité d'accéder à une ressource d'un autre contexte
- **Erreurs** : gestion des erreurs DB, services indisponibles, etc.

## Format de réponse

- Expliquer **pourquoi** chaque test est important (ton pédagogique)
- Indiquer le fichier de destination (`backend/test/entityName.test.ts`)
- Signaler si un test nécessite une configuration de DB de test particulière
- Lister les cas non couverts si certains sont trop complexes à tester dans ce contexte
