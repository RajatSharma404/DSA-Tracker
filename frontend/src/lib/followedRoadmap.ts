"use client";

/** The roadmap the user is currently following (per browser). */
const KEY = "dsa_followed_roadmap";
export const FOLLOW_EVENT = "dsa-followed-roadmap-changed";

export const getFollowedRoadmap = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const setFollowedRoadmap = (slug: string | null) => {
  try {
    if (slug) localStorage.setItem(KEY, slug);
    else localStorage.removeItem(KEY);
  } catch {
    // storage optional
  }
  window.dispatchEvent(new CustomEvent(FOLLOW_EVENT, { detail: slug }));
};
