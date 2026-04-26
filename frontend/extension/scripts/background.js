/*
 * Service worker. Orchestration only.
 * Receives selected text from content.js, queries politician DB for name match,
 * delegates similarity computation to cosine_bridge.js, returns result to popup.
 * No math, no rendering, no direct storage access.
 */
