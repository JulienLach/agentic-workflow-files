---
name: security-audit
description: Effectue un audit de sécurité complet sur une route, un fichier ou une feature, structuré selon les 10 catégories de l'OWASP Top 10:2025. Utiliser avant de merger du code sensible ou pour vérifier une surface d'attaque.
---

Effectue un audit de sécurité sur : $ARGUMENTS

Analyse méthodiquement chaque vecteur d'attaque ci-dessous, structuré selon l'OWASP Top 10:2025 (https://top10.owasp.org/2025).

## 1. Broken Access Control (A01)

- Les routes d'écriture (POST/PUT/DELETE) vérifient-elles le rôle requis (`requireRole`) ?
- Les opérations par ID (lecture, modification, suppression) filtrent-elles par `id_context` (ou équivalent) directement en SQL, pas par un filtrage côté application après coup ?
- Un utilisateur peut-il accéder à une ressource en devinant/incrémentant un ID (IDOR) ? La réponse doit être 404, pas 403, pour ne pas confirmer l'existence de la ressource.
- Le contexte (utilisateur, tenant) est-il résolu côté serveur depuis le token, jamais depuis un paramètre envoyé par le client ?
- Les actions sont-elles vérifiées côté **serveur** (pas seulement masquées côté frontend) ?
- La navigation directe vers une URL admin (sans passer par l'UI) est-elle bloquée par le middleware, pas seulement par le routing frontend ?
- **SSRF** (intégré à A01 depuis 2025) : l'application effectue-t-elle des requêtes sortantes basées sur une URL fournie par l'utilisateur (webhook, proxy d'image, fetch de lien) ? Si oui, la destination est-elle validée par whitelist (pas de résolution vers `localhost`, IP privées, métadonnées cloud) ? Si l'app n'a pas ce type de fonctionnalité, l'indiquer explicitement plutôt que de l'ignorer.

## 2. Security Misconfiguration (A02)

- Les headers de sécurité sont-ils présents (CSP, HSTS, X-Frame-Options, etc.) ?
- CORS est-il configuré avec des origines explicites (pas `*`) ?
- `trust proxy` est-il réglé correctement derrière le reverse proxy (sinon le rate limiting voit l'IP du proxy, ou un client peut usurper son IP via `X-Forwarded-For`) ?
- Les fichiers uploadés (si applicable) sont-ils validés (type MIME, taille, contenu) et stockés hors du webroot exécutable ?
- Les fonctionnalités de debug (routes de test, comptes par défaut) sont-elles désactivées en production ?
- Les variables d'environnement obligatoires sont-elles validées au démarrage (crash immédiat plutôt qu'un comportement dégradé silencieux) ?

## 3. Software Supply Chain Failures (A03)

- Y a-t-il des dépendances npm avec des vulnérabilités connues ? (`npm audit`)
- Les dépendances sont-elles à jour sur les patches de sécurité ?
- Le `package-lock.json` est-il committé, et les installations en CI/Docker passent-elles par `npm ci` (versions exactes du lock) ?
- Les dépendances proviennent-elles d'une source fiable (registre npm officiel, paquet maintenu, nom vérifié contre le typosquatting) ?
- Une nouvelle dépendance est-elle justifiée, ou une API native suffirait-elle (ex : `crypto.scrypt` plutôt qu'un paquet de hachage) ?
- Les images Docker de base (`node`, `postgres`) et les GitHub Actions utilisent-elles des versions explicites et maintenues ?
- Les pipelines CI/CD exécutent-ils du code non vérifié provenant d'une PR externe avec des secrets exposés ?

## 4. Cryptographic Failures (A04)

- Les mots de passe sont-ils hachés avec un algorithme adapté (scrypt/bcrypt/argon2), jamais en clair ni avec un hash rapide non salé (MD5, SHA1 nu) ? La vérification se fait-elle en temps constant (`crypto.timingSafeEqual`) ?
- HTTPS est-il forcé en production (redirection HTTP→HTTPS, cookie `Secure`) ?
- Le secret de signature JWT est-il en variable d'environnement (jamais hardcodé), suffisamment long, et absent du code versionné ?
- Les données sensibles stockées sont-elles chiffrées au repos, ou au minimum jamais exposées en clair dans les réponses API/logs ?
- Les jetons à usage unique (lien de réinitialisation, invitation) sont-ils aléatoires (`crypto.randomBytes`) et stockés hachés en base ?
- Aucune clé API, token ou secret n'est hardcodé dans le code source ou présent dans l'historique git ?

## 5. Injection (A05)

- Toutes les requêtes SQL utilisent-elles des paramètres (`$1, $2, ...`) ? Aucune concaténation de chaînes ?
- Les valeurs triées/filtrées dynamiquement (ORDER BY, noms de colonnes) sont-elles validées par whitelist plutôt qu'interpolées ?
- Un schéma Zod valide-t-il le body de chaque requête POST/PUT (types, longueurs maximales, formats) ?
- Le XSS est-il évité : pas de `dangerouslySetInnerHTML` sur une donnée utilisateur, et tout HTML généré côté serveur (emails, PDF...) échappé à la sortie ?
- Les paramètres d'URL (`:id`) sont-ils validés (integer, UUID, etc.) avant d'atteindre la requête SQL ?
- Aucun `eval`, `child_process.exec` ou équivalent n'est construit à partir d'un input utilisateur non validé ?

## 6. Insecure Design (A06)

- Les règles métier sensibles (montants négatifs, dépassement de quota, un utilisateur qui s'auto-promeut admin) sont-elles validées côté service, pas seulement empêchées par l'UI ?
- Les endpoints exposant des ressources coûteuses (recherche, export, pagination) ont-ils une limite (taille de page max, timeout) pour éviter l'épuisement de ressources ?
- Existe-t-il une séparation claire entre les capacités d'un utilisateur standard et d'un admin, pensée dès la conception (pas ajoutée après coup) ?

## 7. Authentication Failures (A07)

- Le middleware `authenticateToken` est-il appliqué sur toutes les routes protégées ?
- Le JWT est-il vérifié (signature + expiration) à chaque requête, avec l'algorithme imposé (`algorithms: ["HS256"]`) ?
- Les tokens sont-ils stockés de façon sécurisée (httpOnly cookie côté client, jamais `localStorage`) ?
- Le cookie JWT a-t-il l'attribut `SameSite` (Strict/Lax) ? Sans lui, un cookie httpOnly reste vulnérable au CSRF - le navigateur l'envoie automatiquement sur une requête cross-site.
- Le rate limiting est-il en place sur `/login` et les routes publiques pour empêcher le brute-force et les abus ?
- Les tokens expirés/révoqués sont-ils correctement rejetés ?
- Les messages d'échec de connexion sont-ils identiques que l'email existe ou non (pas d'énumération de comptes) ?

## 8. Software or Data Integrity Failures (A08)

- Le code désérialise-t-il des données non fiables (`JSON.parse` sur un input externe, `eval`) sans validation préalable ?
- Les webhooks entrants (paiement, services tiers) vérifient-ils leur signature avant d'agir ?
- Les données critiques (montants, rôles, statuts) ne peuvent-elles être modifiées que par le serveur, jamais reprises telles quelles depuis le client ?

## 9. Security Logging and Alerting Failures (A09)

- Les échecs d'authentification, les accès refusés (403/404 sur ressource protégée) et les actions admin sensibles sont-ils loggés via Winston ?
- Les logs contiennent-ils assez de contexte (timestamp, user_id, route) pour investiguer un incident, sans jamais inclure de données personnelles ou de secrets ?
- Existe-t-il un moyen de détecter **et d'être alerté** d'une activité anormale (plusieurs échecs de login, pic de 403) ?

## 10. Mishandling of Exceptional Conditions (A10)

- Un middleware d'erreur global (4 paramètres, monté après toutes les routes) intercepte-t-il toutes les erreurs, y compris les promesses rejetées ?
- Les messages d'erreur en production masquent-ils la stack trace et les détails internes (noms de tables, chemins serveur, `error.detail` de Postgres qui recopie les valeurs) ?
- Le code « échoue fermé » : en cas d'erreur pendant une vérification (token, rôle, abonnement), l'accès est-il refusé, jamais accordé par défaut ? Aucun `catch` vide qui laisse continuer le traitement ?
- Les opérations multi-étapes sont-elles dans une transaction avec `ROLLBACK` en cas d'échec, pour ne jamais laisser un état partiel incohérent ?
- Les ressources sont-elles libérées sur le chemin d'erreur (`client.release()` dans un `finally`, fichiers temporaires supprimés) ?
- Les cas limites sont-ils gérés explicitement (valeur `null`, liste vide, service externe indisponible, timeout) plutôt que de provoquer une exception non prévue ?

## Format de réponse

Pour chaque vulnérabilité trouvée :
- **Fichier + ligne**
- **Sévérité** : 🔴 Critique / 🟠 Haute / 🟡 Moyenne / 🔵 Faible
- **Catégorie OWASP** : (ex: A01 Broken Access Control, A05 Injection...)
- **Description** : comment cette vulnérabilité peut être exploitée
- **Correction** : code corrigé ou étapes précises

Si un axe est sûr, l'indiquer avec ✅ en une ligne. Si une catégorie ou un point ne s'applique pas (ex: SSRF sur une app sans appel sortant), l'indiquer avec ➖ et une ligne d'explication plutôt que de le passer sous silence.

Terminer par un **score de risque global** et les 3 actions prioritaires à mener.
