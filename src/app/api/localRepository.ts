/**
 * Just Focus — Local Storage Repository
 *
 * Implements StorageRepository using chrome.storage.local.
 * All data models are Supabase-ready (UUID ids, timestamps, user_id placeholder).
 */

import type { StorageRepository } from "./storageRepository";
import type { Session, BlockedSite, Settings } from "@/app/types/databaseTypes";
import { STORAGE_KEYS } from "@/app/const/storageKeys";
import { generateId } from "@/utils/uid";
import { DEFAULT_BLOCKED_SITES } from "@/features/apps/defaultSites";

export class LocalRepository implements StorageRepository {
  private async get<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T) ?? null;
  }

  private async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  // ── Sessions ──────────────────────────────────────────

  async getActiveSession(): Promise<Session | null> {
    return this.get<Session>(STORAGE_KEYS.ACTIVE_SESSION);
  }

  async startSession(session: Session): Promise<void> {
    await this.set(STORAGE_KEYS.ACTIVE_SESSION, session);

    // Also add to history
    const history = (await this.get<Session[]>(STORAGE_KEYS.SESSION_HISTORY)) ?? [];
    history.push(session);
    await this.set(STORAGE_KEYS.SESSION_HISTORY, history);
  }

  async endSession(sessionId: string, status: "completed" | "abandoned"): Promise<void> {
    const now = new Date().toISOString();

    // Update in history
    const history = (await this.get<Session[]>(STORAGE_KEYS.SESSION_HISTORY)) ?? [];
    const index = history.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      history[index] = { ...history[index], status, updated_at: now };
      await this.set(STORAGE_KEYS.SESSION_HISTORY, history);
    }

    // Clear active session
    await chrome.storage.local.remove(STORAGE_KEYS.ACTIVE_SESSION);
  }

  async getSessionHistory(): Promise<Session[]> {
    return (await this.get<Session[]>(STORAGE_KEYS.SESSION_HISTORY)) ?? [];
  }

  // ── Blocked Sites ─────────────────────────────────────

  async getBlockedSites(): Promise<BlockedSite[]> {
    const existing = await this.get<BlockedSite[]>(STORAGE_KEYS.BLOCKED_SITES);
    const now = new Date().toISOString();

    if (!existing || existing.length === 0) {
      const defaults: BlockedSite[] = DEFAULT_BLOCKED_SITES.map((site) => ({
        ...site,
        created_at: now,
        updated_at: now,
      }));
      await this.set(STORAGE_KEYS.BLOCKED_SITES, defaults);
      return defaults;
    }

    // Sync newly added default sites (e.g. AI Tools) into existing list
    const existingDomains = new Set(existing.map((s) => s.domain.toLowerCase()));
    const missingDefaults = DEFAULT_BLOCKED_SITES.filter(
      (def) => !existingDomains.has(def.domain.toLowerCase())
    ).map((site) => ({
      ...site,
      created_at: now,
      updated_at: now,
    }));

    if (missingDefaults.length > 0) {
      const merged = [...existing, ...missingDefaults];
      await this.set(STORAGE_KEYS.BLOCKED_SITES, merged);
      return merged;
    }

    return existing;
  }

  async setBlockedSites(sites: BlockedSite[]): Promise<void> {
    await this.set(STORAGE_KEYS.BLOCKED_SITES, sites);
  }

  // ── Settings ──────────────────────────────────────────

  async getSettings(): Promise<Settings> {
    const existing = await this.get<Settings>(STORAGE_KEYS.SETTINGS);
    if (existing) return existing;

    // Return sensible defaults
    const now = new Date().toISOString();
    const defaults: Settings = {
      id: generateId(),
      user_id: null,
      default_duration_minutes: 30,
      strict_mode_default: false,
      created_at: now,
      updated_at: now,
    };
    await this.set(STORAGE_KEYS.SETTINGS, defaults);
    return defaults;
  }

  async updateSettings(partial: Partial<Settings>): Promise<void> {
    const current = await this.getSettings();
    const updated: Settings = {
      ...current,
      ...partial,
      updated_at: new Date().toISOString(),
    };
    await this.set(STORAGE_KEYS.SETTINGS, updated);
  }
}

/** Singleton instance */
export const localRepository = new LocalRepository();
