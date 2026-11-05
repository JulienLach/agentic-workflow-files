---
name: add-entity
description: Guide la création complète d'une nouvelle entité full-stack (backend + frontend). Utiliser quand l'utilisateur veut ajouter une nouvelle ressource/entité à l'application.
---

Aide-moi à créer la nouvelle entité suivante : $ARGUMENTS

Procède étape par étape en respectant l'architecture du projet.

## 1. Analyse préalable

Avant de coder, clarifie :
- Nom de l'entité (singulier/pluriel, convention du projet)
- Champs et types (avec les contraintes SQL : NOT NULL, UNIQUE, FK, etc.)
- Relations avec les entités existantes
- Qui peut créer/lire/modifier/supprimer ? (tous les utilisateurs, admins seulement ?)
- L'entité est-elle scopée par contexte (`id_context` ou équivalent) ?

## 2. Base de données

- Écrire le script de migration SQL dans `backend/updates/`
- La migration doit être **idempotente** (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`)
- Penser aux index sur les colonnes fréquemment filtrées (clés étrangères, colonnes de filtrage)

## 3. Backend - dans cet ordre

### `backend/data/EntityName.ts`
- Classe avec méthodes statiques correspondant aux opérations CRUD
- Requêtes SQL paramétrées uniquement (jamais de concaténation de chaînes)
- Filtrage par `id_context` sur toutes les méthodes qui le nécessitent

### `backend/validators/entityNameSchema.ts`
- Schéma Zod pour le body des requêtes POST et PUT
- Types inférés avec `z.infer<typeof schema>`

### `backend/services/entityName.services.ts`
- Couche métier appelée par les routes
- Logique de validation métier (règles qui ne peuvent pas être exprimées dans Zod)

### `backend/routes/entityName.routes.ts`
- Routes Express : GET (liste), GET (par id), POST, PUT, DELETE
- Appliquer `requireRole(1)` sur les routes d'écriture si nécessaire
- Protection IDOR sur toutes les opérations par ID : valider `id_context` directement en SQL (retourner 404 si mismatch)

### `backend/server.ts`
- Enregistrer la nouvelle route : `app.use('/entity-name', entityNameRouter)`

## 4. Frontend - dans cet ordre

### `frontend/src/services/api.ts`
- Ajouter toutes les fonctions d'appel API pour cette entité
- Respecter les conventions existantes (même structure fetch, même gestion d'erreurs)

### `frontend/src/validators/entityNameSchema.ts`
- Schéma Zod côté client pour la validation des formulaires

### `frontend/src/interfaces/EntityName.ts`
- Interface TypeScript pour l'entité

### `frontend/src/components/forms/EntityNameForm.tsx`
- Formulaire de création/modification
- Validation avec Zod au submit
- Gestion des états : loading, error, success

### `frontend/src/pages/EntityName/`
- `EntityNameListPage.tsx` - liste avec recherche/filtre si pertinent
- `EntityNameDetailPage.tsx` - détail et actions (optionnel selon le besoin)

### `frontend/src/App.tsx`
- Ajouter les routes React Router pour les nouvelles pages
- Wrapper avec `<PrivateRoute>` si authentification requise

## 5. Checklist finale

- [ ] Migration SQL idempotente et testée
- [ ] Requêtes SQL paramétrées (pas de concaténation de chaînes)
- [ ] Filtrage `id_context` présent si applicable
- [ ] Protection IDOR sur toutes les opérations par ID (404 si mismatch de contexte)
- [ ] Validation Zod backend ET frontend
- [ ] `authenticateToken` appliqué sur les routes (via `server.ts`)
- [ ] `requireRole(1)` sur les routes d'écriture si nécessaire
- [ ] Appels API centralisés dans `services/api.ts`
- [ ] Tests écrits pour le service ou le data model, avec un test d'isolation si les données sont isolées par client
- [ ] Pas de `console.log` de debug oubliés

## Format de réponse

- Présenter le plan complet avant de coder, pour validation
- Générer les fichiers un par un, en expliquant les choix importants
- Ton pédagogique : expliquer les décisions d'architecture, pas juste générer du code
