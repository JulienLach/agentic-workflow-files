---
name: security-audit
description: Effectue un audit de sécurité complet sur une route, un fichier ou une feature, structuré selon les 10 catégories de l'OWASP Top 10:2021. Utiliser avant de merger du code sensible ou pour vérifier une surface d'attaque.
---

Effectue un audit de sécurité sur : $ARGUMENTS

Analyse méthodiquement chaque vecteur d'attaque ci-dessous, structuré selon l'OWASP Top 10:2021.

## 1. Broken Access Control (A01)

- Les routes d'écriture (POST/PUT/DELETE) vérifient-elles le rôle requis (`requireRole`) ?
- Les GET par ID filtrent-ils par `id_context` (ou équivalent) directement en SQL, pas par un filtrage côté application après coup ?
- Un utilisateur peut-il accéder à une ressource en devinant/incrémentant un ID (IDOR) ? La réponse doit être 404, pas 403, pour ne pas confirmer l'existence de la ressource.
- Les actions sont-elles vérifiées côté **serveur** (pas seulement masquées côté frontend) ?
- La navigation directe vers une URL admin (sans passer par l'UI) est-elle bloquée par le middleware, pas seulement par le routing frontend ?

## 2. Cryptographic Failures (A02)

- Les mots de passe sont-ils hachés avec un algorithme adapté (scrypt/bcrypt/argon2), jamais en clair ni avec un hash rapide non salé (MD5, SHA1 nu) ?
- HTTPS est-il forcé en production (redirection HTTP→HTTPS, cookie `Secure`) ?
- Le secret de signature JWT est-il en variable d'environnement (jamais hardcodé), suffisamment long, et absent du code versionné ?
- Les données sensibles stockées sont-elles chiffrées au repos, ou au minimum jamais exposées en clair dans les réponses API/logs ?
- Aucune clé API, token ou secret n'est hardcodé dans le code source ou présent dans l'historique git ?

## 3. Injection (A03)

- Toutes les requêtes SQL utilisent-elles des paramètres (`$1, $2, ...`) ? Aucune concaténation de chaînes ?
- Les valeurs triées/filtrées dynamiquement (ORDER BY, noms de colonnes) sont-elles validées par whitelist plutôt qu'interpolées ?
- Un schéma Zod valide-t-il le body de chaque requête POST/PUT (types, longueurs maximales, formats) ?
- Les inputs passent-ils par `sanitizeInputs` (DOMPurify) pour prévenir le XSS stocké/reflété ?
- Les paramètres d'URL (`:id`) sont-ils validés (integer, UUID, etc.) avant d'atteindre la requête SQL ?
- Aucun `eval`, `child_process.exec` ou équivalent n'est construit à partir d'un input utilisateur non validé ?

## 4. Insecure Design (A04)

- Les règles métier sensibles (montants négatifs, dépassement de quota, un utilisateur qui s'auto-promeut admin) sont-elles validées côté service, pas seulement empêchées par l'UI ?
- Les endpoints exposant des ressources coûteuses (recherche, export, pagination) ont-ils une limite (taille de page max, timeout) pour éviter l'épuisement de ressources ?
- Existe-t-il une séparation claire entre les capacités d'un utilisateur standard et d'un admin, pensée dès la conception (pas ajoutée après coup) ?

## 5. Security Misconfiguration (A05)

- Les headers de sécurité sont-ils présents (CSP, HSTS, X-Frame-Options, etc.) ?
- CORS est-il configuré avec des origines explicites (pas `*`) ?
- Les messages d'erreur en production masquent-ils la stack trace et les détails internes (noms de tables, chemins serveur) ?
- Les fichiers uploadés (si applicable) sont-ils validés (type MIME, taille, contenu) et stockés hors du webroot exécutable ?
- Les fonctionnalités de debug (routes de test, comptes par défaut) sont-elles désactivées en production ?

## 6. Vulnerable and Outdated Components (A06)

- Y a-t-il des dépendances npm avec des vulnérabilités connues ? (`npm audit`)
- Les dépendances sont-elles à jour sur les patches de sécurité ?
- Le `package-lock.json` est-il committé pour garantir des versions reproductibles ?

## 7. Identification and Authentication Failures (A07)

- Le middleware `authenticateToken` est-il appliqué sur toutes les routes protégées ?
- Le JWT est-il vérifié (signature + expiration) à chaque requête ?
- Les tokens sont-ils stockés de façon sécurisée (httpOnly cookie côté client) ?
- Le cookie JWT a-t-il l'attribut `SameSite` (Strict/Lax) ? Sans lui, un cookie httpOnly reste vulnérable au CSRF — le navigateur l'envoie automatiquement sur une requête cross-site.
- Le rate limiting est-il en place sur `/login` pour empêcher le brute-force ?
- Les tokens expirés/révoqués sont-ils correctement rejetés ?

## 8. Software and Data Integrity Failures (A08)

- Le code désérialise-t-il des données non fiables (`JSON.parse` sur un input externe, `eval`) sans validation préalable ?
- Les dépendances proviennent-elles d'une source fiable (registre npm officiel, pas de packages non vérifiés) ?
- Les pipelines CI/CD exécutent-ils du code non vérifié provenant d'une PR externe avec des secrets exposés ?

## 9. Security Logging and Monitoring Failures (A09)

- Les échecs d'authentification, les accès refusés (403/404 sur ressource protégée) et les actions admin sensibles sont-ils loggés via Winston ?
- Les logs contiennent-ils assez de contexte (timestamp, user_id, route) pour investiguer un incident, sans jamais inclure de données personnelles ou de secrets ?
- Existe-t-il un moyen de détecter une activité anormale (plusieurs échecs de login, pic de 403) ?

## 10. Server-Side Request Forgery — SSRF (A10)

- L'application effectue-t-elle des requêtes sortantes basées sur une URL fournie par l'utilisateur (webhook, proxy d'image, fetch de lien) ?
- Si oui, la destination est-elle validée par whitelist (pas de résolution vers `localhost`, IP privées, métadonnées cloud) ?
- Ne s'applique que si l'app a ce type de fonctionnalité — l'indiquer explicitement si absent plutôt que de l'ignorer silencieusement.

## Format de réponse

Pour chaque vulnérabilité trouvée :
- **Fichier + ligne**
- **Sévérité** : 🔴 Critique / 🟠 Haute / 🟡 Moyenne / 🔵 Faible
- **Catégorie OWASP** : (ex: A01 Broken Access Control, A03 Injection...)
- **Description** : comment cette vulnérabilité peut être exploitée
- **Correction** : code corrigé ou étapes précises

Si un axe est sûr, l'indiquer avec ✅ en une ligne. Si une catégorie ne s'applique pas (ex: SSRF sur une app sans appel sortant), l'indiquer avec ➖ et une ligne d'explication plutôt que de la passer sous silence.

Terminer par un **score de risque global** et les 3 actions prioritaires à mener.
