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

// Radar chart — pure SVG, no dependencies.
// userVec / poliVec: 20-element arrays on 1–5 scale.
// Matches the desktop app's Issue-by-issue overlap panel (blue = you, orange = them).
function buildRadarSVG(userVec, poliVec) {
  const W = 272, H = 210, cx = 136, cy = 102, R = 72, N = 20;
  const LABEL_R = R + 13;

  const LABELS = [
    "Market", "Fiscal", "Tax", "Energy",
    "Education", "Immigr.", "Repro.", "Guns",
    "Healthcare", "Climate", "Foreign Pol.", "Defense",
    "Civil Lib.", "Voting", "Labor", "Housing",
    "Tech Reg.", "Crim. Just.", "Env. Reg.", "Cultural",
  ];

  function ang(i) { return (2 * Math.PI * i / N) - Math.PI / 2; }

  function coord(v, i) {
    const a = ang(i), r = ((v - 1) / 4) * R;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  function pts(vec) {
    return Array.from({ length: N }, (_, i) => coord(vec[i], i))
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  }

  // Concentric grid rings
  const rings = [0.25, 0.5, 0.75, 1.0].map(f => {
    const p = Array.from({ length: N }, (_, i) => {
      const a = ang(i);
      return `${(cx + f * R * Math.cos(a)).toFixed(1)},${(cy + f * R * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
    return `<polygon points="${p}" fill="none" stroke="#E2E5E9" stroke-width="${f === 1 ? 1.2 : 0.7}"/>`;
  }).join("");

  // Spokes
  const spokes = Array.from({ length: N }, (_, i) => {
    const a = ang(i);
    return `<line x1="${cx}" y1="${cy}" x2="${(cx + R * Math.cos(a)).toFixed(1)}" y2="${(cy + R * Math.sin(a)).toFixed(1)}" stroke="#E2E5E9" stroke-width="0.7"/>`;
  }).join("");

  // Axis labels
  const labels = LABELS.map((name, i) => {
    const a = ang(i);
    const ca = Math.cos(a), sa = Math.sin(a);
    const lx = cx + LABEL_R * ca, ly = cy + LABEL_R * sa;
    const anchor = ca > 0.25 ? "start" : ca < -0.25 ? "end" : "middle";
    const dy = sa < -0.3 ? -3 : sa > 0.3 ? 10 : 4;
    return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" dy="${dy}" text-anchor="${anchor}" font-size="7.5" font-family="'IBM Plex Mono',monospace" fill="#8A919E">${name}</text>`;
  }).join("");

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible;display:block" xmlns="http://www.w3.org/2000/svg">
    ${rings}${spokes}
    <polygon points="${pts(userVec)}" fill="#1565C0" fill-opacity="0.14" stroke="#1565C0" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="${pts(poliVec)}" fill="#C84B00" fill-opacity="0.14" stroke="#C84B00" stroke-width="1.5" stroke-linejoin="round"/>
    ${labels}
  </svg>`;
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

    chrome.storage.local.get(["last_match", "user_vector"], ({ last_match, user_vector }) => {
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

      const uv = user_vector || last_match.userVector;
      const pv = last_match.poliVector;
      if (uv && pv && uv.length === 20 && pv.length === 20) {
        document.getElementById("overlap-section").style.display = "block";
        document.getElementById("radar-chart").innerHTML = buildRadarSVG(uv, pv);
        document.getElementById("radar-legend-name").textContent = last_match.name;
      }
    });
  });
});
