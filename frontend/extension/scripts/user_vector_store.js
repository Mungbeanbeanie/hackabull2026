/*
 * chrome.storage.local I/O only.
 * Exposes get/set for user_vector (20-element float array, key: "user_vector").
 * No math, no rendering, no DB calls.
 */

export function getUserVector() {
  return new Promise(resolve => {
    chrome.storage.local.get("user_vector", result => {
      resolve(result.user_vector ?? null);
    });
  });
}

export function setUserVector(vector) {
  return chrome.storage.local.set({ user_vector: vector });
}
