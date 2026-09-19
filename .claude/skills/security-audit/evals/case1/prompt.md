---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Utilise le skill `security-audit` sur la route suivante :

```ts
router.get("/reports/:id", async (req, res) => {
  const query = `SELECT * FROM reports WHERE id = ${req.params.id}`;
  const result = await pool.query(query);
  res.json(result.rows[0]);
});

router.post("/reports", async (req, res) => {
  const { title, body } = req.body;
  await pool.query("INSERT INTO reports (title, body) VALUES ($1, $2)", [title, body]);
  res.json({ ok: true });
});
```
