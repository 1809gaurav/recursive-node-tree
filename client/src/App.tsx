import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { buildTree, collectIds } from "./tree";
import type { NodeRow, TreeNodeData } from "./types";
import TreeNode from "./components/TreeNode";
import AddNodeForm from "./components/AddNodeForm";
import ThemeToggle from "./components/ThemeToggle";
import LayoutToggle, { type Layout } from "./components/LayoutToggle";

// Saved choice first, otherwise horizontal.
function getInitialLayout(): Layout {
  try {
    const saved = localStorage.getItem("layout");
    if (saved === "horizontal" || saved === "vertical") return saved;
  } catch {
    /* storage can be blocked; fall through */
  }
  return "horizontal";
}

export default function App() {
  const [layout, setLayout] = useState<Layout>(getInitialLayout);
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
    let active = true;
    api.list()
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load the tree.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("layout", layout);
    } catch {
      /* ignore */
    }
  }, [layout]);

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
      <div className="header-actions">
        <LayoutToggle layout={layout} onChange={setLayout} />
        <ThemeToggle />
      </div>
    </div>
    <p>Add nodes, nest them as deep as you like, and expand or collapse any branch.</p>
  </header>

      <div className="toolbar">
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
      </div>

      <section className={`panel layout-${layout}`} aria-busy={loading}>
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