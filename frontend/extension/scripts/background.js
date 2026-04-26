/*
 * Service worker. Orchestration only.
 * Receives selected text from content.js, queries politician DB for name match,
 * delegates similarity computation to cosine_bridge.js, returns result to popup.
 * No math, no rendering, no direct storage access.
 */

import { getUserVector, setUserVector } from "./user_vector_store.js";
import { computeMatch } from "./cosine_bridge.js";

const BACKEND_URL = "http://localhost:8080";

// Seed a neutral midpoint vector so the extension works before the user completes the quiz.
chrome.runtime.onInstalled.addListener(() => {
  getUserVector().then(v => {
    if (!v) setUserVector([3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]);
  });
});

async function findPolitician(text) {
  const res = await fetch(`${BACKEND_URL}/api/lookup?name=${encodeURIComponent(text)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.match ?? null;
  // expected shape: { name: string, vector: float[20], policies: string[2] } or null
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "NAME_LOOKUP") return;

  (async () => {
    const tabId = sender.tab?.id;

    const match = await findPolitician(msg.text);
    if (!match) return;

    const userVector = await getUserVector();
    if (!userVector) {
      // Signal that the user needs to set their vector first.
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

    // Badge signals a match is ready — user clicks the extension icon to view.
    if (tabId != null) chrome.action.setBadgeText({ text: "!", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#7ee8a2" });
  })();
});
