# Atelier - tester un nouveau modèle open-weight en 10 minutes

Nouveau modèle open-weight qui sort (Cohere, Moonshot/Kimi, Qwen, DeepSeek...) ? Ce guide donne une méthode rapide pour le tester : via un fournisseur cloud si pas de GPU sous la main (OpenRouter), ou en local si tu as un GPU correct (Ollama) - dans les deux cas avec le même harnais agentique, OpenCode.

> **Document vivant.** Les tags Ollama ci-dessous ont été vérifiés le 5 novembre 2026. Les fournisseurs sortent de nouvelles versions en continu : pour OpenRouter, repartir de la liste à jour sur [openrouter.ai/models](https://openrouter.ai/models).

Complète [`CONCEPTS-IA.md`](./CONCEPTS-IA.md) (concept de "harnais") et [`WORKFLOW.md`](./WORKFLOW.md) (workflow Claude Code) pour un usage ponctuel : "un modèle sort, je le teste vite".

---

## Les deux briques

- **OpenRouter** (fournisseur) : une seule clé API, un seul point d'entrée, accès à des dizaines de modèles open-weight (et propriétaires) hébergés par des tiers. Facturation au token consommé, pas de GPU à gérer. Beaucoup de modèles ont aussi une variante **`:free`** (rate-limitée, pratique pour un premier test sans dépenser de crédits) - filtre "Free" sur [openrouter.ai/models](https://openrouter.ai/models).
- **OpenCode** (harnais) : CLI agentique open source, dans le même esprit que Claude Code (boucle agentique, tool use, lecture/édition de fichiers). Compatible avec n'importe quel fournisseur qui expose une API de type OpenAI/Anthropic - donc branchable directement sur OpenRouter.

Le repo a déjà un `.opencode/AGENTS.md` (backup du scope utilisateur `~/.config/opencode/`) - ce guide s'appuie sur cette même install.

---

## Setup (une seule fois)

1. **Compte OpenRouter** : créer un compte sur [openrouter.ai](https://openrouter.ai), aller dans *Credits* et créditer un petit montant (5-10$ suffisent largement pour tester plusieurs modèles).
2. **Clé API** : dans [openrouter.ai/keys](https://openrouter.ai/keys), *Create Key* - fixer une limite de crédit sur la clé elle-même (sécurité). La copier immédiatement, elle ne sera plus jamais affichée.
3. **Installer OpenCode** (si pas déjà fait) :
   ```bash
   curl -fsSL https://opencode.ai/install | bash
   # ou : npm install -g opencode-ai
   ```
4. **Connecter OpenRouter à OpenCode** - deux méthodes équivalentes :
   ```bash
   opencode auth login
   # choisir "openrouter" dans la liste, coller la clé API
   ```
   ou variable d'environnement :
   ```bash
   export OPENROUTER_API_KEY=sk-or-v1-...
   ```

---

## Boucle de test à chaque nouveau modèle

1. **Trouver le slug du modèle** sur [openrouter.ai/models](https://openrouter.ai/models) (format `organisation/modele`).

2. **Lancer OpenCode dessus**, en préfixant avec `openrouter/` :
   ```bash
   opencode run --model openrouter/<organisation>/<modele> "ton prompt de test"
   ```
   Ou en mode interactif : `opencode`, puis `/models` pour choisir le modèle dans la liste et switcher en cours de session sans tout reconfigurer.

3. **Toujours utiliser le même repo/prompt étalon** pour comparer les modèles entre eux de façon reproductible - idéalement une tâche déjà résolue dont on connaît la bonne réponse (un bug corrigé, un refacto fait) ou une codebase de test avec un `AGENTS.md` représentatif de tes conventions habituelles.

4. **Observer** :
   - qualité et pertinence du diff produit
   - respect des instructions du `AGENTS.md`/`CLAUDE.md` du repo de test
   - usage correct des tools (lecture/édition de fichiers, recherche)
   - coût affiché en fin de run (OpenCode l'affiche par requête)

---

## Modèles open-weight courants à tester

| Famille | Point fort | Où chercher le slug exact |
|---|---|---|
| Kimi (Moonshot AI) | Long-context, orchestration multi-agents | `moonshotai/` sur openrouter.ai/models |
| Command R+ (Cohere) | RAG, function calling | `cohere/` sur openrouter.ai/models |
| Qwen (Alibaba) | Bon rapport perf/prix, multilingue | `qwen/` sur openrouter.ai/models |
| DeepSeek | Raisonnement, code | `deepseek/` sur openrouter.ai/models |

Table volontairement sans version figée - toujours repartir de la liste à jour sur OpenRouter plutôt que de ce tableau.

---

## Variante avec un GPU local : Ollama

Si tu as un GPU avec assez de VRAM, **Ollama** remplace OpenRouter comme fournisseur - gratuit, illimité, privé (rien ne part vers un tiers). Le harnais (OpenCode) et la boucle de test (repo/prompt étalon) restent identiques, seul le provider change.

### Installer et lancer un modèle

```bash
curl -fsSL https://ollama.com/install.sh | sh   # macOS/Linux ; installeur dédié sous Windows

ollama pull qwen3.5:9b     # télécharge le modèle
ollama run qwen3.5:9b      # chat interactif rapide, pour un premier smoke test
```

### Combien de VRAM pour quelle taille de modèle

D'après les tailles affichées par Ollama, ordres de grandeur à confirmer sur ta machine :

| VRAM dispo | Taille de modèle confortable | Exemples |
|---|---|---|
| 8 Go | Environ 9B, tendu à 12B | `qwen3.5:9b` (7-8 Go), `gemma4:12b` (8 Go) |
| 12 Go | 9-12B confortable | `qwen3.5:9b`, `gemma4:12b` |
| 16-24 Go | 26-35B selon la VRAM | `gemma4:26b` (16-19 Go), `qwen3.6:27b` (18-19 Go), `qwen3.6:35b` (23 Go) |

Au-delà de la VRAM dispo, le modèle "swap" sur la RAM système et devient très lent - dans ce cas, redescendre d'un cran de taille plutôt que forcer.

### Brancher Ollama sur OpenCode

Le plus simple, une commande fournie par Ollama qui configure et lance OpenCode sur le modèle choisi :

```bash
ollama launch opencode
```

Sinon, config manuelle dans `~/.config/opencode/opencode.json` (utile pour fixer un modèle par défaut) :

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": { "baseURL": "http://localhost:11434/v1" },
      "models": { "qwen3.5:9b": {} }
    }
  }
}
```

**Attention contexte** : OpenCode a besoin d'un contexte d'au moins 64k tokens - certains modèles Ollama ont un `num_ctx` par défaut plus court (souvent 4-8k), à augmenter dans le Modelfile du modèle sinon OpenCode peut mal se comporter sur des tâches un peu longues.

---

## Astuces rapides

- Plafonner les crédits **par clé API** (pas juste sur le compte) pour éviter une mauvaise surprise si un run part en boucle.
- Comparer coût ET qualité - un modèle 3x moins cher qui fait la tâche correctement bat souvent le plus gros modèle.
- `opencode serve` + `opencode run --attach http://localhost:4096 "..."` pour enchaîner plusieurs tests sans repayer le cold-start à chaque run.
