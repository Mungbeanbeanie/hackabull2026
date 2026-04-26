/*
 * Double-click listener only.
 * Captures selected text on double-click and posts it to background.js for name lookup.
 * No DB access, no math, no rendering.
 */

document.addEventListener("dblclick", () => {
  const selected = window.getSelection().toString().trim();
  if (selected) {
    chrome.runtime.sendMessage({ type: "NAME_LOOKUP", text: selected });
  }
});
