/**
 * Vector math utilities for politician similarity calculations
 */

/**
 * Compute weighted cosine similarity between two 20D vectors
 * Weights emphasize dimensions where the politician reliably holds their position
 */
export function cosine(userVector: number[], politicianVector: number[], weights?: number[]): number {
  if (userVector.length === 0 || politicianVector.length === 0) return 0;
  
  const w = weights || Array(userVector.length).fill(1);
  
  let dotProduct = 0;
  let userMagnitude = 0;
  let policyMagnitude = 0;
  
  for (let i = 0; i < userVector.length; i++) {
    const u = userVector[i];
    const p = politicianVector[i];
    const weight = w[i] || 1;
    
    dotProduct += u * p * weight;
    userMagnitude += u * u * weight;
    policyMagnitude += p * p * weight;
  }
  
  const magnitude = Math.sqrt(userMagnitude * policyMagnitude);
  if (magnitude === 0) return 0;
  
  return dotProduct / magnitude;
}

/**
 * Normalize similarity score to 0-100 percentage
 */
export function similarityToPercent(similarity: number): number {
  return Math.max(0, Math.min(100, Math.round((similarity + 1) / 2 * 100)));
}
