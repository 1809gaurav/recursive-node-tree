import type { NodeRow, TreeNodeData } from "./types";

// Turns the flat list from the API into a nested tree in O(n).
export function buildTree(rows: NodeRow[]): TreeNodeData[] {
  const byId = new Map<number, TreeNodeData>();
  for (const row of rows) byId.set(row.id, { ...row, children: [] });

  const roots: TreeNodeData[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId === null ? undefined : byId.get(node.parentId);
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

// Counts every descendant of a node (used in the delete confirmation).
export function countDescendants(node: TreeNodeData): number {
  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

// Collects a node's id plus the ids of everything beneath it.
export function collectIds(node: TreeNodeData, ids: number[] = []): number[] {
  ids.push(node.id);
  node.children.forEach((child) => collectIds(child, ids));
  return ids;
}