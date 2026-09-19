---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Utilise le skill `roast` pour faire une revue sans complaisance du code TypeScript suivant :

```ts
function getData(id: string) {
  try {
    const res = fetchUserFromDb(id);
    return res;
  } catch (e) {
    return null;
  }
}

function get_user_profile(userId: number): any {
  const data = getData(userId.toString());
  return data;
}
```
