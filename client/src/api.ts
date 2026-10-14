import type { NodeRow } from "./types";

const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  list: () => request<NodeRow[]>("/api/nodes"),
  create: (name: string, parentId: number | null) =>
    request<NodeRow>("/api/nodes", {
      method: "POST",
      body: JSON.stringify({ name, parentId }),
    }),
  remove: (id: number) => request<void>(`/api/nodes/${id}`, { method: "DELETE" }),
};