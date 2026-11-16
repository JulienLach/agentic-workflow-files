---
name: ai-news
description: Veille IA quotidienne orientée dev, en un écran - IA locale et inférence (gros modèles sur petit matériel), harness et agents de code, modèles frontier/API, sécurité des outils LLM. Utiliser quand l'utilisateur demande les news IA, la veille du jour ou lance /ai-news [heures].
---

# /ai-news - veille IA dev, sans bruit

Objectif : **un écran, 8 items maximum**, uniquement ce qui change ce qu'un dev peut lancer, utiliser ou doit patcher. En cas de doute, couper.

Fenêtre : `$ARGUMENTS` en heures si fourni (ex. `/ai-news 168` pour une semaine), sinon 48 h. Date du jour : celle du contexte système, jamais improvisée.

## Périmètre (4 thèmes, rien d'autre)

1. **LOCAL** (prioritaire) : nouveaux modèles open-weight utilisables, et surtout les **techniques qui font tourner plus gros sur moins de matériel** (streaming SSD des experts, offload, nouvelles quantizations, speculative decoding, runtimes llama.cpp / MLX / Ollama / vLLM). Exemple type à ne jamais rater : "un modèle de 125B sur une RTX de 12 Go".
2. **AGENTS** : releases de harness (Claude Code, Codex CLI, opencode, OpenHands, aider), nouveaux outils/serveurs MCP qui ont de la traction, workflows agentiques **avec des résultats chiffrés**.
3. **MODÈLES** : sorties frontier disponibles via API, avec prix ($/M tokens) et un benchmark indépendant (Artificial Analysis, LLM Stats, SWE-bench, Terminal-Bench).
4. **SÉCU** : CVE/GHSA sur des outils LLM (gateways, MCP, CLI, extensions d'IDE), supply chain (modèles ou paquets piégés), prompt injection exploitée sur des agents.

**Hors périmètre** : levées de fonds, IPO, drama de dirigeants, politique et régulation, robotique, sondages, tribunes, "X affirme que". Au maximum une ligne `Ailleurs :` à la fin, avec 3 titres sans explication, seulement si c'est vraiment majeur.

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

Classer ensuite par impact pour un dev, puis par score HN. Couper à 8 items, avec au maximum 3 par section.

## Format de sortie (exact)

Texte brut, pas d'emoji, pas de tableau, pas de liste de sources en fin (les liens sont en ligne). Français avec accents, termes techniques en anglais. N'expliquer un sigle que s'il n'est pas courant pour un dev.

```
IA dev - [JJ mois AAAA] ([fenêtre] h)

LOCAL
- [Nom] ([acteur], [date]) : [ce qui change, avec le chiffre clé]. -> [url]
  à tester : [commande ou condition matérielle, seulement si utile]

AGENTS
- ...

MODÈLES
- ...

SÉCU
- [!] [CVE/GHSA] [outil] : [impact en 1 phrase]. Corrigé en [version]. -> [url]

Ailleurs : [titre 1] / [titre 2] / [titre 3]
```

- Un item = 1 ligne (environ 160 caractères maximum), plus une ligne `à tester :` / `à faire :` optionnelle.
- Une section vide est omise (pas de "rien ce jour"). Si tout est vide : `Journée calme sur le périmètre.` puis la ligne `Ailleurs`.
- Marqueurs : `[!]` à patcher ou à surveiller, `[~]` non confirmé par une source primaire.
- Pas d'introduction, pas de conclusion, pas d'"intensité du jour".
