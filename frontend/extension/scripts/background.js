/*
 * Service worker. Orchestration only.
 * Receives selected text from content.js, queries local politician DB,
 * delegates similarity computation to cosine_bridge.js, returns result to popup.
 */

import { getUserVector, setUserVector } from "./user_vector_store.js";
import { computeMatch } from "./cosine_bridge.js";

const BACKEND_URL = "http://localhost:8080";
const STORAGE_KEY = "politician_db";

// Bundled 5-record stub (The "Hardcoded Baseline")
const STUB_DB = [
  { name: "John Doe", vector: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3], policies: ["Tax Reform", "Education"] },
  { name: "Jane Smith", vector: [1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5], policies: ["Green Energy", "Healthcare"] },
  { name: "Alex Rivera", vector: [5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1], policies: ["Infrastructure", "Defense"] },
  { name: "Sarah Chen", vector: [2,2,2,2,2,5,5,5,5,5,2,2,2,2,2,5,5,5,5,5], policies: ["Tech Regulation", "Privacy"] },
  { name: "Michael Brown", vector: [4,4,4,4,4,1,1,1,1,1,4,4,4,4,4,1,1,1,1,1], policies: ["Agriculture", "Trade"] }
];

async function refreshPoliticianCache() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/politicians`);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const data = await response.json();
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
    console.log("Politician cache updated from API.");
  } catch (error) {
    console.warn("API fetch failed. System using existing cache or will rely on stub.");
  }
}

/**
 * LOGIC REFACTOR: Read from storage first, fallback to stub.
 * This removes the per-lookup network request.
 */
async function findPolitician(text) {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const db = result[STORAGE_KEY] || STUB_DB; // Fallback to stub if storage is empty

  const normalizedText = text.trim().toLowerCase();
  
  // Find exact or partial name match within the local system
  const match = db.find(p => p.name.toLowerCase() === normalizedText);
  
  return match || null;
}

// Initialization
chrome.runtime.onInstalled.addListener(() => {
  getUserVector().then(v => {
    if (!v) setUserVector([3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]);
  });
  refreshPoliticianCache();
});

chrome.runtime.onStartup.addListener(() => {
  refreshPoliticianCache();
});

// Orchestration Listener
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "NAME_LOOKUP") return;

  (async () => {
    const tabId = sender.tab?.id;

    // Now searching local storage/stub instead of hitting /api/lookup
    const match = await findPolitician(msg.text);
    if (!match) return;

    const userVector = await getUserVector();
    if (!userVector) {
      if (tabId != null) chrome.action.setBadgeText({ text: "?", tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#888" });
      await chrome.storage.local.set({ last_match: null });
      return;
    }

    const result = await computeMatch(userVector, match.vector);

    await chrome.storage.local.set({
      last_match: {
        name: match.name,
        score: result.score,
        topAligned: result.topAligned,
        topMisaligned: result.topMisaligned,
        policies: match.policies
      }
    });

    if (tabId != null) chrome.action.setBadgeText({ text: "!", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#7ee8a2" });
  })();

  return true; // Keep channel open for async response if needed
});