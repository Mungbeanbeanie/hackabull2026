/*
 * Service worker. Orchestration only.
 * Receives selected text from content.js, queries politician DB for name match,
 * delegates similarity computation to cosine_bridge.js, returns result to popup.
 */

import { getUserVector, setUserVector } from "./user_vector_store.js";
import { computeMatch } from "./cosine_bridge.js";

const BACKEND_URL = "http://localhost:8080";
const STORAGE_KEY = "politician_db";

/**
 * Fetches the full politician list and caches it in local storage.
 */
async function refreshPoliticianCache() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/politicians`);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const data = await response.json();
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
    console.log("Politician cache updated.");
  } catch (error) {
    console.error("Cache refresh failed:", error);
  }
}

// Initial setup
chrome.runtime.onInstalled.addListener(() => {
  // 1. Seed the neutral vector
  getUserVector().then(v => {
    if (!v) setUserVector([3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]);
  });

  // 2. Initial cache populate
  refreshPoliticianCache();
});

// Refresh cache on browser startup
chrome.runtime.onStartup.addListener(() => {
  refreshPoliticianCache();
});

async function findPolitician(text) {
  // Logic Check: You are now storing the DB in storage, but this function 
  // still calls the API. If you want to use the CACHE instead of the API,
  // you would refactor this to search the 'politician_db' in chrome.storage.local.
  const res = await fetch(`${BACKEND_URL}/api/lookup?name=${encodeURIComponent(text)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.match ?? null;
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "NAME_LOOKUP") return;

  (async () => {
    const tabId = sender.tab?.id;

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
});