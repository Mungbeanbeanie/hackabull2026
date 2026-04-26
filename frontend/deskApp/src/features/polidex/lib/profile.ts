export type UserProfile = {
  vector: number[];
  weights: number[];
  state?: string;
  updatedAt: string;
};

// Young FL moderate independent — leans left on climate, healthcare, civil liberties, reproductive rights
export const DEMO_PROFILE: UserProfile = {
  vector:  [2.5, 3.0, 2.0, 2.0, 3.0, 2.5, 1.5, 2.0, 2.0, 1.5, 2.0, 3.0, 1.5, 1.5, 2.0, 2.5, 2.5, 2.0, 1.5, 3.0],
  weights: [1.0, 1.0, 1.0, 1.4, 1.0, 1.2, 1.8, 1.0, 1.5, 1.6, 1.0, 1.0, 1.3, 1.3, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  state: "FL",
  updatedAt: "2026-04-26T00:00:00.000Z",
};

const KEY = "polidex:profile";
const PROFILE_CODE_PREFIX = "PDXQ1";

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return null;
    }

    const profile = JSON.parse(raw) as UserProfile;
    if (!Array.isArray(profile.vector) || profile.vector.length !== 20) {
      return null;
    }

    return profile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(KEY, JSON.stringify(profile));
  // Signal extension content script for same-tab real-time sync
  window.dispatchEvent(new CustomEvent("polidex:profile-saved", { detail: profile }));
}

export function clearProfile() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(KEY);
}

export function exportProfileCode(profile: UserProfile): string {
  const payload = JSON.stringify({
    vector: profile.vector,
    weights: profile.weights,
    state: profile.state,
    updatedAt: profile.updatedAt,
  });
  const encoded = toBase64Url(payload);
  const checksum = checksumHex(encoded);
  return `${PROFILE_CODE_PREFIX}-${encoded}.${checksum}`;
}

export function importProfileCode(code: string): UserProfile | null {
  const trimmed = code.trim();
  const [prefix, rest] = trimmed.split("-", 2);
  if (prefix !== PROFILE_CODE_PREFIX || !rest) {
    return null;
  }

  const [encoded, checksum] = rest.split(".", 2);
  if (!encoded || !checksum || checksumHex(encoded) !== checksum.toLowerCase()) {
    return null;
  }

  try {
    const payload = fromBase64Url(encoded);
    const parsed = JSON.parse(payload) as Partial<UserProfile>;
    if (!Array.isArray(parsed.vector) || parsed.vector.length !== 20) {
      return null;
    }
    if (!Array.isArray(parsed.weights) || parsed.weights.length !== 20) {
      return null;
    }

    const vector = parsed.vector.map((value) => Number(value));
    const weights = parsed.weights.map((value) => Number(value));
    if (vector.some((value) => Number.isNaN(value)) || weights.some((value) => Number.isNaN(value))) {
      return null;
    }

    const state = typeof parsed.state === "string" && parsed.state.length > 0 ? parsed.state : undefined;

    return {
      vector,
      weights,
      state,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function checksumHex(value: string): string {
  let sum = 0;
  for (let index = 0; index < value.length; index++) {
    sum = (sum + value.charCodeAt(index) * (index + 17)) % 65535;
  }
  return sum.toString(16).padStart(4, "0");
}

function toBase64Url(value: string): string {
  const base64 = toBase64(value);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return fromBase64(base64);
}

function toBase64(value: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(value);
  }
  if (typeof globalThis !== "undefined" && "Buffer" in globalThis) {
    const bufferCtor = (globalThis as unknown as { Buffer: { from: (input: string, encoding: string) => { toString: (outputEncoding: string) => string } } }).Buffer;
    return bufferCtor.from(value, "utf-8").toString("base64");
  }
  throw new Error("No base64 encoder available");
}

function fromBase64(value: string): string {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(value);
  }
  if (typeof globalThis !== "undefined" && "Buffer" in globalThis) {
    const bufferCtor = (globalThis as unknown as { Buffer: { from: (input: string, encoding: string) => { toString: (outputEncoding: string) => string } } }).Buffer;
    return bufferCtor.from(value, "base64").toString("utf-8");
  }
  throw new Error("No base64 decoder available");
}
