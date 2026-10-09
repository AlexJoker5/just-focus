/**
 * Just Focus — Storage Repository Interface
 *
 * Defines the contract for all data operations.
 * Both localRepository and future supabaseRepository must implement this interface.
 */

import type { Session, BlockedSite, Settings } from "@/app/types/databaseTypes";

export interface StorageRepository {
  // Sessions
  getActiveSession(): Promise<Session | null>;
  startSession(session: Session): Promise<void>;
  endSession(sessionId: string, status: "completed" | "abandoned"): Promise<void>;
  getSessionHistory(): Promise<Session[]>;

  // Blocked Sites
  getBlockedSites(): Promise<BlockedSite[]>;
  setBlockedSites(sites: BlockedSite[]): Promise<void>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<void>;
}
