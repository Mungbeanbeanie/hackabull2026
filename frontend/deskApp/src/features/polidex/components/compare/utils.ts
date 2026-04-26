import { Politician } from "@/features/polidex/data/politicians";

export function averageDrift(politician: Politician): number {
  const diffs = politician.vector_stated.map((value, index) => Math.abs(value - politician.vector_actual[index]));
  const total = diffs.reduce((sum, value) => sum + value, 0);
  return total / diffs.length;
}

export function resolveProfileSide(clientX: number): "left" | "right" {
  if (globalThis.window === undefined) return "right";
  if (globalThis.window.innerWidth < 900) return "right";
  return clientX < globalThis.window.innerWidth / 2 ? "right" : "left";
}
