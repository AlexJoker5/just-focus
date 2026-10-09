/**
 * Storage keys for chrome.storage.local
 */
export const STORAGE_KEYS = {
  ACTIVE_SESSION: "just_focus_active_session",
  SESSION_HISTORY: "just_focus_session_history",
  BLOCKED_SITES: "just_focus_blocked_sites",
  SETTINGS: "just_focus_settings",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
