import { Politician } from "@/features/polidex/data/politicians";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

function weightedCosine(u: number[], v: number[], w: number[]): number {
  let num = 0, du = 0, dv = 0;
  for (let i = 0; i < 20; i++) {
    num += w[i] * u[i] * v[i];
    du += w[i] * u[i] * u[i];
    dv += w[i] * v[i] * v[i];
  }
  if (du === 0 || dv === 0) return 0;
  return Math.min(1, Math.max(-1, num / (Math.sqrt(du) * Math.sqrt(dv))));
}

export function localSearch(
  politicians: Politician[],
  vector: number[],
  weights: number[],
  useAdherence: boolean,
): SearchResult[] {
  return politicians
    .map((p) => ({
      id: p.id,
      score: weightedCosine(vector, useAdherence ? p.vector_actual : p.vector_stated, weights),
    }))
    .sort((a, b) => b.score - a.score);
}

export type SearchResult = { id: string; score: number };

// Floats politicians from the user's state to top within a 5% similarity band
export function regionSort(results: SearchResult[], state: string, politicians: Politician[]): SearchResult[] {
  if (results.length === 0) return results;
  const top = results[0].score;
  const threshold = top * 0.95;
  const inBand = results.filter(r => r.score >= threshold);
  const outOfBand = results.filter(r => r.score < threshold);
  inBand.sort((a, b) => {
    const pa = politicians.find(p => p.id === a.id);
    const pb = politicians.find(p => p.id === b.id);
    const aLocal = pa?.state === state;
    const bLocal = pb?.state === state;
    if (aLocal !== bLocal) return aLocal ? -1 : 1;
    return b.score - a.score;
  });
  return [...inBand, ...outOfBand];
}
export type RankedPolitician = { politician: Politician; sim: number };
export type BackendPolitician = { id: string; name: string; party: string; state: string; office: string; vector: number[]; imageUrl?: string };
export type SimulationTopic = { id: string; label: string; alleles: string[] };
export type SimulationParticipant = {
  id: string;
  name: string;
  party: string;
  district: string;
  role: string;
  vector_stated: number[];
  vector_actual: number[];
};
export type SimulationTranscriptTurn = { speakerId: string; text: string; triggeredAlleles: string[] };

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

export async function fetchCandidatesForElection(candidateIds: string[]): Promise<BackendPolitician[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/search/catalog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateIds }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.candidates as BackendPolitician[];
  } catch {
    return [];
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function generateSimulationTranscript(input: {
  participants: SimulationParticipant[];
  topic: SimulationTopic;
  mode: "theoretical" | "functional";
  userProfile?: { vector: number[]; weights: number[]; state?: string };
}): Promise<{ turns: SimulationTranscriptTurn[] }> {
  const res = await fetch(`${BACKEND_URL}/api/simulation/transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`/api/simulation/transcript responded ${res.status}`);
  }
  return (await res.json()) as { turns: SimulationTranscriptTurn[] };
}

export async function synthesizeTranscriptAudio(text: string, voiceName: string): Promise<{ audioBase64: string; mimeType: string }> {
  const res = await fetch(`${BACKEND_URL}/api/simulation/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceName }),
  });
  if (!res.ok) {
    throw new Error(`/api/simulation/tts responded ${res.status}`);
  }
  return (await res.json()) as { audioBase64: string; mimeType: string };
}
