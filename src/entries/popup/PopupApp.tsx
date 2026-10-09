import { useState, useEffect, useCallback } from "react";
import { PopupLayout } from "@/components/layout/PopupLayout";
import { Header } from "@/components/layout/Header";
import { Navbar } from "@/components/layout/Navbar";
import { IdleSessionView } from "@/features/focus/IdleSessionView";
import { ActiveSessionView } from "@/features/focus/ActiveSessionView";
import { AppsView } from "@/features/apps/AppsView";
import { StatsView } from "@/features/stats/StatsView";
import { ScheduleView } from "@/features/schedule/ScheduleView";
import { localRepository } from "@/app/api/localRepository";
import type { Session, BlockedSite } from "@/app/types/databaseTypes";
import { generateId } from "@/utils/uid";

export type TabId = "focus" | "apps" | "stats" | "schedule";

export default function PopupApp() {
  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sites, setSites] = useState<BlockedSite[]>([]);
  const [history, setHistory] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [currentSession, storedSites, sessionHistory] = await Promise.all([
        localRepository.getActiveSession(),
        localRepository.getBlockedSites(),
        localRepository.getSessionHistory(),
      ]);

      // Check if active session is already expired
      if (currentSession) {
        const endTime = new Date(currentSession.end_time).getTime();
        if (Date.now() >= endTime) {
          await localRepository.endSession(currentSession.id, "completed");
          setActiveSession(null);
          setHistory(await localRepository.getSessionHistory());
        } else {
          setActiveSession(currentSession);
        }
      } else {
        setActiveSession(null);
      }

      setSites(storedSites);
      setHistory(sessionHistory);
    } catch (err) {
      console.error("[Just Focus] Failed to load popup data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen to storage changes for multi-context sync (e.g. background worker)
    const handleStorageChange = (
      _changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "local") {
        loadData();
      }
    };

    if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, [loadData]);

  // Start Session handler
  const handleStartSession = async (durationMinutes: number, strictMode: boolean) => {
    const selectedSiteIds = sites.filter((s) => s.is_selected).map((s) => s.id);
    const now = new Date();
    const end = new Date(now.getTime() + durationMinutes * 60 * 1000);

    const newSession: Session = {
      id: generateId(),
      user_id: null,
      duration_minutes: durationMinutes,
      start_time: now.toISOString(),
      end_time: end.toISOString(),
      status: "active",
      strict_mode: strictMode,
      blocked_site_ids: selectedSiteIds,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    await localRepository.startSession(newSession);
    setActiveSession(newSession);

    // Notify background service worker to update alarms and declarativeNetRequest
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      try {
        await chrome.runtime.sendMessage({
          type: "START_SESSION",
          session: newSession,
        });
      } catch {
        // Service worker may be asleep, will load from storage
      }
    }
  };

  // End Session handler (completed or abandoned)
  const handleEndSession = async (
    sessionId: string,
    status: "completed" | "abandoned"
  ) => {
    await localRepository.endSession(sessionId, status);
    setActiveSession(null);
    const updatedHistory = await localRepository.getSessionHistory();
    setHistory(updatedHistory);

    // Notify background service worker to clear alarms and clear rules
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      try {
        await chrome.runtime.sendMessage({
          type: "END_SESSION",
          sessionId,
          status,
        });
      } catch {
        // Service worker will handle via storage/alarms
      }
    }
  };

  // Apps management handlers
  const handleToggleSite = async (siteId: string) => {
    const updated = sites.map((s) =>
      s.id === siteId ? { ...s, is_selected: !s.is_selected } : s
    );
    setSites(updated);
    await localRepository.setBlockedSites(updated);
  };

  const handleAddCustomSite = async (newSite: BlockedSite) => {
    const updated = [...sites, newSite];
    setSites(updated);
    await localRepository.setBlockedSites(updated);
  };

  const handleRemoveCustomSite = async (siteId: string) => {
    const updated = sites.filter((s) => s.id !== siteId);
    setSites(updated);
    await localRepository.setBlockedSites(updated);
  };

  const selectedSitesCount = sites.filter((s) => s.is_selected).length;

  if (loading) {
    return (
      <PopupLayout>
        <Header sessionActive={false} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-900 rounded-full animate-spin" />
        </main>
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      </PopupLayout>
    );
  }

  return (
    <PopupLayout>
      <Header sessionActive={!!activeSession} />

      <main className="flex-1 overflow-y-auto px-4 py-3">
        {activeTab === "focus" && (
          activeSession ? (
            <ActiveSessionView
              session={activeSession}
              onEndSession={handleEndSession}
            />
          ) : (
            <IdleSessionView
              selectedSitesCount={selectedSitesCount}
              onStartSession={handleStartSession}
              onNavigateToApps={() => setActiveTab("apps")}
            />
          )
        )}

        {activeTab === "apps" && (
          <AppsView
            sites={sites}
            onToggleSite={handleToggleSite}
            onAddCustomSite={handleAddCustomSite}
            onRemoveCustomSite={handleRemoveCustomSite}
            sessionActive={!!activeSession}
          />
        )}

        {activeTab === "stats" && (
          <StatsView history={history} sites={sites} />
        )}

        {activeTab === "schedule" && (
          <ScheduleView />
        )}
      </main>

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </PopupLayout>
  );
}
