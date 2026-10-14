import { useState } from "react";
import type { TreeNodeData } from "../types";
import { countDescendants } from "../tree";
import AddNodeForm from "./AddNodeForm";

interface Props {
  node: TreeNodeData;
  onAdd: (name: string, parentId: number) => Promise<void>;
  onDelete: (node: TreeNodeData) => Promise<void>;
    depth?: number; // how deep this node is; picks the card colour
}

// Recursive component: each node renders its children as more <TreeNode>s.
  export default function TreeNode({ node, onAdd, onDelete, depth = 0 }: Props) {
  const [open, setOpen] = useState(false); // every node starts collapsed
  const childCount = node.children.length;

  async function handleAdd(name: string) {
    await onAdd(name, node.id);
    setOpen(true); // reveal the new child
  }

  async function handleDelete() {
    const total = countDescendants(node);
    const message =
      total > 0
        ? `Delete “${node.name}” and its ${total} nested ${total === 1 ? "node" : "nodes"}?`
        : `Delete “${node.name}”?`;
    if (window.confirm(message)) await onDelete(node);
  }

  return (
    <li className="node">
        <div className={`node-row depth-${depth % 5}`}>
        <button
          className="toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${node.name}`}
        >
          <span className={`chevron ${open ? "open" : ""}`} aria-hidden="true">▸</span>
        </button>
        <span className="node-name">{node.name}</span>
        {childCount > 0 && <span className="count">{childCount}</span>}
        <button
          className="delete"
          onClick={handleDelete}
          aria-label={`Delete ${node.name}`}
        >
          Delete
        </button>
      </div>

      {open && (
        <ul className="children">
          {node.children.map((child) => (
              <TreeNode
    key={child.id}
    node={child}
    onAdd={onAdd}
    onDelete={onDelete}
    depth={depth + 1}
  />
          ))}
          <li className="add-row">
            <AddNodeForm
              placeholder={`Add a child to ${node.name}`}
              buttonLabel="Add"
              onAdd={handleAdd}
            />
          </li>
        </ul>
      )}
    </li>
  );
}