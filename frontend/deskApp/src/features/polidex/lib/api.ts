import { Politician } from "@/features/polidex/data/politicians";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

export type SearchResult = { id: string; score: number };
export type RankedPolitician = { politician: Politician; sim: number };
export type BackendPolitician = { id: string; name: string; party: string; state: string; office: string; vector: number[] };

export async function searchPoliticians(
  vector: number[],
  weights: number[],
  useAdherence: boolean,
  seenIds: string[],
): Promise<SearchResult[]> {
  const res = await fetch(`${BACKEND_URL}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_vector: vector,
      weights,
      use_adherence: useAdherence,
      seen_ids: seenIds,
    }),
  });

  if (!res.ok) {
    throw new Error(`/api/search responded ${res.status}`);
  }

  const data = await res.json();
  return data.results as SearchResult[];
}

export async function fetchPoliticians(): Promise<BackendPolitician[]> {
  const res = await fetch(`${BACKEND_URL}/api/politicians`);
  if (!res.ok) throw new Error(`/api/politicians responded ${res.status}`);
  const data = await res.json();
  return data.politicians as BackendPolitician[];
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
