/*
 * Cosine similarity — delegates to backend POST /api/match.
 * Accepts user_vector and poli_vector (both 20-element float arrays).
 * Returns % match score and per-dimension alignment breakdown.
 * No math, no storage access, no rendering.
 */

const BACKEND_URL = "http://localhost:8080";

export async function computeMatch(userVector, poliVector) {
  const res = await fetch(`${BACKEND_URL}/api/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_vector: userVector, poli_vector: poliVector }),
  });

  if (!res.ok) throw new Error(`/api/match responded ${res.status}`);
  return await res.json();
  // expected shape: { score: float, topAligned: string[], topMisaligned: string[] }
}
