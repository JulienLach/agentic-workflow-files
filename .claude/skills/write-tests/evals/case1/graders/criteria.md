---
type: llm
weight: 1
---

Une bonne réponse :
- Utilise Vitest (`describe`/`it`/`expect`, import depuis `vitest`).
- Couvre le cas nominal (remise appliquée correctement), les cas limites (0%, 100%) et les cas d'erreur (discountPercent négatif ou > 100, doit lever une erreur via `expect(...).toThrow(...)`).
- Structure claire (describe imbriqués, Arrange/Act/Assert ou équivalent).
- Explique brièvement pourquoi chaque test est important (ton pédagogique), et indique un fichier de destination plausible (ex: `calculateDiscount.test.ts`).

Une mauvaise réponse : ne teste pas le cas d'erreur (valeurs hors bornes), n'utilise pas Vitest, ou ne couvre que le chemin heureux sans cas limite.
