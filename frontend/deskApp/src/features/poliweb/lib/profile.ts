export type UserProfile = {
  vector: number[];
  weights: number[];
  updatedAt: string;
};

const KEY = "poliweb:profile";

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
}

export function clearProfile() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(KEY);
}
