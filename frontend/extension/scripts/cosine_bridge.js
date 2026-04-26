/*
 * Cosine similarity — runs entirely in-extension, no backend call.
 * Accepts user_vector and poli_vector (both 20-element float arrays).
 * Returns % match score, per-dimension alignment breakdown, and full dimensions array.
 * No storage access, no rendering.
 */

// Matches taxonomy.ts order (p1–p20). Short enough to fit a 280px popup.
const PLANK_NAMES = [
  "Market", "Fiscal", "Tax", "Energy",
  "Education", "Immigration", "Repro. Rights", "Guns",
  "Healthcare", "Climate", "Foreign Policy", "Defense",
  "Civil Lib.", "Voting", "Labor", "Housing",
  "Tech Reg.", "Crim. Justice", "Env. Reg.", "Cultural"
];

export function computeMatch(userVector, poliVector) {
  const weights = new Array(20).fill(1.0);

  let dot = 0, normU = 0, normV = 0;
  for (let i = 0; i < 20; i++) {
    dot   += weights[i] * userVector[i] * poliVector[i];
    normU += weights[i] * userVector[i] * userVector[i];
    normV += weights[i] * poliVector[i] * poliVector[i];
  }
  const score = (normU === 0 || normV === 0) ? 0 : dot / (Math.sqrt(normU) * Math.sqrt(normV));

  // Per-dimension agreement: 100% = identical position, 0% = maximum divergence (scale 1–5, max diff = 4)
  const dimensions = PLANK_NAMES.map((name, i) => {
    const diff = Math.abs(userVector[i] - poliVector[i]);
    return { name, agreement: Math.round((1 - diff / 4) * 100) };
  });

  const sorted = [...dimensions].sort((a, b) => b.agreement - a.agreement);

  return {
    score:         Math.round(score * 100),
    topAligned:    sorted.slice(0, 3).map(d => d.name),
    topMisaligned: sorted.slice(-3).reverse().map(d => d.name),
    dimensions,
  };
}
