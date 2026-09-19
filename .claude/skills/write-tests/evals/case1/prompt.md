---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Utilise le skill `write-tests` pour écrire des tests Vitest pour cette fonction de service :

```ts
export function calculateDiscount(price: number, discountPercent: number): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error("discountPercent must be between 0 and 100");
  }
  return price - (price * discountPercent) / 100;
}
```
