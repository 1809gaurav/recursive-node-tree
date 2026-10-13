-- Adjacency list: each node stores its parent. Roots have parent_id = NULL.
-- ON DELETE CASCADE removes all descendants when a node is deleted.
CREATE TABLE IF NOT EXISTS nodes (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL CHECK (length(trim(name)) > 0),
  parent_id  INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON nodes(parent_id);