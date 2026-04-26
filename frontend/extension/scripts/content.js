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

  // Mini SVG radar chart — same geometry as the desktop comparison panel
  function buildOverlayRadar(uv, pv) {
    const W = 252, H = 192, cx = 126, cy = 96, R = 66, N = 20;
    const LR = R + 12;
    const LABELS = [
      "Market","Fiscal","Tax","Energy",
      "Education","Immigr.","Repro.","Guns",
      "Healthcare","Climate","Foreign Pol.","Defense",
      "Civil Lib.","Voting","Labor","Housing",
      "Tech Reg.","Crim. Just.","Env. Reg.","Cultural",
    ];
    const ang = i => (2 * Math.PI * i / N) - Math.PI / 2;
    const coord = (v, i) => { const a = ang(i), r = ((v-1)/4)*R; return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; };
    const pts = vec => Array.from({length:N},(_,i)=>coord(vec[i],i)).map(([x,y])=>`${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

    const rings = [0.25,0.5,0.75,1.0].map(f=>{
      const p=Array.from({length:N},(_,i)=>{const a=ang(i);return `${(cx+f*R*Math.cos(a)).toFixed(1)},${(cy+f*R*Math.sin(a)).toFixed(1)}`;}).join(" ");
      return `<polygon points="${p}" fill="none" stroke="#E2E5E9" stroke-width="${f===1?1.2:0.7}"/>`;
    }).join("");

    const spokes = Array.from({length:N},(_,i)=>{
      const a=ang(i);
      return `<line x1="${cx}" y1="${cy}" x2="${(cx+R*Math.cos(a)).toFixed(1)}" y2="${(cy+R*Math.sin(a)).toFixed(1)}" stroke="#E2E5E9" stroke-width="0.7"/>`;
    }).join("");

    const labels = LABELS.map((name,i)=>{
      const a=ang(i), ca=Math.cos(a), sa=Math.sin(a);
      const lx=cx+LR*ca, ly=cy+LR*sa;
      const anchor=ca>0.25?"start":ca<-0.25?"end":"middle";
      const dy=sa<-0.3?-3:sa>0.3?10:4;
      return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" dy="${dy}" text-anchor="${anchor}" font-size="7" font-family="monospace" fill="#8A919E">${name}</text>`;
    }).join("");

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible;display:block" xmlns="http://www.w3.org/2000/svg">
      ${rings}${spokes}
      <polygon points="${pts(uv)}" fill="#1565C0" fill-opacity="0.14" stroke="#1565C0" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="${pts(pv)}" fill="#C84B00" fill-opacity="0.14" stroke="#C84B00" stroke-width="1.5" stroke-linejoin="round"/>
      ${labels}
    </svg>`;
  }

  const uv = data.userVector, pv = data.poliVector;
  const radarSVG = (uv && pv && uv.length === 20 && pv.length === 20) ? buildOverlayRadar(uv, pv) : null;

  const dimSection = radarSVG ? `
    <div style="height:1px;background:#F1F3F5;margin:10px 0"></div>
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.09em;color:#8A919E;margin-bottom:6px;font-family:inherit">Issue-by-Issue</div>
    ${radarSVG}
    <div style="display:flex;gap:12px;margin-top:6px">
      <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:#4B5260;font-family:inherit">
        <div style="width:8px;height:8px;border-radius:2px;background:#1565C0;flex-shrink:0"></div>You
      </div>
      <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:#4B5260;font-family:inherit">
        <div style="width:8px;height:8px;border-radius:2px;background:#C84B00;flex-shrink:0"></div>${escapeHtml(data.name)}
      </div>
    </div>
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
