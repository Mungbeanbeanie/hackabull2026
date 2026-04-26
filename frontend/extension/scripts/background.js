/*
 * Service worker. Orchestration only.
 * Context menu "Who is this?" triggers name lookup against local politician DB,
 * delegates similarity computation to cosine_bridge.js, pushes overlay to content.js.
 */

import { getUserVector, setUserVector } from "./user_vector_store.js";
import { computeMatch } from "./cosine_bridge.js";

const BACKEND_URL = "http://localhost:8080";
const STORAGE_KEY = "politician_db";
const MENU_ID     = "who-is-this";

// Vectors: [p1 Market, p2 Fiscal, p3 Tax, p4 Energy, p5 Education, p6 Immigration,
//           p7 Reproductive, p8 Guns, p9 Healthcare, p10 Climate, p11 Foreign Policy,
//           p12 Defense, p13 Civil Liberties, p14 Voting, p15 Labor, p16 Housing,
//           p17 Tech Reg, p18 Criminal Justice, p19 Env Reg, p20 Cultural]
// Scale: 1 = left endpoint, 5 = right endpoint (see taxonomy.json)
const STUB_DB = [
  {
    name: "Donald Trump",
    position: "President (2017–2021, 2025–)",
    vector: [4, 2, 5, 5, 4, 5, 4, 5, 4, 5, 5, 4, 4, 5, 3, 4, 3, 5, 5, 5],
    policies: ["Tax Cuts & Jobs Act", "Border Wall & Remain in Mexico"],
    summary: "A nationalist populist who reshaped the GOP around immigration restriction, tariffs, and executive unilateralism."
  },
  {
    name: "Ron DeSantis",
    position: "Governor of Florida (2019–2023)",
    vector: [4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 5, 5, 4, 3, 4, 5, 5],
    policies: ["School Choice Expansion", "6-Week Abortion Ban"],
    summary: "A culture-war conservative who used Florida's governorship to aggressively restrict abortion, expand school vouchers, and challenge federal authority."
  },
  {
    name: "Marco Rubio",
    position: "U.S. Secretary of State",
    vector: [4, 4, 5, 4, 4, 4, 5, 4, 4, 4, 3, 5, 3, 4, 4, 4, 3, 4, 4, 4],
    policies: ["Defense Appropriations", "Child Tax Credit Expansion"],
    summary: "A hawkish establishment conservative who pairs strong national defense with occasional bipartisan dealmaking on immigration and family policy."
  },
  {
    name: "Rick Scott",
    position: "U.S. Senator, Florida",
    vector: [5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 4, 4, 4, 5, 5, 5, 4, 4, 5, 5],
    policies: ["Balanced Budget Push", "Medicare Fraud Crackdown"],
    summary: "A fiscal hardliner who cut Florida's government dramatically as governor and advocates for spending caps and strict entitlement reform in the Senate."
  },
  {
    name: "Joe Biden",
    position: "President (2021–2025)",
    vector: [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 3, 2, 1, 2, 2, 3, 2, 2, 2],
    policies: ["Inflation Reduction Act", "Infrastructure Investment & Jobs Act"],
    summary: "A center-left institutionalist who championed major climate and infrastructure investment while prioritizing NATO alliances and incremental domestic reform."
  },
  {
    name: "Bernie Sanders",
    position: "U.S. Senator, Vermont",
    vector: [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2, 1, 1],
    policies: ["Medicare for All", "Green New Deal"],
    summary: "A democratic socialist who has spent decades pushing for universal healthcare, free public college, and aggressive climate legislation funded by wealth taxes."
  },
  {
    name: "Alexandria Ocasio-Cortez",
    position: "U.S. Rep., NY-14",
    vector: [1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1],
    policies: ["Green New Deal", "Defund the Pentagon"],
    summary: "A progressive firebrand who advocates for sweeping climate policy, abolishing student debt, and redirecting defense spending toward domestic social programs."
  },
  {
    name: "Nikki Haley",
    position: "Former U.S. Ambassador to the UN",
    vector: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 5, 3, 4, 4, 4, 3, 4, 4, 4],
    policies: ["UN Reform", "Balanced Budget Amendment"],
    summary: "A hawkish internationalist conservative who emphasizes fiscal discipline, a strong military posture, and a more traditional Republican foreign policy."
  },
];


async function refreshPoliticianCache() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/politicians`);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const data = await response.json();
    const raw = Array.isArray(data) ? data : (data.politicians || []);
    const politicians = raw.map(p => ({
      ...p,
      vector:   Array.from({ length: 20 }, (_, i) => p.vector[`d${i + 1}`]),
      position: [p.role, p.district].filter(Boolean).join(" — "),
    }));
    await chrome.storage.local.set({ [STORAGE_KEY]: politicians });
  } catch {
    console.warn("[HUD] API fetch failed — using cached DB or stub.");
  }
}

async function findPolitician(text) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY];
    const liveDb = (Array.isArray(stored) && stored.length > 0) ? stored : [];
    // Always append STUB_DB so hardcoded politicians are searchable regardless of cache state
    const db = [...liveDb, ...STUB_DB];

    const normalized = text.trim().toLowerCase();
    return db.find(p => {
      const lower = (p.name || "").toLowerCase();
      return lower === normalized || lower.split(/\s+/).some(part => part === normalized);
    }) || null;
  } catch {
    return null;
  }
}

async function handleLookup(text, tabId) {
  try {
    const match = await findPolitician(text);
    if (!match) {
      if (tabId != null) {
        chrome.tabs.sendMessage(tabId, { type: "NO_MATCH", text }, () => { if (chrome.runtime.lastError) {} });
      }
      return;
    }

    const userVector = await getUserVector();
    if (!userVector) {
      if (tabId != null) chrome.action.setBadgeText({ text: "?", tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#888" });
      await chrome.storage.local.set({ last_match: null });
      return;
    }

    const result = computeMatch(userVector, match.vector);

    await chrome.storage.local.set({
      last_match: {
        name:       match.name,
        position:   match.position || "",
        score:      result.score,
        summary:    match.summary || "",
        policies:   match.policies,
        dimensions: result.dimensions || [],
      }
    });

    if (tabId != null) {
      chrome.action.setBadgeText({ text: "!", tabId });
      chrome.tabs.sendMessage(tabId, {
        type: "SHOW_CARD",
        data: {
          name:       match.name,
          position:   match.position || "",
          score:      result.score,
          summary:    match.summary || "",
          policies:   match.policies || [],
          dimensions: result.dimensions || [],
        }
      }, () => { if (chrome.runtime.lastError) {} });
    }
    chrome.action.setBadgeBackgroundColor({ color: "#1B6B3A" });
  } catch (err) {
    console.error("[HUD] lookup error:", err);
  }
}

function registerContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id:       MENU_ID,
      title:    "Who is this?",
      contexts: ["selection"],
    });
  });
}

// Initialization
chrome.runtime.onInstalled.addListener(() => {
  getUserVector().then(v => {
    if (!v) setUserVector([3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]);
  });
  registerContextMenu();
  refreshPoliticianCache();
});

chrome.runtime.onStartup.addListener(() => {
  registerContextMenu();
  refreshPoliticianCache();
});

// Context menu click — info.selectionText is the highlighted text
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID) return;
  const text = info.selectionText?.trim();
  if (text) handleLookup(text, tab?.id);
});

// Real-time sync from deskApp (localhost:3000) via content.js bridge
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SYNC_VECTOR" && Array.isArray(msg.vector) && msg.vector.length === 20) {
    setUserVector(msg.vector);
  }
});
