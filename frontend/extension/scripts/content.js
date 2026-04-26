/*
 * Double-click listener only.
 * Captures selected text on double-click and posts it to background.js for name lookup.
 * No DB access, no math, no rendering.
 */

document.addEventListener("dblclick", () => {
  const selected = window.getSelection().toString().trim();
  if (!selected) return;

  try {
    chrome.runtime.sendMessage({ type: "NAME_LOOKUP", text: selected });
  } catch {
    // Extension was reloaded while this tab was open; context is stale.
    // The listener will be re-injected on next page load — no action needed.
  }
});
