/*
 * Cosine similarity — runs entirely in-extension, no backend call.
 * Accepts user_vector and poli_vector (both 20-element float arrays).
 * Returns % match score and per-dimension alignment breakdown.
 * No storage access, no rendering.
 */

const PLANK_NAMES = [
  "Market Autonomy", "Labor Alignment", "Economic Boundary", "Fiscal Metabolism",
  "Cultural Continuity", "Moral Source", "Corrective Logic", "Armament Access",
  "System Permeability", "Establishment Alignment", "Authority Distribution",
  "Interpretive Rigidity", "Branch Dominance", "Kinetic Projection",
  "Diplomatic Protocol", "Biological Maintenance", "Social Safety Net",
  "Ecological Priority", "Transit Topology", "Technological Oversight"
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

  const agreement = PLANK_NAMES.map((name, i) => ({
    name,
    val: userVector[i] * poliVector[i]
  }));
  agreement.sort((a, b) => b.val - a.val);

  return {
    score: Math.round(score * 100),
    topAligned:    agreement.slice(0, 3).map(d => d.name),
    topMisaligned: agreement.slice(-3).reverse().map(d => d.name)
  };
}
