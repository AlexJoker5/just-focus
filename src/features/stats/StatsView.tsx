import type { Session, BlockedSite } from "@/app/types/databaseTypes";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { formatDurationLabel } from "@/utils/time";
import { Clock, CheckCircle2, ShieldCheck, Flame } from "lucide-react";

interface StatsViewProps {
  history: Session[];
  sites: BlockedSite[];
}

export function StatsView({ history, sites }: StatsViewProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Sessions completed today
  const todayCompletedSessions = history.filter(
    (s) => s.status === "completed" && s.start_time.startsWith(todayStr)
  );

  const todayFocusMinutes = todayCompletedSessions.reduce(
    (acc, s) => acc + s.duration_minutes,
    0
  );

  const totalBlockedSitesCount = sites.filter((s) => s.is_selected).length;

  // Past 7 days calculation
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });

    const dayMinutes = history
      .filter((s) => s.status === "completed" && s.start_time.startsWith(dateStr))
      .reduce((acc, s) => acc + s.duration_minutes, 0);

    return {
      date: dateStr,
      label: dayLabel,
      minutes: dayMinutes,
    };
  });

  const maxMinutesInWeek = Math.max(60, ...past7Days.map((d) => d.minutes));

  return (
    <div className="flex flex-col gap-4 pb-2">
      {/* Header */}
      <div>
        <Heading level="h2" className="text-base font-bold text-brand-950">
          Focus Statistics
        </Heading>
        <Text size="xs" className="text-brand-500">
          Your deep work progress and session history.
        </Text>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2">
        {/* Metric 1: Focus Time Today */}
        <Card padding="sm" className="flex flex-col items-center text-center py-2.5">
          <Clock className="w-4 h-4 text-brand-600 mb-1" />
          <span className="text-base font-bold font-mono text-brand-950 leading-tight">
            {formatDurationLabel(todayFocusMinutes)}
          </span>
          <span className="text-[10px] text-brand-400 font-medium">Today</span>
        </Card>

        {/* Metric 2: Sessions Completed */}
        <Card padding="sm" className="flex flex-col items-center text-center py-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="text-base font-bold font-mono text-brand-950 leading-tight">
            {todayCompletedSessions.length}
          </span>
          <span className="text-[10px] text-brand-400 font-medium">Sessions</span>
        </Card>

        {/* Metric 3: Blocked Sites Active */}
        <Card padding="sm" className="flex flex-col items-center text-center py-2.5">
          <ShieldCheck className="w-4 h-4 text-brand-600 mb-1" />
          <span className="text-base font-bold font-mono text-brand-950 leading-tight">
            {totalBlockedSitesCount}
          </span>
          <span className="text-[10px] text-brand-400 font-medium">Blocked</span>
        </Card>
      </div>

      {/* 7-Day Activity Chart */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-900 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Last 7 Days
          </span>
          <span className="text-[10px] text-brand-400">Minutes focused</span>
        </div>

        {/* Bar chart */}
        <div className="flex items-end justify-between h-24 pt-4 px-1 gap-2">
          {past7Days.map((day) => {
            const heightPercent = Math.round((day.minutes / maxMinutesInWeek) * 100);
            const isToday = day.date === todayStr;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full rounded-t transition-all group relative flex items-end justify-center"
                  style={{ height: `${Math.max(6, heightPercent)}%` }}
                >
                  <div
                    className={`w-full h-full rounded-t ${
                      isToday
                        ? "bg-brand-900"
                        : day.minutes > 0
                        ? "bg-brand-300"
                        : "bg-brand-100"
                    }`}
                  />
                  {day.minutes > 0 && (
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-brand-900 text-white text-[9px] px-1 py-0.5 rounded shadow pointer-events-none transition-opacity font-mono">
                      {day.minutes}m
                    </div>
                  )}
                </div>
                <span className={`text-[10px] ${isToday ? "font-bold text-brand-950" : "text-brand-400"}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Sessions List */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider px-0.5">
          Recent Sessions
        </span>

        {history.length === 0 ? (
          <div className="text-center py-6 bg-brand-50/50 border border-dashed border-brand-200 rounded-xl">
            <Text size="xs" className="text-brand-400">
              No sessions completed yet. Start your first session!
            </Text>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
            {[...history]
              .reverse()
              .slice(0, 5)
              .map((s) => {
                const date = new Date(s.start_time).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const time = new Date(s.start_time).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 bg-white border border-brand-100 rounded-lg text-xs"
                  >
                    <div>
                      <p className="font-semibold text-brand-900">
                        {formatDurationLabel(s.duration_minutes)} Focus
                      </p>
                      <p className="text-[10px] text-brand-400">
                        {date} at {time}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {s.status === "completed" ? "Completed" : "Given Up"}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
