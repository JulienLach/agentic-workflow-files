# Concepts IA — comprendre le workflow IA moderne (dev & au-delà)

Un document de référence pour comprendre le vocabulaire, les concepts et les outils qu'on croise partout dès qu'on parle de LLM et d'agents IA — écrit pour un développeur qui veut être solide sur le sujet (entretien, veille techno, choix d'outils), pas pour un chercheur en ML.

Chaque section combine **le concept** et **des outils concrets** qui l'illustrent, pour ancrer la théorie dans des choses que tu utilises déjà (notamment via ce repo).

---

## Table des matières

1. [Les fondamentaux d'un LLM](#1-les-fondamentaux-dun-llm)
2. [Harness, agents et boucle agentique](#2-harness-agents-et-boucle-agentique)
3. [Endpoints](#3-endpoints)
4. [Les modèles : familles, tailles, comment choisir](#4-les-modèles--familles-tailles-comment-choisir)
5. [Prompting et context engineering](#5-prompting-et-context-engineering)
6. [RAG, embeddings et mémoire](#6-rag-embeddings-et-mémoire)
7. [Panorama des outils](#7-panorama-des-outils)
8. [Glossaire condensé](#8-glossaire-condensé)

---

## 1. Les fondamentaux d'un LLM

### Qu'est-ce qu'un LLM

Un **LLM** (Large Language Model, grand modèle de langage) est un réseau de neurones entraîné à prédire le **prochain token** d'un texte, à partir de tout ce qui précède. C'est tout — pas de "compréhension" au sens humain, mais à force d'avoir vu des quantités massives de texte, cette simple tâche de prédiction fait émerger des capacités de raisonnement, de code, de traduction, etc.

### Paramètres — c'est quoi, et pourquoi on en parle tout le temps

Les **paramètres** sont les poids numériques ajustés pendant l'entraînement — ce sont eux qui "encodent" ce que le modèle a appris. Plus il y en a, plus le modèle peut représenter des relations complexes dans les données.

- **Petits modèles** (quelques milliards de paramètres, ex. la gamme Haiku, les modèles "mini"/"nano"/"flash" chez les autres fournisseurs) : rapides, peu coûteux, parfaits pour des tâches simples, répétitives, ou à très fort volume.
- **Modèles "frontier"** (des centaines de milliards à plus de mille milliards de paramètres estimés) : les plus capables tous domaines, mais plus lents et plus chers à l'inférence.
- Le nombre de paramètres seul ne dit pas tout : l'architecture, les données d'entraînement et le post-training (RLHF, etc.) comptent autant que la taille brute. Un modèle plus petit mais mieux entraîné peut battre un plus gros modèle mal optimisé sur une tâche donnée.

> **MoE (Mixture of Experts)** : une architecture où le modèle est découpé en "sous-réseaux" spécialisés (experts), et seule une fraction d'entre eux est activée à chaque requête. Ça permet d'avoir un modèle avec un nombre total de paramètres énorme, tout en restant rapide à l'inférence (peu de paramètres réellement utilisés par requête).

### Tokens — l'unité de mesure de tout

Un **token** est un fragment de texte (souvent un mot, un bout de mot, ou un caractère) — l'unité de base que le modèle manipule. Le texte est découpé par un **tokenizer** avant d'être envoyé au modèle.

- En français/anglais, un mot fait en moyenne 1 à 1,5 token ; un mot rare ou composé peut en faire plusieurs.
- **Le prix d'un appel API se calcule en tokens**, pas en mots ni en caractères (tokens en entrée + tokens en sortie).
- **La fenêtre de contexte (context window)** est aussi mesurée en tokens : c'est le nombre maximum de tokens que le modèle peut "voir" en une fois, en comptant l'historique de conversation, les fichiers fournis, les instructions système et la réponse générée.
  - Exemple d'ordre de grandeur courant : 100k à 1M+ tokens selon le modèle et le fournisseur.
  - Une fenêtre plus grande ne veut pas dire "utilise tout sans réfléchir" : au-delà d'un certain volume, la qualité peut se dégrader (effet *lost in the middle* — le modèle "oublie" ce qui est au milieu d'un contexte très long). D'où l'intérêt du **context engineering** (section 5).

### Training vs inference

- **Training (entraînement)** : la phase où le modèle apprend, sur des clusters de GPU/TPU, pendant des semaines. Coûteux, rare (une poignée de fois par génération de modèle).
- **Inference (inférence)** : la phase où tu utilises le modèle déjà entraîné pour générer une réponse. C'est ce que tu fais à chaque prompt envoyé à Claude, ChatGPT, etc.
- **Fine-tuning** : ré-entraîner (partiellement) un modèle déjà entraîné sur un jeu de données spécifique, pour le spécialiser. Coûteux et rarement nécessaire pour un usage dev classique — la plupart des besoins se couvrent avec du bon prompting et du contexte (RAG), pas du fine-tuning.

### Poids et quantization

Les **poids (weights)** sont les valeurs numériques des paramètres. La **quantization** consiste à réduire leur précision numérique (ex. de 16 bits à 8 ou 4 bits) pour que le modèle prenne moins de mémoire et tourne plus vite — au prix d'une petite perte de qualité. C'est la technique qui permet de faire tourner des modèles open-weights en local, sur une machine avec un GPU grand public (via des outils comme **Ollama** ou **LM Studio**).

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
| **Gemini CLI** (Google) | CLI agentique côté Google |
| **Aider** | CLI open-source, orienté pair-programming en terminal |
| **Cursor**, **Windsurf** | IDE avec agent intégré (fork de VS Code) |
| **GitHub Copilot** (mode agent) | Extension IDE + agent autonome dans les PR/issues |
| **Devin** (Cognition) | Agent autonome "ingénieur logiciel" cloud |

### La boucle agentique (agentic loop)

Ce qui distingue un **agent** d'un simple chatbot : le cycle **observer → planifier → agir → observer le résultat → recommencer**, de façon autonome, jusqu'à ce que la tâche soit terminée (ou qu'un point de blocage nécessite l'humain). Concrètement, dans Claude Code : tu donnes une tâche, l'agent lit des fichiers, exécute des commandes, regarde le résultat, corrige, jusqu'à ce que ce soit fait — sans que tu valides chaque étape individuellement (sauf configuration contraire).

### Tool use / function calling

La capacité du modèle à décider, au milieu de sa génération, d'**appeler un outil** avec des arguments structurés (ex. `Read(file_path="...")`) plutôt que de répondre uniquement en texte. C'est le mécanisme technique de base qui rend l'agentique possible — le modèle "choisit" quel outil utiliser et avec quels paramètres, le harness exécute l'appel et renvoie le résultat au modèle.

### MCP (Model Context Protocol)

Standard ouvert créé par Anthropic pour connecter un LLM à des sources de données et outils externes de façon **uniforme**, plutôt que de coder une intégration spécifique par outil et par fournisseur de modèle — souvent résumé comme *"l'USB-C des agents IA"*. Un **serveur MCP** expose des outils/ressources que n'importe quel harness compatible peut utiliser.

- Exemple dans ce repo : **Context7** (documentation de librairies à jour, servie via MCP).

### Skills, plugins et subagents

- **Skill** : un fichier d'instructions réutilisable, invocable à la demande (`/nom-du-skill`) — un prompt structuré et versionné plutôt qu'à réécrire à chaque fois. Ex. `/code-review`, `/debug` dans ce repo.
- **Plugin** : un bundle complet (skills + MCP + hooks) packagé et installable en une commande.
- **Subagent** : une instance séparée du modèle, avec son propre contexte, ses propres outils et parfois son propre modèle, lancée par l'agent principal pour isoler ou paralléliser une tâche. Ex. `obsidian-expert` dans ce repo.
- **Hook** : une commande shell déclenchée **automatiquement** par le harness en réaction à un événement précis (avant/après un appel d'outil, fin de session...) — de l'automatisation "dure", pas pilotée par une décision du modèle.

---

## 3. Endpoints

### C'est quoi un endpoint

Un **endpoint**, c'est une URL précise à laquelle on envoie une requête pour parler à un service — la "porte d'entrée" d'une API. Dans un workflow IA, on en croise plusieurs types :

- **Endpoint de modèle (API)** : l'URL que le harness appelle pour envoyer un prompt et récupérer une réponse. Un même fournisseur expose souvent plusieurs endpoints selon la fonction : chat/génération, embeddings, batch (traitement asynchrone en masse, moins cher), fine-tuning.
- **Endpoint auto-hébergé / déployé** : quand un modèle est déployé sur ta propre infra (cloud ML type SageMaker/Vertex AI, ou en local avec **Ollama**), il expose son propre endpoint, distinct de celui du fournisseur d'origine.
- **Endpoint compatible OpenAI** : beaucoup de fournisseurs exposent un endpoint qui respecte le même format que l'API OpenAI, pour permettre de changer de modèle/fournisseur juste en changeant l'URL et la clé, sans réécrire le code.
- **Endpoint MCP** : un serveur MCP expose lui aussi un endpoint — en local via **stdio** (un simple process lancé sur ta machine, ex. Context7), ou à distance en **HTTP/SSE** — auquel le harness se connecte pour appeler ses outils.
- **Streaming vs non-streaming** : un endpoint peut renvoyer la réponse complète d'un coup, ou la **streamer** token par token au fur et à mesure de la génération.

Un endpoint est généralement protégé par une **authentification** (clé API, token), soumis à des **rate limits** (nombre de requêtes/tokens max par minute), et a sa propre latence — des critères qui comptent dans le choix d'un fournisseur ou d'un déploiement.

### Exemple concret : exposer une app métier comme endpoint MCP

Un cas très courant en dev : rendre une application interne interrogeable par un agent IA, en l'exposant comme **serveur MCP distant (HTTP)** plutôt qu'en local.

Concrètement : l'app définit une route (ex. `/api/mcp`), génère un **token propre à chaque utilisateur** (authentification), et l'URL complète devient l'endpoint à donner à l'agent :

```
https://mon-app.exemple.com/api/mcp?token=<token-utilisateur>
```

Côté Claude Desktop (ou Claude Code), on ajoute ensuite cet endpoint comme **MCP personnalisé** — via l'UI de Claude Desktop, ou en CLI avec `claude mcp add --transport http mon-app https://mon-app.exemple.com/api/mcp?token=...`. Dès lors, l'agent peut appeler les outils exposés par cette app, **authentifié en tant que cet utilisateur précis** — exactement le même principe qu'un endpoint MCP local (Context7, Obsidian skills), sauf qu'il tourne sur ton propre serveur, à distance, avec une authentification par token plutôt qu'une clé API globale partagée.

> Le token dans l'URL joue le même rôle qu'une clé API : il identifie et authentifie l'appelant. Comme il apparaît en clair dans l'URL, il faut le traiter comme un secret (ne pas le committer, le régénérer s'il est exposé) — au même titre qu'une clé API classique.

---

## 4. Les modèles : familles, tailles, comment choisir

### Propriétaire vs open-weights

- **Modèles propriétaires** : accessibles uniquement via API du fournisseur (Claude/Anthropic, GPT/OpenAI, Gemini/Google, Grok/xAI). Pas de poids téléchargeables.
- **Modèles open-weights** : les poids sont publiés et téléchargeables (Llama/Meta, Mistral, DeepSeek, Qwen/Alibaba). Exécutables en local ou chez n'importe quel hébergeur — utile pour la confidentialité, la souveraineté des données, ou le coût à très grande échelle.

### Fine-tunes communautaires — l'exemple Nous Hermes

Un modèle open-weights publié par son créateur (le "modèle de base") peut être **re-fine-tuné par un tiers** sur des données ciblées, pour produire une variante spécialisée — publiée elle aussi en open-weights, sous un nouveau nom. C'est un fine-tuning fait par la communauté, pas par le fournisseur d'origine.

- **Nous Hermes** (Nous Research) est l'exemple le plus connu : une famille de fine-tunes construits par-dessus des modèles de base (Llama, Mistral, Qwen selon la version), réputée pour son bon comportement en **tool use / function calling** et en tâches agentiques — d'où la confusion fréquente avec un "agent" ou un harness : **Hermes reste un modèle**, pas un outil d'orchestration. C'est le harness (Claude Code, OpenCode...) qui l'utiliserait comme moteur si on voulait le faire tourner dans un contexte agentique.
- Autres fine-tunes communautaires connus : Dolphin, OpenHermes, WizardLM — chacun optimisé pour un usage particulier (moins de refus, meilleur suivi d'instructions, function calling, etc.).
- Pour choisir entre un modèle de base et un de ses fine-tunes : le fine-tune apporte un comportement plus ciblé sur son cas d'usage (souvent mieux pour l'agentique/tool use), mais peut perdre en performance générale par rapport au modèle de base sur d'autres tâches — à tester sur le besoin réel, pas sur la réputation seule.

### Frontier vs petits modèles

Chaque fournisseur propose en général plusieurs tailles de modèles, avec un arbitrage capacité/vitesse/coût :

- **Frontier / haut de gamme** (ex. Opus côté Claude) : le plus capable, pour du raisonnement complexe, de l'architecture, des tâches ambiguës.
- **Milieu de gamme** (ex. Sonnet côté Claude) : le meilleur rapport capacité/coût pour l'usage quotidien — c'est le modèle par défaut de la plupart des workflows dev.
- **Petit/rapide** (ex. Haiku côté Claude) : très rapide et peu coûteux, pour des tâches simples, répétitives, ou à fort volume (classification, extraction, résumé court).

### Comment choisir un modèle pour une tâche donnée

| Critère | Implication |
| --- | --- |
| Complexité du raisonnement | Tâche ambiguë/architecturale → modèle haut de gamme (voire mode "raisonnement étendu") ; tâche mécanique → petit modèle suffit |
| Volume / budget | Beaucoup d'appels répétitifs → petit modèle, moins cher au token |
| Latence requise | Réponse quasi-instantanée nécessaire → petit modèle |
| Taille de contexte nécessaire | Vérifier la fenêtre de contexte max du modèle vs volume de code/docs à fournir |
| Confidentialité / souveraineté | Données sensibles → modèle open-weight en local plutôt qu'API cloud |
| Multimodalité | Besoin d'images/audio/vidéo → vérifier que le modèle les supporte nativement |

### Le "raisonnement étendu" (extended thinking / reasoning models)

Certains modèles (ou certains modes de modèles existants) peuvent "réfléchir" plus longtemps avant de répondre — générer une chaîne de raisonnement interne, explorer plusieurs pistes, avant de produire la réponse finale. Ça améliore nettement les résultats sur les tâches complexes (maths, debug difficile, architecture), au prix d'une latence et d'un coût plus élevés. À réserver aux tâches qui le justifient, pas en usage systématique.

---

## 5. Prompting et context engineering

### Prompt engineering

L'art de formuler une requête pour obtenir le résultat voulu : instructions claires et non ambiguës, contraintes explicites, format de sortie attendu, exemples si utile. Ce n'est pas de la magie, c'est de la communication précise — la plupart des mauvaises réponses viennent d'un prompt sous-spécifié, pas d'une limite du modèle.

### System prompt

Les instructions **persistantes** qui cadrent le comportement du modèle sur toute une session, indépendamment de ce que l'utilisateur demande ensuite. Dans ce repo : `AGENTS.md` joue ce rôle (conventions de code, stack, règles de commit) — chargé une fois, appliqué à toute la session.

### Zero-shot, few-shot, chain-of-thought

- **Zero-shot** : demander directement, sans exemple.
- **Few-shot** : donner un ou plusieurs exemples du résultat attendu dans le prompt, pour cadrer le format/style.
- **Chain-of-thought** : demander au modèle de "réfléchir à voix haute" étape par étape avant de conclure — améliore la fiabilité sur les tâches à plusieurs étapes logiques.

### Context engineering

Une discipline de plus en plus centrale avec les agents autonomes : **gérer activement ce qu'on met dans la fenêtre de contexte**, plutôt que d'y déverser tout ce qui est disponible. Concrètement :

- Ne charger que les fichiers pertinents pour la tâche en cours, pas tout le repo.
- Résumer/compacter l'historique de conversation quand il devient trop long (Claude Code le fait automatiquement en approchant la limite).
- Séparer la mémoire long-terme (voir section 6) du contexte de la tâche en cours, pour ne pas polluer chaque requête avec tout l'historique.
- Utiliser des subagents pour isoler des recherches volumineuses (ex. explorer un gros repo) sans polluer le contexte principal avec les résultats intermédiaires.

Un contexte mal géré (trop long, mal trié) dégrade la qualité des réponses et fait grimper le coût — c'est souvent plus déterminant pour la qualité du résultat que le choix du modèle lui-même.

---

## 6. RAG, embeddings et mémoire

### Embeddings

Un **embedding** est une représentation numérique (un vecteur) du sens d'un texte — deux textes proches en signification ont des vecteurs proches dans cet espace. C'est la brique de base de la recherche sémantique : au lieu de chercher des mots-clés exacts, on cherche des contenus "proches en sens".

### RAG (Retrieval-Augmented Generation)

Plutôt que de tout mettre dans le prompt (impossible à grande échelle) ou de fine-tuner un modèle (coûteux), le **RAG** va chercher dynamiquement l'information pertinente dans une base externe (souvent une **base vectorielle** — Pinecone, Weaviate, pgvector, Chroma) au moment de la requête, et l'injecte dans le contexte avant de générer la réponse. C'est la technique derrière la plupart des "chat avec vos documents" et des assistants de doc technique.

### Fine-tuning vs prompting vs RAG — quand utiliser quoi

| Besoin | Solution la plus adaptée |
| --- | --- |
| Changer le comportement/style ponctuellement | Prompting / system prompt |
| Donner accès à des infos à jour ou volumineuses | RAG |
| Changer durablement le "style" ou les réflexes du modèle sur un domaine très spécifique | Fine-tuning (rare en usage dev courant) |

Dans l'immense majorité des cas côté dev, prompting + contexte bien géré + RAG couvrent le besoin — le fine-tuning reste l'exception.

### Mémoire d'agent

Un système de **mémoire persistante** permet à un agent de se souvenir d'une session à l'autre : préférences de l'utilisateur, contexte projet, retours d'expérience — sans avoir à tout réexpliquer à chaque conversation. C'est distinct du contexte d'une session (qui disparaît à la fin) : la mémoire est relue et écrite explicitement, en dehors de la fenêtre de contexte "vive".

---

## 7. Panorama des outils

| Catégorie | Outils |
| --- | --- |
| **Modèles / plateformes** | Claude (Anthropic), GPT (OpenAI), Gemini (Google), Grok (xAI), Llama (Meta), Mistral, DeepSeek, Qwen (Alibaba) |
| **Fine-tunes communautaires** | Nous Hermes (Nous Research), Dolphin, OpenHermes, WizardLM |
| **Harness CLI agentique** | Claude Code, OpenCode, Codex CLI, Gemini CLI, Aider |
| **IDE avec agent intégré** | Cursor, Windsurf, GitHub Copilot (mode agent), Zed |
| **Agents autonomes cloud** | Devin, Claude Code (mode cloud/remote), Jules (Google) |
| **Protocoles / standards** | MCP (Model Context Protocol), function calling / tool use |
| **Orchestration multi-agents** | LangChain, LlamaIndex, CrewAI, AutoGen |
| **Bases vectorielles (RAG)** | Pinecone, Weaviate, Chroma, pgvector |
| **Exécution locale** | Ollama, LM Studio |
| **Observabilité / évaluation** | LangSmith, Langfuse, evals maison |

---

## 8. Glossaire condensé

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
| **RLHF** | Reinforcement Learning from Human Feedback — technique de post-training qui aligne le modèle sur les préférences humaines |
| **Hallucination** | Réponse générée avec assurance mais factuellement fausse |
| **Temperature / top-p** | Paramètres qui contrôlent le degré d'aléatoire/créativité de la génération |
| **Harness** | Logiciel qui entoure un LLM pour lui donner des outils, une mémoire et une boucle d'exécution |
| **Agent** | Système qui exécute une tâche de façon autonome via une boucle observer/agir |
| **Tool use / function calling** | Capacité du modèle à appeler un outil avec des arguments structurés |
| **MCP** | Standard ouvert pour connecter un LLM à des outils/données externes de façon uniforme |
| **Endpoint** | URL précise à laquelle on envoie une requête pour parler à un service (API modèle, serveur MCP, déploiement local...) |
| **Rate limit** | Nombre maximum de requêtes/tokens qu'un endpoint accepte par unité de temps |
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
