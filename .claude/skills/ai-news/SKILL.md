---
name: ai-news
description: Veille IA quotidienne orientée dev, expliquée et sans bruit - IA locale et inférence (gros modèles sur petit matériel), harness et agents de code, modèles frontier/API, sécurité des outils LLM. Utiliser quand l'utilisateur demande les news IA, la veille du jour ou lance /ai-news [heures].
---

# /ai-news - veille IA dev, sans bruit

Objectif : **lisible en 3 minutes (environ 2 écrans)**. Le cœur du briefing, ce sont les items qui changent ce qu'un dev peut lancer, utiliser ou doit patcher, chacun **expliqué** : quoi, chiffres, pourquoi ça compte. Couper le bruit, pas le contexte.

Fenêtre : `$ARGUMENTS` en heures si fourni (ex. `/ai-news 168` pour une semaine), sinon 48 h. Date du jour : celle du contexte système, jamais improvisée.

## Périmètre (4 thèmes, rien d'autre)

1. **LOCAL** (prioritaire) : nouveaux modèles open-weight utilisables, et surtout les **techniques qui font tourner plus gros sur moins de matériel** (streaming SSD des experts, offload, nouvelles quantizations, speculative decoding, runtimes llama.cpp / MLX / Ollama / vLLM). Exemple type à ne jamais rater : "un modèle de 125B sur une RTX de 12 Go".
2. **AGENTS** : releases de harness (Claude Code, Codex CLI, opencode, OpenHands, aider), nouveaux outils/serveurs MCP qui ont de la traction, workflows agentiques **avec des résultats chiffrés**.
3. **MODÈLES** : sorties frontier disponibles via API, avec prix ($/M tokens) et un benchmark indépendant (Artificial Analysis, LLM Stats, SWE-bench, Terminal-Bench).
4. **SÉCU** : CVE/GHSA sur des outils LLM (gateways, MCP, CLI, extensions d'IDE), supply chain (modèles ou paquets piégés), prompt injection exploitée sur des agents.

**Hors périmètre** : levées de fonds, IPO, drama de dirigeants, politique et régulation, robotique. Ces sujets ne sont pas dans le cœur du briefing, mais les 3 à 5 plus gros de la fenêtre vont dans la section `AILLEURS`, à raison d'une phrase de contexte chacun, pour rester informé. Toujours exclus : sondages, tribunes, "X affirme que".

## Collecte (tout en parallèle, en un seul tour)

1. Script de signal : `node ~/.claude/skills/ai-news/collect.ts <heures>` (Node >= 23.6 exécute le TypeScript nativement). Il remonte les stories Hacker News filtrées par points et par mots-clés de titre, plus les releases GitHub stables des outils suivis. Le score HN est le meilleur filtre anti-bruit dont on dispose : un item à plus de 100 points dans le périmètre mérite presque toujours sa place.
2. WebSearch en mode `standard` (passer en `extended` seulement si un thème revient vide). Remplacer `[date]` par "jour mois année" en anglais :
   - `site:reddit.com/r/LocalLLaMA [mois année]`
   - `run large model consumer GPU VRAM offload OR quantization OR SSD [mois année]`
   - `new open-weight model Hugging Face release [date]`
   - `coding agent CLI release OR update [date]`
   - `new LLM API release pricing benchmark [date]`
   - `CVE OR GHSA LLM OR MCP OR "AI agent" vulnerability [date]`
3. Un seul agent `web-fetch` (si l'outil WebFetch n'est pas disponible directement), effort `lower`, sur https://llm-stats.com/llm-updates et https://theopenweights.com/. Lui demander uniquement les items datés dans la fenêtre, avec date, paramètres, licence et prix.
4. Pour chaque release d'outil remontée par le script : `gh release view <tag> -R <repo>`, puis ne garder que la ou les 1-2 nouveautés qui comptent.

Reddit renvoie une erreur 403 en curl : passer par WebSearch. BuildFastWithAI et les digests généralistes (The Neuron, Techmeme) ne sont plus des sources : trop de bruit.

## Filtre (chaque item doit passer les 4 critères)

1. **Dans le périmètre** ci-dessus.
2. **Daté dans la fenêtre**, vérifié sur la source (URL datée, byline, date de la release). Sans date confirmée, l'item est rejeté.
3. **Actionnable** : on peut le lancer, l'installer, l'appeler, ou on doit patcher. Une annonce sans disponibilité est rejetée.
4. **Source primaire ou chiffre vérifiable** (blog officiel, repo, model card, advisory). Un agrégateur seul donne `[~]` au mieux, avec un maximum d'un item `[~]` par briefing.

Classer ensuite par impact pour un dev, puis par score HN. Garder au maximum 12 items dans les sections du cœur, avec 4 par section au plus.

Les items J-2 à J-5 qui passent le filtre, mais qu'une fenêtre de 48 h exclut, vont dans `CETTE SEMAINE` (3 à 5 lignes datées). Ne jamais inclure d'item de plus de 5 jours, sauf comme rappel daté d'une section vide (voir le format).

## Format de sortie (exact)

Texte brut dans un bloc de code, pas d'emoji, pas de tableau, pas de liste de sources en fin (les liens sont en ligne). Français avec accents, termes techniques en anglais. Expliquer entre parenthèses, à la première occurrence, tout terme non évident (ex. "patch diffing (comparer un correctif à l'ancienne version pour retrouver la faille)").

```
IA dev - [JJ mois AAAA] ([fenêtre] h)

EN BREF
[2-3 phrases : les 2-3 choses à retenir aujourd'hui et pourquoi.]

LOCAL
- [Nom] ([acteur], [date]) -> [url]
  [2-3 phrases : ce que c'est, chiffres clés (params totaux/actifs, VRAM,
  tok/s, licence), en quoi ça change ce qu'on peut faire tourner.]
  à tester : [commande ou condition matérielle, si utile]

AGENTS
- [Nom] ([acteur], [date]) -> [url]
  [2-3 phrases : ce que ça fait, ce qui le distingue, traction (stars, pts HN).]

MODÈLES
- [Nom] ([éditeur], [date]) -> [url]
  [2-3 phrases : archi, contexte, prix in/out $/M, benchmark indépendant et
  comparaison avec le meilleur modèle actuel, disponibilité (API, poids).]

SÉCU
- [!] [CVE/GHSA] [outil] ([source], [date]) -> [url]
  [2-3 phrases : vecteur d'attaque, qui est exposé, exploité ou non.]
  à faire : [version corrigée ou mitigation concrète]

CETTE SEMAINE
- [date] - [acteur] - [1 phrase, dans le périmètre]

AILLEURS
- [sujet] ([date]) : [1 phrase de contexte factuelle] -> [url]

TIP DU JOUR
[1 commande ou astuce concrète, liée si possible à un item ci-dessus]
```

- Un item du cœur = une ligne de titre avec le lien, plus 2 à 3 phrases de contexte, plus une ligne `à tester :` / `à faire :` optionnelle.
- Une section du cœur vide : une ligne `Rien de daté dans la fenêtre.`, suivie si possible du dernier item notable avec sa date en rappel (ex. `Rappel : [nom] ([date]) - [1 phrase]`).
- Marqueurs : `[!]` à patcher ou à surveiller, `[~]` non confirmé par une source primaire (préciser la crédibilité).
- Pas de conclusion ni d'"intensité du jour".
