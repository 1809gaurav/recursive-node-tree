import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { buildTree, collectIds } from "./tree";
import type { NodeRow, TreeNodeData } from "./types";
import TreeNode from "./components/TreeNode";
import AddNodeForm from "./components/AddNodeForm";
  import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const [rows, setRows] = useState<NodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await api.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the tree.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tree = useMemo(() => buildTree(rows), [rows]);

  async function addNode(name: string, parentId: number | null) {
    setError(null);
    try {
      const created = await api.create(name, parentId);
      setRows((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the node.");
      throw err; // lets the form keep the typed text
    }
  }

  async function deleteNode(node: TreeNodeData) {
    setError(null);
    try {
      await api.remove(node.id);
      const gone = new Set(collectIds(node)); // node + all descendants
      setRows((prev) => prev.filter((r) => !gone.has(r.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the node.");
    }
  }

  return (
    <main className="page">
        <header className="header">
    <div className="header-top">
      <h1>Node tree</h1>
      <ThemeToggle />
    </div>
    <p>Add nodes, nest them as deep as you like, and expand or collapse any branch.</p>
  </header>

      <section className="panel" aria-busy={loading}>
        <AddNodeForm
          placeholder="Name a new root node"
          buttonLabel="Add root"
          onAdd={(name) => addNode(name, null)}
        />

        {error && (
          <div className="error" role="alert">
            <span>{error}</span>
            <button onClick={load}>Reload</button>
          </div>
        )}

        {loading ? (
          <p className="status">Loading your tree…</p>
        ) : tree.length === 0 && !error ? (
          <p className="status">No nodes yet. Add a root node to get started.</p>
        ) : (
          <ul className="tree">
            {tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                onAdd={(name, parentId) => addNode(name, parentId)}
                onDelete={deleteNode}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}