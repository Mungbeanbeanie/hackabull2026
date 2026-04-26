/*
 * Service worker. Orchestration only.
 * Receives selected text from content.js, queries politician DB for name match,
 * delegates similarity computation to cosine_bridge.js, returns result to popup.
 * No math, no rendering, no direct storage access.
 */

import { getUserVector } from "./user_vector_store.js";
import { computeMatch } from "./cosine_bridge.js";

// Hardcoded FL politician records for hackathon demo scope (20-50 target).
// Shape: { name, aliases, vector: float[20], policies: string[2] }
const POLITICIANS = [
  {
    name: "Marco Rubio",
    aliases: ["rubio"],
    vector: [4,2,4,3,4,2,4,3,3,4,3,2,4,3,3,4,2,3,4,3],
    policies: ["Co-sponsored Tax Cuts and Jobs Act", "CARES Act infrastructure aid"]
  },
  {
    name: "Rick Scott",
    aliases: ["scott"],
    vector: [4,2,4,2,4,2,4,2,3,4,3,2,4,3,3,4,2,3,4,3],
    policies: ["Florida Medicaid reform (2011)", "Everglades restoration funding"]
  },
  {
    name: "Ron DeSantis",
    aliases: ["desantis"],
    vector: [4,2,4,2,5,2,4,2,3,4,3,2,5,3,3,4,2,3,4,3],
    policies: ["Stop WOKE Act", "Florida Parental Rights in Education Act"]
  },
  {
    name: "Val Demings",
    aliases: ["demings"],
    vector: [2,4,2,4,2,4,2,4,3,2,3,4,2,3,3,2,4,3,2,3],
    policies: ["George Floyd Justice in Policing Act co-sponsor", "Affordable Care Act expansion support"]
  },
  {
    name: "Charlie Crist",
    aliases: ["crist"],
    vector: [2,4,2,4,2,4,2,4,3,2,3,4,2,3,3,2,4,3,2,3],
    policies: ["Florida minimum wage increase", "Hurricane Ian relief legislation"]
  }
];

function findPolitician(text) {
  const lower = text.toLowerCase();
  return POLITICIANS.find(p =>
    lower.includes(p.name.toLowerCase()) ||
    p.aliases.some(a => lower.includes(a))
  ) ?? null;
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "NAME_LOOKUP") return;

  (async () => {
    const match = findPolitician(msg.text);
    if (!match) return;

    const userVector = await getUserVector();
    if (!userVector) return;

    const result = computeMatch(userVector, match.vector);

    await chrome.storage.local.set({
      last_match: {
        name: match.name,
        score: result.score,
        topAligned: result.topAligned,
        topMisaligned: result.topMisaligned,
        policies: match.policies
      }
    });

    chrome.action.openPopup?.();
  })();
});
