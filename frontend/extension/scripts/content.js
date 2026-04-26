/*
 * Overlay renderer.
 * Tracks right-click position so overlays appear near the cursor.
 * Receives SHOW_CARD / NO_MATCH from background.js.
 * No DB access, no math.
 */

let lastRightClickX = window.innerWidth  - 300;
let lastRightClickY = 20;

document.addEventListener("contextmenu", (e) => {
  lastRightClickX = e.clientX;
  lastRightClickY = e.clientY;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SHOW_CARD") showOverlay(msg.data);
  if (msg.type === "NO_MATCH")  showToast(`No data found for "${msg.text}"`);
});

function scoreBadgeStyle(score) {
  if (score >= 65) return { color: "#1B6B3A", bg: "#1B6B3A1A", border: "#1B6B3A33" };
  if (score >= 40) return { color: "#7A4F00", bg: "#7A4F001A", border: "#7A4F0033" };
  return { color: "#991B1B", bg: "#991B1B1A", border: "#991B1B33" };
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Clamp a proposed position so the element stays within the viewport.
function clampPosition(x, y, width, height) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    left: Math.min(Math.max(x, 8), vw - width - 8),
    top:  Math.min(Math.max(y, 8), vh - height - 8),
  };
}

function showOverlay(data) {
  const existing = document.getElementById("civic-hud-overlay");
  if (existing) existing.remove();

  const { color, bg, border } = scoreBadgeStyle(data.score);

  const policies = (data.policies || []).slice(0, 2)
    .map(p => `<div style="background:#F1F3F5;border:1px solid #E2E5E9;border-radius:6px;padding:5px 9px;font-size:12px;color:#4B5260;font-family:inherit">${escapeHtml(p)}</div>`)
    .join("") || `<div style="font-size:12px;color:#8A919E">—</div>`;

  const summary = data.summary
    ? `<div style="font-size:12px;color:#4B5260;line-height:1.55;margin-bottom:12px">${escapeHtml(data.summary)}</div>`
    : "";

  const CARD_W = 280;
  const { left, top } = clampPosition(lastRightClickX + 12, lastRightClickY + 12, CARD_W, 200);

  const card = document.createElement("div");
  card.id = "civic-hud-overlay";
  card.style.cssText = [
    "all:initial",
    "position:fixed",
    `left:${left}px`,
    `top:${top}px`,
    `width:${CARD_W}px`,
    "background:#fff",
    "color:#0D0F12",
    "border-radius:12px",
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "font-size:13px",
    "z-index:2147483647",
    "box-shadow:0 4px 24px rgba(13,15,18,0.14),0 1px 4px rgba(13,15,18,0.06)",
    "border:1px solid #E2E5E9",
    "box-sizing:border-box"
  ].join(";");

  const position = data.position
    ? `<div style="font-size:11px;color:#8A919E;margin-top:1px;margin-bottom:4px;font-family:inherit">${escapeHtml(data.position)}</div>`
    : "";

  // Top 5 most divergent dimensions
  const dimRows = (data.dimensions || [])
    .slice()
    .sort((a, b) => a.agreement - b.agreement)
    .slice(0, 5)
    .map(d => {
      const c = d.agreement >= 70 ? "#1B6B3A" : d.agreement >= 45 ? "#7A4F00" : "#991B1B";
      return `<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">
        <div style="font-size:9px;color:#4B5260;width:70px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:monospace">${escapeHtml(d.name)}</div>
        <div style="flex:1;height:4px;background:#F1F3F5;border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${d.agreement}%;background:${c};border-radius:2px"></div>
        </div>
        <div style="font-size:9px;color:${c};width:26px;text-align:right;flex-shrink:0;font-family:monospace">${d.agreement}%</div>
      </div>`;
    }).join("");

  const dimSection = dimRows ? `
    <div style="height:1px;background:#F1F3F5;margin:10px 0"></div>
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.09em;color:#8A919E;margin-bottom:6px;font-family:inherit">Most Divergent Issues</div>
    ${dimRows}
  ` : "";

  card.innerHTML = `
    <div style="padding:14px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:4px">
        <div>
          <div style="font-size:14px;font-weight:500;color:#0D0F12;line-height:1.3;font-family:inherit">${escapeHtml(data.name)}</div>
          ${position}
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
          <span style="font-size:11px;font-weight:500;padding:2px 8px;border-radius:6px;color:${color};background:${bg};border:1px solid ${border};white-space:nowrap;font-family:inherit">${data.score}% Match</span>
          <button id="civic-hud-close" style="background:none;border:none;color:#8A919E;cursor:pointer;font-size:18px;padding:0;line-height:1;font-family:inherit">&times;</button>
        </div>
      </div>
      ${summary}
      <div style="height:1px;background:#F1F3F5;margin-bottom:10px"></div>
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.09em;color:#8A919E;margin-bottom:7px;font-family:inherit">Key Policies</div>
      <div style="display:flex;flex-direction:column;gap:4px">${policies}</div>
      ${dimSection}
    </div>
  `;

  document.body.appendChild(card);
  document.getElementById("civic-hud-close").addEventListener("click", () => card.remove());
  setTimeout(() => { if (card.parentNode) card.remove(); }, 10000);
}

// ── deskApp → extension sync ──────────────────────────────────────────────────
// Runs only on localhost:3000. Reads polidex:profile from localStorage and
// pushes it to the service worker whenever it changes.
if (window.location.hostname === "localhost" && window.location.port === "3000") {
  function syncFromLocalStorage() {
    try {
      const raw = localStorage.getItem("polidex:profile");
      if (!raw) return;
      const profile = JSON.parse(raw);
      if (Array.isArray(profile.vector) && profile.vector.length === 20) {
        chrome.runtime.sendMessage({ type: "SYNC_VECTOR", vector: profile.vector });
      }
    } catch {}
  }
  // Initial load: pick up any profile already saved
  syncFromLocalStorage();
  // Cross-tab: fires when another tab writes to localStorage
  window.addEventListener("storage", (e) => {
    if (e.key === "polidex:profile") syncFromLocalStorage();
  });
  // Same-tab: fires when the quiz completes in this tab (see saveProfile in profile.ts)
  window.addEventListener("polidex:profile-saved", (e) => {
    const vector = e.detail?.vector;
    if (Array.isArray(vector) && vector.length === 20) {
      chrome.runtime.sendMessage({ type: "SYNC_VECTOR", vector });
    }
  });
}

function showToast(message) {
  const existing = document.getElementById("civic-hud-toast");
  if (existing) existing.remove();

  const TOAST_W = 260;
  const { left, top } = clampPosition(lastRightClickX + 12, lastRightClickY + 12, TOAST_W, 44);

  const toast = document.createElement("div");
  toast.id = "civic-hud-toast";
  toast.style.cssText = [
    "all:initial",
    "position:fixed",
    `left:${left}px`,
    `top:${top}px`,
    `width:${TOAST_W}px`,
    "background:#fff",
    "color:#4B5260",
    "border:1px solid #E2E5E9",
    "border-radius:8px",
    "padding:10px 14px",
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "font-size:13px",
    "z-index:2147483647",
    "box-shadow:0 2px 12px rgba(13,15,18,0.10)",
    "box-sizing:border-box"
  ].join(";");
  toast.textContent = message;

  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "0"; toast.style.transition = "opacity 300ms"; }, 2000);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2300);
}
