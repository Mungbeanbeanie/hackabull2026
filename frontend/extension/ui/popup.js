/*
 * Card rendering and data binding only.
 * Receives match result from background.js, populates card.html with
 * % match, top aligned/misaligned dimensions, and top 2 implemented policies.
 * No math, no storage writes, no DB calls.
 */

import { setUserVector } from "../scripts/user_vector_store.js";

const PROFILE_CODE_PREFIX = "PDXQ1";

function checksumHex(value) {
  let sum = 0;
  for (let i = 0; i < value.length; i++) {
    sum = (sum + value.charCodeAt(i) * (i + 17)) % 65535;
  }
  return sum.toString(16).padStart(4, "0");
}

function importProfileCode(code) {
  try {
    const parts = code.split("-");
    if (parts[0] !== PROFILE_CODE_PREFIX) return null;
    const remainder = parts.slice(1).join("-");
    const dotIdx = remainder.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const payload = remainder.slice(0, dotIdx);
    const checksum = remainder.slice(dotIdx + 1);
    if (checksumHex(payload) !== checksum) return null;
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    const parsed = JSON.parse(decoded);
    if (
      !Array.isArray(parsed.vector) || parsed.vector.length !== 20 ||
      !Array.isArray(parsed.weights) || parsed.weights.length !== 20 ||
      !parsed.vector.every(v => typeof v === "number") ||
      !parsed.weights.every(w => typeof w === "number")
    ) return null;
    return { vector: parsed.vector, weights: parsed.weights, updatedAt: parsed.updatedAt };
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const syncBtn = document.getElementById("set-profile-btn");
  const syncInput = document.getElementById("profile-code-input");
  const syncMsg = document.getElementById("sync-message");

  syncBtn.addEventListener("click", () => {
    const parsed = importProfileCode(syncInput.value.trim());
    if (!parsed) {
      syncMsg.textContent = "Invalid code.";
      setTimeout(() => { syncMsg.textContent = ""; }, 2000);
    } else {
      setUserVector(parsed.vector);
      syncMsg.textContent = "Profile set!";
      syncInput.value = "";
      setTimeout(() => { syncMsg.textContent = ""; }, 2000);
    }
  });
  // Read badge before clearing so we can distinguish "no vector" from "no match yet".
  chrome.action.getBadgeText({}, badgeText => {
    chrome.action.setBadgeText({ text: "" });

    chrome.storage.local.get("last_match", ({ last_match }) => {
      if (!last_match) {
        const fallback = document.getElementById("fallback");
        fallback.style.display = "block";
        if (badgeText === "?") fallback.textContent = "Set your vector in the quiz first, then double-click a name.";
        return;
      }

      document.getElementById("poli-name").textContent = last_match.name;
      document.getElementById("match-score").textContent = `${last_match.score}% Match`;

      const fill = (id, items) => {
        const el = document.getElementById(id);
        el.innerHTML = items.map(t => `<li>${t}</li>`).join("");
      };

      fill("top-aligned", last_match.topAligned);
      fill("top-misaligned", last_match.topMisaligned);
      fill("policies", last_match.policies || []);
    });
  });
});
