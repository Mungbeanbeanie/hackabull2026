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
    const raw = Array.isArray(data) ? data : (data.politicians || []);
    const politicians = raw.map(p => ({
      ...p,
      vector: Array.from({ length: 20 }, (_, i) => p.vector[`d${i + 1}`])
    }));
    await chrome.storage.local.set({ [STORAGE_KEY]: politicians });
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
  const db = Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : STUB_DB; // Fallback to stub if storage is empty or malformed

  const normalizedText = text.trim().toLowerCase();
  
  // Match if any word in the politician's full name equals the selected token
  const match = db.find(p => {
    const lower = p.name.toLowerCase();
    return lower === normalizedText || lower.split(/\s+/).some(part => part === normalizedText);
  });
  
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
    try {
      const tabId = sender.tab?.id;
      console.log("[HUD] NAME_LOOKUP received:", msg.text, "tabId:", tabId);

      const match = await findPolitician(msg.text);
      console.log("[HUD] findPolitician result:", match ? match.name : "NO MATCH");
      if (!match) return;

      const userVector = await getUserVector();
      console.log("[HUD] userVector:", userVector ? "found" : "MISSING");
      if (!userVector) {
        if (tabId != null) chrome.action.setBadgeText({ text: "?", tabId });
        chrome.action.setBadgeBackgroundColor({ color: "#888" });
        await chrome.storage.local.set({ last_match: null });
        return;
      }

      const result = computeMatch(userVector, match.vector);
      console.log("[HUD] computeMatch score:", result.score);

      await chrome.storage.local.set({
        last_match: {
          name: match.name,
          score: result.score,
          topAligned: result.topAligned,
          topMisaligned: result.topMisaligned,
          policies: match.policies
        }
      });

      if (tabId != null) {
        chrome.action.setBadgeText({ text: "!", tabId });
        chrome.tabs.sendMessage(tabId, {
          type: "SHOW_CARD",
          data: {
            name: match.name,
            score: result.score,
            topAligned: result.topAligned,
            topMisaligned: result.topMisaligned,
            policies: match.policies || []
          }
        }, () => { if (chrome.runtime.lastError) console.warn("[HUD] sendMessage error:", chrome.runtime.lastError.message); });
      }
      chrome.action.setBadgeBackgroundColor({ color: "#7ee8a2" });
    } catch (err) {
      console.error("[HUD] flow error:", err);
    }
  })();

  return true; // Keep channel open for async response if needed
});