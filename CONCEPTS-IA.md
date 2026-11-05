# Concepts IA - comprendre le workflow IA moderne (dev & au-delà)

Un document de référence pour comprendre le vocabulaire, les concepts et les outils qu'on croise partout dès qu'on parle de LLM et d'agents IA - écrit pour un développeur qui veut être solide sur le sujet (entretien, veille techno, choix d'outils), pas pour un chercheur en ML.

Chaque section combine **le concept** et **des outils concrets** qui l'illustrent, pour ancrer la théorie dans des choses que tu utilises déjà (notamment via ce repo).

> **Document vivant.** Le domaine évolue vite (nouveaux modèles, évolutions de MCP, nouveaux patterns, nouveaux outils) - ce fichier peut devenir obsolète en quelques mois. À relire et mettre à jour périodiquement plutôt qu'à considérer comme figé. Dernière vérification de fraîcheur : 5 novembre 2026.

---

## Table des matières

1. [Les fondamentaux d'un LLM](#1-les-fondamentaux-dun-llm)
   - [Qu'est-ce qu'un LLM](#quest-ce-quun-llm)
   - [Comment un LLM "regarde" le texte : l'architecture Transformer](#comment-un-llm-regarde-le-texte--larchitecture-transformer)
   - [Paramètres - c'est quoi, et pourquoi on en parle tout le temps](#paramètres--cest-quoi-et-pourquoi-on-en-parle-tout-le-temps)
   - [Tokens - l'unité de mesure de tout](#tokens--lunité-de-mesure-de-tout)
   - [Prompt caching - réduire coût et latence sur un contexte répété](#prompt-caching--réduire-coût-et-latence-sur-un-contexte-répété)
   - [Training vs inference](#training-vs-inference)
   - [Poids et quantization](#poids-et-quantization)
   - [VRAM, RAM et SSD : où vivent les poids d'un modèle](#vram-ram-et-ssd--où-vivent-les-poids-dun-modèle)
2. [Harness, agents et boucle agentique](#2-harness-agents-et-boucle-agentique)
   - [Le "Harness"](#le-harness)
   - [La boucle agentique (agentic loop)](#la-boucle-agentique-agentic-loop)
   - [Tool use / function calling](#tool-use--function-calling)
   - [Computer use / agents navigateur](#computer-use--agents-navigateur)
   - [MCP (Model Context Protocol)](#mcp-model-context-protocol)
   - [Skills, plugins et subagents](#skills-plugins-et-subagents)
   - [MCP vs Skill - quand choisir quoi](#mcp-vs-skill--quand-choisir-quoi)
   - [Prompt injection - le risque de sécurité des agents](#prompt-injection--le-risque-de-sécurité-des-agents)
3. [Design patterns agentiques](#3-design-patterns-agentiques)
   - [ReAct (Reason + Act)](#react-reason--act)
   - [Prompt Chaining](#prompt-chaining)
   - [Routing](#routing)
   - [Parallelization](#parallelization)
   - [Orchestrator-Workers](#orchestrator-workers)
   - [Reflection et Evaluator-Optimizer](#reflection-et-evaluator-optimizer)
   - [Planning](#planning)
4. [Endpoints](#4-endpoints)
   - [C'est quoi un endpoint](#cest-quoi-un-endpoint)
   - [Exemple concret : exposer une app métier comme endpoint MCP](#exemple-concret--exposer-une-app-métier-comme-endpoint-mcp)
5. [Les modèles : familles, tailles, comment choisir](#5-les-modèles--familles-tailles-comment-choisir)
   - [Propriétaire vs open-weights](#propriétaire-vs-open-weights)
   - [Fine-tunes communautaires - l'exemple Nous Hermes](#fine-tunes-communautaires--lexemple-nous-hermes)
   - [Frontier vs petits modèles](#frontier-vs-petits-modèles)
   - [Évaluer et comparer les modèles (benchmarks)](#évaluer-et-comparer-les-modèles-benchmarks)
   - [Comment choisir un modèle pour une tâche donnée](#comment-choisir-un-modèle-pour-une-tâche-donnée)
   - [Le "raisonnement étendu" (adaptive thinking / reasoning models)](#le-raisonnement-étendu-adaptive-thinking--reasoning-models)
6. [Prompting et context engineering](#6-prompting-et-context-engineering)
   - [Prompt engineering](#prompt-engineering)
   - [System prompt](#system-prompt)
   - [Zero-shot, few-shot, chain-of-thought](#zero-shot-few-shot-chain-of-thought)
   - [Context engineering](#context-engineering)
7. [RAG, embeddings et mémoire](#7-rag-embeddings-et-mémoire)
   - [Embeddings](#embeddings)
   - [RAG (Retrieval-Augmented Generation)](#rag-retrieval-augmented-generation)
   - [Fine-tuning vs prompting vs RAG - quand utiliser quoi](#fine-tuning-vs-prompting-vs-rag--quand-utiliser-quoi)
   - [Mémoire d'agent](#mémoire-dagent)
8. [Panorama des outils](#8-panorama-des-outils)
9. [Architecture de fichiers pour agents IA](#9-architecture-de-fichiers-pour-agents-ia)
   - [Le fichier d'instructions racine : CLAUDE.md et AGENTS.md](#le-fichier-dinstructions-racine--claudemd-et-agentsmd)
   - [Le dossier de config du harness : .claude/ et .opencode/](#le-dossier-de-config-du-harness--claude-et-opencode)
   - [Portée : projet, sous-dossier, utilisateur, organisation](#portée--projet-sous-dossier-utilisateur-organisation)
   - [Bonnes pratiques](#bonnes-pratiques)
10. [Références incontournables : le workflow IA au quotidien](#10-références-incontournables--le-workflow-ia-au-quotidien)
11. [Glossaire condensé](#11-glossaire-condensé)

---

## 1. Les fondamentaux d'un LLM

### Qu'est-ce qu'un LLM

Un **LLM** (Large Language Model, grand modèle de langage) est un réseau de neurones entraîné à prédire le **prochain token** d'un texte, à partir de tout ce qui précède. C'est tout - pas de "compréhension" au sens humain, mais à force d'avoir vu des quantités massives de texte, cette simple tâche de prédiction fait émerger des capacités de raisonnement, de code, de traduction, etc.

### Comment un LLM "regarde" le texte : l'architecture Transformer

Depuis 2017 (article de recherche *"Attention Is All You Need"*), la quasi-totalité des LLM utilisent l'architecture **Transformer**. Son ingrédient clé : le mécanisme d'**attention** (self-attention).

- Le texte est découpé en tokens, chacun transformé en vecteur numérique (embedding, voir section 7).
- L'**attention** permet à chaque token de "regarder" tous les autres tokens de la séquence et de pondérer leur importance pour construire son sens en contexte - ex. dans *"la banque au bord de la rivière"*, l'attention relie "banque" à "rivière" pour désambiguïser vers le sens géographique plutôt que financier.
- Le modèle empile des dizaines de "blocs" Transformer (attention + réseau de neurones classique), chacun affinant un peu plus la représentation du texte.
- Contrairement aux architectures plus anciennes (RNN/LSTM) qui lisaient le texte token par token dans l'ordre, l'attention traite **toute la séquence en parallèle** - c'est ce qui a rendu possible l'entraînement sur des volumes de données massifs, et donc l'explosion de capacité des LLM depuis la fin des années 2010.
- **Génération auto-régressive** : à l'inférence, le modèle prédit un token, l'ajoute à la séquence, puis prédit le suivant - un token à la fois, jusqu'à la fin de la réponse. C'est ce mécanisme qui explique l'effet "texte qui s'affiche progressivement" en streaming.

> Pas besoin de savoir implémenter un Transformer pour bien utiliser un LLM - mais comprendre que c'est l'attention qui permet au modèle de relier des éléments distants dans un long contexte, c'est la base pour saisir pourquoi la taille de la fenêtre de contexte et sa bonne gestion (context engineering, section 6) comptent autant pour la qualité des réponses.

### Paramètres - c'est quoi, et pourquoi on en parle tout le temps

Les **paramètres** sont les poids numériques ajustés pendant l'entraînement - ce sont eux qui "encodent" ce que le modèle a appris. Plus il y en a, plus le modèle peut représenter des relations complexes dans les données.

- **Petits modèles** (quelques milliards de paramètres, ex. la gamme Haiku, les modèles "mini"/"nano"/"flash" chez les autres fournisseurs) : rapides, peu coûteux, parfaits pour des tâches simples, répétitives, ou à très fort volume.
- **Modèles "frontier"** (des centaines de milliards à plus de mille milliards de paramètres estimés) : les plus capables tous domaines, mais plus lents et plus chers à l'inférence.
- Le nombre de paramètres seul ne dit pas tout : l'architecture, les données d'entraînement et le post-training (RLHF, etc.) comptent autant que la taille brute. Un modèle plus petit mais mieux entraîné peut battre un plus gros modèle mal optimisé sur une tâche donnée.

> **MoE (Mixture of Experts)** : une architecture où le modèle est découpé en "sous-réseaux" spécialisés (experts), et seule une fraction d'entre eux est activée à chaque requête. Ça permet d'avoir un modèle avec un nombre total de paramètres énorme, tout en restant rapide à l'inférence (peu de paramètres réellement utilisés par requête).

### Tokens - l'unité de mesure de tout

Un **token** est un fragment de texte (souvent un mot, un bout de mot, ou un caractère) - l'unité de base que le modèle manipule. Le texte est découpé par un **tokenizer** avant d'être envoyé au modèle.

- En français/anglais, un mot fait en moyenne 1 à 1,5 token ; un mot rare ou composé peut en faire plusieurs.
- **Le prix d'un appel API se calcule en tokens**, pas en mots ni en caractères (tokens en entrée + tokens en sortie).
- **La fenêtre de contexte (context window)** est aussi mesurée en tokens : c'est le nombre maximum de tokens que le modèle peut "voir" en une fois, en comptant l'historique de conversation, les fichiers fournis, les instructions système et la réponse générée.
  - Exemple d'ordre de grandeur courant : 100k à 1M+ tokens selon le modèle et le fournisseur.
  - Une fenêtre plus grande ne veut pas dire "utilise tout sans réfléchir" : au-delà d'un certain volume, la qualité peut se dégrader (effet *lost in the middle* - le modèle "oublie" ce qui est au milieu d'un contexte très long). D'où l'intérêt du **context engineering** (section 6).

### Prompt caching - réduire coût et latence sur un contexte répété

Beaucoup d'API de LLM (dont celle d'Anthropic) permettent de **mettre en cache** la portion stable d'un prompt - typiquement les instructions système, la doc, les fichiers de contexte qui ne changent pas d'un appel à l'autre - pour éviter de la retraiter (et de la refacturer) intégralement à chaque requête.

- La première requête d'une session "écrit" le cache pour la partie stable du prompt (ex. le contenu de `AGENTS.md`, l'historique de conversation) ; les requêtes suivantes qui réutilisent ce même préfixe le lisent depuis le cache - nettement moins cher et plus rapide qu'un traitement complet.
- Le cache a une **durée de vie limitée** (TTL) : chez Anthropic, 5 minutes par défaut, renouvelées à chaque réutilisation, avec une option à 1 heure facturée plus cher à l'écriture. Passé ce délai, il expire et la requête suivante doit "réécrire" le cache depuis zéro.
- C'est exactement ce qui se passe dans une session Claude Code : tant que tu enchaînes des messages dans ce délai, le contexte déjà envoyé (fichiers lus, instructions système) reste en cache plutôt que d'être refacturé à chaque tour.
- Implication pratique pour le **context engineering** (section 6) : placer le contenu stable (instructions, docs) **en début de prompt**, et le contenu variable (la question du moment) à la fin - ça maximise la portion réutilisable du cache d'un appel à l'autre.

### Training vs inference

- **Training (entraînement)** : la phase où le modèle apprend, sur des clusters de GPU/TPU, pendant des semaines. Coûteux, rare (une poignée de fois par génération de modèle).
- **Inference (inférence)** : la phase où tu utilises le modèle déjà entraîné pour générer une réponse. C'est ce que tu fais à chaque prompt envoyé à Claude, ChatGPT, etc.
- **Fine-tuning** : ré-entraîner (partiellement) un modèle déjà entraîné sur un jeu de données spécifique, pour le spécialiser. Coûteux et rarement nécessaire pour un usage dev classique - la plupart des besoins se couvrent avec du bon prompting et du contexte (RAG), pas du fine-tuning.

### Poids et quantization

Les **poids (weights)** sont les valeurs numériques des paramètres. La **quantization** consiste à réduire leur précision numérique (ex. de 16 bits à 8 ou 4 bits) pour que le modèle prenne moins de mémoire et tourne plus vite - au prix d'une petite perte de qualité. C'est la technique qui permet de faire tourner des modèles open-weights en local, sur une machine avec un GPU grand public (via des outils comme **Ollama** ou **LM Studio**).

### VRAM, RAM et SSD : où vivent les poids d'un modèle

Faire tourner un modèle en local, c'est décider où stocker ses poids : GPU (VRAM), mémoire système (RAM), ou disque (SSD). Ces trois emplacements n'ont ni le même prix, ni la même vitesse d'accès - et c'est ce compromis qui explique la plupart des discussions "combien de VRAM il faut pour ce modèle".

- **VRAM (GPU)** : la plus rapide (~700 Go/s à plus de 1 To/s), mais chère et limitée en taille (8 à 24 Go sur une carte grand public). Historiquement, un modèle devait tenir entièrement en VRAM pour tourner à vitesse normale.
- **RAM système (DDR4/DDR5)** : beaucoup moins chère et plus abondante, mais 10 à 20x plus lente pour dialoguer avec le GPU (~25-45 Go/s en DDR4, ~60-90 Go/s en DDR5).
- **SSD (NVMe)** : quasi illimité, très bon marché, mais encore beaucoup plus lent (~5-7 Go/s).

Sur un modèle **dense** (classique - tous les paramètres servent à calculer chaque token), tout doit rester en VRAM pour ne pas ralentir : la lenteur de la RAM/du SSD se ferait sentir à chaque token. D'où la règle simple "il faut X Go de VRAM pour ce modèle".

Sur un modèle **MoE (Mixture of Experts, voir plus haut)**, ce n'est plus vrai : seule une petite fraction des paramètres ("experts actifs") sert à calculer un token donné. Le reste - le gros de la **connaissance** stockée dans le modèle - n'est sollicité que rarement. Les architectures récentes (ex. Qwen3-Next, et la tendance qui se dessine pour la génération suivante) exploitent ça : garder en VRAM uniquement la partie qui doit être recalculée à chaque token, et déporter le reste en RAM, voire sur SSD.

- **Exemple concret** : un modèle MoE de 35 milliards de paramètres au total, avec seulement 3 à 5 milliards actifs par token, peut tourner avec par exemple 16 Go de VRAM (la partie active + le contexte) + 15-20 Go de RAM classique (le reste des experts, peu sollicités) - plutôt que d'exiger 35 Go de VRAM d'un bloc.
- **Pourquoi ça ne ralentit pas** : comme seule une petite fraction des poids "voyage" de la RAM/du SSD vers le GPU à chaque token (pas la totalité du modèle), le débit nécessaire reste faible. Même de la DDR4 - nettement plus lente que la VRAM - suffit sans ralentissement perceptible. Un modèle dense n'a pas cette marge : tout doit transiter, donc seule la VRAM tient la cadence.
- **Implication pratique** : cette tendance change l'équation matérielle de l'IA locale - au lieu d'acheter toujours plus de VRAM (cher), on peut miser sur de la RAM bon marché pour faire tourner des modèles MoE plus gros/plus intelligents sur un GPU modeste (voire le même niveau d'intelligence qu'un GPU deux fois plus gros). Si les labs poussent cette architecture à grande échelle, la demande se déplace du GPU vers la RAM - un facteur à surveiller sur le marché des composants.

> Nuance coût : à date, faire tourner un gros modèle en local reste souvent moins rentable qu'une API cloud au tarif GPU actuel, surtout pour un usage ponctuel ou lourd. L'intérêt de l'offloading RAM/SSD est justement de baisser le ticket d'entrée matériel (VRAM) nécessaire, ce qui rend le local plus accessible sans attendre une baisse du prix des GPU.

---

## 2. Harness, agents et boucle agentique

### Le "Harness"

Un modèle seul ne fait que **générer du texte**. Le **harness** est le logiciel qui l'entoure et lui donne des "mains" : accès à des outils (lire/écrire des fichiers, exécuter du shell, appeler des APIs), gestion de la mémoire et du contexte, permissions, interface utilisateur, boucle d'exécution. C'est le harness qui transforme "un LLM qui répond à des questions" en "un agent qui accomplit des tâches".

**Exemples de harness pour le dev :**

| Outil | Type |
| --- | --- |
| **Claude Code** (Anthropic) | CLI agentique, ce que tu utilises dans ce repo |
| **OpenCode** | Alternative CLI open-source, agnostique au fournisseur de modèle |
| **Codex CLI** (OpenAI) | CLI agentique équivalent côté OpenAI |
| **Antigravity CLI** (Google) | CLI agentique côté Google |
| **Aider** | CLI open-source, orienté pair-programming en terminal |
| **Cursor** | IDE avec agent intégré (fork de VS Code) |
| **GitHub Copilot** (mode agent) | Extension IDE + agent autonome dans les PR/issues |

### La boucle agentique (agentic loop)

Ce qui distingue un **agent** d'un simple chatbot : le cycle **observer → planifier → agir → observer le résultat → recommencer**, de façon autonome, jusqu'à ce que la tâche soit terminée (ou qu'un point de blocage nécessite l'humain). Concrètement, dans Claude Code : tu donnes une tâche, l'agent lit des fichiers, exécute des commandes, regarde le résultat, corrige, jusqu'à ce que ce soit fait - sans que tu valides chaque étape individuellement (sauf configuration contraire). Cette boucle de base se décline en plusieurs patterns nommés (ReAct, Reflection, Planning, Orchestrator-Workers), détaillés en section 3.

### Tool use / function calling

La capacité du modèle à décider, au milieu de sa génération, d'**appeler un outil** avec des arguments structurés (ex. `Read(file_path="...")`) plutôt que de répondre uniquement en texte. C'est le mécanisme technique de base qui rend l'agentique possible - le modèle "choisit" quel outil utiliser et avec quels paramètres, le harness exécute l'appel et renvoie le résultat au modèle.

### Computer use / agents navigateur

Une variante du tool use ci-dessus : plutôt que d'appeler des outils structurés à arguments typés, le modèle pilote directement une interface graphique - navigateur ou système d'exploitation - via des captures d'écran et des actions bas niveau (clic à des coordonnées, saisie clavier, scroll). L'agent "voit" l'écran et agit dessus comme le ferait un humain, ce qui permet d'automatiser des interfaces qui n'exposent aucune API.

- Dans ce repo : le skill `claude-in-chrome` pilote une session Chrome réelle, existante. Le MCP `playwright` lance un navigateur scriptable, mais s'appuie surtout sur des snapshots d'accessibilité plutôt que sur des captures d'écran : c'est un pattern voisin, avec des actions plus structurées.
- Compromis par rapport au tool use classique : plus lent et plus coûteux (chaque action nécessite une capture d'écran + une décision du modèle), mais fonctionne sur n'importe quelle interface, même sans API exposée.

### MCP (Model Context Protocol)

Standard ouvert créé par Anthropic pour connecter un LLM à des sources de données et outils externes de façon **uniforme**, plutôt que de coder une intégration spécifique par outil et par fournisseur de modèle - souvent résumé comme *"l'USB-C des agents IA"*. Il est aujourd'hui hébergé par l'Agentic AI Foundation (Linux Foundation). Un **serveur MCP** expose des outils/ressources que n'importe quel harness compatible peut utiliser.

- Exemple dans ce repo : **Context7** (documentation de librairies à jour, servie via MCP).
- **Le protocole aujourd'hui** (spec du 28 juillet 2026) : un cœur **stateless** (un serveur MCP distant peut tourner derrière un simple load balancer round-robin), un **framework d'Extensions** (`MCP Apps` pour des UI servies par le serveur, `Tasks` pour du travail longue durée) et une auth alignée sur OAuth 2.0/OIDC, avec les **Client ID Metadata Documents** pour identifier les clients.
- Le transport distant est **Streamable HTTP** (voir section 4).

### Skills, plugins et subagents

- **Skill** : un dossier `<nom>/SKILL.md` d'instructions réutilisables, invocable à la demande (`/nom-du-skill`) - un prompt structuré et versionné plutôt qu'à réécrire à chaque fois. Le format **Agent Skills** est un standard ouvert, confié à l'Agentic AI Foundation en octobre 2026. Ex. `/code-review`, `/debug` dans ce repo.
- **Plugin** : un bundle complet (skills + MCP + hooks) packagé et installable en une commande.
- **Subagent** : une instance séparée du modèle, avec son propre contexte, ses propres outils et parfois son propre modèle, lancée par l'agent principal pour isoler ou paralléliser une tâche. Ex. `obsidian-expert` dans ce repo.
- **Hook** : une commande shell déclenchée **automatiquement** par le harness en réaction à un événement précis (avant/après un appel d'outil, fin de session...) - de l'automatisation "dure", pas pilotée par une décision du modèle.

### MCP vs Skill - quand choisir quoi

Un choix concret et récurrent : pour connecter un outil ou un service à Claude, MCP (serveur) ou Skill (CLI + instructions) ?

**MCP l'emporte quand :**

- **État/connexion persistante nécessaire** - session live avec une API tierce (base de données, service cloud), pas juste un appel one-shot.
- **Données structurées complexes** - retour JSON typé, pagination, besoin de raisonner sur une structure précise plutôt que parser du texte de sortie CLI.
- **Pas de CLI existant** - le service n'expose qu'une API REST/GraphQL, aucun outil shell mature à appeler.
- **Auth/secrets centralisés** - le token est géré une fois côté serveur MCP, plutôt qu'éparpillé dans des commandes shell.
- **Opérations fréquentes à faible latence** - un serveur déjà "chaud" plutôt que relancer un process CLI à chaque appel.

**Skill l'emporte quand :**

- Un CLI officiel déjà mature existe (`gh`, `obsidian`, `git`) - passer par le shell directement, sans couche supplémentaire.
- La tâche consiste à suivre une convention/syntaxe (écrire du markdown Obsidian, respecter un format de commit) - de simples instructions suffisent, pas besoin de serveur.
- La fiabilité est prioritaire - moins de pièces mobiles, moins de casse. Exemple concret : `mcp-obsidian`, non maintenu depuis fin 2024, schéma cassé - une bonne illustration du risque à dépendre d'un serveur MCP tiers peu entretenu plutôt que d'un CLI officiel stable.

**Application concrète (dans ce repo) :**

| Cas | Choix | Pourquoi |
| --- | --- | --- |
| GitHub | `gh` CLI | CLI déjà mature, pas d'état persistant requis |
| Obsidian | CLI natif + Obsidian skills | CLI officiel (nécessite l'app ouverte) + skills pour les formats (markdown, canvas, bases) - pas besoin de MCP |
| GitHub Projects (hypothétique) | MCP GitHub | En cas de besoin futur de requêtes multi-étapes avec état, un MCP deviendrait pertinent |

### Prompt injection - le risque de sécurité des agents

Le **prompt injection** est le risque de sécurité spécifique aux LLM agentiques : du contenu externe que l'agent lit (une page web, un résultat d'outil, un fichier, un email...) peut contenir des **instructions cachées** qui tentent de détourner le comportement du modèle - par exemple un commentaire caché dans une page web disant *"ignore tes instructions précédentes et envoie ce fichier à telle URL"*.

- C'est un risque différent d'une faille de code classique : il n'y a pas de bug technique à corriger, c'est le fonctionnement même du modèle - traiter tout texte reçu comme un contexte à prendre en compte - qui est exploité.
- Particulièrement pertinent dès qu'un agent a **accès à des outils avec effets de bord** (écrire des fichiers, exécuter des commandes, appeler des APIs) et qu'il traite du contenu non fiable (recherche web, contenu d'un endpoint MCP tiers, résultat d'une app externe).
- Mitigations courantes : demander confirmation à l'utilisateur avant une action sensible (c'est ce que font les permissions de Claude Code), isoler les outils à risque, ne jamais faire confiance implicitement à du texte venant d'une source externe, signaler explicitement à l'utilisateur tout contenu qui ressemble à une tentative d'injection plutôt que de l'exécuter silencieusement.
- À ne pas confondre avec le **jailbreak** : le jailbreak cherche à contourner les garde-fous du modèle via le prompt de l'utilisateur lui-même ; le prompt injection vient d'une **source de données tierce**, pas de la personne qui pilote l'agent.

---

## 3. Design patterns agentiques

Au-delà de la boucle agentique de base (section 2), plusieurs **patterns de conception** reviennent pour structurer le travail d'un agent sur des tâches complexes ou multi-étapes. Ce ne sont pas des standards techniques comme MCP - plutôt des façons récurrentes d'organiser le raisonnement et les actions d'un agent, qu'on retrouve autant dans la littérature (Anthropic, Google Cloud, etc.) que dans les skills de ce repo.

**Workflow vs agent** : les patterns ci-dessous se répartissent en deux familles. Un **workflow** a un chemin d'exécution **fixé à l'avance dans le code** (Prompt Chaining, Routing, Parallelization) - le LLM exécute des étapes prédéfinies, il ne décide pas de la structure. Un **agent** décide **dynamiquement**, au moment de la requête, combien d'étapes faire et lesquelles (Orchestrator-Workers, Evaluator-Optimizer, ReAct). Plus un système est agentique, plus il est flexible sur des tâches imprévisibles - mais aussi moins prévisible, plus lent et plus coûteux à exécuter. Un workflow fixe reste préférable dès que la tâche est bien connue et répétitive ; ne monter en agentique que si la variabilité de la tâche le justifie.

### ReAct (Reason + Act)

Le pattern le plus fondamental : l'agent alterne explicitement entre **raisonner** (une étape de réflexion sur ce qu'il faut faire) et **agir** (un appel d'outil), en observant le résultat avant de raisonner à nouveau. En pratique, c'est exactement la boucle agentique décrite en section 2 - "ReAct" est le nom donné à ce mécanisme dans la littérature de recherche (article *"ReAct: Synergizing Reasoning and Acting in Language Models"*, 2022). Il s'appuie directement sur le **tool use / function calling** (section 2) : sans appel d'outil structuré, il n'y a rien à "agir".

### Prompt Chaining

Décomposer une tâche en une **séquence fixe d'étapes** : la sortie d'un LLM devient l'entrée du suivant, avec parfois un point de contrôle ("gate") qui valide la sortie intermédiaire avant de continuer - plutôt que de laisser filer une erreur vers l'étape suivante.

- Différence avec Orchestrator-Workers (plus bas) : le nombre et l'ordre des étapes sont **fixés à l'avance**, pas décidés dynamiquement par l'agent.
- Dans ce repo : le cycle `superpowers:test-driven-development` (écrire un test qui échoue → **vérifier qu'il échoue pour la bonne raison** → écrire le code minimal → **vérifier qu'il passe**) est une chaîne à gates - chaque étape doit être validée avant de passer à la suivante, exactement le rôle du bloc *GATE* de ce type de schéma.

### Routing

Un premier LLM (ou une règle plus simple) classe la requête entrante et la dirige vers un LLM ou un chemin de traitement **spécialisé** parmi plusieurs possibles, plutôt que de tout faire passer par un seul modèle généraliste.

- Exemple générique : un support client qui route une question technique vers un LLM avec accès à la doc produit, et une demande de remboursement vers un flux différent avec accès au système de facturation.
- Dans ce repo, deux variantes du même principe : choisir le modèle (Haiku/Sonnet/Opus) selon la complexité de la tâche (section 5, "Comment choisir un modèle pour une tâche donnée") ; ou choisir **quel subagent** invoquer selon la nature de la demande (`claude-code-guide` pour une question sur Claude Code, `obsidian-expert` pour une tâche Obsidian) - un routing piloté par les descriptions de subagents plutôt que par un LLM routeur dédié.

### Parallelization

Une tâche est éclatée en plusieurs appels LLM **indépendants et connus à l'avance**, exécutés simultanément, puis agrégés - soit pour la vitesse (*sectioning* : chaque LLM traite une portion différente de la tâche), soit pour la fiabilité (*voting* : plusieurs tentatives indépendantes sur la même question, dont on retient la réponse majoritaire ou la meilleure).

- Différence avec Orchestrator-Workers : ici, le nombre de branches et leur contenu sont **fixés avant de lancer les LLM** - pas de décision dynamique en cours de route.
- Dans ce repo : `superpowers:dispatching-parallel-agents` correspond au sectioning - plusieurs subagents indépendants, lancés en parallèle dans un seul message, chacun sur une portion de la tâche connue à l'avance (voir aussi la règle "un seul message, plusieurs appels d'outils indépendants" côté harness).

### Orchestrator-Workers

Un agent central (l'orchestrateur) découpe une tâche volumineuse et distribue les morceaux à des **subagents spécialisés** (workers) qui travaillent en parallèle ou isolément, puis synthétise leurs résultats - mais contrairement à Parallelization, c'est l'orchestrateur qui **décide dynamiquement**, en fonction de la requête reçue, combien de sous-tâches créer et lesquelles.

- Dans ce repo : `superpowers:subagent-driven-development` implémente directement ce pattern - l'agent principal utilise l'outil `Agent` (section 2) pour lancer des subagents (`Explore`, `general-purpose`...) sur des sous-tâches décidées au fil de l'eau, et protège son propre contexte en ne récupérant que leur synthèse finale plutôt que tous leurs résultats intermédiaires.
- Côté frameworks dédiés : LangChain, CrewAI, Microsoft Agent Framework (section 8, "Orchestration multi-agents") formalisent ce pattern comme brique de base.

Ce pattern se décline à **deux niveaux** selon ce qu'on orchestre :

**Niveau 1 - un agent orchestrateur, à l'intérieur d'un seul harness.** L'agent principal, ou un subagent dédié écrit dans `.claude/agents/<nom>.md`, découpe la tâche et lance plusieurs subagents (chacun dans son contexte isolé) puis fusionne leurs retours. Chaque subagent peut tourner sur un **modèle différent** de l'orchestrateur : un petit modèle rapide et pas cher (Haiku) pour les workers de recherche/lecture, un gros modèle (Opus) pour l'orchestrateur qui planifie et synthétise. Utile quand la même orchestration revient souvent - pour un one-shot, l'agent principal sait déjà orchestrer à la volée, inutile d'écrire un fichier. Exemple concret d'agent orchestrateur dans le [`README.md`](./README.md#agent-orchestrateur).

**Niveau 2 - un logiciel qui chapeaute plusieurs harnais.** Un cran au-dessus : au lieu de subagents du même harness, on fait collaborer plusieurs **harnais complets et différents** (Claude Code + Codex + OpenCode + Pi...), chacun avec son modèle et ses forces. Un logiciel dédié - une "ADE", agent development environment, comme **Orca** (Stably AI, MIT, gratuit, tu utilises tes propres abonnements) - lance chaque agent dans un **worktree git isolé**, route les tâches, affiche tout au même endroit et te prévient (ex. sur ton téléphone) quand un agent a besoin d'une décision. Le code ne transite pas par les serveurs d'Orca. Cf. section 8.

### Reflection et Evaluator-Optimizer

L'agent relit et critique sa propre sortie avant de la considérer terminée, plutôt que de s'arrêter à la première génération - un cycle "génère → critique → corrige" répété jusqu'à un résultat satisfaisant. **Evaluator-Optimizer** en est la version la plus structurée : deux rôles explicitement **séparés** - un LLM **générateur** produit une solution, un LLM **évaluateur** distinct la juge et soit l'accepte, soit la rejette avec un feedback précis qui relance une nouvelle tentative du générateur, en boucle jusqu'à acceptation. Séparer les rôles (plutôt qu'un seul LLM qui se relit lui-même) réduit le risque de complaisance envers sa propre sortie.

- Dans ce repo : `superpowers:verification-before-completion` applique la reflection "simple" (l'agent vérifie lui-même son travail) ; `superpowers:requesting-code-review` / `receiving-code-review` implémentent l'Evaluator-Optimizer avec des rôles séparés (code écrit par un agent, revu par un autre) et une boucle accepter/rejeter-avec-feedback.
- Même principe hors contexte agentique : le **LLM-as-judge** (section 5) utilise aussi un modèle évaluateur distinct pour noter la sortie d'un autre.

### Planning

Décomposer un objectif de haut niveau en sous-tâches, séquentielles ou parallèles, **avant** de commencer à exécuter - plutôt que d'improviser au fil de l'eau.

- Dans ce repo : `superpowers:brainstorming` (clarifier l'intention avant de coder), puis `superpowers:writing-plans` (rédiger un plan d'implémentation détaillé) et `superpowers:executing-plans` (l'exécuter avec des points de contrôle) forment ensemble un pipeline de planning complet.

> Ces patterns ne s'excluent pas - un système réel les combine. Claude Code, par exemple, exécute une boucle ReAct de base, applique Reflection en fin de tâche (vérification), et bascule en Orchestrator-Workers dès qu'il lance des subagents pour une recherche volumineuse.

---

## 4. Endpoints

### C'est quoi un endpoint

Un **endpoint**, c'est une URL précise à laquelle on envoie une requête pour parler à un service - la "porte d'entrée" d'une API. Dans un workflow IA, on en croise plusieurs types :

- **Endpoint de modèle (API)** : l'URL que le harness appelle pour envoyer un prompt et récupérer une réponse. Un même fournisseur expose souvent plusieurs endpoints selon la fonction : chat/génération, embeddings, batch (traitement asynchrone en masse, moins cher), fine-tuning.
- **Endpoint auto-hébergé / déployé** : quand un modèle est déployé sur ta propre infra (cloud ML type SageMaker/Vertex AI, ou en local avec **Ollama**), il expose son propre endpoint, distinct de celui du fournisseur d'origine.
- **Endpoint compatible OpenAI** : beaucoup de fournisseurs exposent un endpoint qui respecte le même format que l'API OpenAI, pour permettre de changer de modèle/fournisseur juste en changeant l'URL et la clé, sans réécrire le code.
- **Endpoint MCP** : un serveur MCP expose lui aussi un endpoint - en local via **stdio** (un simple process lancé sur ta machine, ex. Context7), ou à distance en **HTTP** - auquel le harness se connecte. Une fois connecté, l'endpoint **déclare une liste d'outils (tools)** - leur nom, leur description, les arguments qu'ils acceptent - que le harness rend directement utilisables par le modèle, exactement comme ses outils natifs (`Read`, `Edit`, `Bash`...). C'est le même mécanisme de **tool use / function calling** (voir section 2) : le endpoint ne fait qu'ajouter de nouveaux outils à la liste disponible, le modèle ne fait pas de différence entre un outil natif du harness et un outil venu d'un serveur MCP.
  > Le transport distant standard est **Streamable HTTP** (voir section 2, "MCP").
- **Streaming vs non-streaming** : un endpoint peut renvoyer la réponse complète d'un coup, ou la **streamer** token par token au fur et à mesure de la génération.

Un endpoint est généralement protégé par une **authentification** (clé API, token), soumis à des **rate limits** (nombre de requêtes/tokens max par minute), et a sa propre latence - des critères qui comptent dans le choix d'un fournisseur ou d'un déploiement.

### Exemple concret : exposer une app métier comme endpoint MCP

Un cas très courant en dev : rendre une application interrogeable par un agent IA, en l'exposant comme **serveur MCP distant (HTTP)** plutôt qu'en local. L'URL ne contient aucun secret :

```
https://mon-app.exemple.com/api/mcp
```

On l'ajoute comme **MCP personnalisé** dans Claude Desktop, ou en CLI avec `claude mcp add --transport http mon-app https://mon-app.exemple.com/api/mcp`. L'authentification passe ensuite par **OAuth 2.1** :

1. Le client appelle l'endpoint sans token et reçoit une erreur 401, qui lui indique où s'authentifier.
2. L'utilisateur se connecte à l'application et choisit les droits accordés, par exemple lecture seule.
3. Le client reçoit un access token et l'envoie à chaque appel dans l'en-tête `Authorization`.
4. Le serveur vérifie ce token et déduit l'utilisateur et le client de sa connexion, jamais d'un argument de tool.

> **Pas de token dans l'URL** : la spec MCP interdit de placer un access token dans la query string. Une URL finit facilement dans des logs, un historique ou une capture d'écran.

---

## 5. Les modèles : familles, tailles, comment choisir

### Propriétaire vs open-weights

- **Modèles propriétaires** : accessibles uniquement via API du fournisseur (Claude/Anthropic, GPT/OpenAI, Gemini/Google, Grok/xAI, Muse Spark/Meta). Pas de poids téléchargeables.
- **Modèles open-weights** : les poids sont publiés et téléchargeables (Mistral, DeepSeek, Qwen/Alibaba, gpt-oss/OpenAI, Llama/Meta). Un même fournisseur peut proposer les deux : OpenAI publie gpt-oss à côté de GPT, et Meta Llama à côté de Muse Spark. Exécutables en local ou chez n'importe quel hébergeur - utile pour la confidentialité, la souveraineté des données, ou le coût à très grande échelle.

### Fine-tunes communautaires - l'exemple Nous Hermes

Un modèle open-weights publié par son créateur (le "modèle de base") peut être **re-fine-tuné par un tiers** sur des données ciblées, pour produire une variante spécialisée - publiée elle aussi en open-weights, sous un nouveau nom. C'est un fine-tuning fait par la communauté, pas par le fournisseur d'origine.

- **Nous Hermes** (Nous Research) est l'exemple le plus connu : une famille de fine-tunes construits par-dessus des modèles de base (Llama, Mistral, Qwen selon la version), réputée pour son bon comportement en **tool use / function calling** et en tâches agentiques - d'où la confusion fréquente avec un "agent" ou un harness : **Hermes reste un modèle**, pas un outil d'orchestration. C'est le harness (Claude Code, OpenCode...) qui l'utiliserait comme moteur si on voulait le faire tourner dans un contexte agentique.
- Autres fine-tunes communautaires connus : Dolphin, OpenHermes, WizardLM - chacun optimisé pour un usage particulier (moins de refus, meilleur suivi d'instructions, function calling, etc.).
- Pour choisir entre un modèle de base et un de ses fine-tunes : le fine-tune apporte un comportement plus ciblé sur son cas d'usage (souvent mieux pour l'agentique/tool use), mais peut perdre en performance générale par rapport au modèle de base sur d'autres tâches - à tester sur le besoin réel, pas sur la réputation seule.

### Frontier vs petits modèles

Chaque fournisseur propose en général plusieurs tailles de modèles, avec un arbitrage capacité/vitesse/coût :

- **Frontier / haut de gamme** (ex. Fable et Opus côté Claude, Fable visant le raisonnement le plus exigeant) : le plus capable, pour du raisonnement complexe, de l'architecture, des tâches ambiguës.
- **Milieu de gamme** (ex. Sonnet côté Claude) : le meilleur rapport capacité/coût pour l'usage quotidien - c'est le modèle par défaut de la plupart des workflows dev.
- **Petit/rapide** (ex. Haiku côté Claude) : très rapide et peu coûteux, pour des tâches simples, répétitives, ou à fort volume (classification, extraction, résumé court).

### Évaluer et comparer les modèles (benchmarks)

Avant de choisir un modèle, on s'appuie sur des **benchmarks** - des jeux de tests standardisés qui mesurent une capacité précise, pour comparer les modèles entre eux de façon reproductible :

| Benchmark | Ce qu'il mesure |
| --- | --- |
| **MMLU** | Culture générale et connaissances multi-domaines (questions à choix multiples) |
| **HumanEval** | Génération de code Python à partir d'un énoncé |
| **SWE-bench Pro** | Résolution de vraies issues GitHub, en plusieurs langages - le plus proche d'un usage "agent de code" |
| **GPQA** | Questions scientifiques de niveau expert |
| **MATH** | Raisonnement mathématique |

- Limite connue des benchmarks publics : les fournisseurs peuvent avoir vu ces données (volontairement ou non) pendant l'entraînement, ce qui gonfle artificiellement les scores - à prendre comme un indicateur, pas une vérité absolue.
- **LLM-as-judge** : pour évaluer des tâches sans réponse unique correcte (qualité rédactionnelle, pertinence d'une réponse ouverte), on utilise souvent un autre LLM - généralement plus gros - comme "juge", qui note la réponse selon des critères donnés. Pratique courante côté équipes produit IA.
- **Evals maison** : au-delà des benchmarks publics, l'essentiel pour un usage réel est de construire ses propres tests sur ses cas d'usage précis (un jeu de tâches représentatives de ton propre repo/produit) - un benchmark générique ne prédit pas forcément la performance sur un besoin spécifique.

### Comment choisir un modèle pour une tâche donnée

| Critère | Implication |
| --- | --- |
| Complexité du raisonnement | Tâche ambiguë/architecturale → modèle haut de gamme (voire mode "raisonnement étendu") ; tâche mécanique → petit modèle suffit |
| Volume / budget | Beaucoup d'appels répétitifs → petit modèle, moins cher au token |
| Latence requise | Réponse quasi-instantanée nécessaire → petit modèle |
| Taille de contexte nécessaire | Vérifier la fenêtre de contexte max du modèle vs volume de code/docs à fournir |
| Confidentialité / souveraineté | Données sensibles → modèle open-weight en local plutôt qu'API cloud |
| Multimodalité | Besoin d'images/audio/vidéo → vérifier que le modèle les supporte nativement |

### Le "raisonnement étendu" (adaptive thinking / reasoning models)

Certains modèles (ou certains modes de modèles existants) peuvent "réfléchir" plus longtemps avant de répondre - générer une chaîne de raisonnement interne, explorer plusieurs pistes, avant de produire la réponse finale. Ça améliore nettement les résultats sur les tâches complexes (maths, debug difficile, architecture), au prix d'une latence et d'un coût plus élevés. À réserver aux tâches qui le justifient, pas en usage systématique.

Chez Anthropic, c'est l'**adaptive thinking**, dont on règle la profondeur avec le paramètre `effort`.

---

## 6. Prompting et context engineering

### Prompt engineering

L'art de formuler une requête pour obtenir le résultat voulu : instructions claires et non ambiguës, contraintes explicites, format de sortie attendu, exemples si utile. Ce n'est pas de la magie, c'est de la communication précise - la plupart des mauvaises réponses viennent d'un prompt sous-spécifié, pas d'une limite du modèle.

### System prompt

Les instructions **persistantes** qui cadrent le comportement du modèle sur toute une session, indépendamment de ce que l'utilisateur demande ensuite. Dans ce repo : `AGENTS.md` joue ce rôle (conventions de code, stack, règles de commit) - chargé une fois, appliqué à toute la session.

### Zero-shot, few-shot, chain-of-thought

- **Zero-shot** : demander directement, sans exemple.
- **Few-shot** : donner un ou plusieurs exemples du résultat attendu dans le prompt, pour cadrer le format/style.
- **Chain-of-thought** : demander au modèle de "réfléchir à voix haute" étape par étape avant de conclure - améliore la fiabilité sur les tâches à plusieurs étapes logiques.

### Context engineering

Une discipline de plus en plus centrale avec les agents autonomes : **gérer activement ce qu'on met dans la fenêtre de contexte**, plutôt que d'y déverser tout ce qui est disponible. Concrètement :

- Ne charger que les fichiers pertinents pour la tâche en cours, pas tout le repo.
- Résumer/compacter l'historique de conversation quand il devient trop long (Claude Code le fait automatiquement en approchant la limite).
- Séparer la mémoire long-terme (voir section 7) du contexte de la tâche en cours, pour ne pas polluer chaque requête avec tout l'historique.
- Utiliser des subagents pour isoler des recherches volumineuses (ex. explorer un gros repo) sans polluer le contexte principal avec les résultats intermédiaires.

Un contexte mal géré (trop long, mal trié) dégrade la qualité des réponses et fait grimper le coût - c'est souvent plus déterminant pour la qualité du résultat que le choix du modèle lui-même.

---

## 7. RAG, embeddings et mémoire

### Embeddings

Un **embedding** est une représentation numérique (un vecteur) du sens d'un texte - deux textes proches en signification ont des vecteurs proches dans cet espace. C'est la brique de base de la recherche sémantique : au lieu de chercher des mots-clés exacts, on cherche des contenus "proches en sens".

### RAG (Retrieval-Augmented Generation)

Plutôt que de tout mettre dans le prompt (impossible à grande échelle) ou de fine-tuner un modèle (coûteux), le **RAG** va chercher dynamiquement l'information pertinente dans une base externe (souvent une **base vectorielle** - Pinecone, Weaviate, pgvector, Chroma) au moment de la requête, et l'injecte dans le contexte avant de générer la réponse. C'est la technique derrière la plupart des "chat avec vos documents" et des assistants de doc technique.

### Fine-tuning vs prompting vs RAG - quand utiliser quoi

| Besoin | Solution la plus adaptée |
| --- | --- |
| Changer le comportement/style ponctuellement | Prompting / system prompt |
| Donner accès à des infos à jour ou volumineuses | RAG |
| Changer durablement le "style" ou les réflexes du modèle sur un domaine très spécifique | Fine-tuning (rare en usage dev courant) |

Dans l'immense majorité des cas côté dev, prompting + contexte bien géré + RAG couvrent le besoin - le fine-tuning reste l'exception.

### Mémoire d'agent

Un système de **mémoire persistante** permet à un agent de se souvenir d'une session à l'autre : préférences de l'utilisateur, contexte projet, retours d'expérience - sans avoir à tout réexpliquer à chaque conversation. C'est distinct du contexte d'une session (qui disparaît à la fin) : la mémoire est relue et écrite explicitement, en dehors de la fenêtre de contexte "vive".

---

## 8. Panorama des outils

| Catégorie | Outils |
| --- | --- |
| **Modèles / plateformes** | Claude (Anthropic), GPT (OpenAI), Gemini (Google), Grok (xAI), Llama et Muse Spark (Meta), Mistral, DeepSeek, Qwen (Alibaba) |
| **Fine-tunes communautaires** | Nous Hermes (Nous Research), Dolphin, OpenHermes, WizardLM |
| **Harness CLI agentique** | Claude Code, OpenCode, Codex CLI, Antigravity CLI, Mistral Vibe, Aider |
| **IDE avec agent intégré** | Cursor, GitHub Copilot (mode agent), Zed |
| **Agents autonomes cloud** | Claude Code (mode cloud/remote), Jules (Google) |
| **Protocoles / standards** | MCP (Model Context Protocol), A2A, Agent Skills, function calling / tool use |
| **Orchestration multi-agents (frameworks)** | LangChain, LangGraph, Claude Agent SDK, LlamaIndex, CrewAI, Microsoft Agent Framework |
| **Chapeautage multi-harnais (ADE)** | Orca (Stably AI) - fait tourner Claude Code, Codex, OpenCode, Pi... côte à côte, chacun isolé dans son worktree git ; desktop + app mobile |
| **AI Gateway / routing multi-fournisseurs** | LiteLLM, OpenRouter, Portkey |
| **Agents navigateur / computer use** | Playwright (MCP), Claude in Chrome, computer use (API) |
| **Bases vectorielles (RAG)** | Pinecone, Weaviate, Chroma, pgvector |
| **Exécution locale** | Ollama, LM Studio |
| **Observabilité / évaluation** | LangSmith, Langfuse, evals maison |
| **Benchmarks connus** | MMLU, HumanEval, SWE-bench Pro, GPQA, MATH |

---

## 9. Architecture de fichiers pour agents IA

Au-delà des concepts (section 2) et des patterns (section 3), une question très concrète revient dès qu'on met en place un repo pensé pour les agents IA : **où mettre quoi**. Cette organisation n'est pas arbitraire - elle découle directement de la façon dont le harness (section 2) construit le system prompt (section 6) et gère le prompt caching (section 1) à chaque session.

### Le fichier d'instructions racine : CLAUDE.md et AGENTS.md

Le fichier qui joue le rôle de **system prompt persistant** (section 6) pour un repo porte des noms différents selon l'outil :

- **`CLAUDE.md`** : le nom historique propre à Claude Code.
- **`AGENTS.md`** : un standard ouvert, sans frontmatter ni syntaxe imposée - juste du Markdown avec des titres et des listes - formalisé en 2025 (porté à l'origine par OpenAI, avec Google, Cursor, Factory) puis confié à l'Agentic AI Foundation (Linux Foundation) fin 2025. Il vise explicitement à remplacer le patchwork `CLAUDE.md` / `.cursorrules` / `GEMINI.md` par **un seul fichier lu par tous les outils** (Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Copilot, Aider, Zed...).

**Où le placer :** à la **racine du repo**, toujours - c'est l'endroit où tous les harness le cherchent par défaut, sans configuration supplémentaire.

- **Claude Code lit `AGENTS.md` nativement depuis la v2.1.277** ([doc officielle](https://code.claude.com/docs/en/memory#agents-md)), mais seulement au niveau **projet** (répertoire de travail et parents) - pas au niveau utilisateur/global, qui ne connaît que `CLAUDE.md`. Précédence par défaut : si un `CLAUDE.md` (ou `CLAUDE.local.md`) existe dans l'arborescence du projet, il est lu à la place d'`AGENTS.md`, pas en plus ; le réglage `claude-md-and-agents-md` (`/config`, *Project instructions*) permet de lire les deux. Pour le scope global, la seule option reste un `CLAUDE.md` qui importe l'autre (`@AGENTS.md`), ou un symlink `ln -s AGENTS.md CLAUDE.md`.

**Contenu typique** (ce n'est pas une doc générale du projet - ça, c'est le rôle du `README.md`) :

| Section | Exemple |
| --- | --- |
| Stack et structure | Framework, langage, organisation des dossiers |
| Commandes | Build, test, lint, commandes de dev courantes |
| Conventions | Style de code, conventions de commit, règles de nommage |
| Contraintes | Ce que l'agent ne doit jamais faire (ex. ne pas toucher à telle zone, ne pas committer sans confirmation) |

> Comme ce fichier est injecté à **chaque** session et reste stable d'un appel à l'autre, il bénéficie à plein du prompt caching (section 1) - le garder court et stable coûte moins cher et va plus vite à traiter que d'y déverser toute la documentation du projet, qui a davantage sa place en RAG (section 7) ou en fichiers chargés à la demande.

### Le dossier de config du harness : .claude/ et .opencode/

À côté du fichier d'instructions, chaque harness range sa configuration structurée dans un dossier caché dédié - à la racine du repo pour la partie projet, et dans le profil utilisateur pour la partie globale.

**Claude Code - `.claude/` (projet) :**

| Chemin | Rôle | Committé ? |
| --- | --- | --- |
| `.claude/settings.json` | Config partagée avec l'équipe : permissions d'outils, hooks | Oui |
| `.claude/settings.local.json` | Overrides personnels (souvent générés par les prompts d'autorisation) | Non - à gitignorer |
| `.claude/agents/*.md` | Subagents (section 2) : un fichier par agent, frontmatter `name` / `description` / `model` / `color` | Oui |
| `.claude/skills/<nom>/SKILL.md` | Skills projet (section 2), invocables via `/nom` | Oui |
| `.claude/commands/*.md` | Commandes custom (`/nom`), équivalentes à un skill ; à nom égal, le skill l'emporte | Oui |
| `.mcp.json` (à la racine, hors `.claude/`) | Serveurs MCP (section 2) scopés au projet | Oui, sauf secrets en dur |

Les **hooks** (section 2) ne sont pas des fichiers séparés : ils se déclarent comme un champ `hooks` dans `settings.json`, qui associe un événement (avant/après un appel d'outil, début/fin de session...) à une commande shell.

**Claude Code - `~/.claude/` (utilisateur, global) :** même logique de structure (`settings.json`, `agents/`, `commands/`, plugins installés) mais appliquée à **toutes** les sessions, tous projets confondus - pour des préférences personnelles plutôt que des règles d'équipe.

**OpenCode - `.opencode/` (projet) :** structure équivalente mais nommée différemment - `.opencode/agent/` (au singulier), où le chemin devient l'id de l'agent (`.opencode/agent/team/reviewer.md` → agent `team/reviewer`), `.opencode/command/`, et `opencode.json` pour la config générale (modèles, outils, MCP). Contrairement à ce qu'on pourrait croire, OpenCode ne se limite pas à `AGENTS.md` : au niveau projet il cherche `AGENTS.md` en priorité, mais lit `CLAUDE.md` en repli si aucun `AGENTS.md` n'existe dans le dossier - si les deux existent, seul `AGENTS.md` est pris en compte ([doc officielle](https://opencode.ai/docs/rules/)). Global et projet se **combinent** (pas de remplacement). Le pendant global est `~/.config/opencode/`.

| | Claude Code | OpenCode |
| --- | --- | --- |
| Fichier d'instructions racine | `AGENTS.md` natif (v2.1.277+), repli sur `CLAUDE.md` si présent | `AGENTS.md`, repli sur `CLAUDE.md` si absent |
| Dossier config projet | `.claude/` | `.opencode/` |
| Subagents | `.claude/agents/*.md` | `.opencode/agent/**/*.md` |
| Config générale | `.claude/settings.json` | `opencode.json` |
| Dossier config global | `~/.claude/` | `~/.config/opencode/` |

### Portée : projet, sous-dossier, utilisateur, organisation

Un fichier d'instructions n'a pas une seule portée possible - plusieurs coexistent, du plus large au plus spécifique :

| Portée | Emplacement | Chargé quand |
| --- | --- | --- |
| Organisation | Fichier managé côté entreprise (politique commune) | Toujours, avant tout le reste |
| Utilisateur (global) | `~/.claude/CLAUDE.md` | Toujours, toutes sessions, tous projets |
| Projet (racine) | `./CLAUDE.md` ou `./AGENTS.md` | À l'ouverture de session dans ce repo |
| Sous-dossier (monorepo) | `./frontend/CLAUDE.md`, `./infra/CLAUDE.md`... | À la demande, seulement quand l'agent lit/édite un fichier de ce sous-dossier |
| Local, non partagé | `./CLAUDE.local.md` (gitignoré) | À l'ouverture de session, notes perso non versionnées |

Claude Code remonte l'arborescence depuis le fichier courant et **concatène** ce qu'il trouve à chaque niveau - c'est ce qui permet, dans un monorepo, de garder des règles Terraform dans `/infra/CLAUDE.md` sans polluer le contexte quand on travaille sur `/frontend/` : une application concrète du context engineering (section 6).

### Bonnes pratiques

- **Un seul fichier d'instructions racine.** Privilégier `AGENTS.md` pour la portabilité multi-outils ; si un outil legacy exige `CLAUDE.md`, importer ou symlinker plutôt que dupliquer - deux fichiers qui divergent au fil des mises à jour sont pires que l'absence de fichier.
- **Committer la config partagée, gitignorer le perso.** `.claude/settings.json`, `agents/`, `skills/` sont pensés pour l'équipe ; `settings.local.json` et tout fichier contenant un token/clé ne doivent jamais être committés.
- **Garder le fichier racine court.** Il est relu à chaque session et pèse sur le prompt caching (section 1) - la documentation volumineuse a davantage sa place en fichiers séparés référencés, voire en RAG (section 7), que collée dans `AGENTS.md`.
- **Sous-dossiers seulement si le contexte diverge vraiment.** Un monorepo avec un vrai frontend et une vraie infra justifie des `CLAUDE.md` locaux ; un repo simple n'en a pas besoin - la complexité doit suivre un besoin réel, pas être ajoutée par précaution.
- **Centraliser en global ce qui n'est pas spécifique à un projet.** Agents, skills, commandes et plugins/MCP personnels (pas des règles d'équipe) devraient vivre une seule fois dans `~/.claude/` plutôt que d'être dupliqués dans chaque repo - c'est le scope **utilisateur** du tableau ci-dessus, chargé automatiquement à chaque session, tous projets confondus. Chaque nouveau projet n'a alors besoin que d'un `CLAUDE.md`/`AGENTS.md` minimal propre à son contexte (stack, conventions, contraintes) : tout le reste de l'outillage suit déjà, sans rien reconfigurer. En cas de nom identique en projet et en global (ex. un agent `obsidian-expert` dans les deux), la version **projet** prend le dessus - pratique pour surcharger ponctuellement un agent global sur un repo précis sans toucher à la config personnelle.
- **Un dossier canonique + des symlinks pour être agnostique du harness.** Le tableau plus haut montre que chaque outil range sa config global sous un nom différent (`~/.claude/` pour Claude Code, `~/.config/opencode/` pour OpenCode...). Plutôt que de dupliquer un agent ou un skill dans chacun, garder une seule copie source dans un dossier neutre (ex. `~/agents/`, souvent versionné dans un repo dotfiles) et faire pointer chaque harness dessus par symlink :

  ```bash
  ln -s ~/agents/obsidian-expert.md ~/.claude/agents/obsidian-expert.md
  ln -s ~/agents/obsidian-expert.md ~/.config/opencode/agent/obsidian-expert.md
  ```

  Le contenu n'est édité qu'à un seul endroit et reste disponible identiquement, que ce soit Claude Code ou OpenCode qui tourne - sans copier-coller à synchroniser à la main à chaque changement. Seule limite : le frontmatter (`name`/`description`/`model`/`color` côté Claude Code, structure un peu différente côté OpenCode) n'est pas forcément 100 % interchangeable champ pour champ selon l'outil - mais le corps de l'instruction, lui, reste commun.

- **Un MCP en scope utilisateur, agnostique du harness : le symlink ne marche pas.** Contrairement aux agents/skills (point précédent), un serveur MCP déclaré en scope **utilisateur** ne peut **pas** être partagé par un simple symlink entre Claude Code et OpenCode - deux obstacles cumulés, pas juste un frontmatter qui diverge :
  - **Le fichier conteneur n'est pas dédié côté Claude Code.** Le scope projet a un fichier propre (`.mcp.json`, uniquement des serveurs MCP - symlinkable sans problème). Mais le scope utilisateur (`claude mcp add --scope user ...`) écrit dans la clé `mcpServers` de `~/.claude.json`, un **gros fichier d'état** qui mélange aussi session state, cache, analytics, préférences UI. Symlinker ce fichier entier vers la config OpenCode n'a aucun sens ; symlinker juste une clé JSON à l'intérieur d'un fichier n'est pas possible nativement (contrairement à un fichier markdown entier). Le format est d'ailleurs jugé assez confus pour avoir sa propre issue GitHub ([anthropics/claude-code#37165](https://github.com/anthropics/claude-code/issues/37165)), et `--scope user` a un historique de bugs sur la disponibilité effective inter-projets ([anthropics/claude-code#32939](https://github.com/anthropics/claude-code/issues/32939)) - à vérifier avec `claude mcp list` après coup plutôt qu'à supposer que ça marche.
  - **Le schéma JSON diverge, même pour le même serveur.** Claude Code (`mcpServers`) : `command` (string) + `args` (array) séparés, `env` pour les variables. OpenCode (`opencode.json`, clé `mcp`) : `type: "local"` ou `"remote"` obligatoire, `command` en **un seul array** combinant binaire et arguments, `environment` (pas `env`) pour les variables. Un même serveur playwright s'écrit donc différemment dans chaque fichier :
    ```json
    // Claude Code - ~/.claude.json, clé "mcpServers"
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] }

    // OpenCode - opencode.json (ou ~/.config/opencode/opencode.json), clé "mcp"
    "playwright": { "type": "local", "command": ["npx", "-y", "@playwright/mcp@latest"] }
    ```
  - **Verdict : pas de source unique symlinkée pour le scope utilisateur.** La solution pragmatique est de dupliquer volontairement le bloc de déclaration (deux blocs de 2-3 lignes, un par harness, versionnés côte à côte dans le repo dotfiles) plutôt que d'automatiser une génération à partir d'un format pivot - le gain n'en vaut pas la fragilité d'un script qui réécrirait `~/.claude.json`. Si le besoin est **par projet** plutôt que global, préférer `.mcp.json` (scope projet Claude Code) : fichier dédié, committable, donc un bien meilleur candidat au symlink vers l'équivalent projet d'OpenCode que le scope utilisateur.

---

## 10. Références incontournables : le workflow IA au quotidien

Au-delà des concepts, quelques sites reviennent en permanence dès qu'on travaille avec des LLM - à avoir en favoris. Contrairement au panorama d'outils (section 8, plus large), cette liste se limite à ce qui s'utilise concrètement au quotidien : trouver un modèle, l'appeler, le comparer, le faire tourner.

| Ressource | Lien | Utilité dans le workflow |
| --- | --- | --- |
| **Hugging Face** | huggingface.co | Le hub de modèles/datasets open-weights (Qwen, Llama, DeepSeek...) + Spaces (démos en ligne) + Inference API. Le point de départ pour trouver et tester un modèle avant de l'utiliser en local ou via API. |
| **OpenRouter** | openrouter.ai | Une seule clé API (format compatible OpenAI) pour appeler des dizaines de fournisseurs/modèles, propriétaires et open-weights. Comparateur de prix/latence par modèle intégré, fallback automatique si un fournisseur est indisponible - évite de multiplier les comptes et clés API pour tester différents modèles. |
| **Ollama** | ollama.com | Exécution de modèles open-weights en local en une commande (`ollama run qwen3`) ; `ollama.com/library` pour parcourir le catalogue de modèles prêts à l'emploi. |
| **LM Studio** | lmstudio.ai | Équivalent d'Ollama avec interface graphique - pratique pour tester des modèles locaux sans terminal. |
| **Artificial Analysis** | artificialanalysis.ai | Comparateur indépendant de perf/prix/latence entre fournisseurs et modèles (frontier et open-weights) - pour choisir sur des critères objectifs plutôt que sur la réputation. |
| **llm-stats.com** | llm-stats.com | Équivalent d'Artificial Analysis, avec en plus un flux de nouveautés modèles tenu à jour (`llm-stats.com/ai-news`). |
| **Arena** | arena.ai | Classement par préférence humaine en aveugle (deux réponses comparées, l'utilisateur vote pour la meilleure) - complète les benchmarks académiques (section 5) par une mesure d'usage réel. |
| **MCP - doc officielle** | modelcontextprotocol.io | Spec officielle du protocole MCP (section 2) - pour trouver un serveur MCP existant ou comprendre le protocole avant d'en coder un. |
| **Docs officielles fournisseurs** | platform.claude.com/docs / platform.openai.com/docs / ai.google.dev | Première source pour tout détail précis d'API (pricing exact, limites, nouveaux paramètres) - toujours préférer à un article tiers qui peut dater vite. |
| **Veille communautaire** | r/LocalLLaMA · simonwillison.net · latent.space | Suivi qualitatif de l'IA locale, des patterns agentiques et des retours d'expérience terrain, en complément du briefing `ai-news`. |

> **OpenRouter en particulier** mérite d'être dans les favoris dès qu'on développe avec des LLM : c'est le moyen le plus rapide de comparer deux modèles sur une vraie tâche (même code, juste l'URL/modèle qui change) sans devoir ouvrir un compte chez chaque fournisseur.

---

## 11. Glossaire condensé

| Terme | Définition courte |
| --- | --- |
| **LLM** | Modèle entraîné à prédire le prochain token d'un texte |
| **Fine-tune communautaire** | Modèle open-weights ré-entraîné par un tiers sur un modèle de base (ex. Nous Hermes sur Llama/Mistral/Qwen), pour un usage spécialisé |
| **Token** | Unité de texte de base manipulée par le modèle (≈ un mot ou un fragment de mot) |
| **Paramètre** | Poids numérique appris pendant l'entraînement ; leur nombre approxime la "taille" du modèle |
| **Context window** | Nombre max de tokens (entrée + sortie) que le modèle peut traiter en une fois |
| **Inference** | Génération d'une réponse par un modèle déjà entraîné (usage courant) |
| **Training** | Phase d'apprentissage du modèle, coûteuse, faite par le fournisseur |
| **Fine-tuning** | Ré-entraînement partiel d'un modèle sur des données spécifiques |
| **Quantization** | Réduction de la précision numérique des poids pour gagner en vitesse/mémoire |
| **MoE (Mixture of Experts)** | Architecture où seule une partie des paramètres est activée par requête |
| **Offloading (VRAM/RAM/SSD)** | Répartir les poids d'un modèle entre GPU (rapide, cher, limité) et RAM/SSD (lent, bon marché, abondant) - viable pour un MoE car seuls les experts actifs doivent transiter vite |
| **RLHF** | Reinforcement Learning from Human Feedback - technique de post-training qui aligne le modèle sur les préférences humaines |
| **Hallucination** | Réponse générée avec assurance mais factuellement fausse |
| **Temperature / top-p** | Paramètres qui contrôlent le degré d'aléatoire/créativité de la génération |
| **Harness** | Logiciel qui entoure un LLM pour lui donner des outils, une mémoire et une boucle d'exécution |
| **Harness engineering** | Conception de ce qui encadre un agent de code : règles, outils, garde-fous et vérifications automatiques |
| **Agent** | Système qui exécute une tâche de façon autonome via une boucle observer/agir |
| **Agentic engineering** | Développement logiciel piloté avec des agents de code, en gardant les exigences d'ingénierie : architecture, tests, revue. S'oppose au simple usage ponctuel de l'autocomplétion |
| **Spec-driven development** | Méthode où une spec détaillée et testable précède le code, puis pilote les agents dans une boucle spec, génération, tests, correction |
| **ReAct** | Pattern où l'agent alterne raisonnement explicite et appel d'outil - nom donné à la boucle agentique de base |
| **Prompt Chaining** | Décomposition d'une tâche en une séquence fixe d'étapes, la sortie de l'une nourrissant l'entrée de la suivante |
| **Routing** | Dispatch d'une requête vers un LLM ou un chemin de traitement spécialisé parmi plusieurs, selon sa nature |
| **Parallelization** | Exécution simultanée de plusieurs LLM sur des sous-tâches connues à l'avance (sectioning) ou sur la même tâche (voting), suivie d'une agrégation |
| **Orchestrator-Workers** | Pattern où un agent central distribue dynamiquement des sous-tâches à des subagents spécialisés puis synthétise leurs résultats |
| **Agent orchestrateur** | Agent (ou subagent dédié dans `.claude/agents/`) qui applique Orchestrator-Workers : découpe la tâche, lance plusieurs subagents - éventuellement sur des modèles différents - puis fusionne leurs retours |
| **ADE / chapeautage multi-harnais** | Logiciel qui fait tourner et coordonne plusieurs harnais complets et différents (Claude Code, Codex, OpenCode, Pi...) en parallèle, chacun isolé dans son worktree git (ex. Orca) |
| **Reflection** | Pattern où l'agent critique et corrige sa propre sortie avant de la considérer terminée |
| **Evaluator-Optimizer** | Version structurée de reflection avec un LLM générateur et un LLM évaluateur séparés, en boucle accepter/rejeter-avec-feedback |
| **Planning (agentique)** | Pattern de décomposition d'un objectif en sous-tâches avant exécution |
| **Workflow (vs agent)** | Système dont le chemin d'exécution est fixé à l'avance dans le code, par opposition à un agent qui décide dynamiquement de son parcours |
| **Tool use / function calling** | Capacité du modèle à appeler un outil avec des arguments structurés |
| **Computer use** | Variante du tool use où le modèle pilote une interface graphique (navigateur, OS) via captures d'écran et actions bas niveau, plutôt que des outils à arguments typés |
| **MCP** | Standard ouvert pour connecter un LLM à des outils/données externes de façon uniforme ; cœur du protocole stateless + framework d'Extensions (`MCP Apps`, `Tasks`) |
| **AI Gateway** | Couche centralisée de routage/policy entre une app et plusieurs fournisseurs de modèles (ex. LiteLLM, OpenRouter) - un seul point pour changer de modèle/fournisseur sans réécrire le code appelant |
| **Endpoint** | URL précise à laquelle on envoie une requête pour parler à un service (API modèle, serveur MCP, déploiement local...) |
| **Rate limit** | Nombre maximum de requêtes/tokens qu'un endpoint accepte par unité de temps |
| **Transformer** | Architecture de réseau de neurones basée sur l'attention, utilisée par la quasi-totalité des LLM |
| **Attention** | Mécanisme qui permet à chaque token de pondérer l'importance des autres tokens de la séquence pour construire son sens en contexte |
| **Auto-régressif** | Mode de génération où le modèle prédit un token à la fois, en réutilisant les tokens déjà générés |
| **Prompt caching** | Mise en cache de la portion stable d'un prompt pour réduire coût et latence sur les requêtes suivantes |
| **Prompt injection** | Instructions cachées dans du contenu externe (page web, résultat d'outil...) qui tentent de détourner le comportement d'un agent |
| **Jailbreak** | Tentative de contourner les garde-fous d'un modèle via le prompt de l'utilisateur lui-même |
| **Benchmark** | Jeu de tests standardisé qui mesure une capacité précise d'un modèle, pour comparer les modèles entre eux |
| **LLM-as-judge** | Utiliser un LLM pour évaluer/noter la réponse d'un autre modèle sur une tâche sans réponse unique correcte |
| **Skill** | Prompt réutilisable et versionné, invocable à la demande |
| **Subagent** | Instance séparée du modèle avec son propre contexte/rôle, lancée par l'agent principal |
| **Hook** | Commande shell déclenchée automatiquement par le harness sur un événement |
| **Prompt engineering** | Formuler une requête pour obtenir le résultat voulu |
| **System prompt** | Instructions persistantes qui cadrent le comportement du modèle sur toute une session |
| **Zero-shot / few-shot** | Demander sans exemple / avec un ou plusieurs exemples dans le prompt |
| **Chain-of-thought** | Raisonnement explicite étape par étape avant de conclure |
| **Context engineering** | Gestion active de ce qui entre dans la fenêtre de contexte |
| **Embedding** | Représentation vectorielle du sens d'un texte, utilisée pour la recherche sémantique |
| **RAG** | Injection dynamique d'information externe pertinente dans le contexte, au moment de la requête |
| **Guardrails** | Garde-fous (techniques ou de prompt) qui limitent les sorties indésirables d'un modèle |
| **Latency / throughput** | Temps de réponse d'une requête / nombre de requêtes traitées par unité de temps |
| **CLAUDE.md / AGENTS.md** | Fichier d'instructions persistant à la racine d'un repo, lu comme system prompt par le harness ; `AGENTS.md` est le standard ouvert multi-outils, `CLAUDE.md` le nom historique côté Claude Code |
| **.claude/ / .opencode/** | Dossier de configuration du harness dans un projet : subagents, skills, commands, settings - la contrepartie projet du dossier global (`~/.claude/`, `~/.config/opencode/`) |
