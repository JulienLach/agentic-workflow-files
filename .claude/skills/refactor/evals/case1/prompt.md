---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Utilise le skill `refactor` sur le code suivant :

```ts
function calc(a: number, b: number, type: string) {
  if (type === "add") { return a + b }
  if (type === "sub") { return a - b }
  if (type === "mul") { return a * b }
  if (type === "div") { return a / b }
}

function calcTax(a: number, b: number, type: string) {
  if (type === "add") { return (a + b) * 1.2 }
  if (type === "sub") { return (a - b) * 1.2 }
}
```
