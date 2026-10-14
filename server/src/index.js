import express from "express";
import cors from "cors";
import { pool, initDb } from "./db.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") ?? true }));
app.use(express.json());

// GET /api/nodes -> flat list; the client nests it into a tree.
app.get("/api/nodes", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, parent_id AS "parentId" FROM nodes ORDER BY id`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/nodes { name, parentId } -> parentId null/omitted creates a root.
app.post("/api/nodes", async (req, res, next) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const parentId = req.body?.parentId ?? null;

    if (!name) return res.status(400).json({ error: "Name is required." });
    if (name.length > 200)
      return res.status(400).json({ error: "Name must be 200 characters or fewer." });
    if (parentId !== null && !Number.isInteger(parentId))
      return res.status(400).json({ error: "parentId must be an integer or null." });

    if (parentId !== null) {
      const parent = await pool.query("SELECT 1 FROM nodes WHERE id = $1", [parentId]);
      if (!parent.rowCount)
        return res.status(404).json({ error: "Parent node not found." });
    }

    const { rows } = await pool.query(
      `INSERT INTO nodes (name, parent_id) VALUES ($1, $2)
       RETURNING id, name, parent_id AS "parentId"`,
      [name, parentId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/nodes/:id -> removes the node and every descendant (ON DELETE CASCADE).
app.delete("/api/nodes/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id." });

    const result = await pool.query("DELETE FROM nodes WHERE id = $1", [id]);
    if (!result.rowCount) return res.status(404).json({ error: "Node not found." });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// Central error handler.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const port = process.env.PORT || 4000;

initDb()
  .then(() => app.listen(port, () => console.log(`API listening on :${port}`)))
  .catch((err) => {
    console.error("Failed to initialise the database:", err.message);
    process.exit(1);
  });
