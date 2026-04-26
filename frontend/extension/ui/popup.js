/*
 * Card rendering and data binding only.
 * Receives match result from background.js, populates card.html with
 * % match, top aligned/misaligned dimensions, and top 2 implemented policies.
 * No math, no storage writes, no DB calls.
 */

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("last_match", ({ last_match }) => {
    if (!last_match) {
      document.getElementById("fallback").style.display = "block";
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
    fill("policies", last_match.policies);
  });
});
