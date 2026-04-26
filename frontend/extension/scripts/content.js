/*
 * Double-click listener — sends selected text to background.js for name lookup.
 * Incoming SHOW_CARD messages inject a floating overlay card into the page.
 * No DB access, no math.
 */

document.addEventListener("dblclick", () => {
  const selected = window.getSelection().toString().trim();
  if (!selected) return;

  try {
    chrome.runtime.sendMessage({ type: "NAME_LOOKUP", text: selected });
  } catch {
    // Extension was reloaded while this tab was open; context is stale.
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SHOW_CARD") showOverlay(msg.data);
});

function showOverlay(data) {
  const existing = document.getElementById("civic-hud-overlay");
  if (existing) existing.remove();

  const card = document.createElement("div");
  card.id = "civic-hud-overlay";
  card.style.cssText = [
    "position:fixed", "top:20px", "right:20px", "width:280px",
    "background:#0f0f0f", "color:#e8e8e8", "border-radius:8px",
    "padding:14px 16px", "font-family:system-ui,sans-serif", "font-size:13px",
    "z-index:2147483647", "box-shadow:0 4px 20px rgba(0,0,0,0.5)",
    "border:1px solid #333", "line-height:1.4"
  ].join(";");

  const aligned    = (data.topAligned    || []).map(t => `<li style="color:#7ee8a2;margin-bottom:3px">${t}</li>`).join("");
  const misaligned = (data.topMisaligned || []).map(t => `<li style="color:#f28b82;margin-bottom:3px">${t}</li>`).join("");
  const policies   = (data.policies      || []).map(t => `<li style="margin-bottom:3px">${t}</li>`).join("") || "<li style='color:#888'>N/A</li>";

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
      <div style="font-size:15px;font-weight:600">${data.name}</div>
      <button id="civic-hud-close" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px;padding:0;line-height:1">&times;</button>
    </div>
    <div style="font-size:28px;font-weight:700;color:#7ee8a2;margin-bottom:12px">${data.score}% Match</div>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888;margin:10px 0 4px">Top Aligned</div>
    <ol style="margin:0;padding-left:18px">${aligned}</ol>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888;margin:10px 0 4px">Top Misaligned</div>
    <ol style="margin:0;padding-left:18px">${misaligned}</ol>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888;margin:10px 0 4px">Top Implemented Policies</div>
    <ul style="margin:0;padding-left:18px">${policies}</ul>
  `;

  document.body.appendChild(card);
  document.getElementById("civic-hud-close").addEventListener("click", () => card.remove());
  setTimeout(() => { if (card.parentNode) card.remove(); }, 10000);
}
