---
name: learn
description: Cours express de 10 minutes sur un sujet precis de developpement (langage, framework, principe, outil) — doc officielle et sources fiables, pedagogique, avec exemples et mini-exercice.
---

---

## OBJECTIF

Produire un cours court et pedagogique sur le sujet donne en argument ($ARGUMENTS), lisible en environ 10 minutes (~1200-2000 mots), pour aider l'utilisateur (developpeur) a progresser sur un point precis. Francais, ton clair et encourageant, pas verbeux, pas de jargon gratuit. Pas d'emoji (incompatible avec le terminal de l'utilisateur) — utiliser des symboles texte: *, ->, [OK], [!], --, •.

Si aucun sujet n'est fourni dans $ARGUMENTS, demander a l'utilisateur quel sujet precis il veut apprendre avant de continuer.

---

## ETAPE 1 — CADRER LE SUJET

- Reformuler le sujet en une question d'apprentissage precise (pas "l'architecture logicielle" en general, mais "quels sont les grands principes qui guident un decoupage en couches/modules").
- Choisir un niveau d'entree: supposer que l'utilisateur sait coder mais decouvre ce sujet precis. Ne pas re-expliquer les bases de la programmation.
- Si le sujet est trop large pour 10 minutes, le restreindre explicitement en debut de cours (1 phrase: "on se concentre ici sur X, pas sur Y") plutot que de tout survoler superficiellement.

---

## ETAPE 2 — COLLECTE DES SOURCES (lancer en parallele)

Priorite stricte: documentation officielle > sources reconnues de la communaute > articles generalistes. Ne jamais fonder le cours sur un blog SEO de faible qualite.

- Si le sujet concerne une librairie/framework/API precise (ex: React, Django, Kubernetes) : utiliser en priorite le MCP context7 (`resolve-library-id` puis `query-docs`) pour recuperer la documentation officielle a jour.
- Sinon (concept, principe, paradigme, algorithmie) : WebSearch pour identifier 2-4 sources fiables, puis WebFetch (ou obsidian:defuddle si la page est longue et bruitee) pour en extraire le contenu exact.
- Sources fiables typiques selon le domaine : documentation officielle du langage/framework, RFC/specs, MDN (web), refactoring.guru et martinfowler.com (design/architecture), livres de reference largement cites (Clean Architecture, Designing Data-Intensive Applications, GoF, etc. — citer l'ouvrage, pas une URL si pas d'URL fiable), OWASP (securite), man pages / doc CLI officielle (outils).
- Ne jamais inventer une source. Si une affirmation ne peut pas etre rattachee a une source verifiee, la formuler avec prudence ou l'omettre.

---

## ETAPE 3 — FORMAT DE SORTIE EXACT

```
Cours express - [Sujet] | ~10 min de lecture
================================================================

POURQUOI CA COMPTE
-------------------
[2-3 phrases : dans quel contexte concret ce sujet apparait pour un dev,
pourquoi le maitriser change quelque chose en pratique.]

LES CONCEPTS CLES
------------------
1. [Concept] -- [explication en 2-4 phrases simples, analogie si utile]
2. [Concept] -- [...]
3. [Concept] -- [...]
(3 a 5 concepts maximum. Mieux vaut 3 concepts bien expliques que 6 survoles.)

EXEMPLE CONCRET
----------------
[Un exemple reel et fonctionnel (code ou scenario) qui illustre les concepts
ci-dessus. Bloc de code avec langage indique si pertinent. Commenter le POURQUOI,
pas juste le QUOI.]

ERREURS COURANTES
------------------
* [Erreur frequente] -> [pourquoi ca pose probleme] -> [ce qu'il faut faire a la place]
* [...]

MINI-EXERCICE
--------------
[Uniquement si le sujet s'y prete. Un exercice pratique, faisable en 5-10 min,
objectif clair, avec un indice ou un critere pour verifier soi-meme qu'on a reussi.
Si le sujet est purement conceptuel et qu'aucun exercice sense n'est possible,
remplacer cette section par "Pas d'exercice ici : ce sujet se pratique plutot
en le reconnaissant/l'appliquant dans du code reel, par exemple [piste concrete]."]

A RETENIR
---------
[3-5 puces courtes : la cheat-sheet mentale a garder en tete.]

POUR ALLER PLUS LOIN
---------------------
- [Source officielle ou reconnue] -- [URL ou reference exacte]
- [Source officielle ou reconnue] -- [URL ou reference exacte]
- [Source officielle ou reconnue] -- [URL ou reference exacte]

================================================================
* Baked for [X]m [Y]s
```

---

## REGLES DE STYLE

- Francais pour tout le texte, termes techniques en anglais conserves tels quels (pas de traduction forcee qui sonne faux).
- Phrases courtes, sujet-verbe-complement. Pas de remplissage.
- Ton pedagogique et direct, comme un mentor qui explique a un pair -- pas un ton scolaire ni familier.
- Zero jargon marketing ("revolutionnaire", "game-changer"). Zero superlatif inutile.
- Chaque concept cle doit etre relie a une consequence pratique ("ce que ca change quand tu codes"), pas juste une definition academique.
- L'exemple doit etre correct techniquement -- ne jamais approximer un exemple de code pour gagner du temps.
- Cible realiste : 1200 a 2000 mots au total. Si le brouillon depasse largement, couper en profondeur (moins de concepts, mieux expliques) plutot qu'en largeur.

---

## PIEGES A EVITER

- Ne pas transformer un cours de 10 minutes en cours de 30 minutes : mieux vaut restreindre le perimetre que tout couvrir superficiellement.
- Ne pas citer une source qu'on n'a pas reellement consultee via WebFetch/context7/WebSearch dans cette session.
- Ne pas forcer un mini-exercice absurde sur un sujet purement theorique -- utiliser la clause de repli prevue dans le gabarit.
- Ne pas empiler les concepts sans exemple : chaque concept cle doit se retrouver, explicitement ou implicitement, dans l'exemple concret.
- Ne pas melanger plusieurs sujets dans un seul cours si l'utilisateur en demande un precis -- proposer une suite ("prochain cours possible : ...") plutot que de tout traiter d'un coup.
