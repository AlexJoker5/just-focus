/**
 * Just Focus — Background Service Worker (Manifest V3)
 *
 * Responsibilities:
 * 1. Timer countdowns via chrome.alarms
 * 2. Extension badge synchronization (ON / LOCK)
 * 3. Notifying open tabs on session state changes (In-page overlay triggering)
 * 4. Handling CLOSE_CURRENT_TAB from content scripts
 * 5. Lifecycle recovery on browser restart / service worker wakeup
 */

import { STORAGE_KEYS } from "@/app/const/storageKeys";
import type { Session } from "@/app/types/databaseTypes";

const ALARM_NAME = "JUST_FOCUS_SESSION_TIMER";

// ── Helpers ──────────────────────────────────────────────────────────

async function getStored<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.local.get(key);
  return (result[key] as T) ?? null;
}

async function setStored<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

/**
 * Clear any legacy declarativeNetRequest dynamic redirect rules
 * to ensure website URLs are never changed.
 */
async function clearLegacyDnrRules(): Promise<void> {
  try {
    if (chrome.declarativeNetRequest?.getDynamicRules) {
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const removeRuleIds = existingRules.map((r) => r.id);
      if (removeRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds,
        });
      }
    }
  } catch (err) {
    console.error("[Just Focus] Error clearing legacy DNR rules:", err);
  }
}

/**
 * Broadcast session state updates to all active tabs
 */
async function notifyAllTabs(): Promise<void> {
  try {
    if (!chrome.tabs?.query) return;
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "SESSION_STATE_CHANGED" }).catch(() => {
          // Tab might not have a content script running (e.g., chrome:// URLs)
        });
      }
    }
  } catch (err) {
    console.error("[Just Focus] Failed to notify tabs:", err);
  }
}

// ── Badge & Alarms ───────────────────────────────────────────────────

function updateBadge(active: boolean, strict: boolean = false): void {
  if (!chrome.action?.setBadgeText) return;

  if (active) {
    chrome.action.setBadgeText({ text: strict ? "LOCK" : "ON" });
    chrome.action.setBadgeBackgroundColor({ color: strict ? "#b45309" : "#171717" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

async function handleSessionStart(session: Session): Promise<void> {
  const endTimeMs = new Date(session.end_time).getTime();
  const delayInMinutes = Math.max(0.1, (endTimeMs - Date.now()) / (1000 * 60));

  await chrome.alarms.clear(ALARM_NAME);
  await chrome.alarms.create(ALARM_NAME, {
    delayInMinutes,
  });

  updateBadge(true, session.strict_mode);
  await notifyAllTabs();
}

async function handleSessionEnd(sessionId: string, status: "completed" | "abandoned"): Promise<void> {
  await chrome.alarms.clear(ALARM_NAME);
  updateBadge(false);

  const active = await getStored<Session>(STORAGE_KEYS.ACTIVE_SESSION);
  if (active && active.id === sessionId) {
    const history = (await getStored<Session[]>(STORAGE_KEYS.SESSION_HISTORY)) ?? [];
    const index = history.findIndex((s) => s.id === sessionId);
    const now = new Date().toISOString();

    if (index !== -1) {
      history[index] = { ...history[index], status, updated_at: now };
    } else {
      history.push({ ...active, status, updated_at: now });
    }

    await setStored(STORAGE_KEYS.SESSION_HISTORY, history);
    await chrome.storage.local.remove(STORAGE_KEYS.ACTIVE_SESSION);
  }

  await notifyAllTabs();
}

// ── Lifecycle Listeners ──────────────────────────────────────────────

// On alarm expiration
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    const active = await getStored<Session>(STORAGE_KEYS.ACTIVE_SESSION);
    if (active && active.status === "active") {
      console.log("[Just Focus] Timer finished! Session completed.");
      await handleSessionEnd(active.id, "completed");
    }
  }
});

// Runtime messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_SESSION") {
    handleSessionStart(message.session).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "END_SESSION") {
    handleSessionEnd(message.sessionId, message.status).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "CLOSE_CURRENT_TAB") {
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id).catch(() => {});
    }
    sendResponse({ success: true });
    return true;
  }
});

// Verify & restore state on worker startup or extension install
async function syncWorkerState(): Promise<void> {
  await clearLegacyDnrRules();

  const active = await getStored<Session>(STORAGE_KEYS.ACTIVE_SESSION);
  if (active) {
    const endMs = new Date(active.end_time).getTime();
    if (Date.now() >= endMs) {
      await handleSessionEnd(active.id, "completed");
    } else {
      updateBadge(true, active.strict_mode);
      await notifyAllTabs();
    }
  } else {
    updateBadge(false);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Just Focus] Extension installed.");
  syncWorkerState();
});

chrome.runtime.onStartup.addListener(() => {
  console.log("[Just Focus] Extension startup.");
  syncWorkerState();
});

syncWorkerState();
