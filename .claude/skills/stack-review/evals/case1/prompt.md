---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Utilise le skill `stack-review` sur le code suivant :

```ts
router.get("/invoices", async (req, res) => {
  const data = await pool.query("SELECT * FROM invoices");
  console.log(data.rows);
  let result = [];
  for (let i = 0; i < data.rows.length; i++) {
    if (data.rows[i].amount > 500) {
      result.push(data.rows[i]);
    }
  }
  res.json(result);
});
```
