/*
 * Card rendering and data binding only.
 * Receives match result from background.js, populates card.html with
 * % match, 1-sentence summary, and top 2 implemented policies.
 * No math, no storage writes, no DB calls.
 */

function setUserVector(vector) {
  return chrome.storage.local.set({ user_vector: vector });
}

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
    // Find the first dash only — the rest of the string (base64url) may also contain dashes.
    const dashIdx = code.indexOf("-");
    if (dashIdx === -1 || code.slice(0, dashIdx) !== PROFILE_CODE_PREFIX) return null;

    const rest = code.slice(dashIdx + 1);           // <encoded>.<checksum>
    const dotIdx = rest.lastIndexOf(".");
    if (dotIdx === -1) return null;

    const encoded  = rest.slice(0, dotIdx);
    const checksum = rest.slice(dotIdx + 1);
    if (checksumHex(encoded) !== checksum) return null;

    // base64url → standard base64 → decode
    const padded  = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);
    const base64  = padded.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    const parsed  = JSON.parse(decoded);

    if (!Array.isArray(parsed.vector)  || parsed.vector.length  !== 20) return null;
    if (!Array.isArray(parsed.weights) || parsed.weights.length !== 20) return null;
    if (!parsed.vector.every(v => typeof v === "number") || !parsed.weights.every(w => typeof w === "number")) return null;

    return { vector: parsed.vector, weights: parsed.weights, updatedAt: parsed.updatedAt };
  } catch {
    return null;
  }
}

// Badge style mirrors web app consistencyColor pattern (color + 1A bg + 33 border)
function scoreBadgeStyle(score) {
  if (score >= 65) return { color: "#1B6B3A", bg: "#1B6B3A1A", border: "#1B6B3A33" };
  if (score >= 40) return { color: "#7A4F00", bg: "#7A4F001A", border: "#7A4F0033" };
  return { color: "#991B1B", bg: "#991B1B1A", border: "#991B1B33" };
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

  chrome.action.getBadgeText({}, badgeText => {
    chrome.action.setBadgeText({ text: "" });

    chrome.storage.local.get("last_match", ({ last_match }) => {
      if (!last_match) {
        const fallback = document.getElementById("fallback");
        fallback.style.display = "block";
        if (badgeText === "?") fallback.textContent = "Set your profile first, then double-click a politician's name.";
        return;
      }

      const card = document.getElementById("main-card");
      card.style.display = "block";

      document.getElementById("poli-name").textContent = last_match.name;
      document.getElementById("poli-position").textContent = last_match.position || "";

      const { color, bg, border } = scoreBadgeStyle(last_match.score);
      const badgeEl = document.getElementById("match-badge");
      badgeEl.textContent = `${last_match.score}% Match`;
      badgeEl.style.color = color;
      badgeEl.style.background = bg;
      badgeEl.style.border = `1px solid ${border}`;

      document.getElementById("summary").textContent = last_match.summary || "";

      const policiesEl = document.getElementById("policies");
      const policies = (last_match.policies || []).slice(0, 2);
      policiesEl.innerHTML = policies.map(p => `<div class="policy-item">${p}</div>`).join("");

      const dimensions = last_match.dimensions || [];
      if (dimensions.length > 0) {
        const overlapSection = document.getElementById("overlap-section");
        overlapSection.style.display = "block";

        // Sort most-divergent first so the user immediately sees where they clash
        const sorted = [...dimensions].sort((a, b) => a.agreement - b.agreement);
        document.getElementById("dim-rows").innerHTML = sorted.map(d => {
          const c = d.agreement >= 70 ? "#1B6B3A" : d.agreement >= 45 ? "#7A4F00" : "#991B1B";
          return `<div class="dim-row">
            <div class="dim-label">${d.name}</div>
            <div class="dim-track"><div class="dim-fill" style="width:${d.agreement}%;background:${c}"></div></div>
            <div class="dim-pct" style="color:${c}">${d.agreement}%</div>
          </div>`;
        }).join("");
      }
    });
  });
});
