---
name: competitor-benchmark
description: Benchmarke une application concurrente à partir de son URL, dresse l'inventaire de ses fonctionnalités visibles et les compare à celles du projet actuel. Utiliser pour une analyse concurrentielle produit, avant de prioriser une roadmap, ou pour identifier les features manquantes/différenciantes.
---

Benchmark concurrentiel : $ARGUMENTS

`$ARGUMENTS` doit contenir l'URL de l'application concurrente (et éventuellement des identifiants de démo si l'utilisateur les fournit). Si aucune URL n'est présente, la demander avant de continuer.

## ETAPE 1 — Explorer l'app concurrente

- Parcourir les pages publiques accessibles sans compte : landing page, page "Features"/"Produit", pricing, changelog/release notes, documentation publique, blog si pertinent.
- Utiliser WebFetch pour le contenu statique. Si le site est fortement JS (SPA) ou nécessite une interaction (menu déroulant, démo interactive), utiliser les outils Playwright (`browser_navigate`, `browser_snapshot`, `browser_click`) pour explorer réellement l'UI.
- Si l'utilisateur fournit des identifiants de démo/essai, s'y connecter pour inventorier les fonctionnalités internes (pas seulement la vitrine marketing).
- Pour chaque fonctionnalité repérée : nom, catégorie, description courte, source (URL exacte), et si elle est gratuite ou réservée à un tier payant.

## ETAPE 2 — Explorer le projet actuel

- Lire la section `[Contexte projet]` d'AGENTS.md/CLAUDE.md si elle est remplie.
- Parcourir `backend/routes/`, `backend/services/` et `frontend/src/pages/` pour inventorier les fonctionnalités réellement **implémentées** (pas celles juste prévues ou en TODO).
- Parcourir le README.md racine s'il documente les features à haut niveau.
- Construire l'inventaire du projet avec la même structure qu'à l'étape 1 (nom, catégorie, description, fichier source).

## ETAPE 3 — Comparer

Regrouper les deux inventaires par catégorie fonctionnelle commune (ex : Authentification, Coeur de produit, Reporting/Analytics, Intégrations, Collaboration, Mobile, API/Extensibilité, Pricing).

Pour chaque catégorie, produire un tableau :

| Fonctionnalité | Concurrent | Nous | Écart |
| --- | --- | --- | --- |
| ... | ✅ / ❌ / partiel | ✅ / ❌ / partiel | ce qui manque ou ce qui différencie |

## ETAPE 4 — Format de sortie

```
BENCHMARK CONCURRENTIEL — [Nom concurrent] vs [Nom projet]
URL analysée : [url] | Date : [date du jour]
================================================================

RESUME
------
[3-4 phrases : positionnement du concurrent, écart global, principal risque/opportunité]

PAR CATEGORIE
-------------
### [Catégorie]
| Fonctionnalité | Concurrent | Nous | Écart |
| --- | --- | --- | --- |
...

================================================================
FEATURES MANQUANTES CHEZ NOUS (gaps à combler)
------------------------------------------------
• [Feature] — présente chez [concurrent] ([source]), absente ici. Impact : [pourquoi ça compte].

================================================================
FEATURES DIFFERENCIANTES CHEZ NOUS (avantages à valoriser)
-------------------------------------------------------------
• [Feature] — absente chez le concurrent ou moins aboutie. [détail]

================================================================
RECOMMANDATIONS
----------------
[3 actions priorisées, avec effort estimé qualitatif (faible / moyen / élevé)]

Sources concurrent :
- [Titre page] — [URL]
```

## PIEGES A EVITER

- Ne jamais inventer une fonctionnalité concurrente non observée directement — si une page attendue (ex : pricing) est inaccessible, l'indiquer comme "non vérifié" plutôt que de deviner.
- Ne jamais tenter de contourner une authentification, un CAPTCHA ou un paywall pour accéder à des fonctionnalités concurrentes non publiques.
- Ne pas comparer des fonctionnalités "prévues"/roadmap du projet actuel comme si elles étaient livrées — seul le code existant compte.
- Distinguer le marketing (ce que la page annonce) de la réalité produit — signaler quand une allégation n'a pas pu être vérifiée en pratique (ex : nécessite un compte démo non fourni).
- Toujours citer la source exacte (URL) de chaque fonctionnalité concurrente listée, pour permettre une vérification a posteriori.
