/*
 * Cosine similarity math only.
 * Accepts user_vector and poli_vector (both 20-element float arrays).
 * Returns % match score and per-dimension alignment breakdown.
 * No storage access, no rendering, no DB calls.
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
  let dot = 0, userMag = 0, poliMag = 0;
  const deltas = [];

  for (let i = 0; i < 20; i++) {
    dot += userVector[i] * poliVector[i];
    userMag += userVector[i] ** 2;
    poliMag += poliVector[i] ** 2;
    deltas.push({ name: PLANK_NAMES[i], delta: Math.abs(userVector[i] - poliVector[i]) });
  }

  const score = parseFloat(((dot / (Math.sqrt(userMag) * Math.sqrt(poliMag))) * 100).toFixed(1));

  deltas.sort((a, b) => a.delta - b.delta);
  const topAligned = deltas.slice(0, 3).map(d => d.name);
  const topMisaligned = deltas.slice(-3).reverse().map(d => d.name);

  return { score, topAligned, topMisaligned };
}
