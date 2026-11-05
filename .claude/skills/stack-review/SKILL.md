---
name: stack-review
description: Fait une revue de code approfondie. Utiliser quand l'utilisateur veut reviewer du code, vérifier la qualité, détecter des bugs ou des problèmes de sécurité.
---

Fais une revue de code sur : $ARGUMENTS

Analyse le code selon ces axes dans cet ordre :

## 1. Sécurité

- **SQL injection** : toutes les requêtes sont-elles paramétrées (`$1, $2, ...`) ?
- **XSS** : pas de `dangerouslySetInnerHTML` sur une donnée utilisateur, et HTML généré côté serveur (emails...) échappé à la sortie ?
- **Authentification** : le middleware `authenticateToken` est-il présent sur toutes les routes protégées ?
- **IDOR** : les opérations par ID (lecture et écriture) filtrent-elles par `id_context` ou équivalent en SQL ?
- **Exposition de données sensibles** : tokens, mots de passe, clés dans les logs ou réponses API ?
- **Validation** : schéma Zod présent côté backend ET frontend aux frontières du système ?

## 2. Qualité du code

- Respect des principes DRY, KISS, YAGNI
- Fonctions avec une seule responsabilité (< ~20 lignes)
- Pas de code mort ou commenté
- Nommage clair et cohérent avec le reste du projet
- Pas de `console.log` oubliés (utiliser le logger configuré côté backend)
- Pas de nombres magiques - constantes nommées
- Async/await utilisé correctement (pas de `.then()` imbriqués inutiles)

## 3. Cohérence avec l'architecture

- **Backend** : flux Route → Middleware → Validator → Service → Data → PostgreSQL respecté ?
- **Multi-tenancy** : filtrage par `id_context` (ou équivalent) présent dans les requêtes SQL ?
- **Frontend** : les appels API sont-ils centralisés dans `services/api.ts` ?
- Types TypeScript corrects et complets (pas de `any` non justifié) ?

## 4. Performance

- Requêtes SQL lourdes, non indexées ou inutilement répétées ?
- Re-renders React évitables (dépendances `useEffect` incorrectes, objets recréés à chaque render) ?
- Chargements de données non nécessaires ou trop fréquents ?

## Format de réponse

Pour chaque problème trouvé, indiquer :
- **Fichier + ligne**
- **Sévérité** : 🔴 Bloquant / 🟠 Important / 🟡 Mineur
- **Description** du problème
- **Correction suggérée** avec exemple de code si pertinent

Si le code est correct sur un axe, l'indiquer en une ligne avec ✅.

Terminer par un **résumé** : nombre de problèmes par sévérité et verdict global (Prêt à merger / À retravailler).
