// A row as stored in the database / returned by the API.
export interface NodeRow {
  id: number;
  name: string;
  parentId: number | null;
}

// A row with its children attached, used for rendering.
export interface TreeNodeData extends NodeRow {
  children: TreeNodeData[];
}